import * as THREE from './vendor/three/three.module.js';

// Static bank symbols, grouped by shape and lit/unlit material. Instance
// transforms keep the original mesh's world matrix; hazard state stays owned
// by the chapter. Full-world bounds remain valid when instances are repacked.
export function createBankSignalBatches(scene,waterObjects,materials){
 const groups=[],entries=[];
 scene.updateMatrixWorld(true);
 for(let shape=0;shape<3;shape++){
  const sources=[];
  for(const water of waterObjects)for(const bank of water.signals)for(let i=0;i<bank.length;i++)if(i%3===shape)sources.push(bank[i]);
  if(!sources.length)continue;
  const geometry=sources[0].geometry;
  for(const material of [materials[['redSignal','amberSignal','greenSignal'][shape]],materials.offSignal]){
   const mesh=new THREE.InstancedMesh(geometry,material,sources.length);
   mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
   sources.forEach((source,i)=>mesh.setMatrixAt(i,source.matrixWorld));mesh.computeBoundingBox();mesh.computeBoundingSphere();
   scene.add(mesh);groups.push({mesh,sources,material,packed:[],count:-1});
  }
  for(const source of sources)entries.push({source,visible:source.visible,matrix:source.matrixWorld.clone()});
 }
 const matrices=new Map(entries.map(e=>[e.source,e.matrix]));let enabled=false,uploads=0;
 function update(active=true){
  enabled=active;uploads=0;
  for(const entry of entries)entry.source.visible=active?false:entry.visible;
  for(const group of groups){
   const {mesh,sources,material,packed}=group;mesh.visible=active;if(!active)continue;
   let count=0,first=Infinity,last=-1;
   for(let i=0;i<sources.length;i++)if(sources[i].material===material){
    if(packed[count]!==i){mesh.setMatrixAt(count,matrices.get(sources[i]));packed[count]=i;first=Math.min(first,count);last=count;}
    count++;
   }
   mesh.count=count;
   if(last>=0){mesh.instanceMatrix.addUpdateRange(first*16,(last-first+1)*16);mesh.instanceMatrix.needsUpdate=true;uploads+=(last-first+1)*16;}
   group.count=count;
  }
 }
 return {update,stats:()=>({enabled,symbols:entries.length,batches:groups.length,instances:groups.reduce((n,g)=>n+g.mesh.count,0),matrixValuesUploaded:uploads}),dispose(){for(const entry of entries)entry.source.visible=entry.visible;for(const {mesh}of groups){mesh.removeFromParent();mesh.dispose();}}};
}
