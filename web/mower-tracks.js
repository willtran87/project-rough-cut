import {terrainHeight,terrainSlope} from './course-terrain.js';
import * as THREE from './vendor/three/three.module.js';
import {canMarkMownGround} from './mower-track-ground.js';
// A bounded ribbon of cut turf, stamped only after real travel. Twenty-four
// opaque, uneven swaths share one prepared draw; no accumulating decals or physics.
export function createMowerTracks(scene,material){
 const positions=[],uv=[],indices=[];
 for(const [i,z]of [-1.15,-.86,-.25,.46,1.15].entries()){
  const widths=[[1.66,1.82],[2.05,1.94],[1.96,2.05],[2.05,1.92],[1.78,1.63]][i];
  positions.push(-widths[0],0,z,widths[1],0,z);uv.push(0,i/4,1,i/4);
  if(i<4){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new THREE.InstancedMesh(geometry,material,24),dummy=new THREE.Object3D();mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;scene.add(mesh);
 let lastRun=null,last=null,cursor=0,count=0,skipped=0,uploads=0;const point={x:0,y:0};
 return {mesh,update(run){uploads=0;if(lastRun!==run){lastRun=run;last=null;cursor=count=skipped=0;mesh.count=0;}const j=run.joe;if(Math.abs(j.speed)<1||run.mode!=='driving')return;
  if(last&&Math.hypot(j.x-last.x,j.y-last.y)<1.9)return;last={x:j.x,y:j.y};
  const x=j.x-Math.sin(j.yaw)*1.7,y=j.y-Math.cos(j.yaw)*1.7;
  if(!canMarkMownGround(x,y,j.yaw,point)){skipped++;return;}
  dummy.position.set(x,terrainHeight(x,y)+.052,-y);const slope=terrainSlope(x,y,j.yaw);dummy.rotation.set(slope.pitch,-j.yaw,slope.roll,'YXZ');dummy.updateMatrix();mesh.setMatrixAt(cursor,dummy.matrix);mesh.instanceMatrix.addUpdateRange(cursor*16,16);mesh.instanceMatrix.needsUpdate=true;uploads=1;cursor=(cursor+1)%24;count=Math.min(24,count+1);mesh.count=count;
 },stats:()=>({segments:count,capacity:24,skipped,uploads}),warm(){mesh.count=24;for(let i=0;i<24;i++){dummy.position.set(0,-20,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.instanceMatrix.needsUpdate=true;},finishWarm(){mesh.count=count;},dispose(){geometry.dispose();scene.remove(mesh);mesh.dispose();}};
}
