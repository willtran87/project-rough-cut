import {EXIT_CLEARANCE} from './chase-tactics.js';
import {COURSE,distance} from './back-nine-course.js';
export const GARAGE_HOLD_SECONDS=1.2;
export function insideGarage(actor,onFoot){
 const halfY=onFoot?.32:Math.abs(Math.cos(actor.yaw))*1.6+Math.abs(Math.sin(actor.yaw))*1.16;
 const halfX=onFoot?.32:Math.abs(Math.sin(actor.yaw))*1.6+Math.abs(Math.cos(actor.yaw))*1.16;
 return distance(actor,COURSE.finish)<6&&actor.y-halfY>800.3&&Math.abs(actor.x+23)+halfX<5.3;
}
export function canSealGarage(run,input){const actor=run.foot||run.cart;return run.mode==='driving'&&run.checkpoint===2&&(!run.exitRelease||run.exitRelease.open>=EXIT_CLEARANCE)&&!!input.brake&&Math.abs(actor.speed)<3&&insideGarage(actor,!!run.foot);}
export function garageHoldRatio(run){return Math.max(0,Math.min(1,(run.finishHold||0)/GARAGE_HOLD_SECONDS));}
