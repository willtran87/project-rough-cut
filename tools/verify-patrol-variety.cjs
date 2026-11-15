const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('web/joe-navigation.js','utf8'),context);
const api=context.window.RCJoeNavigation,source=fs.readFileSync('web/game.js','utf8');
const route=vm.runInNewContext(source.match(/const JOE_PATROL_ROUTE = (\[[\s\S]*?\]);/)[1]);
const patterns=new Set(),styles=new Set(),pauses=[],speeds=[];let maxChecks=0;
function run(seed){const b=api.fresh();b.roam=api.freshPatrol(seed);let index=0;const results=[];
 for(let i=0;i<80;i++){let checks=0;const old=index,next=api.patrol(b,route,index,()=>{checks++;return true;});maxChecks=Math.max(checks,maxChecks);assert(checks<=5);assert(next.index!==old);assert(next.index>=0&&next.index<route.length);assert(next.pause>=0&&next.pause<=2.2);assert(next.speed>=11.8&&next.speed<=14.4);assert(b.roam.recent.length<=6);index=next.index;results.push(next);styles.add(next.style);pauses.push(next.pause);speeds.push(next.speed);}
 return JSON.stringify(results);
}
for(let i=1;i<=64;i++){const seed=Math.imul(i,2654435761)>>>0,a=run(seed);assert.equal(run(seed),a,'Identical encounter seeds must reproduce decisions');patterns.add(a);}
assert(patterns.size>60);assert.deepEqual([...styles].sort(),['inspect','listen','mow']);
const brain=api.fresh();brain.roam=api.freshPatrol(901);const blocked=api.patrol(brain,route,0,()=>true,true);assert.equal(blocked.pause,.25);assert.equal(blocked.style,'reroute');
const avoided=api.patrol(brain,route,1,p=>p!==route[2]&&p!==route[0]);assert(![0,2].includes(avoided.index));
console.log(JSON.stringify({passed:true,seeds:patterns.size,decisions:64*80,styles:[...styles],maxClearanceChecks:maxChecks,pauseRange:[Math.min(...pauses),Math.max(...pauses)],speedRange:[Math.min(...speeds),Math.max(...speeds)]}));
