import * as THREE from './vendor/three/three.module.js';
import {createMachineFinishMaterial,tagMachineSurface} from './final-cut-machine-finish.js';
import {RIG_BANK} from './final-cut-rig.js';
import {hydraulicLayout,hydraulicPartId} from './final-cut-hydraulic-layout.js';

export function createFinalCutHydraulics(body,materials,audit){
 const material=createMachineFinishMaterial(),kind={green:0,metal:1,dark:4,brass:5},buckets=new Map(),sides=[],up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3();
 // Scale texture coordinates in metres for each instance. Unit-cylinder
 // coordinates alone would stretch the authored pixels along every rod.
 const compile=material.onBeforeCompile;
 material.onBeforeCompile=shader=>{compile(shader);shader.vertexShader='attribute vec3 hydraulicScale;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('vMachinePoint=machinePoint;',`vMachinePoint=machinePoint*hydraulicScale;
 vec3 hn=abs(normal);vec2 hs=hn.y>=max(hn.x,hn.z)?hydraulicScale.xz:hn.x>hn.z?hydraulicScale.zy:hydraulicScale.xy;vMachineFace.xy*=hs;`);};
 material.customProgramCacheKey=()=> 'final-cut-authored-hydraulics-1';
 for(const sign of [-1,1]){
  const entries=hydraulicLayout(1.15,RIG_BANK).parts.map(part=>{
   const key=part.type+':'+(part.profile||'round')+':'+part.material;if(!buckets.has(key)){const g=part.type==='box'?new THREE.BoxGeometry():new THREE.CylinderGeometry(1,1,1,part.profile==='hex'?6:12);tagMachineSurface(g,kind[part.material],.37);buckets.set(key,{geometry:g,material,entries:[]});}
   const bucket=buckets.get(key),mesh=new THREE.Object3D();
   const entry={id:hydraulicPartId(sign,part),mesh,index:bucket.entries.length,bucket};bucket.entries.push(entry);return entry;
  });sides.push({sign,entries,angle:null});
 }
 for(const bucket of buckets.values()){bucket.scale=new THREE.InstancedBufferAttribute(new Float32Array(bucket.entries.length*3),3);bucket.scale.setUsage(THREE.DynamicDrawUsage);bucket.geometry.setAttribute('hydraulicScale',bucket.scale);const mesh=new THREE.InstancedMesh(bucket.geometry,bucket.material,bucket.entries.length);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);body.add(mesh);bucket.mesh=mesh;for(const e of bucket.entries)audit(e.id,mesh,e.index);}
 function update(left,right){
  let changed=false;
  for(const side of sides){const angle=side.sign<0?left:right;if(side.angle===angle)continue;side.angle=angle;changed=true;const pose=hydraulicLayout(angle,RIG_BANK);side.pose=pose;
   pose.parts.forEach((part,i)=>{const {mesh,bucket,index}=side.entries[i];
    if(part.type==='tube'){
     const a=part.start,b=part.end;direction.set(side.sign*(b.side-a.side),b.height-a.height,-(b.forward-a.forward));
     mesh.position.set(side.sign*(a.side+b.side)/2,(a.height+b.height)/2,-(a.forward+b.forward)/2);mesh.scale.set(part.radius,direction.length(),part.radius);mesh.quaternion.setFromUnitVectors(up,direction.normalize());
    }else{mesh.position.set(side.sign*part.side,part.height,-part.forward);mesh.rotation.set(0,0,side.sign*part.rotation);mesh.scale.set(part.width,part.tall,part.depth);}
    mesh.updateMatrix();bucket.mesh.setMatrixAt(index,mesh.matrix);bucket.scale.setXYZ(index,mesh.scale.x,mesh.scale.y,mesh.scale.z);
   });
  }
  if(changed)for(const bucket of buckets.values()){bucket.mesh.instanceMatrix.needsUpdate=true;bucket.scale.needsUpdate=true;bucket.mesh.computeBoundingSphere();}
 }
 update(1.15,1.15);
 return {update,stats(){return {batches:buckets.size,materials:1,newTextures:0,triangles:[...buckets.values()].reduce((n,b)=>n+b.geometry.index.count/3*b.entries.length,0),parts:sides.reduce((n,s)=>n+s.entries.length,0),sides:sides.map(s=>({side:s.sign,angle:s.angle,length:s.pose.length,extension:s.pose.extension,base:s.pose.base,wing:s.pose.wing,hoses:s.pose.hoses.map(points=>points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.side-points[i].side,p.height-points[i].height,p.forward-points[i].forward),0))}))};},dispose(){for(const b of buckets.values()){b.mesh.dispose();b.geometry.dispose();}material.dispose();}};
}
