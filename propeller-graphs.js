(function(root){
"use strict";
const NS="http://www.w3.org/2000/svg";
const MPH_PER_KNOT=1.150779448,KW_PER_HP=.745699872;
const $=id=>document.getElementById(id);
const num=(v,d=0)=>Number.isFinite(Number(v))&&String(v).trim()!==""?Number(v):d;
const fmt=(v,d=1)=>Number.isFinite(v)?Number(v).toFixed(d):"—";
let last=null;
function node(tag,attributes,text){
 const e=document.createElementNS(NS,tag);
 for(const [k,v] of Object.entries(attributes||{}))e.setAttribute(k,String(v));
 if(text!==undefined)e.textContent=String(text);
 return e;
}
function graphSVG(host,config){
 host.replaceChildren();
 const W=740,H=330,L=72,R=24,T=28,B=55;
 const pw=W-L-R,ph=H-T-B,maxX=config.maxX,maxY=config.maxY;
 const xx=x=>L+x/maxX*pw, yy=y=>H-B-y/maxY*ph;
 const svg=node("svg",{viewBox:`0 0 ${W} ${H}`,role:"img","aria-label":config.title,style:"display:block;width:100%;height:auto;max-height:365px"});
 svg.append(node("rect",{x:0,y:0,width:W,height:H,rx:12,fill:"#061e33"}));
 for(let i=0;i<=5;i++){
  const x=maxX*i/5,xPos=xx(x);
  svg.append(node("line",{x1:xPos,y1:T,x2:xPos,y2:H-B,stroke:"#214962","stroke-width":1}));
  svg.append(node("text",{x:xPos,y:H-B+19,fill:"#bed9e7","font-size":12,"text-anchor":"middle"},fmt(x,maxX<=25?1:0)));
  const v=maxY*i/5,yPos=yy(v);
  svg.append(node("line",{x1:L,y1:yPos,x2:W-R,y2:yPos,stroke:"#214962","stroke-width":1}));
  svg.append(node("text",{x:L-11,y:yPos+4,fill:"#bed9e7","font-size":12,"text-anchor":"end"},fmt(v,0)));
 }
 svg.append(node("text",{x:L+pw/2,y:H-6,fill:"#e0f4f9","font-size":13,"text-anchor":"middle"},config.xLabel));
 svg.append(node("text",{x:20,y:H/2,fill:"#e0f4f9","font-size":13,transform:`rotate(-90 20 ${H/2})`,"text-anchor":"middle"},config.yLabel));
 const legend=node("g",{});
 let ix=0;
 for(const line of config.lines){
  const valid=line.data.filter(pt=>pt.every(Number.isFinite)&&pt[0]>=0&&pt[0]<=maxX);
  if(valid.length>=2){
   svg.append(node("polyline",{points:valid.map(p=>fmt(xx(p[0]),2)+","+fmt(yy(p[1]),2)).join(" "),fill:"none",stroke:line.color,"stroke-width":line.dashed?2.4:3.4,"stroke-linejoin":"round","stroke-linecap":"round",...(line.dashed?{"stroke-dasharray":"8 7"}:{})}));
  }
  const ly=11, lx=L+ix*216;
  legend.append(node("line",{x1:lx,y1:ly,x2:lx+23,y2:ly,stroke:line.color,"stroke-width":3,...(line.dashed?{"stroke-dasharray":"5 4"}:{})}));
  legend.append(node("text",{x:lx+30,y:ly+4,fill:"#cbe5ef","font-size":11},line.label));
  ix++;
 }
 svg.append(legend);
 for(const m of config.marks||[]){
  if(!(m.x>=0&&m.x<=maxX&&m.y>=0&&m.y<=maxY))continue;
  const cx=xx(m.x),cy=yy(m.y);
  svg.append(node("circle",{cx,cy,r:5,fill:m.color||"#ffcb78",stroke:"#09283b","stroke-width":2}));
  svg.append(node("text",{x:Math.min(W-R-5,Math.max(L+42,cx)),y:Math.max(T+25,cy-10),fill:m.color||"#ffcf8a","font-size":11,"font-weight":700,"text-anchor":"middle"},m.label));
 }
 host.append(svg);
}
function engineProfile(frac){
 const pts=[[0,0],[.21,.11],[.42,.28],[.625,.70],[.83,.92],[1,1]];
 for(let i=1;i<pts.length;i++)if(frac<=pts[i][0]){
  const [x0,y0]=pts[i-1],[x1,y1]=pts[i];
  return (y0+(frac-x0)/(x1-x0)*(y1-y0));
 }
 return 1;
}
function render(prop,x,performance){
 last={prop,x,performance};
 const host=$("propGraphs");if(!host)return;
 const speedMph=x.speed*MPH_PER_KNOT;
 const cruiseRPM=num($("curveCruiseRPM")?.value,0);
 const cruiseMph=num($("curveCruiseMph")?.value,0);
 const hasCruise=cruiseRPM>0&&cruiseMph>0&&cruiseRPM<x.erpm;
 function speedAtEngineRPM(rpm){
  if(!hasCruise)return speedMph*rpm/x.erpm;
  if(rpm<=cruiseRPM)return cruiseMph*rpm/cruiseRPM;
  return cruiseMph+(speedMph-cruiseMph)*(rpm-cruiseRPM)/(x.erpm-cruiseRPM);
 }
 const hull=globalThis.MarineResistance?.makeHull(x);
 const eff=Math.max(.2,Math.min(.8,prop.eta*(1-x.t)/(1-x.wake)));
 const maxSpeed=Math.max(5,speedMph*1.35);
 let vCurve=[],topVesselHp=null,cruiseVesselHp=null;
 if(hull){
  for(let i=0;i<=84;i++){
   const mph=maxSpeed*i/84,kts=mph/MPH_PER_KNOT;
   const fn=kts*.514444/Math.sqrt(9.80665*x.lwl);
   if(fn>.45)break;
   const at=hull.resistance(kts);
   if(at&&Number.isFinite(at.resistanceN))vCurve.push([mph,at.resistanceN*kts*.514444/(1000*eff*KW_PER_HP)]);
  }
  function hullPower(mph){
   const at=hull.resistance(mph/MPH_PER_KNOT);
   const FN=mph/MPH_PER_KNOT*.514444/Math.sqrt(9.80665*x.lwl);
   return at&&FN<=.45?at.resistanceN*(mph/MPH_PER_KNOT)*.514444/(1000*eff*KW_PER_HP):null;
  }
  topVesselHp=hullPower(speedMph);
  cruiseVesselHp=hasCruise?hullPower(cruiseMph):null;
 }
 const refPhoto=$("photoComparison")?.dataset.active==="yes";
 const photoVMarks=refPhoto?[{x:9.4,y:90,label:"Photo top: 90 hp",color:"#ffd18d"},{x:3.5,y:5,label:"Photo cruise: 5 hp",color:"#ffd18d"}]:[];
 const vmax=Math.max(15,Math.ceil(Math.max(...vCurve.map(x=>x[1]),90,topVesselHp||0)*1.13/20)*20);
 if(vCurve.length>2)graphSVG($("vesselPowerGraph"),{title:"Estimated vessel shaft power against boat speed",xLabel:"Vessel speed through water (mph)",yLabel:"Estimated shaft horsepower",maxX:maxSpeed,maxY:vmax,
  lines:[{label:"Indalo hull resistance screen",color:"#25d4ea",data:vCurve}],
  marks:[{x:speedMph,y:topVesselHp??NaN,label:"Chosen speed",color:"#8effd0"},...photoVMarks]});
 else $("vesselPowerGraph").textContent="Enter valid LWL, beam, loaded draft and displacement to show this estimated vessel power curve.";
 let absorbed=[],engine=[];
 for(let i=1;i<=95;i++){
  const rpm=x.erpm*i/95,speed=speedAtEngineRPM(rpm);
  const at=performance(prop.D,prop.pd,{...x,srpm:rpm/x.ratio,speed:speed/MPH_PER_KNOT});
  if(at&&Number.isFinite(at.P))absorbed.push([rpm,at.P*x.propCount/KW_PER_HP]);
  engine.push([rpm,x.totalPower/KW_PER_HP*engineProfile(rpm/x.erpm)]);
 }
 let maxPower=Math.max(20,x.totalPower/KW_PER_HP*1.2,...absorbed.map(p=>p[1]*1.1));
 maxPower=Math.ceil(maxPower/20)*20;
 const topProp=performance(prop.D,prop.pd,x);
 const cruiseProp=hasCruise?performance(prop.D,prop.pd,{...x,srpm:cruiseRPM/x.ratio,speed:cruiseMph/MPH_PER_KNOT}):null;
 const marks=[topProp&&{x:x.erpm,y:topProp.P*x.propCount/KW_PER_HP,label:"Design point",color:"#8effd0"},
  cruiseProp&&{x:cruiseRPM,y:cruiseProp.P*x.propCount/KW_PER_HP,label:"Cruise",color:"#ffd18d"}].filter(Boolean);
 if(refPhoto)marks.push({x:2400,y:113,label:"Photo: 113 hp",color:"#ffb184"},{x:849,y:5,label:"Photo: 5 hp",color:"#ffb184"});
 graphSVG($("engineLoadGraph"),{title:"Engine RPM versus predicted fixed propeller absorption and illustrative diesel full-load curve",xLabel:"Engine / motor RPM",yLabel:"Power (hp)",maxX:x.erpm,maxY:maxPower,
  lines:[{label:"Wageningen prop absorption",color:"#28dae8",data:absorbed},
         {label:"Illustrative engine envelope",color:"#ffd18d",dashed:true,data:engine}],marks});
 const note=$("curveNote");
 if(note)note.textContent="Solid cyan = B-series power absorbed by this propeller at the assumed speed/RPM relationship. Dashed amber = ILLUSTRATIVE diesel full-load profile derived only from entered rated power and RPM; it is NOT an actual manufacturer torque curve. Hull-power chart uses the separate approximate resistance model and estimated overall propulsive efficiency ("+fmt(eff*100,1)+"%). These are distinct power concepts and will not necessarily match.";
 const snapshot=$("photoComparison");
 if(snapshot&&refPhoto&&topProp&&cruiseProp){
  const crSlip=(1-(cruiseMph/MPH_PER_KNOT*.514444)/(cruiseRPM/x.ratio/60*prop.pitch))*100;
  const topSlip=(1-(x.speed*.514444)/(x.srpm/60*prop.pitch))*100;
  const values=[
   ["Prop absorbed power (hp)",113,topProp.P*x.propCount/KW_PER_HP,5,cruiseProp.P*x.propCount/KW_PER_HP],
   ["Open-water prop efficiency (%)",40.1,topProp.eta*100,40.8,cruiseProp.eta*100],
   ["Delivered thrust (lbf)",1754,topProp.T*x.propCount*.224809,212,cruiseProp.T*x.propCount*.224809],
   ["Geometric apparent slip (%)",48.2,topSlip,45.6,crSlip],
   ["Vessel power curve (hp)",90,topVesselHp,5,cruiseVesselHp]
  ];
  const body=$("photoComparisonRows");
  if(body){body.replaceChildren();for(const [label,expTop,gotTop,expCruise,gotCruise] of values){
   const tr=document.createElement("tr");for(const t of [label,fmt(expTop,1),fmt(gotTop,1),fmt(expCruise,1),fmt(gotCruise,1)]){
    const td=document.createElement("td");td.textContent=t;tr.append(td);
   }body.append(tr);
  }}
 }
 if($("curveReadout"))$("curveReadout").textContent="Design absorbed "+fmt(topProp?.P*x.propCount/KW_PER_HP,1)+" hp at "+fmt(x.erpm,0)+" engine rpm"+
  (cruiseProp?"; cruise absorbed "+fmt(cruiseProp.P*x.propCount/KW_PER_HP,1)+" hp at "+fmt(cruiseRPM,0)+" rpm":"")+".";
}
function benchmark(){
 const values={vesselName:"Screenshot comparison • 60 ft 36 t (test only)",lwl:18.29,beam:4.22,draft:.95,disp:36,propCount:1,resistance:"",
  trialSpeed:"",trialPower:"",drive:"diesel",power:129.98,powerUnit:"hp",rpm:2400,ratio:2,speed:9.4/MPH_PER_KNOT,
  hull:"auto",wake:.25,blades:4,ear:.69,water:1025,existingD:22,existingP:16,curveCruiseRPM:849,curveCruiseMph:3.5,thrustDeduct:15};
 for(const [id,value] of Object.entries(values)){const el=$(id);if(el)el.value=String(value)}
 const comp=$("photoComparison");if(comp){comp.dataset.active="yes";comp.classList.remove("hidden")}
 $("checkTab")?.click();
 $("calculate")?.click();
 document.getElementById("curveReview")?.scrollIntoView?.({behavior:"smooth",block:"start"});
}
root.PropellerGraphs={render,benchmark};
})(globalThis);