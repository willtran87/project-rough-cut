import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {instanceVehicleParts} from '../web/repeated-vehicle-parts.js';
import {skinInfluenceMask,specializeSkinning} from '../web/skin-influences.js';

// Future rigs may use any combination of bone lanes. Preserve every nonzero
// lane, including a tiny weight, and never alter the authored attributes.
for(let mask=1;mask<16;mask++){
 const g=new T.BufferGeometry(),weights=new Float32Array(8);
 for(let lane=0;lane<4;lane++)if(mask&(1<<lane))weights[4+lane]=lane===3?1e-8:.25;
 const original=weights.slice();g.setAttribute('skinWeight',new T.BufferAttribute(weights,4));
 assert.equal(skinInfluenceMask(g),mask);
 const shader={vertexShader:['skinbase_vertex','skinnormal_vertex','skinning_vertex'].map(s=>'#include <'+s+'>').join('\n')};
 specializeSkinning(shader,mask);
 for(let lane=0;lane<4;lane++)assert.equal(shader.vertexShader.includes('getBoneMatrix( skinIndex.'+'xyzw'[lane]+' )'),!!(mask&(1<<lane)));
 assert.deepEqual(g.attributes.skinWeight.array,original);
}
assert.equal(skinInfluenceMask(new T.BufferGeometry()),15);

const root=new T.Group(),material=new T.MeshLambertMaterial(),pivots=[],originals=[];
for(let i=0;i<3;i++){
 const pivot=new T.Group();pivot.position.set((i-1)*1.45,.25,-1.4);root.add(pivot);pivots.push(pivot);
 const mesh=new T.Mesh(new T.BoxGeometry(.9,.15,.8),material);mesh.position.set(.1,.2,-.1);pivot.add(mesh);originals.push(mesh);
}
// A different UV layout must not be mistaken for identical detail.
const distinctive=new T.Mesh(new T.BoxGeometry(.9,.15,.8),material);distinctive.geometry.attributes.uv.setX(0,.125);pivots[0].add(distinctive);
const batch=instanceVehicleParts(root,pivots);assert.equal(batch.savedDraws,2);assert.equal(batch.batches,1);assert.equal(distinctive.parent,pivots[0]);
const instanced=root.children.find(o=>o.isInstancedMesh),v=new T.Vector3(),expected=new T.Vector3(),matrix=new T.Matrix4();
let maximumError=0;
for(let frame=0;frame<90;frame++){
 pivots.forEach((p,i)=>p.rotation.set(frame*.035,i*.1,(i-1)*Math.sin(frame*.1)*.85));batch.update();
 for(let slot=0;slot<3;slot++){
  instanced.getMatrixAt(slot,matrix);const reference=new T.Matrix4().multiplyMatrices(pivots[slot].matrix,originals[slot].matrix);
  for(let vertex=0;vertex<instanced.geometry.attributes.position.count;vertex++){
   v.fromBufferAttribute(instanced.geometry.attributes.position,vertex);expected.copy(v).applyMatrix4(reference);v.applyMatrix4(matrix);
   maximumError=Math.max(maximumError,v.distanceTo(expected));
  }
 }
 const version=instanced.instanceMatrix.version;batch.update();assert.equal(instanced.instanceMatrix.version,version,'Unchanged animation must not re-upload matrices');
}
assert(maximumError<1e-6);batch.dispose();
console.log(JSON.stringify({passed:true,skinMasks:15,animationFrames:90,maximumError,unchangedUploads:0}));
