import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {terrainHeight,terrainSlope} from '../web/course-terrain.js';
import {createBackNineContactShadows,contactOpacity} from '../web/back-nine-contact-shadows.js';
const scene=new THREE.Scene();
function vehicle(x,y,r,width,length){const root=new THREE.Group();scene.add(root);root.position.set(x,terrainHeight(x,y),-y);const wheels=[];for(const side of [-1,1])for(const z of [-length*.3,length*.3]){const w=new THREE.Object3D();w.position.set(side*width*.49,r,z);root.add(w);wheels.push(w);}return{root,wheels};}
const cart=vehicle(20,65,.36,1.7,2.8),mower=vehicle(22,70,.57,2.5,3.7),root=new THREE.Group();scene.add(root);
const body=new THREE.Object3D(),feet=[new THREE.Object3D(),new THREE.Object3D()];root.add(body,...feet);body.position.y=1.08;feet.forEach((f,i)=>f.position.set(i?-.112:.112,.08,0));root.position.set(21,terrainHeight(21,65),-65);
const runner={root,contactAnchors:{body,feet}},shadows=createBackNineContactShadows(scene,{cart,mower,runner}),run={foot:{x:21,y:65},cart:{x:20,y:65}};
let maxVertices=0,checkedTriangles=0;
for(let angle=0;angle<Math.PI*2;angle+=.19){
 const slope=terrainSlope(20,65,angle);cart.root.rotation.set(slope.pitch,-angle,slope.roll,'YXZ');mower.root.rotation.y=-angle;root.rotation.y=-angle;shadows.update(run);
 const g=shadows.mesh.geometry,p=g.attributes.position;maxVertices=Math.max(maxVertices,g.drawRange.count);
 for(let i=0;i<g.drawRange.count;i+=3){
  const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3,y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3;
  assert(Math.abs(y-terrainHeight(x,-z)-.064)<1e-5,'triangle interior conforms to terrain');
  const cross=(p.getZ(i+1)-p.getZ(i))*(p.getX(i+2)-p.getX(i))-(p.getX(i+1)-p.getX(i))*(p.getZ(i+2)-p.getZ(i));assert(cross>0,'top-facing shadow');checkedTriangles++;
 }
 const uploads=shadows.stats().uploads;shadows.update(run);assert.equal(shadows.stats().uploads,uploads,'unchanged pose does not upload');
}
assert.equal(shadows.stats().contacts,13);assert(maxVertices<shadows.stats().capacity);
feet[0].position.y+=.6;shadows.update(run);assert(!shadows.stats().patches.some(p=>p.name==='runner-boot-0'),'airborne boot loses contact');
assert.equal(contactOpacity(.5,.56),0);assert(contactOpacity(.01,.56)>contactOpacity(.2,.56));
run.foot=null;shadows.update(run);assert(!shadows.stats().patches.some(p=>p.name.startsWith('runner')));
mower.root.visible=false;shadows.update(run);assert.equal(shadows.stats().contacts,5);
cart.root.position.x=1000;shadows.update(run);assert.equal(shadows.stats().contacts,0,'distant vehicle has no patches');cart.root.position.x=20;
cart.root.visible=false;shadows.update(run);assert.equal(shadows.mesh.visible,false);assert.equal(shadows.mesh.geometry.drawRange.count,0);
shadows.dispose();assert(!scene.getObjectByName('BackNineContactShadows'));
console.log(JSON.stringify({passed:true,maxVertices,checkedTriangles,contacts:13,textureMaps:0}));
