import assert from 'node:assert/strict';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {canSealGarage,insideGarage,garageHoldRatio} from '../web/chase-garage.js';
const tick=(r,n,input={})=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
for(const foot of [false,true]){
 const r=createRun(2);r.mode='driving';r.grace=999;Object.assign(r.cart,{x:-23,y:807});if(foot){r.cart.y=750;r.cart.health=0;r.foot={x:-23,y:807,yaw:0,onFoot:true,speed:0,steer:0,surface:'path',invulnerable:0};}
 // The shutter starts jammed (chase-tactics EXIT_RELEASE): until it is freed and
 // lifted past EXIT_CLEARANCE, holding Use inside cannot seal the garage.
 assert.equal(r.exitRelease.released,false);assert.equal(canSealGarage(r,{use:true}),false);tick(r,60,{use:true});assert.equal(r.finishHold,0);
 Object.assign(r.exitRelease,{released:true,open:1});
 assert(insideGarage(r.foot||r.cart,foot));assert.equal(canSealGarage(r,{}),false);tick(r,180);assert.equal(r.mode,'driving');assert.equal(r.finishHold,0,'Stopping alone must not lock the player into the ending');
 tick(r,60,{brake:true,use:false});assert.equal(r.finishHold,0,'Brake alone no longer interacts (4287b70)');
 tick(r,36,{brake:true});assert(garageHoldRatio(r)>.49&&garageHoldRatio(r)<.51);tick(r,1);assert.equal(r.finishHold,0,'Releasing before commitment cancels the hold');
 tick(r,80,{brake:true});assert.equal(r.mode,'sealing');tick(r,330);assert.equal(r.mode,'complete');assert(r.escape);
}
for(const [checkpoint,x,y,yaw]of [[1,-23,807,0],[2,-23,801,0],[2,-18,807,Math.PI/2]]){const r=createRun(checkpoint);r.mode='driving';r.grace=999;Object.assign(r.cart,{x,y,yaw});Object.assign(r.exitRelease,{released:true,open:1});assert.equal(canSealGarage(r,{brake:true}),false);tick(r,120,{brake:true});assert.equal(r.mode,'driving');}
console.log(JSON.stringify({passed:true,checks:['Jammed shutter blocks sealing until freed','Use required for cart and foot; Brake alone does not interact','Release cancels partial hold','Both relays required','Whole actor must clear threshold and side walls','Both arrivals seal and complete']}));
