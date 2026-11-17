// Night Order puts the course's path lanterns out a row at a time: each
// completed field check kills another share of them, so the way to the exit
// is the darkest part of the night. Which lanterns go is fixed per course
// (a hash of position), and a dying lantern gutters before it goes out.
export const LANTERN_BLACKOUT={perLevel:.26,max:.78,gutter:1.6,radius:.6,slots:32};
const rank=(x,z)=>{const a=Math.sin(x*12.9898+z*78.233)*43758.5453;return a-Math.floor(a);};
/**
 * @param sites  path lantern positions in scene metres ({x,z})
 * @param state  {level, since} from the game: completed checks, seconds since the last
 * @returns brightness per site, 1 lit to 0 out
 */
export function lanternBlackout(sites,state,time=0,steady=false){
 const level=Math.max(0,Math.min(3,state?.level|0)),since=Number.isFinite(state?.since)?state.since:1e9;
 const order=sites.map((s,i)=>({i,r:rank(s.x,s.z)})).sort((a,b)=>a.r-b.r),out=new Array(sites.length).fill(1);
 const share=k=>Math.round(sites.length*Math.min(LANTERN_BLACKOUT.max,k*LANTERN_BLACKOUT.perLevel));
 const before=share(level-1),now=share(level);
 order.forEach(({i},n)=>{
  if(n<before)out[i]=0;
  else if(n<now){
   // Gutter: a few hard flickers, then nothing.
   const t=since/LANTERN_BLACKOUT.gutter;
   out[i]=t>=1?0:steady?1-t:(1-t)*(.35+.65*Math.max(0,Math.sin(time*31+i*2.7)>0?1:.15));
  }
 });
 return out;
}
/** Brightness for a point near a lantern site, or 1 when it is no lantern's. */
export function siteBrightness(sites,levels,x,z){
 let best=-1,bestD=LANTERN_BLACKOUT.radius;
 for(let i=0;i<sites.length;i++){const d=Math.hypot(sites[i].x-x,sites[i].z-z);if(d<bestD){bestD=d;best=i;}}
 return best<0?1:levels[best];
}
