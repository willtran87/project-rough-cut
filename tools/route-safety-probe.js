/* Injected only by the ordinary-input QA player. Read-only: choose a waypoint
 * using the same static collision geometry and live Joe position as the map. */
window.__courseProbeEncounters = () => {
  const h=state.hole,d=h.tensionDirector,e=h.engagement.experience;
  return {time:h.elapsed,queue:e.queue.map(b=>({id:b.id,ready:b.ready,distance:worldDistance(state.player,b)})),clear:e.aftermathClearSeconds,
    protected:suspenseProtected(),distance:worldDistance(h.joe,state.player),mode:h.joe.mode,los:h.hasLineOfSight,detection:h.detection,
    message:h.message,messageTimer:h.messageTimer,captions:h.captions.map(c=>({category:c.category,text:c.text})),
    relief:d.reliefSeconds,accent:d.accentCooldown,pending:!!d.pendingIntercept,silent:!!d.silentStalk,cover:!!d.coverAudit,omen:!!d.omen};
};
window.__courseProbeSafeWaypoint = (goal) => {
  const p=state.player,j=state.hole.joe,dist=worldDistance(p,j);
  if(dist>58)return goal;
  const segmentDistance=(a,b)=>{
    const vx=(b.x-a.x)*.72,vy=b.y-a.y,wx=(j.x-a.x)*.72,wy=j.y-a.y;
    const t=Math.max(0,Math.min(1,(vx*wx+vy*wy)/(vx*vx+vy*vy||1)));
    return Math.hypot(wx-t*vx,wy-t*vy);
  };
  const candidates=[goal];
  for(const radius of [24,40])for(let i=0;i<16;i++){
    const a=i*Math.PI/8,q={x:p.x+Math.cos(a)*radius/.72,y:p.y+Math.sin(a)*radius};
    if(q.x>-108&&q.x<108&&q.y>2&&q.y<706&&!obstacleAtPosition(q.x,q.y,PLAYER_COLLISION_RADIUS+1))candidates.push(q);
  }
  let best=null;
  for(const q of candidates){
    const path=planJoeRoute(p,q,PLAYER_COLLISION_RADIUS+1);
    if(!path.length)continue;
    let previous=p,min=Infinity,length=0;
    for(const point of path){min=Math.min(min,segmentDistance(previous,point));length+=worldDistance(previous,point);previous=point;}
    if(min<Math.min(15,dist-1))continue;
    const score=worldDistance(q,goal)+length*.22+Math.max(0,38-min)*7+Math.max(0,35-worldDistance(q,j))*4;
    if(!best||score<best.score)best={score,point:path.find(point=>worldDistance(p,point)>1.5)||q};
  }
  return best?.point||goal;
};
