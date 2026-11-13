import {terrainHeight} from './course-terrain.js';
import * as THREE from './vendor/three/three.module.js';
import {barrierPiecePose} from './chase-barriers.js';

export function createCourseHurdles(scene,gates,geometry,material){
 const mesh=new THREE.InstancedMesh(geometry,material,gates.length*6),dummy=new THREE.Object3D(),pose={};
 mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;scene.add(mesh);
 const ages=new Float64Array(gates.length).fill(NaN),directions=new Float64Array(gates.length).fill(NaN),swings=new Float64Array(gates.length).fill(NaN);
 let uploads=0;
 function update(run,reduced=false){
  uploads=0;let first=Infinity,last=0;
  for(let i=0;i<gates.length;i++){
   const state=run.courseFX?.breaks[i],broken=state?.age>=0,t=broken?(reduced?1.2:Math.min(1.2,state.age)):-1,direction=state?.direction||1,swing=(state?.open||0)*(state?.swingDirection||-1);
   if(t===ages[i]&&direction===directions[i]&&swing===swings[i])continue;ages[i]=t;directions[i]=direction;swings[i]=swing;first=Math.min(first,i*6);last=(i+1)*6;
   for(let part=0;part<6;part++){
    barrierPiecePose(gates[i],state,part,reduced,pose);
    dummy.position.set(pose.x,pose.y,pose.z);dummy.rotation.set(pose.rx,pose.ry,pose.rz,'YXZ');dummy.scale.set(pose.sx,pose.sy,pose.sz);dummy.updateMatrix();
    // Flat debris actually rests above the ground, including tilted rail ends.
    const m=dummy.matrix.elements,halfHeight=(Math.abs(m[1])+Math.abs(m[5])+Math.abs(m[9]))*.5;
    if(dummy.position.y<halfHeight+.025){dummy.position.y=halfHeight+.025;dummy.updateMatrix();}
    dummy.position.y+=terrainHeight(dummy.position.x,-dummy.position.z);dummy.updateMatrix();mesh.setMatrixAt(i*6+part,dummy.matrix);
   }
  }
  if(last>first){uploads=last-first;mesh.instanceMatrix.addUpdateRange(first*16,uploads*16);mesh.instanceMatrix.needsUpdate=true;}
 }
 return {mesh,update,stats:()=>({pieces:mesh.count,uploads}),dispose(){scene.remove(mesh);mesh.dispose();}};
}
