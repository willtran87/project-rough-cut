import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createRunnerGearCraft} from '../web/runner-gear-craft.js';
import {runnerSoleSupport} from '../web/runner-sole.js';
const craft=createRunnerGearCraft(T),round=new T.IcosahedronGeometry(1,2),fine=new T.IcosahedronGeometry(1,1),box=new T.BoxGeometry(1,1,1),boot=craft.boot(round,box),gloves=[craft.glove(round,fine,box,-1),craft.glove(round,fine,box,1)];
let vertices=0,triangles=0;
for(const shapes of [boot,...gloves])for(const [type,g]of shapes){
 const p=g.attributes.position,uv=g.attributes.uv;
 for(const a of Object.values(g.attributes))for(const v of a.array)assert(Number.isFinite(v));vertices+=p.count;triangles+=g.index?g.index.count/3:p.count/3;
 if(type==='gear'){
  const slot=g.userData.gearSlot,c=slot%2,r=slot<2?1:0;
  for(let i=0;i<uv.count;i++){assert(uv.getX(i)>=c*.5+.0149&&uv.getX(i)<=c*.5+.4851);assert(uv.getY(i)>=r*.5+.0149&&uv.getY(i)<=r*.5+.4851);}
 }
}
const material=new T.MeshBasicMaterial(),upper=new T.Mesh(boot[0][1],material),sole=new T.Mesh(boot[1][1],material),ray=new T.Raycaster(new T.Vector3(0,-.365,-1),new T.Vector3(0,0,1));upper.updateMatrixWorld();sole.updateMatrixWorld();
let hit=ray.intersectObject(upper)[0];assert(hit&&hit.point.z<-.1&&hit.face.normal.z<0,'outward toe surface');
ray.set(new T.Vector3(0,-1,-.055),new T.Vector3(0,1,0));hit=ray.intersectObject(sole)[0];assert(hit&&Math.abs(hit.point.y+.445)<1e-6&&hit.face.normal.y<0,'outward lower sole');
let supportGap=0,supportSamples=0;const p=boot[1][1].attributes.position;
for(let pitch=-.8;pitch<=.8;pitch+=.04)for(let roll=-.5;roll<=.5;roll+=.04){
 const x=Math.cos(pitch)*Math.sin(roll),y=Math.cos(pitch)*Math.cos(roll),z=-Math.sin(pitch),bound=runnerSoleSupport(x,y,z);let low=Infinity;
 for(let i=0;i<p.count;i++)low=Math.min(low,x*p.getX(i)+y*(p.getY(i)+.37)+z*p.getZ(i));
 assert(low>=bound-1e-6,'sole does not pierce support');supportGap=Math.max(supportGap,low-bound);supportSamples++;
}
assert(supportGap<.008,'support remains close to actual sole');
const result={passed:true,vertices,triangles,supportSamples,supportGap,atlasPadding:true,outwardFaces:true};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));console.log(JSON.stringify(result));craft.dispose();
