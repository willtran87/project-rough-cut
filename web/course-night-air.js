import * as THREE from './vendor/three/three.module.js';
import {COURSE_MOON_OFFSET} from './course-moon-direction.js';
import {createSoftSprites,SOFT_DROP,SOFT_PUFF,SOFT_CROWN,SOFT_GLOW,SOFT_SHAFT,SOFT_BEAM,SOFT_FLECK,SOFT_FOG} from './course-soft-sprites.js?v=20261116-night-air';

// The air of the night course: low drifting fog, the bloom of lanterns in damp
// air, moonlight slanting under the trees, and the working lamp, clippings and
// exhaust of Joe's mower. Everything here is cosmetic. It reads the frame and
// never writes to it, adds no lights, and draws from three fixed pools.
const fract=v=>v-Math.floor(v),hash=(a,b)=>fract(Math.sin(a*12.9898+b*78.233)*43758.5453),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const MOON=new THREE.Vector3().fromArray(COURSE_MOON_OFFSET).normalize();
export const JOE_LAMP={forward:1.02,height:.56,reach:8.5,dip:.085,power:22};

export function createNightAir(parent,{software=false,scale=.16,xScale=.1152,blockers=[],trees=[],bounds={x:12,z:125}}={}){
 const haze=createSoftSprites(parent,{name:'NightAirHaze',capacity:software?40:150,order:3,dither:.03});
 const glow=createSoftSprites(parent,{name:'NightAirGlow',capacity:software?28:96,blend:'add',order:4,dither:.012});
 // Multiplies what is already drawn, so lamp light brings up the turf and
 // hedge texture beneath it and leaves true black black.
 const lit=createSoftSprites(parent,{name:'NightAirLit',capacity:software?8:20,blend:'light',order:1,fog:false,dither:.05});
 // The mower's work lamp as a real light, so turf, hedges and walls in the
 // beam are actually lit. It exists and is enabled from the first frame and
 // only ever moves or changes strength: the light count and every shader
 // program stay as they were compiled at level start. It stands in above the
 // deck so the flat ground takes the light, and its range is cut at the first
 // solid thing the beam meets, so it never shines through cover. The software
 // path keeps the cheap painted pool instead.
 const lamp=software?null:new THREE.SpotLight(0xffdca2,0,JOE_LAMP.reach,.56,.85,.25);
 if(lamp){lamp.name='CourseMowerWorkLamp';lamp.castShadow=false;parent.add(lamp,lamp.target);}
 const frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),sphere=new THREE.Sphere(),lastCamera=new Float32Array(16);
 // Where moonlight that clears a canopy comes to ground. Only landings on the
 // course itself are kept, so every shaft crosses ground the walker can see.
 const sites=[];
 trees.forEach((t,i)=>{
  for(let level=0;level<2;level++){
   if(hash(i,3.7+level)>.7)continue;
   const top=t.height*(level?.6+.2*hash(i,9):.3+.18*hash(i,8)),run=top/MOON.y,x=t.x-MOON.x*run,z=t.z-MOON.z*run;
   if(Math.abs(x)>bounds.x+4.5||z>-1||z<-bounds.z||blockers.some(o=>{const ex=(x-o.x)/(o.rx+.4),ez=(z-o.z)/(o.rz+.4);return o.box?Math.abs(ex)<1&&Math.abs(ez)<1:ex*ex+ez*ez<1;}))continue;
   sites.push({x,z,length:Math.min(run,8+4*hash(i,5+level)),width:.5+.5*hash(i,2+level),seed:hash(i,1+level)*40});
  }
 });
 let lamps=[],lastTime=NaN,lastDensity=-1,lastFov=0,lastAspect=0,updates=0,lastCost=0,maxCost=0;
 const counts={fog:0,halos:0,shafts:0,lamp:0,clippings:0,exhaust:0,steps:0};
 let cx=0,cy=0,cz=0,fr=0,fg=0,fb=0,beamReach=0;
 const setLamps=anchors=>{lamps=anchors||[];};
 const visible=(x,y,z,radius)=>{sphere.center.set(x,y,z);sphere.radius=radius;return frustum.intersectsSphere(sphere);};
 // Fog is the colour of the moon until a lantern is close enough to warm it.
 function fogLight(x,z,moon){
  fr=.30*moon;fg=.40*moon;fb=.46*moon;
  for(let i=0;i<lamps.length;i++){const a=lamps[i],dx=x-a.position.x,dz=z-a.position.z,f=1-(dx*dx+dz*dz)/30;if(f>0){const power=f*f*a.intensity*.55;fr+=power;fg+=power*.62;fb+=power*.27;}}
  const peak=Math.max(fr,fg,fb);if(peak>.8){const k=.8/peak;fr*=k;fg*=k;fb*=k;}
 }
 function fog(time,density,windX,moon){
  const cell=6,drift=time*windX*.35,limit=Math.round((software?4:30)*density),far=software?17:27;
  const gx0=Math.floor((cx-drift)/cell),gz0=Math.floor(cz/cell);
  for(let ring=0;ring<=4&&counts.fog<limit;ring++)for(let dz=-ring;dz<=ring&&counts.fog<limit;dz++)for(let dx=-ring;dx<=ring&&counts.fog<limit;dx++){
   if(Math.max(Math.abs(dx),Math.abs(dz))!==ring)continue;
   const gx=gx0+dx,gz=gz0+dz,seed=gx*173.3+gz*311.7;if(hash(seed,1)>.66)continue;
   const x=(gx+.15+.7*hash(seed,2))*cell+drift,z=(gz+.15+.7*hash(seed,3))*cell,d=Math.hypot(x-cx,z-cz);
   const fade=smooth(1.6,5,d)*smooth(far,far*.62,d);if(fade<.03)continue;
   const w=6+5*hash(seed,4),h=1.1+.9*hash(seed,5);if(!visible(x,h*.5,z,w*.55))continue;
   fogLight(x,z,moon);
   const breathe=.78+.22*Math.sin(time*.21+seed);
   haze.upright(x,h*.46+.04*Math.sin(time*.17+seed*2),z,w,h,fr,fg,fb,(software?.13:.16)*fade*breathe*(.55+.45*hash(seed,6))*Math.min(1,density*1.3),SOFT_FOG);counts.fog++;
  }
 }
 function halos(density){
  const limit=software?6:40;
  for(let i=0;i<lamps.length&&counts.halos<limit;i++){
   const a=lamps[i],p=a.position,d=Math.hypot(p.x-cx,p.z-cz);if(d>36||!visible(p.x,p.y+.2,p.z,1.2))continue;
   // Damp air blooms a distant flame more than a near one.
   const size=1.5+d*.07,power=a.intensity*(.07+.09*smooth(3,16,d))*smooth(36,26,d)*smooth(.6,2.4,d)*Math.min(1,density*1.3);
   glow.billboard(p.x,p.y+.22,p.z,size,size*.72,1,.60,.24,power,SOFT_GLOW);counts.halos++;
  }
 }
 const sideX=-MOON.z/Math.hypot(MOON.x,MOON.z),sideZ=MOON.x/Math.hypot(MOON.x,MOON.z),moonTurn=Math.atan2(MOON.x,MOON.z)+Math.PI;
 function shafts(time,density,moon,yaw){
  const limit=software?0:Math.round(7*density);if(!limit)return;
  // Slanting light is strongest when the eye looks up the beam toward the moon.
  const toward=.45+.55*clamp(Math.sin(yaw)*MOON.x-Math.cos(yaw)*MOON.z);
  for(let i=0;i<sites.length&&counts.shafts<limit;i++){
   const s=sites[i],d=Math.hypot(s.x-cx,s.z-cz);if(d>30||d<3)continue;
   const mx=s.x+MOON.x*s.length*.5,my=MOON.y*s.length*.5,mz=s.z+MOON.z*s.length*.5;if(!visible(mx,my,mz,s.length*.55))continue;
   const shimmer=.72+.28*Math.sin(time*.19+s.seed)*Math.sin(time*.071+s.seed*1.7),power=moon*shimmer*smooth(30,22,d)*smooth(3,7,d)*Math.min(1,density*1.3);
   // A canopy breaks the light into a few separate blades of differing width.
   for(let k=-1;k<=1;k++){
    const off=k*(.5+.25*Math.sin(s.seed+k)),flick=.75+.25*Math.sin(time*.33+s.seed*3+k*2.1);
    glow.along(s.x+sideX*off,0,s.z+sideZ*off,MOON.x,MOON.y,MOON.z,s.width*(1-.3*Math.abs(k)),s.length*(1-.12*Math.abs(k)),.52,.70,.88,.13*power*toward*flick,SOFT_SHAFT,1,0);
   }
   // The pale patch where they land, drawn into the turf itself.
   lit.flat(s.x,.032,s.z,1.5+s.width*1.6,2.4,moonTurn,.55,.72,.9,.9*power,SOFT_GLOW);
   counts.shafts++;
  }
 }
 // How far the lamp's beam runs before a hedge, wall or building stops it.
 function beamLength(ox,oz,dx,dz){
  for(let step=.5;step<=JOE_LAMP.reach;step+=.35){
   const x=ox+dx*step,z=oz+dz*step;
   for(let i=0;i<blockers.length;i++){const o=blockers[i],ex=(x-o.x)/o.rx,ez=(z-o.z)/o.rz;if(o.box?Math.abs(ex)<1&&Math.abs(ez)<1:ex*ex+ez*ez<1)return step;}
  }
  return JOE_LAMP.reach;
 }
 function mower(frame,time,density){
  const j=frame.joe;if(!j)return;
  const jx=j.x*xScale,jz=-j.y*scale,d=Math.hypot(jx-cx,jz-cz);if(d>(software?24:44)||!visible(jx,1,jz,JOE_LAMP.reach+1.5))return;
  const heading=j.effectHeading||0,dx=Math.cos(heading),dz=-Math.sin(heading),speed=j.effectSpeed||0,moving=speed>.4;
  const ox=jx+dx*JOE_LAMP.forward,oy=JOE_LAMP.height,oz=jz+dz*JOE_LAMP.forward,chase=j.mode==='chase';
  // A filament is never perfectly steady, and the deck shakes it while cutting.
  const flicker=.92+.05*Math.sin(time*31+jx)+.03*Math.sin(time*7.3),power=(chase?1.15:1)*flicker;
  const reach=beamReach=beamLength(ox,oz,dx,dz);
  if(lamp){
   const aim=Math.min(reach,4.6);lamp.position.set(ox-dx*.25,1.7,oz-dz*.25);lamp.target.position.set(ox+dx*aim,.25,oz+dz*aim);lamp.target.updateMatrixWorld();
   lamp.distance=reach+2.2;lamp.intensity=JOE_LAMP.power*power*(1-smooth(30,42,d));
  }
  const ex=cx-ox,ey=cy-oy,ez=cz-oz,eye=Math.hypot(ex,ey,ez)||1,facing=(ex*dx+ez*dz)/eye;
  // Seen from the side the beam is a cone of lit air; seen down its length it
  // is a glare around the lamp itself.
  const edgeOn=1-facing*facing*facing*facing;
  glow.along(ox,oy,oz,dx,-JOE_LAMP.dip,dz,reach*.46,reach,1,.90,.66,.34*power*edgeOn*Math.min(1,density*1.4),SOFT_BEAM,1,0);
  glow.billboard(ox,oy,oz,.34,.34,1,.93,.74,.9*power,SOFT_GLOW);
  const glare=Math.pow(Math.max(0,facing),3)*smooth(JOE_LAMP.reach*3.4,3,eye);
  if(glare>.02)glow.billboard(ox,oy,oz,1+2*glare,.75+1.5*glare,1,.90,.66,.46*glare*power,SOFT_GLOW);
  counts.lamp=3;
  // The pool the beam throws on the turf, and the splash where it meets cover.
  const pool=Math.min(reach,6.2),turn=heading-Math.PI/2;
  // Each pass can at most double what is beneath it, so the pool is laid
  // down as three nested passes: brightest where they all overlap.
  if(!lamp)for(let i=0;i<3;i++){const k=1-i*.24;lit.flat(ox+dx*pool*(.52-i*.07),.034+i*.002,oz+dz*pool*(.52-i*.07),(1.7+pool*.38)*k,pool*.66*k,turn,1,.88,.60,Math.min(1,power),SOFT_GLOW);}
  if(!lamp)glow.flat(ox+dx*pool*.5,.036,oz+dz*pool*.5,1.3+pool*.3,pool*.58,turn,1,.84,.54,.22*power,SOFT_GLOW);
  if(reach<JOE_LAMP.reach-.01){
   const hx=ox+dx*(reach-.12),hz=oz+dz*(reach-.12),near=1-reach/JOE_LAMP.reach,size=.9+reach*.2;
   if(!lamp)for(let i=0;i<2;i++)lit.put(hx-dx*i*.02,.62,hz-dz*i*.02,-dz*size*(1-i*.3),0,dx*size*(1-i*.3),0,size*.72*(1-i*.3),0,1,.88,.60,Math.min(1,power*(.55+near)),SOFT_GLOW);
   glow.put(hx,.6,hz,-dz*size*.8,0,dx*size*.8,0,size*.6,0,1,.88,.62,.10*power*(.4+near),SOFT_GLOW);counts.lamp++;
  }
  // Clippings fly out of the deck and through the beam while the blade is cutting.
  if(moving){
   const count=Math.round((software?6:16)*density);
   for(let i=0;i<count;i++){
    const life=.62,turnI=time/life+hash(i,5.3),cycle=Math.floor(turnI),p=turnI-cycle,t=p*life,a=hash(i+.3,cycle),b=hash(i+4.1,cycle*1.3),side=(a-.5)*2.6;
    const vx=dx*(1.5+1.6*b)-dz*side,vz=dz*(1.5+1.6*b)+dx*side,vy=1.3+1.5*hash(i+7,cycle);
    const x=jx+dx*.62+vx*t,y=.12+vy*t-4.6*t*t,z=jz+dz*.62+vz*t;if(y<.02)continue;
    // Bright only where they cross the cone ahead of the lamp.
    const ahead=(x-ox)*dx+(z-oz)*dz,off=Math.abs((x-ox)*-dz+(z-oz)*dx),inBeam=ahead>0?clamp(1-off/(.18+ahead*.42))*clamp(1-ahead/reach):0,shine=.16+1.5*inBeam*power;
    haze.along(x,y,z,vx+Math.sin(i+time*9),vy-9.2*t,vz+Math.cos(i*1.7+time*8),.022+.016*a,.05+.035*b,.50*shine,.66*shine,.26*shine,(1-p*p)*.9,SOFT_FLECK);counts.clippings++;
   }
  }
  // Two-stroke haze hangs behind the engine and trails when he moves.
  const puffs=Math.round((software?2:5)*Math.min(1,density*1.3)),trail=moving?Math.min(2.2,speed*scale*1.2):.12;
  for(let i=0;i<puffs;i++){
   const life=1.9,turnI=time/life+i/puffs,cycle=Math.floor(turnI),p=turnI-cycle,a=hash(i+2.2,cycle);
   const x=jx+dx*(.42-trail*p*life)-dz*(.24+(a-.5)*.3*p),y=.42+.55*p+.1*a,z=jz+dz*(.42-trail*p*life)+dx*(.24+(a-.5)*.3*p),size=.22+.75*p;
   fogLight(x,z,.8);haze.billboard(x,y,z,size,size*.85,fr*.9+.05,fg*.9+.05,fb*.9+.05,Math.sin(Math.min(1,p*5)*Math.PI/2)*(1-p)*.20,SOFT_PUFF);counts.exhaust++;
  }
 }
 // Each recorded footfall throws what the ground is made of: water from a wet
 // zone, torn blades from the rough. A walker's own feet are below the frame
 // and each print is left behind at once, so the throw is kicked forward off
 // the toe, into the ground the walker is actually looking at.
 function footfalls(frame,density){
  const steps=frame.steps;if(!steps||!steps.length)return;
  for(let n=Math.max(0,steps.length-(software?2:4));n<steps.length;n++){
   const step=steps[n],t=clamp(step.age/step.duration);if(t>=.85)continue;
   const heading=step.heading||0,fx=Math.cos(heading),fz=-Math.sin(heading),wet=step.kind==='wet',force=.55+.45*(step.intensity??.7),seed=step.id||n;
   const lead=1.05+.6*force,x=step.x*xScale+fx*lead,z=-step.y*scale+fz*lead;
   if(Math.hypot(x-cx,z-cz)>14)continue;
   if(wet){
    fogLight(x,z,1);const r=fr*2.1+.12,g=fg*2.1+.12,b=fb*2.1+.12,time=t*.7;
    if(t<.45){const h=(.10+.55*t)*force,w=.18+.5*t;haze.upright(x,.03+h*.5,z,w,h,r,g,b,(1-t/.45)*.9,SOFT_CROWN);counts.steps++;}
    if(t<.6){const size=.25+.7*t;haze.upright(x+fx*.25*t,.10+.16*t,z+fz*.25*t,size,size*.5,r*.6,g*.6,b*.6,(1-t/.6)*.22*density,SOFT_PUFF);counts.steps++;}
    for(let i=0;i<(software?4:11);i++){
     const a=hash(i,seed)*6.283,out=(.25+.75*hash(i+3,seed))*force,ahead=(1.9+2.6*hash(i+9,seed))*force,up=(1.8+2.2*hash(i+5,seed))*force,vx=Math.cos(a)*out+fx*ahead,vz=Math.sin(a)*out+fz*ahead,y=.03+up*time-4.6*time*time;if(y<.02)continue;
     haze.along(x+vx*time,y,z+vz*time,vx,up-9.2*time,vz,.032,.08+.08*hash(i+1,seed),r,g,b,(1-t*t)*.95,SOFT_DROP);counts.steps++;
    }
   }else if(step.kind==='rough'&&density>.3){
    fogLight(x,z,1);const r=fr*.6+.05,g=fg*.8+.10,b=fb*.3+.03,time=t*.6;
    for(let i=0;i<(software?3:7);i++){
     const a=hash(i,seed)*6.283,out=.5+1.1*hash(i+3,seed),ahead=(1.2+1.8*hash(i+9,seed))*force,up=(1.2+1.5*hash(i+5,seed))*force,vx=Math.cos(a)*out+fx*ahead,vz=Math.sin(a)*out+fz*ahead,y=.06+up*time-3.4*time*time;if(y<.02)continue;
     haze.along(x+vx*time,y,z+vz*time,vx+Math.sin(i+t*14),up-6.8*time+Math.cos(i*2+t*11),vz+Math.cos(i+t*12),.018,.07+.05*hash(i+1,seed),r,g,b,(1-t*t)*.95,SOFT_FLECK);counts.steps++;
    }
   }
  }
 }
 function hide(){if(haze.mesh.visible||glow.mesh.visible||lit.mesh.visible){for(const batch of [haze,glow,lit]){batch.mesh.count=0;batch.mesh.visible=false;}updates++;}if(lamp)lamp.intensity=0;lastTime=NaN;}
 function update(frame,camera,coverage=0){
  const density=clamp(frame.fx?.density??1),e=camera.matrixWorld.elements;
  if(frame.fx?.enabled===false||density<=0){hide();return;}
  // A repeated or paused frame (same clock, same view) is left untouched.
  let same=frame.time===lastTime&&density===lastDensity&&camera.fov===lastFov&&camera.aspect===lastAspect;
  for(let i=0;i<16;i++){if(lastCamera[i]!==Math.fround(e[i]))same=false;lastCamera[i]=e[i];}
  if(same)return;
  const started=performance.now();lastTime=frame.time;lastDensity=density;lastFov=camera.fov;lastAspect=camera.aspect;updates++;
  cx=e[12];cy=e[13];cz=e[14];counts.fog=counts.halos=counts.shafts=counts.lamp=counts.clippings=counts.exhaust=counts.steps=0;
  projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
  haze.begin(camera);glow.begin(camera);lit.begin(camera);if(lamp)lamp.intensity=0;
  const wind=frame.fx?.wind,windX=(wind?.direction<0?-1:1)*(.25+.75*clamp(wind?.strength||0)),moon=(1-clamp(coverage,0,.85)*.5)*(frame.fx?.nightfall?.moonScale??1);
  const thin=frame.fx?.clear?.7:1;
  fog(frame.time,density*thin,windX,moon);halos(density);shafts(frame.time,density*thin,moon,frame.yaw||0);mower(frame,frame.time,density);footfalls(frame,density);
  haze.finish();glow.finish();lit.finish();
  lastCost=performance.now()-started;maxCost=Math.max(maxCost,lastCost);
 }
 return {update,setLamps,stats:()=>({...counts,instances:haze.mesh.count+glow.mesh.count+lit.mesh.count,capacity:haze.capacity+glow.capacity+lit.capacity,drawCalls:Number(haze.mesh.visible)+Number(glow.mesh.visible)+Number(lit.mesh.visible),shaftSites:sites.length,lampIntensity:lamp?lamp.intensity:0,lamps:lamps.length,beamReach,updates,updateMs:lastCost,maxUpdateMs:maxCost}),dispose(){haze.dispose();glow.dispose();lit.dispose();}};
}
