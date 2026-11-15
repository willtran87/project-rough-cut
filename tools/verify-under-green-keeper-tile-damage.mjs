import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildKeeperTileDamage,KEEPER_DAMAGED_TILES} from '../web/under-green-keeper-tile-damage.js';
import {floorLayout} from '../web/under-green-course.js';
import {keeperWallPieces} from '../web/under-green-keeper-layout.js';
import {createDrainContactShade} from '../web/under-green-contact-shade.js';
const materials={keeperStone:new THREE.MeshPhongMaterial()},meshes=[];
const originalCompile=materials.keeperStone.onBeforeCompile,originalKey=materials.keeperStone.customProgramCacheKey;
const stats=buildKeeperTileDamage({materials,put(g,type,x,y,z){meshes.push({type,g:g.clone().translate(x,y,z),local:g.clone(),origin:[x,y,z]});}});
const walls=floorLayout().walls.flatMap(w=>keeperWallPieces(w,w.covered?4.2:1.8));
let vertices=0,triangles=0,closedFragments=0,skinVertices=0;const bounds=new THREE.Box3();
for(const [index,{type,g,local,origin}]of meshes.entries()){
 const p=g.attributes.position,idx=g.index,point=new THREE.Vector3();vertices+=p.count;triangles+=(idx?.count||p.count)/3;
 for(const attr of Object.values(g.attributes))assert([...attr.array].every(Number.isFinite),'Nonfinite '+type+' attribute');
 for(let i=0;i<p.count;i++){
  point.fromBufferAttribute(p,i);bounds.expandByPoint(point);
  assert(point.x>7.3&&point.x<9.9&&point.y>.1&&point.y<4.05&&point.z> -11.485&&point.z< -11.459,'Exceeded root-wall finish envelope '+JSON.stringify({type,point}));
  assert(walls.some(w=>Math.abs(w.y-11.35)<.001&&point.x>=w.x-w.w/2-.00001&&point.x<=w.x+w.w/2+.00001&&point.y>=w.base&&point.y<=w.base+w.height),'No solid wall behind '+JSON.stringify({type,point}));
 }
 if(type==='ceiling'){
  const edges=new Map();let volume=0;const count=idx?.count||p.count,get=i=>idx?idx.getX(i):i;
  const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(x=>x.toFixed(6)).join(',');
  for(let i=0;i<count;i+=3){const ids=[get(i),get(i+1),get(i+2)];for(let j=0;j<3;j++){const k=[key(ids[j]),key(ids[(j+1)%3])].sort().join('|');edges.set(k,(edges.get(k)||0)+1);}const [a,b,c]=ids.map(i=>new THREE.Vector3().fromBufferAttribute(p,i));volume+=a.dot(b.cross(c))/6;}
  assert([...edges.values()].every(n=>n===2),'Open fragment');assert(volume>0,'Inward fragment normals');closedFragments++;
 }else for(let i=0;i<g.attributes.normal.count;i++)assert(g.attributes.normal.getZ(i)<-.999,'Finish faces away from the room');
 if(type==='keeperStone'){
  assert(local.userData.preserveDrainUV,'Glazed face loses authored sampling');const record=stats.tiles[Math.floor(index/3)],uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const u=uv.getX(i)*2-record.x,v=uv.getY(i)*2-record.height;assert(u>=0&&u<=.25&&v>=0&&v<=.25,'Skin samples neighboring tile');const dx=u-.125,dy=v-.125;assert(Math.abs(p.getX(i)-(record.x+.125+Math.cos(record.angle)*dx-Math.sin(record.angle)*dy+record.shift))<2e-6);assert(Math.abs(p.getY(i)-(record.height+.125+Math.sin(record.angle)*dx+Math.cos(record.angle)*dy-.003))<2e-6);skinVertices++;}
 }
 g.dispose();local.dispose();
}
assert.equal(stats.fragments,KEEPER_DAMAGED_TILES.length);assert.equal(triangles,stats.triangles);assert.equal(closedFragments,22);
const scene=new THREE.Scene(),contacts=createDrainContactShade({scene,layout:floorLayout()});
contacts.root(new THREE.CatmullRomCurve3([new THREE.Vector3(8.1,2,-11.475),new THREE.Vector3(8.2,2.5,-11.475)]),.1,{vertical:false,boundary:11.35,side:1});contacts.finish();
const shade=scene.getObjectByName('Root masonry contact shade').geometry.attributes.position;assert(shade.count>0);
const bedZ=-(stats.wallFace+.0013),contactZ=shade.getZ(0);assert(contactZ<bedZ-.0001,'Backing must not share the contact-shadow plane');contacts.dispose();
assert.equal(stats.newMaterials,0);stats.dispose();assert.equal(materials.keeperStone.onBeforeCompile,originalCompile);assert.equal(materials.keeperStone.customProgramCacheKey,originalKey);
const report={passed:true,vertices,triangles,closedFragments,skinVertices,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},contactSeparation:bedZ-contactZ,shaderRestored:true,stats};fs.mkdirSync('output/under-green/visual-pass69',{recursive:true});fs.writeFileSync('output/under-green/visual-pass69/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,vertices,triangles,closedFragments,skinVertices,bounds:report.bounds,contactSeparation:report.contactSeparation,shaderRestored:true}));
