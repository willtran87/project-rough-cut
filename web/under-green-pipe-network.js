import * as THREE from './vendor/three/three.module.js';
import {LEVER} from './under-green-layout.js';
import {pipeJointFrame,setPipeJointFrame} from './under-green-pipe-finish.js';
import {DRAIN_DRIPS} from './under-green-water-contacts.js';
const PIPE_DRIPS=DRAIN_DRIPS.filter(d=>!d.surface||d.surface==='pipe');

// Torn insulation is a closed shell, rather than a translucent decal hovering
// over the pipe. The missing sector reveals the original corroded steel.
export function pipeInsulationGeometry(radius,length,seed=0){
 const p=[],uv=[],index=[],steps=20,start=.38,end=5.81;
 for(let side=0;side<2;side++)for(let edge=0;edge<2;edge++)for(let i=0;i<=steps;i++){
  const a=start+(end-start)*i/steps,r=radius+(side?0:.016),z=(edge?1:-1)*(length/2+.035*Math.sin(i*2.1+seed)+.016*Math.cos(i*3.4+seed));
  p.push(Math.cos(a)*r,Math.sin(a)*r,z);uv.push(a*radius/2,z/2);
 }
 const n=steps+1,quad=(a,b,c,d)=>index.push(a,b,c,a,c,d);
 for(let i=0;i<steps;i++){
  quad(i,i+1,n+i+1,n+i);quad(2*n+i,3*n+i,3*n+i+1,2*n+i+1);
  quad(i,2*n+i,2*n+i+1,i+1);quad(n+i,n+i+1,3*n+i+1,3*n+i);
 }
 quad(0,n,3*n,2*n);quad(steps,2*n+steps,3*n+steps,n+steps);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();g.userData.preserveDrainUV=true;return g;
}

export function buildDrainPipeNetwork({put,box}){
 const stats={runs:[],repairs:[],insulation:[],leaks:PIPE_DRIPS.map(d=>({x:d.x,y:d.y,height:d.height})),finishAttributeBytes:0,elbows:1,tee:{x:-20,y:40,height:3.65}};
 const cylinder=(type,x,h,y,r,length,axis='z',segments=16)=>{
  const g=new THREE.CylinderGeometry(r,r,length,segments),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  const span=type.startsWith('machine')||type==='pipeSurface'?1:2;
  for(let i=0;i<p.count;i++)if(Math.abs(n.getY(i))>.9)uv.setXY(i,p.getX(i)/span,p.getZ(i)/span);else uv.setXY(i,uv.getX(i)*Math.PI*r*2/span,uv.getY(i)*length/span);
  if(type==='pipeSurface'){const profile=h<3.5?0:axis==='x'?1:x===6?4:2,coordinate=axis==='x'?x:y;stats.finishAttributeBytes+=setPipeJointFrame(g,pipeJointFrame(profile,coordinate-length/2,coordinate+length/2));}
  g.userData.preserveDrainUV=true;put(g,type,x,h,-y,1,1,1,axis==='z'?Math.PI/2:0,0,axis==='x'?Math.PI/2:0);g.dispose();
 };
 const run=(ax,ay,bx,by,h,r)=>{
  const length=Math.hypot(bx-ax,by-ay),count=Math.ceil(length/8);
  for(let i=0;i<count;i++)cylinder('pipeSurface',ax+(bx-ax)*(i+.5)/count,h,ay+(by-ay)*(i+.5)/count,r,length/count,bx===ax?'z':'x');
  stats.runs.push({a:[ax,h,-ay],b:[bx,h,-by],radius:r});
 };
 const collar=(x,y,h,r,axis='z',repair=false)=>{
  cylinder('pipeSurface',x,h,y,r+.03,repair?.42:.16,axis);
  for(const s of [-1,1]){
   const offset=s*(repair?.185:.065);
   cylinder('machineSteel',x+(axis==='x'?offset:0),h,y+(axis==='z'?offset:0),r+.04,.025,axis);
  }
  // Two visible split-clamp ears with seated hex nuts, below the crown.
  for(const s of [-1,1]){
   const x1=x+(axis==='z'?s*(r+.035):0),y1=y+(axis==='x'?s*(r+.035):0);
   box('machineIron',x1,h+.045,-y1,axis==='z'?.07:.26,.065,axis==='z'?.26:.07);
   cylinder('machineSteel',x1,h+.087,y1,.022,.02,'y',6);
  }
  if(repair)stats.repairs.push({x,y,height:h,radius:r+.03,axis});
 };
 // Retain the supported gallery route, with real joints and closed ends.
 run(-2.65,8,-2.65,72,3.25,.12);
 for(const y of [8,16,24,32,40,48,56,64,72])collar(-2.65,y,3.25,.12,'z',y===64);
 collar(-2.65,23,3.25,.12,'z',true);
 for(const [i,y]of [31.1,47.1,55.2].entries()){
  const g=pipeInsulationGeometry(.123,.82+i*.13,i*1.7);put(g,'sand',-2.65,3.25,-y);g.dispose();stats.insulation.push({x:-2.65,y,height:3.25,length:.82+i*.13});
  for(const off of [-.25,.25])cylinder('iron',-2.65,3.25,y+off,.143,.035);
 }
 // One continuous header joins the west feed and north branch. The east
 // turn has a swept, tangent-matched elbow instead of intersecting cylinders.
 run(LEVER.x,40,5.45,40,3.65,.2);
 run(-20,40,-20,49,3.65,.2);
 run(6,39.45,6,38,3.65,.2);
 const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(5.45,3.65,-40),new THREE.Vector3(6,3.65,-40),new THREE.Vector3(6,3.65,-39.45));
 const elbow=new THREE.TubeGeometry(curve,12,.2,16,false),uv=elbow.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*curve.getLength(),uv.getY(i)*Math.PI*.4);
 stats.finishAttributeBytes+=setPipeJointFrame(elbow,[5.4,39.35,6,3]);
 elbow.userData.preserveDrainUV=true;elbow.translate(-6,0,40);put(elbow,'pipeSurface',6,0,-40);elbow.dispose();
 for(const x of [-23.5,-20,-14,-8,0,5.4])collar(x,40,3.65,.2,'x',x===-8);
 for(const y of [40.35,44,48.65])collar(-20,y,3.65,.2);
 collar(6,39.35,3.65,.2);
 for(const [x,y]of [[-23,40],[-20,43],[-20,47],[-14,40],[-6,40],[2,40],[6,39]]){
  box('iron',x,3.99,-y,.045,.32,.045);box('steel',x,4.125,-y,.24,.05,.24);
  cylinder('iron',x,3.65,y,.235,.08,x===-20||x===6?'z':'x');
 }
 // Small dark weep sockets terminate at the actual droplet origins. They
 // share the existing particle clocks and introduce no new spray emitter.
 for(const d of PIPE_DRIPS)cylinder('rubber',d.x,d.height+.012,d.y,.018,.024,'y',8);
 return stats;
}
