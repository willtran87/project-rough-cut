import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateHunt} from '../web/back-nine-hunt.js';
import {tryCommitment,commitmentSpeed,COMMIT_SPEED} from '../web/chase-commitments.js';
import {COURSE,distance,lineClear} from '../web/back-nine-course.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
const checks=[];function test(name,f){f();checks.push(name)}
function staged(){const r=createRun();r.mode='driving';r.grace=0;r.panic.serial=1;r.tension.phase='stalk';Object.assign(r.cart,{x:28,y:40,speed:8});Object.assign(r.joe,{x:28,y:20,yaw:0,speed:12});return r;}
test('Warning lasts 1.8 seconds and captured lanes ignore hidden steering',()=>{for(const kind of ['pass','lane']){const r=staged();if(kind==='pass'){r.hunt.commit.count=1;r.hunt.commit.kind='lane';}else{r.cart.x=0;r.joe.x=0;}assert(tryCommitment(r,true));assert.equal(r.hunt.commit.kind,kind);const points=JSON.stringify(r.hunt.waypoints);r.cart.x-=10;for(let i=0;i<107;i++)updateHunt(r,1/60,false);assert.equal(r.hunt.phase,'commit_warning');assert(commitmentSpeed(r,18)<=8.5);updateHunt(r,1/30,false);assert.equal(r.hunt.phase,kind==='pass'?'close_pass':'lane_commit');assert.equal(JSON.stringify(r.hunt.waypoints),points);assert(commitmentSpeed(r,30)<=COMMIT_SPEED);r.cart.invulnerable=1;updateHunt(r,1/60,true);assert.equal(r.hunt.phase,'follow');}});
let actualPass;
test('Close pass physically overtakes once, stays separated, and recovers toward a fixed point',()=>{const r=staged();r.cart.hits=1;r.hunt.commit.count=1;r.hunt.commit.kind='lane';assert(tryCommitment(r,true));let maxStep=0,recovered=false,target;for(let i=0;i<540&&r.mode==='driving';i++){const old={...r.joe};updateRun(r,{throttle:1},1/60);maxStep=Math.max(maxStep,distance(old,r.joe));assert(!vehicleOverlap(r.cart,r.joe));if(r.hunt.phase==='commit_recover'){recovered=true;const now=JSON.stringify(r.hunt.waypoints);if(target)assert.equal(now,target);target=now;}}assert.equal(r.hunt.commit.passes,1);assert(recovered);assert(maxStep<=COMMIT_SPEED/60+.003);actualPass={passes:r.hunt.commit.passes,closest:r.hunt.commit.closest,maxStep,hits:r.cart.hits};});
const gates=[];
// Shortcut gates are latched (chase-shortcuts.js): the player can no longer
// smash or shove through timber. Stop, hold Use to unlatch, let it swing, drive on.
test('All three gates stop the cart, unlatch once only with Use, then admit it, and block direct mower routing',()=>{for(const [index,s]of COURSE.shortcuts.entries()){assert(lineClear(s.from,s.to,.85),s.id+' must be clear end to end');const hurdle=COURSE.hurdles.findIndex(h=>h.shortcut===index);for(const slow of [false,true]){const r=createRun();r.mode='driving';r.grace=999;const f={x:Math.sin(s.yaw),y:Math.cos(s.yaw)},along=()=>(r.cart.x-s.x)*f.x+(r.cart.y-s.y)*f.y;Object.assign(r.cart,{x:s.x-f.x*5,y:s.y-f.y*5,yaw:s.yaw,speed:slow?0:9});Object.assign(r.joe,{x:30,y:3});
 const unlatched=()=>r.events.filter(e=>e.type==='gate-unlatched'&&e.index===index);
 for(let i=0;i<120;i++)updateRun(r,{throttle:1,use:false},1/60);assert(along()<0,s.id+' latched timber must stop the cart');assert.equal(unlatched().length,0);assert(r.courseFX.breaks[hurdle].age<0,'The player cannot smash timber');
 for(let i=0;i<30;i++)updateRun(r,{},1/60);for(let i=0;i<90;i++)updateRun(r,{brake:true,use:false},1/60);assert.equal(unlatched().length,0,'Brake alone no longer interacts (4287b70)');
 for(let i=0;i<75;i++)updateRun(r,{use:true},1/60);assert.equal(unlatched().length,1,JSON.stringify({s,slow,cart:r.cart}));
 for(let i=0;i<480;i++)updateRun(r,{throttle:1,use:false},1/60);assert.equal(unlatched().length,1,'A gate unlatches once');assert(along()>1.7,JSON.stringify({s,slow,cart:r.cart}));assert(r.courseFX.breaks[hurdle].age<0);
 assert.equal(createRun().courseFX.breaks.filter(b=>b.age>=0||b.unlatched).length,0);gates.push({name:s.id,slow,unlatched:unlatched().length});}
 const a={x:s.x-Math.sin(s.yaw)*5,y:s.y-Math.cos(s.yaw)*5},b={x:s.x+Math.sin(s.yaw)*5,y:s.y+Math.cos(s.yaw)*5};assert(lineClear(a,b,.85));assert(!lineClear(a,b,2.46));}});
test('Paused commitments and gates stay frozen',()=>{const r=staged();tryCommitment(r,true);r.mode='paused';const before=JSON.stringify(r);updateRun(r,{throttle:1},1/30);assert.equal(JSON.stringify(r),before);});
fs.mkdirSync('output/chase-decisions',{recursive:true});fs.writeFileSync('output/chase-decisions/simulation.json',JSON.stringify({passed:true,checks,actualPass,gates},null,2));console.log(JSON.stringify({passed:true,checks,actualPass,gates}));

