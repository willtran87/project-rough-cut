import {stationFacing} from './station-facing.js';

// Surface wear belongs to the existing approaches. Ground-colour modulation
// preserves the sand/mud/path underneath; nothing floats above the terrain.
export function approachWearSites(data,xScale,scale){
 return [...data.actions,data.key,data.valve,data.shed,data.drain].map((a,index)=>{
  const angle=index<5?stationFacing(a):0;
  return {x:a.x*xScale,z:-a.y*scale,angle,index,id:a.id||a.label||String(index)};
 });
}

export function* approachWearMarks(data,xScale,scale){
 for(const site of approachWearSites(data,xScale,scale)){
  const sn=Math.sin(site.angle),cs=Math.cos(site.angle);
  for(let i=0;i<9;i++){
   const reach=.8+i*.27,jitter=Math.sin(i*4.7+site.index)*.36;
   yield {x:site.x+reach*sn+jitter*cs,z:site.z+reach*cs-jitter*sn,
    w:.08+(i%3)*.03,d:.13+(i%2)*.03,angle:site.angle+(i%2?-.12:.18),seed:i+site.index*11};
  }
 }
}

// Evaluate a small worn patch on the ground atlas's integer pixel grid. A
// compacted centre, interrupted heel scrape and irregular edge grains give
// the marks structure without drawing a trail of conspicuous footprints.
export function approachWearFactor(localX,localZ,seed){
 const edge=1+.12*Math.sin(localZ*7+seed*1.7)+.09*Math.cos(localX*9-seed);
 const radius=Math.hypot(localX*.90,localZ);
 if(radius>edge)return 1;
 const side=Math.sin(localZ*8+localX*4+seed);
 if(radius>.73)return side>.3?1.075:side<-.35?.96:1;
 if(localZ>.16&&localZ<.43&&localX>-.68&&localX<.32)return .88;
 return radius<.52?1.12:1.035;
}

export function paintApproachWear(g,data,tx,ty,xScale,scale){
 const width=g.canvas.width,height=g.canvas.height;
 for(const m of approachWearMarks(data,xScale,scale)){
  const radius=Math.hypot(m.w,m.d)*1.26;
  const x0=Math.max(0,Math.floor(tx(m.x-radius))),y0=Math.max(0,Math.floor(ty(m.z-radius)));
  const x1=Math.min(width,Math.ceil(tx(m.x+radius))),y1=Math.min(height,Math.ceil(ty(m.z+radius)));
  if(x1<=x0||y1<=y0)continue;
  const patch=g.getImageData(x0,y0,x1-x0,y1-y0),sn=Math.sin(m.angle),cs=Math.cos(m.angle);
  const pixelsX=(tx(m.x+1)-tx(m.x)),pixelsZ=(ty(m.z+1)-ty(m.z));
  for(let y=0;y<patch.height;y++)for(let x=0;x<patch.width;x++){
   const dx=(x0+x+.5-tx(m.x))/pixelsX,dz=(y0+y+.5-ty(m.z))/pixelsZ;
   const factor=approachWearFactor((dx*cs-dz*sn)/m.w,(dx*sn+dz*cs)/m.d,m.seed);
   if(factor===1)continue;
   const i=(y*patch.width+x)*4;
   for(let c=0;c<3;c++)patch.data[i+c]=Math.min(255,Math.round(patch.data[i+c]*factor));
  }
  g.putImageData(patch,x0,y0);
 }
}
