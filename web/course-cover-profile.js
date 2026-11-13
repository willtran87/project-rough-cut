// Shared by the opaque cover meshes and the golf-flight sweep. Decorative
// leaves/stone chips do not enlarge the playable solid.
export const HEDGE_PROFILE = [[0,0],[1,0],[1,.3],[.97,1.45],[.88,1.88],[.6,2.06],[0,2.08]];
export const STONE_PROFILE = [[0,0],[1,0],[1,.25],[.98,.85],[.92,1.68],[.83,1.94],[0,1.94]];

export function courseCoverProfile(obstacle) {
  if (!obstacle.blocks || ['rest-bench','drain-solid'].includes(obstacle.kind)) return null;
  if (obstacle.tunnelWing || obstacle.asset === 'hedge-hide') return HEDGE_PROFILE;
  if (obstacle.id.includes('cart')) return null;
  if (obstacle.id.includes('pine')) return HEDGE_PROFILE;
  if (obstacle.lightRadius || /pond|board|sign/.test(obstacle.id) || obstacle.id.startsWith('shed-')) return null;
  return STONE_PROFILE;
}

export function coverRadiusAtHeight(profile, height) {
  if (height < 0 || height > profile[profile.length - 1][1]) return 0;
  for (let i = 2; i < profile.length; i++) {
    const [r0,h0] = profile[i - 1], [r1,h1] = profile[i];
    if (height <= h1) return h1 === h0 ? Math.max(r0,r1) : r0 + (r1-r0)*(height-h0)/(h1-h0);
  }
  return 0;
}

export function firstCourseCoverContact(start, end, power, obstacles, radius = .72) {
  const dx=(end.x-start.x)*.72, dy=end.y-start.y, height=t=>.055+Math.sin(t*Math.PI)*(1.4+power*1.6);
  let first=null;
  for (const obstacle of obstacles) {
    const profile=courseCoverProfile(obstacle);if(!profile)continue;
    const rx=obstacle.radiusX??obstacle.radius, ry=obstacle.radiusY??obstacle.radius;
    const ox=(start.x-obstacle.x)*.72, oy=start.y-obstacle.y;
    const ax=rx+radius, ay=ry+radius;
    const a=(dx/ax)**2+(dy/ay)**2, b=2*(ox*dx/(ax*ax)+oy*dy/(ay*ay)), c=(ox/ax)**2+(oy/ay)**2-1;
    if(a<1e-12)continue;
    const discriminant=b*b-4*a*c;if(discriminant<0)continue;
    const root=Math.sqrt(discriminant), entry=Math.max(0,(-b-root)/(2*a)), exit=Math.min(first?.t??1,(-b+root)/(2*a));
    if(entry>exit||exit<0||entry>1)continue;
    const inside=t=>{
      const h=Math.max(0,height(t)-radius*.16), fraction=coverRadiusAtHeight(profile,h);
      return fraction>0&&((ox+dx*t)/(rx*fraction+radius))**2+((oy+dy*t)/(ry*fraction+radius))**2<=1;
    };
    let previous=entry;
    for(let i=0;i<=48;i++){
      const t=entry+(exit-entry)*i/48;
      if(inside(t)){
        let lo=previous,hi=t;for(let j=0;j<24;j++){const mid=(lo+hi)/2;if(inside(mid))hi=mid;else lo=mid;}
        const hit=hi, x=start.x+(end.x-start.x)*hit, y=start.y+(end.y-start.y)*hit;
        let nx=(x-obstacle.x)*.72/(rx*rx), ny=(y-obstacle.y)/(ry*ry), length=Math.hypot(nx,ny);
        if(length<1e-8){length=Math.hypot(dx,dy)||1;nx=-dx;ny=-dy;}
        first={t:hit,x,y,height:height(hit),normal:{x:nx/length,y:ny/length},material:profile===HEDGE_PROFILE?'foliage':'stone',obstacle};break;
      }
      previous=t;
    }
  }
  return first;
}
