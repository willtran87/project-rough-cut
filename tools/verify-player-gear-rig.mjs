import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createChaseRunner} from '../web/chase-runner.js';
const scene=new T.Scene(),materials=Object.fromEntries(['cloth','skin','paint','iron','brass','rubber','trousers'].map(k=>[k,new T.MeshLambertMaterial()]));
const runner=createChaseRunner(scene,materials,null,new T.Texture(),new T.Texture(),new T.Texture(),new T.Texture()),point=new T.Vector3(),boots=[];
runner.root.traverse(o=>{if(o.name==='boot')boots.push(o);});
function floor(root){let min=Infinity;root.updateWorldMatrix(true,true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);min=Math.min(min,point.y);}}});return min;}
let ejectionMin=Infinity,deathMin=Infinity,ejectionSamples=0,maxDuplicate=0;
for(const side of [-1,1])for(const speed of [0,6.6])for(const yaw of [0,1.3,3.1])for(const reduced of [false,true]){
 const foot={x:0,y:70,yaw,viewYaw:yaw,moveYaw:yaw,speed,travelSign:1,ejection:{at:20,x:0,y:70,seatX:-.36,seatY:70.2,yaw,side,incomingSpeed:12}};runner.update(null,0,false,null,0);
 for(let i=0;i<=90;i++){
  const time=20+i/60;if(time>=20.86){foot.x+=Math.sin(yaw)*speed/60;foot.y+=Math.cos(yaw)*speed/60;}
  const immutable=JSON.stringify(foot);runner.update(foot,1/60,reduced,null,time);assert.equal(JSON.stringify(foot),immutable);const h=Math.min(...boots.map(floor));ejectionMin=Math.min(ejectionMin,h);assert(h>=-.012,JSON.stringify({side,speed,yaw,reduced,time,h}));
  runner.root.updateMatrixWorld(true);const before=boots.map(b=>b.getWorldPosition(new T.Vector3()));runner.update(foot,0,reduced,null,time);runner.root.updateMatrixWorld(true);for(let j=0;j<2;j++)maxDuplicate=Math.max(maxDuplicate,boots[j].getWorldPosition(point).distanceTo(before[j]));ejectionSamples++;
 }
}
for(const yaw of [0,Math.PI/2,Math.PI])for(const age of [0,.2,.5,.9,1.2]){runner.update({x:0,y:70,yaw:0,viewYaw:0,speed:0},1/60,false,{yaw,startYaw:0,age,strength:.8},40+age);deathMin=Math.min(deathMin,floor(runner.root));}assert(deathMin>.014);assert(maxDuplicate<1e-9);
const seat=new T.Group();runner.seated(seat,{steer:0},false,20);let seatedMeshes=0,meshes=0;seat.traverse(o=>{if(o.isMesh)seatedMeshes++;});runner.root.traverse(o=>{if(o.isMesh)meshes++;});assert.equal(meshes,24);assert.equal(seatedMeshes,9);
const result={passed:true,ejectionSamples,ejectionMin,deathMin,maxDuplicate,meshes,seatedMeshes};console.log(JSON.stringify(result));if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));runner.dispose();
