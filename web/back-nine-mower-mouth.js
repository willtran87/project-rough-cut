import {createDriveMotion} from './back-nine-drive-motion.js';
// Mechanical presentation follows the authoritative cutting-deck height. It
// adds no collision shape, attack state, lights or material maps.
export function createMowerMouthCraft({THREE,root,body,deck,materials,box,put,cylinder,rail,batch}){
 const driveMotion=createDriveMotion({THREE,body,materials});
 const owned=[],roller=new THREE.Group();roller.name='mower-feed-roller';roller.position.set(0,.20,-.64);deck.add(roller);
 const geometry=g=>{owned.push(g);return g;};
 // Recessed throat and upper cutting comb. The front stays open when the
 // center deck lowers; the dark back wall prevents daylight through the hood.
 box('rubber',0,.64,-1.77,1.47,.70,.035,0,body);
 box('iron',0,1.025,-1.94,1.56,.07,.40,0,body);
 rail(body,[[-.78,1.025,-2.11],[0,1.045,-2.14],[.78,1.025,-2.11]],.034,'rust');
 const toothShape=new THREE.Shape();toothShape.moveTo(-.065,0);toothShape.lineTo(.065,0);toothShape.lineTo(.032,-.13);toothShape.lineTo(-.01,-.165);toothShape.lineTo(-.048,-.10);toothShape.closePath();
 const tooth=geometry(new THREE.ExtrudeGeometry(toothShape,{depth:.055,bevelEnabled:true,bevelSegments:1,bevelSize:.008,bevelThickness:.008,steps:1}));
 for(let i=0;i<8;i++){
  const x=-.63+i*.18;put(tooth,i%3===0?'rust':'iron',x,1.005,-2.105,1,1,1,0,body);
  box('brass',x,1.042,-2.139,.033,.027,.016,0,body);
 }
 for(const side of [-1,1]){
  box('rust',side*.79,.73,-1.94,.065,.54,.37,0,body);
  rail(body,[[side*.79,.98,-2.10],[side*.79,.74,-2.09],[side*.77,.46,-1.93]],.022,'iron');
  // Weld beads and mounting clevises at both hydraulic endpoints.
  for(const z of [-2.06,-1.84])for(const y of [.58,.86])box('iron',side*.826,y,z,.014,.045,.05,0,body);
  for(const dx of [-.055,.055])box('rust',side*.90+dx,1.09,-1.94,.035,.13,.17,0,body);
  const pin=put(cylinder,'iron',side*.90,1.09,-1.94,.045,.19,.045,0,body);pin.rotation.z=Math.PI/2;
  for(const dx of [-.05,.05])box('iron',side*.86+dx,.16,-.52,.03,.13,.15,0,deck);
  const lowerPin=put(cylinder,'brass',side*.86,.16,-.52,.036,.17,.036,0,deck);lowerPin.rotation.z=Math.PI/2;
  const bearing=put(cylinder,'rust',side*.70,.20,-.64,.127,.10,.127,0,deck);bearing.rotation.z=Math.PI/2;
 }
 rail(deck,[[-.76,.11,-.70],[-.50,.12,-.80],[0,.12,-.84],[.50,.12,-.80],[.76,.11,-.70]],.033,'iron');
 // A ribbed transverse feed roller turns inside the revealed mouth.
 const drum=put(cylinder,'iron',0,0,0,.088,1.30,.088,0,roller);drum.rotation.z=Math.PI/2;
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  for(const side of [-1,1]){const rib=box(i%3===0?'rust':'iron',side*.33,Math.cos(a)*.095,Math.sin(a)*.095,.60,.025,.036,0,roller);rib.rotation.x=a;}
 }
 for(const x of [-.48,-.16,.16,.48]){const ring=put(geometry(new THREE.TorusGeometry(.093,.012,4,12)),'iron',x,0,0,1,1,1,0,roller);ring.rotation.y=Math.PI/2;}
 batch(roller);batch(deck);
 // Constant-size instance pools: barrels, piston rods and two flexible hoses.
 const unit=geometry(new THREE.CylinderGeometry(1,1,1,10));
 const pool=(type,count)=>{const m=new THREE.InstancedMesh(unit,materials[type],count);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;root.add(m);return m;};
 const barrels=pool('mower',2),rods=pool('iron',2),hoses=pool('rubber',20);
 const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),d=new THREE.Vector3(),e=new THREE.Vector3(),f=new THREE.Vector3(),direction=new THREE.Vector3();
 const lengths=[0,0],previous=new Float64Array(32).fill(NaN),pose={rollerAngle:0,lengths,hoseSegments:20,cutting:false,height:.68};let phase=0,lastRun=null;
 function segment(mesh,index,start,end,r){direction.subVectors(end,start);dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.scale.set(r,direction.length(),r);dummy.quaternion.setFromUnitVectors(up,direction.normalize());dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);}
 function bezier(target,t){return target.copy(a).multiplyScalar((1-t)**2).addScaledVector(c,2*t*(1-t)).addScaledVector(b,t*t);}
 return {roller,update(run,mouth,dt,reduced=false){
  driveMotion.update(run,dt,reduced);
  if(run.mode==='paused'&&lastRun===run)return;
  if(lastRun!==run){lastRun=run;phase=0;previous.fill(NaN);}
  if(!reduced&&mouth.cutting)phase=(phase+dt*12)%(Math.PI*2);
  roller.rotation.x=reduced?0:phase;body.updateMatrix();deck.updateMatrix();
  pose.rollerAngle=roller.rotation.x;pose.cutting=mouth.cutting;pose.height=deck.position.y;
  let changed=false;for(let i=0;i<32;i++){const value=(i<16?body:deck).matrix.elements[i%16];if(previous[i]!==value)changed=true;previous[i]=value;}if(!changed)return;
  for(let i=0;i<2;i++){
   const side=i?1:-1;
   a.set(side*.90,1.09,-1.94).applyMatrix4(body.matrix);b.set(side*.86,.16,-.52).applyMatrix4(deck.matrix);direction.subVectors(b,a).normalize();lengths[i]=a.distanceTo(b);
   d.copy(a).addScaledVector(direction,.18);segment(barrels,i,a,d,.066);e.copy(a).addScaledVector(direction,.15);segment(rods,i,e,b,.029);
   a.set(side*.98,1.03,-1.85).applyMatrix4(body.matrix);b.set(side*.88,.22,-.50).applyMatrix4(deck.matrix);c.copy(a).add(b).multiplyScalar(.5);c.x+=side*.18;c.z-=.27;c.y+=.08;
   bezier(e,0);for(let n=0;n<10;n++){bezier(f,(n+1)/10);segment(hoses,i*10+n,e,f,.018);e.copy(f);}
  }
  for(const m of [barrels,rods,hoses])m.instanceMatrix.needsUpdate=true;
 },stats:()=>({...pose,drive:driveMotion.stats()}),dispose(){driveMotion.dispose();for(const m of [barrels,rods,hoses]){m.dispose();m.removeFromParent();}for(const g of owned)g.dispose();}};
}
