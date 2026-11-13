import * as THREE from './vendor/three/three.module.js';
import {COURSE,pathDistance,surfaceAt} from './back-nine-course.js';
import {terrainHeight} from './course-terrain.js';

export function mowerCanCut(x,y){return pathDistance({x,y})>3.15&&!COURSE.sand.some(s=>((x-s.x)/s.rx)**2+((y-s.y)/s.ry)**2<1)&&Math.abs(x)<39;}
// Persistent, bounded particles leave the deck in world space, fall under
// gravity, then settle. A moving cloud attached to the mower looks like smoke.
export function createMowerClippings(scene){
 const capacity=96,geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshLambertMaterial({color:0xb4c77b,emissive:0x10200b});
 const mesh=new THREE.InstancedMesh(geometry,material,capacity),dummy=new THREE.Object3D(),color=new THREE.Color();mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;scene.add(mesh);
 const pool=Array.from({length:capacity},()=>({age:99,life:.72}));let owner=null,last=0,carry=0,cursor=0,serial=0,emitted=0,active=0;
 return {update(run,reduced=false){
  if(owner!==run){owner=run;last=run.time;carry=cursor=serial=emitted=0;pool.forEach(p=>p.age=99);}
  const dt=Math.max(0,Math.min(.1,run.time-last));last=run.time;const j=run.joe;
  for(const p of pool)p.age+=dt;
  if(reduced){pool.forEach(p=>p.age=99);carry=0;}
  else if(run.mode==='driving'&&Math.abs(j.speed)>1.2&&(!j.ram||!['backoff','missed','lineup'].includes(j.ram.phase))){
   carry+=dt*Math.min(90,35+Math.abs(j.speed)*3);
   while(carry>=1){carry--;const n=serial++,side=n%2?1:-1,across=side*(1.1+(n%7)*.19),x=j.x+Math.cos(j.yaw)*across+Math.sin(j.yaw)*1.1,y=j.y-Math.sin(j.yaw)*across+Math.cos(j.yaw)*1.1;
    if(!mowerCanCut(x,y))continue;
    const wet=surfaceAt({x,y},run)==='wet',p=pool[cursor++%capacity],power=1.5+(n%5)*.35;
    Object.assign(p,{age:0,x,y,h:terrainHeight(x,y)+.2,vx:Math.cos(j.yaw)*side*power+Math.sin(j.yaw)*j.speed*.12,vy:-Math.sin(j.yaw)*side*power+Math.cos(j.yaw)*j.speed*.12,vh:wet?1.6:2.1+(n%4)*.3,spin:n*2.4,size:wet?.075:.045+(n%4)*.012,wet,life:.72});emitted++;
   }
  }else carry=0;
  active=0;
  for(const p of pool){if(p.age>=p.life)continue;const t=p.age,x=p.x+p.vx*t,y=p.y+p.vy*t,h=Math.max(terrainHeight(x,y)+.025,p.h+p.vh*t-4.9*t*t),fade=Math.min(1,(p.life-t)*6);
   dummy.position.set(x,h,-y);dummy.rotation.set(p.spin+t*9,t*7,p.spin);dummy.scale.set(p.size*fade,p.size*(p.wet?1.3:2.6)*fade,p.size*.4*fade);dummy.updateMatrix();mesh.setMatrixAt(active,dummy.matrix);color.setHex(p.wet?0x536841:[0x89a45c,0x637d37,0xb1b46b][Math.floor(p.spin)%3]);mesh.setColorAt(active++,color);
  }
  mesh.count=active;mesh.visible=active>0;if(active){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;}
 },stats:()=>({active,capacity,emitted}),warm(){mesh.visible=true;mesh.count=1;dummy.position.set(0,-5,0);dummy.updateMatrix();mesh.setMatrixAt(0,dummy.matrix);mesh.setColorAt(0,color.setHex(0x89a45c));},dispose(){scene.remove(mesh);mesh.dispose();geometry.dispose();material.dispose();}};
}
