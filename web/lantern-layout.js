// World-meter arc lengths keep pairs evenly spaced through authored path bends.
export function lanternPairs(route,{spacing=5.6,offset=1.25,start=2,clear=()=>true,adjustments=[0]}={}){
  const segments=[];let length=0;
  for(let i=1;i<route.length;i++){
    const a=route[i-1],b=route[i],n=Math.hypot(b.x-a.x,b.z-a.z);
    if(n>1e-6){segments.push({a,b,n,start:length});length+=n;}
  }
  const sample=d=>{const s=segments.find(s=>d<=s.start+s.n)||segments.at(-1),t=Math.max(0,Math.min(1,(d-s.start)/s.n));return {x:s.a.x+(s.b.x-s.a.x)*t,z:s.a.z+(s.b.z-s.a.z)*t};};
  const pairs=[];
  for(let target=start;target<length-1;target+=spacing)for(const shift of adjustments){
    const distance=target+shift;
    if(distance<1||distance>length-1||pairs.length&&distance-pairs.at(-1).distance<spacing*.7)continue;
    const center=sample(distance),a=sample(distance-.6),b=sample(distance+.6),n=Math.hypot(b.x-a.x,b.z-a.z);
    if(n<1e-6)continue;
    const nx=(b.z-a.z)/n,nz=-(b.x-a.x)/n;
    const lamps=[-1,1].map(side=>({x:center.x+nx*offset*side,z:center.z+nz*offset*side}));
    if(lamps.every(clear)){pairs.push({distance,center,lamps});break;}
  }
  return pairs;
}
export const lanternPhase=(x,z)=>x*2.17+z*.73;
// Sparse pairs mark the route with dark stretches between them.
// Shared branches reuse nearby junction lamps. A finite budget
// is distributed round-robin so later paths are not starved by the opening.
export function courseLanternPairs(routes,{clear=()=>true,maxPairs=14}={}){
  const candidates=routes.map((route,index)=>lanternPairs(route,{spacing:index===0?10:12,start:index===0?2:3.1,clear,adjustments:index===0?[0]:[0,-.85,.85,-1.7,1.7]}).map(pair=>({...pair,route:index})));
  const pairs=[];
  for(let row=0;row<Math.max(0,...candidates.map(c=>c.length));row++)for(const choices of candidates){
    const pair=choices[row];if(!pair||pairs.length>=maxPairs)continue;
    if(pairs.some(other=>Math.hypot(pair.center.x-other.center.x,pair.center.z-other.center.z)<6.5||pair.lamps.some(a=>other.lamps.some(b=>Math.hypot(a.x-b.x,a.z-b.z)<2.2))))continue;
    pairs.push(pair);
  }
  return pairs;
}
export function lanternFlicker(time,phase,steady=false){
  return steady?1:.86+.08*Math.sin(time*3.7+phase)+.04*Math.sin(time*8.1+phase*1.7)+.02*Math.sin(time*13.3+phase*.6);
}
// Applied in the vertex shader to the existing batched glass, not a new flame draw.
export const lanternFlickerGLSL=`float lanternFlame(float t,float p){return .86+.08*sin(t*3.7+p)+.04*sin(t*8.1+p*1.7)+.02*sin(t*13.3+p*.6);}`;
