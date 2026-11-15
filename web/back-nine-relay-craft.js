import {terrainHeight} from './course-terrain.js';

// Analog charge instruments and the automatic contactor belong to the real
// induction chargers. Their indications derive from finite service capacity.
export function buildRelayCraft({THREE,COURSE,box,put,cylinder,batchVehicleParts,scene}){
 const controls=[];
 for(const [i,c]of COURSE.checkpoints.entries()){
  const x=c.x+3.7,z=-c.y-3.70,y=2.22;
  box('iron',x,y,z-.10,.48,.30,.16);
  const face=new THREE.CircleGeometry(.115,24);put(face,'paint',x,y,z);face.dispose();
  const rim=new THREE.TorusGeometry(.124,.012,4,24);put(rim,'brass',x,y,z+.003);rim.dispose();
  for(let n=0;n<=10;n++){const a=-Math.PI*.75+n*Math.PI*1.5/10;
   const tick=new THREE.BoxGeometry(n%5===0?.014:.008,n%5===0?.033:.02,.008);tick.rotateZ(-a);put(tick,'iron',x+Math.sin(a)*.087,y+Math.cos(a)*.087,z+.012);tick.dispose();
  }
  for(const side of [-1,1])for(const h of [-.11,.11])box('brass',x+side*.207,y+h,z+.006,.025,.025,.012);
  // The isolated contactor has a ribbed insulated grip and a visible conduit
  // into the cabinet; it closes only while real repair power is transferring.
  box('iron',x+.35,1.61,z-.035,.20,.36,.15);
  put(cylinder,'iron',x+.35,1.22,z-.07,.025,.55,.025);
  box('iron',x+.175,.95,z-.07,.35,.05,.05);
  const needle=new THREE.Group(),lever=new THREE.Group();needle.position.set(x,y+terrainHeight(x,-z),z+.025);lever.position.set(x+.35,1.66+terrainHeight(x+.35,-z),z+.05);scene.add(needle,lever);
  box('iron',0,.037,0,.009,.079,.008,0,needle);box('brass',0,0,.008,.025,.025,.012,0,needle);
  box('iron',0,-.07,0,.025,.14,.025,0,lever);box('rubber',0,-.145,0,.08,.09,.07,0,lever);
  for(let n=0;n<4;n++)box('iron',0,-.12-n*.018,.038,.068,.006,.007,0,lever);
  batchVehicleParts(needle);batchVehicleParts(lever);controls.push({needle,lever,remaining:25,active:false});
 }
 return {update(run){for(const [i,c]of controls.entries()){
  c.remaining=Math.max(0,Math.min(25,run.service?.remaining?.[i]??25));c.active=run.service?.active===i;
  c.needle.rotation.z=-(c.remaining/25-.5)*Math.PI*1.5;c.lever.rotation.x=c.active?-.55:.25;
 }},stats:()=>controls.map(c=>({remaining:c.remaining,active:c.active,needle:c.needle.rotation.z,contactor:c.lever.rotation.x}))};
}
