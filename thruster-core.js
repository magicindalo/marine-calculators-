(function(root){
"use strict";
const catalogue={
 std:"https://webshop.vetus.com/en/products/thruster-systems/bow-and-stern-thrusters/standard-dc-thrusters",
 pro:"https://webshop.vetus.com/en/products/thruster-systems/bow-and-stern-thrusters/bow-pro-thrusters/",
 ip:"https://webshop.vetus.com/en/products/thruster-systems/bow-and-stern-thrusters/ignition-protected-thrusters"
};
// DATA: official VETUS webshop category/product pages, checked October 2026.
// supply is the *charging/source system* on boosted models; boosted motors
// require a separate higher-voltage thruster battery bank.
const catalog=[
 ["BOW2512E",25,110,"standard",12,12,0],
 ["BOW3512F",35,125,"standard",12,12,0],
 ["BOW4012",40,140,"standard",12,12,0],
 ["BOW4512D",45,125,"standard",12,12,0],
 ["BOW5512D",55,150,"standard",12,12,0],
 ["BOW5524D",60,150,"standard",24,24,0],
 ["BOW6012D",60,185,"standard",12,12,0],
 ["BOW6024D",70,185,"standard",24,24,0],
 ["BOW7512D",75,185,"standard",12,12,0],
 ["BOW7524D",85,185,"standard",24,24,0],
 ["BOW9512D",95,185,"standard",12,12,0],
 ["BOW9524D",105,185,"standard",24,24,0],
 ["BOW12512D",125,250,"standard",12,12,0],
 ["BOW12524D",140,250,"standard",24,24,0],
 ["BOW16024D",160,250,"standard",24,24,0],
 ["BOW18024D",180,250,"standard",24,24,0],
 ["BOW22024D",220,300,"standard",24,24,0],
 ["BOWA0301",30,110,"pro",12,12,0],
 ["BOWA0304",30,110,"pro",48,48,0],
 ["BOWA0361",36,125,"pro",12,12,0],
 ["BOWA0364",36,125,"pro",48,48,0],
 ["BOWA0401",40,140,"pro",12,12,0],
 ["BOWA0421",42,125,"pro",12,12,0],
 ["BOWA0571",57,150,"pro",12,12,0],
 ["BOWA0574",57,150,"pro",48,48,0],
 ["BOWA0651",65,185,"pro",12,12,0],
 ["BOWA0761",76,185,"pro",12,12,0],
 ["BOWA0764",76,185,"pro",48,48,0],
 ["BOWB057",57,150,"boosted",12,24,1],
 ["BOWB065",65,185,"boosted",12,24,1],
 ["BOWB076",76,185,"boosted",12,24,1],
 ["BOWB090",90,185,"boosted",12,24,1],
 ["BOWB110",110,185,"boosted",12,24,1],
 ["BOWB130",130,185,"boosted",12,24,1],
 ["BOWB150",150,250,"boosted",12,24,1],
 ["BOWB180",180,250,"boosted",24,48,1],
 ["BOWB210",210,250,"boosted",24,48,1],
 ["BOWB285",285,300,"boosted",24,48,1],
 ["BOWB300",300,300,"boosted",24,48,1],
 ["BOWB320",320,300,"boosted",24,48,1],
 ["BOWB385",385,400,"boosted",24,48,1],
 ["BOWB420",420,400,"boosted",24,48,1],
 ["BOW2512EI",25,110,"ignition",12,12,0],
 ["BOW3512FI",35,125,"ignition",12,12,0],
 ["BOW3512EI",35,150,"ignition",12,12,0],
 ["BOW4512DI",45,125,"ignition",12,12,0],
 ["BOW5512DI",55,150,"ignition",12,12,0],
 ["BOW5524DI",55,150,"ignition",24,24,0],
 ["BOW7512DI",75,185,"ignition",12,12,0],
 ["BOW9512DI",95,185,"ignition",12,12,0],
 ["BOW7524DI",75,185,"ignition",24,24,0],
 ["BOW1252DI",125,250,"ignition",12,12,0],
 ["BOW1254DI",125,250,"ignition",24,24,0],
 ["BOW1604DI",160,250,"ignition",24,24,0]
].map(([sku,kgf,tunnel,family,sourceV,motorV,boosted])=>({
 sku,kgf,tunnel,family,sourceV,motorV,boosted:!!boosted,
 proportional:family==="pro"||family==="boosted",
 ignitionProtected:family==="ignition",
 url:catalogue[family==="standard"?"std":family==="ignition"?"ip":"pro"]
}));
// VETUS published approximate vessel-length guidance (m), not force limits.
const lengths={
 BOW2512E:[0,7],BOW3512F:[6,10],BOW4012:[8,10.5],BOW4512D:[8,11.5],
 BOW5512D:[8,12],BOW5524D:[8,12],BOW6012D:[8,12.5],BOW6024D:[8,12.5],
 BOW7512D:[10,14],BOW7524D:[10,14],BOW9512D:[11.5,17],BOW9524D:[11.5,17],
 BOW12512D:[12.5,18],BOW12524D:[12.5,18],BOW16024D:[15,20],BOW18024D:[14,22],BOW22024D:[16,22],
 BOWA0301:[0,7],BOWA0304:[0,7],BOWA0361:[6,10],BOWA0364:[6,10],BOWA0401:[7,11],
 BOWA0421:[8,11.5],BOWA0571:[8,12],BOWA0574:[8,12],BOWA0651:[8,12.5],BOWA0761:[10,14],BOWA0764:[10,14],
 BOWB057:[8,12],BOWB065:[8,12.5],BOWB076:[10,14],BOWB090:[11.5,17],
 BOWB110:[11.5,18],BOWB130:[12.5,18],BOWB150:[12.5,18],
 BOWB180:[15,20],BOWB210:[16,22],BOWB285:[16,22],BOWB300:[25,30],
 BOWB320:[25,32],BOWB385:[30,35],BOWB420:[33,40]
};
catalog.forEach(m=>{m.lengthGuide=lengths[m.sku]||null});
const officialProducts={
 BOW2512E:"https://webshop.vetus.com/en/product/bow-thruster-25-kgf-12-v-110-mm-tunnel",
 BOW3512F:"https://webshop.vetus.com/en/product/bow-thruster-35-kgf-12-v-125-mm-tunnel",
 BOW5512D:"https://webshop.vetus.com/en/product/bow-thruster-55-kgf-12-v-150-mm-tunnel",
 BOW6012D:"https://webshop.vetus.com/en/product/bow-thruster-65-kgf-12-v-185-mm-tunnel",
 BOW9512D:"https://webshop.vetus.com/en/product/bow-thruster-95-kgf-12-v-185-mm-tunnel",
 BOW12512D:"https://webshop.vetus.com/en/product/bow-thruster-125-kgf-12-v-250-mm-tunnel",
 BOW16024D:"https://webshop.vetus.com/en/product/bow-thruster-160-kgf-24-v-250-mm-tunnel",
 BOW22024D:"https://webshop.vetus.com/en/product/bow-thruster-220-kgf-24-v-300-mm-tunnel",
 BOWA0364:"https://webshop.vetus.com/en/product/bow-pro-thruster-36-kgf-48-v-125-mm-tunnel",
 BOWA0421:"https://webshop.vetus.com/en/product/bow-pro-thruster-42-kgf-12-v-125-mm-tunnel",
 BOWA0304:"https://webshop.vetus.com/en/product/bow-pro-thruster-30-kgf-48-v-110-mm-tunnel",
 BOWA0764:"https://webshop.vetus.com/en/product/bow-pro-thruster-76-kgf-48-v-185-mm-tunnel",
 BOWB065:"https://webshop.vetus.com/en/product/bow-pro-boosted-thruster-65-kgf-12-24-v-185-mm-tunnel",
 BOWB076:"https://webshop.vetus.com/en/product/bow-pro-boosted-thruster-76-kgf-12-24-v-185-mm-tunnel",
 BOWB110:"https://webshop.vetus.com/en/product/bow-pro-boosted-thruster-110-kgf-12-24-v-185-mm-tunnel",
 BOW2512EI:"https://webshop.vetus.com/en/product/bow2512ei-bow-thruster-25kgf-12v-tunnel-110mm-ip",
 BOW5512DI:"https://webshop.vetus.com/en/product/bow5512di-bow-thruster-55kgf",
 BOW5524DI:"https://webshop.vetus.com/en/product/bow5524di-bow-thruster-55kgf"
};
catalog.forEach(m=>{if(officialProducts[m.sku])m.url=officialProducts[m.sku]});
const conflictingRatings={BOW6012D:"VETUS product heading says 65 kgf while description says 60 kgf; the tool uses the conservative 60 kgf and requires datasheet confirmation.",BOW5524DI:"VETUS product heading says 55 kgf while detailed specifications say 60 kgf; the tool uses the conservative 55 kgf pending order-stage confirmation."};
catalog.forEach(m=>{if(conflictingRatings[m.sku])m.ratingNote=conflictingRatings[m.sku]});
const pressure={4:{low:20,high:40,typ:30,label:"Moderate breeze"},5:{low:41,high:74,typ:60,label:"Fresh breeze"},6:{low:75,high:123,typ:100,label:"Strong breeze"},7:{low:125,high:189,typ:157,label:"Near gale"},8:{low:191,high:276,typ:234,label:"Gale"}};
function n(v,def=0){if(v===null||v===undefined||String(v).trim()==="")return def;const a=Number(v);return Number.isFinite(a)?a:def}
function safe(v,a,b){return Math.max(a,Math.min(b,v))}
function calculate(i){
 const v=i||{},length=n(v.length,0),area=n(v.area,0),bft=String(v.beaufort||"5"),windMode=v.windMode||"beaufort";
 const pressureN=windMode==="speed"?.64*n(v.windMS,0)**2:windMode==="pressure"?n(v.pressureN,0):(pressure[bft]?.typ||0);
 const shape=safe(n(v.shape,0.75),.25,1);
 const margin=safe(n(v.margin,0)/100,0,1);
 const center=n(v.centerArm,0)>0?n(v.centerArm):length*.5;
 const bowLever=n(v.bowLever,0)>0?n(v.bowLever):length*.95;
 const sternLever=n(v.sternLever,0)>0?n(v.sternLever):length*.95;
 const side=v.side||"bow";
 const currentFactor=1+safe(n(v.currentAllowance,0)/100,0,1);
 const moment=pressureN*area*shape*center;
 const windForce=pressureN*area*shape;
 const designFactor=(1+margin)*currentFactor;
 const bowN=bowLever>0?moment/bowLever:0,sternN=sternLever>0?moment/sternLever:0;
 const selected=side==="both"?["bow","stern"]:side==="stern"?["stern"]:["bow"];
 const requirements=selected.map(k=>({side:k,lever:k==="bow"?bowLever:sternLever,nominalN:k==="bow"?bowN:sternN,
 requiredN:(k==="bow"?bowN:sternN)*designFactor,requiredKGF:(k==="bow"?bowN:sternN)*designFactor/9.80665}));
 const voltage=n(v.voltage,12),family=v.family||"all",tunnel=n(v.tunnel,0);
 const ignition=String(v.ignition||"no")==="yes";
 const compat=catalog.filter(m=>m.sourceV===voltage&&(!tunnel||m.tunnel===tunnel)&&(
 ignition?m.ignitionProtected:family==="all"?!m.ignitionProtected:family==="pro"?m.family==="pro"||m.family==="boosted":m.family===family
 ));
 const recommendations=requirements.map(r=>{
  const sufficient=compat.filter(m=>m.kgf>=r.requiredKGF);
  sufficient.sort((a,b)=>a.kgf-b.kgf||((a.family==="pro"||a.family==="boosted")?-1:1));
  const closest=sufficient.length?sufficient[0].kgf:0;
  const top=compat.filter(m=>m.kgf>=r.requiredKGF&&m.kgf<=closest*2.2).sort((a,b)=>{
    const da=a.kgf-r.requiredKGF,db=b.kgf-r.requiredKGF;
    return da-db||Number(b.proportional)-Number(a.proportional);
  }).slice(0,5);
  if(!top.length&&compat.length){const largest=[...compat].sort((a,b)=>b.kgf-a.kgf)[0];return {...r,models:[],closestBelow:largest};}
  return {...r,models:top,closestBelow:null};
 });
 const errors=[];
 if(!(length>=2&&length<=80))errors.push("Enter an overall vessel length between 2 and 80 metres.");
 if(!(area>0&&area<=1200))errors.push("Enter the lateral windage area in square metres (side-on area above water).");
 if(!(pressureN>0&&pressureN<2000))errors.push("Enter a valid design wind pressure or wind speed.");
 if(center<=0||bowLever<=0||sternLever<=0)errors.push("The wind and thruster lever arms must be positive.");
 if(center>length||bowLever>length||sternLever>length)errors.push("A lever arm cannot exceed the vessel's overall length.");
 if(![12,24,48].includes(voltage))errors.push("Choose a 12 V, 24 V or 48 V supply.");
 const notes=[
 "VETUS catalogue pp. 220-221: windage area × pressure × 0.75 factor × turning arm, divided by thruster lever arm.",
 "Manufacturer boat-length recommendations are broad guidance; calculated thrust is the main ranking input.",
 "This is a static crosswind screening calculation, not a dynamic manoeuvring simulation. Current loads are not calculated from hull drag.",
 "Verify installation depth, aperture and tunnel geometry, rated thrust, cable voltage drop, batteries and duty-cycle limits before choosing a model."
 ];
 if(ignition)notes.push("Ignition protection requested: only ignition-protected models are considered. Confirm applicable rules and the complete installation.");
 if(voltage===48)notes.push("Only verified 48 V-class BOW PRO models are shown for a direct 48 V supply. Boosted 24/48 V models need a separate 48 V thruster bank charged from 24 V and are not treated as direct 48 V equivalents.");
 if(compat.some(m=>m.boosted))notes.push("BOW PRO Boosted: 12/24 V uses a 12 V charging source with a dedicated 24 V thruster bank; 24/48 V uses 24 V charging source with a dedicated 48 V thruster bank.");
 if(v.side==="stern"||v.side==="both")notes.push("VETUS indicates a stern thruster may often be one model smaller as a rule of thumb; this tool independently screens the specified stern lever arm instead.");
 if(margin>0||n(v.currentAllowance,0)>0)notes.push("The design reserve/current allowance is a user-entered safety factor; no hydrodynamic current force was calculated.");
 return {valid:!errors.length,errors,notes,length,area,beaufort:bft,windMode,pressureN,shape,windForce,moment,center,
  bowLever,sternLever,designFactor,requirements,recommendations,modelsAvailable:compat.length,
  sourceVoltage:voltage,family,tunnel,ignition};
}
root.ThrusterCalc={catalog,pressure,calculate,catalogSources:catalogue};
})(globalThis);