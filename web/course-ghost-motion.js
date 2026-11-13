const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=v=>{const t=clamp(v,0,1);return t*t*(3-2*t);};

// A sighting owns one short curved lane. Camera turns cannot relocate it.
// The whole body/mower sweep is checked before a lane is used.
export function createCourseGhostMotion({blockers=[],ponds=[],height=()=>0}={}){
  const obstacles=[...blockers,...ponds],paths=new Map();let current=null;
  const clear=(x,z)=>Math.abs(x)<=12.8&&z<=-.5&&z>=-114&&!obstacles.some(o=>((x-o.x)/(o.rx+.68))**2+((z-o.z)/(o.rz+.68))**2<1);
  function lane(anchor,yaw,bend){
    const dx=-Math.sin(yaw),dz=-Math.cos(yaw),points=[];let length=0;
    for(let i=0;i<=40;i++){
      const d=i*.08,curve=bend*Math.sin(d/3.2*Math.PI),slope=bend*Math.PI/3.2*Math.cos(d/3.2*Math.PI);
      const x=anchor.x+dx*d-dz*curve,z=anchor.z+dz*d+dx*curve;
      const tx=dx-dz*slope,tz=dz+dx*slope,n=Math.hypot(tx,tz);
      if(!clear(x,z)||!clear(x+tx/n*.8,z+tz/n*.8))break;
      if(points.length)length+=Math.hypot(x-points.at(-1).x,z-points.at(-1).z);
      points.push({x,z,distance:length,yaw:Math.atan2(-tx,-tz)});
    }
    return {points,length};
  }
  return {sample(key,anchor,time,{reduced=false,player=null}={}){
    if(!key||!anchor){current=null;paths.clear();return null;}
    current=paths.get(key)||null;
    if(current?.key!==key||time<current.start){
      const seed=[...key].reduce((n,c)=>n+c.charCodeAt(0),0),bend=(seed%2?1:-1)*.28;
      let path={points:[],length:0};
      for(const angle of [0,.55,-.55,1.1,-1.1,Math.PI]){
        const candidate=lane(anchor,anchor.yaw+angle,bend);
        if(candidate.length>path.length)path=candidate;
        if(path.length>2.7)break;
      }
      current={key,start:time,anchor:{...anchor},path,seed};
      paths.set(key,current);if(paths.size>2)paths.delete(paths.keys().next().value);
    }
    const c=current,age=Math.max(0,time-c.start),phaseOffset=.25,rate=.34;
    if(c.aborted||!reduced&&c.path.length<.35)return null;
    const theta=phaseOffset+age*rate,leg=Math.floor(theta/Math.PI);
    const distance=c.path.length*(.5-.5*Math.cos(theta));
    const travelled=c.path.length*(leg+(leg%2?.5+.5*Math.cos(theta):.5-.5*Math.cos(theta))-(.5-.5*Math.cos(phaseOffset)));
    let pose={...c.anchor};
    if(!reduced&&c.path.points.length>1){
      const points=c.path.points,found=points.findIndex(p=>p.distance>=distance),i=found<0?points.length-1:Math.max(1,found),a=points[i-1],b=points[i];
      const t=clamp((distance-a.distance)/(b.distance-a.distance||1),0,1);
      pose={x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw))*t};
    }
    if(player&&Math.hypot(pose.x-player.x,pose.z-player.z)<2.05){c.aborted=true;return null;}
    const speed=reduced?0:c.path.length*.5*Math.sin(theta)*rate;
    const gait=reduced?0:Math.max(0,travelled)/(.46/.62),variant=c.seed*.17;
    return {...pose,y:height(pose.x,pose.z),time:reduced?0:age,distance:reduced?0:Math.max(0,travelled),phase:gait%1,
      laneLength:c.path.length,walkWeight:reduced?0:smooth(Math.abs(speed)/.22),movementSpeed:speed,
      behavior:'passing',behaviorPhase:reduced?'still':speed<0?'withdraw':'passing',movementPattern:'curved-drift',
      headYaw:reduced?0:.12*Math.sin(age*.63+variant),headNod:reduced?0:.035*Math.sin(age*.91+variant),
      headTilt:reduced?0:.045*Math.sin(age*.49+variant+.8),bodyLean:reduced?0:.025+.012*Math.sin(age*.73),
      sway:reduced?0:.014*Math.sin(age*1.13+variant),shoulderRoll:reduced?0:.018*Math.sin(age*.87+variant+.5),
      breathRate:.85,heldBreath:0,resolve:.35,alpha:1};
  },advance(key,time,options={}){
    const previous=paths.get(key);return previous?this.sample(key,previous.anchor,time,options):null;
  }};
}

// Keep the outgoing figure at its own location until it has dissolved. A new
// sighting never borrows the old opacity or jumps across the screen.
export function createGhostDissolve(){
  let current=null,lastTime=null;
  return {sample(key,motion,alpha,time,{enabled=true,reduced=false,continueMotion=null}={}){
    if(!enabled||lastTime!==null&&time<lastTime){current=null;lastTime=time;if(!enabled)return null;}
    const dt=lastTime===null?0:Math.max(0,time-lastTime);lastTime=time;
    if(!current&&key&&motion)current={key,motion:{...motion},alpha:0,retiring:false};
    if(!current)return null;
    const same=key===current.key&&!!motion;
    if(!same&&!current.retiring){current.retiring=true;current.exitStart=time;current.exitAlpha=current.alpha;current.exitPose={...current.motion};}
    if(current.retiring){
      const age=time-current.exitStart,fade=1-smooth(age/1.25);
      current.alpha=current.exitAlpha*fade;
      // Follow the outgoing sighting's own checked lane. If the player blocks
      // it, retain the last safe root while the upper body keeps dissolving.
      const continued=continueMotion?.(current.key,time);
      if(continued)current.motion=continued;
      else if(!reduced)current.motion={...current.motion,time:current.exitPose.time+age,
        headYaw:(current.exitPose.headYaw||0)+.055*Math.sin(age*1.4),sway:(current.exitPose.sway||0)+.012*Math.sin(age*1.8),
        shoulderRoll:(current.exitPose.shoulderRoll||0)+.014*Math.sin(age*1.2)};
      if(age>=1.25){current=null;return null;}
    }else{
      current.motion={...motion};
      const target=clamp(alpha,0,.75),rate=target>current.alpha?.42:.55;
      current.alpha+=clamp(target-current.alpha,-rate*dt,rate*dt);
    }
    return {key:current.key,motion:current.motion,alpha:current.alpha};
  }};
}
