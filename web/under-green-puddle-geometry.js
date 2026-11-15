import * as THREE from './vendor/three/three.module.js';

// Subdivide the original triangulation, preserving even concave scallops.
// Distance to the authored shore controls a thin translucent margin without
// shrinking the polygon, adding a second water layer, or changing collision.
export function shallowPoolGeometry(patch,height){
 const shape=new THREE.Shape();patch.points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const base=new THREE.ShapeGeometry(shape),p=base.attributes.position;
 const points=Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i)]);
 let indices=Array.from(base.index.array);base.dispose();
 for(let pass=0;pass<2;pass++){
  const mids=new Map(),next=[];
  const midpoint=(a,b)=>{const key=Math.min(a,b)+':'+Math.max(a,b);if(!mids.has(key)){mids.set(key,points.length);points.push([(points[a][0]+points[b][0])*.5,(points[a][1]+points[b][1])*.5]);}return mids.get(key);};
  for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2],ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);next.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}
  indices=next;
 }
 const position=[],normal=[],uv=[],edge=[],width=patch.clumps===undefined?.018:.06;
 for(const [x,y]of points){
  let distance=Infinity;
  for(let i=0;i<patch.points.length;i++){
   const a=patch.points[i],b=patch.points[(i+1)%patch.points.length],dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
   const t=length?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/length)):0;
   distance=Math.min(distance,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
  }
  position.push(x,height,-y);normal.push(0,1,0);uv.push(x,y);edge.push(distance/width);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(position,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('puddleInterior',new THREE.Float32BufferAttribute(edge,1));geometry.setIndex(indices);return geometry;
}
