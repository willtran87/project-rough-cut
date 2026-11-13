// Cosmetic motion only. The real Joe's navigation, detection and collision
// remain authoritative. A sighting chooses its short lane once, never chasing
// the camera or repositioning when the viewer turns.
export function createGhostSightings() {
  let current=null,next=0,recoverUntil=0,lastSite=-1,serial=0,lastTime=null,phase='quiet',blocked=false,wait=0,interruptions=0,preemptions=0;
  return {
    sample(time,allowed,sites,eligible,fallback=null,{deferred=false,enabled=true}={}) {
      if(lastTime!==null&&time<lastTime){lastTime=null;current=null;next=recoverUntil=0;lastSite=-1;serial=0;blocked=false;wait=0;interruptions=preemptions=0;}
      const dt=lastTime===null?0:Math.max(0,time-lastTime);lastTime=time;
      if(!enabled){current=null;next=recoverUntil=0;wait=0;blocked=true;phase='disabled';return null;}
      // Hard interruptions hide immediately. They preserve time already spent
      // waiting, and add a single short re-entry gap after protection ends.
      if(!allowed){if(current){interruptions++;current=null;next=time;}blocked=true;phase='suppressed';return null;}
      if(blocked){next=Math.max(next,time+.75);blocked=false;}
      if(current&&time>=current.end){current=null;next=time+14+(serial%3)*3;recoverUntil=next;wait=0;}
      if(!current&&time>=next){
        // Background beats can defer a due sighting for at most eight safe
        // seconds. Once started they cannot cancel its warning/reveal/rush.
        wait+=dt;
        if(deferred&&wait<8){phase='deferred';return null;}
        for(let n=1;n<=sites.length;n++){
          const i=(lastSite+n)%sites.length,s=sites[i];if(!eligible(s))continue;
          lastSite=i;serial++;
          current={site:s,index:i,key:'ambient:'+i+':'+serial,start:time,warning:1.2,end:time+13+(serial%3)};break;
        }
        if(!current&&fallback){const site=fallback();if(site){serial++;current={site,index:-1,key:'ambient:route:'+serial,start:time,warning:1.2,end:time+14};}}
        if(current){if(deferred)preemptions++;wait=0;}else next=time+.5;
      }
      if(!current){phase=serial&&time<recoverUntil?'recovery':'quiet';return null;}
      const age=time-current.start-current.warning,remaining=current.end-time;
      phase=age<0?'warning':'encounter';
      return {...current,phase,alpha:.52*Math.max(0,Math.min(1,age/.8,remaining/1.2))};
    },
    stats:()=>({phase,next,serial,deferredSeconds:wait,interruptions,preemptions,reserved:!!current})
  };
}

export function createGhostFeedback(){
  let key=null,seen=false,noticed=false,rushed=false,hesitated=false,feinted=false,active=null,next=0,lastTime=0;
  const gazeCues=new Set();
  return {
    sample(time,ghost,allowed=true){
      if(time<lastTime){key=null;active=null;next=0;}lastTime=time;
      if(!allowed||!ghost){key=null;active=null;next=Math.max(next,time+.4);return null;}
      if(key!==ghost.key){key=ghost.key;seen=noticed=rushed=hesitated=feinted=false;active=null;gazeCues.clear();}
      let kind=null;
      if(ghost.seen&&!seen){seen=true;kind='seen';}
      if(ghost.seen&&ghost.phase==='notice'&&!noticed){noticed=true;kind=kind||'notice';}
      if(ghost.seen&&ghost.phase==='rush'&&!rushed){rushed=true;kind='rush';}
      if(ghost.seen&&ghost.gesture==='hesitate'&&!hesitated){hesitated=true;kind='hesitate';}
      if(ghost.seen&&ghost.gesture==='feint'&&!feinted){feinted=true;kind='feint';}
      if(ghost.seen&&ghost.gazeGesture&&!gazeCues.has(ghost.gazeGesture)){gazeCues.add(ghost.gazeGesture);kind=ghost.gazeGesture;}
      if(kind&&(time>=next||kind!=='seen'&&kind!=='notice')){
        const gaze=kind===ghost.gazeGesture,variant=gaze?(ghost.gazeVariant||0):0;
        active={kind,variant,start:time,duration:gaze?(variant===2?1.25:variant===1?1.1:kind==='stare'?.95:kind==='lookaway'?.7:.55):kind==='rush'?1.15:kind==='hesitate'?.48:kind==='feint'?.72:.8,side:ghost.side||1};next=time+1.2;
      }
      if(!active)return null;
      const t=(time-active.start)/active.duration;
      if(t>=1){active=null;return null;}
      const envelope=active.variant===2?Math.sin(Math.max(0,t)*Math.PI*2)**2:Math.sin(Math.max(0,t)*Math.PI);
      return {kind:active.kind,variant:active.variant,side:active.side,progress:Math.max(0,t),slice:Math.floor(Math.max(0,t)*6),strength:envelope*(active.kind==='rush'?.62:active.kind==='hesitate'?.36:active.kind==='feint'?.56:active.kind==='stare'?.3:active.kind==='lookaway'?.26:active.kind==='lookback'?.48:.44)};
    }
  };
}

