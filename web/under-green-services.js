import {roofPanels} from './under-green-overhead.js';

const ROOF_UNDERSIDE=4.15,LAMP_TOP=3.075,ARM_HEIGHT=3.45;
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));

// Loose course balls collect against the real gallery boundary. A fixed
// x-offset leaves them underfoot where the corridor widens or Joe passes.
export function galleryBallPositions(floors,obstacles=[]){
 return Array.from({length:18},(_,i)=>{
  const y=12+i*3.3,spans=floors.filter(r=>Math.abs(y-r.y)<=r.d/2).map(r=>[r.x-r.w/2,r.x+r.w/2]).sort((a,b)=>a[0]-b[0]),joined=[];
  for(const span of spans){const last=joined.at(-1);if(last&&span[0]<=last[1])last[1]=Math.max(last[1],span[1]);else joined.push([...span]);}
  const span=joined.find(([lo,hi])=>lo<=0&&hi>=0);if(!span)throw Error('Gallery ball has no floor');
  const candidates=[{x:span[0]+.18,y},{x:span[1]-.18,y}];if(i%2===0)candidates.reverse();
  return candidates.find(p=>!obstacles.some(o=>Math.abs(p.x-o.x)<o.w/2+.06&&Math.abs(p.y-o.y)<o.d/2+.06));
 }).filter(Boolean);
}

// Use the constructed roof/wall union, including real roof apertures. Wide
// rooms cannot borrow the narrow gallery's imaginary wall at x = +/-3.
export function lampMount(lamp,layout){
 if(roofPanels(layout.tiles).some(t=>Math.abs(lamp.x-t.x)<=t.w/2&&Math.abs(lamp.y-t.y)<=t.d/2))
  return {kind:'ceiling',x:lamp.x,y:lamp.y,height:ROOF_UNDERSIDE};
 const anchors=layout.walls.map(w=>({x:clamp(lamp.x,w.x-w.w/2,w.x+w.w/2),y:clamp(lamp.y,w.y-w.d/2,w.y+w.d/2)}));
 anchors.sort((a,b)=>Math.hypot(a.x-lamp.x,a.y-lamp.y)-Math.hypot(b.x-lamp.x,b.y-lamp.y));
 if(!anchors.length)throw Error('Lamp has no structural anchor');
 return {kind:'wall',...anchors[0],height:ARM_HEIGHT};
}

export function createServiceSupports({layout,box,put,cyl,unit}){
 const lamps=[],signs=[];let arches=0,spine=0;
 const rod=(x,y,low,high,radius=.025)=>put(cyl,'iron',x,(low+high)/2,-y,radius,high-low,radius);
 const roofPlate=(x,y)=>box('steel',x,ROOF_UNDERSIDE-.035,-y,.25,.07,.23);
 function hang(x,y,top){
  const mount=lampMount({x,y},layout);
  if(mount.kind==='ceiling')roofPlate(x,y);
  else{
   const dx=x-mount.x,dy=y-mount.y,length=Math.hypot(dx,dy);
   box('steel',mount.x,ARM_HEIGHT,-mount.y,.23,.35,.23);
   put(unit,'iron',(mount.x+x)/2,ARM_HEIGHT,-(mount.y+y)/2,length+.04,.11,.11,0,Math.atan2(dy,dx));
   // A short vertical seat anchors the arm into the retaining wall.
   rod(mount.x,mount.y,ARM_HEIGHT-.28,ARM_HEIGHT,.045);
  }
  rod(x,y,top-.035,mount.height);
  box('steel',x,top-.015,-y,.19,.08,.19);
  return mount;
 }
 function lamp(x,y){
  // Gallery lamps sit directly below their pipe. Attach to that pipe rather
  // than sending a ceiling stem through it (and through the crossing above).
  const gallery=Math.abs(Math.abs(x)-2.6)<.001&&y>=8&&y<=72&&Math.abs(y/8-Math.round(y/8))<1e-6;
  if(gallery){
   const spineSide=x<0,anchorX=spineSide?-2.65:x,height=spineSide?3.25:2.95+.35*Math.sqrt(9-x*x);
   box('iron',anchorX,height,-y,spineSide?.32:.18,spineSide?.29:.11,.18);
   rod(x,y,LAMP_TOP-.035,height-(spineSide?.12:.028)+.02);
   lamps.push({x,y,mount:{kind:spineSide?'spine':'cross-feed',x:anchorX,y,height}});
  }else lamps.push({x,y,mount:hang(x,y,LAMP_TOP)});
 }
 function sign(x,y,yaw,scale,centre=3.05){
  const anchors=[],top=centre+.4*scale;
  for(const side of [-1,1]){
   const px=x+side*scale*Math.cos(yaw),py=y+side*scale*Math.sin(yaw);
   if(Math.abs(py/8-Math.round(py/8))<1e-6&&py>=8&&py<=72&&Math.abs(px)<2.8){
    const height=2.95+.35*Math.sqrt(9-px*px);
    rod(px,py,top,height-.02);box('iron',px,height,-py,.14,.08,.2);
    anchors.push({kind:'cross-feed',x:px,y:py,height});
   }else anchors.push(hang(px,py,top));
  }
  signs.push({x,y,yaw,scale,anchors});
 }
 function arch(y){
  arches++;
  for(const x of [-1.8,1.8]){
   const height=2.95+.35*Math.sqrt(9-x*x);
   box('iron',x,height,-y,.18,.11,.23);rod(x,y,height+.035,ROOF_UNDERSIDE);roofPlate(x,y);
  }
  // Join the cross-feed to the longitudinal pipe instead of leaving an air gap.
  const x=-2.65,high=2.95+.35*Math.sqrt(9-x*x);
  rod(x,y,3.25,high,.09);put(cyl,'iron',x,3.3,-y,.135,.07,.135);
 }
 function pipe(x,y){spine++;rod(x,y,3.25,ROOF_UNDERSIDE);roofPlate(x,y);}
 return {lamp,sign,arch,pipe,stats:()=>({lamps:lamps.map(l=>({...l})),signs:signs.map(s=>({...s})),arches,spine})};
}
