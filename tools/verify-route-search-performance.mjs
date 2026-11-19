import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as current from '../web/back-nine-course.js';
import {createStableSearchQueue} from '../web/stable-search-queue.js';
// The original pre-optimisation snapshot (output/chase-route-performance/baseline)
// predates later course changes, so it can no longer be an exact reference.
// What must keep holding: stable queue ordering, and the baked search returning
// exactly what a live edge search over the same course returns, including
// avoid-point searches, with no live edge checks at runtime.
const out='output/chase-route-performance';
const fallbackSource=fs.readFileSync('web/back-nine-course.js','utf8').replace("import bakedNavigation from './assets/baked/course-navigation.js';","const bakedNavigation={signature:0,edges:[]};").replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL('../web/'+p,import.meta.url).href}'`);
const live=await import('data:text/javascript;base64,'+Buffer.from(fallbackSource).toString('base64'));
assert(current.navigationStats().baked);assert(!live.navigationStats().baked);
// Decrease-key keeps old insertion precedence, including equal scores.
const queue=createStableSearchQueue(10);queue.set(1,20);queue.set(2,10);queue.set(3,10);queue.set(1,10);assert.deepEqual([queue.pop(),queue.pop(),queue.pop()],[1,2,3]);queue.clear();queue.set(3,2);queue.set(2,1);assert.deepEqual([queue.pop(),queue.pop(),queue.pop()],[2,3,-1]);
const pairs=[[{x:4,y:770},{x:4,y:820}],[{x:29,y:187},{x:0,y:280}],[{x:33,y:480},{x:-28,y:480}],[{x:-35,y:663},{x:24,y:705}]];
for(let i=0;i<512;i++)pairs.push([{x:Math.sin(i*7.1)*39,y:5+(i*71)%815},{x:Math.cos(i*3.8)*39,y:5+(i*97)%815}]);
let expanded=0;const hard=[];
for(const [a,b]of pairs){for(const avoid of [null,{x:(a.x+b.x)/2,y:(a.y+b.y)/2}]){const expected=live.planMowerRoute(a,b,avoid),actual=current.planMowerRoute(a,b,avoid);assert.deepEqual(actual,expected,JSON.stringify({a,b,avoid}));expanded+=actual.expanded;if(actual.expanded>600&&hard.length<16)hard.push([a,b,avoid,actual.expanded]);}}
assert.equal(current.navigationStats().edgeChecks,0);assert(live.navigationStats().edgeChecks>0);
const samples=[[],[]];for(let repeat=0;repeat<20;repeat++)for(const pair of hard)for(const i of repeat%2?[1,0]:[0,1]){const start=performance.now();[live,current][i].planMowerRoute(...pair.slice(0,3));samples[i].push(performance.now()-start);}
const stats=a=>{a.sort((x,y)=>x-y);return {samples:a.length,median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
const report={passed:true,exactRoutes:pairs.length*2,expanded,navigation:current.navigationStats(),hardCases:hard.length,liveEdges:stats(samples[0]),baked:stats(samples[1])};fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/search.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
