// Static course only. Moving vehicles and the abandoned cart keep their own
// collision checks. Conservative longitudinal buckets narrow the candidates;
// the original strict circle/box tests still decide whether a point is blocked.
export function createCourseObstacleIndex(obstacles,boxesOnly=false){
 const buckets=new Map(),size=16;
 for(const o of obstacles){const r=boxesOnly||o.box?o.ry:o.r;
  for(let cell=Math.floor((o.y-r-.000001)/size);cell<=Math.floor((o.y+r+.000001)/size);cell++){
   if(!buckets.has(cell))buckets.set(cell,[]);buckets.get(cell).push(o);
  }
 }
 return {blocked(p,r){
  for(let cell=Math.floor((p.y-r)/size),end=Math.floor((p.y+r)/size);cell<=end;cell++){
   const candidates=buckets.get(cell);if(!candidates)continue;
   for(const o of candidates){
    if(boxesOnly||o.box){if(Math.abs(p.x-o.x)<o.rx+r&&Math.abs(p.y-o.y)<o.ry+r)return true;}
    else if(Math.hypot(p.x-o.x,p.y-o.y)<o.r+r)return true;
   }
  }
  return false;
 }};
}
