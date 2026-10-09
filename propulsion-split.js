(function(root) {
"use strict";
const KNOT=0.514444;
const NUM=(x,d=0)=>x===null||x===undefined||String(x).trim()===""?d:Number(x);
const hullSpeed=lwl=>1.34*Math.sqrt(Number(lwl)*3.280839895);
function inputs(raw){
 const x={...raw};
 for(const k of ["lwl","beam","draft","displacement","cruise","reservePct","gearboxRatio","observedEngineRPM","trialSpeed","trialPower","batteryKWh","usablePercent","hours","eVoltage","electricEfficiency","hotelWatts","energyReservePercent","engines","propulsiveEfficiency","dieselDuty","electricDuty","gearEfficiency"]){
  if(k in x&&x[k]==="")delete x[k];
 }
 return x;
}
function diesel(raw){
 const x=inputs(raw);
 const lwl=NUM(x.lwl,NaN),theoretical=hullSpeed(lwl),speed=NUM(x.cruise,NaN);
 const base={...x,hull:x.hull||"displacement",cruise:speed,fuel:"diesel",drive:"shaft"};
 const target=globalThis.EngineCalc.evaluate(base);
 const hull=globalThis.EngineCalc.evaluate({...base,cruise:theoretical});
 const valid=target.valid&&hull.valid;
 const warnings=[
 "Theoretical hull speed is a speed-length threshold, not a guaranteed maximum and not a quantity that determines required horsepower on its own.",
 "Power at theoretical hull speed comes from a low-confidence calm-water resistance model (unless calibrated to measured shaft power). Hull geometry, wave resistance, shallow-water effects and propeller efficiency can change demand significantly.",
 "The displayed recommended diesel is a power-capacity screen only. Gearbox ratio changes shaft RPM and torque, not horsepower delivered. A final engine recommendation requires a propeller-load/torque-curve match and verified operating duty."
 ];
 if(x.hull==="canal")warnings.push("Canal vessels may be unable to attain open-water theoretical hull speed owing to shallow-water and bank resistance. Do not size an inland engine from the theoretical speed alone.");
 if(NUM(x.displacement,0)>=25&&!NUM(x.trialPower,0))warnings.push("Heavy displacement craft at or above 25 t: candidate models are deliberately withheld without a measured shaft-power trial.");
 if(speed>theoretical*1.001)warnings.push("Selected cruise speed exceeds traditional displacement hull speed. The powering curve becomes especially uncertain; no guarantee of speed or maximum power is possible.");
 if(x.trialPower&&x.trialSpeed)warnings.push("Sea-trial calibration assumes the shaft power entered is measured delivered power for the loaded vessel, not the engine's advertised maximum rating.");
 // Do not nominate a candidate if either speed exceeds model domain or data invalid.
 const trialKts=NUM(x.trialSpeed,0);
 const extrapolationTooFar=trialKts>0&&theoretical>trialKts*1.25;
 if(extrapolationTooFar)warnings.push("The theoretical hull-speed demand is more than 25% above the measured sea-trial speed. Powering extrapolation is too uncertain to select an engine; repeat a safely conducted trial nearer the intended operating speed or obtain a naval architect's resistance curve.");
 const suitable=valid&&hull.canMatch&&target.canMatch&&!extrapolationTooFar&&speed<=theoretical*1.001&&!((x.hull||"")==="canal"&&!NUM(x.trialPower,0));
 return {kind:"diesel",valid,errors:[...new Set([...target.errors,...hull.errors])],warnings:[...warnings,...target.warnings],
   theoreticalSpeed:theoretical,targetSpeed:speed,atTarget:target,atHull:hull,
   unverifiedHullKW:Number.isFinite(hull.shaftCruiseKW)?hull.shaftCruiseKW:null,
   hullEstimationAllowed:suitable,engineCandidates:suitable?hull.dieselMatches:[],
   installed:target.gearbox,
   method:target.trialPower>0?"Sea-trial-anchored power estimate":"Uncalibrated resistance estimate"};
}
function electric(raw){
 const x=inputs(raw);
 const cruise=NUM(x.cruise,NaN),voltage=NUM(x.eVoltage,48);
 const base={...x,cruise,fuel:"electric",drive:"shaft"};
 const model=globalThis.EngineCalc.evaluate(base);
 const hotelW=NUM(raw.hotelWatts,0),reserve=NUM(raw.energyReservePercent,10),usable=NUM(x.usablePercent,80),bank=NUM(x.batteryKWh,20),hours=NUM(x.hours,4);
 const errors=[...model.errors];
 if(!(hotelW>=0&&hotelW<=100000))errors.push("House/hotel loads must be between 0 and 100,000 W.");
 if(!(reserve>=0&&reserve<95))errors.push("Retained energy reserve must be 0–94%.");
 if(!(bank>0&&bank<=2000))errors.push("Enter the correct installed nominal battery energy in kWh.");
 if(!(usable>=5&&usable<=100))errors.push("Usable battery percentage must be 5–100.");
 if(!(hours>0&&hours<=72))errors.push("Desired journey duration must be positive and no more than 72 hours.");
 const valid=errors.length===0;
 const motionKW=Number.isFinite(model.electricDraw)?model.electricDraw:NaN;
 const demandKW=motionKW+hotelW/1000;
 const availableKWh=bank*usable/100*(1-reserve/100);
 const haveSuitableMotor=valid&&model.canMatch&&model.electricMatches.length>0&&cruise<=hullSpeed(NUM(x.lwl,NaN))*1.001;
 const runtime=haveSuitableMotor&&demandKW>0?availableKWh/demandKW:null;
 const requiredKWh=haveSuitableMotor&&demandKW>0?demandKW*hours/(usable/100)/(1-reserve/100):null;
 const dcCurrent=haveSuitableMotor&&demandKW>0?demandKW*1000/voltage:null;
 const energyForHours=haveSuitableMotor&&demandKW>0?demandKW*hours:null;
 const motorList=valid&&model.canMatch?model.electricMatches:[];
 const warnings=[
 "Runtime assumes continuous speed through water, steady propulsion power, fixed drivetrain efficiency, the entered constant house load and no charging contribution.",
 "Usable battery percentage and retained reserve are separate: available energy = nominal kWh × usable % × (1 − retained reserve %).",
 "Estimated DC current uses nominal system voltage. Real voltage varies under load; battery/BMS continuous and peak discharge current, cabling, fuses and temperature must be verified.",
 "Motor rated output alone cannot guarantee hull speed. Verify actual E-Line continuous torque-versus-speed curves and propeller match before ordering.",
 "The resistance model is a preliminary estimate; without measured shaft-power trial data, calculated consumption and range are low-confidence."
 ];
 if(NUM(x.displacement,0)>=25&&!NUM(x.trialPower,0))warnings.push("At 25 t or more, E-Line matching and battery runtime are withheld without measured shaft-power trial data.");
 if(voltage===24)warnings.push("Only the 24 V E-AIR 5 kW option is screened for 24 V bank voltage in the current product table.");
 if(valid&&model.canMatch&&model.electricMatches.length===0)warnings.push("No listed E-Line can meet the selected shaft duty / reserve. Runtime and required battery figures are withheld because there is no viable system to base them on.");
 const hullKnots=hullSpeed(NUM(x.lwl,NaN));
 if(cruise>hullKnots*1.001)warnings.push("Requested speed exceeds the traditional displacement hull-speed benchmark. Expected power and autonomy become especially uncertain.");
 return{kind:"eline",valid,errors,warnings:[...warnings,...model.warnings],model,
   theoreticalSpeed:hullKnots,targetSpeed:cruise,
   motorList:cruise<=hullKnots*1.001?motorList:[],
   motorKW:motionKW,hotelW,totalKW:demandKW,availableKWh,
   runtime,requiredKWh,dcCurrent,energyForHours,
   batteryKWh:bank,usablePct:usable,reservePct:reserve,hours,voltage,
   reliable:haveSuitableMotor};
}
root.PropulsionSplit={diesel,electric,hullSpeed};
})(globalThis);