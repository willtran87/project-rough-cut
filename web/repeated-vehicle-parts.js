import * as THREE from './vendor/three/three.module.js';

function sameArray(a,b){
 if(a.length!==b.length||a.constructor!==b.constructor)return false;
 for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;
 return true;
}
function sameGeometry(a,b){
 const names=Object.keys(a.attributes);
 if(names.length!==Object.keys(b.attributes).length||!!a.index!==!!b.index)return false;
 if(a.index&&!sameArray(a.index.array,b.index.array))return false;
 return names.every(name=>{const x=a.attributes[name],y=b.attributes[name];return y&&x.itemSize===y.itemSize&&x.normalized===y.normalized&&sameArray(x.array,y.array);});
}

// The authored wheels and decks keep their animation pivots. Only geometrically
// identical mesh/material pairs share a draw; side-specific hubs remain distinct.
export function instanceVehicleParts(root,pivots){
 const buckets=[];
 for(const pivot of pivots)for(const mesh of [...pivot.children]){
  if(!mesh.isMesh||Array.isArray(mesh.material))continue;
  let bucket=buckets.find(b=>b.material===mesh.material&&sameGeometry(b.geometry,mesh.geometry));
  if(!bucket){bucket={material:mesh.material,geometry:mesh.geometry,items:[]};buckets.push(bucket);}
  mesh.updateMatrix();bucket.items.push({pivot,mesh,local:mesh.matrix.clone()});
 }
 const batches=[],matrix=new THREE.Matrix4();let savedDraws=0;
 for(const bucket of buckets){
  if(bucket.items.length<2)continue;
  const instanced=new THREE.InstancedMesh(bucket.geometry,bucket.material,bucket.items.length);
  instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // The parent vehicle has a conservative bound. Moving parts must not use
  // Three's first-frame instance sphere after folding, steering or rolling.
  instanced.frustumCulled=false;root.add(instanced);
  for(const {pivot,mesh} of bucket.items){pivot.remove(mesh);if(mesh.geometry!==bucket.geometry)mesh.geometry.dispose();}
  savedDraws+=bucket.items.length-1;
  // Do not retain the removed meshes and their duplicate CPU geometry arrays.
  batches.push({items:bucket.items.map(({pivot,local})=>({pivot,local})),instanced});
 }
 function update(){
  for(const pivot of pivots)pivot.updateMatrix();
  for(const batch of batches){let first=Infinity,last=0;const data=batch.instanced.instanceMatrix.array;
   batch.items.forEach(({pivot,local},i)=>{
    matrix.multiplyMatrices(pivot.matrix,local);let changed=false;
    for(let j=0;j<16;j++)if(data[i*16+j]!==Math.fround(matrix.elements[j])){changed=true;break;}
    if(changed){batch.instanced.setMatrixAt(i,matrix);first=Math.min(first,i);last=i+1;}
   });
   if(last>first){batch.instanced.instanceMatrix.addUpdateRange(first*16,(last-first)*16);batch.instanced.instanceMatrix.needsUpdate=true;}
  }
 }
 update();
 return {update,savedDraws,batches:batches.length,dispose(){for(const b of batches)b.instanced.dispose();}};
}
