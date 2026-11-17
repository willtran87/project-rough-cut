import fs from 'node:fs';import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE} from '../web/back-nine-course.js';
import {windbreakCoreGeometry} from '../web/back-nine-shrub-craft.js';
import {finishWindbreakSurface} from '../web/back-nine-windbreak-growth.js';
const results=[];
for(const s of COURSE.sightbreaks){
 const g=windbreakCoreGeometry(THREE,s),p=g.attributes.position,n=g.attributes.normal;
 assert(p.array.every(Number.isFinite));assert(n.array.every(Number.isFinite));
 for(let i=0;i<p.count;i++){assert(Math.abs(p.getX(i))<s.rx);assert(Math.abs(p.getZ(i))<s.ry);assert(p.getY(i)>.1&&p.getY(i)<3.5);assert(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);}
 const flex=g.attributes.windbreakFlex;assert(flex.array.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
 for(let i=0;i<p.count;i++){const bend=flex.getX(i)**2;assert(Math.abs(p.getX(i))+bend*.012<s.rx);assert(Math.abs(p.getZ(i))+bend*.009<s.ry);if(i<g.userData.windbreak.coreVertices)assert.equal(bend,0);}
 // Raycast only the closed opaque body, not its terminal leaves. This proves
 // that artwork changes haven't opened visually transparent hiding places.
 const core=g.clone();core.setIndex(Array.from(g.index.array.slice(0,g.userData.windbreak.coreIndices)));
 const mesh=new THREE.Mesh(core,new THREE.MeshBasicMaterial()),ray=new THREE.Raycaster();let samples=0;
 for(const side of [-1,1])for(let z=-s.ry+.3;z<=s.ry-.3;z+=.5)for(const y of [.4,1,1.6,2.35]){
  ray.set(new THREE.Vector3(side*4,y,z),new THREE.Vector3(-side,0,0));const hit=ray.intersectObject(mesh);assert(hit.length>0,`${s.id} hole at ${side},${y},${z}`);assert(Math.abs(hit[0].point.x)<s.rx);samples++;
 }
 results.push({id:s.id,vertices:p.count,triangles:g.index.count/3,...g.userData.windbreak,opaqueCoverSamples:samples});g.dispose();core.dispose();mesh.material.dispose();
}
const material=new THREE.MeshLambertMaterial(),art=finishWindbreakSurface(material);
art.update({time:20},false);assert.equal(art.stats().wind,1);art.update({time:20},true);assert.equal(art.stats().wind,1);assert.equal(art.stats().time,20);material.dispose();
const out='output/back-nine-visual-upgrade/windbreak-growth';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/geometry.json',JSON.stringify({passed:true,results},null,2));console.log(results);
