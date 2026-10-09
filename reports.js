(function () {
"use strict";
const KEY="marine-calculators.saved-projects.v1";
const $=id=>document.getElementById(id);
const str=v=>String(v??"");
const clean=v=>str(v).replace(/[\u0000-\u001F\u007F]/g," ").trim();
const filename=s=>clean(s).replace(/[^a-z0-9_-]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,55)||"marine-report";
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x:[]}catch(e){return []}};
const write=x=>localStorage.setItem(KEY,JSON.stringify(x));
const text=(t,max)=>clean(t).replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u2013\u2014]/g,"-").replace(/\u00D7/g," x ").replace(/\u00B0/g," deg").replace(/\u00B2/g,"2").replace(/[\u00B3]/g,"3").replace(/\u03C6/g,"phi").replace(/\u00B5/g,"u").replace(/\u2264/g,"<=").replace(/\u2265/g,">=").normalize("NFKD").replace(/[^\x20-\x7E]/g,"").slice(0,max||2000);
const enc=new TextEncoder();
const formatPDF = report=>{
  const W=595.28,H=841.89,M=42,R=W-M,usable=R-M;
  let pages=[],ops=[],y=0,page=0;
  const fmt=n=>Number.isFinite(n)?n.toFixed(2):"0";
  const literal=v=>"("+text(v).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")+")";
  function fill(r,g,b){ops.push(fmt(r)+" "+fmt(g)+" "+fmt(b)+" rg");}
  function rect(x,yy,w,h,r,g,b){fill(r,g,b);ops.push([fmt(x),fmt(yy),fmt(w),fmt(h),"re f"].join(" "));}
  function line(x1,y1,x2,y2,r=.83,g=.87,b=.9){ops.push(fmt(r)+" "+fmt(g)+" "+fmt(b)+" RG "+fmt(x1)+" "+fmt(y1)+" m "+fmt(x2)+" "+fmt(y2)+" l S");}
  function draw(t,x,yy,size=9,bold=false,color=[.10,.19,.27]){
    t=text(t);if(!t)return;fill(...color);ops.push("BT /"+(bold?"F2":"F1")+" "+fmt(size)+" Tf 1 0 0 1 "+fmt(x)+" "+fmt(yy)+" Tm "+literal(t)+" Tj ET");
  }
  function wrap(s,max){const words=text(s).split(/\s+/),rows=[];let row="";
    for(const word of words){if(!word)continue;if(word.length>max){if(row){rows.push(row);row=""}for(let i=0;i<word.length;i+=max)rows.push(word.slice(i,i+max));continue}
      if((row+" "+word).trim().length>max){rows.push(row);row=word}else row=(row+" "+word).trim()}
    if(row)rows.push(row);return rows.length?rows:[""];
  }
  function header(){rect(0,H-104,W,104,.055,.17,.25);rect(0,H-108,W,4,.11,.72,.78);
    draw("INDALO MARINE CALCULATORS  /  ENGINEERING REPORT",M,H-36,10,true,[.56,.85,.9]);
    draw(report.title||"Engineering Report",M,H-65,19,true,[1,1,1]);
    draw((report.subtitle||"")+"  |  "+new Date().toLocaleDateString("en-GB"),M,H-87,9,false,[.82,.88,.92]);
    y=H-135;
  }
  function footer(){line(M,44,R,44);draw("INDALO MARINE  /  PRELIMINARY ENGINEERING ESTIMATE  -  verify before specification",M,29,6.7,false,[.42,.49,.56]);draw("Page "+page,R-43,29,7,false,[.42,.49,.56]);}
  function next(){if(page){footer();pages.push(ops.join("\n"));ops=[]}page++;header();}
  function need(h){if(y-h<63)next();}
  function title(t){need(39);rect(M,y-25,usable,26,.90,.95,.97);draw(t.toUpperCase(),M+9,y-17,10,true,[.07,.26,.38]);y-=37;}
  function kvRows(rows){for(const item of rows){const [k,v]=item;const vals=wrap(str(v),62);const h=Math.max(23,vals.length*11+10);need(h+2);
      draw(k,M+3,y-13,8.2,true,[.28,.37,.43]);vals.forEach((v,i)=>draw(v,M+191,y-13-i*11,8.4,false,[.10,.19,.27]));line(M,y-h,R,y-h);y-=h;}
    y-=10;}
  function metrics(rows){const n=Math.min(4,rows.length);const width=(usable-(n-1)*8)/n;need(80);
    rows.slice(0,n).forEach(([k,v],i)=>{const x=M+i*(width+8);rect(x,y-65,width,65,.94,.97,.98);
      wrap(k,Math.floor(width/6.4)).slice(0,2).forEach((s,j)=>draw(s,x+9,y-13-j*11,7.7,true,[.35,.42,.47]));
      draw(text(v,25),x+9,y-49,15,true,[.03,.31,.44]);});y-=82;}
  function prose(lines){for(const para of lines){for(const s of wrap(para,98)){need(15);draw(s,M+2,y-10,8.4,false,[.21,.27,.33]);y-=13}y-=8}}
  function table(cols,rows){const sum=cols.reduce((a,c)=>a+c[1],0),scale=usable/sum;
    const widths=cols.map(c=>c[1]*scale);
    function tableHead(){need(37);rect(M,y-26,usable,28,.12,.31,.43);let x=M+5;
      cols.forEach((c,i)=>{draw(c[0],x,y-17,7.7,true,[1,1,1]);x+=widths[i]});y-=28;}
    tableHead();
    rows.forEach((r,ri)=>{
      const columns=r.map((v,i)=>wrap(str(v),Math.max(5,Math.floor((widths[i]-10)/4.35))));
      const lines=Math.max(1,...columns.map(a=>a.length));const h=Math.max(25,lines*11+10);
      if(y-h<63){next();tableHead();}
      need(h);
      if(ri%2===0)rect(M,y-h,usable,h,.96,.98,.99);
      let x=M+5;columns.forEach((group,i)=>{group.forEach((t,j)=>draw(t,x,y-13-j*10,7.7,false,[.10,.20,.29]));x+=widths[i]});
      line(M,y-h,R,y-h,.86,.90,.92);y-=h;
    });
    y-=13;}
  next();
  if(report.metrics&&report.metrics.length)metrics(report.metrics);
  for(const sec of report.sections||[]){title(sec.title);if(sec.rows)kvRows(sec.rows);if(sec.table)table(sec.table.columns,sec.table.rows);if(sec.paragraphs)prose(sec.paragraphs);}
  footer();pages.push(ops.join("\n"));
  const objects=[""];
  const add=o=>{objects.push(o);return objects.length-1};
  const root=add(""),pagesIndex=add(""),f1=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),f2=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const kids=[];
  pages.forEach(p=>{
    const content=enc.encode(p+"\n");
    const stream=add("<< /Length "+content.length+" >>\nstream\n"+p+"\nendstream");
    const id=add("<< /Type /Page /Parent "+pagesIndex+" 0 R /MediaBox [0 0 "+fmt(W)+" "+fmt(H)+"] /Resources << /Font << /F1 "+f1+" 0 R /F2 "+f2+" 0 R >> >> /Contents "+stream+" 0 R >>");
    kids.push(id+" 0 R");
  });
  objects[root]="<< /Type /Catalog /Pages "+pagesIndex+" 0 R >>";
  objects[pagesIndex]="<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+kids.length+" >>";
  const segments=["%PDF-1.4\n%MARINE\n"],offsets=[0];let current=enc.encode(segments[0]).length;
  for(let i=1;i<objects.length;i++){offsets[i]=current;const block=i+" 0 obj\n"+objects[i]+"\nendobj\n";segments.push(block);current+=enc.encode(block).length;}
  const startxref=current;
  const xref="xref\n0 "+objects.length+"\n0000000000 65535 f \n"+offsets.slice(1).map(n=>String(n).padStart(10,"0")+" 00000 n \n").join("")+"trailer\n<< /Size "+objects.length+" /Root "+root+" 0 R >>\nstartxref\n"+startxref+"\n%%EOF\n";
  segments.push(xref);
  return new Blob(segments,{type:"application/pdf"});
};
function download(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function init(options){
  const config=options||{},kind=config.kind;
  if(!kind||typeof config.getState!=="function"||typeof config.setState!=="function"||typeof config.report!=="function")throw Error("Invalid report setup");
  const host=document.getElementById("projectTools");
  if(!host)throw Error("Missing project toolbar");
  host.innerHTML='<style>.projectBar{display:flex;gap:8px;flex-wrap:wrap}.projectBar button{flex:1 1 115px;min-height:46px;border:1px solid #2c6078;border-radius:11px;background:#124057;color:#f2fcff;font-weight:750;padding:9px}.projectBar .pdf{background:#24bdd5;color:#032731;border:0}.projectBar .projectLabel{width:100%;font-size:12px;color:#a5c2d0}.savedItems{display:grid;gap:8px;max-height:55vh;overflow-y:auto}.savedRow{display:flex;gap:8px;align-items:center;justify-content:space-between;border-bottom:1px solid #2c6078;padding:8px 0}.savedRow span{flex:1;min-width:0;font-size:14px;overflow-wrap:anywhere}.savedRow button{min-height:42px;border:1px solid #2c6078;border-radius:9px;background:#10354c;color:white;padding:6px 10px}.savedDialog{background:#0b2738;border:1px solid #2c6078;color:#edf9ff;border-radius:16px;padding:16px;width:min(94%,540px)}.savedDialog::backdrop{background:#000a}</style>'+
    '<div class="projectBar"><div class="projectLabel" id="activeProject">Unsaved project</div><button id="projSave" type="button">Save project</button><button id="projOpen" type="button">Open saved</button><button class="pdf" id="projPdf" type="button">Save PDF report</button></div>'+
    '<dialog id="projDialog" class="savedDialog"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:10px"><strong>Saved '+(kind==="propeller"?"vessels":kind==="battery"?"battery systems":kind==="thruster"?"thruster selections":kind==="exhaust"?"exhaust systems":kind==="cable"?"cable projects":kind==="engine"?"engine selections":"load projects")+'</strong><button id="projClose" type="button" style="min-height:44px;border-radius:9px;background:#124057;border:1px solid #2c6078;color:#fff">Close</button></div><div class="savedItems" id="projItems"></div></dialog>';
  let active=null;
  const label=t=>{const el=$("activeProject");if(el)el.textContent=t};
  const open=()=>{$("projItems").replaceChildren();const records=read().filter(x=>x.kind===kind).sort((a,b)=>b.saved.localeCompare(a.saved));
    if(!records.length)$("projItems").textContent="No saved projects yet. Save your first calculation.";
    for(const rec of records){
      const row=document.createElement("div");row.className="savedRow";
      const name=document.createElement("span");name.textContent=rec.name+"  ·  "+new Date(rec.saved).toLocaleDateString("en-GB");
      const load=document.createElement("button");load.textContent="Open";load.onclick=()=>{try{config.setState(rec.payload);active=rec.id;label("Opened: "+rec.name);$("projDialog").close()}catch(e){alert("Could not open this project: "+e.message)}};
      const del=document.createElement("button");del.textContent="Delete";del.onclick=()=>{if(!confirm("Delete saved project '"+rec.name+"'?"))return;write(read().filter(x=>x.id!==rec.id));if(active===rec.id){active=null;label("Unsaved project")}openItems()};
      row.append(name,load,del);$("projItems").appendChild(row);
    }
    $("projDialog").showModal();
  };
  function openItems(){$("projDialog").close();open();}
  $("projOpen").onclick=open;
  $("projClose").onclick=()=>$("projDialog").close();
  $("projSave").onclick=()=>{
    const existing=read().find(x=>x.id===active);
    const suggested=existing?.name||config.suggestName?.()||"New marine project";
    const name=prompt("Project name",suggested);
    if(name===null)return;
    const trimmed=clean(name).slice(0,90);
    if(!trimmed){alert("Enter a project name.");return;}
    const items=read();
    const clash=items.find(x=>x.kind===kind&&x.name.toLowerCase()===trimmed.toLowerCase());
    if(clash&&clash.id!==active&&!confirm("Replace existing saved project named '"+clash.name+"'?"))return;
    const id=clash?.id||((existing&&existing.name.toLowerCase()===trimmed.toLowerCase())?active:null)||"p_"+Date.now()+"_"+Math.random().toString(36).slice(2,8);
    const entry={id,kind,name:trimmed,saved:new Date().toISOString(),payload:config.getState()};
    const filtered=items.filter(x=>x.id!==id);
    try{write([...filtered,entry]);active=id;label("Saved: "+trimmed);alert("Project saved on this device. For a backup, export a copy or PDF.")}catch(e){alert("Unable to save on this device: "+e.message)}
  };
  $("projPdf").onclick=()=>{
    let report;
    try{report=config.report()}catch(e){alert("Unable to create report: "+e.message);return;}
    if(!report||!report.sections){alert("Please run the calculation before exporting.");return;}
    try{download(formatPDF(report),filename(report.filename||config.suggestName?.()||kind)+"-report.pdf");label("PDF report generated - check Safari Downloads / Files");}
    catch(e){alert("Unable to create PDF: "+e.message);}
  };
}
globalThis.MarineReports={init,formatPDF};
})();
