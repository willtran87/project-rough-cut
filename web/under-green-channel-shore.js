// Channel water settles onto the catch banks rather than ending in a raised
// rectangular sheet. Shared by rendering and physical presentation contacts;
// this does not alter the hazard footprint, timing or movement simulation.
export const CHANNEL_TOE_HEIGHT=.0018;
const clamp=v=>Math.max(0,Math.min(1,v));
export function channelShoreProfile(w,x,side){
 const phase=w.x*.19+w.y*.13+side*1.7;
 // Unequal pockets expose saturated sediment between the water and grate.
 // Keep the inset shallow: the catch bank remains the hazard threshold.
 const pocket=.5+.5*Math.sin(x*1.17+phase*.83);
 const inset=.035+.11*pocket*pocket;
 return {inset,insetDerivative:.1287*pocket*Math.cos(x*1.17+phase*.83),width:.27+.075*Math.sin(x*1.3+phase)+.035*Math.sin(x*2.1-phase),
  derivative:.0975*Math.cos(x*1.3+phase)+.0735*Math.cos(x*2.1-phase)};
}
export function channelShoreSample(w,x,y){
 const side=y<0?-1:1,{width,derivative,inset,insetDerivative}=channelShoreProfile(w,x,side);
 const distance=(w.depth-.4)/2-inset-Math.abs(y),t=clamp(distance/width),weight=t*t*(3-2*t);
 const slope=t>0&&t<1?6*t*(1-t):0;
 return {weight,width,distance,normalX:slope*(insetDerivative+t*derivative)/width,normalZ:-side*slope/width};
}
export function channelHasSurface(w,x,y){
 const distance=(w.depth-.4)/2-Math.abs(y);
 // Most contacts are well inside the sheet; only the narrow contour band
 // needs its profile evaluated. Keep a 2 mm margin for the triangulated edge.
 return distance>.147||(distance>0&&channelShoreSample(w,x,y).distance>.002);
}
export function channelSurfaceHeight(w,x,y,level){
 // Most spray samples are on the unchanged central sheet. The widest shore
 // plus the recessed edge occupies less than .53 m; avoid evaluating its profile for those interior contacts.
 if((w.depth-.4)/2-Math.abs(y)>=.53)return .025+level*.08;
 return CHANNEL_TOE_HEIGHT+(.025+level*.08-CHANNEL_TOE_HEIGHT)*channelShoreSample(w,x,y).weight;
}
export function channelShoreMeshData(w){
 const positions=[],uv=[],weights=[],distances=[],gradients=[],indices=[];
 const across=32,steps=8,rows=steps*2+3,half=(w.depth-.4)/2;
 for(let col=0;col<=across;col++){
  const x=-w.width/2+w.width*col/across,near=channelShoreProfile(w,x,-1),far=channelShoreProfile(w,x,1);
  const along=[];
  for(let i=0;i<=steps;i++)along.push(-half+near.inset+near.width*i/steps);
  along.push(0);
  for(let i=steps;i>=0;i--)along.push(half-far.inset-far.width*i/steps);
  for(const y of along){const s=channelShoreSample(w,x,y);positions.push(x,0,-y);uv.push(x/w.width+.5,y/(w.depth-.4)+.5);weights.push(s.weight);distances.push(Math.max(0,s.distance));gradients.push(s.normalX,s.normalZ);}
 }
 for(let c=0;c<across;c++)for(let r=0;r<rows-1;r++){const a=c*rows+r,b=a+rows;indices.push(a,b,a+1,b,b+1,a+1);}
 return {positions,uv,weights,distances,gradients,indices,across,rows};
}
