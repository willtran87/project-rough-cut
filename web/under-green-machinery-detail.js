import * as THREE from './vendor/three/three.module.js';
import {OBSTACLES,LEVER} from './under-green-layout.js';
import {createMachinerySurfaces} from './under-green-machinery-surfaces.js';

// All low parts stay inside the existing 2 x 3 metre solid pump footprint.
// Above it, the delivery line follows one continuous path into the diverter.
// Static parts go through the scene's spatial/material batching and audits.
export async function prepareDrainMachinery(materials){
 const surfaces=await createMachinerySurfaces(),sets=surfaces.sets;
 for(const [name,color,source,shine,specular]of [
  ['machinePaint',0xd4d1b9,sets.paint,24,0x748174],['machineIron',0x81877f,sets.metal,18,0x515b53],
  ['machineSteel',0xd0cbbb,sets.metal,65,0x92998b],['machineRust',0xc5b29a,sets.rust,10,0x423c31],
  ['machineRed',0xe8ddd2,sets.red,32,0x706052]
 ]){
  materials[name]=new THREE.MeshPhongMaterial({color,map:source.map,specularMap:source.wet,specular,shininess:shine});
  materials[name].userData.drainWorldUV=true;
  materials[name].userData.drainUVMetres=1;
 }
 materials.machineRubber=new THREE.MeshLambertMaterial({color:0x252b27});
 return surfaces;
}