// Five-Hz attention checks with angular hysteresis and dwell timers. No camera
// capture or per-frame raycasts. Occlusion resets attention, never counts as a
// deliberate look away; each reaction is available only once per sighting.
const GAZE_STARE_DELAY=[1.2,1.6,.8],GAZE_AWAY_DELAY=[.4,.8,.6];
const GAZE_STARE_TILT=[.16,-.14,.08],GAZE_BACK_TILT=[-.12,.13,-.06],GAZE_AWAY_LEAN=[.07,-.025,.03];
const GAZE_AWAY_NOD=[.05,-.04,.02],GAZE_BACK_NOD=[-.04,.025,-.02],GAZE_STARE_NOD=[0,-.045,.04];
export function createGhostGaze(visible=()=>true){
  let c=null;
  const smooth=v=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
  return {sample(key,time,source,player){
    if(!key){c=null;return null;}
    if(c?.key!==key||time<c.last){
      // Choose each response independently once, rather than rolling every
      // frame or coupling every stare to the same retreat/return sequence.
      let seed=2166136261;for(let i=0;i<key.length;i++)seed=Math.imul(seed^key.charCodeAt(i),16777619);
      seed=(seed^(seed>>>16))>>>0;
      c={key,last:time,next:time,watch:null,away:null,looking:false,known:false,stared:false,left:false,returned:false,event:null,poses:{},variants:{stare:seed%3,lookaway:Math.floor(seed/3)%3,lookback:Math.floor(seed/9)%3}};
    }
    c.last=time;
    if(time+1e-8>=c.next){
      c.next=time+.2;
      const dx=source.x-player.x,dz=source.z-player.z,d=Math.hypot(dx,dz),dy=(source.y||0)+1.4-(player.eyeY??1.4),pitch=player.pitch||0;
      const dot=((dx*Math.sin(player.yaw)-dz*Math.cos(player.yaw))*Math.cos(pitch)+dy*Math.sin(pitch))/Math.max(.01,Math.hypot(d,dy));
      const inCone=d<=14&&dot>(c.looking?.86:.94),looking=inCone&&visible(source,player);
      if(looking){
        if(!c.looking)c.watch=time;
        c.away=null;
        if(time-c.watch>=.4-1e-8)c.known=true;
        if(c.left&&!c.returned&&time-c.watch>=(c.variants.lookback===1?.4:.2)-1e-8){c.returned=true;c.event={kind:'lookback',start:time,duration:.85};}
        else if(!c.stared&&time-c.watch>=GAZE_STARE_DELAY[c.variants.stare]-1e-8){c.stared=true;c.event={kind:'stare',start:time,duration:1.1};}
      }else{
        c.watch=null;
        if(c.known&&!c.left&&d<=14&&dot<.35){
          if(c.away===null)c.away=time;
          if(time-c.away>=GAZE_AWAY_DELAY[c.variants.lookaway]-1e-8){c.left=true;c.event={kind:'lookaway',start:time,duration:1.05};}
        }else {c.away=null;if(!c.left&&(d>14||inCone&&!looking))c.known=false;}
      }
      c.looking=looking;
      if(c.event&&c.event.variant===undefined){c.event.variant=c.variants[c.event.kind];c.event.duration=c.event.variant===2?1.45:c.event.variant===1?1.3:c.event.duration;c.poses[c.event.kind]=c.event;}
    }
    const e=c.event,t=e?(time-e.start)/e.duration:1;
    const pulse=kind=>{
      const p=c.poses[kind],u=p?(time-p.start)/p.duration:1;if(u>=1)return 0;
      if(p.variant===2)return u<.48?smooth(u/.12)*(1-smooth((u-.28)/.2)):.65*smooth((u-.48)/.14)*(1-smooth((u-.78)/.22));
      return smooth(u/(p.variant===1?.5:.3))*(1-smooth((u-.6)/.4));
    };
    // A stare pose eases in and releases through the event envelope, avoiding
    // an abrupt head reset at the attention sampling boundary.
    return {gesture:t<1?e.kind:null,variant:e?.variant||0,variants:c.variants,fixation:pulse('stare'),abandonment:pulse('lookaway'),recoil:pulse('lookback')};
  }};
}

