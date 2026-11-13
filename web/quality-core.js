/* Small, engine-independent contracts for controls, targeting, lessons and authored paths. */
(() => {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const scale=Object.freeze({meters:.16,x:.72,eye:1.65,crouchedEye:1.12,bodyRadius:2.4});
  function groundAim(player,yaw,pitch,crouched,maxRange=96){
    const eye=(crouched?scale.crouchedEye:scale.eye)/scale.meters;
    const range=clamp(pitch<-.015?eye/-Math.tan(pitch):maxRange,8,maxRange);
    return {x:player.x+Math.sin(yaw)*range/scale.x,y:player.y+Math.cos(yaw)*range,range};
  }
  function visibleTarget(player,target,yaw,pitch,eye,blocked,incumbent=false){
    const dx=(target.x-player.x)*scale.x,dy=target.y-player.y,d=Math.hypot(dx,dy);
    if(d>=(target.radius||12)||blocked)return false;
    // Exact fixture/physical overlap has no meaningful bearing. Otherwise require deliberate facing.
    if(d<1)return true;
    const bearing=Math.atan2(dx,dy),delta=Math.atan2(Math.sin(bearing-yaw),Math.cos(bearing-yaw));
    const elevation=Math.atan2((target.interactionHeight??1.15)-eye,d*scale.meters);
    return Math.abs(delta)<(incumbent?.82:.70)&&Math.abs(elevation-pitch)<.85;
  }
  function stanceHeight(current,crouched,dt,reducedMotion=false){
    const target=crouched?scale.crouchedEye:scale.eye;
    if(!Number.isFinite(current))return target;
    // Stance camera only; never filters yaw, pitch, translation or collision response.
    return target+(current-target)*Math.exp(-Math.max(0,dt)*(reducedMotion?30:18));
  }
  function lesson(h,player,learned,opportunity={}){
    if(h.rehearsal||player.y>160||h.nightOrderActionsCompleted.includes('audit-bell'))return null;
    if(!learned.move&&h.travelDistance-(h.lessonStartDistance||0)<6)return {id:'move',goal:'Follow the lantern path'};
    if(!learned.look&&opportunity.freeLook!==false&&player.y<100)return {id:'look',goal:'Look around the tee'};
    if(!learned.cover&&opportunity.cover)return {id:'cover',goal:'Try nearby cover'};
    if(!learned.interact&&opportunity.welcome)return {id:'interact',goal:'Read the welcome board'};
    if(!learned.chip&&h.practiceDrill.active&&!h.practiceDrill.completed&&player.y<90)return {id:'chip',goal:'Try the practice bell'};
    return null;
  }
  function instructionOwner(flags){
    return ['sealing','filing','quiet','aim','danger','choice','interaction','lesson'].find(id=>flags[id])||'objective';
  }
  function soundPan(player,target,yaw){
    const x=(target.x-player.x)*scale.x,y=target.y-player.y;
    return clamp((x*Math.cos(yaw)-y*Math.sin(yaw))/Math.max(12,Math.hypot(x,y)),-.9,.9);
  }
  function chipPosition(start,end,power,t){
    const p=clamp(t,0,1);return {x:start.x+(end.x-start.x)*p,y:start.y+(end.y-start.y)*p,height:.055+Math.sin(p*Math.PI)*(1.4+power*1.6)};
  }
  // Authored route centerlines, verified against collision and course bounds. Geometry follows design,
  // rather than painting the pathfinder output onto the course.
  const paths=[
    [{x:0,y:0},{x:0,y:70},{x:0,y:100},{x:0,y:130},{x:52,y:148},{x:86,y:148}],
    [{x:0,y:65},{x:-42,y:82},{x:-72,y:104},{x:-76,y:122},{x:-30,y:130},{x:0,y:160},{x:86,y:148}],
    [{x:0,y:160},{x:0,y:190},{x:-20,y:214},{x:-23,y:241},{x:-80,y:250}],
    [{x:0,y:180},{x:-94,y:190}],
    [{x:-23,y:241},{x:-66,y:280},{x:-66,y:295},{x:0,y:295},{x:0,y:330},{x:0,y:350}],
    [{x:0,y:350},{x:-40,y:365},{x:-40,y:397},{x:-90,y:397},{x:-98,y:420}],
    [{x:0,y:350},{x:-108,y:353},{x:-108,y:400},{x:-98,y:420}],
    [{x:-98,y:420},{x:-110,y:430},{x:-108,y:451},{x:-110,y:470},{x:0,y:460},{x:0,y:515},{x:0,y:545}],
    [{x:0,y:545},{x:0,y:565},{x:30,y:570},{x:38,y:586},{x:95,y:578},{x:95,y:614}],
    [{x:0,y:545},{x:0,y:565},{x:-30,y:565},{x:-93,y:560},{x:-105,y:600},{x:-80,y:612},{x:24,y:612},{x:24,y:642},{x:95,y:645},{x:95,y:614}],
    [{x:95,y:614},{x:95,y:645},{x:10,y:668},{x:-18,y:695}],
    [{x:10,y:668},{x:-78,y:682},{x:-78,y:699}],
  ];
  window.RCQuality=Object.freeze({scale,groundAim,visibleTarget,stanceHeight,lesson,paths,instructionOwner,chipPosition,soundPan});
})();
