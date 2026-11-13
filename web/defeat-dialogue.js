// Complete authored lines, not interchangeable sentence fragments. Both
// Back Nine retries/reloads share history and cannot immediately repeat a quote.
export const DEFEAT_LINES={
 general:[
  ['The lawn has requested a retrospective.','It would like to know why you stopped moving.'],
  ['Your claim has reached the correct department.','Please remain beneath the grass.'],
  ['I asked for a minimum viable escape.','You delivered a very small divot.'],
  ['The scorecard says you are still playing.','The roots insist on another hole.'],
  ['There is no vacancy on the roadmap.','I have made room in the rough.'],
  ['The underwriter wanted proof of loss.','I showed them the fairway.'],
  ['Stand-up is cancelled.','The lawn prefers everyone horizontal.'],
  ['You may appeal to the stakeholders.','They are the things moving under the green.']
 ],
 objectives:[
  ['You finished a task. How inconvenient.','I have added one dependency: me.'],
  ['Your checklist is immaculate.','The beneficiary is still the lawn.'],
  ['I saw your progress on the dashboard.','So did everything beneath it.'],
  ['Completed tasks do not confer immunity.','Read the roots in the small print.'],
  ['A useful increment. Thank you.','The fairway will retain your contribution.'],
  ['You made the numbers turn green.','Now join them.']
 ],
 near_exit:[
  ['You could see the exit.','I classified that as a preview feature.'],
  ['One step from release.','The lawn requested a last-minute change.'],
  ['The door was within your coverage area.','Survival was an optional rider.'],
  ['You reached the final green.','I never concede the last putt.'],
  ['I heard you planning the next sprint.','We have not finished this one.'],
  ['So close to the clubhouse.','The roots reached the threshold first.']
 ],
 shortcut:[
  ['That gap was a feature, not a defect.','I wanted to see which way you would run.'],
  ['You found an uninsured route.','I added the exclusion while you were taking it.'],
  ['A clever shortcut through the backlog.','The lawn has reopened every ticket.'],
  ['You saved several seconds.','I have invested them in the next cut.'],
  ['The hedge filed a complaint about your shortcut.','I have personally resolved it.'],
  ['You took a mulligan in production.','The scorekeeper lives under the turf.']
 ],
 damage:[
  ['Your cart left a trail of deliverables.','The rough has claimed them all.'],
  ['The deductible was another body panel.','You have exceeded your coverage.'],
  ['Every dent was customer feedback.','I see you finally stopped objecting.'],
  ['The vehicle passed our impact review.','It failed to remain a vehicle.'],
  ['I found your release notes in the wheel well.','They were mostly screaming.'],
  ['The claims model predicted a total loss.','I dislike disappointing a model.']
 ],
 foot:[
  ['You abandoned the delivery vehicle.','The backlog learned to follow footprints.'],
  ['A sprint on foot. Very agile.','The mower remains on schedule.'],
  ['Your roadside assistance has arrived.','It is not here to assist you.'],
  ['The grass recorded every step.','I approved the final entry.'],
  ['You ran out of wheels before running out of scope.','That is a planning problem.'],
  ['The cart was only the first claim.','The lawn has opened a second.']
 ]
};
export function defeatContext(evidence={}){
 return evidence.nearExit?'near_exit':evidence.onFoot?'foot':evidence.shortcut?'shortcut':evidence.damage?'damage':evidence.objectives?'objectives':'general';
}
const KEY='rough-cut.defeat-dialogue.v1';
export function createDefeatPicker({storage,random=Math.random}={}){
 let history={};try{storage??=globalThis.localStorage;history=JSON.parse(storage?.getItem(KEY)||'{}')||{};}catch{}
 if(typeof history!=='object'||Array.isArray(history))history={};
 const bags=history.bags&&typeof history.bags==='object'&&!Array.isArray(history.bags)?history.bags:{};
 const selected=new WeakMap();
 return (run,evidence={})=>{
  if(selected.has(run))return selected.get(run);
  const key=defeatContext(evidence),pool=[...DEFEAT_LINES[key].map((lines,i)=>({id:key+'-'+i,lines})),...(key==='general'?[]:DEFEAT_LINES.general.map((lines,i)=>({id:'general-'+i,lines})))];
  const ids=pool.map(x=>x.id),valid=Array.isArray(bags[key])&&bags[key].every(id=>ids.includes(id))&&new Set(bags[key]).size===bags[key].length;
  let bag=valid?bags[key].slice():[];
  if(!bag.length||bag.length===1&&bag[0]===history.last){bag=ids.slice();for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
  if(bag.at(-1)===history.last){const i=bag.findIndex(id=>id!==history.last);[bag[i],bag[bag.length-1]]=[bag.at(-1),bag[i]];}
  const id=bag.pop(),item=pool.find(x=>x.id===id),index=ids.indexOf(id);
  const result={id:'defeat-'+id,lines:item.lines.slice(),tone:['CERTAIN','CRITICAL','DELIGHTED','COACHING','CALM','FINAL'][index%6],expression:index%6,context:key};
  history={bags:{...bags,[key]:bag},last:id};Object.assign(bags,history.bags);selected.set(run,result);
  try{storage?.setItem(KEY,JSON.stringify(history));}catch{}
  return result;
 };
}
