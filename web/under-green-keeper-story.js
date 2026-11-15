import * as THREE from './vendor/three/three.module.js';

// One interrupted job: a split return seal, its repair drawing, and the night
// ledger left unsigned. Everything rests behind the original counter face.
export function buildKeeperStory({materials,put}){
 const bounds=new THREE.Box3(),parts=[],matrix=new THREE.Matrix4(),q=new THREE.Quaternion();
 materials.keeperLog.alphaTest=.35;
 materials.keeperInk=new THREE.MeshLambertMaterial({color:0x27291e});
 materials.keeperCord=new THREE.MeshLambertMaterial({color:0x8c7750});
 materials.keeperStain=materials.keeperWood.clone();materials.keeperStain.color.setHex(0x484331);materials.keeperStain.transparent=true;materials.keeperStain.opacity=.32;materials.keeperStain.depthWrite=false;
 function place(g,type,x,h,y,rx=0,ry=0,rz=0){
  q.setFromEuler(new THREE.Euler(rx,ry,rz));matrix.compose(new THREE.Vector3(x,h,-y),q,new THREE.Vector3(1,1,1));
  g.computeBoundingBox();const b=g.boundingBox.clone().applyMatrix4(matrix);bounds.union(b);parts.push({type,bounds:{min:b.min.toArray(),max:b.max.toArray()}});
  put(g,type,x,h,-y,1,1,1,rx,ry,rz);g.dispose();
 }
 function block(type,x,h,y,w,t,d,angle=0){place(new THREE.BoxGeometry(w,t,d),type,x,h,y,0,angle);}
 function disc(type,x,h,y,r,depth,angle=0){place(new THREE.CylinderGeometry(r,r,depth,16),type,x,h,y,0,angle);}
 function ring(type,x,h,y,outer,inner,depth=0,angle=0,arc=Math.PI*2){
  if(!depth){place(new THREE.RingGeometry(inner,outer,32,1,0,arc),type,x,h,y,-Math.PI/2,0,angle);return;}
  const s=new THREE.Shape();s.absarc(0,0,outer,0,arc,false);
  if(arc<Math.PI*2){s.lineTo(Math.cos(arc)*inner,Math.sin(arc)*inner);s.absarc(0,0,inner,arc,0,true);s.closePath();}
  else{const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(hole);}
  const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:16});place(g,type,x,h,y,-Math.PI/2,0,angle);
 }
 function paper(index,x,h,y,w,d,angle=0,curve=0){
  const g=new THREE.PlaneGeometry(w,d,16,10),p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   const u=uv.getX(i),v=uv.getY(i);
   // Broad leaf bow and one gently lifted corner, with the other edges resting.
   p.setZ(i,curve*Math.sin(Math.PI*u)+Math.max(0,u-.78)*Math.max(0,v-.7)*.16);
   uv.setXY(i,(index%2+u)/2,(1-Math.floor(index/2)+v)/2);
  }
  g.computeVertexNormals();g.userData.preserveDrainUV=true;
  place(g,'keeperLog',x,h,y,-Math.PI/2,0,Math.PI+angle);
 }
 // Raised steel tray, now carrying an open book with physically separate leaves.
 block('machineIron',11.82,1.067,11.02,1.10,.024,.57);
 for(const side of [-1,1])block('machineRust',11.82+side*.548,1.089,11.02,.014,.045,.57);
 block('keeperBook',11.82,1.086,11.02,1.01,.015,.53);
 for(const side of [-1,1]){
  for(let i=0;i<5;i++)block('keeperPaper',11.82+side*.245,1.096+i*.003,11.02,.477,.002,.501-i*.001);
  paper(side>0?0:1,11.82+side*.245,1.111,11.02,.477,.50,0,.017);
 }
 block('keeperEndgrain',11.82,1.115,11.02,.017,.006,.50);
 // Pencil over the unfinished signature; a sharpened wooden point, dark lead,
 // and metal ferrule make its scale legible without a new texture.
 const pencilAxis=new THREE.Vector3(-Math.sin(.38),0,-Math.cos(.38));
 const pencilRotation=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),pencilAxis));
 function pencilPart(g,type,t){place(g,type,11.49+pencilAxis.x*t,1.132,11.15-pencilAxis.z*t,pencilRotation.x,pencilRotation.y,pencilRotation.z);}
 pencilPart(new THREE.CylinderGeometry(.006,.006,.205,6),'red',0);
 pencilPart(new THREE.ConeGeometry(.006,.024,6),'keeperEndgrain',.114);
 pencilPart(new THREE.ConeGeometry(.002,.006,6),'keeperInk',.125);
 pencilPart(new THREE.CylinderGeometry(.0065,.0065,.015,8),'machineSteel',-.095);

 // The seal is split, with its broken piece set beside the annotated drawing.
 paper(2,10.20,1.059,11.02,.51,.55,-.12,.007);
 ring('keeperInk',10.18,1.066,11.025,.108,.074,.009,.22,Math.PI*1.72);
 ring('keeperInk',10.37,1.065,11.16,.108,.074,.009,2.85,Math.PI*.24);
 for(const [x,y]of [[9.97,10.87],[9.98,10.99],[10.00,11.11]]){
  disc('machineSteel',x,1.07,y,.015,.006);disc('machineRust',x,1.083,y,.009,.025);
 }
 // An open-jawed spanner rests to the right, angled toward the unfinished job.
 const tool=new THREE.Shape();[[-.018,-.13],[.018,-.13],[.015,.075],[.048,.102],[.045,.143],[.020,.155],[.021,.116],[-.014,.099],[-.037,.128],[-.047,.103],[-.024,.074]].forEach(([x,y],i)=>i?tool.lineTo(x,y):tool.moveTo(x,y));tool.closePath();
 place(new THREE.ExtrudeGeometry(tool,{depth:.009,bevelEnabled:false}),'machineSteel',10.57,1.059,11.10,-Math.PI/2,0,-.42);
 ring('machineIron',10.624,1.069,11.22,.018,.008);

 // An enamel cup: hollow wall, rolled rim, dark contents and a worn base ring.
 const cupX=10.76,cupY=10.80;
 ring('keeperStain',cupX,1.056,cupY,.078,.067,0,.2,Math.PI*1.75);
 const profile=[[.047,0],[.052,.008],[.06,.128],[.058,.136],[.052,.136],[.049,.127],[.043,.012]].map(([x,y])=>new THREE.Vector2(x,y));
 place(new THREE.LatheGeometry(profile,24),'machinePaint',cupX,1.06,cupY);
 place(new THREE.TorusGeometry(.056,.004,5,24),'machineIron',cupX,1.193,cupY,Math.PI/2);
 place(new THREE.TorusGeometry(.038,.007,5,16,Math.PI*1.65),'machinePaint',cupX+.066,1.13,cupY,0,0,-Math.PI*.82);
 disc('keeperInk',cupX,1.16,cupY,.05,.002);
 ring('keeperStain',10.88,1.056,11.23,.073,.066,0,-.4,Math.PI*1.45);

 // Protected survey packet on a battered cover, tied with two taut cords.
 block('keeperBook',12.89,1.068,10.98,.64,.02,.48);
 for(let i=0;i<7;i++)block('keeperPaper',12.89+(i%3-1)*.004,1.085+i*.007,10.98,.61,.005,.46);
 paper(3,12.89,1.133,10.98,.61,.46,0,.004);
 block('keeperCord',12.89,1.141,10.98,.005,.004,.468);
 block('keeperCord',12.89,1.14,10.98,.62,.004,.005);
 for(const side of [-1,1])block('keeperCord',12.89+side*.308,1.109,10.98,.004,.066,.005);
 place(new THREE.TorusGeometry(.014,.002,4,12),'keeperCord',12.889,1.146,10.975,-Math.PI/2,0,.25);
 paper(2,13.37,1.059,11.15,.29,.32,.17,.008);

 // Local wear belongs to the work positions; the long counter keeps quiet wood
 // between them. Shallow chips stay inside the original front face.
 for(const [start,length]of [[9.94,.25],[11.39,.62],[12.62,.17]])for(let i=0;i<9;i++){
  const x=start+i*length/9,w=length/9*.72;
  block('keeperEndgrain',x,1.052-(i%3)*.002,11.43,w,.006,.014+(i%4)*.003);
 }
 const owned=['keeperInk','keeperCord','keeperStain'].map(k=>materials[k]);
 return {composition:'interrupted-bypass-seal-repair',openLedger:{x:11.82,y:11.02,height:1.111,pages:2,unfinishedSignature:true},repair:{x:10.2,y:11.02,splitSeal:true,spanner:true,bolts:3},protectedPacket:{x:12.89,y:10.98,height:1.133,tied:true},cup:{x:cupX,y:cupY,hollow:true},parts,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},newTextures:0,newLights:0,addedColliders:0,dispose(){owned.forEach(m=>m.dispose());}};
}
