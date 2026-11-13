const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=t=>t*t*(3-2*t);

// Distance-driven presentation only. The simulation still owns all movement.
// Reuse the two target records; no per-frame geometry, textures or audio nodes.
export function createRunnerGait(groundHeight=null){
 const feet=[{x:0,y:0,z:0,pitch:0,roll:0,planted:false},{x:0,y:0,z:0,pitch:0,roll:0,planted:false}];
 const anchors=[{x:0,y:0,valid:false},{x:0,y:0,valid:false}];
 const pose={feet,phase:0,blend:0,hipHeight:.857,turning:0};
 let owner=null,lastTime=null,lastX=0,lastY=0,lastHeading=0,direction=1;
 function reset(){owner=null;lastTime=null;pose.phase=0;pose.blend=0;for(const a of anchors)a.valid=false;}
 function update(foot,time,facing){
  const gap=lastTime===null?0:time-lastTime,distance=Math.hypot(foot.x-lastX,foot.y-lastY);
  const fresh=owner!==foot||lastTime===null||gap<0||gap>.25||distance>1.5;
  if(fresh){reset();owner=foot;lastX=foot.x;lastY=foot.y;lastHeading=facing;direction=foot.travelSign||1;}
  if(!fresh&&gap===0)return pose;
  const dt=fresh?0:Math.max(0,gap),travel=fresh?0:distance;
  const turn=fresh?0:Math.atan2(Math.sin(facing-lastHeading),Math.cos(facing-lastHeading));
  const speed=dt>0?travel/dt:foot.speed||0,turnSpeed=dt>0?Math.abs(turn)/dt:0;
  const moving=speed>.025,pivot=!moving&&turnSpeed>.1;
  const target=moving?clamp(speed/5,0,1):pivot?.16:0;
  pose.blend+=(target-pose.blend)*(1-Math.exp(-dt*16));
  direction+=((foot.travelSign||1)-direction)*(1-Math.exp(-dt*22));
  const stride=1.4+1.6*pose.blend,stance=.56-.30*pose.blend;
  pose.phase=(pose.phase+(moving?travel/stride:Math.abs(turn)*.32)*TAU)%TAU;
  pose.turning=pivot?turnSpeed:0;
  pose.hipHeight=.857-.16*pose.blend;
  const c=Math.cos(facing),s=Math.sin(facing),ground=groundHeight?groundHeight(foot.x,foot.y):0;
  for(let i=0;i<2;i++){
   const f=feet[i],a=anchors[i],u=(pose.phase/TAU+i*.5)%1;
   const contact=u<stance,swing=contact?0:(u-stance)/(1-stance);
   const amount=moving?Math.min(1,pose.blend*2):pose.blend;
   const advance=(contact?.5-u/stance:-.5+smooth(swing))*stride*stance*amount*direction;
   const lift=contact?0:Math.sin(Math.PI*swing)**2*(.225*pose.blend);
   f.lift=lift;
   f.pitch=contact?0:Math.sin(Math.PI*swing)*.34*pose.blend;
   f.x=(i?1:-1)*.112;f.z=-advance;
   // A planted sole remains at its actual course position as the body turns.
   if(contact&&moving&&pose.blend>.2){
    if(!a.valid){a.x=foot.x+c*f.x-s*f.z;a.y=foot.y-s*f.x-c*f.z;a.valid=true;}
    const dx=a.x-foot.x,dy=a.y-foot.y;
    f.x=c*dx-s*dy;f.z=-s*dx-c*dy;
   }else a.valid=false;
   f.planted=a.valid;
   let elevation=0;f.roll=0;
   if(groundHeight){
    const x=foot.x+c*f.x-s*f.z,y=foot.y-s*f.x-c*f.z,step=.18;
    elevation=groundHeight(x,y)-ground;
    // Sample the same triangulated ground as the visible course. Feet follow
    // local slope independently; the torso stays upright and controls unchanged.
    const rise=(groundHeight(x+s*step,y+c*step)-groundHeight(x-s*step,y-c*step))/(2*step);
    const cross=(groundHeight(x+c*step,y-s*step)-groundHeight(x-c*step,y+s*step))/(2*step);
    f.pitch+=Math.atan(rise);f.roll=Math.atan(cross/Math.sqrt(1+rise*rise));
   }
   const cp=Math.cos(f.pitch),sp=Math.sin(f.pitch),sx=cp*Math.sin(f.roll),sy=cp*Math.cos(f.roll);
   const bottom=Math.min(.055*sp-Math.hypot(.087*sx,.075*sy,.16*sp),-.055*sy+.04*sp-Math.abs(.075*sx)-Math.abs(.0125*sy)-Math.abs(.125*sp));
   f.y=elevation+.012-bottom+lift;
  }
  // A restart can begin partway through a support. Let the pelvis absorb that
  // longer planted step instead of stretching the knee or dragging the shoe.
  const lean=-pose.blend*.09,hipZ=.88*Math.sin(lean);
  for(let i=0;i<2;i++){
   const f=feet[i],lateral=f.x-(i?1:-1)*.112,forward=f.z-hipZ;
   pose.hipHeight=Math.min(pose.hipHeight,f.y+Math.sqrt(Math.max(.1,.755*.755-lateral*lateral-forward*forward)));
  }
  lastTime=time;lastX=foot.x;lastY=foot.y;lastHeading=facing;
  return pose;
 }
 return {update,reset,pose};
}
