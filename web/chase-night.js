import * as THREE from './vendor/three/three.module.js';
// Slow independent electrical faults, with a steady fallback for comfort.
export function lampFlicker(time,station,amount=1,reduced=false){
 if(reduced||amount<=0)return 1;
 const phase=(time+station*.173)%17.3;
 const sag=phase>12&&phase<14.2?Math.sin((phase-12)/2.2*Math.PI)**2:0;
 return 1-amount*(sag*.38+(.5+.5*Math.sin(time*3.1+station))*.035);
}
// Eight nearby tree silhouettes share a single draw. These are authored
// ground projections of the border trees, not real-time shadow maps.
export function createNightShadows(scene,trees,moon){
 const positions=[];
 function triangle(a,b,c){for(const p of [a,b,c])positions.push(p[0],0,p[1]);}
 triangle([-.16,0],[.2,0],[.12,12]);triangle([-.16,0],[.12,12],[-.12,12]);
 for(let n=0;n<7;n++){const z=2+n*1.25,w=2.6-n*.27;triangle([0,z-1],[-w,z+1.3],[0,z+.8]);triangle([0,z-.7],[0,z+1],[w,z+1.5]);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
 const material=new THREE.MeshBasicMaterial({color:0x020609,transparent:true,opacity:.23,depthWrite:false,forceSinglePass:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,fog:true});
 const mesh=new THREE.InstancedMesh(geometry,material,8),dummy=new THREE.Object3D();mesh.name='CourseMoonShadows';mesh.frustumCulled=false;mesh.count=0;scene.add(mesh);
 const source=new THREE.Vector3(),target=new THREE.Vector3(),selected=new Int32Array(8),distances=new Float64Array(8);
 mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 let previous='',count=0,uploads=0;
 return {update(actor,time,reduced){
  // Stationary trees cannot cast swaying shadows under a stationary moon.
  // Project their authored silhouettes along the actual directional light;
  // clouds change contrast rather than rotating the shadows independently.
  if(moon){moon.getWorldPosition(source);moon.target.getWorldPosition(target);source.sub(target);}else source.set(-30,55,10);
  material.opacity=.23*THREE.MathUtils.clamp((moon?.intensity??.62)/.62,0,1);
  const key=Math.floor(actor.x/8)+':'+Math.floor(actor.y/8)+':'+source.x+':'+source.y+':'+source.z;
  if(key===previous)return;previous=key;selected.fill(-1);distances.fill(Infinity);count=0;
  // Choose nearby trees on both axes, including lateral moves in comfort mode.
  // Fixed scratch arrays avoid sorting/allocating during a chase.
  for(let i=0;i<trees.length;i++){
   const p=trees[i],dx=p.x-actor.x,dz=p.z+actor.y;if(Math.abs(dz)>42||Math.abs(dx)>48)continue;
   const d=dx*dx+dz*dz;let slot=7;if(d>=distances[slot])continue;
   while(slot>0&&d<distances[slot-1]){distances[slot]=distances[slot-1];selected[slot]=selected[slot-1];slot--;}
   distances[slot]=d;selected[slot]=i;
  }
  const horizontal=Math.hypot(source.x,source.z),angle=Math.atan2(-source.x,-source.z);
  if(source.y>0&&horizontal>0)for(const id of selected){if(id<0)break;const p=trees[id];
   dummy.position.set(p.x,.135,p.z);dummy.rotation.set(0,angle,0);dummy.scale.set(p.w||1,1,(p.h||8)*horizontal/source.y/12);dummy.updateMatrix();mesh.setMatrixAt(count++,dummy.matrix);
  }
  mesh.count=count;if(count){mesh.instanceMatrix.addUpdateRange(0,count*16);mesh.instanceMatrix.needsUpdate=true;uploads++;}
 },stats:()=>({visible:count,max:8,uploads,opacity:material.opacity}),dispose(){geometry.dispose();material.dispose();mesh.dispose();mesh.removeFromParent();}};
}
