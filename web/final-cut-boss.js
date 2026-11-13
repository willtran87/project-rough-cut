import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {rigLampState} from './final-cut-reveal.js';
import {RIG_WHEELS} from './final-cut-rig.js';
import {createMachineFinishMaterial,tagMachineSurface} from './final-cut-machine-finish.js';

export function createFinalCutBoss(body,wings,wheels){
 const material=createMachineFinishMaterial(),glow=new THREE.MeshBasicMaterial({color:'#ff531e'}),batches=[],gears=[];
 // Lettering belongs on identification plates, never on every bolt or hose.
 const plateCanvas=document.createElement('canvas');plateCanvas.width=768;plateCanvas.height=128;
 const plateContext=plateCanvas.getContext('2d');plateContext.fillStyle='#152c24';plateContext.fillRect(0,0,768,128);
 for(const [i,text]of ['ESTATE / 18','REEL DRIVE','ISOLATE FIRST'].entries()){
  const x=i*256;plateContext.strokeStyle='#a99562';plateContext.lineWidth=3;plateContext.strokeRect(x+5,5,246,118);plateContext.fillStyle='#d1cba9';plateContext.font='bold 25px monospace';plateContext.textAlign='center';plateContext.textBaseline='middle';plateContext.fillText(text,x+128,64,232);
 }
 const plateTexture=new THREE.CanvasTexture(plateCanvas);plateTexture.colorSpace=THREE.SRGBColorSpace;plateTexture.magFilter=THREE.NearestFilter;plateTexture.minFilter=THREE.NearestMipmapLinearFilter;
 const plateMaterial=new THREE.MeshLambertMaterial({map:plateTexture}),plates=[];
 function plate(parent,tile,x,y,z,w,h,ry=0){const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,(tile+uv.getX(i)) /3);const m=new THREE.Mesh(g,plateMaterial);m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);plates.push(m);}
 let partCount=0;
 function builder(parent){
  const parts=[];
  function add(g,tile,x=0,y=0,z=0,rx=0,ry=0,rz=0){g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1)));tagMachineSurface(g,tile,Math.abs(Math.sin(x*17.7+y*31.3+z*13.1)));parts.push(g);partCount++;}
  const box=(tile,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>add(new THREE.BoxGeometry(w,h,d),tile,x,y,z,rx,ry,rz);
  const cylinder=(tile,x,y,z,r,h,rx=0,ry=0,rz=0)=>add(new THREE.CylinderGeometry(r,r,h,10),tile,x,y,z,rx,ry,rz);
  function tube(points,radius,tile,taper=false){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),g=new THREE.TubeGeometry(curve,16,radius,6,false);if(taper){const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const t=Math.floor(i/7)/16,c=curve.getPointAt(t),scale=1-t*.95;pos.setXYZ(i,c.x+(pos.getX(i)-c.x)*scale,c.y+(pos.getY(i)-c.y)*scale,c.z+(pos.getZ(i)-c.z)*scale);}g.computeVertexNormals();}add(g,tile);}
  return {add,box,cylinder,tube,finish(name){const geometry=mergeGeometries(parts,false),mesh=new THREE.Mesh(geometry,material);mesh.name=name;parent.add(mesh);parts.forEach(g=>g.dispose());batches.push(mesh);return mesh;}};
 }
 const b=builder(body);
 // Oversized radiator, dense louvers and a welded bumper communicate
 // industrial mass. Threat comes from real cutting equipment, not a face.
 // The radiator module supplies the recessed core and rotating fans. Keep
 // only its external guard and trim here, so the machinery stays visible.
 for(let k=0;k<23;k++)b.box(1,-1.27+k*.115,1.3,-2.62,.045,.76,.055);
 b.box(0,0,.83,-2.57,3.2,.2,.12);
 for(const x of [-1.04,0,1.04]){b.box(1,x,.66,-2.66,.94,.25,.018);for(const dx of [-.37,.37])b.cylinder(1,x+dx,.66,-2.68,.035,.025,Math.PI/2);}
 b.box(3,0,.87,-2.645,.7,.12,.02);
 for(const s of [-1,1]){b.box(3,s*1.34,.85,-2.64,.24,.12,.018);b.cylinder(1,s*1.12,.79,-2.59,.085,.08,Math.PI/2);}
 for(const s of [-1,1]){
  b.box(3,s*1.48,1.3,-2.6,.18,.84,.025);
  b.box(1,s*1.34,.65,-2.4,.16,.32,.2);
  b.box(0,s*1.59,1.28,-2.25,.018,.95,.64);
  b.tube([[s*1.16,1.3,1.7],[s*1.23,2.1,1.7],[s*1.22,2.95,1.78],[s*1.3,3.18,2.0]],.11,1);
  for(let k=0;k<8;k++)b.cylinder(1,s*1.23,1.7+k*.13,1.7,.145,.045);
  b.box(3,s*1.15,1.72,1.43,.35,.44,.12);
  // Plain weather canopy and bolted rollover structure.
  b.tube([[s*1.36,.64,1.3],[s*1.16,1.0,.85],[s*1.2,1.0,.3],[s*1.36,.65,-.4]],.052,0);
  for(let k=0;k<6;k++)b.box(1,s*1.31,.56,-.9+k*.35,.1,.12,.18,0,0,s*.3);
 }
 // Readable side armor and hood panels replace the broad untextured areas.
 for(const s of [-1,1]){
  // Side service vents belong to the open bodywork enclosure.
  b.box(3,s*1.731,1.91,2.05,.012,.18,.44);
  // Distinct service lids, oil filler, hinges and latches break up the mass.
  for(const z of [1.1,2.36])b.box(3,s*1.72,1.13,z,.045,.18,.12);
  // Curved fenders are built and audited with the authoritative bodywork.
  b.tube([[s*1.55,1.32,1.0],[s*1.53,1.6,.65],[s*1.46,1.55,.12]],.07,1);
 }
 b.box(3,0,1.93,2.61,1.2,.20,.025);
 // Rear guard bars are constructed with the enclosure, ahead of the fins.
 for(const x of [-1.55,1.55])for(const y of [1.08,1.94])b.cylinder(1,x,y,2.64,.035,.02,Math.PI/2);
 for(const x of [-.76,.76]){b.box(0,x,3.18,1.03,.35,.7,.06);b.add(new THREE.PlaneGeometry(.29,.62),3,x,3.16,1.067);}
 for(const s of [-1,1])for(const z of [-1.9,-.9,.2,1.6])b.cylinder(1,s*1.18,.52,z,.035,.05);
 b.cylinder(1,.74,3.85,.5,.11,.06);b.finish('FinaleIndustrialBodywork');
 plate(body,0,0,3.65,-1.258,1.35,.145,Math.PI);
 plate(body,1,0,.87,-2.657,.68,.105,Math.PI);
 plate(body,2,0,1.93,2.626,1.14,.18);
 const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.12,8),glow);beacon.position.set(.74,3.94,.5);body.add(beacon);
 for(const {wing,side}of wings){const w=builder(wing);
  // Separate gearbox caps, oil ports, bearing straps and deck rivets.
  for(let k=0;k<4;k++){const x=side*(.48+k*.94);w.box(1,x,.127,-.12,.16,.014,1.32);w.box(0,x,.18,.1,.28,.1,.36);w.cylinder(1,x,.247,.1,.055,.035);}
  for(let k=0;k<12;k++){const x=side*(.18+k*.32);w.cylinder(1,x,.345,.4,.021,.015);}
  for(const x of [.45,3.4]){w.box(0,side*x,.2,.49,.44,.12,.2);for(let k=0;k<4;k++)w.box(1,side*(x-.15+k*.1),.27,.49,.035,.025,.17);}
  w.finish('FinaleWingArmor');
  const g=new THREE.Group();g.position.set(side*.48,.25,.52);wing.add(g);const gear=builder(g);gear.cylinder(1,0,0,0,.115,.045,Math.PI/2);for(let k=0;k<12;k++){const a=k*Math.PI/6;gear.box(1,Math.cos(a)*.12,Math.sin(a)*.12,0,.04,.035,.05,0,0,a);}gear.finish('FinaleDriveGear');gears.push(g);
 }
 for(const wheel of wheels){const w=builder(wheel),s=Math.sign(wheel.position.x),edge=RIG_WHEELS[0].width/2;w.cylinder(0,s*(edge-.025),0,0,.57,.035,0,0,Math.PI/2);w.cylinder(1,s*edge,0,0,.39,.025,0,0,Math.PI/2);w.cylinder(0,s*(edge+.016),0,0,.17,.008,0,0,Math.PI/2);for(let k=0;k<10;k++){const a=k*Math.PI/5;w.cylinder(1,s*(edge+.015),Math.cos(a)*.3,Math.sin(a)*.3,.034,.01,0,0,Math.PI/2);w.box(1,s*(edge-.006),Math.cos(a)*.46,Math.sin(a)*.46,.015,.035,.065,a);}w.finish('FinaleWheelHub');}
 return {update(r){const lamp=rigLampState(r);glow.color.setRGB(.08+.72*lamp.beam,.035+.32*lamp.beam,.003+.025*lamp.beam);for(const g of gears)g.rotation.z=-(r.rig.reelAngle||0)*.7;},stats:()=>({atlas:material.map.image.width,filter:'nearest / mipmapped',finish:'authored metre-scale materials / edge wear / service oil',parts:partCount,batches:batches.length,plates:plates.length,triangles:batches.reduce((n,m)=>n+m.geometry.index.count/3,0),canopyHeight:3.84,design:'industrial reel mower',gears:gears.length}),dispose(){plateTexture.dispose();plateMaterial.dispose();material.dispose();glow.dispose();}};
}

