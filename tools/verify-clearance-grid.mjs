import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {mergeIndexedGeometries} from '../web/indexed-geometry.js';
import {inspectGeometrySpheres} from '../web/geometry-clearance-audit.js';
import {inspectGeometrySpheres as baseline} from './fixtures/geometry-clearance-exhaustive.js';
const out='output/under-green/clearance-grid';fs.mkdirSync(out,{recursive:true});
let seed=19;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const parent=new THREE.Group(),parts=[];
for(let i=0;i<240;i++)parts.push(new THREE.BoxGeometry(.2+rand()*2,1+rand()*4,.2+rand()*2).translate((i%20)*2,0,Math.floor(i/20)*2));
const batch=new THREE.Mesh(mergeIndexedGeometries(parts),new THREE.MeshBasicMaterial());batch.name='batch';parent.add(batch);
const mesh=new THREE.Mesh(new THREE.SphereGeometry(2,12,8).toNonIndexed(),batch.material);mesh.name='sphere';parent.add(mesh);mesh.position.set(5,1,5);
const big=new THREE.BufferGeometry();big.setAttribute('position',new THREE.Float32BufferAttribute([-50,-50,-50,50,50,50,-50,50,50],3));const diagonal=new THREE.Mesh(big,batch.material);diagonal.name='diagonal';parent.add(diagonal);
const points=Array.from({length:5000},(_,i)=>({x:rand()*45-3,y:-(rand()*30-3),height:rand()*8-4,radius:i%7===0?.5:.012,kind:'body'}));
for(const radius of [0,.001,.025,.5,5,1000,Infinity,NaN])for(const x of [-.5,0,.5,1])points.push({x,y:0,height:0,radius});
const results=[];
for(const mode of ['identity','transformed','mutated']){
 if(mode==='transformed'){parent.position.set(-8,2,4);parent.rotation.set(.2,.6,-.1);parent.scale.set(1.2,.8,1.4);}
 if(mode==='mutated'){mesh.visible=false;batch.geometry.translate(.2,.1,-.3);parent.rotation.y=-.4;}
 parent.updateMatrixWorld(true);const meshes=[batch,mesh,diagonal];
 let start=performance.now();const expected=baseline(meshes,points),before=performance.now()-start;start=performance.now();const actual=inspectGeometrySpheres(meshes,points),after=performance.now()-start;
 assert.deepEqual(actual,expected);results.push({mode,points:points.length,hits:actual.length,baselineMs:before,gridMs:after});
}
fs.writeFileSync(`${out}/parity.json`,JSON.stringify({passed:true,results,method:'Exact complete hit-array parity with pre-change exhaustive triangle scan, including indexed/nonindexed, transforms, visibility/geometry mutation, grid boundaries and large/nonfinite query radii.'},null,2));console.log(JSON.stringify({passed:true,results}));
