import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as course from '../web/back-nine-course.js';
import * as current from '../web/back-nine-sim.js';
const out='output/back-nine-terror-2026-11-13';
const source=fs.readFileSync('web/back-nine-course.js','utf8').replace("import bakedNavigation from './assets/baked/course-navigation.js';","const bakedNavigation={signature:0,edges:[]};").replace(/from '([^']+)'/g,(_,p)=>`from '${new URL('../web/'+p,import.meta.url).href}'`);
const fallback=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert(course.navigationStats().baked);assert(!fallback.navigationStats().baked);
for(let i=0;i<68;i++){const a={x:Math.sin(i*7.1)*34,y:40+(i*71)%735},b={x:Math.cos(i*3.8)*34,y:40+(i*71)%735+(i%3-1)*36};assert.deepEqual(course.planMowerRoute(a,b),fallback.planMowerRoute(a,b));}
assert.equal(course.navigationStats().edgeChecks,0);assert(fallback.navigationStats().edgeChecks>0);
const oldSource=fs.readFileSync(out+'/baseline-source/back-nine-sim.js','utf8').replace(/from '([^']+)'/g,(_,p)=>`from '${new URL('../web/'+p,import.meta.url).href}'`),baseline=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
function chase(sim,foot){const r=sim.createRun(1,0,12345);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.hunt.cooldown=r.tension.cooldown=100;
 Object.assign(r.cart,{x:0,y:320,yaw:0,speed:14});Object.assign(r.joe,{x:0,y:280,yaw:0,speed:0});
 if(foot){r.cart.health=0;r.cart.x=30;r.cart.y=30;r.foot={x:0,y:320,yaw:0,viewYaw:0,speed:7,onFoot:true,invulnerable:0};}
 let peak=0;for(let i=0;i<60;i++){sim.updateRun(r,{throttle:1},1/60);peak=Math.max(peak,r.joe.speed);}return {peak,advance:r.joe.y-280,plans:r.joe.plans};}
const paired={cart:{before:chase(baseline,false),after:chase(current,false)},foot:{before:chase(baseline,true),after:chase(current,true)}};
for(const p of Object.values(paired)){assert(p.after.peak>p.before.peak*1.03);assert(p.after.advance>p.before.advance*1.05);assert(p.after.plans>=p.before.plans);}
const result={passed:true,exactRoutes:68,navigation:course.navigationStats(),paired};fs.writeFileSync(out+'/navigation-pursuit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
