import * as THREE from './vendor/three/three.module.js';
import {routeDistanceXY} from './back-nine-landscape.js';

const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const tint=hex=>new THREE.Color(hex).toArray().map(v=>v**.65);
const grass=tint(0x455b43),soil=tint(0x786c52),print=tint(0x65614e);
export const BUNKER_BANK_SEGMENTS=96;
export function bunkerBankRadius(angle,seed){return 1+.025*Math.sin(angle*3+seed)+.014*Math.sin(angle*5-seed)+.006*Math.sin(angle*13+seed*.3)+.004*Math.sin(angle*19-seed*.7);}
export function bunkerBankHeight(radius,clearance,angle=0){
 const rise=smooth(.90,1.025,radius)*(1-smooth(1.025,1.14,radius));
 return rise*(.13+.018*Math.sin(angle*7)**2)*smooth(3.35,4.25,clearance);
}

// Narrow, world-attached material bands replace the opaque green ring and
// dark sand outline. The opaque centre retains efficient depth rejection.
export function buildBunkerBanks(s,paths){
 const parts=[],n=BUNKER_BANK_SEGMENTS;
 function point(radius,angle){const q=radius*bunkerBankRadius(angle,s.y),x=s.x+Math.cos(angle)*q*s.rx,y=s.y+Math.sin(angle)*q*s.ry,clearance=routeDistanceXY(x,y,paths);return{x,y,clearance,height:.028+bunkerBankHeight(radius,clearance,angle)};}
 function layer(type,role,rings,rgba){
  const positions=[],uv=[],colors=[],indices=[];
  for(const [radius,alpha]of rings)for(let i=0;i<=n;i++){
   const angle=i/n*Math.PI*2,p=point(radius,angle),damp=.5+.5*Math.sin(angle*3+s.y*.07),sand=type==='sand'||type==='sandMargin';
   const shade=sand?1-.23*smooth(.68,1.04,radius)*(.6+.4*damp):1;
   const color=sand?[shade,shade*.99,shade*.94]:type==='turfMargin'?grass:soil;
   positions.push(p.x,p.height+(type==='soilMargin'?.001:type==='sandMargin'?.002:0),-p.y);uv.push(p.x/4.4,-p.y/4.4);colors.push(...color);
   if(rgba){const irregular=type==='soilMargin'?.62+.38*Math.sin(angle*11+s.y)**2:1;colors.push(alpha*irregular*(sand?1:smooth(3.35,4.05,p.clearance)));}
  }
  for(let row=0;row<rings.length-1;row++)for(let i=0;i<n;i++){
   const a=row*(n+1)+i,b=a+n+1;
   if(rings[row][0]===0)indices.push(a,b,b+1);else indices.push(a,b,a+1,a+1,b,b+1);
  }
  const g=new THREE.BufferGeometry();g.userData.bunkerSurface=true;g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,rgba?4:3));g.setIndex(indices);g.computeVertexNormals();parts.push({geometry:g,type,role});
 }
 layer('sand','core',[[0,1],[.68,1],[.86,1]],false);
 layer('turfMargin','grass-bank',[[.90,0],[.97,.78],[1.025,1],[1.08,.8],[1.14,0]],true);
 layer('soilMargin','exposed-bank',[[.92,0],[.985,.7],[1.035,.68],[1.095,0]],true);
 layer('sandMargin','sand-shoulder',[[.86,1],[.93,1],[.985,.88],[1.025,.42],[1.075,0]],true);

 // One restrained entry trail per bunker. A heel/sole depression and its
 // softer rim sit on the sand; road/water behavior remains authoritative.
 const entry=-2.05+(s.y%3)*.16,steps=[];
 for(let step=0;step<8;step++){
  const radius=.98-step*.043,angle=entry+(step%2?1:-1)*.012,p=point(radius,angle);
  if(p.clearance<3.7)continue;
  const heading=Math.atan2(-Math.cos(angle)*s.rx,-Math.sin(angle)*s.ry),sin=Math.sin(heading),cos=Math.cos(heading);
  const outline=[[-.08,-.15],[.07,-.15],[.10,-.04],[.085,.12],[.04,.18],[-.055,.17],[-.10,.06],[-.10,-.06]];
  const positions=[p.x,p.height+.004,-p.y],uv=[0,0],colors=[...print,.38],indices=[];
  for(const scale of [.75,1.18])for(const [across,along]of outline){const x=p.x+across*scale*cos+along*scale*sin,y=p.y-across*scale*sin+along*scale*cos;positions.push(x,p.height+.004,-y);uv.push(x/4,-y/4);colors.push(...print,scale<1?.32:0);}
  for(let i=0;i<8;i++){const a=1+i,b=1+(i+1)%8;indices.push(0,a,b,a,a+8,b,b,a+8,b+8);}
  // Sole winding depends on the local x/z convention; keep all faces upward.
  for(let i=0;i<indices.length;i+=3){const [a,b,c]=indices.slice(i,i+3).map(v=>v*3);if((positions[b+2]-positions[a+2])*(positions[c]-positions[a])-(positions[b]-positions[a])*(positions[c+2]-positions[a+2])<0)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];}
  // Share the shoulder batch so the marks draw after its translucent sand,
  // rather than disappearing underneath that layer with the exposed soil.
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();parts.push({geometry:g,type:'sandMargin',role:'footprint'});steps.push({x:p.x,y:p.y});
 }
 // Broad hand-raked fans differ by bunker, broken where the entry trail
 // interrupts them. Thin low-contrast troughs follow the shared sand plane.
 const rakePositions=[],rakeUV=[],rakeColors=[],rakeIndices=[];
 const heading=(s.y*.013)%Math.PI,cos=Math.cos(heading),sin=Math.sin(heading);
 let rakeStrokes=0;
 for(let line=0;line<13;line++){
  const across=(line-6)*.25,offset=(s.y%7)*.09;
  for(let seg=0;seg<12;seg++){
   const t0=-.62+seg*.105,t1=t0+.098,coords=[];
   for(const t of [t0,t1])for(const side of [-1,1]){
    const along=t*Math.min(s.rx,s.ry),bow=across+.24*t*t+offset+side*.012;
    coords.push({x:s.x+along*cos-bow*sin,y:s.y+along*sin+bow*cos});
   }
   if(coords.some(p=>((p.x-s.x)/s.rx)**2+((p.y-s.y)/s.ry)**2>.68**2||routeDistanceXY(p.x,p.y,paths)<3.4))continue;
   if(seg===3+(line+s.y)%4&&line>7)continue;
   const base=rakePositions.length/3;
   for(const p of coords){rakePositions.push(p.x,.0295,-p.y);rakeUV.push(p.x/.7,-p.y/.7);rakeColors.push(.58,.55,.45,.15);}
   // The first pair is the left end of the stroke in its own basis.
   rakeIndices.push(base,base+2,base+1,base+1,base+2,base+3);rakeStrokes++;
  }
 }
 const rake=new THREE.BufferGeometry();rake.userData.bunkerSurface=true;rake.setAttribute('position',new THREE.Float32BufferAttribute(rakePositions,3));rake.setAttribute('uv',new THREE.Float32BufferAttribute(rakeUV,2));rake.setAttribute('color',new THREE.Float32BufferAttribute(rakeColors,4));rake.setIndex(rakeIndices);rake.computeVertexNormals();parts.push({geometry:rake,type:'sandMargin',role:'raking'});
 return {parts,stats:{x:s.x,y:s.y,layers:4,footprints:steps.length,entryTrail:steps,rakeStrokes,rakeHeading:heading}};
}
