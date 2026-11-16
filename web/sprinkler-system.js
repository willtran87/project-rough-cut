import * as THREE from './vendor/three/three.module.js';
import {createSoftSprites,SOFT_DROP,SOFT_PUFF,SOFT_RING,SOFT_CROWN} from './course-soft-sprites.js?v=20261116-night-air';

// Layout derives from the real wet zones. Small heads have no collision and
// never move a gameplay zone or modify Joe's navigation/perception.
export function sprinklerLayout(data,scale,xScale){
 return (data.soakZones||[]).map((zone,index)=>{
  const cx=zone.x*xScale,cz=-zone.y*scale,radius=zone.radius*scale;
  for(let step=0;step<16;step++){
   const angle=index*2.4+step*Math.PI/8,x=cx+Math.cos(angle)*radius*.6,z=cz+Math.sin(angle)*radius*.6;
   if(Math.abs(x)>data.bounds.maxX*xScale-.35||z>0||z<-data.bounds.maxY*scale)continue;
   if(data.obstacles.some(o=>{if(!o.blocks&&!o.id?.includes('pond'))return false;const dx=Math.abs(x-o.x*xScale),dz=Math.abs(z+o.y*scale),rx=(o.radiusX||o.radius)*scale+.25,rz=(o.radiusY||o.radius)*scale+.25;return o.shape==='box'?dx<rx&&dz<rz:(dx/rx)**2+(dz/rz)**2<1;}))continue;
   return {id:zone.id,x,z,angle:Math.atan2(cx-x,cz-z),reach:radius*1.05};
  }
  return null;
 }).filter(Boolean);
}

const fract=v=>v-Math.floor(v),hash=(a,b)=>fract(Math.sin(a*12.9898+b*78.233)*43758.5453);
const FLIGHT=.9,NOZZLE=.31,SWEEP=.75,SWEEP_RATE=.85;

