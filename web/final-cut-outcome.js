const count=v=>Math.max(0,Math.min(3,Math.floor(Number(v)||0)));
export const ROUTE_NAMES={garage:'The Back Nine · service garage',drain:'Under the Green · keeper’s sluice',direct:'Direct chapter entry'};
export function evidenceFields(saved={}){
 const modern=saved.evidenceVersion===2,groundskeeper=modern?saved.groundskeeper===true:saved.groundskeeper===true||(saved.route==='drain'&&saved.evidence===true);
 const loadLimit=modern?saved.loadLimit===true:saved.loadLimit===true||(saved.route!=='drain'&&saved.evidence===true);
 const crewLogs=Number.isInteger(saved.crewLogs)&&saved.crewLogs>=0?saved.crewLogs&3:0;
 return {evidenceVersion:2,groundskeeper,loadLimit,crewLogs,legacyCrew:saved.legacyCrew===true||(!crewLogs&&saved.branchRecord===true),evidence:groundskeeper||loadLimit};
}
export function evidenceItems(r){
 const items=[];
 if(r.loadLimit)items.push({id:'load-limit',title:'Tournament load-limit record',meaning:'The heavy rig entered turf explicitly marked unsafe when saturated.'});
 if(r.groundskeeper)items.push({id:'groundskeeper',title:'Groundskeeper’s drainage record',meaning:'The swale’s drainage problem and warning against heavy equipment were already documented.'});
 if(r.crewLogs&1)items.push({id:'crew-night-order',title:'Crew log · The last groundskeeper',meaning:'The groundskeeper identifies Joe as the author of the night order and describes staff names kept on his backlog.'});
 if(r.crewLogs&2)items.push({id:'crew-clubhouse',title:'Crew log · The empty clubhouse',meaning:'The crew recorded that the members had left while the lights and night work continued.'});
 if(r.legacyCrew)items.push({id:'crew-legacy',title:'Retained crew record',meaning:'An earlier crew record accompanies your statement; this older save does not identify its title.'});
 if(count(r.priorEvidence))items.push({id:'change-requests',title:`${count(r.priorEvidence)} filed Change Request${count(r.priorEvidence)===1?'':'s'}`,meaning:'The filed requests establish that unsafe pilot controls had been reported before the final round.'});
 return items;
}
export function finaleOutcome(r){
 const records=evidenceItems(r),documented=records.length>0;
 return {id:documented?'documented':'survived',title:documented?'The warnings survive':'Beyond the boundary',route:ROUTE_NAMES[r.route]||ROUTE_NAMES.direct,
  survival:'You reached the public road. The assignment is over.',
  aftermath:'At daybreak, the insurer suspends the turf-telemetry pilot and withdraws Joe’s course-control access. You hand in your badge and leave his team.',
  report:documented?'Your statement enters the incident file with the records you carried out. The review has more to work with than the wreckage.':'Your statement and the ruined machine trigger an inspection. Without recovered records, the earlier warnings remain undocumented.',
  records,art:'./assets/optimized/final-cut-story/06-public-road.webp',
  alt:'An employee lanyard on the safe public road; Joe and the disabled industrial mower remain behind a closed fence.'};
}
export const MASTERY=[
 {id:'unbroken',title:'Unbroken round',description:'Finish from arrival without a capture.',earned:r=>r.captures===0},
 {id:'borrowed-attention',title:'Borrowed attention',description:'Make Joe select a strip because of your golf ball, then escape.',earned:r=>r.stats.ballRedirects>0},
 {id:'read-the-wake',title:'Read the wake',description:'Cross all three fairways and escape without a capture or thrown ball.',earned:r=>r.captures===0&&r.stats.balls===0&&r.stats.crossings.length===3},
];
export function earnedMastery(r){return r.completed&&r.masteryEligible?MASTERY.filter(m=>m.earned(r)).map(m=>m.id):[];}
export function runFacts(r){return {id:r.runId,elapsed:r.elapsed,captures:r.captures,eligible:r.masteryEligible,balls:r.stats.balls,ballRedirects:r.stats.ballRedirects,crossings:[...r.stats.crossings]};}
export function restoreFacts(value,checkpoint){
 const valid=value&&typeof value==='object',nonnegative=v=>Number.isFinite(v)?Math.max(0,v):0;
 return {id:valid&&typeof value.id==='string'&&value.id.length<=100?value.id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,elapsed:valid?Math.min(604800,nonnegative(value.elapsed)):0,captures:valid?Math.floor(nonnegative(value.captures)):0,eligible:valid?value.eligible===true:checkpoint===0,balls:valid?Math.floor(nonnegative(value.balls)):0,ballRedirects:valid?Math.floor(nonnegative(value.ballRedirects)):0,crossings:valid&&Array.isArray(value.crossings)?[...new Set(value.crossings.filter(n=>[0,1,2].includes(n)))]:[]};
}
