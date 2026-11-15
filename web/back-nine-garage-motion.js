import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

const HEIGHT=4.9,COUNT=24,PITCH=HEIGHT/COUNT,TURN=4.62,RADIUS=.34;
const clamp=v=>Math.max(0,Math.min(1,v));
export function garageOpening(run){
 return clamp((run.finale?.gate>0||['sealing','complete'].includes(run.mode))?1-(run.finale?.gate||0):run.exitRelease?.open??1);
}
// Distance along the real vertical/curved/overhead guide. Adjacent sections
// share one continuous path, including at the quarter-circle transition.
export function garageGuide(distance){
 if(distance<=TURN)return {y:distance,z:0,angle:0};
 const arc=Math.min(Math.PI/2,(distance-TURN)/RADIUS);
 return {y:TURN+Math.sin(arc)*RADIUS,z:-RADIUS*(1-Math.cos(arc))-Math.max(0,distance-TURN-Math.PI*RADIUS/2),angle:-arc};
}

export function createGarageMotion(scene,materials){
 const root=new THREE.Group();root.name='BackNineSectionalShutter';root.position.set(-23,0,-800);scene.add(root);
 const parts=[];
 for(const [w,h,d,y,z]of [[11,PITCH-.012,.085,0,0],[10.96,.025,.055,-PITCH*.35,.06]]){
  const g=new THREE.BoxGeometry(w,h,d);g.translate(0,y,z);parts.push(g);
 }
 const section=mergeIndexedGeometries(parts);parts.forEach(g=>g.dispose());
 // A fixed two-sided profile plus raised folds, in a single mutable batch.
 // UVs remain attached to the steel as it turns into the overhead track.
 const uv=section.attributes.uv,pos=section.attributes.position;
 for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/.7,pos.getY(i)/.7);
 const slats=Array.from({length:COUNT},()=>section.clone()),geometry=mergeIndexedGeometries(slats);slats.forEach(g=>g.dispose());
 const mesh=new THREE.Mesh(geometry,materials.iron);mesh.name='GarageSlats';root.add(mesh);
 const p=geometry.attributes.position,n=geometry.attributes.normal,baseP=section.attributes.position,baseN=section.attributes.normal;
 p.setUsage(THREE.DynamicDrawUsage);n.setUsage(THREE.DynamicDrawUsage);
 // End rollers/rivets follow each section; also batched rather than 48 draws.
 const fastener=new THREE.BoxGeometry(.065,.065,.035),fasteners=[];
 for(let i=0;i<COUNT;i++)for(const side of [-1,1]){const g=fastener.clone();g.translate(side*5.36,0,.07);fasteners.push(g);}
 const boltsGeometry=mergeIndexedGeometries(fasteners);fasteners.forEach(g=>g.dispose());fastener.dispose();
 const boltsBase=boltsGeometry.attributes.position.array.slice(),boltsNormals=boltsGeometry.attributes.normal.array.slice();
 const bolts=new THREE.Mesh(boltsGeometry,materials.brass);root.add(bolts);
 const wheel=new THREE.Group();wheel.position.set(-5.12,5.04,-.10);root.add(wheel);
 const ring=new THREE.TorusGeometry(.24,.042,5,16);ring.rotateY(Math.PI/2);
 const spokes=[ring];for(let i=0;i<4;i++){const g=new THREE.BoxGeometry(.09,.46,.045);g.rotateX(i*Math.PI/4);spokes.push(g);}
 const wheelGeometry=mergeIndexedGeometries(spokes);spokes.forEach(g=>g.dispose());wheel.add(new THREE.Mesh(wheelGeometry,materials.rust));
 const dustMaterial=new THREE.MeshBasicMaterial({color:0xb6a58a,transparent:true,opacity:.27,depthWrite:false});
 const dust=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),dustMaterial,48);dust.name='GarageRailDust';dust.count=0;dust.frustumCulled=false;scene.add(dust);
 const dummy=new THREE.Object3D();let lastRun=null,lastTime=0,lastOpen=-1,lastMotion=-99,direction=0,uploads=0;
 const hash=i=>{const v=Math.sin(i*127.1+31.7)*43758.5453;return v-Math.floor(v);};
 function pose(open){
  const lift=open*HEIGHT;root.position.y=lift;
  for(let s=0;s<COUNT;s++){
   const path=garageGuide((s+.5)*PITCH+lift),c=Math.cos(path.angle),sin=Math.sin(path.angle);
   for(let v=0;v<baseP.count;v++){
    const index=s*baseP.count+v,y=baseP.getY(v),z=baseP.getZ(v),ny=baseN.getY(v),nz=baseN.getZ(v);
    p.setXYZ(index,baseP.getX(v),path.y-lift+c*y-sin*z,path.z+sin*y+c*z);
    n.setXYZ(index,baseN.getX(v),c*ny-sin*nz,sin*ny+c*nz);
   }
   for(let v=0;v<48;v++){
    const index=s*48+v,o=index*3,y=boltsBase[o+1],z=boltsBase[o+2],ny=boltsNormals[o+1],nz=boltsNormals[o+2];
    boltsGeometry.attributes.position.setXYZ(index,boltsBase[o],path.y-lift+c*y-sin*z,path.z+sin*y+c*z);
    boltsGeometry.attributes.normal.setXYZ(index,boltsNormals[o],c*ny-sin*nz,sin*ny+c*nz);
   }
  }
  for(const g of [geometry,boltsGeometry]){g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;g.computeBoundingSphere();g.computeBoundingBox();}
  wheel.position.y=5.04-lift;wheel.rotation.x=-lift/.24;uploads++;lastOpen=open;
 }
 pose(0);
 return {root,update(run,reducedMotion=false){
  const open=garageOpening(run),reset=lastRun!==run||run.time<lastTime;
  if(reset){lastMotion=-99;direction=0;lastRun=run;}
  if(open!==lastOpen){if(!reset&&run.time>lastTime){direction=Math.sign(open-lastOpen);lastMotion=run.time;}pose(open);}
  const age=run.time-lastMotion,moving=age>=0&&age<.65;
  dust.count=!reducedMotion&&moving?48:0;
  for(let i=0;i<dust.count;i++){
   const cycle=(run.time*.7+hash(i))%1,fall=cycle*.75,side=i%2?1:-1;
   dummy.position.set(-23+side*(5.25+hash(i+60)*.2)+(hash(i+80)-.5)*fall,4.65-fall*fall*2.3,-800-.15-hash(i+100)*.4+direction*fall*.12);
   dummy.rotation.set(i,run.time*.2+i,0);dummy.scale.setScalar((.012+hash(i+30)*.026)*Math.sin(cycle*Math.PI)*Math.max(0,1-age/.65));dummy.updateMatrix();dust.setMatrixAt(i,dummy.matrix);
  }
  if(dust.count)dust.instanceMatrix.needsUpdate=true;
  lastTime=run.time;
 },stats:()=>({open:lastOpen,sections:COUNT,lift:lastOpen*HEIGHT,driveAngle:wheel.rotation.x,dust:dust.count,uploads,overhead:garageGuide(HEIGHT*(1+lastOpen))}),
 dispose(){root.removeFromParent();dust.removeFromParent();section.dispose();geometry.dispose();boltsGeometry.dispose();wheelGeometry.dispose();dust.geometry.dispose();dustMaterial.dispose();}};
}
