(function(root){
"use strict";
/* Indalo Marine Engine & E-LINE screening model — 2026-10.
 * Product names / advertised ratings from VETUS official webshop:
 * M-Line 12-52 hp, H-Line 65 / 80 hp, D-Line 122-210 hp,
 * E-AIR 5/7 kW, E-LINE 6/8/11/22 kW.
 * Resistance uses shared MarineResistance (ITTC friction + nonstandard residual);
 * Crouch separate empirical screen for planing only.
 * This is NOT a manufacturer power curve, a certified propulsion design,
 * or a claim that two engines of equal rated power will behave alike.
 */
const LINKS={
  m:"https://webshop.vetus.com/en/products/engines/m-line-engines/",
  h:"https://webshop.vetus.com/en/products/engines/h-line-engines",
  d:"https://webshop.vetus.com/en/products/engines/d-line-engines",
  e:"https://webshop.vetus.com/en/products/electric-propulsion/e-line-engines"
};
const diesel=[
 ["M2.13","M213A---A",12,"M-Line",3000],
 ["M2.18","M218A---A",16,"M-Line",3600],
 ["M3.29","M329A---A",27,"M-Line",3600],
 ["M4.35","M435A---A",33,"M-Line",3000],
 ["M4.45","M445A---A",42,"M-Line",3000],
 ["M4.56","M456A---A",52,"M-Line",3000],
 ["VH4.65","VH465---A",65,"H-Line",3000],
 ["VH4.80","VH480---A",80,"H-Line",4000],
 ["VD4.120","VD4120---A",122,"D-Line",null],
 ["VD4.140","VD4140---A",140,"D-Line",null],
 ["VD6.170","VD6170---A",170,"D-Line",null],
 ["VD6.210","VD6210---A",210,"D-Line",null]
].map(([name,sku,hp,family,rpm])=>({name,sku,hp,kw:hp*.745699872,family,rpm,fuel:"diesel",url:LINKS[family[0].toLowerCase()],notes:family==="D-Line"?"Common rail; verify load spectrum and gearbox":"Verify propulsion duty rating and gearbox"}));
const electric=[
 ["E-AIR 5 kW (24V)","EAIR05024",5,24,"air"],
 ["E-AIR 5 kW","EAIR050",5,48,"air"],
 ["E-LINE 6 kW","ELINE060",6,48,"liquid"],
 ["E-AIR 7 kW","EAIR070",7,48,"air"],
 ["E-LINE 8 kW","ELINE080",8,48,"liquid"],
 ["E-LINE 11 kW","ELINE110",11,48,"liquid"],
 ["E-LINE 22 kW","ELINE220S",22,48,"liquid"]
].map(([name,sku,kw,voltage,cooling])=>({name,sku,kw,hp:kw/.745699872,voltage,cooling,family:"E-Line",fuel:"electric",url:LINKS.e,notes:"Rated output used only for preliminary capacity matching; verify torque curve, continuous duty and motor cooling"}));
const KNOT=0.514444, G=9.80665;
function n(v,d=0){const z=typeof v==="string"?v.trim():v;return z===null||z===undefined||z===""?d:Number(z)}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function evaluate(input){
 const f=input||{},errors=[],warnings=[];
 const lwl=n(f.lwl,18),beam=n(f.beam,3.3),draft=n(f.draft,.8),displacement=n(f.displacement,16);
 const cruise=n(f.cruise,5),hull=f.hull||"displacement",boats=n(f.engines,1),water=f.water||"fresh";
 const reserve=n(f.reservePct,25),shaftEff=n(f.propulsiveEfficiency,55)/100;
 const dieselDuty=n(f.dieselDuty,80)/100,electricDuty=n(f.electricDuty,85)/100;
 const transEff=n(f.gearEfficiency,96)/100,electricEff=n(f.electricEfficiency,88)/100;
 const trialSpeed=n(f.trialSpeed,0),trialPower=n(f.trialPower,0);
 const batteryKWh=n(f.batteryKWh,20),usablePct=n(f.usablePercent,80)/100;
 const hours=n(f.hours,4),eVoltage=n(f.eVoltage,48),crouch=n(f.crouch,150);
 const fuel=f.fuel||"both",drive=f.drive||"shaft";
 const rho=water==="sea"?1025:1000;
 const CB=displacement/rho*1000/(lwl*beam*draft);
 if(!(lwl>=3&&lwl<=80))errors.push("Waterline length must be between 3 and 80 metres.");
 if(!(beam>=.8&&beam<=16))errors.push("Beam must be between 0.8 and 16 metres.");
 if(!(draft>=.1&&draft<=7))errors.push("Loaded draft must be between 0.1 and 7 metres.");
 if(!(displacement>=.3&&displacement<=1500))errors.push("Loaded displacement must be 0.3 to 1,500 tonnes.");
 if(!(cruise>0&&cruise<=60))errors.push("Choose a realistic target speed in knots.");
 if(!(CB>0&&CB<1.0))errors.push("Displacement and hull dimensions imply an invalid block coefficient (Cb); review tonnes and loaded draft.");
 if(!["displacement","canal","sail","semi","planing"].includes(hull))errors.push("Select a supported hull category.");
 if(![1,2].includes(boats))errors.push("Select one or two independent propulsion lines.");
 if(![24,48].includes(eVoltage))errors.push("E-Line battery voltage must be 24 or 48 V class.");
 if(!["both","diesel","electric"].includes(fuel))errors.push("Choose diesel, electric or both.");
 if(!(reserve>=0&&reserve<=100))errors.push("Reserve must be between 0 and 100%.");
 if(!(shaftEff>=.25&&shaftEff<=.85))errors.push("Propulsive efficiency must be between 25 and 85%.");
 if(!(dieselDuty>=.5&&dieselDuty<=1&&electricDuty>=.5&&electricDuty<=1))errors.push("Duty fractions must be between 50 and 100%.");
 if(!(transEff>.7&&transEff<=1&&electricEff>=.6&&electricEff<=1))errors.push("Check gearbox and electric-system efficiencies.");
 if((trialSpeed>0)!==(trialPower>0))errors.push("Enter both measured trial speed and delivered shaft power, or leave both blank.");
 if((trialSpeed||trialPower)&&!(trialSpeed>0&&trialSpeed<=40&&trialPower>0&&trialPower<=2000))errors.push("Check sea-trial speed and measured TOTAL shaft power.");
 if(!(hours>.25&&hours<=72&&batteryKWh>0&&batteryKWh<=2000&&usablePct>.05&&usablePct<=1))errors.push("Check electric boating hours, bank capacity and usable battery percentage.");
 if(hull==="planing"&&!(crouch>=90&&crouch<=260))errors.push("Planing hull Crouch constant should be 90–260, ideally measured from trials.");
 const v=cruise*KNOT;
 const Fn=v/Math.sqrt(G*lwl);
 const hullSpeed=1.34*Math.sqrt(lwl*3.280839895);
 const densityClass=hull==="planing"?"planing":"displacement";
 let model="resistance-screening",canMatch=true,resistanceN=null,effPowerKW=null;
 let powerKW=null,factor=1,trialSource="uncalibrated",modelMetrics=null;
 const planing=hull==="planing";
 if(planing){
   model="Crouch empirical planing";
   const pounds=displacement*2204.62262185;
   const totalShaftHP=pounds*Math.pow(cruise/crouch,2);
   powerKW=totalShaftHP*.745699872;
   effPowerKW=null;
   if(cruise/hullSpeed<1.8){warnings.push("Crouch's method is a planing-hull approximation; the target is in a transition/low-speed regime. No trustworthy model recommendation is issued.");canMatch=false}
   if(cruise/hullSpeed<2.3)warnings.push("Target speed may be too low for sustained planing. Crouch estimates are uncertain near the hump.");
   if(trialSpeed>0){
     const trialHP=trialPower/.745699872;
     const calibrated=trialSpeed/Math.sqrt(trialHP/pounds);
     factor=calibrated/crouch;trialSource="planing-sea-trial";
     if(calibrated<90||calibrated>260)warnings.push("Measured Crouch constant is outside the normal design range; check shaft power, speed and displacement.");
     powerKW=trialPower*Math.pow(cruise/trialSpeed,2);
     model="Crouch anchored to measured shaft power";
   }
 }else{
   if(Fn>0.42){
     canMatch=false;
     warnings.push("Target Froude number is outside the recommended displacement model range (Fn > 0.42). Semi-displacement powering needs design offsets/CFD/trials; no model recommendation issued.");
   }else if(Fn>0.35)warnings.push("Target is close to the wave-resistance hump; uncalibrated estimates are very sensitive to hull form.");
   if(hull==="canal")warnings.push("Shallow water, canal banks and propeller aperture losses can add significant resistance not represented by the calm-water model.");
   if(hull==="sail")warnings.push("Deep keel and appendage wetted area are not separately represented; resistance may be underestimated.");
   if(hull==="semi")warnings.push("Semi-displacement hump/resistance is strongly hull dependent; prefer actual sea-trial data.");
   const res=globalThis.MarineResistance;
   if(!res?.metrics){errors.push("Hull resistance module is unavailable.");canMatch=false}
   else {
     const modelArgs={lwl,beam,draft,disp:displacement,rho,cb:CB};
     modelMetrics=res.metrics(modelArgs,cruise,1);
     if(!modelMetrics){errors.push("Hull resistance model could not resolve this vessel.");canMatch=false}
     else {
       resistanceN=modelMetrics.resistanceN;
       effPowerKW=resistanceN*v/1000;
       if(trialSpeed>0){
         const atTrial=res.metrics(modelArgs,trialSpeed,1);
         const trialR=trialPower*1000*shaftEff/(trialSpeed*KNOT);
         factor=trialR/atTrial.resistanceN;
         if(!Number.isFinite(factor)||factor<=0){errors.push("Sea-trial calibration is invalid.");canMatch=false}
         else {trialSource="sea-trial";resistanceN*=factor;effPowerKW=resistanceN*v/1000;model="ITTC/friction + wave screen, trial anchored";}
       }
       powerKW=effPowerKW/shaftEff;
     }
   }
 }
 if(!(powerKW>0&&Number.isFinite(powerKW)))canMatch=false;
 const cruiseTotal=powerKW;
 const requiredTotal=cruiseTotal*(1+reserve/100);
 const requiredPerShaft=requiredTotal/boats;
 const shaftCruisePer=cruiseTotal/boats;
 const reqDiesel=requiredPerShaft/(dieselDuty*transEff);
 const reqElectric=requiredPerShaft/electricDuty;

 // Screened attainable speed at the selected duty fraction, never a sea-trial promise.
 function dutySpeed(availableKW){
   if(!(availableKW>0&&canMatch))return null;
   if(planing){
      const pounds=displacement*2204.62262185, hp=availableKW/.745699872;
      if(trialSpeed>0&&trialPower>0)return trialSpeed*Math.sqrt(availableKW/trialPower);
      return crouch*Math.sqrt(hp/pounds);
   }
   const lib=globalThis.MarineResistance;
   if(!lib?.metrics||!Number.isFinite(factor))return null;
   const x={lwl,beam,draft,disp:displacement,rho,cb:CB};
   const maxSpeed=.42*Math.sqrt(G*lwl)/KNOT;
   function demand(vKts){const m=lib.metrics(x,vKts);return m?(m.resistanceN*factor*vKts*KNOT/1000/shaftEff):Infinity}
   if(demand(maxSpeed)<=availableKW)return null; // beyond model's calibrated Froude ceiling
   let a=0,b=maxSpeed;
   for(let i=0;i<38;i++){const mid=(a+b)/2;if(demand(mid)<availableKW)a=mid;else b=mid}
   return(a+b)/2;
 }
 const lineup=(list,kind)=>list.map(p=>{
   const available=p.kw*(kind==="diesel"?transEff:1)*boats;
   const cruiseLoad=cruiseTotal/available*100;
   const installLoad=requiredTotal/(p.kw*(kind==="diesel"?transEff:1)*boats)*100;
   const availableAtDuty=available*(kind==="diesel"?dieselDuty:electricDuty);
   const suitable=canMatch&&availableAtDuty>=requiredTotal-1e-7;
   const undersized=canMatch&&availableAtDuty<requiredTotal;
   const lowLoad=kind==="diesel"&&cruiseLoad<35;
   const voltageOk=kind==="electric"?p.voltage===eVoltage:true;
   const compatible=voltageOk&&(drive==="shaft"||kind!=="electric");
   const avgElectricDraw=kind==="electric"?cruiseTotal/electricEff:null;
   const runtime=kind==="electric"&&available>0?batteryKWh*usablePct/avgElectricDraw:null;
   const predictedSpeed=dutySpeed(availableAtDuty);
   return{...p,kind,suitable:suitable&&compatible,undersized,lowLoad,voltageOk,compatible,cruiseLoad,installLoad,availableAtDuty,available,
     estimatedRuntime:runtime,predictedSpeed,requirementPerShaft:requiredPerShaft,
     utilizationPct:availableAtDuty>0?requiredTotal/availableAtDuty*100:null};
 });
 const dieselModels=lineup(diesel,"diesel").filter(p=>fuel!=="electric");
 const electricModels=lineup(electric,"electric").filter(p=>fuel!=="diesel");
 const rank=items=>items.filter(p=>p.suitable).sort((a,b)=>{
   const aPenalty=a.lowLoad?100:0,bPenalty=b.lowLoad?100:0;
   return aPenalty-bPenalty||a.kw-b.kw;
 });
 const dieselMatches=rank(dieselModels),electricMatches=rank(electricModels);
 const bestDiesel=dieselMatches[0]||null,bestElectric=electricMatches[0]||null;
 const electricDraw=powerKW/electricEff;
 const autonomy= batteryKWh*usablePct/electricDraw;
 const batteryNeeded= electricDraw*hours/usablePct;
 const rated48A=requiredPerShaft/electricEff*1000/eVoltage;
 const dutyAdvice=[];
 if(bestDiesel&&bestDiesel.cruiseLoad<40)dutyAdvice.push("Diesel "+bestDiesel.name+" would operate around "+bestDiesel.cruiseLoad.toFixed(0)+"% of rated power at target cruise; review its manufacturer load spectrum to avoid prolonged underloading.");
 if(fuel!=="diesel"&&!electricMatches.length)dutyAdvice.push("No E-LINE at the selected battery voltage meets the current power/reserve/duty settings. Avoid claiming a suitable electric model.");
 if(fuel!=="electric"&&!dieselMatches.length)dutyAdvice.push("No single VETUS diesel model in the stored catalogue meets the preliminary per-line requirement.");
 if(eVoltage===24)dutyAdvice.push("The currently catalogued 24 V shaft-drive E-Line option is EAIR05024 (5 kW). Higher-output E-Line motors in this selector require a 48 V-class propulsion bank.");
 if(boats===2)dutyAdvice.push("Twin-engine output assumes two independent propulsion lines. Shaft diameter, propeller clearances, thrust, rudder handling and installation requirements must be evaluated separately.");
 if(trialSource==="uncalibrated")dutyAdvice.push("Uncalibrated hull resistance is low-confidence. Use recorded boat speed and actual total delivered shaft power to improve the estimate.");
 if(trialSource==="sea-trial"&&(factor>3||factor<.33))dutyAdvice.push("Sea-trial calibration is "+factor.toFixed(2)+"× the uncalibrated resistance estimate. Review the shaft-power measurement and propulsion efficiency assumption.");
 if(boats===1&&reqElectric>22)dutyAdvice.push("The largest catalogued single E-LINE shaft-drive motor in this selection is 22 kW. A different propulsion architecture may be necessary.");
 dutyAdvice.push("Rated kW, torque-versus-speed, gearbox ratio, propeller sizing and installation space must all be checked against actual product data before specification.");
 dutyAdvice.push("Electric system runtime assumes constant target-speed shaft demand and user-entered DC-to-shaft efficiency, with no hotel loads, wind, current, charging or reserve beyond usable capacity.");
 dutyAdvice.push("Diesel and electric ratings are NOT equivalent torque/propeller performance at the same rated power; obtain engine torque curves and match the propeller shaft design.");
 if(planing)dutyAdvice.push("Crouch predicts near-maximum planing power/speed, not efficient partial-throttle cruising. The target speed is treated as a near-WOT design point. Full-load trials and hull-specific C values are recommended; hump, trim and shaft performance are not modelled.");
 else dutyAdvice.push("Displacement screening uses ITTC-1957 friction and a non-standard approximate wave-resistance term, not a validated Holtrop-Mennen/CFD power prediction.");
 if(fuel!=="diesel"&&eVoltage===48)warnings.push("Battery voltage is 48 V class. The propulsion DC bus, peak currents, BMS and cooling arrangement must be verified.");
 const valid=errors.length===0;
 return{valid,errors,warnings:[...warnings,...dutyAdvice],canMatch:valid&&canMatch,hull,planing,model,lwl,beam,draft,displacement,CB,
  boatSpeed:cruise,hullSpeed,Fn,water,rho,effPowerKW,resistanceN,shaftCruiseKW:powerKW,
  ratedRequiredKW:requiredTotal,perShaftCruise:shaftCruisePer,requiredPerShaft,reqDiesel,reqElectric,
  reserve,boats,trialSpeed,trialPower,trialSource,calibrationFactor:factor,shaftEff,
  dieselDuty,electricDuty,transEff,electricEff,
  batteryKWh,usablePct,hours,eVoltage,electricDraw,autonomy,batteryNeeded,rated48A,
  dieselModels,electricModels,dieselMatches,electricMatches,bestDiesel,bestElectric,
  avgEnergyToCruise:electricDraw*hours,drive,fuel,crouch,metrics:modelMetrics};
}
root.EngineCalc={evaluate,diesel,electric,LINKS};
})(globalThis);