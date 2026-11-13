import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {ejectionPathClear} from '../web/chase-ejection-clearance.js';
import {COURSE,blocked,distance,navigationStats} from '../web/back-nine-course.js';
import {hullOverlap} from '../web/vehicle-contact.js';
const fixtures='output/back-nine-experience/wreck-routes',out=process.env.CHASE_QA_OUT||fixtures,before=JSON.parse(fs.readFileSync(fixtures+'/garage-crossings-before.json')),navigationBefore=navigationStats().signature;
fs.mkdirSync(out,{recursive:true});
const legal=(p,k)=>!blocked(p,k==='cart'?.85:1.65)&&!COURSE.features.some(f=>hullOverlap(p,k,f,'feature'));
const crossings=[],missing=[],times=[];let checked=0,segments=0;
function denseClear(a,b){const n=Math.ceil(distance(a,b)/.005);for(let i=0;i<=n;i++)if(blocked({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},.32))return false;return true;}
for(let x=-27;x<=-19;x++)for(let y=795;y<=804;y+=.5)for(let h=0;h<16;h++){
 const cart={x,y,yaw:h*Math.PI/8};if(!legal(cart,'cart'))continue;
 for(const side of [Math.PI,Math.PI/2,-Math.PI/2,0]){
  const angle=cart.yaw+side,joe={x:x+Math.sin(angle)*7,y:y+Math.cos(angle)*7,yaw:angle+Math.PI};if(!legal(joe,'mower'))continue;
  const r=createRun(2);Object.assign(r.cart,cart);Object.assign(r.joe,joe);const t=performance.now(),landed=leaveBrokenCart(r);times.push(performance.now()-t);checked++;
  if(!landed){missing.push({cart,joe});continue;}
  const e=r.foot.ejection;for(const a of [cart,{x:e.seatX,y:e.seatY}]){segments++;if(!denseClear(a,r.foot))crossings.push({cart,joe,start:a,landing:r.foot});assert(ejectionPathClear(a,r.foot));}
 }
}
// Prior failing segments must now be rejected; tangent and unobstructed
// segments remain legal. No course geometry/navigation change is involved.
for(const c of before.crossings)assert(!ejectionPathClear(c.cart,c.landing));
const post=COURSE.obstacles.find(o=>o.kind==='garage-bollard');
assert(ejectionPathClear({x:post.x+.5,y:post.y-1},{x:post.x+.5,y:post.y+1}));
assert(!ejectionPathClear({x:post.x+.499,y:post.y-1},{x:post.x+.499,y:post.y+1}));
assert(ejectionPathClear({x:0,y:40},{x:0,y:40}));
assert(!ejectionPathClear({x:41,y:40},{x:41,y:40}));
assert.equal(navigationStats().signature,navigationBefore,'Ejection must not mutate the current baked navigation');assert(navigationStats().baked);
times.sort((a,b)=>a-b);const report={passed:!crossings.length&&!missing.length,checked,segments,previousCrossings:before.crossings.length,crossings,missing,landingCpuMs:{median:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:times.at(-1)},navigation:navigationStats()};
fs.writeFileSync(out+'/garage-crossings-after.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));assert.equal(crossings.length,0);assert.equal(missing.length,0);assert.equal(checked,before.checked);
