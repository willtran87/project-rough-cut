// Presentation-only finish for Under the Green: the shared screen finish,
// moths at the lamps, the scythe's cutting trail and small camera reactions.
// Everything here reads the run and never writes it. Moths and the trail are
// analytic in simulation time, so pause freezes them and every frame rate
// shows the same motion. Cost: at most two draw calls (moths, trail).
import * as THREE from './vendor/three/three.module.js';
import {createScreenFinish,LOOKS} from './screen-finish.js?v=20261119-polish';
import {TRIMMER,trimmerSegment} from './under-green-trimmer.js';
import {dampLampLevel} from './under-green-atmosphere.js';

const MOTHS_PER_LAMP=3,TRAIL_STEPS=9,TRAIL_SECONDS=.13;
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
// Door thrown open: accelerates into its stop, then rebounds twice.
export function arrivalDoorAngle(phase,age,doorSeconds,reduced=false){
 if(phase==='absent')return 0;if(phase!=='enter')return -1.6;
 const t=clamp(age/doorSeconds);if(t<1)return -1.6*t*t;
 if(reduced)return -1.6;
 const s=age-doorSeconds;return -1.6*(1-.085*Math.exp(-3.4*s)*Math.abs(Math.sin(7.5*s)));
}
// One moth's place around its lamp. Two summed orbits read as fluttering.
export function mothSample(lamp,index,time){
 const seed=lamp.x*1.31+lamp.y*.77+index*2.399,rate=1.7+(index%3)*.55,a=time*rate+seed,b=time*rate*2.3+seed*1.7;
 const radius=.2+.11*Math.sin(b*.37+index),height=(lamp.height||2.8)-.34;
 return {x:lamp.x+Math.cos(a)*radius+Math.cos(b)*.05,y:lamp.y+Math.sin(a)*radius*.8+Math.sin(b*1.3)*.05,height:height+Math.sin(a*1.3+index)*.12+Math.sin(b)*.03,flap:.55+.45*Math.sin(time*31+seed)};
}

