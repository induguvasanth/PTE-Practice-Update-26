(()=>{'use strict';
const CACHE='pte_all_question_counts_v31';
let data=null;
try{data=JSON.parse(localStorage.getItem(CACHE)||'null')}catch(e){}
const moduleNames={'Speaking & Writing':'Speaking & Writing','Reading':'Reading','Listening':'Listening','Grammar':'Grammar','Vocabulary':'Vocabulary'};
function get(){return data&&data.ok?data:null}
function counts(module,topic){const d=get();if(!d)return null;
 if(topic)return d.topics[module+'|'+topic]??null;
 return module?d.sections[module]??null:d.total;
}
function summary(module,topic){
 const sid=window.PTEAuth?.session()?.studentId||localStorage.getItem('pte_active_student_v4')||'';
 let rows=[];try{rows=JSON.parse(localStorage.getItem('pte_progress_v4')||'[]')}catch(e){}
 const unique=new Map();
 rows.filter(r=>r.studentId===sid&&r.finished).forEach(r=>{
  const part=String(r.item||'').split(' / ')[0];
  if(module&&r.module!==module)return;
  if(topic&&part!==topic)return;
  const key=r.module+'|'+r.item;
  const old=unique.get(key);if(!old||String(r.updatedAt||'')>String(old.updatedAt||''))unique.set(key,r);
 });
 const finished=[...unique.values()];const scores=finished.map(r=>r.score).filter(v=>v!==null&&v!==undefined&&v!=='').map(Number).filter(v=>Number.isFinite(v)&&v>=0&&v<=100);
 const total=counts(module,topic);
 return {done:finished.length,total,avg:scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1)+'%':'—'};
}
window.PTECounts={counts,summary,refresh:fetchCounts};
function notify(){window.dispatchEvent(new Event('pte:counts-updated'));window.PTEProgress?.refresh()}
function fetchCounts(){const api=window.API_URL||document.querySelector('script:not([src])')?.textContent?.match(/const API_URL\s*=\s*['"]([^'"]+)/)?.[1];
 if(!api)return;
 const cb='pte_counts_'+Date.now();const sc=document.createElement('script');const timer=setTimeout(()=>{delete window[cb];sc.remove()},20000);
 window[cb]=result=>{clearTimeout(timer);delete window[cb];sc.remove();if(result?.ok&&result.topics){data=result;try{localStorage.setItem(CACHE,JSON.stringify(data))}catch(e){}notify()}};
 sc.onerror=()=>{clearTimeout(timer);delete window[cb];sc.remove()};
 sc.src=api+'?action=progresscounts&callback='+cb+'&t='+Date.now();document.head.append(sc);
}
window.addEventListener('load',fetchCounts);
})();
