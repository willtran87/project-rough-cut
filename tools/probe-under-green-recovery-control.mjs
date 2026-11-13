import fs from 'node:fs';
import {createRun,step,MOVEMENT} from '../web/under-green-sim.js';
import {WATERS,waterPoint,waterLocal,inWater,waterState,distance,solid} from '../web/under-green-course.js';
import {weaponClear,JOE_RADIUS} from '../web/under-green-clearance.js';

export function recoveryAttempt(w,{side=-1,stance='walk',steer='right',lane=0,reduced=false}={}){
 const speed=MOVEMENT[stance],stanceInput=stance==='sprint'?{sprint:true}:stance==='crouch'?{crouch:true}:{};
 const r=createRun(),close=(w.lowSeconds??(w.lesson?5:3))+1.5;
 Object.assign(r,{mode:'playing',time:24+close-(w.depth/2+.75)/speed+.02-w.offset,bypass:w.id.startsWith('range-')||w.id==='sluice'});
 if(w.id==='return'){r.bypass=true;r.bypassAt=r.time-2+(w.depth/2+.75)/speed-.02;}
 Object.assign(r.player,waterPoint(w,lane,side*(w.depth/2+.75)),{yaw:w.axis==='x'?(side<0?Math.PI/2:-Math.PI/2):(side<0?0:Math.PI),grace:0});
 Object.assign(r.joe,{x:-18,y:40,phase:'walk',last:{x:-18,y:40},yaw:0});
 if(solid(r.player,.3)||solid(r.joe,JOE_RADIUS)||!weaponClear(r.joe))throw Error('Invalid recovery approach fixture');
 const initial=structuredClone(r),inputs=[],samples=[];
 let maxStep=0,bodyOverlap=false,protectedCapture=false;
 const advance=input=>{
  inputs.push({yaw:r.player.yaw,input:{...stanceInput,reduced,...input}});
  const p={...r.player};step(r,inputs.at(-1).input);
  maxStep=Math.max(maxStep,distance(p,r.player));bodyOverlap ||= solid(r.player,.3);
  protectedCapture ||= r.mode==='caught'&&(p.recovery?.protected||r.player.recovery?.protected);
 };
 for(let frame=0;frame<300&&!r.player.recovery&&r.mode==='playing';frame++)advance({forward:1});
 if(!r.player.recovery)throw Error('Fixture did not produce a real late-entry recovery: '+w.id);
 const hitFrame=inputs.length,start=waterLocal(r.player,w),hitState=structuredClone(r);
 let lateralInput=0,lateralCommandError=0,reverseFrames=0;
 for(let frame=0;frame<100&&r.player.recovery&&r.mode==='playing';frame++){
  const action=steer==='switch'?(frame<6?'right':'left'):steer;
  const input=action==='right'?{strafe:-side}:action==='left'?{strafe:side}:action==='return'?{forward:-1}:action==='commit'?{forward:1}:{};
  const before=waterLocal(r.player,w);advance(input);
  if(['left','right'].includes(action)){
   lateralInput+=r.player.speed/60;
   const actual=waterLocal(r.player,w).x-before.x,expected=(action==='right'?1:-1)*r.player.speed/60;
   lateralCommandError=Math.max(lateralCommandError,Math.abs(actual-expected));
   if(steer==='switch'&&frame>=6&&actual<-.0001)reverseFrames++;
  }
  if(frame%6===0)samples.push({frame:inputs.length,player:{x:r.player.x,y:r.player.y},recovery:r.player.recovery&&{...r.player.recovery}});
 }
 const end=waterLocal(r.player,w),clearedAfterShove=!inWater(r.player,w,.3),endFrame=inputs.length,endState=structuredClone(r);
 // After the shove, a normal retreat must actually move out of danger.
 for(let frame=0;frame<30&&r.mode==='playing';frame++)advance({forward:-1});
 return {row:{channel:w.id,side,stance,steer,lane,reduced,mode:r.mode,hits:r.waterHits,protected:hitState.player.recovery.protected,
  lateralInput,lateralRetained:Math.abs(end.x-start.x),retention:lateralInput>.001?Math.abs(end.x-start.x)/lateralInput:null,lateralCommandError,reverseFrames,
  clearedAfterShove,entryBankAfterShove:end.y*side>=w.depth/2+.3,clearedAfterRetreat:!inWater(r.player,w,.3),entryBankAfterRetreat:waterLocal(r.player,w).y*side>=w.depth/2+.3,endPhase:waterState(w,r.time,r.bypass,r.bypassAt).phase,
  shoveSeconds:(endFrame-hitFrame)/60,maxStep,bodyOverlap,protectedCapture:!!protectedCapture},initial,inputs,hitFrame,endFrame,hitState,endState,samples,final:r};
}

if(process.argv[1]?.endsWith('probe-under-green-recovery-control.mjs')){
 const out='output/under-green/recovery-control';fs.mkdirSync(out,{recursive:true});
 const rows=[],examples=[];
 for(const w of WATERS.filter(w=>!['return','bypass'].includes(w.id))){
  for(const side of [-1,1])for(const stance of ['walk','sprint','crouch'])for(const steer of ['none','left','right','return','commit']){
   const a=recoveryAttempt(w,{side,stance,steer});rows.push(a.row);
   if(w.id==='lesson'&&side===-1&&stance==='walk'&&steer==='right'||w.id==='spillway'&&side===-1&&stance==='sprint'&&steer==='commit')examples.push(a);
  }
  console.log(JSON.stringify({channel:w.id,cases:rows.filter(r=>r.channel===w.id).length}));
 }
 const report={rows,steeringLoss:rows.filter(r=>r.retention!==null&&r.retention<.9),stillInWater:rows.filter(r=>!r.clearedAfterRetreat),repeatedHits:rows.filter(r=>r.hits>1)};
 // Keep the original failing baseline as historical evidence. Subsequent
 // exploratory runs describe the current implementation in separate files.
 fs.writeFileSync(out+'/probe.json',JSON.stringify(report,null,2));fs.writeFileSync(out+'/probe-examples.json',JSON.stringify(examples));
 console.log(JSON.stringify({cases:rows.length,steeringLoss:report.steeringLoss.length,stillInWater:report.stillInWater.length,repeatedHits:report.repeatedHits.length}));
}
