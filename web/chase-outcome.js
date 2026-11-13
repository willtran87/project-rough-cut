import {COURSE,distance} from './back-nine-course.js';
import {cartDamageStage} from './cart-condition.js';

// Record the escape once the physical shutter sequence succeeds. No medals or
// scripted destruction: each arrival is a valid ending to the same chase.
const pose=p=>({x:p.x,y:p.y,yaw:p.yaw});
export function captureEscape(run){
 const foot=!!run.foot,health=Math.max(0,Math.min(100,run.cart.health));
 return {version:1,kind:foot?'on-foot':health<=45?'battered-cart':'running-cart',health,hits:run.cart.hits,collected:run.story.collected&3,
  cart:pose(run.cart),player:foot?pose(run.foot):null,joe:pose(run.joe)};
}
const validPose=p=>p&&Number.isFinite(p.x)&&Math.abs(p.x)<=40&&Number.isFinite(p.y)&&p.y>=0&&p.y<=835&&Number.isFinite(p.yaw)&&Math.abs(p.yaw)<10000;
export function readEscape(value){
 if(!value||value.version!==1||!['on-foot','battered-cart','running-cart'].includes(value.kind)||!Number.isFinite(value.health)||value.health<0||value.health>100||!Number.isInteger(value.hits)||value.hits<0||value.hits>100000||!Number.isInteger(value.collected)||value.collected<0||value.collected>3||!validPose(value.cart)||!validPose(value.joe))return null;
 const foot=value.kind==='on-foot',actor=foot?value.player:value.cart;
 if(!validPose(actor)||distance(actor,COURSE.finish)>6||actor.y<800.3||Math.abs(actor.x+23)>5.3||foot&&value.health!==0||!foot&&value.health<=0||!foot&&(value.kind==='battered-cart')!==(value.health<=45))return null;
 return {version:1,kind:value.kind,health:value.health,hits:value.hits,collected:value.collected,cart:pose(value.cart),player:foot?pose(value.player):null,joe:pose(value.joe)};
}
export function restoreEscape(run,value){
 const record=readEscape(value);run.escape=record;run.mode='complete';run.checkpoint=2;run.finishHold=1.21;Object.assign(run.finale,{age:4.8,gate:1,latched:true,tail:0});
 // Older saves establish success but contain no evidence of the arrival type.
 if(!record){Object.assign(run.cart,COURSE.finish);return false;}
 Object.assign(run.cart,record.cart,{health:record.health,hits:record.hits,speed:0,steer:0});
 Object.assign(run.joe,record.joe,{speed:0});run.story.collected=record.collected;
 if(record.player){run.cart.failedAt=run.time-5;run.foot={...record.player,onFoot:true,viewYaw:record.player.yaw,moveYaw:record.player.yaw,speed:0,driveSpeed:0,steer:0,surface:'path',invulnerable:0};}
 return true;
}
export function escapeCopy(record){
 if(!record)return {title:'Behind the shutter',story:'The service shutter is secured. The mower can no longer reach you. Somewhere beyond the garage, the clubhouse lights are still on.',detail:'ESCAPE RECORDED · Arrival details were not stored by this earlier version.'};
 const logs=(record.collected&1?1:0)+(record.collected&2?1:0),foot=record.kind==='on-foot';
 const copy=foot?['You made it on foot','The shutter catches behind you. Outside, the wreck is silent. The mower keeps idling. You are still here.']:
 record.kind==='battered-cart'?['One last turn of the wheels','The wounded cart rolls under the shutter. Loose metal settles around you. On the other side, Joe waits for another opening.']:
 record.health===100&&record.hits===0?['Every panel still in place','You ease the cart inside and let the shutter take the next impact. For the first time tonight, the engine behind you cannot follow.']:
 ['The cart made it through','You bring the cart inside with power still in reserve. The shutter locks. The mower idles beyond the steel, waiting for permission that will not come.'];
 const evidence=logs===2?'Both crew logs recovered. Their account made it out with you.':logs===1?'One crew log recovered. Someone else’s account made it out with you.':'No crew logs recovered. You made it out; the staff’s account remains on the course.';
 return {title:copy[0],story:copy[1],detail:(foot?'ESCAPED ON FOOT':`CART RECOVERED · ${Math.ceil(record.health)}% health · ${cartDamageStage(record.health).toUpperCase()}`)+'\n'+evidence};
}

// Capture observed circumstances before the death animation overwrites Joe's
// charge state and the player's speed. Advice describes rules, not guessed intent.
export function captureFailure(run){
 const p=run.foot||run.cart,j=run.joe,nearGarage=distance(p,COURSE.finish)<45;
 const cause='Joe’s industrial mower ran you down.';
 if(nearGarage)return {kind:run.checkpoint===2?'garage':'unpowered-garage',cause,advice:run.checkpoint===2?'Get fully inside the service garage, then hold Use. The narrow entrance keeps his cutting decks outside.':'Both relay shelters must be online before the garage can close. The longer routes reconnect before each relay.'};
 if(run.foot&&distance(p,run.cart)<7)return {kind:'wreck',cause,advice:'The wreck buys time, but Joe can circle it. Leave it behind and reach solid cover or a pedestrian gap.'};
 if(p.surface==='sand')return {kind:'bunker',cause,advice:'Bunkers slow your escape. Follow the firmer edge or cross to the service path before Joe closes in.'};
 if(j.ram?.footCharge>0||j.mode==='charging')return {kind:'charge',cause,advice:'Move across his approach while he lines up. Once he charges, he holds that direction; use the miss to reach cover.'};
 return {kind:'pursuit',cause,advice:'Break his line of sight at solid cover, or use the small maintenance gaps. An open fairway gives the mower room to close.'};
}
