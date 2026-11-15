import * as THREE from './vendor/three/three.module.js';
import {rootMasonryFragment} from './under-green-root-entry.js';

// The three existing gallery roots disturb their actual foundations. Raised
// earth remains inside the pillar collider or the wall's .20m visual margin;
// only flat sediment spreads onto the walk. Course coordinates use +y north.
export const GALLERY_ROOT_GROUND=Object.freeze([
 {id:'pillar',x:-1.8,y:15,rx:.485,ry:.485,height:.21,apronX:2.05,apronY:1.45,seed:3},
 {id:'entrance',x:4.905,y:10.2,rx:.095,ry:.94,height:.25,apronX:.94,apronY:1.6,seed:7},
 {id:'crossing',x:-2.905,y:27.625,rx:.095,ry:.87,height:.19,apronX:.83,apronY:1.48,seed:11}
]);
const TAU=Math.PI*2;
const shape=(a,seed)=>.68+.20*Math.sin(a*3+seed)+.12*Math.cos(a*5-seed*.7);

export function galleryRootSoilGeometry(site){
 const n=32,p=[],uv=[],color=[],ix=[];
 // Closed shallow mound with an asymmetric shoulder and a seated underside.
 for(const [radius,height]of [[.06,.52],[.43,1],[.76,.42],[1,-.016],[1,-.09]])for(let i=0;i<n;i++){
  const a=i/n*TAU,s=shape(a,site.seed),x=Math.cos(a)*radius*s*site.rx,z=Math.sin(a)*radius*s*site.ry;
  const h=height<0?height*site.height:height*site.height*(.72+.18*Math.sin(a+site.seed)+.10*Math.cos(2*a-site.seed));
  p.push(x,h,z);uv.push((site.x+x)/4,(site.y-z)/4);
  const tone=.62+Math.max(0,h)/site.height*.27;color.push(tone,tone*.96,tone*.83);
 }
 for(let r=0;r<4;r++)for(let i=0;i<n;i++){const a=r*n+i,b=r*n+(i+1)%n;ix.push(a,a+n,b,b,a+n,b+n);}
 for(let i=1;i<n-1;i++){ix.push(0,i,i+1);ix.push(4*n,4*n+i+1,4*n+i);}
 for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.setIndex(ix);g.computeVertexNormals();g.userData.preserveDrainUV=true;return g;
}

export function paintGalleryRootGround(polygon){
 let patches=0;
 for(const site of GALLERY_ROOT_GROUND){
  // Unequal lobes follow the root's footprint and the nearby wall. The outer
  // fan is mostly dry; concentrated moisture stays beneath the root itself.
  for(const [scale,strength,layer]of [[1,125,0],[.79,193,0],[.54,230,0],[.31,250,0],[.54,100,2],[.29,181,2]]){
   const points=Array.from({length:40},(_,i)=>{const a=i/40*TAU,r=shape(a,site.seed)*scale;
    return [site.x+Math.cos(a)*site.apronX*r,site.y+Math.sin(a)*site.apronY*r];});
   polygon(layer,points,strength);patches++;
  }
  // Narrow soil-filled failures radiate unevenly from the lifted foundation.
  // These stay in the existing deposit mask, with no floating dark decals.
  for(const [a,length,width]of site.id==='pillar'?[[.35,1.8,.065],[2.3,1.3,.055],[4.5,1.55,.08]]:[[1.8,1.6,.07],[4.2,1.3,.05]]){
   const points=[],back=[];
   for(let i=0;i<5;i++){
    const t=i/4,r=.25+t*length,turn=(site.id==='crossing'?Math.PI-a:a)+(i%2?.07:-.04),x=site.x+Math.cos(turn)*r,y=site.y+Math.sin(turn)*r,h=width*(1-t*.85);
    points.push([x+Math.sin(turn)*h,y-Math.cos(turn)*h]);back.push([x-Math.sin(turn)*h,y+Math.cos(turn)*h]);
   }
   polygon(0,[...points,...back.reverse()],202);patches++;
  }
 }
 return {sites:GALLERY_ROOT_GROUND.length,patches,raisedWalkGeometry:false};
}

export function buildGalleryRootGround({put}){
 let triangles=0,fragments=0;
 for(const site of GALLERY_ROOT_GROUND){
  const earth=galleryRootSoilGeometry(site);triangles+=earth.index.count/3;put(earth,'mudBank',site.x,0,-site.y);earth.dispose();
  // Small lifted remnants are seated in the soil and confined to existing
  // solid footprints. They do not create new obstacles on the walking floor.
  const count=site.id==='pillar'?5:3;
  for(let i=0;i<count;i++){
   const a=.4+i*TAU/count+site.seed*.11,radius=.84*shape(a,site.seed),dx=Math.cos(a)*site.rx*radius,dz=Math.sin(a)*site.ry*radius;
   const w=site.id==='pillar'?.115:.055,h=site.id==='pillar'?.18:.19;
   const shoulder=.42-(.84-.76)/.24*.436;
   const seatedHeight=shoulder*site.height*(.72+.18*Math.sin(a+site.seed)+.10*Math.cos(2*a-site.seed));
   const fragment=rootMasonryFragment(w,h,.035,site.seed+i);
   put(fragment,'rootStone',site.x+dx,seatedHeight-.014,-site.y+dz,1,1,1,-Math.PI/2,0,site.id==='pillar'?a*.3:0);triangles+=fragment.attributes.position.count/3;fragment.dispose();fragments++;
  }
 }
 return {sites:GALLERY_ROOT_GROUND.map(s=>s.id),soilMounds:3,fragments,triangles,addedTextures:0,walkObstacles:0};
}