export function buildDrainPump({box,put}){
 const machine=OBSTACLES.find(o=>o.id==='pump-machine'),x=machine.x,z=-machine.y;
 const cylinder=(type,px,h,pz,r,length,axis='z',segments=24)=>{
  const g=new THREE.CylinderGeometry(r,r,length,segments);
  // Close machinery uses one native tile per metre, including circular caps.
  const uv=g.attributes.uv,p=g.attributes.position,n=g.attributes.normal;
  for(let i=0;i<uv.count;i++){
   if(Math.abs(n.getY(i))>.9)uv.setXY(i,p.getX(i),p.getZ(i));
   else uv.setXY(i,uv.getX(i)*Math.PI*r*2,uv.getY(i)*length);
  }
  g.userData.preserveDrainUV=true;
  put(g,type,px,h,pz,1,1,1,axis==='z'?Math.PI/2:0,0,axis==='x'?Math.PI/2:0);g.dispose();
 };
 const ring=(type,px,h,pz,r,tube,axis='z')=>{
  const g=new THREE.TorusGeometry(r,tube,6,32);put(g,type,px,h,pz,1,1,1,axis==='y'?Math.PI/2:0,axis==='x'?Math.PI/2:0);g.dispose();
 };
 const flange=(px,h,pz,axis='z',radius=.3)=>{
  cylinder('machineIron',px,h,pz,radius,.08,axis);ring('machineSteel',px,h,pz,radius-.035,.012,axis);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,u=Math.cos(a)*(radius-.05),v=Math.sin(a)*(radius-.05);
   cylinder('machineSteel',px+(axis==='x'?0:u),h+(axis==='y'?0:v),pz+(axis==='z'?.052:axis==='x'?u:v),.022,.026,axis,6);
  }
 };
 // Independent cast feet with rust pockets, seated on two heavy skids.
 for(const side of [-1,1]){
  box('machineIron',x+side*.71,.09,z,.25,.18,2.88);
  for(const dz of [-.91,.76]){
   box('machineRust',x+side*.64,.235,z+dz,.43,.11,.43);
   box('machinePaint',x+side*.55,.36,z+dz,.27,.24,.32);
   cylinder('machineSteel',x+side*.78,.31,z+dz,.045,.05,'y',6);
  }
 }
 // Motor barrel, cooling fins and rear fan cowl. Shaft and coupling join the
 // volute instead of disappearing into a generic rectangular housing.
 cylinder('machinePaint',x,.99,z-.59,.51,1.38);
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8;
  const g=new THREE.BoxGeometry(.035,.105,1.14);
  put(g,'machinePaint',x+Math.sin(a)*.54,.99+Math.cos(a)*.54,z-.64,1,1,1,0,0,-a);g.dispose();
 }
 cylinder('machineIron',x,.99,z-1.31,.56,.16);
 ring('machineSteel',x,.99,z-1.397,.5,.018);
 for(let i=-3;i<=3;i++){
  const offset=i*.12,span=Math.sqrt(.47*.47-offset*offset)*2;
  box('machineSteel',x+offset,.99,z-1.409,.022,span,.018);
 }
 cylinder('machineSteel',x,.99,z+.16,.17,.18);
 cylinder('machineIron',x,.99,z+.28,.24,.18);
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;cylinder('machineSteel',x+Math.cos(a)*.185,.99+Math.sin(a)*.185,z+.382,.026,.035,'z',6);
 }
 // A broad asymmetric spiral casting gives the pump its defining silhouette.
 const shape=new THREE.Shape();
 for(let i=0;i<=40;i++){
  const a=i/40*Math.PI*2,r=.56+.11*(.5+.5*Math.sin(a+.5));
  const px=Math.cos(a)*r,py=Math.sin(a)*r;
  if(i===0)shape.moveTo(px,py);else shape.lineTo(px,py);
 }
 shape.closePath();
 const casing=new THREE.ExtrudeGeometry(shape,{depth:.5,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.035,bevelThickness:.035,curveSegments:24});
 put(casing,'machinePaint',x,.99,z+.43);casing.dispose();
 cylinder('machineIron',x,.99,z+.994,.53,.07);
 ring('machineRubber',x,.99,z+1.021,.529,.007);
 cylinder('machinePaint',x,.99,z+1.035,.49,.035);
 ring('machineSteel',x,.99,z+1.06,.48,.013);
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6;cylinder('machineSteel',x+Math.cos(a)*.435,.99+Math.sin(a)*.435,z+1.07,.029,.035,'z',6);
 }
 // Inlet terminates in a capped service strainer: no unexplained open pipe.
 cylinder('machineIron',x,.99,z+1.2,.25,.28);flange(x,.99,z+1.36);
 cylinder('machinePaint',x,.99,z+1.419,.235,.025);
 for(const dh of [-.12,-.06,0,.06,.12])box('machineIron',x,.99+dh,z+1.439,.34,.018,.014);
 // Small junction box and conduit seated on the motor.
 box('machineIron',x,1.55,z-.7,.52,.08,.56);box('machinePaint',x,1.69,z-.7,.46,.22,.48);
 box('machineSteel',x,1.81,z-.7,.48,.025,.5);
 for(const side of [-1,1])for(const dz of [-.18,.18])cylinder('machineSteel',x+side*.17,1.833,z-.7+dz,.018,.025,'y',6);
 // Smooth sweeps through both right-angle turns; the endpoint is the actual
 // west-facing control's overhead valve at local (.25,3.55,-.2).
 const outlet=new THREE.Vector3(x+.49,1.35,z+.68);
 const end=new THREE.Vector3(LEVER.x+.2,3.55,-LEVER.y+.25);
 const points=[outlet,new THREE.Vector3(x+.49,2.9,z+.68),new THREE.Vector3(x+.49,3.55,z+.83),new THREE.Vector3(x+.49,3.65,-LEVER.y-.2),new THREE.Vector3(x+.8,3.65,-LEVER.y+.25),end];
 const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
 const pipe=new THREE.TubeGeometry(curve,56,.145,12,false);
 const uv=pipe.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*curve.getLength(),uv.getY(i)*Math.PI*.145*2);
 pipe.userData.preserveDrainUV=true;put(pipe,'machineRust',0,0,0);pipe.dispose();
 for(const height of [1.65,2.55])flange(outlet.x,height,outlet.z,'y',.235);
 // A roof hanger and saddle support the elevated line, above all tool paths.
 box('machineIron',x+.49,3.99,-LEVER.y-.5,.035,.32,.035);
 box('machineSteel',x+.49,4.125,-LEVER.y-.5,.28,.05,.24);
 ring('machineIron',x+.49,3.65,-LEVER.y-.5,.17,.025);
 return {kind:'centrifugal-volute',footprint:{x:machine.x,y:machine.y,w:machine.w,d:machine.d},motorFins:16,casingBolts:12,delivery:{start:outlet.toArray(),end:end.toArray(),continuous:true},staticBatched:true};
}