export function createSprinklerSpray(parent,heads,{software=false}={}){
 // One pooled, soft-edged draw holds every drop, puff, ripple and splash.
 const capacity=software?96:420,sprites=createSoftSprites(parent,{name:'IrrigationSpray',capacity}),mesh=sprites.mesh,material=sprites.material;
 const frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),sphere=new THREE.Sphere(new THREE.Vector3(),5);
 const chosen=[null,null,null],chosenDistance=[0,0,0],activeHeads=[],lastCamera=new Float32Array(16);
 // Fixed practical lights near each head. The lists are built once; only the
 // live flicker/power value is read while spraying.
 const lamps=heads.map(()=>[]);
 let lastTime=NaN,lastDensity=-1,lastFov=0,lastAspect=0,updates=0,active=false,lit=0;
 let cx=0,cz=0,rx=1,ry=0,rz=0,ux=0,uy=1,uz=0,lr=0,lg=0,lb=0,ax=0,ay=0,az=0,vx=0,vy=0,vz=0;
 function setLamps(lanterns=[],floods=[]){
  heads.forEach((head,index)=>{
   const list=lamps[index];list.length=0;
   for(const a of lanterns){const d=Math.hypot(a.position.x-head.x,a.position.z-head.z);if(d<head.reach+6.5)list.push({source:a,x:a.position.x,y:a.position.y,z:a.position.z,range:6.5,r:1,g:.66,b:.30,d});}
   for(const l of floods){const p=l.pool?.position;if(!p)continue;const d=Math.hypot(p.x-head.x,p.z-head.z);if(d<head.reach+9)list.push({source:l,x:p.x,y:2.8,z:p.z,range:9,r:.80,g:.90,b:1,d});}
   list.sort((a,b)=>a.d-b.d);list.length=Math.min(list.length,software?2:4);
  });
 }
 // Moonlit water is a cool grey; anything warmer is a lamp shining through it.
 function light(list,x,y,z){
  lr=.20;lg=.27;lb=.30;
  for(let i=0;i<list.length;i++){
   const l=list[i],dx=x-l.x,dy=y-l.y,dz=z-l.z,f=1-(dx*dx+dy*dy+dz*dz)/(l.range*l.range);if(f<=0)continue;
   const power=f*f*(l.source.intensity??l.source.power??1)*1.5;lr+=l.r*power;lg+=l.g*power;lb+=l.b*power;lit+=power;
  }
 }
 // Keep the lamp's hue when a drop is brightly lit; mist is a thinner
 // scatterer and takes the tint without blowing out.
 const tone=(gain,ceiling)=>{const peak=Math.max(lr,lg,lb)*gain;return peak>ceiling?gain*ceiling/peak:gain;};
 function put(x,y,z,ax,ay,az,bx,by,bz,alpha,cell,gain=1){const k=tone(gain,cell===SOFT_PUFF?.62:1.25);sprites.put(x,y,z,ax,ay,az,bx,by,bz,lr*k,lg*k,lb*k,alpha,cell);}
 const billboard=(x,y,z,w,h,alpha,cell,gain)=>put(x,y,z,rx*w,ry*w,rz*w,ux*h,uy*h,uz*h,alpha,cell,gain);
 // A streak lies along its own velocity and turns about that axis to face the eye.
 function streak(x,y,z,dx,dy,dz,width,length,alpha,gain){const k=tone(gain,1.25);sprites.along(x,y,z,dx,dy,dz,width,length,lr*k,lg*k,lb*k,alpha,SOFT_DROP);}
 // Where the water is at flight fraction u, having left the nozzle at `time`.
 function arc(head,time,u,reach,height,spread){
  const angle=head.angle+Math.sin(time*SWEEP_RATE+head.x)*SWEEP+spread,dx=Math.sin(angle)*reach,dz=Math.cos(angle)*reach;
  ax=head.x+dx*u;ay=.035+NOZZLE*(1-u)+4*height*u*(1-u);az=head.z+dz*u;vx=dx;vy=4*height*(1-2*u)-NOZZLE;vz=dz;
 }
 function spray(head,index,list,time,density,windX){
  const drops=software?26:density<.75?48:84,puffs=software?5:12,rings=software?5:8,hops=software?5:10,stream=software?3:5;
  // The coherent stream leaving the nozzle, before it breaks into drops.
  for(let i=0;i<stream;i++){
   const u=(i+.5)/stream*.2;arc(head,time-u*FLIGHT,u,head.reach*.88,.84,0);light(list,ax,ay,az);
   streak(ax,ay,az,vx,vy,vz,.034-.012*u/.2,head.reach*.2/stream*1.5,.52-.9*u,1.25);
  }
  for(let i=0;i<drops;i++){
   const turn=time/FLIGHT+hash(i,index+3.1),cycle=Math.floor(turn),u=turn-cycle,a=hash(i+.37,cycle),b=hash(i+9.1,cycle*1.7),c=hash(i+4.3,cycle+11);
   // Each drop keeps the heading it was thrown with, so the jet trails in a
   // curve behind the turning head the way a real rotor's does.
   arc(head,time-u*FLIGHT,u,head.reach*(.70+.27*a),.66+.36*a+(b-.5)*.2,(c-.5)*.13);
   light(list,ax,ay,az);
   const fall=u*u,size=.020+.024*b;
   streak(ax,ay,az,vx,vy,vz,size,(.07+.16*c)*(.75+.8*fall),Math.min(1,u*14)*(.74-.3*u)*(.55+.45*b),.95+.9*b*b);
  }
  // Fine spray shed along the arc hangs, spreads and drifts with the wind.
  for(let i=0;i<puffs;i++){
   const life=2.1,turn=time/life+i/puffs,cycle=Math.floor(turn),p=turn-cycle,born=time-p*life,a=hash(i+1.7,cycle+index),u=.34+.6*a;
   arc(head,born-u*FLIGHT,u,head.reach*.86,.86,(hash(i,cycle)-.5)*.1);
   const x=ax+windX*p*life+Math.sin(born*.7+i)*.08*p,y=Math.max(.16,ay*(1-.45*p)+.06),z=az+(hash(i+5,cycle)-.5)*.35*p,scale=.5+1.3*p;
   light(list,x,y,z);billboard(x,y,z,scale*1.25,scale*.8,Math.sin(Math.min(1,p*3.2)*Math.PI/2)*(1-p)*(1-p)*.17*density,SOFT_PUFF,1);
  }
  // The landing veil: a damp curtain kicked up where the water comes down.
  for(let i=0;i<puffs-2;i++){
   const life=1.7,turn=time/life+i/(puffs-2)+.37,cycle=Math.floor(turn),p=turn-cycle,born=time-p*life,a=hash(i+3.3,cycle+index*7);
   arc(head,born-FLIGHT,1,head.reach*(.74+.2*a),.8,(hash(i+2,cycle)-.5)*.16);
   const x=ax+windX*p*life*.8,y=.10+.42*p,scale=.6+1.2*p;
   light(list,x,y,az);billboard(x,y,az,scale*1.3,scale*.62,Math.sin(Math.min(1,p*4)*Math.PI/2)*(1-p)*.19*density,SOFT_PUFF,1);
  }
  // Ripples open where each part of the jet lands and are left behind as it turns.
  for(let i=0;i<rings;i++){
   const life=.95,turn=time/life+i/rings,cycle=Math.floor(turn),p=turn-cycle,born=time-p*life,a=hash(i+6.1,cycle+index*3);
   arc(head,born-FLIGHT,1,head.reach*(.70+.27*a),.8,(hash(i+8,cycle)-.5)*.13);
   const size=.10+.62*p;light(list,ax,.03,az);
   put(ax,.028+i*.0004,az,size,0,0,0,0,-size,(1-p)*(1-p)*.5,SOFT_RING,1.1);
   // A brief crown stands up out of each fresh impact.
   if(p<.3){const h=.05+.32*p,w=.10+.16*p;put(ax,.03+h*.5,az,rx*w,0,rz*w,0,h,0,(1-p/.3)*.8,SOFT_CROWN,1.4);}
  }
  // Droplets bounced back off the turf.
  for(let i=0;i<hops;i++){
   const life=.34,turn=time/life+hash(i,index+17),cycle=Math.floor(turn),p=turn-cycle,born=time-p*life,a=hash(i+2.9,cycle),b=hash(i+7.7,cycle+5),out=b*6.283,throwX=Math.cos(out)*.42,throwZ=Math.sin(out)*.42,up=.5+1.1*a;
   arc(head,born-FLIGHT,1,head.reach*(.70+.27*a),.8,(b-.5)*.13);
   const x=ax+throwX*p*life,z=az+throwZ*p*life,y=.03+up*p*life*(1-p)*2.4;
   light(list,x,y,z);streak(x,y,z,throwX,up*(1-2*p),throwZ,.016,.035+.03*a,(1-p)*.7,1.3);
  }
 }
 function update(frame,camera){
  active=frame.soakSeconds>0;const density=frame.fx?.density??1,enabled=active&&density>0,e=camera.matrixWorld.elements;
  if(!enabled){if(mesh.visible||activeHeads.length){mesh.count=0;mesh.visible=false;activeHeads.length=0;updates++;}lastTime=NaN;return;}
  // Sprinklers always run: Reduced motion calms the camera, not the water.
  // A repeated or paused frame (same clock, same view) is left untouched.
  let same=frame.time===lastTime&&density===lastDensity&&camera.fov===lastFov&&camera.aspect===lastAspect;
  for(let i=0;i<16;i++){if(lastCamera[i]!==Math.fround(e[i]))same=false;lastCamera[i]=e[i];}
  if(same)return;
  lastTime=frame.time;lastDensity=density;lastFov=camera.fov;lastAspect=camera.aspect;updates++;lit=0;activeHeads.length=0;sprites.begin(camera);
  rx=e[0];ry=e[1];rz=e[2];ux=e[4];uy=e[5];uz=e[6];cx=e[12];cz=e[14];
  projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
  // Nearest visible heads, chosen without building lists.
  const limit=software?2:3;let found=0;
  for(const head of heads){
   const distance=Math.hypot(head.x-cx,head.z-cz);if(distance>=(software?24:30))continue;
   sphere.center.set(head.x,.8,head.z);sphere.radius=head.reach+2;if(!frustum.intersectsSphere(sphere))continue;
   let slot=found<limit?found++:-1;if(slot<0){if(distance>=chosenDistance[limit-1])continue;slot=limit-1;}
   while(slot>0&&chosenDistance[slot-1]>distance){chosen[slot]=chosen[slot-1];chosenDistance[slot]=chosenDistance[slot-1];slot--;}
   chosen[slot]=head;chosenDistance[slot]=distance;
  }
  const wind=frame.fx?.wind,windX=(wind?.direction<0?-1:1)*(.12+.75*Math.min(1,Math.max(0,wind?.strength||0)));
  for(let i=0;i<found;i++){const head=chosen[i],index=heads.indexOf(head);activeHeads.push(head.id);spray(head,index,lamps[index],frame.time,density,windX);}
  sprites.finish();
 }
 return {update,setLamps,stats:()=>({active,heads:heads.map(h=>({...h})),activeHeads:[...activeHeads],instances:mesh.count,capacity,drawCalls:mesh.visible?1:0,updates,depthTest:material.depthTest,transparent:material.transparent,lamps:lamps.map(l=>l.length),lampLight:lit})};
}
