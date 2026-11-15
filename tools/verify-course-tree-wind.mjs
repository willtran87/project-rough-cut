import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {bindTreeWind,TREE_WIND_PADDING} from '../web/course-tree-wind.js';
import {createCourseWind} from '../web/course-wind.js';
let roots=0,samples=0,maxBend=0;
for(const height of [2,5,9,14])for(const x of [-25,0,32]){
 const root={x,y:1.7,z:-37},g=new T.BufferGeometry(),positions=[];
 for(let i=0;i<=80;i++)positions.push(x,root.y+i/80*height,root.z);
 g.setAttribute('position',new T.Float32BufferAttribute(positions,3));bindTreeWind(g,root,height);
 const a=g.attributes.courseTreeShape,q=g.attributes.courseTreePhase;
 for(let i=0;i<a.count;i++)for(let t=0;t<30;t+=.17)for(const drive of [-1,0,1]){
  const wave=drive*(.68+.22*(Math.sin(t*.82)*a.getZ(i)-Math.cos(t*.82)*a.getW(i))+.10*(Math.sin(t*1.67)*q.getX(i)-Math.cos(t*1.67)*q.getY(i))),bend=wave*a.getX(i),side=.18*Math.sin(t*.63),distance=Math.hypot(bend,bend*side);
  assert(distance<TREE_WIND_PADDING);maxBend=Math.max(maxBend,distance);samples++;
  if(g.attributes.position.getY(i)<=root.y+.6){assert(bend===0);roots++;}
  if(drive===0)assert(bend===0);
 }
 // Coincident points on separate branch/needle parts share the exact same
 // field; independent geometry construction cannot separate their contact.
 const other=g.clone();bindTreeWind(other,root,height);assert.deepEqual(other.attributes.courseTreeShape.array,a.array);assert.deepEqual(other.attributes.courseTreePhase.array,q.array);
 g.dispose();other.dispose();
}
const wind=createCourseWind({}),frame={time:0,fx:{wind:{strength:1,direction:1}}};wind.update(frame);for(let i=1;i<=40;i++){frame.time=i*.05;wind.update(frame);}
const shader={uniforms:{},vertexShader:'#include <beginnormal_vertex>\n#include <begin_vertex>'};wind.treeShader(shader);assert(shader.vertexShader.includes('objectNormal.y-='));assert(shader.vertexShader.includes('transformed.x+='));assert.equal(shader.uniforms.courseTreeDrive.value,wind.stats().drive);
const snapshot=JSON.stringify(shader.uniforms);frame.paused=true;frame.time+=2;wind.update(frame);assert.equal(JSON.stringify(shader.uniforms),snapshot);
frame.paused=false;frame.reducedMotion=true;wind.update(frame);assert.equal(shader.uniforms.courseTreeDrive.value,0);
console.log(JSON.stringify({passed:true,samples,rootSamples:roots,maxBend,padding:TREE_WIND_PADDING}));
