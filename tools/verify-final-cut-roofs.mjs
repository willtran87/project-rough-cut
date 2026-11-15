import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import * as THREE from '../web/vendor/three/three.module.js';
import {REFUGES,solid} from '../web/final-cut-course.js';
import {refugeRoofEnvelopes} from '../web/final-cut-architecture-layout.js';
import {buildFinalCutRoofDetail} from '../web/final-cut-roof-detail.js';
import {planChip} from '../web/final-cut-balls.js';
import {createRun} from '../web/final-cut-sim.js';

// Exercise the actual segment clipper without exposing a diagnostic runtime API.
const source=fs.readFileSync('web/final-cut-balls.js','utf8').replace(/from '\.\//g,`from '${pathToFileURL(process.cwd()+'/web/').href}`).replace('function hitBox(','export function hitBox(');
const {hitBox}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const roofs=refugeRoofEnvelopes(REFUGES),results=[];
for(const roof of roofs.filter(r=>r.roofSlope)){
 const h=roof.roofPeak-.25,a={x:roof.x,y:roof.y-10,z:h},b={x:roof.x,y:roof.y+10,z:h};
 assert(hitBox(a,b,roof)!==null,'The real closed attic blocks a high centre shot');
 assert.equal(hitBox({...a,z:roof.roofPeak+.15},{...b,z:roof.roofPeak+.15},roof),null,'Sky above ridge stays open');
 const edgeX=roof.x+roof.w/2-.15,edgeZ=roof.roofPeak-roof.roofSlope*(roof.w/2-.15)+.18;
 assert.equal(hitBox({...a,x:edgeX,z:edgeZ},{...b,x:edgeX,z:edgeZ},roof),null,'Air above low eave must not become a ridge-height box');
 assert(hitBox({...a,x:edgeX,z:edgeZ-.30},{...b,x:edgeX,z:edgeZ-.30},roof)!==null,'Actual eave stops the shot');
 const left={x:roof.x-10,y:roof.y,z:roof.roofPeak-.3},right={x:roof.x+10,y:roof.y,z:roof.roofPeak-.3};
 const east=hitBox(left,right,roof),west=hitBox(right,left,roof);assert(east!==null&&west!==null);assert(Math.abs(east-west)<1e-10,'Pitched roof clips symmetrically from both sides');
 results.push({id:roof.id,sideEntry:east,peak:roof.roofPeak});
}
const unit=new THREE.BoxGeometry(),cylinder=new THREE.CylinderGeometry(1,1,1,12),dummy=new THREE.Object3D(),point=new THREE.Vector3(),parts=[];
const stats=buildFinalCutRoofDetail({refuges:REFUGES,unit,cylinder,mesh:(mat,g,x,h,z,w,d,t,parent,rx=0,ry=0,rz=0)=>{
 dummy.position.set(x,h,z);dummy.scale.set(w,d,t);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();const vertices=[];
 for(let i=0;i<g.attributes.position.count;i++){point.fromBufferAttribute(g.attributes.position,i).applyMatrix4(dummy.matrix);vertices.push(point.toArray());}
 assert(vertices.every(v=>v.every(Number.isFinite)));
 assert(vertices.every(([,h])=>h>3.0),'Roof identity remains above the sealed 2.75m ceiling');
 assert(REFUGES.some(s=>vertices.every(([x,,z])=>Math.abs(x-s.x)<s.w/2+.7&&Math.abs(z+s.y)<s.d/2+.7)),'Every ornament belongs to its own roof');
 parts.push({mat,vertices:vertices.length});
}});
const run=createRun({checkpoint:1});Object.assign(run.player,{x:-15,y:-5,yaw:0,pitch:-.5});assert(!solid(run.player));
const shot=planChip(run,1);assert(shot.blocked);assert.equal(shot.obstacle,'bunker-roof');assert(shot.target.z>3.1,'Former flat ceiling let this real roof-edge shot pass');
unit.dispose();cylinder.dispose();
fs.mkdirSync('output/final-cut/roof-identity',{recursive:true});fs.writeFileSync('output/final-cut/roof-identity/geometry.json',JSON.stringify({passed:true,results,stats,parts:parts.length,blockedShot:shot.target},null,2));console.log(JSON.stringify({passed:true,results,stats,parts:parts.length}));
