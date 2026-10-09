(function(root) {
"use strict";
// Sources:
// Vetus Calculator Book 12-10-2018.xls, sheet "Flow Back": 25% water in downstream hose;
// capacity at least 2 x flow-back volume (= no more than 50% full).
// VETUS 2026-2027 catalogue pp 115-119: formula, capacity data, diameter/power guide.
// Volumes are nominal published waterlock volumes, not usable water volume.
const URLS={
 standard:"https://webshop.vetus.com/en/products/exhaust-systems/waterlocks-standard-installations",
 dual:"https://webshop.vetus.com/en/products/exhaust-systems/waterlocks-dual-stage",
 quiet:"https://webshop.vetus.com/en/products/exhaust-systems/waterlocks-mufflers",
 large:"https://webshop.vetus.com/en/products/exhaust-systems/waterlocks-for-larger-boats"
};
const products=[];
function add(family,skus,diameters,capacity,details={},url=null){
 skus.forEach((sku,i)=>products.push({sku,family,diameter:diameters[i],outlet:details.outlet?.[i]||diameters[i],
  capacity,style:details.style||"Standard",quiet:!!details.quiet,long:!!details.long,low:!!details.low,commercial:!!details.commercial,
  rotatable:!!details.rotatable,backflowValve:!!details.backflowValve,
  url:url||URLS[family==="MG"?"large":family==="NLP"?"dual":family==="NLPH"||family==="NLP3"?"quiet":"standard"]}))
}
add("LP",["WLOCKLP30"],[30],2.3,{style:"Basic compact"});
add("LP",["WLOCKL40R","WLOCKL45R","WLOCKL50R"],[40,45,50],4.3,{style:"Compact rotating",rotatable:true});
add("LP",["WLOCKL50S","WLOCKLP60","WLOCKLP75","WLOCKLP90"],[50,60,75,90],10.5,{style:"Long-run standard",long:true});
add("LSS",["LSS40A","LSS45A","LSS50A"],[40,45,50],5.7,{style:"Long-run, lower profile",long:true,low:true,rotatable:true});
add("LSL",["LSL60","LSL75","LSL90"],[60,75,90],16,{style:"Long, straight run",long:true});
add("LSG",["LSG60","LSG75","LSG90"],[60,75,90],17,{style:"Long-run rotating",long:true,rotatable:true});
add("NLP",["NLP40","NLP45","NLP50"],[40,45,50],4.5,{style:"Dual chamber",quiet:true,rotatable:true});
add("NLP",["NLP50S","NLP60","NLP65","NLP75","NLP90"],[50,60,65,75,90],10,{style:"Dual chamber",quiet:true,rotatable:true});
add("NLPH",["NLPH40","NLPH45","NLPH50"],[40,45,50],3,{style:"Horizontal twin chamber",quiet:true,low:true,rotatable:true});
add("NLPH",["NLPH60","NLPH75","NLPH90"],[60,75,90],10,{style:"Horizontal twin chamber",quiet:true,low:true,rotatable:true});
add("NLP3",["NLP340","NLP345","NLP350"],[40,45,50],5,{style:"Three chamber, high attenuation",quiet:true,rotatable:true});
add("NLP3",["NLP360","NLP375","NLP390"],[60,75,90],10,{style:"Three chamber, high attenuation",quiet:true,rotatable:true});
add("NLP3",["NLP36015L","NLP37515L","NLP39015L"],[60,75,90],15,{style:"Three chamber, 15 L",quiet:true,rotatable:true,long:true});
add("MG",["MGP9090","MGP102102","MGP102127","MGP5455"],[90,102,102,127],23,{style:"Large-engine compact MG",commercial:true,rotatable:true,outlet:[90,102,127,127]});
add("MG",["MGS5455A","MGS5456A","MGS6456A"],[127,127,152],75,{style:"Large-engine MG",commercial:true,rotatable:true,outlet:[127,152,152]});
add("MG",["MGL6458A","MGL8458A","MGL84510A"],[152,203,203],130,{style:"Large-engine MG",commercial:true,rotatable:true,outlet:[203,203,250]});
// General VETUS catalogue sizing table, 2026-27 p. 115. kW outputs indexed by
// maximum manufacturer-permitted exhaust backpressure 0.1 / 0.2 / 0.3 bar.
// This is a broad diameter-power GUIDE, not a calculation of actual system loss.
const kwPowerGuide={
 "30/30":[9,18,27],"40/40":[16,32,48],"45/45":[21,42,63],"50/50":[25,50,75],
 "60/60":[36,72,108],"65/65":[42,84,126],"75/75":[56,112,168],"90/90":[81,162,243],
 "102/102":[104,208,312],"102/127":[131,262,393],"127/127":[161,322,483],
 "127/152":[194,388,582],"152/152":[230,460,690],"152/203":[313,626,939],
 "203/203":[409,818,1227],"203/250":[519,1038,1557]
};
function n(v,d=0){return v===undefined||v===null||String(v).trim()===""?d:Number(v)}
function finite(v){return Number.isFinite(v)}
function calc(form){
 const f=form||{};const diameter=n(f.diameter,50),length=n(f.length,5),waterFraction=n(f.waterPct,25)/100,
  maxFill=n(f.maxFillPct,50)/100,extra=n(f.extraBackflow,0),
  hasInjection=f.injectionHeight!==undefined&&f.injectionHeight!==null&&String(f.injectionHeight).trim()!=="",
  hasTransom=f.transomHeight!==undefined&&f.transomHeight!==null&&String(f.transomHeight).trim()!=="",
  injectedHeight=hasInjection?n(f.injectionHeight,NaN):null,transomHeight=hasTransom?n(f.transomHeight,NaN):null,
  engineKW=(f.powerUnit==="hp"?n(f.enginePower,0)*0.745699872:n(f.enginePower,0)),
  backPressure=Number(f.backPressure||.1),layout=f.layout||"any";
 const faults=[];
 if(!(diameter>0&&diameter<=350))faults.push("Select a realistic positive exhaust hose internal diameter.");
 if(!(length>0&&length<=150))faults.push("Enter the length in metres from the waterlock to the gooseneck/high point.");
 if(!(waterFraction>0&&waterFraction<=1))faults.push("Water-in-hose percentage must be between 1 and 100.");
 if(!(maxFill>0&&maxFill<=1))faults.push("Allowed fill must be between 1 and 100%.");
 if(!(extra>=0&&extra<=1000))faults.push("Additional backflow water must be non-negative.");
 if(!(engineKW>=0&&engineKW<=50000))faults.push("Engine power must be positive or blank.");
 if(![.1,.2,.3].includes(backPressure))faults.push("Choose 0.1, 0.2 or 0.3 bar.");
 if((hasInjection&&!finite(injectedHeight))||(hasTransom&&!finite(transomHeight)))faults.push("Enter a valid installation height or leave it blank.");
 const pipeLitres=Math.PI*Math.pow(diameter/1000,2)/4*length*1000;
 const returnLitres=pipeLitres*waterFraction;
 const totalBackflow=returnLitres+extra;
 const minimumCapacity=totalBackflow/maxFill;
 const compat=products.filter(p=>p.diameter===diameter).map(p=>{
  const g=kwPowerGuide[p.diameter+"/"+p.outlet];
  const powerLimitKW=g?.[[.1,.2,.3].indexOf(backPressure)]??null;
  const powerPass=!(engineKW>0&&powerLimitKW!==null&&engineKW>powerLimitKW);
  const meetsCapacity=p.capacity+1e-8>=minimumCapacity;
  const excess=p.capacity-minimumCapacity;
  let preference=0;
  if(layout==="quiet")preference=p.family==="NLP3"?-60:p.quiet?-35:15;
  else if(layout==="long")preference=p.long?-50:p.family==="MG"?-10:20;
  else if(layout==="low")preference=p.low?-50:p.family==="MG"?25:10;
  else if(layout==="heavy")preference=p.commercial?-50:20;
  else if(layout==="compact")preference=["LP","LSS"].includes(p.family)?-30:p.low?-20:15;
  const score=(powerPass?0:100000)+(meetsCapacity?0:30000)+preference+
   Math.max(0,excess)*3+(p.family==="NLP3"?3:0);
  return {...p,meetsCapacity,powerLimitKW,powerPass,excess,score,
    workingFillPct:totalBackflow/p.capacity*100};
 }).sort((a,b)=>a.score-b.score||a.capacity-b.capacity);
 const passing=compat.filter(p=>p.meetsCapacity&&p.powerPass);
 const selected=passing[0]||null;
 const notes=[];
 if(injectedHeight===null)notes.push("Water-injection height was not entered. Anti-siphon risk cannot be assessed; measure the injection point relative to the loaded waterline before final specification.");
 if(injectedHeight!==null&&injectedHeight<150)notes.push("CRITICAL: Cooling-water injection is less than 150 mm above the waterline or below it. VETUS warns of seawater siphoning; an appropriate air vent/anti-siphon arrangement must be assessed. A larger waterlock cannot prevent continuous siphoning.");
 if(transomHeight===null)notes.push("Exhaust outlet height was not entered. Confirm the transom discharge is above the waterline before final selection.");
 if(transomHeight!==null&&transomHeight<50)notes.push("VETUS advises the exhaust transom outlet should be at least 50 mm above the waterline. Confirm the arrangement with the current installation manual.");
 if(!selected&&compat.some(x=>x.meetsCapacity))notes.push("Volume is sufficient on some models, but the general engine-power/diameter guide is exceeded. Check actual exhaust backpressure, permitted engine limit and hose sizing.");
 if(!compat.some(x=>x.meetsCapacity))notes.push("No catalogued unit matching this inlet diameter meets the capacity criterion. Reconsider the exhaust configuration or request a manufacturer-designed solution. Do not select an undersized waterlock.");
 if(length>=4)notes.push("Long exhaust run: examine LSS/LSL/LSG, larger NLP3 or MG where suitable.");
 notes.push("Calculate the downstream exhaust volume from the waterlock outlet to the gooseneck/high point. Hose runs upstream of the waterlock should not be added to that volume.");
 notes.push("This calculation assumes 25% of the hose is water, and a waterlock no more than 50% full, as in the VETUS 2018 spreadsheet and 2026-27 catalogue. Unexpected water from repeated cranking, heel, waves or siphoning is outside that estimate.");
 notes.push("Waterlock must be fitted below the engine exhaust mixing point. Check gooseneck elevation, anti-siphon protection, maximum cranking water accumulation, and installation clearance.");
 notes.push("Power figures are VETUS general exhaust diameter guidance at the declared maximum backpressure, not measured or computed system pressure loss. Engine manufacturer's permitted backpressure and all losses require separate verification.");
 return{valid:faults.length===0,errors:faults,diameter,length,waterPct:waterFraction*100,maxFillPct:maxFill*100,
  hoseVolume:pipeLitres,backflow:returnLitres,extra,totalBackflow,requiredCapacity:minimumCapacity,
  candidates:compat,qualified:passing,best:selected,engineKW,powerLimitKW:selected?.powerLimitKW??null,backPressure,
  injectedHeight,transomHeight,layout,notes};
}
root.ExhaustCalc={calc,products,kwPowerGuide,sourceUrls:{
  catalogue:"https://online.flippingbook.com/view/631212278/115/",
  models:"https://online.flippingbook.com/view/631212278/116/",
  long:"https://online.flippingbook.com/view/631212278/117/",
  dual:"https://online.flippingbook.com/view/631212278/118/",
  quiet:"https://online.flippingbook.com/view/631212278/119/"
}};
})(globalThis);