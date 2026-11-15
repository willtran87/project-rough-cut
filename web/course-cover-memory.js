const distance=(a,b)=>Math.hypot((a.x-b.x)*.72,a.y-b.y);
export function observeCoverMemory(memory,source,obstacles,time){
  if(!source||!['sight','sound','trail'].includes(source.kind)||
    !Number.isFinite(source.time)||time<source.time||time-source.time>8||
    !Number.isFinite(source.point?.x)||!Number.isFinite(source.point?.y))return;
  if(source.time<=(memory.coverEvidenceTime??-Infinity))return;
  memory.coverEvidenceTime=source.time;
  const obstacle=obstacles.filter(o=>o.blocks&&o.sight&&o.coverRadius&&distance(o,source.point)<=o.coverRadius)
    .sort((a,b)=>distance(a,source.point)-distance(b,source.point))[0];
  if(!obstacle){memory.observedShelter=null;return;}
  const id=`cover:${obstacle.id}`,previous=memory.observedShelter,same=previous?.id===id&&source.time-previous.time<=20;
  memory.observedShelter={id,label:obstacle.landmark||'cover',type:'hard_cover',x:obstacle.x,y:obstacle.y,
    since:same?previous.since:source.time,time:source.time,kind:source.kind,point:{...source.point},
    visits:same?previous.visits+Number(source.time-previous.time>3):1};
}
export function knownCover(memory,time){
  const known=memory.observedShelter;
  return known&&time>=known.time&&time-known.time<=20?known:null;
}
