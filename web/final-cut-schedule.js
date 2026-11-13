export const CUT_PLANS=[
 {seed:0,id:'standard',name:'Original round',order:[0,1,2],opening:0,description:'The original encounter. After the demonstration, Joe selects the next strip from his schedule or actual sight and sound.'},
 {seed:1,id:'far-first',name:'Far bank first',order:[0,2,1],opening:2,description:'After the near-strip demonstration, Joe works the far strip, then the middle. Use the different crossing windows; watch his lamps.'},
 {seed:2,id:'return-pass',name:'Return pass',order:[0,0,2,1],opening:3,description:'Joe returns along the near strip before moving to the far and middle strips. Wait for the second pass or commit to its wake.'},
];
export const cutPlan=r=>CUT_PLANS[r.seed]||CUT_PLANS[0];
export function createSchedule(value,seed,checkpoint){
 const plan=CUT_PLANS[seed]||CUT_PLANS[0],valid=value&&typeof value==='object';
 return {index:valid&&Number.isInteger(value.index)&&value.index>=0?value.index%plan.order.length:0,
  openingRemaining:checkpoint>0?0:valid&&Number.isInteger(value.openingRemaining)?Math.max(0,Math.min(plan.opening,value.openingRemaining)):plan.opening};
}
export const scheduleSnapshot=r=>({...r.schedule});
export function nextScheduledStrip(r){
 const plan=cutPlan(r),index=(r.schedule.index+1)%plan.order.length;
 return {index,lane:r.seed===0?(r.rig.lane+1)%3:plan.order[index],opening:r.schedule.openingRemaining>0};
}
export function consumeScheduledStrip(r,choice){
 r.schedule.index=choice.index;r.schedule.openingRemaining=Math.max(0,r.schedule.openingRemaining-1);r.saveSerial++;
}
