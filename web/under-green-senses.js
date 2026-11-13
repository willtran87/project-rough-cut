import {sourcePosition} from './audio-spatial.js';
import {lineClear,sightClear,gateBlocks} from './under-green-course.js';

// Physical source model shared by the mixer and captions. User mute/category
// choices do not remove the world information supplied by accessible captions.
export function audibleSource(run,source,{range=30,sourceHeight=1}={}){
 const p=run.player,pose=sourcePosition(p,source,{
  yaw:p.yaw+(p.rearAngle||0),height:p.eyeHeight??1.65,sourceHeight,range
 });
 if(pose.gain>0&&!lineClear(p,source,0,gateBlocks(run.gate,1.65)))pose.gain*=.35;
 return pose;
}

function bodyInView(run,{fov=58,aspect=16/9}={}){
 const p=run.player,j=run.joe,yaw=p.yaw+(p.rearAngle||0),pitch=p.pitch||0;
 const dx=j.x-p.x,dy=j.y-p.y,right=dx*Math.cos(yaw)-dy*Math.sin(yaw),ahead=dx*Math.sin(yaw)+dy*Math.cos(yaw);
 const vertical=Math.tan(fov*Math.PI/360),horizontal=vertical*aspect;
 return [.55,1.15,1.75].some(height=>{
  const up=height-(p.eyeHeight??1.65),depth=ahead*Math.cos(pitch)+up*Math.sin(pitch),screenUp=up*Math.cos(pitch)-ahead*Math.sin(pitch);
  return depth>.055&&Math.abs(right)<depth*horizontal+.3&&Math.abs(screenUp)<depth*vertical+.12&&sightClear(p,{...j,eyeHeight:height},run.gate);
 });
}

export function observeJoe(run,view){
 const j=run.joe,source=audibleSource(run,j,{range:36});
 const present=!['absent','blocked'].includes(j.phase),door=present&&j.phase==='enter'&&j.age<=.8;
 const rev=j.phase==='windup'||j.phase==='sweep';
 const audible=present&&source.gain>.05;
 const visible=present&&source.distance<28&&bodyInView(run,view);
 // An approaching player can see preparation before reaching the blade.
 // Preserve the short audio-only warning; distant hidden attacks stay private.
 const imminent=rev&&audible&&(source.distance<4||visible&&source.distance<8)&&lineClear(j,run.player,.05,gateBlocks(run.gate,1.9));
 return {...source,visible,audible,door,rev,imminent};
}
