import * as THREE from './vendor/three/three.module.js';
import {STONE_PROFILE,coverRadiusAtHeight} from './course-cover-profile.js';
import {stoneFinishUV} from './course-stone-finish.js';

// A thin constructed skin follows the existing 32-sided cover volume. Its
// mortar is the original opaque body; neither the collider nor occluder changes.
export function createStoneCourses(rx,rz,seed=0){
 // Retain eight angular sectors per palette for the software visibility pass.
 // The normal material batches still merge these into the same draw calls.
 const buckets=Array.from({length:24},()=>({positions:[],indices:[],uvs:[]}));
 const noise=n=>{const x=Math.sin(n*127.1+seed*.73+311.7)*43758.5453;return x-Math.floor(x);};
 const perimeter=Math.PI*(3*(rx+rz)-Math.sqrt((3*rx+rz)*(rx+3*rz)));
 // Parameterize by arc length so oval ends do not acquire tiny vertical bricks.
 const samples=256,arc=[0];
 for(let i=1;i<=samples;i++){const a=(i-.5)/samples*Math.PI*2;arc.push(arc.at(-1)+Math.hypot(rx*Math.sin(a),rz*Math.cos(a))*Math.PI*2/samples);}
 const total=arc.at(-1),angle=d=>{d=((d%total)+total)%total;let lo=0,hi=samples;while(hi-lo>1){const m=(lo+hi)>>1;if(arc[m]<=d)lo=m;else hi=m;}return (lo+(d-arc[lo])/(arc[hi]-arc[lo]))/samples*Math.PI*2;};
 const point=(a,y,offset)=>{
  // Lathe vertices lie at multiples of 2π/32; meet its chords, not an ideal
  // ellipse outside them. This prevents the mortar bulging through the faces.
  const step=Math.PI/16,mid=(Math.floor(a/step)+.5)*step;
  const radius=coverRadiusAtHeight(STONE_PROFILE,Math.min(1.94,Math.max(0,y)))*Math.cos(step/2)/Math.cos(a-mid);
  return [Math.cos(a)*(rx*radius+offset),y,Math.sin(a)*(rz*radius+offset)];
 };
 let stones=0;
 for(let row=0;row<5;row++){
  const count=Math.max(12,Math.round(perimeter/(row===4?.65:.67))),width=total/count;
  const offset=(row%2)*width*.47+noise(row+51)*width*.22;
  const heights=[.025,.407,.789,1.171,1.553,1.958],bottom=heights[row]+.010,top=heights[row+1]-.010;
  for(let i=0;i<count;i++){
   const start=offset+i*width+(noise(row*193+i)-.5)*width*.15;
   const end=offset+(i+1)*width+(noise(row*193+(i+1)%count)-.5)*width*.15;
   let a0=angle(start+.013),a1=angle(end-.013);if(a1<=a0)a1+=Math.PI*2;
   const chamfer=.025+.015*noise(i+row*113),da=(a1-a0)*chamfer/(end-start),dy=chamfer;
   const outline=[[a0+da,bottom],[a1-da,bottom],[a1,bottom+dy],[a1,top-dy],[a1-da,top],[a0+da,top],[a0,top-dy],[a0,bottom+dy]];
   const ac=(a0+a1)/2,yc=(bottom+top)/2,sector=Math.floor(ac/(Math.PI/4))%8;
   const bucket=buckets[sector*3+Math.floor(noise(i+row*23+100)*3)],positions=bucket.positions,indices=bucket.indices;
   const variant=Math.floor(noise(i+row*73+431)*8);
   const add=(a,y,offset)=>{const n=positions.length/3;positions.push(...point(a,y,offset));bucket.uvs.push(...stoneFinishUV(row,variant,(a-a0)/(a1-a0),(y-bottom)/(top-bottom)));return n;};
   const face=outline.map(([a,y])=>add(ac+(a-ac)*.93,yc+(y-yc)*.88,.033));
   const edge=outline.map(([a,y])=>add(a,y,.006)),back=outline.map(([a,y])=>add(a,y,row===4?-.19:-.022));
   const center=add(ac,yc,.033),rear=add(ac,yc,row===4?-.19:-.022);
   for(let j=0;j<8;j++){
    const k=(j+1)%8;
    // Increasing angle then height winds outward in the x/y/z convention.
    indices.push(center,face[k],face[j],face[j],face[k],edge[k],face[j],edge[k],edge[j],edge[j],edge[k],back[k],edge[j],back[k],back[j],rear,back[j],back[k]);
   }
   stones++;
  }
 }
 const parts=buckets.flatMap(({positions,indices,uvs},i)=>{if(!positions.length)return [];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return [{geometry:g,palette:i%3}];});
 return {parts,stones};
}
