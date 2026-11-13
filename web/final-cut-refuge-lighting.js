import * as THREE from './vendor/three/three.module.js';
import {REFUGES} from './final-cut-course.js';
import {AMBUSH_REEDS} from './final-cut-ambush.js';

// Permanent entrance downlights. The small pools belong to the refuges, not
// to the tournament floodlight circuit or Joe's hidden approach state.
export function createRefugeLighting(scene,{box,software=false}){
 const lights=[],records=[],frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),bounds=new THREE.Sphere();let parts=0;
 const b=(...args)=>{box(...args);parts++;};
 for(const refuge of REFUGES){
  const x=refuge.x+refuge.w/2+.23,z=-refuge.y;
  // A ceiling plate and drop stem tie the fixture to the existing eave slab.
  b('metal',x-.10,2.735,z,.24,.04,.32);
  b('metal',x-.10,2.58,z,.055,.30,.055);
  b('metal',x-.05,2.435,z,.18,.055,.065);
  b('dark',x,2.385,z,.40,.10,.48);
  b('metal',x,2.33,z,.35,.035,.43);
  b('lamp',x,2.305,z,.29,.018,.35);
  // Lens guard, corner fasteners, and a raised weather lip. All sit above
  // standing head clearance; no decorative post blocks the doorway.
  for(const side of [-1,1]){
   b('metal',x+side*.175,2.275,z,.025,.13,.43);
   b('metal',x,2.275,z+side*.205,.35,.13,.025);
   b('metal',x,2.415,z+side*.225,.43,.035,.035);
   for(const end of [-1,1])b('brass',x+side*.15,2.34,z+end*.18,.025,.025,.025);
  }
  for(const dz of [-.105,0,.105])b('metal',x,2.225,z+dz,.34,.022,.018);
  // Start below the cage so it cannot shadow its own small aperture. The
  // wide downward cone reaches the coping and the worn entrance apron.
  const light=new THREE.SpotLight('#ffd29a',23,5.8,1.02,.65,1.7);
  light.name=`Refuge-entrance-${refuge.id}`;
  light.position.set(x,2.19,z);light.target.position.set(x+.35,0,z);
  light.castShadow=true;light.shadow.mapSize.setScalar(software?128:256);
  Object.assign(light.shadow.camera,{near:.12,far:5.8});
  light.shadow.bias=-.0001;light.shadow.normalBias=.018;light.shadow.autoUpdate=false;
  scene.add(light,light.target);lights.push(light);
  const animatedReeds=AMBUSH_REEDS.some(p=>Math.hypot(Math.max(0,Math.abs(x-p.x)-p.w/2),Math.max(0,Math.abs(refuge.y-p.y)-p.d/2))<light.distance+3);
  records.push({id:refuge.id,x,y:refuge.y,animatedReeds,previous:null,updates:0});
 }
 return {lights,update(r,camera){
  if(camera)frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  records.forEach((record,i)=>{
   const light=lights[i];bounds.center.copy(light.position);bounds.radius=light.distance;
   // The complete finite influence sphere must miss the camera frustum.
   // Never select only the nearest lamp: multiple visible refuges stay lit.
   light.visible=!camera||frustum.intersectsSphere(bounds);
   if(!light.visible){record.previous=null;return;}
   // Cache static architecture, but nearby wind-driven reeds and the complete
   // moving rig envelope invalidate their own light's map. The reed margin
   // includes the authored blade width, wind, and contact displacement.
   const near=Math.hypot(r.rig.x-record.x,r.rig.y-record.y)<14;
   const key=near?[r.time,r.rig.x,r.rig.y,r.rig.yaw,r.rig.deployment,r.arrival.age,r.ending.age].join('|'):record.animatedReeds?String(r.time):'static';
   if(key!==record.previous){lights[i].shadow.needsUpdate=true;record.previous=key;record.updates++;}
  });
 },stats:()=>({parts,lights:lights.map((l,i)=>({id:records[i].id,intensity:l.intensity,visible:l.visible,animatedReeds:records[i].animatedReeds,origin:l.position.toArray(),target:l.target.position.toArray(),range:l.distance,shadowSize:l.shadow.mapSize.x,updates:records[i].updates})),textureAssets:0}),dispose(){for(const l of lights){l.shadow.map?.dispose();l.shadow.mapPass?.dispose();scene.remove(l,l.target);}}};
}
