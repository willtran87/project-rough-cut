// End-of-chapter summary and best-run records, shared by all chapters. Records
// live in their own storage key; storage failure never blocks play.
import {readRecord,writeRecord} from './preference-store.js';
export const RECORDS_KEY='rough-cut.records.v1';
const clock=seconds=>{const s=Math.max(0,Math.round(seconds));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
export const formatSeconds=clock;

// stats: {seconds, closeCalls, route, difficulty, extras:{label:value}}.
// Returns {best, isBest, previousBest, runs} and stores the run. A run on an
// easier difficulty never replaces a best time set on a harder one.
const RANK={relaxed:0,standard:1,hard:2};
export function recordRun(chapter,stats,{now=()=>Date.now(),store=true}={}){
 const all=readRecord(RECORDS_KEY),entry=all[chapter]&&typeof all[chapter]==='object'?all[chapter]:{};
 const previousBest=entry.best&&Number.isFinite(entry.best.seconds)?entry.best:null;
 const run={seconds:Math.max(0,+stats.seconds||0),closeCalls:Math.max(0,stats.closeCalls|0),route:stats.route||'',difficulty:RANK[stats.difficulty]===undefined?'standard':stats.difficulty,at:now()};
 const rank=RANK[run.difficulty],bestRank=previousBest?RANK[previousBest.difficulty]??1:-1;
 const isBest=!previousBest||rank>bestRank||rank===bestRank&&run.seconds<previousBest.seconds;
 const next={runs:(entry.runs|0)+1,best:isBest?run:previousBest,found:entry.found||[]};
 if(store)writeRecord(RECORDS_KEY,{...all,[chapter]:next});
 return {best:next.best,isBest,previousBest,runs:next.runs};
}
export function chapterRecord(chapter){const e=readRecord(RECORDS_KEY)[chapter];return e&&typeof e==='object'?e:{runs:0,best:null,found:[]};}

// Optional discoveries (secrets, alternate routes). Returns true the first time.
export function markFound(chapter,id){
 const all=readRecord(RECORDS_KEY),entry=all[chapter]&&typeof all[chapter]==='object'?all[chapter]:{runs:0,best:null};
 const found=Array.isArray(entry.found)?entry.found:[];if(found.includes(id))return false;
 writeRecord(RECORDS_KEY,{...all,[chapter]:{...entry,found:[...found,id]}});return true;
}
export function foundIn(chapter){const f=chapterRecord(chapter).found;return Array.isArray(f)?f:[];}

// Rows for the summary panel: [label, value] pairs in display order.
export function summaryRows(stats,result,{total=0,found=0}={}){
 const rows=[['Time',clock(stats.seconds)]];
 if(result.previousBest)rows.push(['Best',clock(result.best.seconds)+(result.isBest?' · new best':'')]);
 else rows.push(['Best','First finish']);
 rows.push(['Close calls',String(stats.closeCalls|0)]);
 if(stats.route)rows.push(['Route',stats.route]);
 for(const [label,value]of Object.entries(stats.extras||{}))rows.push([label,String(value)]);
 if(total)rows.push(['Discoveries',`${found} of ${total}`]);
 if(stats.difficulty&&stats.difficulty!=='standard')rows.push(['Difficulty',stats.difficulty[0].toUpperCase()+stats.difficulty.slice(1)]);
 return rows;
}
// Fills (or creates) a <dl class="run-summary"> inside container.
export function renderSummary(container,rows,{title='Run summary'}={}){
 let list=container.querySelector('dl.run-summary');
 if(!list){list=document.createElement('dl');list.className='run-summary';list.setAttribute('aria-label',title);container.append(list);}
 list.replaceChildren(...rows.flatMap(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;return [dt,dd];}));
 list.hidden=false;return list;
}
