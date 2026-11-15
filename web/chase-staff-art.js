import * as THREE from './vendor/three/three.module.js';
import {clone} from './vendor/three/addons/utils/SkeletonUtils.js';
import {STAFF_SIGHTINGS,createUnease,updateUnease} from './chase-unease.js';
import {STAFF_SEAT_OFFSET} from './staff-cart-layout.js';
import {hideStaffCartInterior} from './staff-cart-interior.js';

export const SHIFT_RECORDS=Object.freeze([
 Object.freeze({id:'maintenance',x:-5.15,y:296,height:2.35,title:'NIGHT ORDER 041',status:'CREW ASSIGNED',cards:3}),
 Object.freeze({id:'range',x:-5.15,y:576,height:2.35,title:'NIGHT ORDER 041',status:'WORK CARRIED OVER',cards:1}),
 Object.freeze({id:'garage',x:-26.7,y:813.35,height:2.4,title:'NIGHT ORDER 041',status:'NO ONE CLOCKED OUT',cards:0})
]);

// Three connected work records, not route signs. Paper grain, stamped ink,
// empty card slots and the same order number carry the story at two scales.
export function buildShiftRecords({scene,materials,box,put,cylinder}){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;const ctx=canvas.getContext('2d');
 const rows=['REED','BELL','WARD'];
 for(let i=0;i<3;i++){
  const top=i*336,r=SHIFT_RECORDS[i];ctx.fillStyle='#68736e';ctx.fillRect(0,top,512,336);
  for(let n=0;n<1700;n++){const x=(n*137+i*11)%512,y=(n*83+i*29)%336;ctx.fillStyle=n%2?'#626e69':'#6d7770';ctx.fillRect(x,top+y,1+n%3,1);}
  ctx.fillStyle='#1f2c2d';ctx.fillRect(14,top+12,484,52);ctx.fillStyle='#d1c9a9';ctx.font='bold 27px monospace';ctx.fillText(r.title,27,top+48);
  ctx.font='bold 19px monospace';ctx.fillStyle='#252d2a';ctx.fillText('GROUNDS / NIGHT SHIFT',27,top+92);
  for(let n=0;n<3;n++){
   const x=28+n*161;ctx.fillStyle='#34413f';ctx.fillRect(x,top+116,136,135);ctx.fillStyle='#9a9f8b';ctx.fillRect(x+7,top+122,122,9);
   if(n<r.cards){ctx.fillStyle='#beb99c';ctx.fillRect(x+10,top+131,116,108);ctx.fillStyle='#374440';ctx.font='bold 22px monospace';ctx.fillText(rows[n],x+19,top+163);ctx.font='16px monospace';ctx.fillText('IN 18:00',x+15,top+187);ctx.fillText('OUT --:--',x+15,top+211);for(let q=0;q<4;q++)ctx.fillRect(x+17+q*25,top+220,8,5);}
   else{ctx.fillStyle='#899080';ctx.font='18px monospace';ctx.fillText(rows[n],x+19,top+218);}
  }
  ctx.strokeStyle='#713f35';ctx.lineWidth=4;ctx.strokeRect(20,top+274,472,43);ctx.fillStyle='#713f35';ctx.font='bold 23px monospace';ctx.fillText(r.status,29,top+303);
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;
 const material=materials.paint.clone();material.onBeforeCompile=materials.paint.onBeforeCompile;material.customProgramCacheKey=materials.paint.customProgramCacheKey;material.map=map;material.color.setHex(0xffffff);material.emissive.setRGB(.014,.017,.014);
 const meshes=[];
 for(const [i,r]of SHIFT_RECORDS.entries()){
  // The two shelter records hang outside the existing posts; the garage
  // record is flush to its back wall. No additional walkable-space obstacle.
  const z=-r.y;box('iron',r.x,r.height,z,2.45,1.66,.065);box('roof',r.x,r.height+.88,z+.03,2.62,.08,.3);
  if(i<2)box('iron',-4.43,r.height+.67,z-.04,1.47,.07,.09);
  const g=new THREE.PlaneGeometry(2.32,1.52),uv=g.attributes.uv;
  for(let n=0;n<uv.count;n++)uv.setY(n,1-(i*336+(1-uv.getY(n))*336)/1024);
  const mesh=new THREE.Mesh(g,material);mesh.name='NightShiftRecord-'+r.id;mesh.position.set(r.x,r.height,z+.036);scene.add(mesh);meshes.push(mesh);
  for(const dx of [-1.12,1.12])for(const dy of [-.72,.72]){put(cylinder,'brass',r.x+dx,r.height+dy,z+.065,.035,.025,.035);}
 }
 return {stats:()=>({boards:meshes.length,order:41,cards:SHIFT_RECORDS.map(r=>r.cards)}),dispose(){material.dispose();map.dispose();}};
}

// Reuse the real high-resolution Joe artwork and existing parked carts. Only
// bones are copied; vertex buffers and all authored textures remain shared.
export function createStaffSighting(scene,rider){
 const figure=clone(rider),skeletons=new Map();
 figure.name='UnaccountedGroundskeeper';figure.position.set(0,0,0);figure.visible=false;
 figure.traverse(o=>{if(o.isSkinnedMesh){const key=o.skeleton.bones.map(b=>b.uuid).join('|');if(skeletons.has(key))o.skeleton=skeletons.get(key);else skeletons.set(key,o.skeleton);}if(o.isMesh){o.castShadow=false;o.receiveShadow=true;o.frustumCulled=false;}});
 const hidden=[];figure.traverse(o=>{if(o!==figure&&!o.visible&&!o.isBone)hidden.push(o);});for(const o of hidden)o.removeFromParent();
 const interior=hideStaffCartInterior(figure);
 // The original rider already prepares all shared geometry and materials.
 // One proxy warms this independent bone palette; repeating all nine shared
 // meshes would unnecessarily add another full preparation batch.
 figure.updateMatrixWorld(true);let source=null;figure.traverse(o=>{if(!source&&o.isSkinnedMesh)source=o;});
 const preparation=source.clone(false);preparation.name='StaffSightingPreparation';preparation.visible=true;preparation.frustumCulled=false;scene.add(preparation);
 const frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),sphere=new THREE.Sphere(new THREE.Vector3(),1.7),observed=[false,false];
 let lastRun=null,state=createUnease(),prepared=false;
 function display(){figure.visible=state.site>=0&&observed[state.site];if(prepared){if(figure.visible&&!figure.parent)scene.add(figure);else if(!figure.visible)figure.removeFromParent();}}
 return {update(run,camera){
  if(lastRun!==run){lastRun=run;state=createUnease(run);}
  if((run.foot||run.cart).y>220&&state.site<0)state.phase='finished';
  if(state.phase==='finished'){display();return;}
  camera.updateMatrixWorld();frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  for(let i=0;i<STAFF_SIGHTINGS.length;i++){
   const p=STAFF_SIGHTINGS[i];sphere.center.set(p.x,1.5,-p.y);
   // Conservative whole-figure bounds: a shoulder at the screen edge keeps
   // the sighting present. No per-frame scenery raycasts or hidden pop-out.
   observed[i]=frustum.intersectsSphere(sphere);
  }
  updateUnease(state,run,observed);display();
  if(figure.visible){const p=STAFF_SIGHTINGS[state.site];figure.position.set(p.x+STAFF_SEAT_OFFSET[0],STAFF_SEAT_OFFSET[1],-p.y+STAFF_SEAT_OFFSET[2]);figure.rotation.y=-p.yaw;}
 },finishWarm(){preparation.removeFromParent();prepared=true;display();},active:()=>state.site>=0,stats:()=>({...state,observed:[...observed],visible:figure.visible,skeletons:skeletons.size,interior}),dispose(){preparation.removeFromParent();for(const s of skeletons.values())s.dispose();figure.removeFromParent();}};
}
