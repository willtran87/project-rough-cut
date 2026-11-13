import {terrainHeight} from './course-terrain.js';
import * as THREE from './vendor/three/three.module.js';
import {BREAKABLE_PROPS} from './chase-destruction.js';
// Fixed instancing budget. Analytic debris settles on the ground and freezes
// on the simulation clock; impacts allocate no geometry, textures or lights.
export function createDestructionArt(scene,materials){
 const count=BREAKABLE_PROPS.length*10,geometry=new THREE.BoxGeometry(1,1,1),wood=new THREE.InstancedMesh(geometry,materials.wood,count),iron=new THREE.InstancedMesh(geometry,materials.iron,count),dummy=new THREE.Object3D();
 wood.instanceMatrix.setUsage(THREE.DynamicDrawUsage);iron.instanceMatrix.setUsage(THREE.DynamicDrawUsage);wood.frustumCulled=iron.frustumCulled=false;wood.castShadow=iron.castShadow=true;scene.add(wood,iron);
 dummy.rotation.order='YXZ'; // World-up yaw must not tip a settled flat panel.
 let signature='',uploads=0,lastRun=null;
 function update(run,reduced=false){
  const states=run.destruction?.props;if(!states)return;if(lastRun!==run){lastRun=run;signature='';}
  const key=states.map(s=>s.brokenAt===null?'whole':Math.min(1.2,reduced?1.2:Math.max(0,run.time-s.brokenAt)).toFixed(4)).join(':');if(key===signature)return;signature=key;
  let wi=0,mi=0;
  for(const [index,p]of BREAKABLE_PROPS.entries())for(let i=0;i<10;i++){
   const s=states[index],broken=s.brokenAt!==null,t=broken?(reduced?1.2:Math.min(1.2,Math.max(0,run.time-s.brokenAt))):0,side=i%2?1:-1,crate=p.kind==='crates';let metal=!crate||i>=8;
   let x=0,z=(i%2?1:-1)*p.ry*.8,y=.2+Math.floor(i/2)*.23,sx=p.rx*1.8,sy=.16,sz=.08;
   if(crate&&i>=8){x=side*p.rx*.82;z=0;y=.58;sx=.08;sy=1;sz=p.ry*1.8;}
   if(!crate){
    if(i<4){x=side*p.rx*.82;z=(i<2?-1:1)*p.ry*.8;y=.2;sx=.22;sy=.35;sz=.35;}
    else if(i===4){x=z=0;y=.43;sx=p.rx*1.8;sy=.12;sz=p.ry*1.8;}
    else if(i===5){x=0;z=p.ry*.8;y=1.2;sx=p.rx*1.7;sy=sz=.08;}
    else if(i<8){x=side*p.rx*.8;z=p.ry*.8;y=.83;sx=sz=.08;sy=.75;}
    else{x=side*p.rx*.8;z=0;y=.6;sx=.08;sy=.15;sz=p.ry*1.8;}
   }
   if(p.kind==='bench'){
    metal=i<4;
    if(i<4){x=(i%2?1:-1)*1.05;z=(i<2?-1:1)*.35;y=.27;sx=.09;sy=.54;sz=.09;}
    else if(i<7){x=0;z=-.31+(i-4)*.25;y=.56;sx=2.5;sy=.09;sz=.21;}
    else{x=0;z=.43;y=.74+(i-7)*.18;sx=2.5;sy=.13;sz=.08;}
   }else if(p.kind==='washer'){
    metal=i!==8;
    if(i===0){x=z=0;y=.045;sx=sz=.7;sy=.09;}
    else if(i===1){x=z=0;y=.5;sx=sz=.1;sy=.9;}
    else if(i===2){x=z=0;y=1.02;sx=.44;sy=.34;sz=.42;}
    else if(i===3){x=z=0;y=1.22;sx=.48;sy=.07;sz=.46;}
    else if(i===4){x=0;z=.1;y=1.36;sx=.04;sy=.24;sz=.04;}
    else if(i===5){x=0;z=.1;y=1.49;sx=.21;sy=.04;sz=.05;}
    else if(i===6){x=.29;z=0;y=1.02;sx=.14;sy=.04;sz=.04;}
    else if(i===7){x=.35;z=0;y=.9;sx=.035;sy=.24;sz=.04;}
    else if(i===8){x=.36;z=0;y=.77;sx=.04;sy=.2;sz=.22;}
    else{x=0;z=.22;y=1.03;sx=.25;sy=.08;sz=.02;}
   }
   dummy.position.set(p.x+x+s.dx*t*(.8+i*.08)*s.power,broken?Math.max(.08,y*(1-t/1.2)+Math.sin(t/1.2*Math.PI)*.6):y,-p.y+z-s.dy*t*(.8+i*.08)*s.power);
   const settle=t/1.2,tumble=Math.sin(settle*Math.PI),flatX=sz<=sx&&sz<=sy?Math.PI/2:0,flatZ=sx<sy&&sx<sz?Math.PI/2:0;
   dummy.rotation.set(broken?flatX*settle+tumble*side*1.2:0,broken?t*side*.7:0,broken?flatZ*settle+tumble*side*.7:0);dummy.scale.set(sx,sy,sz);
   // The matrix row includes every axis of the tumble, including long rails.
   if(broken){dummy.updateMatrix();const e=dummy.matrix.elements;dummy.position.y=Math.max(dummy.position.y,(Math.abs(e[1])+Math.abs(e[5])+Math.abs(e[9]))/2+.025);}
   let ground=terrainHeight(dummy.position.x,-dummy.position.z);
   if(broken){dummy.updateMatrix();const e=dummy.matrix.elements;for(const a of [-.5,.5])for(const b of [-.5,.5])for(const c of [-.5,.5])ground=Math.max(ground,terrainHeight(e[12]+e[0]*a+e[4]*b+e[8]*c,-e[14]-e[2]*a-e[6]*b-e[10]*c));}
   dummy.position.y+=ground;dummy.updateMatrix();(metal?iron:wood).setMatrixAt(metal?mi++:wi++,dummy.matrix);
  }
  wood.count=wi;iron.count=mi;wood.instanceMatrix.needsUpdate=iron.instanceMatrix.needsUpdate=true;uploads++;
 }
 return {update,stats:()=>({props:BREAKABLE_PROPS.length,pieces:wood.count+iron.count,uploads}),dispose(){scene.remove(wood,iron);geometry.dispose();}};
}
