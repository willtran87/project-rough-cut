// Presentation only: selection never consumes the pursuit simulation's state.
export const JOE_STORY_CUES=[
 'JOE: “You left the review early. I still have questions.”',
 'JOE: “New route. Same acceptance criteria.”',
 'JOE: “I can see your exit. I haven’t accepted it.”'
];
export const JOE_LINES={
 yard:[
  'You left the review early. I still have questions.',
  'The grass keeps growing. So does your backlog.',
  'Every footprint is an open ticket. I follow up personally.',
  'The sprint goal is a clean fairway. You are still on it.',
  'I found your name in the clippings. Still assigned to me.',
  'The turf has accepted your weight. I have not accepted your departure.',
  'We agreed on one mowing line. Your detour needs refinement.',
  'The grass is listening. Give it your status update.',
  'Nothing leaves this backlog until I finish the cut.',
  'I gave the grass voting rights. Your release was rejected unanimously.',
  'The policy platform needs a beneficiary. I entered the lawn.',
  'I buried the sprint goal beneath the first tee. It keeps growing back.',
  'Every blade has a user story. Yours ends underneath them.',
  'The claims engine asked for a sacrifice. I called it a dependency.'
 ],
 range:[
  'New route. Same acceptance criteria.',
  'The dew records every deviation from the roadmap.',
  'Hide in the rough. I review the edge cases too.',
  'Bent grass is evidence. Your progress report omitted it.',
  'You call it cover. I call it unfinished scope.',
  'The fairway has dependencies. You are caught in one.',
  'I can refine a backlog by the sound of grass moving.',
  'That uncut strip was not an oversight. It was in the plan.',
  'Your route has changed. The grass still reports to me.',
  'The claims queue is full of divots. Something inside them keeps appealing.',
  'I taught the sprinkler your policy number. Listen when it starts.',
  'The fairway failed regression. It remembers where you used to be.',
  'I asked the rough for acceptance criteria. It described your shoes.',
  'The bunker swallowed the test team. Their coverage has never been better.'
 ],
 clubhouse:[
  'I can see your exit. I haven’t accepted it.',
  'The last strip is always the hardest to close.',
  'A trimmed fairway. An empty cart. Those are my acceptance criteria.',
  'Your sprint ends where my mowing line ends.',
  'You can see the clubhouse. I can see one remaining backlog item.',
  'The grass behind you is Done. Please stop creating more work.',
  'Every blade is accounted for. Your exit is the only exception.',
  'I saved your patch for the final review.',
  'The release boundary is marked in clippings. You are still inside it.',
  'The clubhouse is the demo environment. Nobody survives the production release.',
  'I put your escape in the policy exclusions. The grass approved the wording.',
  'The eighteenth hole has your employee number. I did not paint it there.',
  'The roots signed off. You are the last stakeholder still moving.',
  'Our claims platform only accepts one outcome. The mower makes the data fit.'
 ],
 hiding:[
  'The rough has gone quiet. Your ticket is still open.',
  'I lost the mowing line, not the sprint goal.',
  'Stay off the board. The grass still needs refinement.',
  'No status update from the rough. I can wait.',
  'An empty fairway is not evidence of completion.',
  'The grass stopped answering stand-up. I suspect collusion.',
  'Hide in the rough. I filed a discovery spike with the worms.',
  'The claims dashboard says missing. The lawn says pending.',
  'I have asked the roots to reproduce the missing-customer defect.',
  'No footsteps. No telemetry. The grass is withholding evidence again.'
 ],
 shortcut:[
  'An unplanned cut. We will review that deviation.',
  'You found a gap in the hedge, not in the acceptance criteria.',
  'That shortcut leaves uncut scope behind you.',
  'You changed the mowing line without updating the roadmap.',
  'A smaller gap. The same outstanding deliverable.',
  'An uninsured shortcut. I will add the exclusion after the incident.',
  'You cut the hedge out of the review. It has lodged a complaint.',
  'A mulligan in production? The turf wants a formal explanation.',
  'The roadmap has roots. They do not recognize your little exception.',
  'That gap failed compliance. I will close it with the next thing through.'
 ],
 damage:[
  'Loose panels in the grass. Your release is coming apart.',
  'The fairway has your bodywork. I have your defect report.',
  'That rattle was not in the acceptance criteria.',
  'Another piece in the clippings. Another item for refinement.',
  'Your delivery vehicle is shedding scope across my lawn.',
  'The claims demo needed impact data. Thank you for volunteering the cart.',
  'Metal in the clippings. Finally, a tangible product increment.',
  'I entered that crunch as customer feedback. The dashboard is delighted.',
  'The deductible is one more panel. The grass will collect it.',
  'Your wheels voted against the roadmap. I have removed their voting rights.'
 ],
 repair:[
  'You repaired the cart. I have reopened the claim.',
  'Fresh charge. Same release boundary.',
  'Keep the invoice. The lawn will need proof of ownership.',
  'The charger was left on for the next shift. There was no next shift.',
  'A temporary fix. I know where the seam is.',
  'You have restored capacity. I have restored the deadline.',
  'The service record says roadworthy. It says nothing about the rough.',
  'Someone kept that charger working. Their ticket is still assigned.'
 ],
 foot:[
  'New delivery method. The same grass beneath you.',
  'You left the cart. The backlog follows your footprints.',
  'A sprint on foot. The mowing line still needs closing.',
  'Every step bends another blade. Your scope keeps growing.',
  'No wheels now. Just you, the turf, and the acceptance review.',
  'The cart is a closed claim. Your legs are a new user story.',
  'On foot through the backlog. The roots have acceptance questions.',
  'Excellent. The policyholder now leaves a readable trail in the dew.',
  'Walk the course. Each footprint is a signature on the revised terms.',
  'The mower has no sprint limit. Your legs made an unfortunate forecast.'
 ],
 finale:[
  'Your exit is still under review.',
  'The grass reaches under that door. So does the backlog.',
  'Shelter is not Done. The lawn still needs your review.',
  'The cut can wait. Your ticket stays open.',
  'Close the shutter. The roots remain in scope.',
  'The roots have a key. I added them as product owners.',
  'Safe is a checkbox. I can uncheck it.',
  'Your claim is pending. The grass never closes its queue.',
  'Enjoy the clubhouse. The next sprint is underneath it.',
  'The policy renewed. So did the mowing schedule.'
 ]
};
const SAVE='rough-cut.back-nine-joe-lines.v1';
export function createJoeLinePicker({random=Math.random,storage}={}){
 let history={};
 try{storage??=globalThis.localStorage;history=JSON.parse(storage?.getItem(SAVE)||'{}')||{};}catch{history={};}
 if(typeof history!=='object'||Array.isArray(history))history={};
 const perRun=new WeakMap();
 return (run,key)=>{
  let selected=perRun.get(run);if(!selected){selected=new Map();perRun.set(run,selected);}
  if(selected.has(key))return selected.get(key);
  const lines=JOE_LINES[key];if(!lines)throw new Error('Unknown Joe dialogue pool: '+key);
  const previous=history[key],validIndex=i=>Number.isInteger(i)&&i>=0&&i<lines.length;
  const last=validIndex(previous?.last)?previous.last:-1;
  // Expanded banks get a fresh deck immediately, retaining the last-line guard.
  let bag=previous?.size===lines.length&&Array.isArray(previous?.bag)&&previous.bag.every(validIndex)&&new Set(previous.bag).size===previous.bag.length?previous.bag.slice():[];
  if(!bag.length){
   bag=lines.map((_,i)=>i);
   for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
   if(bag.at(-1)===last)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
  }
  const index=bag.pop(),line=lines[index];history[key]={bag,last:index,size:lines.length};selected.set(key,line);
  try{storage?.setItem(SAVE,JSON.stringify(history));}catch{/* Session variety still works without storage. */}
  return line;
 };
}
// Lazy creation keeps storage and randomness off startup and simulation paths.
let picker;
export function joeLine(run,key){return (picker??=createJoeLinePicker())(run,key);}
export function variedJoeCaption(run,caption){
 const zone=JOE_STORY_CUES.indexOf(caption);if(zone<0)return caption;
 return `JOE: “${joeLine(run,['yard','range','clubhouse'][zone])}”`;
}
