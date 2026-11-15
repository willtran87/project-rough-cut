import * as THREE from './vendor/three/three.module.js';
import {rootMasonryFragment} from './under-green-root-entry.js';

// A roof-root entry has shed its plaster. The original opaque roof remains
// behind every piece; exposed masonry is a shallow finish, never a sky hole.
export const GALLERY_PLASTER_EDGE=Object.freeze([
 [-4.89,14.2],[-4.3,13.9],[-4.05,14.1],[-3.65,13.8],[-3.2,14.15],
 [-2.9,14.05],[-2.65,14.5],[-2.8,15.1],[-3.2,15.4],[-3,15.75],
 [-3.5,15.9],[-4.1,15.83],[-4.5,15.96],[-4.89,15.9]
]);

// Intermediate fractures keep the large failure asymmetric without making its
// perimeter read as a few straight polygon edges. The west seam stays seated.
export const GALLERY_PLASTER_CONTOUR=Object.freeze(GALLERY_PLASTER_EDGE.flatMap(([x,y],i)=>{
 const [nx,ny]=GALLERY_PLASTER_EDGE[(i+1)%GALLERY_PLASTER_EDGE.length],dx=nx-x,dy=ny-y,length=Math.hypot(dx,dy),steps=Math.max(2,Math.ceil(length/.13));
 return Array.from({length:steps},(_,j)=>{const t=j/steps,offset=j===0||x===nx?0:.026*Math.sin(i*4.7+j*2.3);return [Math.max(-4.89,x+dx*t-dy/length*offset),y+dy*t+dx/length*offset];});
}));

// Opaque pigment feathers into the unchanged receiving texture. Keeping the
// same physical UVs, normal and lighting avoids a transparent decal layer.
export function gallerySeepGeometry(width,height,seed=0){
 const segments=32,p=[0,0,0],uv=[0,0],colors=[.52,.63,.49],indices=[];
 for(const [radius,tone]of [[.36,[.57,.67,.53]],[.74,[.76,.82,.70]],[1,[1,1,1]]])for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2,r=.82+.11*Math.sin(a*3+seed)+.07*Math.cos(a*7-seed);
  p.push(Math.cos(a)*width*.5*radius*r,Math.sin(a)*height*.5*radius*r,0);uv.push(0,0);colors.push(...tone);
 }
 for(let i=0;i<segments;i++){const j=(i+1)%segments;indices.push(0,1+i,1+j);}
 for(let ring=0;ring<2;ring++)for(let i=0;i<segments;i++){const a=1+ring*segments+i,b=1+ring*segments+(i+1)%segments;indices.push(a,a+segments,b,b,a+segments,b+segments);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function buildGalleryPlaster({materials,put}){
 const owned=[];
 for(const [name,source]of [['galleryCeilingDamp',materials.ceiling],['galleryWallDamp',materials.rootStone]]){
  const material=source.clone();material.onBeforeCompile=source.onBeforeCompile;material.customProgramCacheKey=source.customProgramCacheKey;
  material.vertexColors=true;material.userData.drainWorldUV=true;materials[name]=material;owned.push(material);
 }
 let fragments=0,triangles=0,minimumHeight=Infinity;const records=[];
 function seep(type,x,h,y,width,height,seed,rx=0,ry=0){
  const g=gallerySeepGeometry(width,height,seed);triangles+=g.index.count/3;
  g.computeBoundingBox();minimumHeight=Math.min(minimumHeight,rx?h:h+g.boundingBox.min.y);
  put(g,type,x,h,-y,1,1,1,rx,ry);g.dispose();records.push({type,x,h,y,width,height,rx,ry});
 }
 // Dampness extends from the actual roof entry to the west wall, with a
 // narrower gravity trail below. Quiet intact plaster surrounds the failure.
 seep('galleryCeilingDamp',-3.74,4.148,14.72,2.3,2.5,4,Math.PI/2);
 seep('galleryWallDamp',-4.888,3.35,15.15,1.3,1.52,6,0,Math.PI/2);
 seep('galleryWallDamp',-4.888,2.38,15.50,.38,1.14,9,0,Math.PI/2);
 const shape=new THREE.Shape();GALLERY_PLASTER_CONTOUR.forEach(([x,y],i)=>i?shape.lineTo(x+3.8,15.1-y):shape.moveTo(x+3.8,15.1-y));shape.closePath();
 const bed=new THREE.ShapeGeometry(shape);triangles+=bed.index.count/3;
 // Local +z faces down after rotation; course y becomes negative world z.
 put(bed,'rootStone',-3.8,4.142,-15.1,1,1,1,Math.PI/2);bed.dispose();
 // Chipped plaster remnants follow selected changes in the failure contour.
 // In-plane rotation preserves their embedded backs and downward-facing edge.
 for(let i=1;i<GALLERY_PLASTER_CONTOUR.length;i+=3){
  const [x,y]=GALLERY_PLASTER_CONTOUR[i],next=GALLERY_PLASTER_CONTOUR[(i+1)%GALLERY_PLASTER_CONTOUR.length];if(x< -4.82)continue;
  const angle=Math.atan2(next[1]-y,next[0]-x),depth=.012+(i%3)*.003;
  const g=rootMasonryFragment(.085+(i%4)*.025,.045+(i%3)*.018,depth,i*.61);
  put(g,'ceiling',x,4.153,-y,1,1,1,Math.PI/2,0,-angle);triangles+=g.attributes.position.count/3;g.dispose();fragments++;
 }
 return {exposedMasonry:1,plasterFragments:fragments,seepPatches:records,triangles,minimumHeight,opaqueBacking:true,newTextures:0,newLights:0,dispose(){owned.forEach(m=>m.dispose());}};
}
