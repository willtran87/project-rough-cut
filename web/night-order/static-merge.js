// Night Order static scenery, merged per material and ground cell.
// The course is built from several hundred small opaque meshes that never
// move. Each was its own draw call with its own matrix and uniform upload.
// Meshes that share a material (so the same shader, textures and uniforms)
// and sit in the same cell are combined into one mesh in world space: the
// vertices are transformed once here, normals by the normal matrix, and every
// other vertex attribute (colours, UVs, the pixel-surface coordinates) is
// copied as it is, so the shading is unchanged. Only materials whose shaders
// read standard or per-vertex inputs are merged; object-space effects (wind,
// contact, flames, water) keep their own meshes.
// The originals are kept aside, detached from the scene. If one of them, or a
// group that held it, later moves, hides, changes material or is re-parented,
// its whole cell is restored before the next frame is drawn.
const SAFE_SHADERS=/^(onBeforeCompile\(|rough-cut-pixel-surfaces-v5-)/;
const SAFE_PATCHES=/-course-lantern-field-v2[^ ]*$|-course-moon-rim-v1$/;

export function createStaticMerge(THREE,root,{cell=32}={}){
 const plainCompile=THREE.Material.prototype.onBeforeCompile;
 const safeMaterial=m=>{
  if(!m||m.transparent||!m.visible||m.alphaToCoverage||m.clippingPlanes?.length||m.displacementMap)return false;
  if(!m.isMeshLambertMaterial&&!m.isMeshBasicMaterial&&!m.isMeshPhongMaterial&&!m.isMeshStandardMaterial)return false;
  if(m.onBeforeCompile===plainCompile)return true;
  let key=m.customProgramCacheKey();for(let i=0;i<3;i++)key=key.replace(SAFE_PATCHES,'');
  return SAFE_SHADERS.test(key);
 };
 const plainRender=THREE.Object3D.prototype.onBeforeRender;
 const skipped={};const skip=r=>{skipped[r]=(skipped[r]||0)+1;return false;};
 const mergeable=o=>{
  if(!o.isMesh)return false;
  if(o.isInstancedMesh||o.isSkinnedMesh)return skip('instanced');if(o.name)return skip('named');if(Array.isArray(o.material))return skip('multi');if(!safeMaterial(o.material))return skip('material');
  if(o.layers.mask!==1)return skip('layers');if(o.onBeforeRender!==plainRender)return skip('hook');if(o.morphTargetInfluences?.length)return skip('morph');
  const g=o.geometry;if(!g.attributes.position||g.attributes.tangent||g.morphAttributes?.position)return skip('attributes');if(g.drawRange.start!==0||g.drawRange.count!==Infinity)return skip('drawRange');
  for(let q=o;q&&q!==root;q=q.parent){if(!q.visible)return skip('hidden');if(q!==o&&q.name)return skip('namedParent');}
  return true;
 };
 const signature=g=>Object.keys(g.attributes).sort().map(n=>{const a=g.attributes[n];return n+':'+a.itemSize+':'+a.normalized+':'+a.array.constructor.name+':'+!!a.isInterleavedBufferAttribute;}).join('|')+(g.index?':i':':n');
 root.updateMatrixWorld(true);
 const buckets=new Map(),center=new THREE.Vector3();
 root.traverse(o=>{
  if(!mergeable(o))return;const g=o.geometry;if(g.attributes.position.isInterleavedBufferAttribute)return;
  if(Object.values(g.attributes).some(a=>a.isInterleavedBufferAttribute))return;
  if(!g.boundingSphere)g.computeBoundingSphere();center.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);
  const key=[o.material.uuid,signature(g),o.castShadow,o.receiveShadow,o.renderOrder,o.frustumCulled,Math.floor(center.x/cell),Math.floor(center.z/cell)].join('#');
  let bucket=buckets.get(key);if(!bucket)buckets.set(key,bucket={members:[]});bucket.members.push(o);
 });
 const stash=new THREE.Group(),homes=new Map(),snapshot=(q,parent)=>({position:q.position.clone(),quaternion:q.quaternion.clone(),scale:q.scale.clone(),parent,visible:q.visible,material:q.material,castShadow:q.castShadow,receiveShadow:q.receiveShadow,layers:q.layers.mask,cells:new Set()});
 const cells=[],watch=new Map(),v=new THREE.Vector3(),normalMatrix=new THREE.Matrix3(),local=new THREE.Matrix4(),toRoot=root.matrixWorld.clone().invert();let merged=0,meshes=0,dissolved=0;const reasons=[];
 for(const bucket of buckets.values()){
  const members=bucket.members;if(members.length<2)continue;
  const first=members[0],names=Object.keys(first.geometry.attributes);
  // Vertices are stored relative to a nearby origin, as the originals were,
  // so positions keep the same float precision in the shader.
  const origin=new THREE.Vector3().setFromMatrixPosition(first.matrixWorld).applyMatrix4(toRoot).round();
  let vertices=0,indices=0;for(const o of members){const g=o.geometry;vertices+=g.attributes.position.count;indices+=g.index?g.index.count:g.attributes.position.count;}
  const out={};for(const n of names){const a=first.geometry.attributes[n];out[n]=new a.array.constructor(vertices*a.itemSize);}
  const index=vertices>65535?new Uint32Array(indices):new Uint16Array(indices);let pv=0,pi=0;
  for(const o of members){
   const g=o.geometry,count=g.attributes.position.count,base=pv;local.multiplyMatrices(toRoot,o.matrixWorld);normalMatrix.getNormalMatrix(local);
   for(const n of names){
    const a=g.attributes[n],dst=out[n],size=a.itemSize;
    if(n==='position'){for(let i=0;i<count;i++){v.fromBufferAttribute(a,i).applyMatrix4(local).sub(origin);dst[(base+i)*3]=v.x;dst[(base+i)*3+1]=v.y;dst[(base+i)*3+2]=v.z;}}
    else if(n==='normal'){for(let i=0;i<count;i++){v.fromBufferAttribute(a,i).applyMatrix3(normalMatrix);dst[(base+i)*3]=v.x;dst[(base+i)*3+1]=v.y;dst[(base+i)*3+2]=v.z;}}
    else dst.set(a.array.subarray(0,count*size),base*size);
   }
   // A mirrored transform reverses winding; keep the same faces facing out.
   const flip=local.determinant()<0,src=g.index;
   const n=src?src.count:count;
   for(let i=0;i<n;i+=3){const a=src?src.getX(i):i,b=src?src.getX(i+1):i+1,c=src?src.getX(i+2):i+2;index[pi++]=base+a;index[pi++]=base+(flip?c:b);index[pi++]=base+(flip?b:c);}
   pv+=count;
  }
  const geometry=new THREE.BufferGeometry();
  for(const n of names){const a=first.geometry.attributes[n];geometry.setAttribute(n,new THREE.BufferAttribute(out[n],a.itemSize,a.normalized));}
  geometry.setIndex(new THREE.BufferAttribute(index,1));geometry.computeBoundingSphere();geometry.computeBoundingBox();
  const mesh=new THREE.Mesh(geometry,first.material);
  Object.assign(mesh,{castShadow:first.castShadow,receiveShadow:first.receiveShadow,renderOrder:first.renderOrder,frustumCulled:first.frustumCulled,matrixAutoUpdate:false});
  mesh.position.copy(origin);mesh.updateMatrix();
  mesh.userData.staticMerge=true;root.add(mesh);
  const entry={mesh,members};
  for(const o of members){
   // Detach the original: it no longer costs a visit per frame in the
   // matrix update or the render list. It is re-attached if its cell is
   // restored.
   const parent=o.parent;homes.set(o,parent);
   for(let q=parent;q&&q!==root;q=q.parent){let s=watch.get(q);if(!s)watch.set(q,s=snapshot(q,q.parent));s.cells.add(entry);}
   stash.add(o);merged++;
   const s=snapshot(o,stash);s.cells.add(entry);watch.set(o,s);
  }
  cells.push(entry);meshes++;
 }
 // A restored original casts with an already compiled depth program: the
 // merged mesh's own, or the shadow merge's shared opaque one.
 let restoreDepth=null;
 function dissolve(entry){
  if(!entry.mesh.parent)return;
  entry.mesh.removeFromParent();entry.mesh.geometry.dispose();
  // Re-attach originals that are still stashed; ones another system moved
  // elsewhere stay where that system put them.
  for(const o of entry.members)if(o.parent===stash){homes.get(o)?.add(o);if(o.castShadow&&!o.customDepthMaterial){const depth=entry.mesh.customDepthMaterial||restoreDepth?.();if(depth)o.customDepthMaterial=depth;}}dissolved++;
 }
 return {
  // Call before every frame: restores any cell whose members changed.
  validate(){
   for(const [node,s]of watch){
    if(node.parent===s.parent&&node.visible===s.visible&&node.material===s.material&&node.castShadow===s.castShadow&&node.receiveShadow===s.receiveShadow&&node.layers.mask===s.layers&&node.position.equals(s.position)&&node.quaternion.equals(s.quaternion)&&node.scale.equals(s.scale))continue;
    for(const entry of s.cells)dissolve(entry);
    if(reasons.length<8)reasons.push({type:node.type,name:node.name,material:node.material!==s.material,visible:node.visible!==s.visible,layers:node.layers.mask!==s.layers});
    watch.delete(node);
   }
  },
  setRestoreDepth(fn){restoreDepth=fn;},
  stats:()=>({skipped,singles:[...buckets.values()].filter(b=>b.members.length<2).length,buckets:buckets.size,merged,meshes,live:cells.filter(e=>e.mesh.parent).length,dissolved,cell,reasons}),
  // Put the originals back so the world's own disposal handles them.
  dispose(){for(const e of cells)dissolve(e);watch.clear();}
 };
}