export function createGhostMotion({blockers=[],ponds=[],height=()=>0}={}){
  let current=null;
  const obstacles=[...blockers,...ponds];
  function clear(x,z){
    if(Math.abs(x)>13)return false;
    return !obstacles.some(o=>((x-o.x)/(o.rx+.65))**2+((z-o.z)/(o.rz+.65))**2<1);
  }
  return {
    sample(key,anchor,time){
      if(!key||!anchor){current=null;return null;}
      if(current?.key!==key){
        const dx=-Math.sin(anchor.yaw),dz=-Math.cos(anchor.yaw);
        let length=0;
        // Include the mower ahead of Joe, not just the body origin. Reject
        // water and solid cover along the entire swept footprint.
        for(let d=0;d<=.751;d+=.05){
          if(!clear(anchor.x+dx*d,anchor.z+dz*d)||!clear(anchor.x+dx*(d+.75),anchor.z+dz*(d+.75)))break;
          length=d;
        }
        current={key,anchor:{...anchor},dx,dz,length,start:time};
      }
      const c=current,t=Math.max(0,Math.min(1,(time-c.start-.12)/2.6));
      const distance=c.length*t*t*(3-2*t),speed=c.length*6*t*(1-t)/2.6;
      const x=c.anchor.x+c.dx*distance,z=c.anchor.z+c.dz*distance;
      return {x,y:height(x,z),z,yaw:c.anchor.yaw,time:Math.max(0,time-c.start),distance,phase:(distance/(.46/.62))%1,walkWeight:Math.min(1,speed/.18),laneLength:c.length};
    }
  };
}

// Chosen once per sighting. Piecewise eased travel has zero velocity at each
// stop, so hesitation/feints never teleport or depend on render frequency.
const GHOST_RHYTHMS=[
  {name:'steady',windup:1.35,rush:2,stalk:3.8,hold:.85,withdraw:2.2,linger:1.5,reach:1,back:1,out:[[0,0],[1,1]],away:[[0,0],[1,1]]},
  {name:'hesitate',windup:1.5,rush:2.25,stalk:4,hold:.55,withdraw:2.3,linger:1.1,reach:.92,back:1.12,out:[[0,0],[.30,.22],[.42,.22],[1,1]],away:[[0,0],[.38,.62],[.62,.62],[1,1]]},
  {name:'late-burst',windup:1.65,rush:2.4,stalk:4,hold:.95,withdraw:1.9,linger:1,reach:1,back:.85,out:[[0,0],[.42,.12],[1,1]],away:[[0,0],[.65,.35],[1,1]]},
  {name:'false-retreat',windup:1.4,rush:2.2,stalk:3.9,hold:.65,withdraw:2.5,linger:1.1,reach:.88,back:1.2,out:[[0,0],[.40,.5],[.54,.5],[1,1]],away:[[0,0],[.38,.65],[.50,.65],[.68,.35],[1,1]]}
];
function ghostRhythm(u,points){
  if(u<=0)return {position:0,velocity:0};if(u>=1)return {position:1,velocity:0};
  for(let i=1;i<points.length;i++)if(u<=points[i][0]){
    const a=points[i-1],b=points[i],span=b[0]-a[0],t=(u-a[0])/span,change=b[1]-a[1];
    return {position:a[1]+change*t*t*(3-2*t),velocity:change*6*t*(1-t)/span};
  }
}

