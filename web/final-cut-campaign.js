import {readRecord,patchRecord} from './preference-store.js';
import {earnedMastery,evidenceItems} from './final-cut-outcome.js';
import {readStationReceipt} from './night-order-receipt.js';
export const FINAL_CAREER_KEY='rough-cut.final-cut-career.v1';
export function finaleEntry(route){
 const career=readRecord('rough-cut.career.v1'),drain=readRecord('rough-cut.under-green.v1'),chase=readRecord('rough-cut.back-nine.v1');
 const filed=Array.isArray(career.filedChangeRequests)?[...new Set(career.filedChangeRequests.filter(id=>typeof id==='string'))].slice(0,3):[];
 const groundskeeper=route==='drain'&&drain.evidence===true,crewLogs=route==='garage'&&Number.isInteger(chase.collected)&&chase.collected>=0?chase.collected&3:0;
 return {route:['garage','drain'].includes(route)?route:'direct',stationReceipt:readStationReceipt(route),priorEvidence:filed.length,evidenceVersion:2,loadLimit:false,groundskeeper,evidence:groundskeeper,crewLogs,branchRecord:crewLogs>0};
}
export function recordFinaleCompletion(run){
 if(!run.completed)return false;const previous=readRecord(FINAL_CAREER_KEY),routes=Array.isArray(previous.routes)?previous.routes.filter(r=>['garage','drain','direct'].includes(r)):[];
 const previousEarned=Array.isArray(previous.mastery)?previous.mastery:[],earned=earnedMastery(run);
 const changes={version:2,completed:true,lastRunId:run.runId,routes:[...new Set([...routes,run.route])],evidence:previous.evidence===true||run.evidence,priorEvidence:Math.max(Number(previous.priorEvidence)||0,run.priorEvidence),mastery:[...new Set([...previousEarned,...earned])],recordIds:[...new Set([...(Array.isArray(previous.recordIds)?previous.recordIds:[]),...evidenceItems(run).map(r=>r.id)])]};
 if(run.masteryEligible&&run.elapsed>0)changes.bestSeconds=Math.min(previous.version===2&&Number(previous.bestSeconds)>0?previous.bestSeconds:Infinity,run.elapsed);
 else if(previous.version!==2)changes.bestSeconds=null;
 return patchRecord(FINAL_CAREER_KEY,changes);
}
export function mountFinalCutLink(root,route){
 const link=document.createElement('a');link.id='continue-final-cut';link.href='./final-cut.html?from='+route;link.textContent='Continue to the Final Cut';link.hidden=true;root.prepend(link);
 return {update:completed=>{if(link.hidden===completed)link.hidden=!completed;},link};
}
