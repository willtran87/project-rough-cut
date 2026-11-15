import {createJoeSurfaceFinish} from './under-green-actor-surfaces.js';
import {attackActing} from './under-green-attack-acting.js';
import {featheredContactGeometry,contactShadeMaterial} from './under-green-contact-shade.js';
import {buildGrassScythe} from './under-green-scythe-scene.js';
import {SCYTHE_GRIPS,SCYTHE_CONTACT} from './under-green-scythe.js';
import {TRIMMER,trimmerPose} from './under-green-trimmer.js';
import {solveTwoBoneGrip} from './two-bone-ik.js';
import {createPlantedFootwork,createWalkingSupports} from './under-green-footwork.js';
import {createFootContactEvents} from './foot-contact-events.js';
import * as THREE from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
// Longer steps retain the baked stance fraction and applied-distance timing.
const WALK_CYCLE=1.1,BAKED_CYCLE=.46/.62,HIP_FORWARD=.12,HIP_DROP=.04;
// Joe's shipped skinned model and original face/materials; the mower was
// removed in the existing rider asset. The scythe is physical articulated art.
export async function createTrimmerJoe(scene,materials){
 const root=new THREE.Group();scene.add(root);
 const gltf=await new GLTFLoader().loadAsync('./assets/models/joe-riding-pixel.glb');
 const finish=createJoeSurfaceFinish();
 const actor=gltf.scene;root.add(actor);let chest=null,head=null;const bones=new Map();
 let skinMap=null;actor.traverse(o=>{if(o.material?.name==='Skin')skinMap=o.material.map;});
 actor.traverse(o=>{if(o.name==='MowerRigidBody'||o.name.startsWith('Wheel'))o.visible=false;if(o.isBone)bones.set(o.name,o);if(o.name==='Chest')chest=o;if(o.name==='Head')head=o;if(o.isMesh){o.frustumCulled=false;const list=Array.isArray(o.material)?o.material:[o.material];o.material=list.map(m=>{if(m.map){m.map.magFilter=THREE.NearestFilter;m.map.minFilter=THREE.NearestMipmapLinearFilter;}const mat=finish.material(m),face=m.name==='Face'&&!!o.geometry.attributes.color&&!!skinMap;mat.onBeforeCompile=s=>{if(face){s.uniforms.joeSkin={value:skinMap};s.vertexShader='attribute vec3 color; varying float faceWeight; varying vec2 skinUv;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfaceWeight=color.r;skinUv=position.xy*1.2+vec2(.2);');s.fragmentShader='uniform sampler2D joeSkin; varying float faceWeight; varying vec2 skinUv;\n'+s.fragmentShader;}s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+(face?'diffuseColor.rgb=mix(texture2D(joeSkin,fract(skinUv)).rgb,diffuseColor.rgb,clamp(faceWeight,0.,1.));':'')+'diffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.)),vec3(.78));');};mat.customProgramCacheKey=()=>face?'ug-joe-face':'ug-joe-surface';finish.decorate(mat);return mat;});if(o.material.length===1)o.material=o.material[0];}});
 const mixer=new THREE.AnimationMixer(actor),clip=gltf.animations.find(a=>a.name.includes('PushWalk'))||gltf.animations[0],action=clip?mixer.clipAction(clip):null;
 const idleClip=gltf.animations.find(a=>a.name.includes('PlantedIdle')),idle=idleClip?mixer.clipAction(idleClip):null;action?.play();idle?.play();idle?.setEffectiveWeight(0);mixer.update(0);root.updateMatrixWorld(true);
 const basePose=[...bones.values()].map(bone=>({bone,position:bone.position.clone(),rotation:bone.quaternion.clone(),scale:bone.scale.clone()}));
 const footwork=createPlantedFootwork(),walkingSupports=createWalkingSupports(),footEvents=createFootContactEvents();
 action?.setEffectiveWeight(0);idle?.setEffectiveWeight(1);mixer.update(0);root.updateMatrixWorld(true);
 const legs=['L','R'].map(side=>({upper:bones.get('Thigh'+side),lower:bones.get('Shin'+side),foot:bones.get('Foot'+side),home:root.worldToLocal(bones.get('Foot'+side).getWorldPosition(new THREE.Vector3())),rotation:bones.get('Foot'+side).getWorldQuaternion(new THREE.Quaternion())}));
 // Cache the rigid shoe vertices in each foot's coordinates. The baked gait
 // rolls its heels slightly below the floor; constrain the actual shoe bounds,
 // rather than assuming a fixed ankle height guarantees sole clearance.
 for(const leg of legs){
  const point=new THREE.Vector3(),inverse=leg.foot.matrixWorld.clone().invert();leg.solePoints=[];
  actor.traverse(mesh=>{
   if(!mesh.isSkinnedMesh)return;const index=mesh.skeleton.bones.indexOf(leg.foot);if(index<0)return;
   const positions=mesh.geometry.attributes.position,indices=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight;
   for(let i=0;i<positions.count;i++){
    let weight=0;for(let c=0;c<4;c++)if(indices.getComponent(i,c)===index)weight+=weights.getComponent(i,c);
    if(weight>.95){mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse);leg.solePoints.push(point.clone());}
   }
  });
  leg.soleCenter=new THREE.Box3().setFromPoints(leg.solePoints).getCenter(new THREE.Vector3());
 }
 const soleMatrix=new THREE.Matrix4();
 function soleHeight(leg,position,rotation){
  if(!leg.solePoints.length)return position.y-.12;
  const m=soleMatrix.makeRotationFromQuaternion(rotation).elements;let lowest=Infinity;
  for(const v of leg.solePoints)lowest=Math.min(lowest,m[1]*v.x+m[5]*v.y+m[9]*v.z);
  return position.y+lowest;
 }
 function clearSole(leg,position,rotation){
  const correction=.002-soleHeight(leg,position,rotation);if(correction<=0)return false;
  position.y=Math.ceil((position.y+correction)*1e9)/1e9;return true;
 }
 action?.setEffectiveWeight(1);idle?.setEffectiveWeight(0);
 const arms=['L','R'].map((side,index)=>({side:index===0?-1:1,upper:bones.get('UpperArm'+side),lower:bones.get('Forearm'+side),hand:bones.get('Hand'+side),rest:bones.get('Hand'+side).getWorldQuaternion(new THREE.Quaternion())}));
 const tool=new THREE.Group();root.add(tool);const body=new THREE.Group();body.position.set(0,-TRIMMER.pivotHeight,TRIMMER.pivotForward);tool.add(body);
 let lastRun=null,lastTime=0,blend=0,idleTime=0;const state={handError:0,handPositions:[],grips:[],footPositions:[],blade:null,pose:'carry'};
 const scythe=buildGrassScythe(body,materials);
 const footShadows=['FootL','FootR'].map(name=>{const mesh=new THREE.Mesh(featheredContactGeometry(),contactShadeMaterial(.34));mesh.name='Joe contact shade '+name;mesh.rotation.x=-Math.PI/2;mesh.scale.set(.19,.28,1);mesh.renderOrder=-3;root.add(mesh);return mesh;});

 return {root,update(r,reduced){
  const j=r.joe,pose=trimmerPose(j);root.visible=j.phase!=='absent'&&(j.phase!=='enter'||j.age>.25);root.position.set(j.x,0,-j.y);root.rotation.y=-j.yaw;
  if(lastRun!==r){lastRun=r;lastTime=r.time;blend=j.speed>.1?1:0;idleTime=0;footwork.reset();walkingSupports.reset();footEvents.reset();}
  const dt=Math.max(0,Math.min(.1,r.time-lastTime));lastTime=r.time;
  // Mixer caches unchanged property values. Restore its last base pose before
  // procedural edits so duplicate renders cannot accumulate head/chest/IK turns.
  for(const base of basePose){base.bone.position.copy(base.position);base.bone.quaternion.copy(base.rotation);base.bone.scale.copy(base.scale);}
  const moving=j.speed>.1;blend+=(Number(moving)-blend)*(1-Math.exp(-dt*12));if(!reduced)idleTime+=dt;
  if(action){const phase=(j.walk+(j.turnDistance||0))/WALK_CYCLE%1;action.time=(j.phase==='water-recovery'?1-phase:phase)*clip.duration;action.setEffectiveWeight(idle?blend:1);}
  if(idle){idle.time=reduced?0:idleTime*.25%idleClip.duration;idle.setEffectiveWeight(1-blend);}mixer.update(0);
  for(const base of basePose){base.position.copy(base.bone.position);base.rotation.copy(base.bone.quaternion);base.scale.copy(base.bone.scale);}
  root.updateMatrixWorld(true);
  const rootRotationForFeet=root.getWorldQuaternion(new THREE.Quaternion());
  // Recenter the walking stance inside Joe's existing navigation body and
  // soften his knees enough to reach the longer steps without stretching.
  // Retain that knee bend while turning; straightening at a stop can pull a
  // planted ankle out of reach during the following pivot.
  const hips=bones.get('Hips'),shift=new THREE.Vector3(0,-HIP_DROP,-HIP_FORWARD*blend).applyQuaternion(rootRotationForFeet);
  const hipPosition=hips.getWorldPosition(new THREE.Vector3()).add(shift);
  hips.position.copy(hips.parent.worldToLocal(hipPosition));root.updateMatrixWorld(true);
  let rawFeet=legs.map(l=>({position:l.foot.getWorldPosition(new THREE.Vector3()),rotation:l.foot.getWorldQuaternion(new THREE.Quaternion())}));
  rawFeet.forEach((f,i)=>{
   const local=root.worldToLocal(f.position.clone()),center=legs[i].home.z-HIP_FORWARD*blend;
   local.z=center+(local.z-center)*(1+(WALK_CYCLE/BAKED_CYCLE-1)*blend);local.y+=HIP_DROP;
   f.position.copy(root.localToWorld(local));f.corrected=clearSole(legs[i],f.position,f.rotation)||blend>.0001;
  });
  rawFeet=walkingSupports.update({time:r.time,moving,rootPosition:root.position,raw:rawFeet,heights:rawFeet.map((f,i)=>soleHeight(legs[i],f.position,f.rotation))});
  const placedFeet=footwork.update({time:r.time,moving,turnRate:j.turnRate||0,rootPosition:root.position,
   raw:rawFeet.map(f=>f.position),rawRotations:rawFeet.map(f=>f.rotation),
   homes:legs.map(l=>root.localToWorld(l.home.clone())),
   rotations:legs.map(l=>rootRotationForFeet.clone().multiply(l.rotation))});
  state.footError=0;state.footContacts=[];
  for(let i=0;i<legs.length;i++){
   if(!placedFeet&&!rawFeet[i].corrected)continue;
   const leg=legs[i],foot=placedFeet?.[i]||rawFeet[i],pole=new THREE.Vector3(0,0,-1).applyQuaternion(rootRotationForFeet);
   clearSole(leg,foot.position,foot.rotation);
   state.footError=Math.max(state.footError,solveTwoBoneGrip(leg.upper,leg.lower,leg.foot,foot.position,pole,foot.rotation));
   state.footContacts[i]={planted:!!foot.planted,settling:!!foot.settling,target:foot.position.toArray()};
  }
  const acting=attackActing(j,pose);state.acting=acting;
  if(chest){chest.rotateY(acting.yaw);chest.rotateX(acting.pitch);chest.rotateZ(acting.roll);}
  if(head){head.rotateY(-acting.yaw);head.rotateX(pose.raised*.1-acting.pitch*.5);head.rotateZ(-acting.roll*.65);if(j.phase==='search'&&!reduced)head.rotateY(Math.sin(j.age*.8)*.2);}
  tool.position.set(0,pose.height,-TRIMMER.pivotForward);tool.rotation.set(pose.pitch,-pose.angle,0,'YXZ');root.updateMatrixWorld(true);
  state.handError=0;state.handPositions=[];state.grips=[];
  const rootRotation=root.getWorldQuaternion(new THREE.Quaternion()),toolRotation=tool.getWorldQuaternion(new THREE.Quaternion());
  for(const arm of arms){
   const g=SCYTHE_GRIPS[arm.side<0?0:1][0],grip=body.localToWorld(new THREE.Vector3(g[0],g[1],-g[2])),pole=new THREE.Vector3(arm.side*.8,-.4,.6).applyQuaternion(rootRotation),rotation=toolRotation.clone().multiply(arm.rest);
   state.handError=Math.max(state.handError,solveTwoBoneGrip(arm.upper,arm.lower,arm.hand,grip,pole,rotation));
   state.handPositions.push(arm.hand.getWorldPosition(new THREE.Vector3()).toArray());state.grips.push(grip.toArray());
  }
  state.footPositions=['FootL','FootR'].map(name=>root.worldToLocal(bones.get(name).getWorldPosition(new THREE.Vector3())).toArray());
  const soundFeet=legs.map(l=>{const p=l.foot.getWorldPosition(new THREE.Vector3()),q=l.foot.getWorldQuaternion(new THREE.Quaternion());return {x:p.x,y:-p.z,height:soleHeight(l,p,q)};});
  finish.bind(actor,root,arms);finish.update(r,soundFeet);
  footEvents.update({owner:r,time:r.time,body:j,feet:soundFeet,phase:j.phase,enabled:root.visible&&['playing','aftermath'].includes(r.mode)});
  state.footsteps=footEvents.stats();state.soleContacts=soundFeet;state.soleHeights=soundFeet.map(f=>Math.round(f.height*1e9)/1e9);
  state.footPositions.forEach((p,i)=>{const height=Math.max(0,soundFeet[i].height),fade=Math.exp(-height*10);const center=root.worldToLocal(legs[i].foot.localToWorld(legs[i].soleCenter.clone()));footShadows[i].position.set(center.x,.004,center.z);footShadows[i].scale.set(.19+height*.12,.28+height*.12,1);footShadows[i].material.opacity=.34*fade;});state.contactShade=footShadows.map((mesh,i)=>({soleHeight:soundFeet[i].height,opacity:mesh.material.opacity,position:mesh.getWorldPosition(new THREE.Vector3()).toArray()}));state.headRotation=head?.getWorldQuaternion(new THREE.Quaternion()).toArray();
  const endpoint=([x,forward])=>{const v=body.localToWorld(new THREE.Vector3(x,TRIMMER.bladeHeight,-forward));return {x:v.x,y:-v.z,height:v.y};};
  state.blade={near:endpoint(SCYTHE_CONTACT.near),far:endpoint(SCYTHE_CONTACT.far)};state.pose=j.phase;state.walkWeight=blend;state.turnHeading=j.yaw;

 },shadowCasters(){const meshes=[];for(const group of [actor,tool])group.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});return meshes;},drainFootsteps:()=>footEvents.drain(),inspectMeshPoints(){root.updateMatrixWorld(true);const points=[],point=new THREE.Vector3();for(const [group,kind]of [[actor,'body'],[tool,'weapon']])group.traverse(mesh=>{if(!mesh.isMesh||!mesh.visible)return;for(let i=0;i<mesh.geometry.attributes.position.count;i++){mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);points.push({kind,x:point.x,y:-point.z,height:point.y,radius:.012});}});return points;},stats:()=>({model:'joe-riding-pixel.glb',weapon:'grass-scythe',scythe:scythe.stats(),surfaces:finish.stats(),animated:!!action,grip:'two-bone IK',...state}),dispose(){finish.dispose();scythe.dispose();mixer.stopAllAction();footShadows.forEach(m=>m.material.dispose());root.traverse(o=>{o.geometry?.dispose();});root.removeFromParent();}};
}
