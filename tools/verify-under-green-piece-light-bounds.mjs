import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {mergeIndexedGeometries} from '../web/indexed-geometry.js';
import {createDrainPracticalLighting} from '../web/under-green-practical-lighting.js';
// A lamp in the empty space between two props must not shade either prop.
// Moving, missing-bound and padded cases must fail open where appropriate.
const box=(x)=>new THREE.BoxGeometry(1,1,1).translate(x,0,0);
function fixture({reach=2,padding=0,pieces=true,moving=false,translate=0}={}){
 const scene=new THREE.Scene(),original=new THREE.MeshPhongMaterial(),left=box(-5),right=box(5),mesh=new THREE.Mesh(mergeIndexedGeometries([left,right]),original);
 mesh.position.x=translate;mesh.userData.drainLightPadding=padding;scene.add(mesh);
 for(const g of [left,right])g.computeBoundingBox();
 const map=new Map(pieces?[[mesh,[left.boundingBox,right.boundingBox]]]:[]);
 let sort=null;const renderer={setOpaqueSort:s=>sort=s};
 const effect=createDrainPracticalLighting({scene,renderer,lamps:[{x:translate,y:0,height:0,reach}],staticMeshes:moving?[]:[mesh],staticLightBounds:map});
 const stats=effect.stats();effect.update(new THREE.PerspectiveCamera(),4,false);
 const changed=mesh.material;let disposed=0;changed.addEventListener('dispose',()=>disposed++);effect.dispose();assert.equal(mesh.material,original);assert.equal(sort,null);if(!moving)assert.equal(disposed,1);
 [mesh.geometry,left,right].forEach(g=>g.dispose());original.dispose();return stats;
}
assert.equal(fixture().maximumStaticSources,0);
assert.equal(fixture({pieces:false}).maximumStaticSources,1);
assert.equal(fixture({reach:4.5}).maximumStaticSources,1); // grazing contact is retained
assert.equal(fixture({reach:4.49}).maximumStaticSources,1); // numerical margin retained
assert.equal(fixture({padding:3}).maximumStaticSources,1);
assert.equal(fixture({translate:100}).maximumStaticSources,0);
const moving=fixture({moving:true});assert.equal(moving.staticBatches,0);assert.equal(moving.dynamicMaterials,1);
console.log(JSON.stringify({passed:true,cases:7,disposal:true,translatedBounds:true,paddedBounds:true}));