// Artwork is laid out at interaction resolution. Peripheral weathering keeps
// the numbered reading arc clear; glass damage is a separate front layer.
export function drainGaugeArtwork(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
 const c=canvas.getContext('2d');
 for(let face=0;face<2;face++){
  const ox=face*512;c.save();c.translate(ox,0);
  c.fillStyle='#161f1b';c.fillRect(0,0,512,512);
  c.fillStyle='#b9b396';c.beginPath();c.arc(256,256,244,0,Math.PI*2);c.fill();
  c.strokeStyle='#6d7360';c.lineWidth=7;c.beginPath();c.arc(256,256,229,0,Math.PI*2);c.stroke();
  for(let i=0;i<=30;i++){
   const a=-2.1+i/30*4.2,r=i%5?190:181;c.strokeStyle='#353f35';c.lineWidth=i%5?2:5;
   c.beginPath();c.moveTo(256+Math.sin(a)*r,256-Math.cos(a)*r);c.lineTo(256+Math.sin(a)*211,256-Math.cos(a)*211);c.stroke();
   if(i%5===0){c.font='bold 25px monospace';c.fillStyle='#353f35';c.textAlign='center';c.fillText(String(i/5),256+Math.sin(a)*157,265-Math.cos(a)*157);}
  }
  c.textAlign='center';c.fillStyle='#48503f';c.font='bold 28px monospace';c.fillText(face?'RANGE':'RETURN',256,345);c.font='20px monospace';c.fillText('BAR · RC / 18',256,377);
  // Uneven peripheral water marks, small oxide islands and faded ink. Keep
  // the number/tick sweep and central pointer field quiet and readable.
  c.save();c.beginPath();c.arc(256,256,224,0,Math.PI*2);c.clip();
  for(let i=0;i<32;i++){
   const a=(i*2.39996+face*.7),r=204+(i%6)*3,x=Math.round((256+Math.cos(a)*r)/2)*2,y=Math.round((256+Math.sin(a)*r)/2)*2;
   c.fillStyle=i%4?'#a6a084':'#8c9077';c.fillRect(x,y,4+i%4*2,2+i%5*2);
  }
  for(let i=0;i<24;i++){
   const x=150+i*8,y=408+Math.round(Math.sin(i*.8+face)*5)*2;
   c.fillStyle=i%3?'#a09c7f':'#96967b';c.fillRect(x,y,8,2+(i%3)*2);
  }
  c.restore();
  // Edge corrosion has clusters, not a noisy field across the readable face.
  for(let i=0;i<80;i++){const a=i*2.39996,r=221+(i%9);c.fillStyle=i%3?'#7f8068':'#646e5b';c.fillRect(Math.round(256+Math.cos(a)*r),Math.round(256+Math.sin(a)*r),3+i%6,2+i%4);}
  c.restore();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
 return texture;
}

// Existing editable canvas art, kept as a separate front layer so cracks cross
// the physical pointer correctly. Quantized lines avoid soft vector hairlines.
export function drainGaugeGlass(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');
 const line=(points,color)=>{c.fillStyle=color;for(let i=1;i<points.length;i++){const [ax,ay]=points[i-1],[bx,by]=points[i],steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay));for(let j=0;j<=steps;j++){const t=j/Math.max(1,steps);c.fillRect(Math.round(ax+(bx-ax)*t),Math.round(ay+(by-ay)*t),1,1);}}};
 for(let face=0;face<2;face++){
  c.save();c.translate(face*256,0);c.fillStyle='rgba(25,40,30,.025)';c.fillRect(0,0,256,256);
  const crack=face?[[39,33],[48,46],[45,58],[60,65]]:[[210,45],[197,60],[202,74],[190,87]];
  line(crack,'rgba(20,30,23,.70)');line(crack.map(([x,y])=>[x+1,y]),'rgba(184,193,164,.32)');
  line(face?[[48,46],[62,43],[70,48]]:[[197,60],[186,64],[182,72]],'rgba(36,47,33,.55)');
  // Broken short glints at the upper rim; never a bright stripe across the dial.
  for(const [start,end]of [[-2.4,-2.15],[-2.05,-1.93]]){const points=[];for(let a=start;a<end;a+=.016)points.push([128+Math.cos(a)*118,128+Math.sin(a)*118].map(Math.round));line(points,'rgba(189,203,180,.16)');}
  c.restore();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;return texture;
}
