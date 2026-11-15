// Metres, +y forward. Callers own target selection and action semantics.
export function interactionEligible(player,target,{reach=1.8,facing=.82,blocked=()=>false,height=1.15,yaw=player.yaw||0}={}){
 const dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy);
 if(!Number.isFinite(d)||d>reach)return false;
 if(d>.12){
  const angle=Math.atan2(dx,dy)-yaw;
  if(Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))>facing)return false;
  const elevation=Math.atan2(height-(player.eyeHeight??1.65),d);
  if(Math.abs(elevation-(player.pitch||0))>.85)return false;
 }
 // Stop before the target's own solid housing, without ignoring intervening cover.
 const stop=Math.max(0,d-(target.surfaceRadius??.45));
 return !blocked(player,{x:player.x+dx*stop/Math.max(d,.001),y:player.y+dy*stop/Math.max(d,.001)});
}
