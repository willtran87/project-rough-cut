import {gustGLSL} from './back-nine-wind.js';
import * as THREE from './vendor/three/three.module.js';
import {COURSE_GREENS} from './back-nine-landscape.js';
import {terrainHeight} from './course-terrain.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

// A shared cloth atlas: restrained woven pixels, stitched hems, weathered
// lower corners and large hole numerals readable from the maintained fringe.
export function createGreenFlags(scene){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;
 const ctx=canvas.getContext('2d');
 for(const [i,g]of COURSE_GREENS.entries()){
  const x=i%3*256,y=Math.floor(i/3)*128;
  ctx.fillStyle=i<2?'#9e936d':i<4?'#a09a7f':'#a39978';ctx.fillRect(x,y,256,128);
  for(let py=0;py<128;py+=2)for(let px=0;px<256;px+=2){
   const h=(Math.imul(px+g.hole*31,73856093)^Math.imul(py+17,19349663))>>>0;
   ctx.fillStyle=h%7<2?'#a69c79':'#978b69';ctx.globalAlpha=.20;ctx.fillRect(x+px,y+py,2,1);
  }
  ctx.globalAlpha=1;ctx.fillStyle='#6e654c';ctx.fillRect(x+3,y,4,128);
  ctx.fillStyle='#d0c7a7';for(let s=12;s<248;s+=8){ctx.fillRect(x+s,y+7,4,2);ctx.fillRect(x+s,y+119,4,2);}for(let s=8;s<120;s+=8)ctx.fillRect(x+247,y+s,2,4);
  ctx.font='bold 66px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#333a30';ctx.fillText(String(g.hole),x+135,y+67);
  for(let n=0;n<5;n++){const start=100+n*5;ctx.clearRect(x+250-(n%2)*4,y+start,8,2);}
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.LinearMipmapLinearFilter;
 const material=new THREE.MeshLambertMaterial({map,side:THREE.DoubleSide,alphaTest:.4,color:0xc9c2ab});
 const time={value:0},motion={value:1};material.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{flagTime:time,flagMotion:motion});s.vertexShader='uniform float flagTime;\n'+gustGLSL('flagTime')+'\n'+'attribute vec2 flagLocal;uniform float flagMotion;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float flap=flagLocal.x*flagLocal.x;
   transformed.z+=flagMotion*backNineGust(position.xz)*flap*(.085*sin(flagTime*2.6+flagLocal.x*7.0+flagLocal.y)+.03*sin(flagTime*5.1+flagLocal.x*12.0));
   transformed.y-=flap*.026;
  `);
 };material.customProgramCacheKey=()=> 'back-nine-green-cloth-v2';
 const parts=[];
 for(const [i,g]of COURSE_GREENS.entries()){
  const geo=new THREE.PlaneGeometry(.53,.3,12,5),p=geo.attributes.position,u=geo.attributes.uv,local=[];
  for(let v=0;v<p.count;v++){
   const x=u.getX(v),y=u.getY(v);local.push(x,g.hole);p.setXYZ(v,g.x+.018+x*.53,terrainHeight(g.x,g.y)+2.01+p.getY(v),-g.y+.015*Math.sin(x*5));
   u.setXY(v,(i%3+x)/3,1-(Math.floor(i/3)+1-y)/2);
  }
  geo.setAttribute('flagLocal',new THREE.Float32BufferAttribute(local,2));geo.computeVertexNormals();parts.push(geo);
 }
 const geometry=mergeIndexedGeometries(parts);parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();geometry.boundingSphere.radius+=.1;
 const mesh=new THREE.Mesh(geometry,material);mesh.name='BackNineGreenFlags';scene.add(mesh);
 return {update(run){time.value=run.time;motion.value=1;},stats:()=>({flags:COURSE_GREENS.length,atlas:[768,256],motion:motion.value,time:time.value}),dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();map.dispose();}};
}
