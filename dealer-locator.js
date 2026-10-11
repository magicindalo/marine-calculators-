(function(){
"use strict";
const OFFICIAL="https://vetus.com/dealer-locator/";
const lookup="https://api.postcodes.io/postcodes";
const $=id=>document.getElementById(id);
const form=$("locationForm"),input=$("locationInput"),status=$("status"),copyBtn=$("copyLocation"),gpsBtn=$("useLocation");
function cleanLocation(v){return String(v||"").trim().replace(/\s+/g," ").slice(0,90);}
function ukPostcode(v){return /^(GIR\s?0AA|(?:[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}))$/i.test(cleanLocation(v));}
function display(value){status.textContent=value;status.hidden=false;}
function setBusy(working){gpsBtn.disabled=working;gpsBtn.textContent=working?"Finding nearby UK postcode…":"Use My Location";}
async function clipboardCopy(s){
 if(!s)return false;
 if(!navigator.clipboard?.writeText)return false;
 try{await navigator.clipboard.writeText(s);return true;}catch(_){return false;}
}
function openOfficial(){
 const opened=window.open(OFFICIAL,"_blank");
 if(opened){try{opened.opener=null;}catch(_){}}
 else window.location.href=OFFICIAL;
}
function search(){
 const place=cleanLocation(input.value);
 if(!place){display("Enter a UK postcode or a town/city, or choose Use My Location.");input.focus();return;}
 if(!/^[a-z0-9 \-',.]+$/i.test(place)){display("Please enter a postcode or place name using letters and numbers.");input.focus();return;}
 // Clipboard operations and window.open start from this user gesture.
 // Browser privacy settings may prevent copying, so the original text stays visible.
 const copied=clipboardCopy(place);
 display("Opening VETUS's official dealer locator. Search for "+place+" in its “Postal code or city” field. You can paste or type it there.");
 openOfficial();
 copied.then(ok=>{if(ok)display("Copied “"+place+"” to clipboard. Paste it into VETUS's “Postal code or city” field to see nearby authorised dealers.");}).catch(()=>{});
}
function geoError(error){
 const message=error?.code===1?"Location permission was declined. Enter a postcode or city instead.":
 error?.code===2?"Your iPhone could not determine its location. Check Location Services or enter a postcode.":
 error?.code===3?"Location request timed out. Try again or enter a postcode.":
 "Location could not be obtained. Enter a postcode or city instead.";
 display(message);setBusy(false);
}
function useLocation(){
 if(!navigator.geolocation){display("This browser does not support location access. Enter a postcode or town instead.");return;}
 if(navigator.onLine===false){display("An internet connection is needed to convert your location to a UK postcode and check current VETUS dealers.");return;}
 setBusy(true);display("Asking your phone for permission to use its current location…");
 navigator.geolocation.getCurrentPosition(async position=>{
  const lat=position.coords.latitude,lon=position.coords.longitude;
  if(!Number.isFinite(lat)||!Number.isFinite(lon)){display("No valid coordinates were provided. Enter your location manually.");setBusy(false);return;}
  // VETUS's official search is the final authoritative lookup. UK postcode
  // resolution only identifies the search location, never a dealer.
  try{
   display("Location received. Finding the nearest UK postcode…");
   const url=lookup+"?lat="+encodeURIComponent(lat.toFixed(5))+"&lon="+encodeURIComponent(lon.toFixed(5))+"&limit=1";
   const response=await fetch(url,{headers:{Accept:"application/json"},cache:"no-store",signal:typeof AbortSignal!=="undefined"&&typeof AbortSignal.timeout==="function"?AbortSignal.timeout(12000):undefined});
   if(!response.ok)throw new Error("Postcode lookup unavailable");
   const data=await response.json();
   const nearest=data?.result?.[0]?.postcode;
   if(nearest&&ukPostcode(nearest)){
    input.value=cleanLocation(nearest).toUpperCase();
    display("Nearby UK postcode: "+input.value+". Now tap Find VETUS suppliers to open the official dealer search.");
   }else display("No nearby UK postcode was found. Enter a town/city manually and use VETUS's worldwide dealer search.");
  }catch(_){
   display("Your position was obtained, but the UK postcode service could not be reached. Enter a postcode or town/city manually.");
  }finally{setBusy(false);}
 },geoError,{enableHighAccuracy:false,timeout:15000,maximumAge:300000});
}
form.addEventListener("submit",e=>{e.preventDefault();search();});
gpsBtn.addEventListener("click",useLocation);
copyBtn.addEventListener("click",async()=>{
 const place=cleanLocation(input.value);
 if(!place){display("Enter a postcode or town/city first.");return;}
 const success=await clipboardCopy(place);
 display(success?"Copied “"+place+"”. Paste it into the VETUS search field.":"Clipboard access isn't available. Select and copy the location from the field instead.");
});
$("clearLocation").addEventListener("click",()=>{input.value="";status.textContent="";status.hidden=true;input.focus();});
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();