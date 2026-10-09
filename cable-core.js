(function(root){
"use strict";
/*
 Indalo Marine Calculators — Cable sizing / voltage-drop engineering estimator.
 Cross-sectional-area ampacity matrix transcribed from the published ISO
 13297:2020 Annex A Table A.1 for 70/85-90/105 C (single stranded copper,
 ambient 30 C, <=3 bundled conductors). Table A.2: engine space and grouping.
 Standard reference https://www.iso.org/standard/69551.html
 Copper resistivity @20 C: 1/58 Ω mm²/m, temperature alpha=.00393 /°C
 (IEC 60028). Does NOT calculate short-circuit loop impedance or interrupt rating.
*/
const SIZES=[.75,1,1.5,2.5,4,6,10,16,25,35,50,70,95,120,150];
const AMPACITY={
 70:[10,14,18,25,35,45,65,90,120,160,210,265,310,360,380],
 90:[12,18,21,30,40,50,70,100,140,185,230,285,330,400,430],
 105:[16,20,25,35,45,60,90,130,170,210,270,330,390,450,475]
};
const ENGINE_FACTOR={70:.75,90:.82,105:.86};
const BREAKERS=[1,2,3,4,5,6,7.5,10,15,16,20,25,30,32,35,40,50,60,63,70,80,90,100,110,125,150,160,175,200,225,250,300,315,350,400,450,500,600];
const MATERIAL={copper:{name:"Stranded tinned copper",rho:.01724137931}};
const N=(v,f=0)=>v===undefined||v===null||String(v).trim()===""?f:Number(v);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function compute(form){
 const f=form||{},scheme=f.scheme||"dc",dc=scheme==="dc",ac1=scheme==="ac1",ac3=scheme==="ac3";
 const errors=[],warnings=[],issues=[];
 if(!["dc","ac1","ac3"].includes(scheme))errors.push("Select DC, single-phase AC or three-phase AC.");
 const volts=N(f.volts,dc?12:ac1?230:400),currentMode=f.loadUnit||"a",loadN=N(f.load,10),pf=N(f.powerFactor,.9);
 const len=N(f.length,5),insulation=N(f.insulation,90),bundle=N(f.bundle,1),
  conductorTemp=N(f.conductorTemp,70),parallel=N(f.parallel,1),hot=f.engineRoom==="yes";
 const voltageTarget=N(f.dropTarget,(f.circuitType==="critical"?3:10));
 const customSize=N(f.checkSize,0),makerAmpacity=N(f.makerAmpacity,0),
  manufacturerFuseMax=N(f.manufacturerFuseMax,0);
 const motor=f.loadType==="motor",propulsion=f.loadType==="propulsion",special=!!(motor||propulsion);
 const rho20=MATERIAL.copper.rho,rho=rho20*(1+.00393*(conductorTemp-20));
 if(!(volts>0&&volts<=1000))errors.push("Enter a valid circuit voltage.");
 if(!dc&&!ac1&&!ac3)errors.push("Unsupported wiring system.");
 if(!(loadN>0&&loadN<=500000))errors.push("Enter a positive electrical load.");
 if(!["a","w","kw"].includes(currentMode))errors.push("Select amps, watts or kilowatts.");
 if(!(len>0&&len<=1000))errors.push("Enter the one-way cable run in metres, greater than zero.");
 if(![70,90,105].includes(insulation))errors.push("Choose a supported cable insulation rating.");
 if(![1,3,4,7,25].includes(bundle))errors.push("Choose the correct conductor grouping.");
 if(![1,2,3,4].includes(parallel))errors.push("Choose 1 to 4 equal-sized cables per active conductor.");
 if(!(conductorTemp>=20&&conductorTemp<=105))errors.push("Copper conductor temperature must be 20–105°C.");
 if(conductorTemp>insulation)errors.push("The assumed conductor temperature must not exceed the insulation rating.");
 if(!(voltageTarget>=.1&&voltageTarget<=20))errors.push("Set voltage-drop allowance between 0.1% and 20%.");
 if(!dc&&!(pf>.1&&pf<=1))errors.push("AC power factor must be between 0.1 and 1.");
 if(makerAmpacity<0||manufacturerFuseMax<0)errors.push("Optional manufacturer limits must be non-negative.");
 if(customSize&&!SIZES.includes(customSize))errors.push("Choose a listed cable cross-section for the existing cable check.");
 let amps=currentMode==="a"?loadN:dc?loadN*(currentMode==="kw"?1000:1)/volts:
  ac1?loadN*(currentMode==="kw"?1000:1)/(volts*pf):loadN*(currentMode==="kw"?1000:1)/(Math.sqrt(3)*volts*pf);
 if(!Number.isFinite(amps)||amps<=0||amps>20000)errors.push("Calculated current is outside the supported range.");
 const rows=SIZES.map((size,i)=>{
  const sizePerPath=parallel*size;
  const base=AMPACITY[insulation]?.[i]||0;
  const groupFactor=bundle>=25?.5:bundle>=7?.6:bundle>=4?.7:1;
  const spaceFactor=hot?ENGINE_FACTOR[insulation]:1;
  const makerLimit=makerAmpacity>0?makerAmpacity:Infinity;
  // The maker limit is on one conductor BEFORE installer-applied space/bundle factors.
  const safeAmpacityPerCable=Math.min(base,makerLimit)*groupFactor*spaceFactor;
  const ampacity=safeAmpacityPerCable*parallel;
  // DC and AC1 use line + return; 3φ uses sqrt(3) times line resistance (R only).
  const totalPath=dc||ac1?2*len:Math.sqrt(3)*len;
  const resistance=rho*totalPath/(size*parallel);
  const dropV=amps*resistance;
  const dropPercent=dropV/volts*100;
  return{size,parallel,nominalCombinedArea:sizePerPath,baseAmpacity:base,bundleFactor:groupFactor,engineFactor:spaceFactor,
   makerAmpacity:makerLimit===Infinity?null:makerLimit,ampacity,safeAmpacityPerCable,
   dropV,dropPercent,receivedV:Math.max(0,volts-dropV),lossW:dc||ac1?amps*amps*resistance:
    3*amps*amps*(rho*len/(size*parallel)),
   resistanceOhms:resistance,
   ampacityPass:ampacity>=amps,dropPass:dropPercent<=voltageTarget,
   allowed:ampacity>=amps&&dropPercent<=voltageTarget&&size>=1};
 });
 const recommended=rows.find(x=>x.allowed)||null;
 const sizeByDrop=rows.find(x=>x.dropPass&&x.size>=1)||null;
 const sizeByAmpacity=rows.find(x=>x.ampacityPass&&x.size>=1)||null;
 const checked=customSize?rows.find(x=>x.size===customSize):null;
 const chosen=checked||recommended;
 const continuous= f.duty==="intermittent" ? false : true;
 const fuseMin=continuous?amps*1.25:amps; // continuous-load heat-management assumption; not a motor start design
 let fuse=null,fuseReason="";
 // High-current, motor, parallel and 3φ contexts always require specialist protection coordination.
 const canPropose=!!chosen&&chosen.allowed&&parallel===1&&!motor&&!propulsion&&!ac3&&amps<=150;
 if(canPropose){
   const pool=BREAKERS.filter(size=>size>=fuseMin-1e-8&&size<=chosen.ampacity+1e-8&&
     (!manufacturerFuseMax||size<=manufacturerFuseMax+1e-8));
   fuse=pool[0]??null;
   if(fuse===null)fuseReason="No standard nominal protective-device value fits the load margin, derated cable limit and equipment limit. Increase cable cross-section or verify an appropriate protection design.";
 } else if(parallel>1)fuseReason="Parallel power cables require balanced paths and coordinated overcurrent protection for each conductor. No generic fuse number is issued.";
 else if(special)fuseReason="Motor / propulsion / thruster inrush and manufacturer fuse/cable requirements take priority. Fuse recommendation withheld.";
 else if(ac3)fuseReason="Three-phase marine circuits require IEC 60092-507 installation design and protection coordination. Fuse recommendation withheld.";
 else if(amps>150)fuseReason="High-current feed requires fault-current / fuse class / DC breaking-capacity and manufacturer coordination. No generic fuse number issued.";
 else if(!chosen)fuseReason="No cross-section can be selected within the supported sizing table.";
 else if(!chosen.allowed)fuseReason="The manually checked cable does not meet the current and voltage-drop criteria; no fuse recommendation issued.";
 if(hot)warnings.push("Engine-space cable ampacity has been derated using ISO Annex A.2.");
 if(bundle>=4)warnings.push("Bundled-cable ampacity has been derated. Confirm the number of simultaneously loaded conductors.");
 if(parallel>1)warnings.push("Cable runs in parallel must be equal length, same cross-section and termination conditions; verify fault protection and each path's rating.");
 if(!recommended)warnings.push("No suitable size found up to 150 mm² per conductor with the selected number of parallel conductors. Reassess design and cable data.");
 if(checked&&!checked.allowed)warnings.push("The existing cable fails the selected limits. Do not rely on its indicative fuse advice.");
 if(checked&&recommended&&checked.size>recommended.size)warnings.push("The checked cable is larger than the computed minimum size, which may reduce voltage drop.");
 if(dc&&f.circuitType==="critical"&&voltageTarget>3)warnings.push("This is a safety-critical circuit. A voltage-drop target no higher than 3% is generally preferred.");
 if(dc&&voltageTarget>10)warnings.push("For normal DC craft wiring, ISO 13297:2020 specifies a maximum 10% conductor voltage drop. Reduce the target or check a justified equipment exception.");
 if(!dc&&ac3)warnings.push("400 V three-phase is outside ISO 13297 DC/1-phase scope. IEC 60092-507 applies; the AC3 voltage-drop estimate ignores reactance and cannot establish compliance.");
 if(!dc&&ac1)warnings.push("AC voltage drop is a resistive-only estimate that ignores cable reactance. Confirm AC cable installation, RCD and source-specific protection.");
 if(propulsion)warnings.push("Electric propulsion circuits are outside ISO 13297:2020's general craft wiring scope; consult ISO 16315 and motor manufacturer instructions.");
 if(motor)warnings.push("Inrush and locked-rotor conditions are not captured by continuous-load cable sizing. Equipment manufacturer's short-duty/current curves and protection requirements take priority.");
 if(!makerAmpacity)warnings.push("Cable ampacity comes from generic standard tables; confirm the cable manufacturer's approved continuous current rating and terminal temperature.");
 if(!manufacturerFuseMax)warnings.push("No equipment-specific maximum protective-device rating entered. Confirm the manufacturer’s required fuse/breaker and fuse type.");
 if(fuse)warnings.push("The displayed protective-device current is only a preliminary nominal suggestion. Confirm fuse class, time-current curve, interruption/breaking capacity, circuit fault current, equipment limits and source placement.");
 warnings.push("Conductor size is the larger requirement of voltage drop and derated ampacity. Voltage drop excludes terminations, joints and battery internal resistance.");
 if(dc)warnings.push("Position DC circuit protection close to the source; ISO 13297:2020 generally specifies within 175 mm unless its stated exceptions apply.");
 warnings.push("Use marine-rated stranded copper wiring and suitably rated terminals. Confirm the smallest conductor/connector rating in the entire circuit.");
 return{valid:errors.length===0,errors,warnings,scheme,dc,ac1,ac3,volts,amps,watts:dc?volts*amps:ac1?volts*amps*pf:Math.sqrt(3)*volts*amps*pf,powerFactor:pf,
  length:len,conductorTemp,insulation,hot,bundle,parallel,rho,voltageTarget,
  rows,recommended,chosen,checked,sizeByDrop,sizeByAmpacity,fuseMin,fuse,fuseReason,manufacturerFuseMax,makerAmpacity,
  cableMetres:(dc||ac1?2:3)*len*parallel,continuous,loadType:f.loadType||"normal",
  sourceNote:"ISO 13297:2020 Annex A ampacity and derating; IEC 60028 copper resistance at temperature; AC3 screening only."};
}
root.CableCalc={compute,SIZES,AMPACITY,ENGINE_FACTOR,BREAKERS};
})(globalThis);