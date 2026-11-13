import assert from 'node:assert/strict';
import {firstCourseCoverContact as hit, courseCoverProfile, HEDGE_PROFILE, STONE_PROFILE, coverRadiusAtHeight} from '../web/course-cover-profile.js';
import {courseBallFlightPosition as flight, courseBallRollPosition as roll} from '../web/course-ball-motion.js';
const hedge={id:'test-hedge',asset:'hedge-hide',x:0,y:40,radiusX:6,radiusY:6,blocks:true};
const start={x:0,y:0},end={x:0,y:80};
const low=hit(start,end,0,[hedge]);assert(low&&low.t>.4&&low.t<.5);assert.equal(low.material,'foliage');assert.equal(hit(start,end,1,[hedge]),null);
assert.equal(hit({x:80,y:0},{x:80,y:80},0,[hedge]),null);
const far={...hedge,id:'far',y:55};assert.equal(hit(start,end,0,[far,hedge]).obstacle.id,'test-hedge');
assert.equal(hit(start,end,0,[{...hedge,blocks:false}]),null);
const narrow={...hedge,radiusY:.01,y:41.173};assert(hit(start,end,0,[narrow]));
assert.equal(hit(start,end,0,[{...hedge,id:'service-cart',asset:null}]),null);
assert.equal(coverRadiusAtHeight(HEDGE_PROFILE,2.09),0);assert.equal(coverRadiusAtHeight(STONE_PROFILE,1.94),.83);
const plan={flightTarget:end,flightFraction:low.t,impact:low};const f={start,target:low,power:0,shotPlan:plan};const last=flight(f,1);assert(Math.abs(last.height-low.height)<1e-9);assert(Math.abs(last.y-low.y)<1e-9);
const r={start:{x:0,y:32},target:{x:0,y:27},duration:.9,power:0,distance:5,initialSurface:{bounce:.32},impactObstacle:hedge,flightContact:low};assert.deepEqual(roll(r,0),last);assert.deepEqual(roll(r,.9),{x:0,y:27,height:.055});for(let i=0;i<900;i++){const p=roll(r,i/1000);assert(p.height>=.055);assert(p.y<=low.y+1e-9);}
console.log(JSON.stringify({passed:true,low,checks:'Low/high clearance, nearest cover, misses, narrow cover, unsupported solids, shared profiles, contact continuity, rebound and reachable endpoint'}));

let clearanceSamples=0;
for(const dims of [[6,6],[18,6],[22,7]])for(const x of [-15,-5,0,5,15])for(const power of [0,.25,.5,.75,1]){
 const o={id:'hedge',asset:'hedge-hide',x:0,y:40,radiusX:dims[0],radiusY:dims[1],blocks:true},s={x,y:0},e={x:x+8,y:80},c=hit(s,e,power,[o]);if(!c)continue;
 let g={x:c.x,y:c.y};for(let d=.25;Math.hypot(g.x*.72/(dims[0]+.72),(g.y-40)/(dims[1]+.72))<1&&d<=64;d+=.25)g={x:c.x+c.normal.x*d/.72,y:c.y+c.normal.y*d};
 const r={start:g,target:{x:g.x+c.normal.x*5/.72,y:g.y+c.normal.y*5},duration:1+Math.sqrt(2*(c.height-.055)/9.8),power,distance:5,initialSurface:{bounce:.32},flightContact:c,impactObstacle:o};
 for(let i=0;i<=200;i++){const v=roll(r,r.duration*i/200),fraction=coverRadiusAtHeight(courseCoverProfile(o),Math.max(0,v.height-.055));if(fraction>0)assert(Math.hypot(v.x*.72/(dims[0]*fraction),(v.y-40)/(dims[1]*fraction))>=1-1e-6,'Rebound must remain outside the opaque cover');clearanceSamples++;}
}
console.log(JSON.stringify({passed:true,clearanceSamples}));
