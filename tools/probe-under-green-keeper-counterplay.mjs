import fs from 'node:fs';
import {step,nearbyAction} from '../web/under-green-sim.js';
import {WATERS,waterState,pathTo,distance,lineClear,inWater,SLUICE,keeperInside,solid} from '../web/under-green-course.js';
const water=WATERS.find(w=>w.id==='sluice');
export function counterplay(initial,side){
 const r=structuredClone(initial),inputs=[],samples=[];
 let stage='bank',loop=0,route=[],repath=0,goal,previousStage='',returnGoals=[],returnIndex=0;
 const south=[{x:9,y:16.8},{x:15,y:16.8}],north=[{x:9.8,y:22.4},{x:14.2,y:22.4}];
 for(let frame=0;frame<60*90&&['playing','aftermath'].includes(r.mode);frame++){
  const state=waterState(water,r.time,r.bypass,r.bypassAt);
  if(stage==='bank'){
   goal=south[loop%2];if(distance(r.player,goal)<.3)loop++;
   if(!state.danger&&state.safeFor>2.6){stage='out';goal={x:12,y:22.4};}
  }else if(stage==='out'){
   goal={x:12,y:22.4};if(r.player.y>21.8){stage='bait';loop=0;}
  }else if(stage==='bait'){
   goal=north[loop%2];if(distance(r.player,goal)<.3)loop++;
   if(r.joe.y>20&&r.joe.phase==='windup'&&!state.danger&&state.safeFor>1.4){
    const x=12+side*2;returnGoals=[{x,y:r.player.y},{x,y:17.3},{x:14,y:15.5},SLUICE];returnIndex=0;stage='return';
   }
  }else{
   goal=returnGoals[returnIndex]||SLUICE;if(distance(r.player,goal)<.25){returnIndex++;route=[];repath=0;goal=returnGoals[returnIndex]||SLUICE;}
  }
  if(stage!==previousStage){route=[];repath=0;previousStage=stage;samples.push({event:stage,frame,time:r.time,player:{x:r.player.x,y:r.player.y},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase}});}
  r.player.yaw=Math.atan2(goal.x-r.player.x,goal.y-r.player.y);
  if(--repath<=0||!route.length){route=pathTo(r.player,goal,r.time,r.bypass,false,r.bypassAt);repath=12;}
  while(route.length&&distance(r.player,route[0])<.2)route.shift();let next=route[0];
  if(!next&&distance(r.player,goal)<1.5&&lineClear(r.player,goal,.3)&&!WATERS.some(w=>waterState(w,r.time,r.bypass,r.bypassAt).danger&&inWater(goal,w,.3)))next=goal;
  const input={sprint:true};
  if(next){const dx=next.x-r.player.x,dy=next.y-r.player.y,d=Math.hypot(dx,dy);input.forward=(dx*Math.sin(r.player.yaw)+dy*Math.cos(r.player.yaw))/d;input.strafe=(dx*Math.cos(r.player.yaw)-dy*Math.sin(r.player.yaw))/d;}
  if(stage==='return'&&nearbyAction(r)?.id==='gate')input.use=true;
  inputs.push({yaw:r.player.yaw,input});step(r,input);
  if(frame%30===0)samples.push({frame,time:r.time,stage,goal,player:{x:r.player.x,y:r.player.y},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase},hits:r.waterHits,closing:r.closing});
 }
 const result={side,mode:r.mode,seconds:r.elapsed-initial.elapsed,stage,hits:r.waterHits-initial.waterHits,player:r.player,joe:r.joe,inside:keeperInside(r.joe),solid:solid(r.player),samples};
 return {initial,inputs,final:r,result};
}
if(process.argv[1]?.endsWith('probe-under-green-keeper-counterplay.mjs')){
 const initial=JSON.parse(fs.readFileSync('tools/fixtures/under-green-keeper-occupied.json')).run;
 const out='output/under-green/keeper-counterplay';fs.mkdirSync(out,{recursive:true});
 const results=[];
 for(const side of [-1,1]){const tape=counterplay(initial,side);results.push(tape.result);fs.writeFileSync(out+`/attempt-${side}.json`,JSON.stringify(tape));console.log(JSON.stringify({side,mode:tape.result.mode,seconds:tape.result.seconds,hits:tape.result.hits}));}
 fs.writeFileSync(out+'/probe.json',JSON.stringify(results,null,2));
}
