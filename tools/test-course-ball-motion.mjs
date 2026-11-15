import assert from 'node:assert/strict';
import {courseBallRollPosition as pose} from '../web/course-ball-motion.js';
let samples=0;
for(const bounce of [.035,.07,.1,.16,.32,.44])for(const power of [0,.5,1])for(const duration of [.4,.9,1.65])for(const solid of [false,true]){
 const r={start:{x:4,y:10},target:{x:13,y:22},distance:15,duration,power,initialSurface:{bounce},impactObstacle:solid?{}:null};
 const end=pose(r,duration);assert.deepEqual(end,{x:13,y:22,height:.055});assert.deepEqual(pose(r,0),{x:4,y:10,height:.055});
 let last=-1;for(let i=0;i<=1000;i++){const t=i/1000,p=pose(r,t*duration),travel=1-(1-t)**2.15;assert(Math.abs(p.x-(4+9*travel))<1e-10);assert(Math.abs(p.y-(10+12*travel))<1e-10);assert(p.height>=.055&&p.height<=.055+bounce*(.25+.2*power)+1e-10);assert(p.y>=last);last=p.y;samples++;}
 const window=Math.min(.6,duration*.62),first=window*.65;assert(Math.abs(pose(r,first).height-.055)<1e-10);assert.equal(pose(r,window).height,.055);assert(pose(r,first/2).height>pose(r,first+(window-first)/2).height);assert(Math.abs(pose(r,first-1e-8).height-pose(r,first+1e-8).height)<1e-7);
 r.distance=0;assert.equal(pose(r,first/2).height,.055);
}
console.log(JSON.stringify({passed:true,samples,checks:'Planar path/endpoints, bounded surface lift, diminishing hops, continuous contact and stationary shots'}));
