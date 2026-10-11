(function(root){
"use strict";
const finite=(v,def=0)=>{v=Number(v);return Number.isFinite(v)?v:def};
const positive=(v,def=0)=>Math.max(0,finite(v,def));
const standard=[2,2.5,3,3.5,4,4.5,5,6,6.5,7,8,9,10,12,12.5,15,17.5,20,22,25,30,35,40,45,50,60,65,75,80,90,100,125,150,175,200,250];
const roundUp=(v,step)=>v<=0?0:Math.ceil((v-1e-9)/step)*step;
function calculate(t,s,opts={}){
 const voltage=positive(s.bv),dod=finite(s.dod),days=finite(s.days);
 const reserve=finite(opts.batteryMargin,15),genLoad=finite(opts.genLoad,80),
       gensetPF=finite(opts.gensetPF,.8),chargeHours=finite(opts.chargeHours,5),
       includeCharging=opts.includeCharging===true;
 const errors=[];
 if(!(voltage>=6&&voltage<=800))errors.push("Enter a valid battery-bank nominal voltage.");
 if(!(dod>0&&dod<=100))errors.push("Usable battery capacity / depth of discharge must be 1-100%.");
 if(!(days>0&&days<=30))errors.push("Autonomy must be between 0 and 30 days.");
 if(!(reserve>=0&&reserve<=100))errors.push("Battery margin must be between 0 and 100%.");
 if(!(genLoad>=50&&genLoad<=95))errors.push("Target generator continuous load must be 50-95%.");
 if(!(gensetPF>=.7&&gensetPF<=1))errors.push("Genset rated power factor must be between 0.7 and 1.");
 if(includeCharging&&!(chargeHours>=1&&chargeHours<=24))errors.push("Recharging window must be between 1 and 24 hours.");
 const valid=errors.length===0;
 const runningAcVA=positive(t.acVA),runningAcW=positive(t.acW),
   dcW=positive(t.dcW), surgeVA=positive(t.surgeVA),surgeW=positive(t.surgeW);
 const requiredAh=valid?positive(t.ah):null;
 const recommendedAh=valid?roundUp(requiredAh*(1+reserve/100),25):null;
 const recommendedKWh=valid?recommendedAh*voltage/1000:null;
 const nominalMinKWh=valid?requiredAh*voltage/1000:null;
 const dailyBatteryKWh=valid?positive(t.acWh)/1000/(finite(s.inv,92)/100)+positive(t.dcWh)/1000/(finite(s.dcEff,95)/100):null;
 // Optional battery charger allowance is AC input power: 90% conversion and
 // PF 0.9 are indicative; do not double-count an existing charger load.
 const chargerKW=valid&&includeCharging?dailyBatteryKWh/chargeHours/.90:0;
 const chargerKVA=chargerKW/.90;
 const continuousKVA=(runningAcVA/1000+chargerKVA)/(genLoad/100);
 const continuousKW=(runningAcW/1000+chargerKW)/(genLoad/100);
 const surgeKVA=(runningAcVA/1000+chargerKVA+surgeVA/1000)*(1+positive(s.head)/100);
 const surgeKW=(runningAcW/1000+chargerKW+surgeW/1000)*(1+positive(s.head)/100);
 const minimumKVA=valid?Math.max(continuousKVA,continuousKW/gensetPF,surgeKVA,surgeKW/gensetPF):null;
 const hasGeneratorDemand=runningAcVA>0||chargerKVA>0;
 const selectedKVA=valid&&hasGeneratorDemand?(standard.find(x=>x>=minimumKVA-1e-9)??roundUp(minimumKVA,25)):null;
 const notes=[];
 if(!hasGeneratorDemand)notes.push("No AC loads or planned battery charging were entered: no generator recommendation is made for DC loads alone.");
 if(positive(t.va3)>0)notes.push("3-phase loads are present: the recommended rating must be for a 3-phase generator. Verify 1-phase load distribution and neutral loading.");
 if(surgeVA>0)notes.push("Motor starting allowance is an indicative single largest simultaneous-start event, not verified generator voltage dip or transient motor-start kVA capability.");
 if(includeCharging)notes.push("Battery recharge allowance assumes full daily battery energy replenished in the specified hours at 90% charger efficiency / 0.90 AC power factor. Do NOT count it again if a battery charger already appears in the AC load list.");
 if(!includeCharging&&dcW>0)notes.push("DC battery charging is NOT included in the generator recommendation. Enable the charging allowance if the generator must recharge batteries and no charger has already been scheduled.");
 notes.push("Generator output must be checked for altitude, ambient temperature, marine derating, inverter/charger harmonics, step load, power factor and actual 1-phase/3-phase availability.");
 notes.push("Battery recommendation is NOMINAL Ah at the selected bank voltage. Verify battery chemistry, C-rate, discharge curves, inverter peaks, charging source, BMS limits and module series/parallel arrangement.");
 return{valid,errors,battery:{minimumAh:requiredAh,recommendedAh,recommendedKWh,minimumKWh:nominalMinKWh,voltage,usablePercent:dod,autonomyDays:days,marginPercent:reserve,dailyEnergyKWh:dailyBatteryKWh},
 generator:{requiredKVA:hasGeneratorDemand?minimumKVA:null,recommendedKVA:selectedKVA,kind:positive(t.va3)>0?"3-phase":"single-phase",
   continuousDemandKVA:continuousKVA,peakDemandKVA:surgeKVA,addedChargingKW:chargerKW,addedChargingKVA:chargerKVA,
   powerFactor:gensetPF,utilizationPct:genLoad,includesCharging:includeCharging,chargingHours:includeCharging?chargeHours:null},
 notes};
}
root.LoadRecommendations={calculate};
})(globalThis);