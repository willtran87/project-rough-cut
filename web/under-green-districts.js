import * as THREE from './vendor/three/three.module.js';
import {putSecondaryRoot} from './under-green-secondary-roots.js';
import {OBSTACLES,NOTE,LEVER,rangeY,RANGE_SCALE} from './under-green-layout.js';
import {buildBunkerBankDetails} from './under-green-bunker-bank.js';
import {buildDrainPump} from './under-green-machinery-detail.js';
import {buildKeeperWorkspace} from './under-green-keeper-workspace.js';
import {buildPumpOverhead} from './under-green-pump-overhead.js';
import {buildKeeperOverhead} from './under-green-keeper-overhead.js';
import {buildGalleryMasonryRibs} from './under-green-vaults.js';
import {shadeDrainMaterial} from './under-green-crafted-surfaces.js';
import {finishBunkerSandEdges} from './under-green-bank-material.js';

// District details live above body/tool clearance, outside the walkable hull,
// or inside an existing solid machine footprint. They do not add invisible walls.
export function buildUnderGreenDistricts({scene,materials,layout,box,put,cyl,ball,makeSign,registerFixture,lamps,keeperTimber,bankSoil}){
 // The cut bank needs two different substances. Previously both strata reused
 // one root-striped image, producing repeated diagonal fans across the wall.
 // These native square atlas tiles retain the 313.5 texels/metre convention;
 // the floor's existing sand map remains independent of the bank material.
 materials.soil=materials.bankSand.clone();materials.soil.map=bankSoil.map;materials.soil.specularMap=bankSoil.wet;
 materials.soil.color.setHex(0xb4a991);materials.soil.userData.drainWorldUV=true;
 shadeDrainMaterial(materials.soil);finishBunkerSandEdges(materials.bankSand,materials.soil);
 const galleryRibs=buildGalleryMasonryRibs(put);
 for(const y of [12,20,28]){
  for(const x of [-1.8,.7]){
   const points=[new THREE.Vector3(0,4.15,0),new THREE.Vector3(.17,3.82,.09),new THREE.Vector3(-.06,3.49,.19),new THREE.Vector3(.16,3.24,.31)];
   putSecondaryRoot(put,points,.055,[x,0,-y]);
  }
  // Sprinkler risers disappear through a supported, gridded ceiling collar.
  put(cyl,'iron',1.9,4.02,-y,.29,.26,.29);
  const collar=new THREE.TorusGeometry(.27,.035,4,12);put(collar,'brass',1.9,3.86,-y,1,1,1,Math.PI/2);collar.dispose();
  for(const z of [-.12,0,.12])box('steel',1.9,3.85,-y+z,.46,.035,.025);
 }
 // A cut through bunker soil, capped with actual turf, beyond the dry walkway.
 box('soil',-35,1.05,-62,6,2.1,30);box('sand',-35,2.48,-62,6,.76,30);
 box('soil',-35,3.92,-62,6,2.12,30);box('grass',-35,5.09,-62,6,.22,30);
 const bunkerBank=buildBunkerBankDetails({box,put,cyl,ball});
 for(const y of [55,60,65,70]){
  box('wood',-16.85,.9,-y,.18,1.8,.16);
  // End the fence at the bunker mouth, before the north junction's walkable floor.
  const railLength=y===70?.8:4.2;
  box('wood',-16.83,1.55,-y-railLength/2,.15,.1,railLength);
 }
 const pumpHousing=buildDrainPump({box,put});
 const pumpOverhead=buildPumpOverhead({layout,box});
 // Range netting sits beyond the east perimeter, attached to the existing posts.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=32;
 const ctx=canvas.getContext('2d');ctx.strokeStyle='#8c9e83';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(32,32);ctx.moveTo(32,0);ctx.lineTo(0,32);ctx.stroke();
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(40,8);texture.magFilter=THREE.NearestFilter;
 const net=new THREE.Mesh(new THREE.PlaneGeometry(25*RANGE_SCALE,2.4),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.3,side:THREE.DoubleSide,forceSinglePass:true,color:0x7a8875}));
 net.position.set(23.12,5.3,-rangeY(24));net.rotation.y=Math.PI/2;scene.add(net);
 for(let i=0;i<13;i++)put(ball,'white',23.06,4.4+(i%4)*.35,-rangeY(14+i*1.55),.065,.065,.065);
 // The keeper hoist owns its frame and open travel pocket in gate-scene.
 const keeper=makeSign('KEEPER’S ROOM / 18',512,128);keeper.scale.setScalar(.62);keeper.position.set(12,3.3,-rangeY(-2.82));scene.add(keeper);
 const keeperWorkspace=buildKeeperWorkspace({materials,box,put,cyl,lamps,keeperTimber});
 const keeperOverhead=buildKeeperOverhead({box,put});
 // Record recess: a warm, permanent cabinet and an empty clip after collection.
 box('wood',NOTE.x,.55,-NOTE.y,.65,1.1,.45);
 box('iron',NOTE.x,1.14,-NOTE.y,.72,.08,.5);
 for(const x of [NOTE.x-.7,NOTE.x+.7])box('wood',x,1.24,-57.47,.07,2.48,.08);
 box('wood',NOTE.x,2.43,-57.47,1.47,.07,.08);
 // Edge tabs bridge the plate's 8 cm stand-off to the retaining face and
 // timber frame. Keep the centre of the lettering completely unobstructed.
 for(const side of [-1,1])box('iron',NOTE.x+side*.65,2.2,-57.38,.12,.055,.18);
 return {rootShafts:3,rootArches:galleryRibs.ribs,galleryRibs,rangeNet:true,bunkerStrata:true,bunkerBank,pumpHousing,pumpOverhead,keeperCoursePlan:true,keeperWorkspace,keeperOverhead,recordRecess:{...NOTE},dispose(){keeperWorkspace.dispose();texture.dispose();}};
}
