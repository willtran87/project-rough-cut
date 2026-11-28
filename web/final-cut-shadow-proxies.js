// Culled copies of the course's largest static casters.
//
// On hardware the camera draws whole-course batches (few draw calls), but each
// shadow map only needs the casters inside its own light's frustum. A spot lamp
// with a 6 m reach was drawing every stone of the course (and every reed) into
// its map each time it refreshed. Here each large caster gets copies binned
// into ground cells: the same geometry buffers, material, depth material and
// instance transforms, so three.js can cull them per camera. The originals
// skip shadow passes. Depth is order-independent and nothing is added or
// removed inside any light's range, so every shadow map is unchanged.
//
// Each shadow light uses the cell size that suits its reach: short lamps see
// fine cells (few cells in range), the long headlamps coarse cells, and the
// moon's long box the whole batch (a copy that shares the original's buffers),
// so no light draws more calls than it gains in triangles. The copies live on
// their own layers: never hit by raycasts, and only the reed view cells are
// drawn by the camera.
const LAYERS={fine:2,coarse:3,whole:4},VIEW_LAYER=5;

export function createShadowProxies(THREE,{scene,renderer,camera,moonlight,fineCell=16,coarseCell=48,viewCell=16,minTriangles=20000,setFor}){
 const proxies=[],originals=[],matrix=new THREE.Matrix4(),at=new THREE.Vector3();let shadowPass=false;
 const SIZES={fine:fineCell,coarse:coarseCell,whole:Infinity};
 const keyOf=(x,z,size)=>size===Infinity?'all':Math.floor(x/size)+','+Math.floor(z/size);
 // Default: moon -> whole batch, reach up to 16 m -> fine, longer -> coarse.
 const choose=setFor||(light=>light===moonlight||!light.distance?'whole':light.distance<=16?'fine':'coarse');
 function place(original,proxy,layer,name,shadow){
  proxy.name=original.name+name;proxy.castShadow=shadow;proxy.receiveShadow=!shadow&&original.receiveShadow;proxy.customDepthMaterial=original.customDepthMaterial;proxy.customDistanceMaterial=original.customDistanceMaterial;
  proxy.layers.set(layer);proxy.matrixAutoUpdate=false;proxy.matrix.copy(original.matrixWorld);proxy.matrixWorld.copy(original.matrixWorld);proxy.matrixWorldAutoUpdate=false;
  scene.add(proxy);proxies.push(proxy);
 }
 function adopt(original,make,{view=false}={}){
  for(const [set,layer]of Object.entries(LAYERS))for(const [key,proxy]of make(SIZES[set]))place(original,proxy,layer,'-shadow-'+set+'-'+key,true);
  if(view)for(const [key,proxy]of make(viewCell))place(original,proxy,VIEW_LAYER,'-view-'+key,false);
  // The original stays in the scene (raycasts, checks) but is no longer drawn
  // by shadow passes, nor by the camera once view cells replace it.
  const cull=original.intersectsFrustum;original.intersectsFrustum=function(frustum){return !view&&!shadowPass&&cull.call(this,frustum);};originals.push(original);
 }
 return {
  // Static InstancedMesh: bins whole instances by their position.
  instanced(mesh){
   // Small batches are cheaper drawn whole than as several culled copies.
   const triangles=(mesh.geometry.index?mesh.geometry.index.count:mesh.geometry.attributes.position.count)/3*mesh.count;
   if(!mesh.castShadow||!mesh.frustumCulled||triangles<minTriangles)return;mesh.updateMatrixWorld(true);
   adopt(mesh,size=>{
    if(size===Infinity){const copy=new THREE.InstancedMesh(mesh.geometry,mesh.material,mesh.count);copy.instanceMatrix=mesh.instanceMatrix;copy.boundingSphere=mesh.boundingSphere.clone();return [['all',copy]];}
    const cells=new Map();for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);at.setFromMatrixPosition(matrix);const key=keyOf(at.x,at.z,size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i);}
    return [...cells].map(([key,list])=>{const proxy=new THREE.InstancedMesh(mesh.geometry,mesh.material,list.length);list.forEach((index,i)=>{mesh.getMatrixAt(index,matrix);proxy.setMatrixAt(i,matrix);});proxy.computeBoundingSphere();return [key,proxy];});});
  },
  // Static indexed Mesh whose vertex shader displaces vertices: triangles are
  // binned by a per-vertex pivot (e.g. a plant root, so clumps stay whole and
  // keep their triangle order) and each cell's bounds are widened by the
  // shader's maximum displacement. With view:true the camera draws the cells.
  indexed(mesh,{pivot,margin,view=false}){
   if(!mesh.castShadow||!mesh.frustumCulled||!mesh.geometry.index)return;mesh.updateMatrixWorld(true);
   const g=mesh.geometry,index=g.index.array,position=g.attributes.position,root=g.attributes[pivot];
   adopt(mesh,size=>{
    if(size===Infinity)return [['all',new THREE.Mesh(g,mesh.material)]];
    const cells=new Map();
    for(let t=0;t<index.length;t+=3){const a=index[t],key=keyOf(root.getX(a),root.getY(a),size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(index[t],index[t+1],index[t+2]);}
    return [...cells].map(([key,list])=>{const geometry=new THREE.BufferGeometry();for(const [name,attribute]of Object.entries(g.attributes))geometry.setAttribute(name,attribute);geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(list),1));
     const box=new THREE.Box3();for(const i of list)box.expandByPoint(at.fromBufferAttribute(position,i));box.expandByVector(margin(box));geometry.boundingBox=box;geometry.boundingSphere=box.getBoundingSphere(new THREE.Sphere());
     return [key,new THREE.Mesh(geometry,mesh.material)];});},{view});
  },
  // Call once every caster is adopted and every shadow light exists.
  finish(){
   scene.traverse(o=>{if(o.isLight&&o.castShadow)o.shadow.camera.layers.enable(LAYERS[choose(o)]);});
   if(proxies.some(p=>p.layers.mask===1<<VIEW_LAYER))camera.layers.enable(VIEW_LAYER);
   const render=renderer.shadowMap.render;renderer.shadowMap.render=function(...args){shadowPass=true;try{return render.apply(this,args);}finally{shadowPass=false;}};
  },
  stats:()=>({originals:originals.length,proxies:proxies.length,...Object.fromEntries(Object.entries(LAYERS).map(([set,layer])=>[set,proxies.filter(p=>p.layers.mask===1<<layer).length])),view:proxies.filter(p=>p.layers.mask===1<<VIEW_LAYER).length})
 };
}
