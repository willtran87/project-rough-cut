import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {mergeDrainWallBoxes} from '../web/under-green-wall-occluders.js';
import {floorLayout} from '../web/under-green-course.js';
import {keeperWallPieces} from '../web/under-green-keeper-layout.js';
const box=(a,b)=>new T.Box3(new T.Vector3(...a),new T.Vector3(...b));
const adjoining=[box([0,0,0],[1,4,.22]),box([1,0,0],[2,4,.22])];
assert.equal(mergeDrainWallBoxes(adjoining).length,1);
assert.equal(mergeDrainWallBoxes(adjoining,{maxSpan:1.5}).length,2);
assert.equal(mergeDrainWallBoxes([adjoining[0],box([1.00001,0,0],[2,4,.22])]).length,2,'Even a small physical gap remains open');
assert.equal(mergeDrainWallBoxes([adjoining[0],box([1,0,0],[2,3.9,.22])]).length,2,'Unequal cross-sections cannot merge');
assert.equal(mergeDrainWallBoxes([box([0,0,0],[4,1,.22]),box([0,3,0],[4,4,.22])]).length,2,'A recess remains open');
assert.equal(mergeDrainWallBoxes([box([0,0,0],[1,4,.22]),box([0,0,.22],[.22,4,2])]).length,2,'An L shape cannot become a filled rectangle');
const source=[];
for(const wall of floorLayout().walls)for(const p of keeperWallPieces(wall,wall.covered?4.2:1.8))source.push(box([p.x-p.w/2,p.base,-p.y-p.d/2],[p.x+p.w/2,p.base+p.height,-p.y+p.d/2]));
const original=source.map(b=>[b.min.toArray(),b.max.toArray()]),point=new T.Vector3(),results=[];
for(const maxSpan of [Infinity,8]){
 const merged=mergeDrainWallBoxes(source,{maxSpan});let cells=0;
 for(const b of source)assert(merged.some(m=>m.containsBox(b)),'Source wall lost');
 for(const m of merged){
  assert(!m.clone().expandByScalar(-.005).isEmpty(),'Inset occluder became empty');
  const support=source.filter(b=>b.intersectsBox(m)),axes=['x','y','z'].map(k=>[...new Set([m.min[k],m.max[k],...support.flatMap(b=>[Math.max(m.min[k],b.min[k]),Math.min(m.max[k],b.max[k])])])].sort((a,b)=>a-b));
  // Source boundaries partition every output volume into cells of constant
  // membership. Each cell must lie inside an actual authored wall box.
  for(let x=0;x<axes[0].length-1;x++)for(let y=0;y<axes[1].length-1;y++)for(let z=0;z<axes[2].length-1;z++){
   point.set((axes[0][x]+axes[0][x+1])/2,(axes[1][y]+axes[1][y+1])/2,(axes[2][z]+axes[2][z+1])/2);assert(support.some(b=>b.containsPoint(point)),'Merged occluder filled an unbuilt volume');cells++;
  }
 }
 results.push({maxSpan:Number.isFinite(maxSpan)?maxSpan:'unbounded',walls:merged.length,cells});
}
assert.deepEqual(source.map(b=>[b.min.toArray(),b.max.toArray()]),original,'Authored source boxes were mutated');
assert(results.every(r=>r.walls<source.length));console.log(JSON.stringify({passed:true,sourceWalls:source.length,results,manualChecks:6}));
