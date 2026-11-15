import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRunnerBalance} from '../web/runner-balance.js';
import {createRunnerGait} from '../web/runner-gait.js';
import {terrainHeight} from '../web/course-terrain.js';
const source=fs.readFileSync('output/back-nine-visual-upgrade/player-motion/baseline-source/runner-gait.js','utf8'),old=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let samples=0,nearGroundBefore=0,nearGroundAfter=0,maxPlantedSlide=0;
for(const hz of [15,30,60,120])for(const direction of [-1,1])for(const stopAt of [1,1.13,1.27,1.41]){
 const gaits=[old.createRunnerGait(terrainHeight),createRunnerGait(terrainHeight)],f={x:25,y:260,speed:6.6,travelSign:direction},last=[null,null];let stopped=false;
 for(let n=0;n<hz*2.2;n++){
  const time=n/hz,moving=time<stopAt;f.speed=moving?6.6:0;f.y+=f.speed/hz*direction;
  const saved=JSON.stringify(f),poses=gaits.map(g=>g.update(f,time,0));assert.equal(JSON.stringify(f),saved);
  if(moving)for(let i=0;i<2;i++)for(const key of ['x','y','z','pitch','roll','lift','planted'])assert.equal(poses[1].feet[i][key],poses[0].feet[i][key],'moving gait remains unchanged');
  for(const[id,pose]of poses.entries()){
   const now=pose.feet.map(v=>({x:f.x+v.x,y:f.y-v.z,lift:v.lift,planted:v.planted}));
   if(last[id]&&!moving&&stopped)for(let i=0;i<2;i++){
    const d=Math.hypot(now[i].x-last[id][i].x,now[i].y-last[id][i].y);
    if(now[i].lift<.02&&last[id][i].lift<.02){if(id)nearGroundAfter+=d;else nearGroundBefore+=d;}
    if(id&&now[i].planted&&last[id][i].planted)maxPlantedSlide=Math.max(maxPlantedSlide,d);
   }
   last[id]=now;
  }
  if(!moving&&time>stopAt+.5)for(const foot of poses[1].feet){assert(Math.abs(foot.z)<1e-9);assert(foot.lift<1e-9);assert(foot.planted);}
  const same=JSON.stringify(poses[1]);gaits[1].update(f,time,0);assert.equal(JSON.stringify(poses[1]),same,'paused pose does not advance');stopped=!moving;samples++;
 }
}
assert(nearGroundAfter<nearGroundBefore*.45,JSON.stringify({nearGroundBefore,nearGroundAfter}));assert(maxPlantedSlide<1e-8);
// Interrupt both early and completed recovery steps, including stationary
// pivots and reversing away. Exercise the same owner across every transition.
let transitionSamples=0,maxTransitionPlantSlide=0,maxTransitionReach=0,worstReach=null;
for(const hz of [15,30,60,120])for(const pause of [.07,.2,.6])for(const kind of ['resume','reverse','turn','pivot']){
 const gait=createRunnerGait(terrainHeight),f={x:25,y:260,speed:0,travelSign:1};let heading=0,last=null;
 for(let n=0;n<hz*4;n++){
  const time=n/hz,cycle=time%(1+pause),moving=cycle<1,second=time>=1+pause;
  f.travelSign=second&&kind==='reverse'?-1:1;
  f.speed=moving&&(kind!=='pivot'||!second)?6.6:0;
  if(second&&moving&&(kind==='turn'||kind==='pivot'))heading+=1.2/hz;
  f.x+=Math.sin(heading)*f.speed/hz*f.travelSign;f.y+=Math.cos(heading)*f.speed/hz*f.travelSign;
  const pose=gait.update(f,time,heading),c=Math.cos(heading),s=Math.sin(heading),now=[];
  for(let i=0;i<2;i++){
   const v=pose.feet[i],x=f.x+c*v.x-s*v.z,y=f.y-s*v.x-c*v.z;
   if(last?.[i].planted&&v.planted)maxTransitionPlantSlide=Math.max(maxTransitionPlantSlide,Math.hypot(x-last[i].x,y-last[i].y));
   const reach=Math.hypot(v.x-(i?1:-1)*.112,v.y-pose.hipHeight,v.z-.88*Math.sin(-pose.blend*.09));if(reach>maxTransitionReach){maxTransitionReach=reach;worstReach={hz,pause,kind,time,foot:{...v},hip:pose.hipHeight,blend:pose.blend};}
   assert(Object.values(v).every(value=>typeof value==='boolean'||Number.isFinite(value)));
   now.push({x,y,planted:v.planted});
  }
  last=now;transitionSamples++;
 }
}
assert(maxTransitionPlantSlide<1e-8,`support moved during restart: ${maxTransitionPlantSlide}`);
assert(maxTransitionReach<.77,`support out of reach during restart: ${JSON.stringify(worstReach)}`);
let balanceSamples=0;
for(const hz of [30,60,120])for(const direction of [-1,1]){
 const b=createRunnerBalance(),f={x:0,y:0,speed:0,travelSign:direction};let accelerating=false,braking=false,effort=0;
 for(let n=0;n<hz*4;n++){
  const t=n/hz;f.speed=t<.4?t*16.5:t<1.4?6.6:t<1.6?(1.6-t)*33:0;f.y+=f.speed/hz*direction;
  const saved=JSON.stringify(f),p=b.update(f,t,0);assert.equal(JSON.stringify(f),saved);assert(Object.values(p).every(Number.isFinite));
  if(t>.2&&t<.35)accelerating||=p.pitch*direction<-.02;if(t>1.45&&t<1.6)braking||=p.pitch*direction>.02;if(t>1.7&&t<1.8)effort=Math.max(effort,p.effort);
  const snapshot=JSON.stringify(p);b.update(f,t,0);assert.equal(JSON.stringify(p),snapshot);balanceSamples++;
 }
 assert(accelerating&&braking);assert(effort>.65,'breathing effort persists after running');
 const p=b.update(f,4,0,true);assert.equal(p.breath,0);assert.equal(p.pitch,0);assert.equal(p.roll,0);assert.equal(p.armBrace,0);
 b.reset();assert.equal(b.pose.effort,0);
}
const report={passed:true,gaitSamples:samples,balanceSamples,transitionSamples,maxTransitionPlantSlide,maxTransitionReach,nearGroundBefore,nearGroundAfter,reduction:1-nearGroundAfter/nearGroundBefore,maxPlantedSlide,movingGaitUnchanged:true,pauseStable:true,gameplayUnchanged:true};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2));console.log(JSON.stringify(report));

