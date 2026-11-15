import * as THREE from './vendor/three/three.module.js';
import {pondBankGLSL,pondBankSeed} from './course-pond-bank.js';

export const WATER_HEIGHT=.083;
const INTERVAL=.91,GRAVITY=9.8,LIFE=1.65;

// Both the solid outlet and its water use this physical lip, in pond-local metres.
export function runoffLayout(rx,rz){
  return {x:-rx*.58,bankZ:rz*.66,lipZ:rz*.35,pipeY:.43,radius:.105,
    lipY:.43-.078};
}

export function buildPondRunoff(root,rx,rz,{box,mesh}){
  const p=runoffLayout(rx,rz),length=p.bankZ-p.lipZ;
  // Split masonry cheeks and lintel leave a real recessed opening. All pieces
  // remain inside the existing blocked pond footprint.
  for(const side of [-1,1])for(let row=0;row<3;row++)
    box(root,'stone',p.x+side*.235,.105+row*.18,p.bankZ,.17,.18,.25,
      [0x74867c,0x859186,0x687a70][row],.025);
  box(root,'stone',p.x,.60,p.bankZ,.65,.12,.27,0x869185,.025);
  box(root,'stone',p.x,.075,p.bankZ-.07,.64,.15,.40,0x596b60,.025);
  const section=[[.105,0],[.105,length],[.078,length],[.078,0],[.105,0]];
  const tube=new THREE.LatheGeometry(section.map(([r,y])=>new THREE.Vector2(r,y)),16);
  tube.rotateX(-Math.PI/2);
  mesh(root,tube,'iron',0x61766a,p.x,p.pipeY,p.bankZ);
  const collar=new THREE.TorusGeometry(.108,.018,5,16);collar.rotateY(0);
  mesh(root,collar,'rust',0x85704a,p.x,p.pipeY,p.lipZ+.025);
  // A dark backplate is recessed behind the open tube, never across its lip.
  const back=new THREE.CircleGeometry(.079,16);
  mesh(root,back,'iron',0x14231c,p.x,p.pipeY,p.bankZ+.004).rotation.y=Math.PI;
  for(const side of [-1,1])box(root,'iron',p.x+side*.19,.42,p.bankZ-.14,.045,.075,.025,0x859589,.008);
  return p;
}

// Analytic flight and impact share the same trajectory. No random surface rings,
// frame-count dependence, offscreen accumulation or simulation side effects.
export function runoffPose(time,layout){
  const fall=Math.sqrt(2*(layout.lipY-WATER_HEIGHT)/GRAVITY),drops=[],impacts=[];
  const latest=Math.floor(time/INTERVAL);
  for(let serial=Math.max(0,latest-2);serial<=latest;serial++){
    const age=time-serial*INTERVAL,vx=Math.sin(serial*2.4)*.09,vz=-.12;
    const x=layout.x+vx*Math.min(age,fall),z=layout.lipZ+vz*Math.min(age,fall);
    if(age<fall)drops.push({x,y:layout.lipY-GRAVITY*age*age*.5,z,stretch:1+age*3,serial});
    else if(age-fall<LIFE)impacts.push({x,z,age:age-fall,strength:.65+.15*Math.sin(serial*1.7)**2,serial});
  }
  return {drops,impacts};
}

