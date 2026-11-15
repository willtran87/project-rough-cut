// Complete authored lines, not interchangeable sentence fragments. Both
// Chapter retries/reloads share history and cannot immediately repeat a quote.
export const DEFEAT_LINES={
 general:[
  ['The lawn has requested a retrospective.','It would like to know why you stopped moving.'],
  ['Your sprint has reached the final green.','Please remain beneath the grass.'],
  ['I asked for a minimum viable escape.','You delivered a very small divot.'],
  ['The scorecard says you are still playing.','The roots insist on another hole.'],
  ['There is no vacancy on the roadmap.','I have made room in the rough.'],
  ['The product owner wanted a delivery date.','I booked you into the next cut.'],
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
  ['You reached the edge of the release.','I moved the goalposts into the rough.'],
  ['You reached the final green.','I never concede the last putt.'],
  ['I heard you planning the next sprint.','We have not finished this one.'],
  ['So close to the clubhouse.','The roots reached the threshold first.']
 ],
 shortcut:[
  ['That gap was a feature, not a defect.','I wanted to see which way you would run.'],
  ['You found an unplanned route.','I grew a dependency across it.'],
  ['A clever shortcut through the backlog.','The lawn has reopened every ticket.'],
  ['You saved several seconds.','I have invested them in the next cut.'],
  ['The hedge filed a complaint about your shortcut.','I have personally resolved it.'],
  ['You took a mulligan in production.','The scorekeeper lives under the turf.']
 ],
 damage:[
  ['Your cart left a trail of deliverables.','The rough has claimed them all.'],
  ['Another body panel for the backlog.','We can trim that in the next sprint.'],
  ['Every dent was customer feedback.','I see you finally stopped objecting.'],
  ['The vehicle passed our impact review.','It failed to remain a vehicle.'],
  ['I found your release notes in the wheel well.','They were mostly screaming.'],
  ['The scorecard predicted a rough finish.','I always play through.']
 ],
 foot:[
  ['You abandoned the delivery vehicle.','The backlog learned to follow footprints.'],
  ['A sprint on foot. Very agile.','The mower remains on schedule.'],
  ['Your sprint review has arrived.','The mower has some cutting feedback.'],
  ['The grass recorded every step.','I approved the final entry.'],
  ['You ran out of wheels before running out of scope.','That is a planning problem.'],
  ['The cart was only the first deliverable.','The lawn has accepted the rest.']
 ]
};

export const CHAPTER_DEFEAT_LINES={
 'under-green':[
  ['You went beneath the green to avoid the cut.','I brought the scope down with me.'],
  ['The roots asked for a product owner.','I am very hands-on.'],
  ['Your escape had one outstanding dependency.','The scythe has resolved it.'],
  ['You found the drainage backlog.','Everything ends up down here eventually.'],
  ['Keep your head down through the swing.','A little late for that advice now.'],
  ['I reviewed your route through the roots.','We are cutting that branch.'],
  ['This is the maintenance window.','You were standing in it.'],
  ['There is no free drop below the green.','Play it where it lies.'],
  ['You wanted less machinery in the process.','I listened.'],
  ['The sluice can hold back water.','It cannot hold back the next review.'],
  ['The roots have accepted your contribution.','No further revisions are required.'],
  ['I promised a leaner cutting process.','One blade. No meetings.']
 ],
 'final-cut':[
  ['The final review is complete.','You did not meet the cut.'],
  ['Look at those championship stripes.','You finally fit the pattern.'],
  ['Your release had one remaining blocker.','I drove straight over it.'],
  ['We are trimming scope for the final delivery.','Hold still.'],
  ['The crowd wanted a clean finish.','The reels have obliged.'],
  ['You made it to the eighteenth.','I still own the green.'],
  ['That was your last mulligan.','I keep a very strict scorecard.'],
  ['I brought the roadmap to the final green.','It runs directly through you.'],
  ['The acceptance criteria were simple.','A perfectly level finish.'],
  ['You almost shipped.','The cutting bank found one more defect.'],
  ['The fairway needs a final pass.','You are on the agenda.'],
  ['We have reached the end of the backlog.','Time to mulch the evidence.']
 ]
};
export function defeatContext(evidence={}){
 return evidence.nearExit?'near_exit':evidence.onFoot?'foot':evidence.shortcut?'shortcut':evidence.damage?'damage':evidence.objectives?'objectives':'general';
}
const KEY='rough-cut.defeat-dialogue.v1';
export function createDefeatPicker({storage,random=Math.random,chapter='back-nine'}={}){
 const storageKey=chapter==='back-nine'?KEY:KEY+'.'+chapter;
 let history={};try{storage??=globalThis.localStorage;history=JSON.parse(storage?.getItem(storageKey)||'{}')||{};}catch{}
 if(typeof history!=='object'||Array.isArray(history))history={};
 const bags=history.bags&&typeof history.bags==='object'&&!Array.isArray(history.bags)?history.bags:{};
 const selected=new WeakMap();
 return (run,evidence={})=>{
  if(selected.has(run))return selected.get(run);
  const chapterPool=CHAPTER_DEFEAT_LINES[chapter],key=chapterPool?chapter:defeatContext(evidence),pool=chapterPool?chapterPool.map((lines,i)=>({id:key+'-'+i,lines})):[...DEFEAT_LINES[key].map((lines,i)=>({id:key+'-'+i,lines})),...(key==='general'?[]:DEFEAT_LINES.general.map((lines,i)=>({id:'general-'+i,lines})))];
  const ids=pool.map(x=>x.id),valid=Array.isArray(bags[key])&&bags[key].every(id=>ids.includes(id))&&new Set(bags[key]).size===bags[key].length;
  let bag=valid?bags[key].slice():[];
  if(!bag.length||bag.length===1&&bag[0]===history.last){bag=ids.slice();for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
  if(bag.at(-1)===history.last){const i=bag.findIndex(id=>id!==history.last);[bag[i],bag[bag.length-1]]=[bag.at(-1),bag[i]];}
  const id=bag.pop(),item=pool.find(x=>x.id===id),index=ids.indexOf(id);
  const result={id:'defeat-'+id,lines:item.lines.slice(),tone:['CERTAIN','CRITICAL','DELIGHTED','COACHING','CALM','FINAL'][index%6],expression:index%6,context:key};
  history={bags:{...bags,[key]:bag},last:id};Object.assign(bags,history.bags);selected.set(run,result);
  try{storage?.setItem(storageKey,JSON.stringify(history));}catch{}
  return result;
 };
}
