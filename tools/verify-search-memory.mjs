import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={window:{}};vm.runInNewContext(fs.readFileSync('web/joe-navigation.js','utf8'),context);
const api=context.window.RCJoeNavigation;
for(const hz of [30,60,144]){
 const brain=api.fresh(),point={x:0,y:200};
 api.observe(brain,{x:0,y:200},1);api.observe(brain,{x:2,y:200},1.1);assert(brain.velocity.x>0);
 api.beginSearch(brain,point,'sight',1.2);assert(brain.searchEvidence.velocity.x>0);
 const saved=brain.searchEvidence.velocity.x;brain.velocity.x=99;point.x=10;
 assert.equal(brain.searchEvidence.point.x,0);assert.equal(brain.searchEvidence.velocity.x,saved);
 for(const kind of ['golf_ball','noise_hazard','trail','cover_audit','sound']){
  api.beginSearch(brain,{x:0,y:200},kind,2);assert.equal(brain.searchEvidence.velocity.x,0);
  let joe={x:0,y:200};for(let i=0;i<hz*4;i++){
   const next=api.search(brain,brain.searchEvidence.point,joe,1/hz,()=>true);
   if(!next)break;if(!next.hold)joe={...next.target};
  }
  assert.equal(brain.intent,'search-complete');assert.equal(brain.search.visited.length,4);
  api.beginSearch(brain,{x:0,y:200},kind,3);const next=api.search(brain,brain.searchEvidence.point,{x:0,y:200},1/hz,()=>true);assert(next.hold);assert.equal(brain.search.index,0);
 }
 api.beginSearch(brain,{x:0,y:200},'sound',4);
 const clear=p=>Math.hypot(p.x,p.y-200)>5;
 api.search(brain,brain.searchEvidence.point,{x:0,y:180},1/hz,clear);
 assert(brain.search.points.length>0);assert(brain.search.points.every(clear));
 api.beginSearch(brain,{x:0,y:200},'sound',5);assert.equal(api.search(brain,brain.searchEvidence.point,{x:0,y:180},1/hz,()=>false),null);
 api.observe(brain,{x:10,y:210},6);assert.equal(brain.searchEvidence,null);assert.equal(brain.search,null);
 brain.roam=api.freshPatrol(29);const roam=JSON.stringify(brain.roam);api.forget(brain);
 assert.equal(brain.seen,null);assert.equal(brain.velocity.x,0);assert.equal(brain.velocity.y,0);assert.equal(brain.searchEvidence,null);assert.equal(JSON.stringify(brain.roam),roam);
}
console.log('PASS: three-rate fresh evidence searches, source/velocity snapshots, repeated sources, blocked anchors, reacquisition and forgetting without patrol reseeding');
