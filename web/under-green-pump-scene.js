import * as THREE from './vendor/three/three.module.js';
import {LEVER,WATERS,waterState} from './under-green-course.js';
import {pumpProgress} from './under-green-pump.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {drainGaugeArtwork,drainGaugeGlass} from './under-green-machinery-detail.js';

// A west-facing control keeps the onward outlet in the operator's forward view.
// Gauge faces, pipe routing and the handle are physical parts of one machine.
export function createPumpControl({scene,box,put,cyl,materials,makeSign}){
 const root=new THREE.Group();root.position.set(LEVER.x,0,-LEVER.y);root.rotation.y=-Math.PI/2;scene.add(root);
 // Brass corner marks show the operating side without adding another sign.
 for(const side of [-1,1]){box('brass',LEVER.x-1.7+side*.45,.015,-LEVER.y,.04,.02,.9);box('brass',LEVER.x-1.7,.015,-LEVER.y+side*.45,.9,.02,.04);}
 box('machineIron',0,.44,0,.7,.88,.8,root);box('machinePaint',0,.9,0,.72,.08,.8,root);
 box('rubber',0,.61,.403,.62,.37,.012,root);box('machinePaint',0,.61,.415,.58,.33,.018,root);
 for(const x of [-.29,.29])box('machineSteel',x,.61,.429,.018,.29,.012,root);
 for(const y of [.5,.72])box('machineIron',-.3,y,.422,.025,.06,.025,root);
 for(const x of [-.28,.28])for(const z of [-.31,.31]){
  box('machineRust',x,.035,z,.13,.07,.13,root);put(cyl,'machineSteel',x,.081,z,.027,.025,.027,0,0,0,root);
 }
 for(const x of [-.25,.25])for(const y of [.49,.73])put(cyl,'iron',x,y,.427,.025,.015,.025,Math.PI/2,0,0,root);
 const lever=new THREE.Group();lever.userData.dynamic=true;lever.position.set(0,.98,.06);root.add(lever);
 put(cyl,'brass',0,0,0,.12,.17,.12,0,0,Math.PI/2,lever);
 // Tapered cast arm and rounded red palm grip echo the chapter illustration.
 // The top remains at .48m above the pivot, inside the former handle envelope.
 const arm=new THREE.Shape();arm.moveTo(-.058,-.025);arm.lineTo(.058,-.025);arm.lineTo(.041,.10);arm.lineTo(.025,.34);arm.lineTo(-.025,.34);arm.lineTo(-.041,.10);arm.closePath();
 const armGeometry=new THREE.ExtrudeGeometry(arm,{depth:.038,steps:1,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2});
 put(armGeometry,'machineRed',0,0,-.019,1,1,1,0,0,0,lever);armGeometry.dispose();
 const gripGeometry=new THREE.SphereGeometry(.09,24,14);
 put(gripGeometry,'machineRed',0,.405,0,1,5/6,1,0,0,0,lever);gripGeometry.dispose();
 box('machineSteel',.029,.20,.022,.006,.075,.004,lever);
 // Rigid moving pieces share material batches; no per-frame mesh rebuilding.
 lever.updateMatrixWorld(true);const leverParts=new Map();
 for(const mesh of [...lever.children]){
  if(!leverParts.has(mesh.material))leverParts.set(mesh.material,[]);
  leverParts.get(mesh.material).push(mesh.geometry.clone().applyMatrix4(mesh.matrix));lever.remove(mesh);
 }
 for(const [material,pieces]of leverParts){lever.add(new THREE.Mesh(mergeIndexedGeometries(pieces),material));pieces.forEach(g=>g.dispose());}
 // A visible slotted stop and latch explain why this control stays operated.
 for(const x of [-.16,.16])box('iron',x,.98,.21,.045,.08,.42,root);
 const latch=box('brass',0,.93,.34,.34,.045,.07,root);
 latch.userData.dynamic=true;
 const gauges=[],gaugeTexture=drainGaugeArtwork(),gaugeMaterial=new THREE.MeshPhongMaterial({map:gaugeTexture,specular:0x242b24,shininess:12});
 const glassTexture=drainGaugeGlass(),glassMaterial=new THREE.MeshPhongMaterial({map:glassTexture,transparent:true,depthWrite:false,specular:0x69776a,shininess:72});
 for(const [id,x]of [['return',-.19],['bypass',.19]]){
  const face=new THREE.Group();face.position.set(x,1.3,.3);root.add(face);
  put(cyl,'steel',x,1.1,.3,.025,.4,.025,0,0,0,root);
  put(cyl,'iron',0,0,0,.15,.035,.15,Math.PI/2,0,0,face);
  put(cyl,'white',0,0,.024,.125,.014,.125,Math.PI/2,0,0,face);
  const dial=new THREE.CircleGeometry(.125,40),uv=dial.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setX(i,(uv.getX(i)+(id==='return'?0:1))/2);
  const artwork=new THREE.Mesh(dial,gaugeMaterial);artwork.position.z=.033;face.add(artwork);
  const seal=new THREE.TorusGeometry(.128,.004,5,32);put(seal,'rubber',0,0,.059,1,1,1,0,0,0,face);seal.dispose();
  const bezel=new THREE.TorusGeometry(.136,.012,6,32);put(bezel,'machineSteel',0,0,.056,1,1,1,0,0,0,face);bezel.dispose();
  for(const side of [-1,1])box('machineIron',side*.11,-.115,0,.025,.09,.09,face);
  const needle=new THREE.Group();needle.userData.dynamic=true;needle.position.z=.045;face.add(needle);box('machineRed',0,.045,0,.006,.09,.006,needle);
  put(cyl,'machineSteel',0,0,.006,.019,.015,.019,Math.PI/2,0,0,needle);
  // Glass sits above the real needle and below the bezel lip, not painted
  // beneath the pointer. Sparse edge cracks leave the reading arc clear.
  const glass=new THREE.Mesh(dial.clone(),glassMaterial);glass.position.z=.062;face.add(glass);
  const tag=makeSign(id==='return'?'RETURN':'RANGE',256,64);tag.scale.setScalar(.095);tag.position.set(0,-.2,.05);face.add(tag);
  gauges.push({id,needle,level:0});
 }
 // The pedestal supports a spindle up to the three-way overhead valve.
 put(cyl,'iron',.25,2.23,-.2,.045,2.66,.045,0,0,0,root);
 put(cyl,'rust',.25,3.55,-.2,.27,.36,.27,0,0,Math.PI/2,root);
 const diverter=box('brass',.25,3.3,-.2,.55,.07,.07,root);
 diverter.userData.dynamic=true;
 // Hang the sign farther along the outlet pipe: it stays below the portrait
 // HUD from the marked operating bay, with supports reaching real pipework.
 const sign=makeSign('DIVERT IRRIGATION',512,96);sign.scale.setScalar(.24);sign.position.set(-.25,2.4,-.8);root.add(sign);
 box('iron',-.25,3.65,-.83,.7,.07,.07,root);
 for(const x of [-.55,.05])box('iron',x,2.97,-.83,.035,1.35,.035,root);
 // Batch the fixed housing/ticks/supports; only the actual moving parts remain
 // independent meshes. This adds detail without a draw call for every bolt.
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),parts=new Map(),original=[];
 root.traverse(mesh=>{if(!mesh.isMesh)return;for(let parent=mesh;parent&&parent!==root;parent=parent.parent)if(parent.userData.dynamic)return;
  const geometry=mesh.geometry.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));
  if(mesh.material.userData.drainWorldUV){const span=mesh.material.userData.drainUVMetres||2,p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;for(let i=0;i<p.count;i++){const xx=Math.abs(n.getX(i)),yy=Math.abs(n.getY(i)),zz=Math.abs(n.getZ(i));uv.setXY(i,(xx>yy&&xx>zz?p.getZ(i):p.getX(i))/span,(yy>xx&&yy>zz?p.getZ(i):p.getY(i))/span);}}
  if(!parts.has(mesh.material))parts.set(mesh.material,[]);parts.get(mesh.material).push(geometry);original.push(mesh);
 });
 for(const mesh of original)mesh.removeFromParent();
 for(const [material,geometries]of parts){root.add(new THREE.Mesh(mergeIndexedGeometries(geometries),material));geometries.forEach(g=>g.dispose());}
 let state={};
 return {root,update(run){
  const progress=pumpProgress(run);lever.rotation.x=-progress;latch.position.y=.93+(1-progress)*.08;diverter.rotation.y=progress*Math.PI/2;
  for(const gauge of gauges){const outlet=WATERS.find(w=>w.id===gauge.id),water=waterState(outlet,run.time,run.bypass,run.bypassAt);gauge.level=water.level;gauge.needle.rotation.z=2.1-water.level*4.2;}
  state={handle:lever.rotation.x,latched:progress>=1,diverter:diverter.rotation.y,gauges:gaugeStates()};
 },stats:()=>({...state,detail:{dialPixels:512,glassPixels:256,staticDraws:parts.size,leverDraws:leverParts.size,glassCracks:2,glassAboveNeedle:true,grip:'rounded-cast-enamel',gripTop:.48}}),dispose(){gaugeTexture.dispose();gaugeMaterial.dispose();glassTexture.dispose();glassMaterial.dispose();}};
 function gaugeStates(){return gauges.map(g=>({id:g.id,level:g.level,angle:g.needle.rotation.z}));}
}
