import * as THREE from './vendor/three/three.module.js';

export const VEGETATION_PADDING = .65;
const LIFE=1.2;

// Two bodies and two recent contact locations per body. This is presentation
// only: the simulation's tracks, hearing and cover still own gameplay evidence.
export function createVegetationContact({scale=.16,xScale=.1152}={}) {
  const points=Array.from({length:6},()=>new THREE.Vector4(0,0,0,0));
  const actors=[{last:null,wakes:[]},{last:null,wakes:[]}];
  let time=null;
  function update(frame){
    if(frame.paused)return;
    if(time!==null&&frame.time<time){for(const a of actors){a.last=null;a.wakes=[];}}
    if(time===frame.time)return;
    time=frame.time;
    [frame.player,frame.joe].forEach((body,i)=>{
      const actor=actors[i],radius=i?.95:.58,strength=i?1:.72;
      if(!body){actor.last=null;actor.wakes=[];for(let j=0;j<3;j++)points[i*3+j].set(0,0,0,0);return;}
      // Joe's visual deck sits ahead of his feet along effectHeading. Center
      // the contact envelope between his stance and that deck.
      const heading=body.effectHeading||0,offset=i?.45:0;
      const current={x:body.x*xScale+Math.cos(heading)*offset,z:-body.y*scale-Math.sin(heading)*offset,time};
      if(actor.last){
        const distance=Math.hypot(current.x-actor.last.x,current.z-actor.last.z);
        if(distance>4)actor.wakes=[];
        else if(distance>.28&&!frame.reducedMotion){actor.wakes.unshift({...actor.last,time});actor.wakes.length=Math.min(2,actor.wakes.length);}
        if(distance>.28)actor.last=current;
      }else actor.last=current;
      if(frame.reducedMotion)actor.wakes=[];
      actor.wakes=actor.wakes.filter(w=>time-w.time<LIFE);
      points[i*3].set(current.x,current.z,radius,strength);
      for(let j=0;j<2;j++){const w=actor.wakes[j];points[i*3+j+1].set(w?.x||0,w?.z||0,radius,w?strength*.7*(1-(time-w.time)/LIFE)**2:0);}
    });
  }
  function shader(shader){
    shader.uniforms.vegetationContacts={value:points};
    shader.vertexShader='uniform vec4 vegetationContacts[6];\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      mat4 vegetationTransform=modelMatrix;
      #ifdef USE_INSTANCING
        vegetationTransform=modelMatrix*instanceMatrix;
      #endif
      vec3 vegetationWorld=(vegetationTransform*vec4(position,1.0)).xyz;
      vec2 vegetationAnchor=vegetationWorld.xz;
      #ifdef USE_INSTANCING
        vegetationAnchor=vegetationTransform[3].xz;
      #endif
      vec2 vegetationPush=vec2(0.0);
      for(int contactIndex=0;contactIndex<6;contactIndex++){
        vec4 contact=vegetationContacts[contactIndex];
        vec2 away=vegetationAnchor-contact.xy;
        float reach=max(.001,contact.z);
        float distanceSquared=dot(away,away);
        if(contact.w>0.0&&distanceSquared<reach*reach){
          float distanceToBody=sqrt(distanceSquared);
          float weight=1.0-distanceToBody/reach;
          vegetationPush+=away/max(.12,distanceToBody)*weight*weight*contact.w;
        }
      }
      vegetationPush/=max(1.0,length(vegetationPush));
      vegetationPush*=min(.45,max(0.0,vegetationWorld.y)*.55)*uv.y*uv.y;
      vec3 vegetationDelta=vec3(vegetationPush.x,-length(vegetationPush)*.22,vegetationPush.y);
      transformed+=vec3(dot(vegetationDelta,vegetationTransform[0].xyz)/dot(vegetationTransform[0].xyz,vegetationTransform[0].xyz),
        dot(vegetationDelta,vegetationTransform[1].xyz)/dot(vegetationTransform[1].xyz,vegetationTransform[1].xyz),
        dot(vegetationDelta,vegetationTransform[2].xyz)/dot(vegetationTransform[2].xyz,vegetationTransform[2].xyz));`);
  }
  function attach(material){const previous=material.onBeforeCompile,key=material.customProgramCacheKey();material.onBeforeCompile=function(s,r){previous.call(this,s,r);shader(s);};material.customProgramCacheKey=()=>key+'-course-contact-v1';}
  return {update,attach,shader,stats:()=>({time,contacts:points.map(p=>p.toArray())})};
}
