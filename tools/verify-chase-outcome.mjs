import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {captureFailure,readEscape,restoreEscape,escapeCopy} from '../web/chase-outcome.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {beginRunover} from '../web/chase-runover.js';
import {COURSE} from '../web/back-nine-course.js';
const results=[];
const tick=(r,n,input={brake:true})=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
for(const [kind,health,hits,logs] of [['running-cart',100,0,0],['running-cart',70,3,1],['battered-cart',20,7,3],['on-foot',0,8,2]]){
 const r=createRun(2,logs);r.mode='driving';r.grace=0;Object.assign(r.cart,{x:-23,y:807,health:health||1,hits});Object.assign(r.joe,{x:-23,y:790,speed:12});
 if(kind==='on-foot'){Object.assign(r.cart,{x:-24,y:749});assert(leaveBrokenCart(r));Object.assign(r.foot,{...COURSE.finish,ejection:null,invulnerable:0});r.grace=0;}
 tick(r,60);assert.equal(r.mode,'driving');assert.equal(r.escape,null,'No success until the shutter is secure');
 tick(r,30);assert.equal(r.mode,'sealing');assert.equal(r.escape,null);const paused=JSON.stringify(r.finale);r.mode='paused';tick(r,120);assert.equal(JSON.stringify(r.finale),paused);r.mode='sealing';
 tick(r,330);assert.equal(r.mode,'complete');assert.equal(r.escape.kind,kind);assert.equal(r.escape.health,health);assert.equal(r.escape.hits,hits);assert.equal(r.escape.collected,logs);assert.equal(r.events.filter(e=>e.type==='complete').length,1);
 const record=JSON.parse(JSON.stringify(r.escape)),copy=escapeCopy(record),restored=createRun();assert(restoreEscape(restored,record));assert.deepEqual(restored.escape,record);assert.equal(!!restored.foot,kind==='on-foot');assert.equal(restored.cart.health,health);assert.equal(restored.story.collected,logs);assert.equal(restored.finale.tail,0,'Reload does not replay final audio');assert.deepEqual(escapeCopy(restored.escape),copy);
 const end=JSON.stringify(r.escape);tick(r,180);assert.equal(JSON.stringify(r.escape),end);assert.equal(r.events.filter(e=>e.type==='complete').length,1);results.push({kind,copy,record});
 assert.equal(readEscape({...record,health:NaN}),null);assert.equal(readEscape({...record,collected:8}),null);assert.equal(readEscape({...record,cart:{x:Infinity,y:807,yaw:0}}),null);assert.equal(readEscape({...record,kind:'invented'}),null);
 const escapedActor=record.player?'player':'cart';assert.equal(readEscape({...record,[escapedActor]:{x:0,y:10,yaw:0}}),null,'Record cannot invent an arrival outside the garage');
}
const legacy=createRun();assert.equal(restoreEscape(legacy,null),false);assert.equal(legacy.mode,'complete');assert.equal(legacy.checkpoint,2);assert.equal(legacy.escape,null);assert.match(escapeCopy(null).detail,/not stored/);
const failureCases=[];
for(const [kind,xy,surface,checkpoint,charge] of [['wreck',[0,37],'path',0,false],['bunker',[20,238],'sand',0,false],['charge',[0,55],'path',0,true],['garage',[-23,785],'path',2,false],['unpowered-garage',[-23,785],'path',1,false],['pursuit',[0,55],'path',0,false]]){
 const r=createRun(checkpoint);Object.assign(r.cart,{x:0,y:35});assert(leaveBrokenCart(r));Object.assign(r.foot,{x:xy[0],y:xy[1],surface,invulnerable:0});r.joe.mode=charge?'charging':'pursuit';r.joe.ram.footCharge=charge?2:0;assert.equal(captureFailure(r).kind,kind);beginRunover(r);assert.equal(r.failure.kind,kind);const captured=JSON.stringify(r.failure);tick(r,180);assert.equal(r.mode,'caught');assert.equal(JSON.stringify(r.failure),captured);const retry=createRun(r.checkpoint,r.story.collected);assert.equal(retry.failure,null);assert.equal(retry.escape,null);assert.equal(retry.cart.health,100);assert.equal(retry.foot,null);failureCases.push(r.failure);
}
fs.mkdirSync('output/back-nine-experience/outcome',{recursive:true});fs.writeFileSync('output/back-nine-experience/outcome/simulation.json',JSON.stringify({passed:true,results,failureCases},null,2));console.log(JSON.stringify({passed:true,endings:results.length,failureContexts:failureCases.length}));
