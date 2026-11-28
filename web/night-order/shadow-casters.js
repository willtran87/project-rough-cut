// Night Order moon shadow casters, merged for the shadow pass only.
// Several hundred static scenery meshes cast the moon's shadow, and each was a
// separate shadow draw whenever the map refreshed (every frame while walking).
// Their depth output does not depend on their colour material when nothing is
// alpha-tested, so opaque static casters are combined per shadow side and per
// ground cell into position-only proxies. The proxies sit on their own layer:
// shadow cameras see them, the view camera does not. The originals keep
// drawing in the view but stop casting, so every shadow comes from the same
// triangles as before.
// A merged mesh that later moves, hides or leaves the scene would leave a
// stale shadow, so before each shadow refresh the cell holding it is dissolved
// back into its original casters.
export const SHADOW_PROXY_LAYER=11;

export function createShadowCasterMerge(THREE,root,lights=[],{cell=12}={}){
 // three.js picks the shadow pass's face culling from the caster's own
 // material (shadowSide, or the opposite of side), so group by those.
 const sideOf=m=>m.side+'/'+m.shadowSide;
 const mergeable=o=>{
  if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.castShadow||o.name||Array.isArray(o.material)||!(o.layers.mask&1))return false;
  const m=o.material,g=o.geometry;
  if(!m?.visible||m.alphaTest>0||m.alphaToCoverage||(m.displacementMap&&m.displacementScale!==0)||m.clippingPlanes?.length)return false;
  if(o.customDepthMaterial&&(o.customDepthMaterial.alphaTest>0||Object.prototype.hasOwnProperty.call(o.customDepthMaterial,'onBeforeCompile')))return false;
  if(o.customDistanceMaterial||o.morphTargetInfluences?.length||g.morphAttributes?.position||!g.attributes.position)return false;
  if(g.drawRange.start!==0||g.drawRange.count!==Infinity)return false;
  for(let q=o;q&&q!==root;q=q.parent){if(!q.visible)return false;if(q!==o&&q.name)return false;}
  return true;
 };
 root.updateMatrixWorld(true);
 const buckets=new Map(),center=new THREE.Vector3();
 root.traverse(o=>{
  if(!mergeable(o))return;
  const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();
  center.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);
  const side=sideOf(o.material),key=side+':'+Math.floor(center.x/cell)+':'+Math.floor(center.z/cell);
  let bucket=buckets.get(key);if(!bucket)buckets.set(key,bucket={side,material:o.material,members:[]});bucket.members.push(o);
 });
 const depthMaterials=new Map(),cells=[],watch=new Map(),v=new THREE.Vector3(),local=new THREE.Matrix4(),toRoot=root.matrixWorld.clone().invert();
 // A stand-in material carries side/shadowSide for the shadow pass; the
 // proxies never draw in the view, and the depth material is shared.
 const depthFor=(side,source)=>{let m=depthMaterials.get(side);if(!m)depthMaterials.set(side,m={stand:new THREE.MeshBasicMaterial({side:source.side,shadowSide:source.shadowSide,colorWrite:false,depthWrite:false}),depth:new THREE.MeshDepthMaterial()});return m;};
 let merged=0,proxies=0;
 for(const bucket of buckets.values()){
  if(bucket.members.length<2)continue;
  const origin=new THREE.Vector3().setFromMatrixPosition(bucket.members[0].matrixWorld).applyMatrix4(toRoot).round();
  let vertices=0,indices=0;for(const o of bucket.members){const g=o.geometry;vertices+=g.attributes.position.count;indices+=g.index?g.index.count:g.attributes.position.count;}
  const positions=new Float32Array(vertices*3),index=vertices>65535?new Uint32Array(indices):new Uint16Array(indices);let pv=0,pi=0;
  for(const o of bucket.members){
   const g=o.geometry,p=g.attributes.position,base=pv;
   local.multiplyMatrices(toRoot,o.matrixWorld);
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(local).sub(origin);positions[pv*3]=v.x;positions[pv*3+1]=v.y;positions[pv*3+2]=v.z;pv++;}
   if(g.index)for(let i=0;i<g.index.count;i++)index[pi++]=base+g.index.getX(i);else for(let i=0;i<p.count;i++)index[pi++]=base+i;
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(new THREE.BufferAttribute(index,1));geometry.computeBoundingSphere();
  const {stand,depth}=depthFor(bucket.side,bucket.material),proxy=new THREE.Mesh(geometry,stand);
  proxy.name='MoonShadowProxy';proxy.castShadow=true;proxy.receiveShadow=false;proxy.customDepthMaterial=depth;proxy.layers.set(SHADOW_PROXY_LAYER);proxy.position.copy(origin);proxy.updateMatrix();proxy.matrixAutoUpdate=false;
  root.add(proxy);
  const entry={proxy,members:bucket.members,snapshots:[]};
  for(const o of bucket.members){o.castShadow=false;merged++;for(let q=o;q&&q!==root;q=q.parent){if(!watch.has(q))watch.set(q,{position:q.position.clone(),quaternion:q.quaternion.clone(),scale:q.scale.clone(),parent:q.parent,visible:q.visible,cells:new Set()});watch.get(q).cells.add(entry);}}
  cells.push(entry);proxies++;
 }
 // Every shadow camera that draws the view layers must also draw the proxies.
 const addLight=light=>{if(light?.shadow&&(light.shadow.camera.layers.mask&~1)===0)light.shadow.camera.layers.enable(SHADOW_PROXY_LAYER);};
 for(const light of lights)addLight(light);
 let dissolved=0;const reasons=[];
 const restoreDepth=()=>{const first=depthMaterials.values().next().value;if(first)return first.depth;const m=depthFor('restore',{side:THREE.FrontSide,shadowSide:null});return m.depth;};
 function dissolve(entry){
  if(!entry.proxy.parent)return;
  entry.proxy.removeFromParent();entry.proxy.geometry.dispose();
  // Restored casters draw their shadow with the proxies' depth program,
  // which preparation has already compiled, never a fresh default variant.
  for(const o of entry.members){o.castShadow=true;if(!o.customDepthMaterial)o.customDepthMaterial=restoreDepth();}dissolved++;
 }
 return {
  // Call before a shadow refresh; restores originals whose transform,
  // visibility or parent changed since the merge.
  validate(){
   for(const [node,s]of watch){
    if(node.parent===s.parent&&node.visible===s.visible&&node.position.equals(s.position)&&node.quaternion.equals(s.quaternion)&&node.scale.equals(s.scale))continue;
    for(const entry of s.cells)dissolve(entry);
    if(reasons.length<8)reasons.push({type:node.type,name:node.name,parent:node.parent?.name||node.parent?.type||null,moved:!node.position.equals(s.position)||!node.quaternion.equals(s.quaternion)||!node.scale.equals(s.scale),visible:node.visible});
    watch.delete(node);
   }
  },
  addLight,
  // The shared opaque depth material, for casters restored elsewhere.
  depthMaterial:restoreDepth,
  stats:()=>({merged,proxies,live:cells.filter(e=>e.proxy.parent).length,dissolved,cell,reasons}),
  dispose(){for(const e of cells){if(e.proxy.parent){e.proxy.removeFromParent();e.proxy.geometry.dispose();}}for(const m of depthMaterials.values()){m.stand.dispose();m.depth.dispose();}watch.clear();}
 };
}
