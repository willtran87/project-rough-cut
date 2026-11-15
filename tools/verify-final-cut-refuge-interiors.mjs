import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildFinalCutRefugeInteriors} from '../web/final-cut-refuge-interiors.js';
import {REFUGE_FURNITURE,REFUGE_FURNITURE_SOLIDS,REFUGES,solid,move,lineClear} from '../web/final-cut-course.js';
import {createRun} from '../web/final-cut-sim.js';
import {planChip} from '../web/final-cut-balls.js';
const unit=new THREE.BoxGeometry(),cylinder=new THREE.CylinderGeometry(1,1,1,12),dummy=new THREE.Object3D(),point=new THREE.Vector3(),parts=[];
const mesh=(mat,geo,x,y,z,sx,sy,sz,parent,rx,ry,rz)=>{
 dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();const vertices=[];
 for(let i=0;i<geo.attributes.position.count;i++){point.fromBufferAttribute(geo.attributes.position,i).applyMatrix4(dummy.matrix);vertices.push(point.toArray());}
 parts.push({mat,vertices});
};
const stats=buildFinalCutRefugeInteriors({mesh,unit,cylinder}),counts={furniture:0,damp:0,overhead:0};
for(const p of parts){assert(p.vertices.every(v=>v.every(Number.isFinite)));const fit=REFUGE_FURNITURE_SOLIDS.some(f=>p.vertices.every(([x,h,z])=>Math.abs(x-f.x)<=f.w/2+1e-6&&Math.abs(z+f.y)<=f.d/2+1e-6&&h>=Math.max(.065,f.bottom||0)-1e-6&&h<=f.h+1e-6));
 if(fit){counts.furniture++;continue;}
 const damp=p.mat==='refugeDamp'&&p.vertices.every(([x,h,z])=>x>=5.85&&x<=14.15&&z>=-41.65&&z<=-40.8&&(h<=.076||Math.abs(z+41.648)<1e-5));
 if(damp){counts.damp++;continue;}
 assert(p.vertices.every(([x,h,z])=>x>=-19&&x<=-17&&z>=-89.02&&z<=-88.85&&h>2.09),'Detail must fit real furniture, masonry/floor or overhead clearance: '+JSON.stringify(p.vertices[0]));counts.overhead++;
}
const approaches=[];
for(const f of REFUGE_FURNITURE){
 assert(solid(f,0));const s=REFUGES.find(s=>s.id===f.refuge),east=f.kind==='starter'||f.kind==='hose',start=east?{x:f.x+f.w/2+1,y:f.y}:{x:f.x,y:f.y-f.d/2-1};
 // The tool board is shielded by the bench; test that the combined furnished
 // footprint prevents entering either object from the usable room side.
 assert(!solid(start),f.id+' approach must be walkable');const p={...start};move(p,east?-2:0,east?0:2);
 assert(east?p.x>=f.x+f.w/2+.299:p.y<=f.y-f.d/2-.299,f.id+' must block movement');
 assert(!lineClear(east?{x:f.x-1,y:f.y}:{x:f.x,y:f.y-1},east?{x:f.x+1,y:f.y}:{x:f.x,y:f.y+1},Math.min(.6,f.h-.1)),f.id+' must block low sight');
 const r=createRun({checkpoint:1});Object.assign(r.player,{...start,yaw:east?-Math.PI/2:0,pitch:.7});const chip=planChip(r,0);assert(chip.blocked);assert.equal(chip.obstacle,f.kind==='tools'?'pump-service-bench':f.id,'Low ball preview must stop at the actual furnishing');
 assert(f.x-f.w/2>=s.x-s.w/2&&f.x+f.w/2<=s.x+s.w/2&&f.y-f.d/2>=s.y-s.d/2&&f.y+f.d/2<=s.y+s.d/2);
 approaches.push({id:f.id,start,stopped:p});
}
// The bunker has an existing approach rail farther east. Start in the actual
// doorway throat, not beyond/inside that rail.
for(const s of REFUGES){const p={x:s.x+s.w/2+.55,y:s.y};assert(!solid(p));move(p,-1.8,0);assert(p.x<s.x+s.w/2-.6,s.id+' entrance remains clear');}
assert(lineClear({x:11.65,y:40.6},{x:11.65,y:41.45},1.15),'Empty air above bench remains visible');
assert(!lineClear({x:10.43,y:40.6},{x:10.43,y:41.45},1.12),'Spare valve blocks its actual space');
assert(lineClear({x:-19.7,y:88.92},{x:-20.5,y:88.92},1),'Empty air above starter cabinet remains visible');
assert(!lineClear({x:-19.7,y:88.1},{x:-20.5,y:88.1},1),'Cup blocks its actual space');
fs.mkdirSync('output/final-cut/refuge-interiors',{recursive:true});fs.writeFileSync('output/final-cut/refuge-interiors/geometry.json',JSON.stringify({passed:true,stats,counts,approaches},null,2));console.log(JSON.stringify({passed:true,counts,stats}));