export function createPondRunoff(parent,x,z,rx,rz){
  const layout=runoffLayout(rx,rz),geometry=new THREE.BoxGeometry(.017,.028,.017);
  const material=new THREE.MeshLambertMaterial({color:0xadc4be});
  const mesh=new THREE.InstancedMesh(geometry,material,1),dummy=new THREE.Object3D();
  mesh.name='PondRunoffDroplets';mesh.position.set(x,0,z);mesh.count=0;mesh.frustumCulled=false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);parent.add(mesh);
  // Only the small impact quads run the ring shader. Evaluating several rings
  // across the entire pond was substantially slower on the software renderer.
  const ringGeometry=new THREE.PlaneGeometry(1,1);ringGeometry.rotateX(-Math.PI/2);
  const ringShape=new THREE.InstancedBufferAttribute(new Float32Array(6),2);ringShape.setUsage(THREE.DynamicDrawUsage);ringGeometry.setAttribute('rippleShape',ringShape);
  const ringMaterial=new THREE.MeshBasicMaterial({color:0x071012,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  ringMaterial.onBeforeCompile=shader=>{
    shader.uniforms.runoffOrigin={value:new THREE.Vector2(x,z)};shader.uniforms.runoffShape={value:new THREE.Vector2(rx,rz)};shader.uniforms.runoffSeed={value:pondBankSeed(x,z)};
    shader.vertexShader='attribute vec2 rippleShape;\nuniform vec2 runoffOrigin;\nvarying vec2 vRippleShape;\nvarying vec2 vRippleCenter;\nvarying vec2 vPondMeters;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 rippleWorld=modelMatrix*instanceMatrix*vec4(transformed,1.0);
      vec4 rippleCenter=modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
      vPondMeters=vec2(rippleWorld.x-runoffOrigin.x,runoffOrigin.y-rippleWorld.z);
      vRippleCenter=vec2(rippleCenter.x-runoffOrigin.x,runoffOrigin.y-rippleCenter.z);vRippleShape=rippleShape;`);
    shader.fragmentShader='uniform vec2 runoffShape;\nuniform float runoffSeed;\nvarying vec2 vRippleShape;\nvarying vec2 vRippleCenter;\nvarying vec2 vPondMeters;\n'+pondBankGLSL+'\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 bank=vPondMeters/runoffShape;
      if(length(bank)>pondEdge(atan(bank.y,bank.x),runoffSeed))discard;
      vec2 p=floor(vPondMeters*96.0)/96.0;
      float d=length(p-vRippleCenter),r=vRippleShape.x;
      float crest=1.0-smoothstep(.012,.027,abs(d-r));
      float trailing=(1.0-smoothstep(.009,.021,abs(d-r*.68)))*.38;
      float arc=step(.28,fract(floor(p.x*48.0)*.173+floor(p.y*48.0)*.379));
      diffuseColor.a*=min(1.0,(crest+trailing)*arc*vRippleShape.y);
      if(diffuseColor.a<.005)discard;`);
  };
  ringMaterial.customProgramCacheKey=()=> 'course-contact-ripple-v1';
  const rings=new THREE.InstancedMesh(ringGeometry,ringMaterial,3);rings.name='PondContactRipples';rings.position.set(x,0,z);rings.count=0;rings.visible=false;rings.frustumCulled=false;rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);parent.add(rings);
  let time=0,last=null,pose={drops:[],impacts:[]};
  const contacts=Array.from({length:3},()=>new THREE.Vector4());
  return {setLight(tint,power){
    ringMaterial.color.setRGB(.003+(tint.r*.022-.003)*power,.006+(tint.g*.037-.006)*power,.007+(tint.b*.035-.007)*power);
  },update(frame){
    if(frame.paused)return;
    if(last!==null&&frame.time<last)time=0;
    const dt=last===null?0:Math.max(0,Math.min(.1,frame.time-last));last=frame.time;
    const enabled=!frame.reducedMotion&&(frame.fx?.density??1)>0;
    if(enabled)time+=dt;
    pose=enabled?runoffPose(time,layout):{drops:[],impacts:[]};
    mesh.count=pose.drops.length;mesh.visible=mesh.count>0;
    for(let i=0;i<pose.drops.length;i++){
      const d=pose.drops[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(1,d.stretch,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    if(mesh.count)mesh.instanceMatrix.needsUpdate=true;
    for(let i=0;i<3;i++){
      const c=pose.impacts[i];
      if(!c){contacts[i].set(0,0,0,0);continue;}
      const fade=Math.max(0,1-c.age/LIFE),enter=Math.min(1,c.age/.06);
      contacts[i].set(c.x,-c.z,.025+c.age*.44,c.strength*fade*fade*enter*enter*(3-2*enter));
    }
    rings.count=pose.impacts.length;rings.visible=rings.count>0;
    for(let i=0;i<rings.count;i++){
      const c=contacts[i],size=(c.z+.04)*2;dummy.position.set(c.x,WATER_HEIGHT+.002,-c.y);dummy.scale.set(size,1,size);dummy.updateMatrix();rings.setMatrixAt(i,dummy.matrix);ringShape.setXY(i,c.z,c.w);
    }
    if(rings.count){rings.instanceMatrix.needsUpdate=true;ringShape.needsUpdate=true;}
  },stats:()=>({time,lip:[x+layout.x,layout.lipY,z+layout.lipZ],drops:pose.drops.map(d=>({...d,x:d.x+x,z:d.z+z})),contacts:pose.impacts.map(c=>({...c,x:c.x+x,z:c.z+z})),capacity:3,extraDraws:(mesh.count?1:0)+(rings.count?1:0)})};
}
