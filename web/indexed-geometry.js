import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';

// Preserve authored triangle order and attribute bits. Mixed batches need an
// identity index for non-indexed inputs, not expansion of every indexed mesh.
export function mergeIndexedGeometries(geometries){
 for(const g of geometries)if(!g.index){
  const count=g.attributes.position.count;
  const indices=count<=65535?new Uint16Array(count):new Uint32Array(count);
  for(let i=0;i<count;i++)indices[i]=i;
  g.setIndex(new THREE.BufferAttribute(indices,1));
 }
 return mergeGeometries(geometries,false);
}
