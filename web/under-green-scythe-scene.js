import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {createScytheArt} from './under-green-scythe-art.js';
import {SCYTHE_SHAFT,SCYTHE_GRIPS,SCYTHE_BLADE_HEIGHT,scytheOutline} from './under-green-scythe.js';
export function buildGrassScythe(parent){
 const art=createScytheArt(),materials=art.materials,batches=new Map();
 const point=p=>new THREE.Vector3(p[0],p[1],-p[2]);
 const add=(geometry,material)=>{if(!batches.has(material))batches.set(material,[]);batches.get(material).push(geometry);};
 const segment=(a,b,r,material,rTop=r,offset=0)=>{
  a=point(a);b=point(b);const delta=b.clone().sub(a),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
  const g=new THREE.CylinderGeometry(rTop,r,delta.length(),10);if(material===materials.wood){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,(offset+uv.getY(i)*delta.length())/1.5);}g.applyQuaternion(q);g.translate(...a.add(b).multiplyScalar(.5).toArray());add(g,material);
 };
 let grainOffset=0;
 for(let i=1;i<SCYTHE_SHAFT.length;i++){segment(SCYTHE_SHAFT[i-1],SCYTHE_SHAFT[i],.025,materials.wood,i===1?.022:.025,grainOffset);grainOffset+=point(SCYTHE_SHAFT[i]).distanceTo(point(SCYTHE_SHAFT[i-1]));}
 for(const [a,b]of SCYTHE_GRIPS){segment(a,b,.026,materials.wood);segment([a[0]-.045,a[1],a[2]],[a[0]+.045,a[1],a[2]],.032,materials.grip);}
 segment([.43,.73,.53],[.50,.67,.56],.047,materials.iron);
 // Fitted socket bands and peened rivets. The blade outline and grips retain
 // their shared simulation dimensions.
 segment([.446,.714,.536],[.454,.706,.54],.048,materials.edge);
 segment([.481,.682,.551],[.489,.674,.555],.048,materials.iron);
 for(const [x,y,f]of [[.449,.713,.579],[.481,.683,.596]]){
  const g=new THREE.SphereGeometry(.012,8,4);g.scale(1,1,.3);g.translate(x,y,-f);add(g,materials.edge);
 }
 // Forged spine tapers into a flat sharpened ribbon. No white edge tubes.
 // Round the coarse shared outline inward with quadratic corner arcs.
 // Retain the sharp tip; every new point lies inside its original corner
 // triangle, preserving the existing hit capsule and scene clearance.
 const {outline,edgeIndices,tipIndices}=scytheOutline();
 const inset=outline.map(p=>[...p]);
 const centre=[outline.reduce((n,p)=>n+p[0],0)/outline.length,outline.reduce((n,p)=>n+p[1],0)/outline.length];
 for(const index of edgeIndices){const p=outline[index],length=Math.hypot(centre[0]-p[0],centre[1]-p[1]),width=tipIndices.has(index)?.006:.018;inset[index]=[p[0]+(centre[0]-p[0])*width/length,p[1]+(centre[1]-p[1])*width/length];}
 function surface(points,heights,indices,material){
  const g=new THREE.BufferGeometry(),positions=[],uv=[];
  points.forEach(([x,f],i)=>{positions.push(x,SCYTHE_BLADE_HEIGHT+heights[i],-f);uv.push((x+.55)/1.07,(f-.55)/.93);});
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();add(g,material);
 }
 const triangles=THREE.ShapeUtils.triangulateShape(inset.map(([x,y])=>new THREE.Vector2(x,y)),[]).flat();
 // CCW x/forward triangles project upward in x/height/-forward space.
 surface(inset,inset.map(()=>.009),triangles,materials.blade);
 surface(inset,inset.map(()=>-.009),triangles.reduce((a,_,i,t)=>i%3?a:a.concat(t[i+2],t[i+1],t[i]),[]),materials.blade);
 for(let i=0;i<outline.length;i++){
  const j=(i+1)%outline.length,edgeA=edgeIndices.has(i),edgeB=edgeIndices.has(j),m=edgeA&&edgeB?materials.edge:materials.blade;
  const ha=edgeA?.001:.009,hb=edgeB?.001:.009;
  if(edgeA||edgeB){
   surface([inset[i],outline[i],outline[j],inset[j]],[.009,ha,hb,.009],[0,1,2,0,2,3],m);
   surface([inset[i],outline[i],outline[j],inset[j]],[-.009,-ha,-hb,-.009],[2,1,0,3,2,0],m);
  }
  surface([outline[i],outline[j],outline[j],outline[i]],[ha,hb,-hb,-ha],[2,1,0,3,2,0],m);
 }
 for(const [material,parts]of batches){const g=mergeIndexedGeometries(parts);parts.forEach(p=>p.dispose());const mesh=new THREE.Mesh(g,material);mesh.name='Scythe '+Object.keys(materials).find(k=>materials[k]===material);parent.add(mesh);}
 return {stats:()=>({...art.stats(),draws:batches.size,outlineVertices:outline.length,edgeThickness:.002,spineThickness:.018}),dispose:()=>art.dispose()};
}
