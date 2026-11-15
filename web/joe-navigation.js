/* Evidence-driven decisions. This module never reads the live player or input. */
(() => {
  const distance=(a,b)=>Math.hypot((a.x-b.x)*.72,a.y-b.y);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function fresh(){return {seen:null,velocity:{x:0,y:0},search:null,searchEvidence:null,intent:'patrol',target:null};}
  function freshPatrol(seed){return {seed:(seed>>>0)||1,decisions:0,direction:1,recent:[],reverseCooldown:0,speed:13,style:'mow'};}
  function patrol(brain,route,current,clear,blocked=false){
    const roam=brain.roam||(brain.roam=freshPatrol(1));
    // Randomness is consumed only at a waypoint decision, never while moving.
    const roll=()=>{let x=roam.seed;x^=x<<13;x^=x>>>17;x^=x<<5;roam.seed=x>>>0;return roam.seed/4294967296;};
    const n=route.length,origin=route[current],wrap=i=>(i+n)%n;
    roam.recent.push(current);if(roam.recent.length>6)roam.recent.shift();
    roam.reverseCooldown=Math.max(0,roam.reverseCooldown-1);
    if(!blocked&&!roam.reverseCooldown&&roll()<.18){roam.direction*=-1;roam.reverseCooldown=4;}
    const candidates=[];
    const add=(index,weight)=>{if(index===current||candidates.some(c=>c.index===index)||!clear(route[index]))return;
      const age=roam.recent.lastIndexOf(index),recency=age<0?1:.08+.06*(roam.recent.length-1-age);
      candidates.push({index,weight:weight*recency});};
    add(wrap(current+roam.direction),4);
    if(distance(origin,route[wrap(current+roam.direction*2)])<145)add(wrap(current+roam.direction*2),1.5);
    add(wrap(current-roam.direction),.65);
    // Nearby crossing routes add local loops without long jumps across the map.
    const nearby=route.map((p,index)=>({index,d:distance(origin,p)})).filter(c=>c.d>18&&c.d<85&&!candidates.some(p=>p.index===c.index)).sort((a,b)=>a.d-b.d).slice(0,2);
    for(const c of nearby)add(c.index,1.1);
    const total=candidates.reduce((sum,c)=>sum+c.weight,0);let choice=roll()*total,index=wrap(current+roam.direction);
    for(const c of candidates){index=c.index;choice-=c.weight;if(choice<=0)break;}
    const rhythm=roll();roam.style=blocked?'reroute':rhythm<.42?'mow':rhythm<.88?'inspect':'listen';
    const pause=blocked?.25:roam.style==='mow'?0:roam.style==='inspect'?.65+roll()*.75:1.5+roll()*.7;
    roam.speed=11.8+roll()*2.6;roam.decisions++;
    return {index,pause,speed:roam.speed,style:roam.style};
  }
  function observe(brain,point,time,kind='sight'){
    const prior=brain.seen,dt=prior?time-prior.time:0;
    if(kind==='sight'&&prior?.kind==='sight'&&dt>0&&dt<.3&&distance(prior,point)/dt<50){
      const blend=1-Math.exp(-dt*8);
      brain.velocity.x+=(point.x-prior.x)/dt*blend-brain.velocity.x*blend;
      brain.velocity.y+=(point.y-prior.y)/dt*blend-brain.velocity.y*blend;
    }else brain.velocity={x:0,y:0};
    brain.seen={x:point.x,y:point.y,time,kind};brain.search=null;brain.searchEvidence=null;
  }
  function beginSearch(brain,point,kind,time){
    // A fresh event at the same location is still new evidence. Never inherit
    // visited points, an inspection timer or player velocity from another cue.
    brain.search=null;brain.target=null;
    brain.searchEvidence={point:{x:point.x,y:point.y},kind,time,
      velocity:kind==='sight'?{...brain.velocity}:{x:0,y:0}};
  }
  function forget(brain){
    brain.seen=null;brain.velocity={x:0,y:0};brain.search=null;
    brain.searchEvidence=null;brain.target=null;brain.intent='return-to-patrol';
  }
  function pursuit(brain,joe,visible,clear){
    const seen=brain.seen;if(!seen)return null;
    let target={x:seen.x,y:seen.y};brain.intent='last-evidence';
    // Predict only during current sight, never through cover or from inputs.
    if(visible&&seen.kind==='sight'&&distance(joe,seen)>18){
      const speed=Math.hypot(brain.velocity.x*.72,brain.velocity.y),lead=Math.min(.65,8/Math.max(1,speed));
      const candidate={x:clamp(seen.x+brain.velocity.x*lead,-109,109),y:clamp(seen.y+brain.velocity.y*lead,5,717)};
      if(clear(seen,candidate)){target=candidate;brain.intent='intercept-visible';}
    }
    brain.target=target;return target;
  }
  function search(brain,anchor,joe,dt,clear){
    if(!brain.search||distance(brain.search.anchor,anchor)>8){
      const v=brain.searchEvidence?.velocity||brain.velocity,angle=Math.hypot(v.x*.72,v.y)>2?Math.atan2(v.y,v.x*.72):Math.atan2(anchor.y-joe.y,(anchor.x-joe.x)*.72);
      const points=clear(anchor)?[{x:anchor.x,y:anchor.y}]:[];
      for(const [turn,reach]of [[0,16],[Math.PI/2,12],[-Math.PI/2,12]]){
        const p={x:clamp(anchor.x+Math.cos(angle+turn)*reach/.72,-109,109),y:clamp(anchor.y+Math.sin(angle+turn)*reach,5,717)};
        if(clear(p))points.push(p);
      }
      brain.search={anchor:{...anchor},points,index:0,pause:0,visited:[]};
    }
    const s=brain.search;let target=s.points[s.index];
    if(!target){brain.intent='search-complete';brain.target=null;return null;}
    if(distance(joe,target)<4){
      brain.intent='inspect-evidence';s.pause+=dt;
      if(s.pause>=.45){s.visited.push({...target});s.index++;s.pause=0;}
      brain.target={...target};return {target,hold:true};
    }
    brain.intent='check-search-route';brain.target={...target};return {target,hold:false};
  }
  // A moving observed target often stays in the same corridor. Refresh that
  // final leg immediately instead of following an obsolete endpoint until A*
  // runs again. Retain all obstacle waypoints and reject an obstructed shortcut.
  function refreshRouteGoal(joe,target,clear){
    const path=joe.routePath;
    if(!path?.length||!joe.routeTarget||distance(joe.routeTarget,target)<.5)return false;
    const anchor=path.length>1?path[path.length-2]:joe;
    if(!clear(anchor,target))return false;
    path[path.length-1]={x:target.x,y:target.y};
    joe.routeTarget={x:target.x,y:target.y};
    return true;
  }
  window.RCJoeNavigation={fresh,freshPatrol,patrol,observe,pursuit,beginSearch,forget,search,refreshRouteGoal};
})();
