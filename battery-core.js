(function(root){
  "use strict";
  const CHEM={
    flooded:{name:"Flooded lead-acid",voltageScale:1,dod:.50,chargeC:.15,eff:.85,taper:1.25},
    agm:{name:"AGM lead-acid",voltageScale:1,dod:.50,chargeC:.20,eff:.90,taper:1.22},
    lfp:{name:"LiFePO4 lithium",voltageScale:1.0666666666666667,dod:.80,chargeC:.30,eff:.95,taper:1.08}
  };
  const num=(v,f=0)=>{if(v===null||v===undefined||String(v).trim()==="")return f;const k=Number(v);return Number.isFinite(k)?k:f};
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function calculate(input){
    const a=input||{},chem=CHEM[a.chemistry]||CHEM.agm;
    const system=num(a.systemVoltage,24),module=num(a.moduleVoltage,12);
    const mode=a.connection||"series-parallel";
    let p=1,s=1;
    const warnings=[],errors=[];
    if(![12,24,48].includes(system)||![12,24,48].includes(module))errors.push("Choose 12 V, 24 V or 48 V for the bank and battery.");
    if(module>system||system%module!==0)errors.push("The battery voltage cannot form the chosen bank voltage. Choose a lower-voltage battery or a higher-voltage bank.");
    const seriesNeeded=system/module;
    if(mode==="single"){
      if(seriesNeeded!==1)errors.push("A single battery cannot make the chosen bank voltage. Choose Series.");
      s=1;p=1;
    }else if(mode==="series"){
      if(seriesNeeded<2)errors.push("Series mode needs at least two batteries. Choose a higher bank voltage or Parallel.");
      s=seriesNeeded;p=1;
    }else if(mode==="parallel"){
      if(seriesNeeded!==1)errors.push("Parallel strings don't increase voltage. Select Series-parallel to reach a higher voltage.");
      s=1;p=Math.floor(num(a.strings,2));if(p<2)errors.push("Parallel mode requires at least two batteries.");
    }else if(mode==="series-parallel"){
      if(seriesNeeded<2)errors.push("Series-parallel mode needs battery modules lower than the bank voltage.");
      s=seriesNeeded;p=Math.floor(num(a.strings,2));if(p<2)errors.push("Series-parallel mode needs two or more strings.");
    }else errors.push("Choose a valid connection.");
    if(s*p>64)errors.push("The illustration is limited to 64 batteries. Larger banks need a detailed manufacturer design.");
    if(s*p<=0||!Number.isFinite(s*p))errors.push("Invalid battery count.");
    let capacityValue=num(a.capacityValue,100),capacityUnit=a.capacityUnit==="kwh"?"kwh":"ah";
    if(!(capacityValue>0&&capacityValue<=100000))errors.push("Enter a realistic positive battery capacity.");
    const batteryVoltage=module*chem.voltageScale;
    const perAh=capacityUnit==="ah"?capacityValue:capacityValue*1000/batteryVoltage;
    if(perAh>50000)errors.push("Check that the capacity is entered per battery rather than for the whole bank.");
    const bAh=perAh*p;
    const totalCount=s*p;
    const bankNominalV=batteryVoltage*s;
    const bankKWh=bAh*bankNominalV/1000;
    const dod=clamp(num(a.usablePercent,chem.dod*100),1,100)/100;
    const usableKWh=bankKWh*dod;
    const starting=clamp(num(a.startSOC,50),0,100);
    const ending=clamp(num(a.endSOC,100),0,100);
    if(ending<=starting)errors.push("The target state of charge must be above the starting state.");
    const hours=num(a.chargeHours,8);
    if(!(hours>=.5&&hours<=168))errors.push("Choose a charge duration between 0.5 and 168 hours.");
    const eff=clamp(num(a.chargeEfficiency,chem.eff*100),50,100)/100;
    const chargeRateC=clamp(num(a.preferredC,chem.chargeC),.01,2);
    const taper=clamp(num(a.taperFactor,chem.taper),1,2);
    const load=clamp(num(a.loadValue,0),0,1e7);
    const loadMode=a.loadUnit==="a"?"a":"w";
    const loadW=loadMode==="a"?load*bankNominalV:load;
    const invert=a.loadType==="ac";
    const inverterEff=clamp(num(a.inverterEfficiency,90),50,100)/100;
    const deliveredLoadW=loadW;  // The user inputs load power measured at the appliance, not inverter DC input.
    const batteryLoadW=invert?deliveredLoadW/inverterEff:deliveredLoadW;
    const loadA=bankNominalV>0?batteryLoadW/bankNominalV:0;
    const runtimeHours=batteryLoadW>0?usableKWh*1000/batteryLoadW:null;
    const houseW=clamp(num(a.chargeHouseW,0),0,1e6);
    const houseA=houseW/bankNominalV;
    const fraction=(ending-starting)/100;
    const removedAh=bAh*fraction;
    // Taper allowance covers diminishing current in absorption. It is a planning approximation.
    const neededBatteryA=removedAh/(Math.max(.01,hours)*eff)*taper;
    const suggestedBatteryA=bAh*chargeRateC;
    const maxPerBattery=num(a.maxChargePerBattery,0);
    const maxBankChargeA=maxPerBattery>0?maxPerBattery*p:null;
    let recommendedBatteryA=Math.max(neededBatteryA,suggestedBatteryA);
    if(maxBankChargeA!==null&&recommendedBatteryA>maxBankChargeA){
      recommendedBatteryA=maxBankChargeA;
      warnings.push("Battery maker's total charge-current limit is lower than the initially suggested rate. Charger selection is capped at that limit.");
    }
    if(maxBankChargeA===null)warnings.push("Check the battery's maximum allowed charge current; no manufacturer current limit has been entered.");
    const totalChargeA=recommendedBatteryA+houseA;
    // Select a non-excessive commercial current recommendation. Do not round above maker battery limit.
    let chargerA=Math.max(1,Math.ceil(totalChargeA/5)*5);
    if(maxBankChargeA!==null&&chargerA-houseA>maxBankChargeA+.001)chargerA=Math.min(maxBankChargeA+houseA,Math.max(0.01,Math.floor((maxBankChargeA+houseA)*10)/10));
    const actualBatteryA=Math.max(0,chargerA-houseA);
    const achievableHours=actualBatteryA>0?removedAh/(actualBatteryA*eff)*taper:null;
    if(actualBatteryA<neededBatteryA-.1)warnings.push("This charger may not meet the requested charging time. Increase the available charge time or confirm a higher allowable battery charge rate.");
    const dcW=chargerA*bankNominalV;
    const wattsApprox=dcW*1.15; // Typical charging voltage above nominal; real profile varies.
    if(chem===CHEM.lfp){
      warnings.push("Lithium requires a compatible BMS and charger settings. Series/parallel permission and maximum battery count must be confirmed for the exact battery model.");
      warnings.push("Many LiFePO4 batteries must not be charged below their specified minimum temperature.");
    }else{
      warnings.push("Lead-acid charging slows in absorption and capacity may fall at high loads. The Ah rating is often a C20 value; runtime is an estimate.");
      if(chem===CHEM.flooded)warnings.push("Flooded batteries require appropriate ventilation, maintenance and temperature-compensated charging.");
      else warnings.push("AGM charging requires the approved absorption/float voltages and temperature compensation per the battery manufacturer.");
    }
    if(p>1)warnings.push("Parallel strings should have balanced cables, suitable per-string protection and manufacturer-approved parallel limits.");
    if(s>1)warnings.push("Series modules must be matched and balanced. Confirm the exact battery product supports this number in series.");
    if(dod>.9&&chem!==CHEM.lfp)warnings.push("Very high usable depth of discharge reduces lead-acid service life.");
    const positive=!errors.length;
    return{
      valid:positive,errors,warnings,
      name:chem.name,chemistry:a.chemistry,
      systemVoltage:system,moduleVoltage:module,bankNominalV,batteryVoltage,capacityPerBatteryAh:perAh,capacityPerBatteryKWh:perAh*batteryVoltage/1000,
      series:s,parallel:p,totalCount,label:`${s}S${p}P`,
      bankAh:bAh,nominalKWh:bankKWh,usableKWh,usableAh:bAh*dod,usablePercent:dod*100,
      loadW,loadA,runtimeHours,invert,houseW,houseA,
      socStart:starting,socEnd:ending,missingAh:removedAh,
      plannedHours:hours,neededBatteryA,suggestedBatteryA,
      chargerA,chargerKW:wattsApprox/1000,chargeBatteryA:actualBatteryA,
      maxBankChargeA,achievableHours,chargeRateC,eff,taper
    };
  }
  root.BatteryCalc={calculate,chemistries:CHEM};
})(globalThis);