export const OLD_FINISH=Object.freeze({x:0,y:478,radius:80,interactionHeight:3.1});
export const freshDeadGreen=()=>({phase:'waiting',seenSeconds:0,age:0,revealAge:0,announced:false});
export function advanceDeadGreen(s,dt,f){
 const events=[];if(!f.active)return events;dt=Math.max(0,dt);
 if(f.skip){s.phase='revealed';s.revealAge=1;s.announced=true;return events;}
 if(s.phase==='waiting'){
  if(f.y>545){s.phase='revealed';s.revealAge=1;s.announced=true;return events;}
  const eligible=f.y>435&&f.y<495&&f.visible&&f.calm&&f.clear&&f.accentFree;
  s.seenSeconds=eligible?s.seenSeconds+dt:0;
  if(s.seenSeconds>=.45){s.phase='respite';s.age=0;events.push('old_finish_seen');}
 }else if(s.phase==='respite'){
  s.age+=dt;
  if(!f.calm||!f.clear||f.y>510||s.age>=4||(s.age>=2&&f.distance<28)){
   s.phase='revealed';s.revealAge=0;
   events.push('old_finish_revealed');
  }
 }else if(s.phase==='revealed')s.revealAge=Math.min(1,s.revealAge+dt);
 if(s.phase==='revealed'&&!s.announced&&s.revealAge>=.75&&f.calm&&f.clear&&f.visible){
  s.announced=true;events.push('old_finish_notice');
 }
 return events;
}
export function oldFinishPose(s,reducedMotion=false){
 const revealed=s?.phase==='revealed',t=reducedMotion?1:Math.min(1,(s?.revealAge||0)/.75),open=revealed?t*t*(3-2*t):0;
 return {open,rotation:-Math.PI*(1-open)};
}
