// Shared graphics quality: one player setting (Auto, Low, Medium, High) that
// each chapter maps onto its own knobs, plus a governor that steps Auto down
// when the game is running slowly. Stored in the shared campaign settings.
import {CAMPAIGN_KEY,readRecord,patchRecord} from './preference-store.js';

export const QUALITY_CHOICES=['auto','low','medium','high'];
// finish: screen-finish level. viewScale: multiplier on the chapter's draw
// distance. shadows/effects: whether optional shadows and decorative effects
// (particles, wildlife, weather) are drawn. resolution: internal render scale.
export const QUALITY_PRESETS={
 low:{name:'low',finish:'off',viewScale:.6,shadows:false,effects:false,resolution:.75},
 medium:{name:'medium',finish:'low',viewScale:.8,shadows:true,effects:true,resolution:1},
 high:{name:'high',finish:'high',viewScale:1,shadows:true,effects:true,resolution:1},
};
const ORDER=['low','medium','high'];
export function storedQuality(){const v=readRecord(CAMPAIGN_KEY).graphicsQuality;return QUALITY_CHOICES.includes(v)?v:'auto';}
export function storeQuality(choice){return QUALITY_CHOICES.includes(choice)&&patchRecord(CAMPAIGN_KEY,{graphicsQuality:choice});}

// Pure step-down rule, exported for checks: feed frame durations in ms; returns
// true when the last `window` seconds averaged under `floor` fps.
export function createSlowDetector({floor=28,window=4,warmup=3}={}){
 let elapsed=0,frames=0,age=0;
 return {
  reset(){elapsed=frames=0;},
  sample(ms){
   if(!(ms>0)||ms>1000){elapsed=frames=0;return false;}// tab switch or stall: not a rate sample
   age+=ms/1000;if(age<warmup)return false;
   elapsed+=ms/1000;frames++;
   if(elapsed<window)return false;
   const fps=frames/elapsed;elapsed=frames=0;return fps<floor;
  },
 };
}

// choice 'auto' starts at High and only ever steps down during a session, so
// the picture never oscillates. A fixed choice is never changed.
export function createGraphicsQuality({choice=storedQuality(),onChange=()=>{},detector=createSlowDetector()}={}){
 let selected=QUALITY_CHOICES.includes(choice)?choice:'auto',level=selected==='auto'?'high':selected,steps=0;
 const api={
  get choice(){return selected;},
  get level(){return level;},
  get preset(){return QUALITY_PRESETS[level];},
  get autoSteps(){return steps;},
  set(next,{persist=true}={}){
   if(!QUALITY_CHOICES.includes(next))return false;selected=next;if(persist)storeQuality(next);
   const target=next==='auto'?'high':next;steps=0;detector.reset();
   if(target!==level){level=target;onChange(api.preset,api);}return true;
  },
  // Call once per drawn gameplay frame with the frame duration in ms. Do not
  // call while paused, loading or in menus.
  frame(ms){
   if(selected!=='auto'||level==='low')return false;
   if(!detector.sample(ms))return false;
   level=ORDER[ORDER.indexOf(level)-1];steps++;onChange(api.preset,api);return true;
  },
 };
 return api;
}
