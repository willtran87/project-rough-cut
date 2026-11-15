import {shoeGroundHeight} from './final-cut-ground-layout.js';
// Ground contacts belong to the simulation, not the renderer. A saved swing
// retains its endpoints and age; drawing, pausing and reloading cannot move it.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const ease=t=>t*t*(3-2*t);
export function groundHomes(j,lead=0){
 let turn=clamp(j.turnRate||0,-1.8,1.8)*lead;
 if(Number.isFinite(j.heading)){const remaining=wrap(j.heading-j.yaw);turn=Math.sign(turn)===Math.sign(remaining)?Math.sign(turn)*Math.min(Math.abs(turn),Math.abs(remaining)):0;}
 const yaw=j.yaw+turn,c=Math.cos(yaw),s=Math.sin(yaw),speed=j.speed||0,predicted=Math.min(j.maxSpeed||speed,speed+Math.max(0,j.acceleration||0)*lead*.5),travel=Math.min(predicted*lead,Number.isFinite(j.distanceToStop)?Math.max(0,j.distanceToStop):Infinity);
 return [-.11,.11].map(side=>{const x=j.x+Math.sin(j.yaw)*travel+c*side-s*.38,y=j.y+Math.cos(j.yaw)*travel-s*side-c*.38;return {x,y,height:.12+shoeGroundHeight(x,y,yaw),yaw:wrap(yaw),step:null};});
}
export const createGroundFeet=j=>groundHomes(j).map(f=>({...f,stepCount:0}));
export const groundSnapshot=feet=>feet?.map(f=>({...f,step:f.step?{...f.step,from:{...f.step.from},to:{...f.step.to}}:null}));
export function restoreGroundFeet(saved,j){
 if(!Array.isArray(saved)||saved.length!==2)return createGroundFeet(j);
 const valid=p=>p&&['x','y','height','yaw'].every(k=>Number.isFinite(p[k]))&&Math.hypot(p.x-j.x,p.y-j.y)<1.6&&p.height>=.119&&p.height<.4&&Math.abs(p.yaw)<=Math.PI+.0001;
 if(saved.some(f=>!valid(f)||f.step&&(!valid(f.step.from)||!valid(f.step.to)||!Number.isFinite(f.step.age)||!Number.isFinite(f.step.duration)||f.step.duration<.1||f.step.duration>.4||f.step.age<0||f.step.age>f.step.duration||f.step.clearanceHeight!==undefined&&(!Number.isFinite(f.step.clearanceHeight)||f.step.clearanceHeight<.12||f.step.clearanceHeight>.35)||f.step.lift!==undefined&&(!Number.isFinite(f.step.lift)||f.step.lift<0||f.step.lift>.085)))||saved.every(f=>f.step))return createGroundFeet(j);
 return groundSnapshot(saved).map(f=>({...f,stepCount:Number.isInteger(f.stepCount)&&f.stepCount>=0&&f.stepCount<10000?f.stepCount:0}));
}
export function advanceGroundFeet(j,dt){
 j.feet||=createGroundFeet(j);if(dt<=0)return;
 for(const f of j.feet){const step=f.step;if(!step)continue;step.age=Math.min(step.duration,step.age+dt);const t=step.age/step.duration,k=step.clearanceHeight===undefined?ease(t):ease(clamp((t-.18)/.64,0,1));f.x=step.from.x+(step.to.x-step.from.x)*k;f.y=step.from.y+(step.to.y-step.from.y)*k;f.height=step.from.height+(step.to.height-step.from.height)*k+Math.sin(Math.PI*t)**2*(step.lift??.085);if(step.clearanceHeight!==undefined)f.height=t<.18?step.from.height+(step.clearanceHeight-step.from.height)*ease(t/.18):t>.82?step.clearanceHeight+(step.to.height-step.clearanceHeight)*ease((t-.82)/.18):step.clearanceHeight;f.yaw=wrap(step.from.yaw+wrap(step.to.yaw-step.from.yaw)*k);if(t>=1){Object.assign(f,step.to);f.step=null;}}
 if(j.feet.some(f=>f.step))return;
 const moving=j.speed>.01,homes=groundHomes(j),errors=j.feet.map((f,i)=>Math.hypot(f.x-homes[i].x,f.y-homes[i].y)+Math.abs(wrap(f.yaw-homes[i].yaw))*.12),counts=j.feet.map(f=>f.stepCount||0);
 // A newly planted leading shoe is intentionally ahead of its current home.
 // Alternation prevents that error from selecting it twice and stranding the
 // trailing support while the body walks away.
 const index=moving&&counts[0]!==counts[1]?(counts[0]<counts[1]?0:1):errors[1]>errors[0]?1:0;
 if(errors[index]<(moving?(j.acceleration>.1?.04:.13):.003))return;
 const duration=moving?.26:.22,lead=moving?duration+.13:Math.abs(j.turnRate||0)>.02?duration*.7:0,target=groundHomes(j,lead)[index],f=j.feet[index];
 const lift=moving?.085:Math.min(.075,Math.hypot(target.x-f.x,target.y-f.y)*.4+Math.abs(wrap(target.yaw-f.yaw))*.02);
 let terrain=Math.max(f.height,target.height);for(let n=1;n<32;n++){const k=n/32,yaw=f.yaw+wrap(target.yaw-f.yaw)*k;terrain=Math.max(terrain,.12+shoeGroundHeight(f.x+(target.x-f.x)*k,f.y+(target.y-f.y)*k,yaw));}
 f.stepCount=Math.max(...counts)+1;f.step={from:{x:f.x,y:f.y,height:f.height,yaw:f.yaw},to:target,age:0,duration,lift};if(terrain>Math.min(f.height,target.height)+.002)f.step.clearanceHeight=terrain+.04;
}
