const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// Upper-body presentation only. Feet and movement remain owned by the gait
// and simulation. Resting breath continues without advancing a footstep.
export function createRunnerBalance(){
 const pose={pitch:0,roll:0,breath:0,shoulderLift:0,armBrace:0,effort:0,acceleration:0};
 let owner=null,lastTime=null,lastX=0,lastY=0,lastHeading=0,lastSpeed=0,turn=0,acceleration=0;
 function reset(){owner=null;lastTime=null;turn=acceleration=0;for(const key of Object.keys(pose))pose[key]=0;}
 return {pose,reset,update(foot,time,heading,reduced=false){
  const elapsed=lastTime===null?0:time-lastTime,travel=Math.hypot(foot.x-lastX,foot.y-lastY),fresh=owner!==foot||lastTime===null||elapsed<0||elapsed>.25||travel>1.5,dt=fresh?0:Math.max(0,elapsed);
  if(fresh){reset();owner=foot;lastSpeed=(foot.speed||0)*(foot.travelSign||1);}
  if(dt>0){
   const speed=clamp(((foot.x-lastX)*Math.sin(heading)+(foot.y-lastY)*Math.cos(heading))/dt,-8,8),a=clamp((speed-lastSpeed)/dt,-28,28),yaw=Math.atan2(Math.sin(heading-lastHeading),Math.cos(heading-lastHeading))/dt;
   acceleration+=(a-acceleration)*(1-Math.exp(-dt*11));turn+=(clamp(yaw,-2,2)-turn)*(1-Math.exp(-dt*10));lastSpeed=speed;
   const target=Math.min(1,Math.abs(speed)/6.6);pose.effort+=(target-pose.effort)*(1-Math.exp(-dt*(target>pose.effort?2.4:.6)));
  }
  const breath=Math.sin(time*1.8)+.22*Math.sin(time*3.6-.6),amount=.35+pose.effort*.65;
  pose.acceleration=acceleration;
  pose.breath=reduced?0:breath*amount;
  pose.pitch=reduced?0:clamp(-acceleration*.003,-.084,.084)+pose.breath*.009;
  pose.roll=reduced?0:-turn*Math.min(1,Math.abs(lastSpeed)/6.6)*.032;
  pose.shoulderLift=reduced?0:pose.breath*.007;
  pose.armBrace=reduced?0:clamp(-acceleration/18,-1,1)*.16;
  owner=foot;lastTime=time;lastX=foot.x;lastY=foot.y;lastHeading=heading;return pose;
 }};
}
