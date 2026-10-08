/* Preliminary calm-water resistance and matching engine.
 * ITTC 1957 CF & Mumford area estimate; bespoke approximate wave term (NOT Holtrop).
 * This module intentionally labels uncalibrated speed as screening only. */
(function(){
"use strict";
const G=9.80665,KNOT=0.514444,NU_FRESH=1.004e-6,NU_SEA=1.19e-6;
function metrics(x,vKts,waveMult=1){
  const L=x.lwl,B=x.beam,T=x.draft,m=x.disp,rho=x.rho,CB=x.cb;
  if(!(L>0&&B>0&&T>0&&m>0&&CB>0&&CB<1.02&&vKts>=0))return null;
  const V=vKts*KNOT,area=1.025*L*(CB*B+1.7*T),nu=rho>1012?NU_SEA:NU_FRESH;
  const Re=Math.max(1e5,V*L/nu);
  const Cf=0.075/Math.pow(Math.log10(Re)-2,2);
  const Fn=V/Math.sqrt(G*L);
  // Non-standard, clearly labelled residual screening curve. Not a tank-test regression.
  const form=1.10+0.22*CB;
  const residual=(0.00012+(0.0011+0.003*CB)*Math.pow(Math.max(0,Fn)/0.30,6))*waveMult;
  const dynamic=0.5*rho*V*V*area;
  const RF=dynamic*Cf*form,RR=dynamic*residual;
  return {area,Re,Cf,Fn,form,residual,frictionN:RF,waveN:RR,resistanceN:RF+RR,V};
}
function makeHull(x){
  if(!(x.lwl>0&&x.beam>0&&x.draft>0&&x.disp>0&&x.cb>0&&x.cb<1.02))return null;
  const atTarget=metrics(x,x.speed,1);
  if(!atTarget)return null;
  let factor=1,source="uncalibrated",trialEstimate=null;
  if(x.resistance>0&&atTarget.resistanceN>0){
    factor=x.resistance*1000/atTarget.resistanceN;source="known-resistance";
  }else if(x.trialSpeed>0&&x.trialPower>0){
    const m=metrics(x,x.trialSpeed,1);
    if(m&&m.resistanceN>0&&m.V>0){
      const assumedEfficiency=Math.min(.85,Math.max(.2,x.trialEta));
      const trialResistance=x.trialPower*1000*assumedEfficiency/m.V;
      factor=trialResistance/m.resistanceN;source="sea-trial";
      trialEstimate=trialResistance;
    }
  }
  // Preserve the actual calibration factor, even when surprising; flag for review in UI.
  function resistance(vKts,waveMult=1){
    const m=metrics(x,vKts,waveMult);
    return m?{...m,resistanceN:m.resistanceN*factor,frictionN:m.frictionN*factor,waveN:m.waveN*factor}:null;
  }
  return{source,factor,trialEstimate,area:atTarget.area,resistance,
    target:resistance(x.speed),uncalibratedTarget:atTarget};
}
function speedSolve(x,prop,hull,perf,waveMult=1){
  if(!hull||!prop||!(x.power>0&&x.srpm>0))return null;
  const d=prop.D,pd=prop.pd,nominal=x.srpm;
  const R=v=>hull.resistance(v,waveMult)?.resistanceN||0;
  const limitFn=x.lwl>0?0.45*Math.sqrt(G*x.lwl)/KNOT:0;
  if(!(limitFn>0))return null;
  function at(vKn){
    // Constant rated shaft torque approximation, up to nominal rpm.
    // For diesel use real engine torque curves when available.
    function propAt(rpm){
      if(rpm<.1)return null;
      return perf(d,pd,{...x,srpm:rpm,speed:vKn});
    }
    let rpm=nominal;
    const full=propAt(nominal);
    let limited=false;
    if(full && full.P>x.power*1.00001){
      let lo=0,hi=nominal;
      for(let i=0;i<30;i++){
        const mid=(lo+hi)/2,p=propAt(mid),allowed=x.power*mid/nominal;
        if(p&&p.P>allowed)hi=mid;else lo=mid;
      }
      rpm=lo;
      limited=true;
    }
    const result=propAt(rpm);
    const thrustN=result?result.T*x.propCount*(1-x.t):0;
    return{vKn,rpm,powerKW:result?result.P*x.propCount:0,thrustN,resistanceN:R(vKn),limited,fn:vKn*KNOT/Math.sqrt(G*x.lwl),
      difference:thrustN-R(vKn),eta:result?result.eta:0};
  }
  let low=0,high=limitFn,atLow=at(low),atHigh=at(high);
  if(!atLow||atLow.difference<=0)return{valid:false,reason:"At zero speed the installed propeller could not create positive net thrust within the torque/rpm limit.",limitFn};
  if(atHigh.difference>0)return{valid:false,reason:"The predicted speed lies beyond the displacement-model Froude limit (Fn 0.45). A higher-speed hull model is required.",limitFn,atLimit:atHigh};
  // Scan for first crossing, avoiding erroneous bisection if a non-monotonic region appears.
  let bracket=null,prev=atLow;
  for(let i=1;i<=100;i++){
    const now=at(high*i/100);
    if(prev.difference>=0&&now.difference<=0){bracket=[prev.vKn,now.vKn];break;}
    prev=now;
  }
  if(!bracket)return{valid:false,reason:"No stable thrust/resistance crossing was found within the displacement-model range.",limitFn};
  let [a,b]=bracket;
  for(let i=0;i<38;i++){const m=(a+b)/2,op=at(m);if(op.difference>0)a=m;else b=m;}
  return{valid:true,...at((a+b)/2),limitFn,atTarget:at(x.speed)};
}
function estimate(x,prop,perf){
  const hull=makeHull(x);if(!hull)return{valid:false,reason:"Enter realistic LWL, beam, loaded draft and displacement (Cb between 0 and 1) to estimate hull resistance and vessel speed."};
  const calculatedProp=prop;
  const base=speedSolve(x,calculatedProp,hull,perf,1);
  // No formal confidence interval; this demonstrates sensitivity to wave coefficient alone.
  const fast=speedSolve(x,calculatedProp,hull,perf,.5);
  const slow=speedSolve(x,calculatedProp,hull,perf,2);
  return{valid:!!base?.valid,reason:base?.reason||"",
    hull,base,slow,fast,
    estimatedShaftKW:hull.target.resistanceN*(x.speed*KNOT)/1000/
      Math.max(.1,Math.min(.85,((prop.eta||.55)*(1-x.t)/(1-x.wake)))),
    sensitivity:[slow?.valid?slow.vKn:null,fast?.valid?fast.vKn:null]};
}
globalThis.MarineResistance={metrics,makeHull,speedSolve,estimate};
})();
