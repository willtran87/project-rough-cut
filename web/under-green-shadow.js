import * as THREE from './vendor/three/three.module.js';
import {createTrimmerJoe} from './under-green-actor.js';
import {bakeShadowAppearance,createShadowMaterial} from './under-green-shadow-material.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
// Bake a full walk cycle once; blend adjacent poses on the GPU in one draw.
export function createDrainShadow(scene,materials){
 const root=new THREE.Group();root.visible=false;scene.add(root);
 const state={ready:false,error:null,visible:false,weapon:'grass-scythe',style:'dark-shadow',animated:true,gait:0,alpha:0,dissolution:'surface-anchored-soft',emissive:false,materialShading:true};
 let geometry,material,mesh;const frames=16,cycle=1.1;
 const ready=(async()=>{
  const source=await createTrimmerJoe(scene,materials),parts=[],nodes=[],shared=new Set(Object.values(materials)),owned=new Set(),maps=new Set();
  const r={time:0,mode:'briefing',joe:{x:0,y:0,yaw:0,phase:'walk',age:0,speed:.65,walk:0}};
  source.update(r,false);source.root.updateMatrixWorld(true);
  source.root.traverse(node=>{
   if(!node.isMesh)return;
   const mats=Array.isArray(node.material)?node.material:[node.material];for(const m of mats)if(!shared.has(m)){owned.add(m);if(m.map)maps.add(m.map);}
   let visible=true;for(let p=node;p;p=p.parent)if(!p.visible)visible=false;
   if(visible&&!mats.some(m=>m.transparent))nodes.push(node);
  });
  const appearance=bakeShadowAppearance(nodes);let bakeColors=true;
  const v=new THREE.Vector3(),inverse=new THREE.Matrix4();
  const pose=()=>{
   inverse.copy(source.root.matrixWorld).invert();
   return nodes.map(node=>{
    const g=new THREE.BufferGeometry(),src=node.geometry,positions=new Float32Array(src.attributes.position.count*3);
    for(let i=0;i<src.attributes.position.count;i++){node.getVertexPosition(i,v).applyMatrix4(node.matrixWorld).applyMatrix4(inverse);positions.set([v.x,v.y,v.z],i*3);}
    g.setAttribute('position',new THREE.BufferAttribute(positions,3));if(bakeColors)for(const [name,attribute]of Object.entries(appearance.get(node)))g.setAttribute(name,attribute);if(src.index)g.setIndex(src.index.clone());g.computeVertexNormals();return g;
   });
  };
  // Warm the planted-foot solver before recording a complete stride.
  const update=walk=>{r.time=walk/.65;r.joe.y=walk;r.joe.walk=walk;source.update(r,false);source.root.updateMatrixWorld(true);};
  for(let walk=0;walk<cycle*2;walk+=cycle/64)update(walk);
  for(let frame=0;frame<frames;frame++){
   update(cycle*2+cycle*frame/frames);const snapshot=pose(),merged=mergeIndexedGeometries(snapshot);snapshot.forEach(g=>g.dispose());parts.push(merged);bakeColors=false;
  }
  geometry=parts[0];geometry.morphAttributes.position=parts.map(g=>g.attributes.position.clone());geometry.morphAttributes.normal=parts.map(g=>g.attributes.normal.clone());parts.slice(1).forEach(g=>g.dispose());
  source.dispose();owned.forEach(m=>m.dispose());maps.forEach(m=>m.dispose());
  material=createShadowMaterial();
  mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;root.add(mesh);state.ready=true;
 })().catch(e=>{state.error=String(e.message||e);});
 return {root,ready,show(anchor,alpha,motion){
  root.visible=state.ready&&!!anchor&&alpha>.0001;state.visible=root.visible;state.alpha=alpha;
  if(!state.ready)return;material.opacity=alpha;
  if(anchor){root.position.set(anchor.x,anchor.y,anchor.z);root.rotation.y=anchor.yaw;}
  const phase=((motion?.walk||0)/cycle%1+1)%1*frames,frame=Math.floor(phase);state.gait=phase/frames;
  mesh.morphTargetInfluences.fill(0);mesh.morphTargetInfluences[frame]=1-(phase-frame);mesh.morphTargetInfluences[(frame+1)%frames]+=phase-frame;
 },stats:()=>({...state,triangles:(geometry?.index.count||0)/3,drawCalls:root.visible?1:0}),dispose(){geometry?.dispose();material?.dispose();root.removeFromParent();}};
}