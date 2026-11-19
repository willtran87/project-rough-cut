import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as T from '../web/vendor/three/three.module.js';
import {createChaseRunner} from '../web/chase-runner.js';
// The pre-refactor geometry comparison (player-motion baseline snapshot) is
// retired: the rig has since been deliberately re-modelled. What must hold for
// the current rig: finite posed geometry in every state and a defeat pose that
// rests on, not through, the ground, including the mounted work light.
const materials=Object.fromEntries(['cloth','skin','paint','iron','brass','rubber','trousers'].map(k=>[k,new T.MeshLambertMaterial()]));
const scene=new T.Scene(),runner=createChaseRunner(scene,materials,null,new T.Texture(),new T.Texture(),new T.Texture()),runners=[runner];
const point=new T.Vector3();
function vertices(root){const rows=new Map();root.updateMatrixWorld(true);root.traverse(m=>{if(m.isMesh){const a=m.geometry.attributes.position,hash=createHash('sha256').update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength)).digest('hex'),values=[];for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);values.push(point.clone());}rows.set(hash,[...(rows.get(hash)||[]),...values]);}});return rows;}
function finite(rows){let count=0;for(const values of rows.values())for(const p of values){assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z),'posed vertex is finite');count++;}assert(count>100,'runner has geometry');return count;}
let seatedVertices=0,ejectionVertices=0,deathFloor=Infinity;const deathRows=[];
for(const steer of [-1,0,1])for(const reduced of [false,true]){const parent=new T.Group();runner.seated(parent,{steer},reduced,20);seatedVertices=Math.max(seatedVertices,finite(vertices(parent)));}
for(const side of [-1,1]){
 const foot={x:0,y:70,yaw:.2,viewYaw:.2,speed:0,travelSign:1,ejection:{at:20,x:0,y:70,seatX:-.36,seatY:70.2,yaw:0,side,incomingSpeed:12}};
 runners.forEach(r=>r.update(null,0,false,null,0));
 for(let i=0;i<=63;i++){const time=20+i/60;runners.forEach(r=>r.update(foot,1/60,false,null,time));ejectionVertices=Math.max(ejectionVertices,finite(vertices(runner.root)));}
}
for(const yaw of [0,Math.PI/2,Math.PI]){
 const foot={x:0,y:70,yaw:0,viewYaw:0,moveYaw:0,speed:6.6,travelSign:1};runners.forEach(r=>r.update(null,0,false,null,0));
 for(let i=0;i<60;i++){foot.y+=.11;runners.forEach(r=>r.update(foot,1/60,false,null,20+i/60));}
 for(const age of [0,.2,.5,.9,1.2]){
  const death={yaw,startYaw:0,age,strength:.8};runners.forEach(r=>r.update(foot,1/60,false,death,30+age));const rows=vertices(runner.root);finite(rows);
  const floor=Math.min(...[...rows.values()].flat().map(p=>p.y));deathFloor=Math.min(deathFloor,floor);deathRows.push({yaw,age,floor});
 }
}
const torch=new T.Group();torch.name='RunnerWorkLight';
for(const [x,y,z,sx,sy,sz]of [[-.18,1.28,-.18,.105,.17,.025],[-.18,1.28,-.21,.085,.115,.065],[-.18,1.28,-.245,.06,.065,.009]]){const mesh=new T.Mesh(new T.BoxGeometry(1,1,1),materials.iron);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);torch.add(mesh);}
runner.attachUpperBody(torch);assert.equal(torch.parent.name,'runner-upper-body');
let mountedDeathFloor=Infinity;
for(const yaw of [0,Math.PI/2,Math.PI])for(const age of [0,.2,.5,.9,1.2]){runner.update({x:0,y:70,yaw:0,viewYaw:0,speed:0},1/60,false,{yaw,startYaw:0,age,strength:.8},40+age);const data=vertices(runner.root);mountedDeathFloor=Math.min(mountedDeathFloor,...[...data.values()].flat().map(p=>p.y));}
assert(mountedDeathFloor>.014,'mounted work light participates in defeat support');
const result={seatedVertices,ejectionVertices,deathFloor,mountedDeathFloor,deathRows};console.log(JSON.stringify(result));
assert(seatedVertices>100);assert(ejectionVertices>100);assert(deathFloor>.014,'actual defeat geometry rests on floor');
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({passed:true,...result},null,2));

