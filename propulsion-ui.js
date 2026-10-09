(function(){
"use strict";
const mode=document.body.dataset.mode;
if(!["diesel","eline"].includes(mode))return;
const $=id=>document.getElementById(id);
const fields=[...document.querySelectorAll("[data-field]")];
const STORAGE="indalo-"+mode+"-working-v1";
const fmt=(x,d=1)=>Number.isFinite(x)?Number(x).toLocaleString("en-GB",{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
const text=(id,t)=>{const e=$(id);if(e)e.textContent=t;};
const setHidden=(id,b)=>{const e=$(id);if(e)e.classList.toggle("hide",b)};
const form=()=>Object.fromEntries(fields.map(f=>[f.id,f.value]));
const fieldCount=fields.length;
let last=null;
function calculate(){return mode==="diesel"?globalThis.PropulsionSplit.diesel(form()):globalThis.PropulsionSplit.electric(form());}
function addDiv(parent,txt,css){const e=document.createElement("div");e.className=css;e.textContent=txt;parent.append(e);return e;}
function labelRow(parent,label,value){
 const el=document.createElement("div");el.className="stat";
 const a=document.createElement("span");a.textContent=label;
 const b=document.createElement("strong");b.textContent=value;
 el.append(a,b);parent.append(el);
}
function showReference(g){
 const where=$("referenceResults");if(!where)return;where.replaceChildren();
 if(!g?.name){addDiv(where,"Optional: choose an existing VETUS engine above to see the independent shaft/gearbox reference.","empty");return;}
 const rate=g.ratedShaftRPM===null?"Enter actual gearbox ratio":fmt(g.ratedShaftRPM,0)+" rpm";
 const vals=[
  ["Installed reference",g.name],
  ["Published engine rating",g.engineRatedKW===null?"—":fmt(g.engineRatedKW,0)+" kW / "+g.engineRatedHP+" hp"],
  ["Shaft speed at rated engine RPM",rate],
  ["Power at rated shaft speed",g.ratedShaftKW===null?"—":fmt(g.ratedShaftKW,1)+" kW"],
  ["Torque at rated power",g.ratedShaftNm===null?"—":fmt(g.ratedShaftNm,0)+" Nm"],
  ["Peak shaft torque (different RPM)",g.peakShaftNm===null?"—":fmt(g.peakShaftNm,0)+" Nm"],
  ["Peak torque shaft speed",g.peakShaftRPM===null?"—":fmt(g.peakShaftRPM,0)+" rpm"],
  ["Observed shaft speed",g.observedShaftRPM===null?"Not measured":fmt(g.observedShaftRPM,0)+" rpm"]
 ];
 vals.forEach(x=>labelRow(where,...x));
}
function showModels(list,kind,result){
 const host=$("candidates");host.replaceChildren();
 if(!result.valid){addDiv(host,"Correct the marked inputs to see suitable models.","empty");return}
 if(kind==="diesel"&&!result.hullEstimationAllowed){
  addDiv(host,"No engine model can be recommended from the current hull-speed power estimate. For a heavy, canal or uncalibrated vessel, use measured speed AND delivered shaft power, or a more detailed powering study. You can still view the existing-engine gearbox reference below.","empty");
  return;
 }
 if(kind==="eline"&&!result.reliable){
  addDiv(host,"Reliable E-Line selection and battery runtime are unavailable with the current vessel/powering inputs. Confirm target speed, vessel data and (for a heavy vessel) measured delivered shaft power.","empty");
  return;
 }
 if(!list?.length){addDiv(host,"No VETUS model passes the present power/duty/supply settings. Review the required thrust/power with VETUS engineering; do not select an undersized system.","empty");return;}
 list.slice(0,6).forEach((m,i)=>{
  const card=document.createElement("div");card.className="model";
  const head=document.createElement("div");head.className="modelTop";
  const h=document.createElement("strong");h.textContent=m.name;
  const tag=document.createElement("span");tag.className="tag";tag.textContent=i===0?"Smallest power-screened":"Alternative";
  head.append(h,tag);card.append(head);
  const meta=document.createElement("div");meta.className="chips";
  const desc=[
   (m.sku||"VETUS")+" • "+m.family,
   fmt(m.kw,1)+" kW "+(kind==="eline"&&(m.sku==="ELINE220S")?"max":"rated"),
   ...(kind==="diesel"?[fmt(m.hp,0)+" hp",m.rpm?m.rpm+" engine rpm":"Engine rpm: verify"]:[m.voltage+" V class",m.cooling+" cooling"]),
   result.atHull?.boats===2||result.model?.boats===2?"2 propulsion units":"1 propulsion unit",
   "Expected cruise load "+fmt(m.cruiseLoad,0)+"%"
  ];
  if(kind==="eline"&&m.sku==="ELINE220S")desc.push("20 kW normal-mode reference");
  desc.forEach(x=>{const chip=document.createElement("span");chip.textContent=x;meta.append(chip)});card.append(meta);
  if(m.lowLoad)addDiv(card,"Diesel may run below 35% of rated power at target speed. Compare manufacturer's load spectrum.","warning");
  if(m.installationGuideExceeded)addDiv(card,"Beyond the E-Line 22 indicative size guidance. Seek VETUS engineering approval.","warning");
  const a=document.createElement("a");a.href=m.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent="VETUS model family / technical data ↗";card.append(a);
  host.append(card);
 });
 if(list.length>6)addDiv(host,"More compatible models are available. Verify each rated power, duty and propeller match with manufacturer data.","note");
}
function render(){
 let r;
 try{r=calculate()}catch(e){$("error").textContent="Calculation error: "+e.message;setHidden("error",false);return}
 last=r;
 text("hullSpeed",fmt(r.theoreticalSpeed,2)+" kn");
 $("error").textContent=(r.errors||[]).join(" ");
 setHidden("error",r.valid);
 if(mode==="diesel"){
  const raw=r.atHull?.shaftCruiseKW,target=r.atTarget?.shaftCruiseKW;
  text("cruisePower",r.valid&&Number.isFinite(target)?fmt(target,2)+" kW":"—");
  text("hullPower",r.valid&&r.atHull?.canMatch&&Number.isFinite(raw)?fmt(raw,2)+" kW":"Not established");
  text("installedPower",r.valid&&r.atHull?.canMatch&&Number.isFinite(r.atHull.ratedRequiredKW)?fmt(r.atHull.ratedRequiredKW,2)+" kW":"—");
  text("speedRatio",Number.isFinite(r.targetSpeed/r.theoreticalSpeed)?fmt(r.targetSpeed/r.theoreticalSpeed*100,0)+"%":"—");
  text("cruiseQual",r.atTarget?.canMatch?"Preliminary shaft-power estimate":"Unverified. Not a design power rating.");
  text("hullQual",r.hullEstimationAllowed?"Calm-water model; verify against trials":"Insufficient evidence for reliable engine selection.");
  text("dieselStatus",r.hullEstimationAllowed?"A preliminary diesel shortlist is shown below. This is NOT a certified maximum required horsepower or propeller match.":"Automatic diesel recommendations are withheld. Hull speed is a geometric threshold; a trustworthy engine size requires sea-trial shaft power or specialist hull resistance data.");
  $("dieselStatus").className=r.hullEstimationAllowed?"warning success":"warning";
  showModels(r.engineCandidates,"diesel",r);
  showReference(r.installed);
 }else{
  const x=r.model;
  text("cruisePower",r.valid&&r.reliable?fmt(x.shaftCruiseKW,2)+" kW":"Not verified");
  text("motorPower",r.valid&&r.reliable?fmt(x.ratedRequiredKW,2)+" kW":"—");
  text("motorCount",r.motorList?.length&&r.reliable?String(r.motorList.length):"0");
  text("runtime",r.runtime===null?"Not verified":fmt(r.runtime,2)+" hours");
  text("neededKWh",r.requiredKWh===null?"Not verified":fmt(r.requiredKWh,1)+" kWh");
  text("inputKw",r.runtime===null?"Not verified":fmt(r.totalKW,2)+" kW");
  text("currentA",r.dcCurrent===null?"Not verified":fmt(r.dcCurrent,0)+" A");
  showModels(r.motorList,"eline",r);
 }
 const host=$("notices");host.replaceChildren();
 const notes=[...new Set(r.warnings||[])];
 notes.forEach(t=>addDiv(host,t,"warning"));
 try{localStorage.setItem(STORAGE,JSON.stringify({fields:form()}))}catch(e){}
}
function setState(payload){
 if(!payload||!payload.fields)throw Error("Invalid saved "+mode+" project");
 for(const f of fields)if(payload.fields[f.id]!==undefined)f.value=String(payload.fields[f.id]);
 render();
}
function report(){
 const r=calculate();if(!r.valid)throw Error(r.errors.join("; "));
 const vals=form(),d=mode==="diesel",f=(n,u="",dec=1)=>Number.isFinite(n)?fmt(n,dec)+u:"Not verified";
 const boatRows=[
  ["Vessel",vals.project||"Unnamed"],["Hull type",vals.hull],["LWL",vals.lwl+" m"],
  ["Loaded beam",vals.beam+" m"],["Loaded draft",vals.draft+" m"],["Displacement",vals.displacement+" t"],
  ["Target speed",vals.cruise+" kn"],["Traditional hull-speed threshold",f(r.theoreticalSpeed," kn",2)],
  ["Shaft-power trial",vals.trialPower&&vals.trialSpeed?vals.trialPower+" kW @ "+vals.trialSpeed+" kn":"Not supplied"],
  ["Number of propulsion lines",vals.engines||"1"]];
 const metrics=d?
  [["Hull speed",f(r.theoreticalSpeed," kn",1)],["Hull-speed power",r.atHull?.canMatch?f(r.atHull.shaftCruiseKW," kW",1):"Not verified"],["Candidate diesel",r.engineCandidates?.[0]?.name||"Not approved"],["Gearbox",r.installed?.ratio?r.installed.ratio+":1":"Unknown"]]:
  [["Hull speed",f(r.theoreticalSpeed," kn",1)],["E-Line model",r.motorList?.[0]?.name||"Not approved"],["Battery runtime",r.runtime===null?"Not verified":f(r.runtime," h",1)],["Nominal bank required",r.requiredKWh===null?"Not verified":f(r.requiredKWh," kWh",1)]];
 const modelRows=(d?r.engineCandidates:r.motorList||[]).slice(0,8).map((m,i)=>[i===0?"First screen":"Alternative",m.name,m.sku,f(m.kw," kW",1),d?f(m.hp," hp",0):m.voltage+" V"]);
 const sections=[
  {title:"Vessel input and target",rows:boatRows},
  {title:d?"Displacement powering assessment":"Electric propulsion assessment",rows:d?[
   ["Power at selected speed",r.atTarget?.canMatch?f(r.atTarget.shaftCruiseKW," kW",2):"Unverified"],
   ["Power at theoretical hull speed",r.atHull?.canMatch?f(r.atHull.shaftCruiseKW," kW",2):"Not established"],
   ["With rated shaft-power margin",r.atHull?.canMatch?f(r.atHull.ratedRequiredKW," kW",2):"Not established"],
   ["Diesel duty fraction",vals.dieselDuty+"%"],["Gearbox efficiency assumption",vals.gearEfficiency+"%"],
   ["Recommendation status",r.hullEstimationAllowed?"Preliminary power screen":"WITHHELD — hull powering not verified"]
  ]:[
   ["Target shaft demand",r.reliable?f(r.model.shaftCruiseKW," kW",2):"Not verified"],
   ["Allowable normal E-Line capacity",r.reliable?f(r.model.ratedRequiredKW," kW",2):"Not verified"],
   ["DC input power including hotel load",r.reliable?f(r.totalKW," kW",2):"Not verified"],
   ["Nominal propulsion bank",vals.batteryKWh+" kWh at "+vals.eVoltage+" V class"],
   ["Usable capacity",vals.usablePercent+"%"],["Retained reserve",vals.energyReservePercent+"%"],
   ["Concurrent domestic load",vals.hotelWatts+" W"],
   ["Available battery energy",r.reliable?f(r.availableKWh," kWh",2):"Not verified"],
   ["Runtime at entered speed",r.runtime===null?"Not verified":f(r.runtime," hours",2)],
   ["Nominal energy required",r.requiredKWh===null?"Not verified":f(r.requiredKWh," kWh",2)],
   ["Nominal DC current",r.dcCurrent===null?"Not verified":f(r.dcCurrent," A",0)]
  ]},
  {title:d?"VETUS diesel candidates":"VETUS E-Line candidates",
   table:{columns:[["Order",70],["Product",133],["Order code",135],["Output",76],["HP / DC",86]],
    rows:modelRows.length?modelRows:[["None","No approved shortlist","—","—","—"]]}},
 ];
 if(d)sections.push({title:"Existing diesel reference gearbox",rows:[
  ["Installed engine reference",r.installed?.name||"Unknown"],
  ["Ahead reduction ratio",r.installed?.ratio?r.installed.ratio+":1":"Not given"],
  ["Reference shaft kW",f(r.installed?.ratedShaftKW," kW",1)],
  ["Reference shaft rpm at rated engine speed",f(r.installed?.ratedShaftRPM," rpm",0)],
  ["Shaft torque at rated power",f(r.installed?.ratedShaftNm," Nm",0)],
  ["Peak torque (different RPM)",f(r.installed?.peakShaftNm," Nm",0)],
  ["Propeller size","Not assumed or verified"]
 ]});
 sections.push({title:"Assumptions / manufacturer verification",paragraphs:r.warnings.slice(0,24)});
 return {title:d?"Diesel Engine & Hull-Speed Assessment":"VETUS E-Line Electric & Battery Endurance",
  subtitle:(vals.project||"Vessel")+(d?" / displacement hull and installed diesel":" / electric propulsion and cruising life"),
  filename:(vals.project||"Indalo")+"-"+mode+"-selection",
  metrics,sections};
}
fields.forEach(f=>{f.addEventListener("input",render);f.addEventListener("change",render)});
try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(saved?.fields)for(const f of fields)if(saved.fields[f.id]!==undefined)f.value=String(saved.fields[f.id])}catch(e){}
render();
if(globalThis.MarineReports?.init)globalThis.MarineReports.init({
 kind:mode,suggestName:()=>($("project")?.value.trim()||"Indalo "+(mode==="diesel"?"Diesel Engine":"E-Line Electric")+" Selection"),
 getState:()=>({fields:form()}),setState,report
});
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();