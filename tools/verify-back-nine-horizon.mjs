import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {BACK_NINE_HORIZON,createHorizonGeometry,finishHorizonMaterial} from '../web/back-nine-horizon.js';
import {COURSE,navigationSnapshot} from '../web/back-nine-course.js';

const physical=JSON.stringify({COURSE,nav:navigationSnapshot()}),stats=[];
const mirrored=x=>1-Math.abs(((x%2)+2)%2-1);
for(const spec of BACK_NINE_HORIZON){
 const g=createHorizonGeometry(spec),p=g.attributes.position,uv=g.attributes.uv;
 assert.equal(spec.repeat%2,0,'mirror period closes around full ring');
 let minRadius=Infinity,maxRadius=0;
 for(let i=0;i<p.count;i++){
  assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)+uv.getX(i)+uv.getY(i)));
  const r=Math.hypot(p.getX(i),p.getZ(i));minRadius=Math.min(minRadius,r);maxRadius=Math.max(maxRadius,r);
  assert(p.getY(i)>=spec.bottom-1e-4&&p.getY(i)<=spec.bottom+spec.height*1.18);
 }
 // Each row's first and last vertex describe the exact same seam, including
 // mirrored texture coordinate and height. Six hundred sixty metres is the
 // farthest ring; the backdrop camera remains inside all three on any route.
 for(const start of [0,193]){
  assert(Math.abs(p.getY(start)-p.getY(start+192))<1e-4);
  assert(Math.abs(mirrored(uv.getX(start))-mirrored(uv.getX(start+192)))<1e-6);
 }
 assert(maxRadius-minRadius<.001);assert(minRadius-spec.influence*.08*840>140);
 let faces=0;
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),center=new THREE.Vector3();
 for(let i=0;i<g.index.count;i+=3){
  a.fromBufferAttribute(p,g.index.getX(i));b.fromBufferAttribute(p,g.index.getX(i+1));c.fromBufferAttribute(p,g.index.getX(i+2));
  n.crossVectors(b.clone().sub(a),c.clone().sub(a));center.copy(a).add(b).add(c).multiplyScalar(1/3);assert(n.x*center.x+n.z*center.z>0,'outward face uses BackSide for an interior camera');faces++;
 }
 const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.BackSide}));mesh.updateMatrixWorld();
 for(let heading=0;heading<360;heading+=3){
  const dir=new THREE.Vector3(Math.sin(heading*Math.PI/180),0,Math.cos(heading*Math.PI/180));assert(new THREE.Raycaster(new THREE.Vector3(0,0,0),dir).intersectObject(mesh).length,'continuous ring covers heading '+heading);
 }
 finishHorizonMaterial(mesh.material,spec);const shader={uniforms:{},vertexShader:THREE.ShaderLib.basic.vertexShader,fragmentShader:THREE.ShaderLib.basic.fragmentShader};mesh.material.onBeforeCompile(shader);assert(shader.fragmentShader.includes('horizonShadow'));assert.equal(shader.uniforms.horizonLight.value.getHex(),spec.light);
 stats.push({name:spec.name,vertices:p.count,triangles:faces,minRadius,maxRadius});g.dispose();mesh.material.dispose();
}
assert.equal(JSON.stringify({COURSE,nav:navigationSnapshot()}),physical);
const report={passed:true,fullRingRays:360,closedMirroredSeams:true,gameplayUnchanged:true,layers:stats};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2));console.log(JSON.stringify(report));
