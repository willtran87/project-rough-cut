import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildBackNineDistrictScenery,DISTRICT_SCENERY} from '../web/back-nine-district-scenery.js';
import {terrainHeight} from '../web/course-terrain.js';
import {COURSE_RESERVOIRS} from '../web/back-nine-landscape.js';
const boxGeometry=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,12),pieces=[],roofMeshes=[];
const roofMaterial=new THREE.MeshBasicMaterial({side:THREE.FrontSide});
function put(g,type,x,y,z,sx=1,sy=1,sz=1,ry=0){
 const copy=g.clone(),pose=new THREE.Object3D();pose.position.set(x,y+terrainHeight(x,-z),z);pose.scale.set(sx,sy,sz);pose.rotation.y=ry;pose.updateMatrix();copy.applyMatrix4(pose.matrix);
 const pos=copy.getAttribute('position'),normal=copy.getAttribute('normal');
 for(let i=0;i<pos.count;i++){
  assert([pos.getX(i),pos.getY(i),pos.getZ(i)].every(Number.isFinite),'finite vertices');
  assert(Math.abs(pos.getX(i))>40.8,'scenery must not invade playable space or the boundary fence');
  const length=Math.hypot(normal.getX(i),normal.getY(i),normal.getZ(i));assert(Math.abs(length-1)<1e-5,'no degenerate or cancelled face normals');
 }
 if(type==='soilMargin'){
  const color=copy.getAttribute('color');assert.equal(color.itemSize,4);
  for(let i=0;i<pos.count;i++){assert(pos.getY(i)>.115&&pos.getY(i)<.13,'sediment sits above rough apron without floating');assert(normal.getY(i)>.999,'sediment faces up');assert(color.getW(i)>=0&&color.getW(i)<=.670001,'bounded edge alpha');if(i%4===3)assert.equal(color.getW(i),0,'outer edge feathers to clear');}
 }
 if(type==='roof'){const mesh=new THREE.Mesh(copy.clone(),roofMaterial);mesh.updateMatrixWorld();roofMeshes.push(mesh);}
 copy.computeBoundingBox();pieces.push({type,bounds:copy.boundingBox.clone()});copy.dispose();
}
const box=(type,x,y,z,w,h,d,ry=0)=>put(boxGeometry,type,x,y,z,w,h,d,ry);
const pinePlacements=[];for(const site of DISTRICT_SCENERY)for(const dx of [-3,0,3])pinePlacements.push({x:site.x+dx,z:-site.y,h:9,w:1});
pinePlacements.push({x:24,z:-90,h:7,w:1});const count=pinePlacements.length,untouched={...pinePlacements.at(-1)};
const stats=buildBackNineDistrictScenery({THREE,box,put,cylinder,pinePlacements});
assert.equal(pinePlacements.length,count);assert.deepEqual(pinePlacements.at(-1),untouched);
for(const tree of pinePlacements.slice(0,-1)){
 assert(Math.abs(tree.x)<69,'tree center remains on ground apron');
 for(const site of DISTRICT_SCENERY)assert(Math.abs(tree.x-site.x)>site.width/2+2||Math.abs(-tree.z-site.y)>site.length/2+2,'tree clears structure');
 for(const [x,y,rx,ry]of COURSE_RESERVOIRS)assert(((tree.x-x)/rx)**2+((-tree.z-y)/ry)**2>1.25,'tree outside reservoir');
}
for(const piece of pieces)assert(piece.bounds.min.y>=-.001,'structure grounded above course apron');
assert(stats.panes>80&&stats.brokenPanes>0);
assert.deepEqual(stats.compounds.map(s=>s.id),['irrigation-tank-yard','abandoned-practice-shelter','ruined-members-pavilion']);
// Cast against actual roof faces. Closed roof surfaces must face outwards;
// damaged sections must leave a real opening, rather than a dark painted patch.
const roofAt=(x,z,up=false)=>new THREE.Raycaster(new THREE.Vector3(x,up?4:15,z),new THREE.Vector3(0,up?1:-1,0),0,20).intersectObjects(roofMeshes,false);
for(const [x,z]of [[-52,-668],[-49,-673],[-49,-663]]){
 const top=roofAt(x,z),underside=roofAt(x,z,true);assert(top.length>0&&top[0].face.normal.y>0,'pavilion exterior is visible from above');assert(underside.length>0&&underside[0].face.normal.y<0,'roof thickness has an outward-facing underside');
}
assert.equal(roofAt(-46,-668).length,0,'pavilion missing east roof admits sky');
assert.equal(roofAt(48.9,-530.25).length,0,'practice missing roof bay admits sky');
assert(roofAt(48.9,-541.85).length>0,'adjacent practice roof bay retained');
for(const mesh of roofMeshes)mesh.geometry.dispose();roofMaterial.dispose();
console.log(JSON.stringify({passed:true,pieces:pieces.length,sites:stats.sites.length,panes:stats.panes,brokenPanes:stats.brokenPanes,treesPreserved:count}));
boxGeometry.dispose();cylinder.dispose();
