// Draw-call batching for the crossing signals. Each crossing has two symbol
// stacks with two faces of three lenses: 96 lenses in all, which were 96
// separate draws. Every lens now lives in one shared vertex buffer drawn by two
// meshes: the lit lenses (unlit material, symbol colour from vertex colours)
// and the dark lenses (the original lit `offSignal` material). A phase change
// only rewrites two small index buffers. Geometry, colours, texture and
// lighting are the same as the separate meshes they replace.
import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

const SLOT_MATERIALS=['redSignal','amberSignal','greenSignal'];
export function createSignalBank(){
 const lenses=[],root=new THREE.Group();root.name='signal-lenses';
 let lit=null,off=null,shared=null,litMaterial=null,key='',changes=0;
 return {
  root,
  // water: crossing index; slot: 0 stop, 1 warning, 2 cross; geometry in world space.
  add(water,slot,geometry){lenses.push({water,slot,geometry});},
  build(scene,materials){
   let vertex=0,index=0;
   for(const lens of lenses){
    const g=lens.geometry,count=g.attributes.position.count,color=materials[SLOT_MATERIALS[lens.slot]].color,values=new Float32Array(count*3);
    for(let i=0;i<count;i++)values.set([color.r,color.g,color.b],i*3);
    g.setAttribute('color',new THREE.BufferAttribute(values,3));
    lens.start=index;lens.count=g.index.count;index+=lens.count;vertex+=count;
   }
   shared=mergeIndexedGeometries(lenses.map(l=>l.geometry));lenses.forEach(l=>{l.geometry.dispose();l.geometry=null;});
   const source=shared.index.array;
   const view=()=>{const g=new THREE.BufferGeometry();for(const name of Object.keys(shared.attributes))g.setAttribute(name,shared.attributes[name]);g.setIndex(new THREE.BufferAttribute(new source.constructor(source.length),1).setUsage(THREE.DynamicDrawUsage));g.boundingSphere=shared.boundingSphere;g.boundingBox=shared.boundingBox;g.setDrawRange(0,0);return g;};
   shared.computeBoundingSphere();shared.computeBoundingBox();
   const reference=materials.redSignal;
   litMaterial=new THREE.MeshBasicMaterial({color:0xffffff,map:reference.map,side:reference.side,vertexColors:true});
   lit=new THREE.Mesh(view(),litMaterial);lit.name='signal-lenses-lit';off=new THREE.Mesh(view(),materials.offSignal);off.name='signal-lenses-dark';
   root.add(lit,off);scene.add(root);
   this.update(lenses.map(()=>0).slice(0,1+Math.max(-1,...lenses.map(l=>l.water))),true);
   return litMaterial;
  },
  // active[water] is the lit slot of that crossing.
  update(active,force=false){
   const next=active.join('');if(next===key&&!force)return;key=next;changes++;
   const source=shared.index.array,a=lit.geometry.index,b=off.geometry.index;let na=0,nb=0;
   for(const lens of lenses){
    const on=active[lens.water]===lens.slot,target=on?a.array:b.array,at=on?na:nb;
    for(let i=0;i<lens.count;i++)target[at+i]=source[lens.start+i];
    if(on)na+=lens.count;else nb+=lens.count;
   }
   a.needsUpdate=b.needsUpdate=true;lit.geometry.setDrawRange(0,na);off.geometry.setDrawRange(0,nb);
  },
  stats:()=>({lenses:lenses.length,draws:2,changes,litIndices:lit?.geometry.drawRange.count||0,darkIndices:off?.geometry.drawRange.count||0}),
  dispose(){root.removeFromParent();shared?.dispose();lit?.geometry.dispose();off?.geometry.dispose();litMaterial?.dispose();}
 };
}
// Bakes a group's static child meshes into one mesh per material. The group
// keeps its own transform and visibility, so it can still be shown or hidden.
export function mergeStaticGroup(group){
 group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),parts=new Map(),original=[];
 group.traverse(mesh=>{if(!mesh.isMesh)return;if(!parts.has(mesh.material))parts.set(mesh.material,[]);parts.get(mesh.material).push(mesh.geometry.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld)));original.push(mesh);});
 for(const mesh of original)mesh.removeFromParent();
 for(const [material,pieces]of parts){const mesh=new THREE.Mesh(mergeIndexedGeometries(pieces),material);group.add(mesh);pieces.forEach(g=>g.dispose());}
 return parts.size;
}
