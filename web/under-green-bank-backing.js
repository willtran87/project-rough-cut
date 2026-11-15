import * as THREE from './vendor/three/three.module.js';

// Only cut the corridor-facing plane of original boxes, where a complete
// closed bank face sits strictly in front of it. Keep the original back,
// ends, caps and all vertices (hence conservative lighting/culling bounds).
// A 2cm overlap around all seams avoids exposed raster edge samples.
export function trimCoveredBankBacking(geometry,edges){
 const attributes=Object.entries(geometry.attributes),values=attributes.map(([,a])=>Array.from(a.array));
 const position=attributes.findIndex(([name])=>name==='position');
 const p=geometry.attributes.position,n=geometry.attributes.normal,source=geometry.index.array,indices=[];
 let removed=0,added=0;
 const vertex=i=>({index:i,data:attributes.map(([,a])=>Array.from(a.array.slice(i*a.itemSize,(i+1)*a.itemSize)))});
 const vertical=v=>v.data[position][1];
 const clip=(polygon,height,below,coordinate=vertical)=>{
  const result=[];
  for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length],ah=coordinate(a),bh=coordinate(b);
   const inside=below?ah<=height:ah>=height,next=below?bh<=height:bh>=height;
   if(inside)result.push(a);
   if(inside!==next){const t=(height-ah)/(bh-ah);result.push({index:null,data:a.data.map((v,k)=>v.map((x,j)=>x+(b.data[k][j]-x)*t))});}
  }
  return result;
 };
 const append=polygon=>{
  if(polygon.length<3)return;
  const ids=polygon.map(v=>{
   if(v.index!==null)return v.index;
   const index=values[position].length/3;v.data.forEach((a,i)=>values[i].push(...a));v.index=index;return index;
  });
  for(let i=1;i<ids.length-1;i++){indices.push(ids[0],ids[i],ids[i+1]);added++;}
 };
 for(let i=0;i<source.length;i+=3){
  const triangle=[source[i],source[i+1],source[i+2]];
  const covered=edges.find(edge=>{
   const inward=-edge.side,west=edge.axis==='x'&&edge.line===-32,base=west?.009:.113,back=west?-.025:.08;
   return triangle.every(k=>{
    const along=edge.axis==='x'?-p.getZ(k):p.getX(k),depth=((edge.axis==='x'?p.getX(k):-p.getZ(k))-edge.line)*inward;
    const facing=(edge.axis==='x'?n.getX(k):-n.getZ(k))*inward;
    return facing>.999&&depth>back+.001&&depth<base-.001&&along>=edge.start-.00001&&along<=edge.end+.00001;
   });
  });
  const low=Math.min(...triangle.map(k=>p.getY(k))),high=Math.max(...triangle.map(k=>p.getY(k)));
  if(!covered||high<=1.90||low>=4.88){indices.push(...triangle);continue;}
  let polygon=triangle.map(vertex);
  const along=v=>covered.axis==='x'?-v.data[position][2]:v.data[position][0];
  // Keep four disjoint outside strips; only the enclosed middle is discarded.
  for(const [coordinate,bound,below]of [[along,covered.start+.02,true],[along,covered.end-.02,false],[vertical,1.90,true],[vertical,4.88,false]]){
   append(clip(polygon,bound,below,coordinate));polygon=clip(polygon,bound,!below,coordinate);
  }
  removed++;
 }
 if(removed){
  for(let i=0;i<attributes.length;i++){const [name,a]=attributes[i];geometry.setAttribute(name,new THREE.BufferAttribute(new a.array.constructor(values[i]),a.itemSize,a.normalized));}
  geometry.setIndex(indices);
 }
 return {removed,added};
}

export function trimBunkerBacking(batches,faces){
 const edges=faces.parts.filter(p=>p.layer===0),stats={parts:0,removedTriangles:0,addedTriangles:0};
 for(const batch of batches.values())for(const part of batch.parts)if(part.userData.drainBankBackingBox){
  const result=trimCoveredBankBacking(part,edges);
  if(result.removed){stats.parts++;stats.removedTriangles+=result.removed;stats.addedTriangles+=result.added;}
 }
 return stats;
}
