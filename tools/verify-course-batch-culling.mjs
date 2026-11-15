import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCourseBatchCulling} from '../web/course-batch-culling.js';
import {mergeIndexedGeometries} from '../web/indexed-geometry.js';
const pieces=[];
for(let i=0;i<5;i++){
 const g=new THREE.PlaneGeometry(30,24,30,24).rotateX(-Math.PI/2).translate((i%2)*20,0,-i*24);
 const p=g.attributes.position;for(let j=0;j<p.count;j++)p.setY(j,Math.sin(p.getX(j)*.2)*Math.cos(p.getZ(j)*.1));g.computeVertexNormals();pieces.push(g);
}
const geometry=mergeIndexedGeometries(pieces);geometry.computeBoundingBox();const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial()),source=geometry.index.array.slice();
const attrs=Object.fromEntries(Object.entries(geometry.attributes).map(([k,a])=>[k,a.array.slice()]));
const culling=createCourseBatchCulling(),parts=culling.register(mesh,pieces,{maxTrianglesPerPart:64});assert(parts.length>pieces.length);
assert(parts.every(p=>p.count<=192&&p.count%3===0));
const camera=new THREE.PerspectiveCamera(64,16/9,.1,80),frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),v=new THREE.Vector3();let checked=0,removed=0;
function clipped(points){
 for(const plane of frustum.planes){const next=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=plane.distanceToPoint(a),db=plane.distanceToPoint(b);if(da>=0)next.push(a);if((da<0)!==(db<0))next.push(a.clone().lerp(b,da/(da-db)));}points=next;if(!points.length)return false;}return true;
}
for(let f=0;f<100;f++){
 camera.position.set(Math.sin(f*.37)*50,2+f%7,-f*1.2);camera.lookAt(Math.cos(f*.21)*25,0,-f*1.2-20);camera.updateMatrixWorld();frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));culling.update(camera);
 let previous=-1;const retained=new Set();if(mesh.visible)for(const p of parts)if(p.visible){assert(p.offset>previous);previous=p.offset;for(let t=p.offset;t<p.offset+p.count;t+=3)retained.add(t);}
 for(let t=0;t<source.length;t+=3){if(!retained.has(t)){const points=[0,1,2].map(k=>v.clone().fromBufferAttribute(geometry.attributes.position,source[t+k]));assert(!clipped(points),'A triangle intersecting the frustum was removed');removed++;}checked++;}
 if(mesh.visible){const expected=parts.filter(p=>p.visible).flatMap(p=>Array.from(source.slice(p.offset,p.offset+p.count)));assert.deepEqual(Array.from(geometry.index.array.slice(0,geometry.drawRange.count)),expected);}
}
culling.restore();assert.equal(geometry.drawRange.count,source.length);assert.deepEqual(geometry.index.array,source);for(const[k,a]of Object.entries(attrs))assert.deepEqual(geometry.attributes[k].array,a);
assert(removed>checked*.3);console.log(JSON.stringify({passed:true,cameras:100,checkedTriangles:checked,removed,parts:parts.length,attributesUnchanged:true,restoreExact:true}));

// Splitting a large piece must not shorten its authored distance limit.
const plane=new THREE.PlaneGeometry(20,20,20,20).rotateX(-Math.PI/2);plane.computeBoundingBox();
const ranged=new THREE.Mesh(plane.clone(),new THREE.MeshBasicMaterial()),rangeCulling=createCourseBatchCulling();ranged.geometry.computeBoundingBox();
const rangeParts=rangeCulling.register(ranged,[plane],{maxDistance:6,maxTrianglesPerPart:16});
const wide=new THREE.PerspectiveCamera(120,1,.1,100);wide.position.set(0,5,10);wide.lookAt(0,0,0);rangeCulling.update(wide);
assert(rangeParts.some(p=>p.visible&&p.bounds.distanceToPoint(wide.position)>6),'Part distance must inherit the complete authored piece');
console.log('PASS: split runs retain the original piece distance limit');

// WARP opts out of the CPU sample pass even when a ground caller requests it.
// The GPU still receives the original subpixel triangle; bounds culling and
// restoration remain available. Other callers retain the existing default.
const tiny=new THREE.BufferGeometry();tiny.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.0001,0,0,0,.0001,0],3));tiny.setIndex([0,1,2]);tiny.computeBoundingBox();
const smallCamera=new THREE.PerspectiveCamera(60,1,.1,10);smallCamera.position.z=2;smallCamera.lookAt(0,0,0);
for(const enabled of [false,true]){
 const g=tiny.clone(),m=new THREE.Mesh(g,new THREE.MeshBasicMaterial());
 const c=createCourseBatchCulling({sampleCoverage:enabled});c.register(m,[tiny],{rasterCull:true});c.update(smallCamera,32,32);
 assert.equal(g.drawRange.count,enabled?0:3);
 assert.deepEqual(g.attributes.position.array,tiny.attributes.position.array);
 c.restore();assert.equal(g.drawRange.count,3);assert.deepEqual(g.index.array,tiny.index.array);
}
console.log('PASS: optional sample coverage preserves original geometry and default behavior');
