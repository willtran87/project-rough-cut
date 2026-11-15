import * as THREE from './vendor/three/three.module.js';
import { createTrees } from './pixel-trees.js';

// Run the original deterministic geometry builder without textures or DOM.
// Transfer its typed arrays; the main thread retains materials, lighting,
// collision anchors and the existing fine-grained visibility batches.
let root;
let baked;
async function bakedTree(job){
  baked??=(async()=>{
    try{
      const [response,source]=await Promise.all([fetch('./assets/baked/trees.json'),fetch('./pixel-trees.js').then(r=>r.arrayBuffer())]);
      if(!response.ok)return null;const manifest=await response.json();
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',source))].map(n=>n.toString(16).padStart(2,'0')).join('');
      if(hash!==manifest.sourceHash)return null;
      const compressed=await fetch('./assets/baked/trees.bin.gz');if(!compressed.ok||!compressed.body)return null;
      const buffer=await new Response(compressed.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      if(buffer.byteLength!==manifest.bytes)return null;return {manifest,buffer};
    }catch{return null;}
  })();
  const archive=await baked;if(!archive)return null;
  const tree=archive.manifest.trees[JSON.stringify([job.x,job.z,job.height,job.radius])];if(!tree)return null;
  const types={Float32Array,Uint16Array,Uint32Array};
  const array=d=>new types[d.type](archive.buffer,d.offset,d.length).slice();
  return {form:tree.form,baked:true,parts:tree.parts.map(p=>({...p,attributes:Object.fromEntries(Object.entries(p.attributes).map(([k,a])=>[k,{array:array(a),itemSize:a.itemSize}])),index:p.index?array(p.index):undefined}))};
}
const wood=new THREE.MeshBasicMaterial();
const builder=createTrees({geometryOnly:true,
  root:()=>{root=new THREE.Group();return root;},
  mesh:(parent,geometry)=>{const m=new THREE.Mesh(geometry,wood);parent.add(m);return m;}
});
let queue=Promise.resolve(),paused=false,sliceStart=performance.now();
self.onmessage=({data:job})=>{
  if('paused' in job){paused=job.paused;return;}
  queue=queue.then(async()=>{
    try{
      while(paused)await new Promise(resolve=>setTimeout(resolve,50));
      const cached=await bakedTree(job);
      if(cached){const transfer=[];for(const p of cached.parts){for(const a of Object.values(p.attributes))transfer.push(a.array.buffer);if(p.index)transfer.push(p.index.buffer);}self.postMessage({id:job.id,...cached},transfer);if(performance.now()-sliceStart>=4){await new Promise(resolve=>setTimeout(resolve,4));sliceStart=performance.now();}return;}
      builder.tree(job.x,job.z,job.height,job.radius);
      await builder.prepareTrees();
      const parts=[],transfer=[];
      root.traverse(o=>{
        if(!o.isMesh)return;
        const attributes={};
        for(const [name,a]of Object.entries(o.geometry.attributes)){
          attributes[name]={array:a.array,itemSize:a.itemSize};transfer.push(a.array.buffer);
        }
        const index=o.geometry.index?.array;if(index)transfer.push(index.buffer);
        parts.push({attributes,index,needle:o.material.userData.needleIndex,position:o.position.toArray(),quaternion:o.quaternion.toArray()});
      });
      self.postMessage({id:job.id,form:root.userData.treeForm,parts},transfer);
      root=null;
    }catch(error){self.postMessage({id:job.id,error:String(error)});}
  });
};