export function createDrainPolish({scene,camera,renderer,lamps,software=false,reduced=false,filmGrain=true}){
 const finish=createScreenFinish(THREE,renderer,{look:LOOKS.underGreen,level:software?'off':'high',reduced});
 const baseGrain=LOOKS.underGreen.grain;if(!filmGrain)finish.setLook({grain:0});
 let effects=true,qualityFinish='high';
 // Moths: one instanced draw. Pale wings catch the lamp, so they are unlit.
 const mothGeometry=new THREE.PlaneGeometry(1,1),mothMaterial=new THREE.MeshBasicMaterial({color:0xd9cfae,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide});
 const moths=new THREE.InstancedMesh(mothGeometry,mothMaterial,lamps.length*MOTHS_PER_LAMP),dummy=new THREE.Object3D();
 moths.name='Lamp moths';moths.frustumCulled=false;moths.instanceMatrix.setUsage(THREE.DynamicDrawUsage);moths.count=0;scene.add(moths);
 // Scythe trail: a short ribbon behind the blade for the cut itself.
 const trailGeometry=new THREE.BufferGeometry(),trailPositions=new Float32Array(TRAIL_STEPS*2*3),trailColors=new Float32Array(TRAIL_STEPS*2*3),trailIndex=[];
 for(let i=0;i<TRAIL_STEPS-1;i++){const a=i*2;trailIndex.push(a,a+1,a+2,a+1,a+3,a+2);}
 trailGeometry.setAttribute('position',new THREE.BufferAttribute(trailPositions,3).setUsage(THREE.DynamicDrawUsage));trailGeometry.setAttribute('color',new THREE.BufferAttribute(trailColors,3).setUsage(THREE.DynamicDrawUsage));trailGeometry.setIndex(trailIndex);
 const trailMaterial=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
 const trail=new THREE.Mesh(trailGeometry,trailMaterial);trail.name='Scythe cutting trail';trail.frustumCulled=false;trail.visible=false;trail.renderOrder=4;scene.add(trail);
 const state={moths:0,trail:false,fovKick:0,shake:0,tension:0};
 let owner=null,lastTime=0,sprint=0,lastHits=0,hitAt=-9,sealAt=-9,sealed=false,missAt=-9;
 function updateMoths(r,calm){
  let count=0;
  if(effects&&!software)for(let l=0;l<lamps.length;l++){
   const lamp=lamps[l];if(Math.hypot(lamp.x-r.player.x,lamp.y-r.player.y)>26)continue;
   const lit=dampLampLevel(r.time,l,calm);
   for(let i=0;i<MOTHS_PER_LAMP;i++){
    const m=mothSample(lamp,i,calm?0:r.time);dummy.position.set(m.x,m.height,-m.y);dummy.quaternion.copy(camera.quaternion);
    // A failing lamp loses its moths' glow rather than the insects.
    const size=.028*(.5+.5*lit);dummy.scale.set(size*(.45+m.flap*.9),size,1);dummy.updateMatrix();moths.setMatrixAt(count++,dummy.matrix);
   }
  }
  moths.count=count;moths.visible=count>0;if(count)moths.instanceMatrix.needsUpdate=true;state.moths=count;
 }
 function updateTrail(r){
  const j=r.joe,sweeping=j.phase==='sweep'&&!j.weaponBlocked,after=j.phase==='recover'&&!j.recoveryBlocked;
  const head=sweeping?j.age:after?TRIMMER.sweepSeconds+j.age:-1;
  trail.visible=effects&&head>=0&&head-TRAIL_SECONDS<TRIMMER.sweepSeconds;state.trail=trail.visible;
  if(!trail.visible)return;
  for(let i=0;i<TRAIL_STEPS;i++){
   const f=i/(TRAIL_STEPS-1),age=clamp(head-TRAIL_SECONDS*(1-f),0,TRIMMER.sweepSeconds),s=trimmerSegment({x:j.x,y:j.y,yaw:j.attackYaw??j.yaw,phase:'sweep',age});
   // Fades toward its tail, and out altogether once the blade has stopped.
   const level=f*f*clamp(1-(head-TRIMMER.sweepSeconds)/TRAIL_SECONDS)*.3,o=i*6;
   trailPositions[o]=s.near.x+(s.far.x-s.near.x)*.55;trailPositions[o+1]=s.near.height+(s.far.height-s.near.height)*.55;trailPositions[o+2]=-(s.near.y+(s.far.y-s.near.y)*.55);
   trailPositions[o+3]=s.far.x;trailPositions[o+4]=s.far.height;trailPositions[o+5]=-s.far.y;
   trailColors[o]=level*.5;trailColors[o+1]=level*.56;trailColors[o+2]=level*.5;trailColors[o+3]=level*.86;trailColors[o+4]=level*.95;trailColors[o+5]=level*.84;
  }
  trailGeometry.attributes.position.needsUpdate=true;trailGeometry.attributes.color.needsUpdate=true;
 }
 return {
  finish,
  setQuality(preset){effects=preset.effects!==false;qualityFinish=preset.finish;finish.setLevel(software?'off':preset.finish);},
  setFilmGrain(on){finish.setLook({grain:on?baseGrain:0});},
  // feel: {tension 0..1, pulse 0..1, flash 0..1, missAt (run time of the last near miss)}.
  update(r,prefs,feel={},photo=false){
   const calm=!!prefs.reduced,p=r.player;
   if(owner!==r||r.time<lastTime){owner=r;sprint=0;lastHits=r.waterHits;hitAt=sealAt=missAt=-9;sealed=r.finished;}
   const dt=clamp(r.time-lastTime,0,.1);lastTime=r.time;
   updateMoths(r,calm);updateTrail(r);
   finish.setReduced(calm);finish.setTension(photo?0:feel.tension||0);finish.setPulse(photo?0:feel.pulse||0);finish.setFlash(photo?0:feel.flash||0,0xd8e6dc);
   state.tension=feel.tension||0;
   if(r.waterHits>lastHits)hitAt=r.time;lastHits=r.waterHits;
   if(r.finished&&!sealed)sealAt=r.time;sealed=r.finished;
   if(Number.isFinite(feel.missAt))missAt=feel.missAt;
   // The lamps dip as the service door is thrown open.
   const j=r.joe,dip=!calm&&!photo&&j.phase==='enter'&&j.age<.42?(Math.sin(j.age*47)>.1?.74:.93):1;finish.setFade(dip);
   if(photo||calm){sprint=0;state.fovKick=state.shake=0;return;}
   // Running opens the view a little; impacts shake it briefly.
   sprint+=((p.sprinting&&p.speed>4?1:0)-sprint)*(1-Math.exp(-dt*6));
   const amount=clamp((prefs.cameraBob??.25)/.25),kick=sprint*2.6*amount;
   const pulse=(at,seconds,size)=>{const age=r.time-at;return age>=0&&age<seconds?size*(1-age/seconds)**2:0;};
   const shake=(pulse(hitAt,.45,.022)+pulse(sealAt,.5,.012)+pulse(missAt,.3,.014))*amount;
   state.fovKick=kick;state.shake=shake;
   // Each Use action leans the view into the control for a moment.
   const useAge=r.time-(feel.useAt??-9);if(useAge>=0&&useAge<.42){const lean=Math.sin(Math.PI*useAge/.42)**2*amount;camera.rotation.x-=.035*lean;camera.position.y-=.025*lean;state.useLean=lean;}else state.useLean=0;
   if(kick>.01){camera.fov+=kick;camera.updateProjectionMatrix();}
   if(shake>0){camera.rotation.z+=Math.sin(r.time*83)*shake;camera.rotation.x+=Math.sin(r.time*67+1)*shake*.6;camera.position.y+=Math.sin(r.time*71)*shake*.5;}
  },
  // Call after the scene has been drawn to the screen.
  apply(r){return finish.apply(r.time);},
  stats:()=>({...state,level:finish.level,applied:finish.applied,qualityFinish,effects,extraDraws:(moths.visible?1:0)+(trail.visible?1:0)}),
  dispose(){finish.dispose();moths.removeFromParent();trail.removeFromParent();mothGeometry.dispose();mothMaterial.dispose();trailGeometry.dispose();trailMaterial.dispose();}
 };
}
