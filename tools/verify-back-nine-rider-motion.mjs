import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createBackNineRiderMotion,createRiderMotionState,stepRiderMotion} from '../web/back-nine-rider-motion.js';
const buffer=fs.readFileSync('web/assets/models/joe-riding-pixel.glb'),gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12))),joints=new Set(gltf.skins.flatMap(s=>s.joints));
const nodes=gltf.nodes.map((s,i)=>{const n=joints.has(i)?new T.Bone():new T.Object3D();n.name=s.name||'';if(s.matrix){n.matrix.fromArray(s.matrix);n.matrix.decompose(n.position,n.quaternion,n.scale);}else{if(s.translation)n.position.fromArray(s.translation);if(s.rotation)n.quaternion.fromArray(s.rotation);if(s.scale)n.scale.fromArray(s.scale);}return n;});
gltf.nodes.forEach((s,i)=>s.children?.forEach(j=>nodes[i].add(nodes[j])));
const rider=new T.Group(),body=new T.Group(),wheel=new T.Group();gltf.scenes[gltf.scene||0].nodes.forEach(i=>rider.add(nodes[i]));
rider.traverse(n=>{if(n.name.startsWith('Thigh'))n.rotateX(Math.PI/2);if(n.name.startsWith('Shin'))n.rotateX(-Math.PI/2);});rider.position.set(0,.28,.1);body.add(rider,wheel);wheel.position.set(0,1.48,-.25);wheel.rotation.x=Math.PI*.32;
const motion=createBackNineRiderMotion(rider,wheel),bones=nodes.filter(n=>n.isBone),translations=bones.map(n=>n.position.toArray()),hips=rider.getObjectByName('Hips'),hipsStart=hips.position.clone();
const run=()=>({time:0,mode:'driving',joe:{x:0,y:0,yaw:0,speed:0},cart:{x:8,y:20}});
let poses=0,maxGripError=0;
for(const turn of [-1.5,0,1.5])for(const speed of [-2.5,0,12,42])for(const load of [0,1])for(const reducedMotion of [false,true]){
 const r=run();r.joe.speed=speed;body.position.set(18,-load*.035,-54);body.rotation.set(.12,-.7,-.08,'YXZ');
 for(let frame=0;frame<=90;frame++){
  r.time=frame/60;r.joe.yaw=turn*r.time;const saved=JSON.stringify(r);motion.update(r,{ram:{load},rev:load,surge:load,reducedMotion});assert.equal(JSON.stringify(r),saved);
  const s=motion.stats();assert(Math.abs(s.wheel)<=.5);assert(Math.abs(s.headYaw)<=.52);assert.deepEqual(hips.position,hipsStart);
  for(const bone of bones)assert(Number.isFinite(bone.quaternion.length())&&Math.abs(bone.quaternion.length()-1)<2e-5);
  maxGripError=Math.max(maxGripError,...s.gripError);assert(Math.max(...s.gripError)<.008,JSON.stringify({turn,speed,load,reducedMotion,s}));
  if(reducedMotion)assert(s.pitch===0&&s.roll===0&&s.breath===0);
  poses++;
 }
 if(turn&&speed)assert.equal(Math.sign(motion.stats().steer),Math.sign(turn)*(speed<0?-1:1),'reverse wheel direction follows vehicle motion');
 assert.deepEqual(bones.map(n=>n.position.toArray()),translations);
 const before=bones.map(n=>n.quaternion.toArray());r.mode='paused';for(let i=0;i<10;i++)motion.update(r,{ram:{load},rev:load,surge:load,reducedMotion});assert.deepEqual(bones.map(n=>n.quaternion.toArray()),before);
}
const state=createRiderMotionState(),r=run();stepRiderMotion(state,r);assert(state.headYaw<0,'target on Joe right turns his head right');
for(let i=1;i<=60;i++){r.time=i/60;r.joe.speed=i/5;r.joe.yaw=i/60;stepRiderMotion(state,r);}assert(state.acceleration>10&&state.pitch>0&&state.steer>.6,'acceleration and heading drive physical response');
for(let i=61;i<=90;i++){r.time=i/60;r.joe.speed=12-(i-60)/3;stepRiderMotion(state,r);}assert(state.acceleration<-10&&state.pitch<0,'braking pitches rider forward');
stepRiderMotion(state,run());assert.equal(state.steer,0);assert.equal(state.acceleration,0);
const wrap=run();wrap.joe.yaw=Math.PI-.001;stepRiderMotion(state,wrap);wrap.time=.01;wrap.joe.yaw=-Math.PI+.001;stepRiderMotion(state,wrap);assert(Math.abs(state.steer)<.03,'angle wrapping must not create a full steering jerk');
const report={passed:true,poses,maxGripError,originalJointTranslations:true,seatFixed:true,pausedPoseStable:true,reducedMotion:true,gameplayUnchanged:true,accelerationBrakingSteering:true,restartAndAngleWrap:true};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2));console.log(JSON.stringify(report));
