import * as THREE from './vendor/three/three.module.js';
import {terrainHeight,contourGround} from './course-terrain.js';
import {BREAKABLE_PROPS} from './chase-destruction.js';
import {isDestructibleFeature} from './course-destruction-state.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

// Shallow ambient contact belongs to an object's footprint. Moon/headlight
// cast shadows remain separate. Each small patch follows the terrain mesh.
export function sceneryContactPatch({x,y,rx,ry,opacity=.2,yaw=0}){
 const p=[],uv=[],colors=[],indices=[],c=Math.cos(yaw),s=Math.sin(yaw);
 // Small vegetation patches use a centre vertex to follow local swells;
 // long foundation strips get intermediate samples to stay on the ground.
 const nx=Math.max(2,Math.ceil(rx*2)),nz=Math.max(2,Math.ceil(ry*2));
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const u=i/nx*2-1,v=j/nz*2-1,xx=x+c*u*rx-s*v*ry,yy=y+s*u*rx+c*v*ry;
  p.push(xx,.061,-yy);uv.push(u,v);colors.push(1,1,1,opacity);
 }
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();const result=contourGround(THREE,g,{retainFlatTriangles:true});g.dispose();return result;
}

export function createSceneryContacts(scene,course,plants,batchCulling=null){
 const material=new THREE.MeshBasicMaterial({color:0x010403,transparent:true,depthWrite:false,vertexColors:true});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec2 contactUV;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncontactUV=uv;');
  shader.fragmentShader='varying vec2 contactUV;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','float contactD=dot(contactUV,contactUV);if(contactD>=1.0)discard;diffuseColor.a*=pow(1.0-contactD,2.0);');
 };
 material.customProgramCacheKey=()=> 'back-nine-scenery-contact-v1';
 const cells=new Map(),meshes=[],dynamic=[];let patches=0,updates=0,signature='';
 const add=(a,state=null)=>{
  const travel=state?.id==='range-abandoned-cart'?18:0;
  const g=sceneryContactPatch(travel?{...a,y:a.y+travel/2,ry:a.ry+travel/2}:a),cell=Math.floor(a.y/32);if(!cells.has(cell))cells.set(cell,[]);
  cells.get(cell).push({g,state,x:a.x,y:a.y,rx:a.rx,ry:a.ry,opacity:a.opacity??.2});patches++;
 };
 for(const p of plants)if((p.base||0)<.15)add({x:p.x,y:p.y,rx:Math.min(.5,(p.width||p.h*.8)*.32),ry:Math.min(.42,p.h*.23),opacity:.14});
 for(const o of course.obstacles.filter(o=>['hedge','rock','pump','post'].includes(o.kind)))add({x:o.x,y:o.y,rx:o.kind==='hedge'?.65:o.r*1.2,ry:o.kind==='hedge'?.65:o.r*1.2,opacity:o.kind==='hedge'?.36:.3});
 // Foundations: strips along the actual wall edges, never across the bay.
 const foundation=(x,y,rx,ry,depth=.22)=>{for(const side of [-1,1]){add({x:x+side*rx,y,rx:depth,ry:ry+.15,opacity:.3});add({x,y:y+side*ry,rx:rx+.15,ry:depth,opacity:.3});}};
 foundation(4,795,16.06,13.06,.32);foundation(-29,807,.5,7);foundation(-17,807,.5,7);foundation(-23,814,6,.5);
 for(const f of course.features){
  if(isDestructibleFeature(f))add({x:f.x,y:f.y,rx:f.rx*.96,ry:f.ry*.96,opacity:.2},{kind:'feature',id:f.id});
  else foundation(f.x,f.y,f.rx,f.ry);
 }
 for(const [i,p]of BREAKABLE_PROPS.entries())add({x:p.x,y:p.y,rx:p.rx*1.1,ry:p.ry*1.1,opacity:.24},{kind:'prop',id:i});
 for(const [cell,entries]of cells){
  let offset=0;const g=mergeIndexedGeometries(entries.map(e=>e.g));
  for(const e of entries){if(e.state)dynamic.push({...e.state,geometry:g,offset,count:e.g.attributes.position.count,opacity:e.opacity,x:e.x,y:e.y,rx:e.rx,ry:e.ry,base:e.g.attributes.position.array.slice()});offset+=e.g.attributes.position.count;}
  g.computeBoundingSphere();g.computeBoundingBox();const mesh=new THREE.Mesh(g,material);mesh.name='SceneryContact-'+cell;mesh.renderOrder=2;scene.add(mesh);meshes.push(mesh);
  batchCulling?.register(mesh,entries.map(e=>e.g),{maxTrianglesPerPart:64,rasterCull:true});
  for(const e of entries)e.g.dispose();
 }
 return {update(run){
  const states=dynamic.map(d=>d.kind==='feature'?run.destruction?.features?.[d.id]:run.destruction?.props?.[d.id]);
  const key=states.map(s=>[s?.brokenAt,s?.x,s?.y].join(',')).join(':');if(key===signature)return;signature=key;
  const dirty=new Set();dynamic.forEach((d,i)=>{
   const a=d.geometry.attributes.color,uv=d.geometry.attributes.uv,state=states[i],x=state?.x??d.x,y=state?.y??d.y;
   for(let v=0;v<d.count;v++){
    a.setW(d.offset+v,state?.brokenAt!=null?0:d.opacity);
    uv.setXY(d.offset+v,(d.base[v*3]-x)/d.rx,(-d.base[v*3+2]-y)/d.ry);
   }
   dirty.add(d.geometry);
  });for(const g of dirty){g.attributes.color.needsUpdate=true;g.attributes.uv.needsUpdate=true;}updates++;

 },stats:()=>({patches,batches:meshes.length,updates,removable:dynamic.length}),dispose(){for(const m of meshes){m.removeFromParent();m.geometry.dispose();}material.dispose();}};
}
