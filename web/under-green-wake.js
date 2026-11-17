import * as THREE from './vendor/three/three.module.js';

// One shared record of who is disturbing standing water, for the flood plane
// and the shallow pools. Per wader: world x, world z, eased disturbance and
// heading (radians from +x toward +z). The player is first, Joe second.
// Presentation memory only: it reads the run and never writes it.
export const drainWakes={value:[new THREE.Vector4(),new THREE.Vector4()]};
let owner=null,clock=null;const last=new Float64Array(4);
export function updateDrainWakes(r){
 if(owner===r&&clock===r.time)return;
 const reset=owner!==r||clock===null||r.time<clock||r.time-clock>.5,step=reset?0:r.time-clock;owner=r;clock=r.time;
 for(let n=0;n<2;n++){
  const wader=n?r.joe:r.player,wake=drainWakes.value[n],dx=wader.x-last[n*2],dz=-(wader.y-last[n*2+1]);
  const present=n===0||!['absent','enter'].includes(r.joe.phase),pace=step>0?Math.hypot(dx,dz)/step:0,target=present?Math.min(1,pace*.3)*(n?1.25:1):0;
  wake.x=wader.x;wake.y=-wader.y;wake.z=reset?0:wake.z+(target-wake.z)*(1-Math.exp(-step*(target>wake.z?5:1.3)));
  if(pace>.3&&pace<9)wake.w=Math.atan2(dz,dx);
  last[n*2]=wader.x;last[n*2+1]=wader.y;
 }
}
// Rings radiate from each wader and a short crest is pushed ahead of a moving
// one. `point` is the fragment's world x/z, `clock` the surface's own time.
export const drainWakeUniforms='uniform vec4 drainWakes[2];\n';
export const drainWakeShader=(point,clock)=>`
   vec2 drainWakeSlope=vec2(0.);float drainWakeBow=0.;
   for(int i=0;i<2;i++){
    vec2 away=${point}-drainWakes[i].xy;float reach=length(away)+.001,disturbance=drainWakes[i].z;
    vec2 heading=vec2(cos(drainWakes[i].w),sin(drainWakes[i].w));float ahead=dot(away,heading)/reach;
    drainWakeSlope+=away/reach*cos(reach*8.5-${clock}*6.5+float(i)*1.7)*disturbance*exp(-reach*.4)*smoothstep(.05,.4,reach)*.5;
    float crest=disturbance*smoothstep(.35,.9,ahead)*exp(-pow((reach-2.3-.25*sin(${clock}*5.+ahead*9.))/.3,2.));
    drainWakeBow=max(drainWakeBow,crest);drainWakeSlope+=away/reach*crest*.45;
   }`;
