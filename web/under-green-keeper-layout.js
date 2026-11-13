import {rangeY} from './under-green-layout.js';

// Furniture lives in closed wall recesses, behind the existing inner face.
// Their solid lower faces make them clearly furnished bays, never doorways.
// Navigation and the keeper gate retain the original floor footprint.
export const KEEPER_NICHES=Object.freeze([
 {id:'keeper-desk',axis:'y',boundary:rangeY(-3),side:1,along:11.65,width:4.3,bottom:1.0,top:3.10,depth:.78},
 {id:'keeper-boot-rack',axis:'x',boundary:7,side:1,along:14.1,width:2.15,bottom:.46,top:1.40,depth:.43},
]);

export function keeperWallPieces(w,height){
 const niche=KEEPER_NICHES.find(n=>Math.abs(w[n.axis]-n.boundary)<.001&&Math.abs((n.axis==='x'?w.w:w.d)-.22)<.001&&Math.abs(w[n.axis==='x'?'y':'x']-n.along)<(n.width+(n.axis==='x'?w.d:w.w))/2);
 if(!niche)return [{...w,base:0,height}];
 const along=niche.axis==='x'?'y':'x',length=niche.axis==='x'?w.d:w.w,start=w[along]-length/2,end=w[along]+length/2;
 const left=Math.max(start,niche.along-niche.width/2),right=Math.min(end,niche.along+niche.width/2),parts=[];
 function part(a,b,base,top){if(b-a<.00001||top-base<.00001)return;parts.push({...w,[along]:(a+b)/2,[niche.axis==='x'?'d':'w']:b-a,base,height:top-base});}
 part(start,left,0,height);part(right,end,0,height);part(left,right,0,niche.bottom);part(left,right,niche.top,height);
 return parts;
}

export function nichePoint(n,u,height,depth){return n.axis==='x'?{x:n.boundary+n.side*depth,height,y:n.along+u}:{x:n.along+u,height,y:n.boundary+n.side*depth};}
