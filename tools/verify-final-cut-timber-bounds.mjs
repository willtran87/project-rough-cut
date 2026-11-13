import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildFinalCutEstateDetail} from '../web/final-cut-estate-detail.js';
import {WALLS,REFUGE_TIMBER_POSTS,lineClear,solid} from '../web/final-cut-course.js';
import {createRun} from '../web/final-cut-sim.js';
import {planChip} from '../web/final-cut-balls.js';
const previous=fs.readFileSync('output/final-cut/visual-timber/before-estate.js','utf8').replace(/from '\.\//g,`from '${pathToFileURL(process.cwd()+'/web/').href}`);
const baseline=(await import('data:text/javascript;base64,'+Buffer.from(previous).toString('base64'))).buildFinalCutEstateDetail;
const unit=new THREE.BoxGeometry(),cylinder=new THREE.CylinderGeometry(1,1,1,12);
function collect(build){const parts=[],geometries=new Set(),dummy=new THREE.Object3D(),v=new THREE.Vector3();
 const mesh=(material,geometry,x,y,z,sx,sy,sz,parent=null,rx=0,ry=0,rz=0)=>{
  geometries.add(geometry);dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();
  const a=geometry.attributes.position,points=[];for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(dummy.matrix);points.push([v.x,v.y,v.z]);}
  parts.push({material,points,key:JSON.stringify([material,points.map(p=>p.map(n=>+n.toFixed(6)))])});
 };
 const stats=build({mesh,unit,cylinder,sign(){},box:(m,x,y,z,w,h,d)=>mesh(m,unit,x,y,z,w,h,d),cyl:(m,x,y,z,r,h)=>mesh(m,cylinder,x,y,z,r,h,r)});
 for(const g of geometries)if(g!==unit&&g!==cylinder)g.dispose();return {parts,stats};
}
const before=collect(baseline),after=collect(buildFinalCutEstateDetail),old=new Set(before.parts.map(p=>p.key)),added=after.parts.filter(p=>!old.has(p.key));
for(const p of added){
 assert(p.points.every(point=>point.every(Number.isFinite)),'Finite transformed geometry');
 assert(p.points.every(([,y])=>y>=2.4)||[...WALLS,...REFUGE_TIMBER_POSTS.map(p=>({...p,w:.20,d:.20}))].some(w=>p.points.every(([x,y,z])=>Math.abs(x-w.x)<=w.w/2+1e-6&&Math.abs(z+w.y)<=w.d/2+1e-6&&y>=0&&y<=w.h+1e-6)),`Changed detail outside head clearance/shared post or wall at ${p.points[0]}`);
}
assert.equal(REFUGE_TIMBER_POSTS.filter(p=>p.base<2).length,2);
for(const post of REFUGE_TIMBER_POSTS){assert(Number.isFinite(post.base)&&post.base>0);assert(WALLS.some(w=>Math.abs(post.x-w.x)+post.w/2<=w.w/2+1e-8&&Math.abs(post.y-w.y)+post.d/2<=w.d/2+1e-8));assert(solid(post));}
const lowPost=REFUGE_TIMBER_POSTS.find(p=>p.refuge==='pavilion'&&p.base<2);
assert(!lineClear({x:lowPost.x,y:80.5},{x:lowPost.x,y:82.1},1.6),'Visible low-wall post blocks sight');
assert(lineClear({x:lowPost.x-.3,y:80.5},{x:lowPost.x-.3,y:82.1},1.6),'Adjacent opening remains visible');
const shotRun=createRun({checkpoint:1});Object.assign(shotRun.player,{x:lowPost.x,y:78,yaw:0,pitch:0,rearAngle:0});
const shot=planChip(shotRun,.15);assert(shot.blocked);assert.equal(shot.obstacle,lowPost.id,'Ball clears low masonry but strikes the visible timber');
unit.dispose();cylinder.dispose();
const report={passed:true,changedPieces:added.length,stats:after.stats,posts:REFUGE_TIMBER_POSTS,method:'Changed production estate vertices remain above2.4m or in a wall/shared timber envelope including its thin shoe/fasteners. Posts share sight/ball bounds, bear on authoritative wall tops, and their footprints remain inside existing solid walls. Adjacent low-wall sight opening stays clear. Complete route/visibility acceptance is separate.'};
fs.writeFileSync('output/final-cut/visual-timber/bounds.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,changedPieces:added.length,chippedSlates:after.stats.chippedSlates,timberPegs:after.stats.timberPegs}));
