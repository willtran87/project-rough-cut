import * as THREE from './vendor/three/three.module.js';
import {GALLERY_RENDER_PATCHES,renderContour} from './under-green-gallery-render.js';
import {galleryWallFinishHeight} from './under-green-gallery-roof.js';

const repair=GALLERY_RENDER_PATCHES.find(p=>p.id==='east-drain-repair');
export const isGalleryRepairWall=p=>p.x===repair.boundary&&p.w===.22&&p.y-p.d/2<19.8&&p.y+p.d/2>16.4;
const point=([u,h])=>[u,galleryWallFinishHeight(h)];
const outer=renderContour(repair.points,repair.seed).map(point);
const path=(points,Type=THREE.Path)=>{const s=new Type();points.forEach(([u,h],i)=>i?s.lineTo(u,h):s.moveTo(u,h));s.closePath();return s;};
// The outer wall rectangle spans every affected partition. Clip its triangles
// back to each original piece below; a hole must never cross an Earcut outline.
const shape=path([[16,0],[20.5,0],[20.5,4.2],[16,4.2]],THREE.Shape);
shape.holes.push(path(outer));
const face=new THREE.ShapeGeometry(shape);
const islands=[];
for(const [u,h,rx,ry]of repair.holes){
 const points=[];
 // Keep a brick overlap behind each visible plaster window, including bevel.
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.79+.13*Math.sin(i*2.3+repair.seed)+.08*Math.cos(i*3.1);points.push(point([u+Math.cos(a)*(rx+.055)*r,h+Math.sin(a)*(ry+.055)*r]));}
 islands.push(new THREE.ShapeGeometry(path(points,THREE.Shape)));
}
const sourceTriangles=[];
for(const g of [face,...islands]){
 const p=g.attributes.position,ix=g.index;
 for(let i=0;i<ix.count;i+=3)sourceTriangles.push([0,1,2].map(j=>[p.getX(ix.getX(i+j)),p.getY(ix.getX(i+j))]));
 g.dispose();
}
// A 55mm brick ribbon overlaps both sides of the chipped perimeter. This
// protects oblique sightlines and the shallow bevel without shading its center.
for(let i=0;i<outer.length;i++){
 const a=outer[i],b=outer[(i+1)%outer.length],dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1,w=.055;
 const p=[a[0]-dy/n*w,a[1]+dx/n*w],q=[b[0]-dy/n*w,b[1]+dx/n*w],r=[b[0]+dy/n*w,b[1]-dx/n*w],s=[a[0]+dy/n*w,a[1]-dx/n*w];
 sourceTriangles.push([p,q,r],[p,r,s]);
 // Round joins close the small wedges where adjacent offset ribbons turn.
 for(let k=0;k<8;k++){const at=k*Math.PI/4,bt=(k+1)*Math.PI/4;sourceTriangles.push([a,[a[0]+Math.cos(at)*w,a[1]+Math.sin(at)*w],[a[0]+Math.cos(bt)*w,a[1]+Math.sin(bt)*w]]);}
}

function clip(poly,axis,boundary,sign){
 const out=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-boundary)*sign,db=(b[axis]-boundary)*sign;
  if(da>=0)out.push(a);
  if((da>0&&db<0)||(da<0&&db>0)){const t=da/(da-db);out.push(a.map((v,j)=>v+(b[j]-v)*t));}
 }
 return out;
}

// Receives the original BoxGeometry after its one world transform. Preserve
// every other face byte-for-byte. Caller retains this original for shadow bake.
export function galleryRepairBacking(original){
 original.computeBoundingBox();const bounds=original.boundingBox,p=original.attributes.position,n=original.attributes.normal,ix=original.index;
 if(Math.abs(bounds.min.x-2.89)>.00001||bounds.max.y<4.19||-bounds.min.z<16.4||-bounds.max.z>19.8)return null;
 const arrays=Object.fromEntries(Object.keys(original.attributes).map(k=>[k,[]]));
 const copyVertex=i=>{for(const [name,attr]of Object.entries(original.attributes))for(let k=0;k<attr.itemSize;k++)arrays[name].push(attr.array[i*attr.itemSize+k]);};
 for(let i=0;i<(ix?.count||p.count);i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j);if(ids.every(k=>n.getX(k)<-.999))continue;ids.forEach(copyVertex);}
 const limits=[[0,-bounds.max.z,1],[0,-bounds.min.z,-1],[1,bounds.min.y,1],[1,bounds.max.y,-1]];
 for(const triangle of sourceTriangles){
  let poly=triangle;for(const limit of limits)poly=clip(poly,...limit);
  for(let j=1;j<poly.length-1;j++){
   const t=[poly[0],poly[j],poly[j+1]],cross=(t[1][0]-t[0][0])*(t[2][1]-t[0][1])-(t[1][1]-t[0][1])*(t[2][0]-t[0][0]);
   if(Math.abs(cross)<1e-12)continue;if(cross>0)[t[1],t[2]]=[t[2],t[1]];
   for(const [u,h]of t){arrays.position.push(bounds.min.x,h,-u);arrays.normal.push(-1,0,0);arrays.uv.push(-u/2,h/2);}
  }
 }
 const g=new THREE.BufferGeometry();for(const [name,attr]of Object.entries(original.attributes))g.setAttribute(name,new THREE.Float32BufferAttribute(arrays[name],attr.itemSize));
 g.computeBoundingBox();g.computeBoundingSphere();return g;
}