// Reactive apparitions have their own tiny, bounded state machine. They never
// write player/real-Joe state or request navigation paths. A rush commits to the
// position the ghost actually noticed; breaking sight or stepping aside works.
export function createGhostBehavior({blockers=[],ponds=[],height=()=>0}={}) {
  const obstacles=[...blockers,...ponds],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=v=>{const u=clamp(v,0,1);return u*u*(3-2*u);};
  let c=null;
  const clear=(x,z,pad=.65)=>Math.abs(x)<=13&&!obstacles.some(o=>((x-o.x)/(o.rx+pad))**2+((z-o.z)/(o.rz+pad))**2<1);
  function sight(a,b) {
    // Segment/ellipse closest point: no raycasts or frame-dependent sampling.
    return !obstacles.some(o=>{
      const ax=(a.x-o.x)/(o.rx+.12),az=(a.z-o.z)/(o.rz+.12),dx=(b.x-a.x)/(o.rx+.12),dz=(b.z-a.z)/(o.rz+.12);
      const t=clamp(-(ax*dx+az*dz)/(dx*dx+dz*dz||1),0,1);
      return (ax+dx*t)**2+(az+dz*t)**2<1;
    });
  }
  function lane(anchor,dx,dz,max) {
    let length=0;
    for(let d=0;d<=max;d+=.1){
      if(!clear(anchor.x+dx*d,anchor.z+dz*d)||!clear(anchor.x+dx*(d+.75),anchor.z+dz*(d+.75)))break;
      length=d;
    }
    return length;
  }
  const gaze=createGhostGaze(sight);
  return {
    sample(key,anchor,time,player,profile) {
      if(!key||!anchor||!player){c=null;gaze.sample(null);return null;}
      if(c?.key!==key||time<c.start){
        const serial=Number(key.split(':').at(-1))||0;
        const rhythm=GHOST_RHYTHMS[(Math.floor(serial/3)+Math.round(Math.abs(anchor.x)*3+Math.abs(anchor.z)*5))%GHOST_RHYTHMS.length];
        c={key,anchor:{...anchor},start:time,last:time,playerX:player.x,playerZ:player.z,responsiveSpeed:0,responsiveDistance:0,awaySeconds:0,rhythm,variant:serial%5,profile:profile||['watcher','stalker','rusher'][serial%3],noticed:null,nextCheck:time+.8,dx:0,dz:0,length:0,distance:0,target:null,fadeStart:null,yaw:anchor.yaw};
      }
      const dt=Math.max(0,Math.min(.1,time-c.last)),playerTravel=Math.hypot(player.x-c.playerX,player.z-c.playerZ);
      if(time>c.last){c.playerX=player.x;c.playerZ=player.z;c.last=time;}
      const age=Math.max(0,time-c.start),origin=c.anchor;
      const separation=Math.hypot(player.x-origin.x,player.z-origin.z);
      if(c.noticed===null&&time>=c.nextCheck){
        c.nextCheck=time+.2;
        // Close approach or looking toward him gets his attention, through
        // open space only. The player can avoid a reaction by staying behind cover.
        const gaze=((origin.x-player.x)*Math.sin(player.yaw)+(origin.z-player.z)*-Math.cos(player.yaw))/Math.max(.01,separation);
        if(separation<=14&&(separation<8||gaze>.82)&&sight(origin,player)){
          c.noticed=time;c.target={x:player.x,z:player.z};
          c.dx=(player.x-origin.x)/Math.max(.01,separation);c.dz=(player.z-origin.z)/Math.max(.01,separation);
          c.targetYaw=Math.atan2(-c.dx,-c.dz);
          c.length=lane(origin,c.dx,c.dz,Math.min((c.profile==='rusher'?6.2:c.profile==='stalker'?3:1.6)*c.rhythm.reach,Math.max(0,separation-2.2)));
        }
      }
      let phase='waiting',speed=0,distance=0,alpha=1,headLead=0,torsoTurn=0,gesture=null;
      if(c.noticed!==null){
        const t=time-c.noticed,turn=ease((t-.12)/.63),angle=Math.atan2(Math.sin(c.targetYaw-origin.yaw),Math.cos(c.targetYaw-origin.yaw));
        c.yaw=origin.yaw+angle*turn;
        // Eyes/head find the sound first, shoulders follow, then the mower.
        // All three settle before the existing windup and committed rush.
        headLead=.48*Math.tanh(angle*(ease(t/.30)-turn)/.48);
        torsoTurn=.14*Math.tanh(angle*(ease((t-.07)/.45)-turn)/.14);
        if(t<.75)phase='notice';
        else if(c.profile==='watcher'||c.profile==='stalker'){
          phase=c.profile==='watcher'?'watching':t<c.rhythm.windup?'windup':'stalk';
          const gx=origin.x+c.dx*c.distance-player.x,gz=origin.z+c.dz*c.distance-player.z;
          const dy=height(origin.x+c.dx*c.distance,origin.z+c.dz*c.distance)+1.4-(player.eyeY??1.4),pitch=player.pitch||0;
          const looking=((gx*Math.sin(player.yaw)-gz*Math.cos(player.yaw))*Math.cos(pitch)+dy*Math.sin(pitch))/Math.max(.01,Math.hypot(gx,gz,dy))>.65;
          c.awaySeconds=looking?0:c.awaySeconds+dt;
          const wanted=t<c.rhythm.windup?0:c.profile==='watcher'?(c.awaySeconds>.45?.65:0):Math.min(1.15,dt>0?playerTravel/dt*.65:0);
          if(dt>0)c.responsiveSpeed+=(wanted-c.responsiveSpeed)*(1-Math.exp(-dt/ .16));
          // A watcher stops immediately under a direct gaze. Followers settle
          // over a fraction of a step; neither reacquires a moving target.
          if(c.profile==='watcher'&&looking)c.responsiveSpeed=0;
          c.responsiveDistance=Math.min(c.length,c.responsiveDistance+c.responsiveSpeed*dt);
          distance=c.responsiveDistance;speed=distance>=c.length?0:c.responsiveSpeed;
          if(t>11&&c.fadeStart===null)c.fadeStart=time;
        }
        else if(t<c.rhythm.windup)phase='windup';
        else {
          const rhythm=c.rhythm,duration=c.profile==='rusher'?rhythm.rush:rhythm.stalk,u=clamp((t-rhythm.windup)/duration,0,1),travel=ghostRhythm(u,rhythm.out);
          distance=c.length*travel.position;speed=c.length*travel.velocity/duration;
          phase=c.profile==='rusher'?'rush':'stalk';
          if(c.length>.25&&u>0&&u<1&&travel.velocity===0)gesture='hesitate';
          if(u>=1){
            const after=t-rhythm.windup-duration,{hold,withdraw,linger}=rhythm;
            const back=Math.min(c.length*.45,(c.profile==='rusher'?1.4:.8)*rhythm.back),v=clamp((after-hold)/withdraw,0,1),retreat=ghostRhythm(v,c.profile==='rusher'?GHOST_RHYTHMS[3].away:rhythm.away);
            distance=c.length-back*retreat.position;speed=-back*retreat.velocity/withdraw;
            phase=after<hold?'linger':v<1?'withdraw':'linger';
            if(c.length>.25&&phase==='withdraw'&&retreat.velocity<0)gesture='feint';
            // Retrace only the already checked lane, facing the player. No
            // new pathfinding, retargeting or teleport to prolong a sighting.
            if(after>=hold+withdraw+linger){phase='fade';if(c.fadeStart===null)c.fadeStart=c.noticed+rhythm.windup+duration+hold+withdraw+linger;}
          }
        }
      }
      // Never run the mower into the live player, even if they move into its
      // committed lane. Stop at the previous safe sample and dissolve.
      const along=(player.x-origin.x)*c.dx+(player.z-origin.z)*c.dz;
      const closest=clamp(along,Math.min(c.distance,distance),Math.max(c.distance,distance));
      const x=origin.x+c.dx*closest,z=origin.z+c.dz*closest;
      if(Math.hypot(x-player.x,z-player.z)<2.05){
        if(c.fadeStart===null)c.fadeStart=time;
        c.aborted=true;distance=c.distance;
      }
      if(c.fadeStart!==null){phase='fade';gesture=null;distance=c.distance;speed=0;alpha*=clamp(1-(time-c.fadeStart)/1.2,0,1);}
      if(c.aborted)alpha=0;
      c.distance=distance;
      // One deliberate reveal and held breath, then a forward-set rush.
      // These continuous envelopes drive the existing mesh, never the camera.
      const attention=c.noticed===null?0:Math.max(0,time-c.noticed);
      const notice=ease(attention/.45),commit=c.profile==='watcher'?0:ease((attention-.75)/(c.rhythm.windup-.75));
      const rush=c.profile==='rusher'?ease((attention-c.rhythm.windup)/.3):0;
      const drive=rush*ease(speed/1.5);
      const attentionPose=gaze.sample(c.noticed!==null&&attention>=.75&&c.fadeStart===null?key:null,time,{x:origin.x+c.dx*distance,y:height(origin.x+c.dx*distance,origin.z+c.dz*distance),z:origin.z+c.dz*distance},player);
      const fixation=attentionPose?.fixation||0,abandonment=attentionPose?.abandonment||0,recoil=attentionPose?.recoil||0;
      const stareStyle=attentionPose?.variants.stare||0,awayStyle=attentionPose?.variants.lookaway||0,backStyle=attentionPose?.variants.lookback||0;
      // Distinct silhouettes foreshadow the rule before movement begins.
      const profileTilt=c.profile==='watcher'?.20:c.profile==='stalker'?.07:-.06;
      const resolve=notice*(.65+.35*rush),headTilt=clamp(notice*(profileTilt-.04*rush)+fixation*GAZE_STARE_TILT[stareStyle]+recoil*GAZE_BACK_TILT[backStyle],-.22,.22),bodyLean=clamp(notice*(c.profile==='stalker'?.045:0)+commit*(.035+.085*drive)+abandonment*GAZE_AWAY_LEAN[awayStyle],0,.12);
      const gaitPhase=(distance/(.46/.62))%1,walkWeight=ease(Math.abs(speed)/.65),settle=ease(age/.7),variant=c.variant*1.27;
      // Layer small, out-of-phase motions over the distance-driven footwork.
      // The held notice remains deliberate; breathing returns during pursuit.
      const living=settle*(1-notice*.82+commit*.32)*(1-fixation*.9);
      const headYaw=clamp(headLead-torsoTurn+.045*Math.sin(age*1.13+variant)*living*(1-rush*.8)+(stareStyle===2?fixation*.14:0)+(awayStyle===2?abandonment*.18:0),-.665,.665);
      const headNod=clamp(.025*Math.sin(age*1.47+variant+.8)*living+notice*(c.profile==='rusher'?.04:0)-.035*drive+abandonment*GAZE_AWAY_NOD[awayStyle]+recoil*GAZE_BACK_NOD[backStyle]+fixation*GAZE_STARE_NOD[stareStyle],-.07,.07);
      const sway=.012*Math.sin(gaitPhase*Math.PI*2+.5)*walkWeight+.004*Math.sin(age*.91+variant)*living;
      const shoulderRoll=.016*Math.sin(gaitPhase*Math.PI*2)*walkWeight+.006*Math.sin(age*1.21+variant)*living;
      // A single intake and slackening jaw, not rhythmic chewing.
      const jawDrop=notice*(.003+.006*ease((attention-.65)/.85));
      return {x:origin.x+c.dx*distance,y:height(origin.x+c.dx*distance,origin.z+c.dz*distance),z:origin.z+c.dz*distance,yaw:c.yaw,time:age,distance,phase:gaitPhase,walkWeight,laneLength:c.length,alpha,movementPattern:c.rhythm.name,movementSpeed:speed,gesture,gazeGesture:attentionPose?.gesture||null,gazeVariant:attentionPose?.variant||0,behavior:c.profile,behaviorPhase:alpha<=0?'gone':phase,noticed:c.noticed!==null,target:c.target?{...c.target}:null,breathRate:c.profile==='watcher'?.42:c.profile==='rusher'?1.6:.85,resolve,headTilt,bodyLean,heldBreath:Math.max(notice*(1-commit*.35),fixation),headYaw,headNod,sway,shoulderRoll,jawDrop,torsoTurn};
    }
  };
}
