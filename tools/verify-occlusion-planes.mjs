import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {createSolidOcclusion} from '../web/solid-occlusion.js';
import {createSolidOcclusion as reference} from './fixtures/solid-occlusion-reference.mjs';
import {frustumBoxMask,intersectsFrustumMask} from '../web/frustum-box.js';
let seed=512;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const box=(x,y,z,sx,sy,sz)=>new T.Box3(new T.Vector3(x-sx,y-sy,z-sz),new T.Vector3(x+sx,y+sy,z+sz));
const old=reference(),next=createSolidOcclusion(),camera=new T.PerspectiveCamera(58,16/9,.055,36);
for(let i=0;i<24;i++){
 const g=new T.CylinderGeometry(.4+random()*2,.4+random()*2,1+random()*3,8),p=g.attributes.position,vertices=[];
 for(let j=0;j<p.count;j++)vertices.push(new T.Vector3().fromBufferAttribute(p,j));
 const m=new T.Matrix4().makeRotationY(random()*6);m.setPosition((random()-.5)*22,1,-random()*65);
 for(const o of [old,next])o.addHull(vertices,m);g.dispose();
}
const boxes=Array.from({length:3000},()=>box((random()-.5)*30,random()*5,-random()*70,random()*1.2,random()*1.2,random()*1.2));
let compared=0,hidden=0,conservative=0;
let frustumChecks=0;
const rows=[];
for(let view=0;view<48;view++){
 camera.position.set((random()-.5)*18,.4+random()*2,-random()*50);camera.rotation.set((random()-.5)*.8,(random()-.5)*6,0);camera.fov=40+random()*45;camera.aspect=view%3===0?844/390:16/9;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 old.update(camera);next.update(camera);
 const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 for(const parent of boxes){
   const mask=frustumBoxMask(frustum,parent);assert.equal(mask!==-1,frustum.intersectsBox(parent));
   for(let child=0;child<3;child++){
     const a=new T.Vector3().lerpVectors(parent.min,parent.max,random()),b=new T.Vector3().lerpVectors(a,parent.max,random()),part=new T.Box3(a,b);
     assert.equal(mask===-1?false:intersectsFrustumMask(frustum,part,mask),frustum.intersectsBox(part));frustumChecks++;
   }
 }
 for(const b of boxes){const a=old.hidden(b),n=next.hidden(b);compared++;hidden+=n;if(a&&!n)conservative++;assert(!(n&&!a),'Optimized proof must never hide more than the eight-corner oracle');}
 if(view<8){for(const [name,o] of [['reference',old],['planes',next],['planes',next],['reference',old]]){const samples=[];for(let n=0;n<12;n++){let checksum=0;const start=performance.now();for(const b of boxes)checksum+=o.hidden(b);if(n>2)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);rows.push({view,name,median:samples[4],max:samples[8]});}}
}
const result={passed:true,compared,hidden,conservative,frustumChecks,rows};fs.mkdirSync('output/software-faces-20261107',{recursive:true});fs.writeFileSync('output/software-faces-20261107/planes-unit.json',JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,compared,hidden,conservative,frustumChecks,medianTotal:rows.reduce((a,r)=>(a[r.name]=(a[r.name]||0)+r.median,a),{})}));
