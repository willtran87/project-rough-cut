// Read-only presentation policy. Never changes Joe's navigation or perception.
export function ghostSchedulingPolicy(h,player,protectedInteraction){
 const d=h.tensionDirector,distance=Math.hypot((h.joe.x-player.x)*.72,h.joe.y-player.y);
 const danger=h.joe.mode==='chase'||distance<45||h.detection>.35||(h.hasLineOfSight&&distance<95)||
   ((h.joe.mode==='search'||h.joe.mode==='investigate'||d.encounterActive)&&
     (distance<95||h.hasLineOfSight||h.detection>.12));
 const first=h.engagement?.experience?.firstImpression;
 const firstBeat=first?.workRemaining>0||first?.anomaly==='rising';
 const zoneBeat=!!h.zoneSetPiece?.active;
 const protectedNow=zoneBeat||!!protectedInteraction||h.elapsed<8||d.reliefSeconds>0||danger||firstBeat;
 return {blocked:protectedNow,reason:protectedInteraction?'interaction':h.elapsed<8?'opening':d.reliefSeconds>0?'recovery':danger?'real_joe':firstBeat?'first_impression':zoneBeat?'zone_event':null,
   deferred:!!(d.accentCooldown>0||d.pendingIntercept||d.silentStalk||d.coverAudit||d.encounterActive||h.distraction?.kind==='patrol_reposition')};
}
