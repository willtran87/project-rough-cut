import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={window:{}};vm.runInNewContext(fs.readFileSync('web/joe-navigation.js','utf8'),context);
const api=context.window.RCJoeNavigation;
const joe={x:0,y:0,routePath:[{x:10,y:10},{x:20,y:10}],routeTarget:{x:20,y:10}},snapshot=JSON.stringify(joe);
assert.equal(api.refreshRouteGoal(joe,{x:20,y:20},()=>false),false);
assert.equal(JSON.stringify(joe),snapshot,'Blocked destination cannot overwrite a safe route');
const target={x:20,y:13};let checked;
assert.equal(api.refreshRouteGoal(joe,target,(anchor,goal)=>{checked={anchor:{...anchor},goal:{...goal}};return true;}),true);
assert.deepEqual(checked,{anchor:{x:10,y:10},goal:target});
assert.equal(JSON.stringify(joe.routePath[0]),JSON.stringify({x:10,y:10}));
target.y=99;assert.equal(joe.routeTarget.y,13);assert.equal(joe.routePath.at(-1).y,13,'Live target cannot mutate committed route');
assert.equal(api.refreshRouteGoal({...joe,routePath:[]},target,()=>true),false);
for(const speed of [3,12,30]){
 const brain=api.fresh();api.observe(brain,{x:0,y:200},1);api.observe(brain,{x:speed*.1/.72,y:200},1.1);
 const predicted=api.pursuit(brain,{x:-60,y:200},true,()=>true),seen={x:brain.seen.x,y:brain.seen.y};
 assert(Math.hypot((predicted.x-seen.x)*.72,predicted.y-seen.y)<=8+1e-8);
 assert.equal(JSON.stringify(api.pursuit(brain,{x:-60,y:200},false,()=>true)),JSON.stringify(seen));
 assert.equal(JSON.stringify(api.pursuit(brain,{x:-60,y:200},true,()=>false)),JSON.stringify(seen));
}
console.log('PASS: route updates retain obstacle waypoints, reject blocked goals and snapshot targets; prediction stays bounded and never follows hidden movement');
