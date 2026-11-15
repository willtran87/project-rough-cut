import * as THREE from './vendor/three/three.module.js';

// A paired albedo/leaf-plane atlas. Every stepped leaf has the same silhouette
// in both maps: its folded halves respond to real sources, never emissive fill.
export function createHedgeSurface(){
 const size=128,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const g=canvas.getContext('2d'),pixels=g.createImageData(size,size),normals=new Uint8Array(size*size*4);
 const palette=[[29,48,35],[41,65,43],[53,79,48],[67,92,56],[79,103,65],[95,116,73],[114,132,86]];
 let seed=52871;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const put=(x,y,color,u=0,v=0)=>{const i=(((y%size+size)%size)*size+(x%size+size)%size)*4;
  pixels.data.set([...color,255],i);const length=Math.hypot(u,v,1);normals.set([Math.round((u/length*.5+.5)*255),Math.round((v/length*.5+.5)*255),Math.round((1/length*.5+.5)*255),255],i);
 };
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)put(x,y,palette[0]);
 function leaf(x,y,angle,length,width,tone){
  const dx=Math.cos(angle),dy=Math.sin(angle),bend=(random()-.5)*.16;
  const radius=Math.ceil(length+width);
  for(let py=-radius;py<=radius;py++)for(let px=-radius;px<=radius;px++){
   const along=px*dx+py*dy,across=-px*dy+py*dx,t=along/length;
   if(t<0||t>1)continue;
   const half=width*Math.pow(Math.sin(t*Math.PI),.85);
   if(Math.abs(across)>half)continue;
   const side=across<0?-1:1,edge=half-Math.abs(across)<1,vein=Math.abs(across)<.55;
   const shade=edge?Math.max(1,tone-1):vein?Math.min(6,tone+1):Math.min(6,tone+(side>0?1:0));
   const slope=side*.42,tip=(t-.5)*.20+bend;
   put(Math.round(x)+px,Math.round(y)+py,palette[shade],-dy*slope+dx*tip,dx*slope+dy*tip);
  }
 }
 // Staggered sprays and their dark stems create connected growth, rather than
 // unrelated individual marks. Wrap every pixel for a seamless .7m repeat.
 for(let row=0;row<5;row++)for(let col=0;col<5;col++){
  const x=col*26+(row%2)*11+random()*8,y=row*26+random()*9,angle=-1.4+(random()-.5)*1.8,dx=Math.cos(angle),dy=Math.sin(angle);
  const tone=1+Math.floor(random()*3);
  for(let step=0;step<28;step++)put(Math.round(x+dx*step),Math.round(y+dy*step),palette[1]);
  for(let j=0;j<6;j++){const along=j*4.4,side=j%2?1:-1;leaf(x+dx*along,y+dy*along,angle+side*(.72+random()*.45),11+random()*8,3+random()*2,tone);}
  leaf(x+dx*26,y+dy*26,angle,13,3.4,Math.min(4,tone+1));
 }
 g.putImageData(pixels,0,0);
 const color=new THREE.CanvasTexture(canvas);color.colorSpace=THREE.SRGBColorSpace;
 const normal=new THREE.DataTexture(normals,size,size,THREE.RGBAFormat,THREE.UnsignedByteType);normal.flipY=true;
 for(const t of [color,normal]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;}
 return {color,normal};
}

export function hedgeSurfaceNormals(shader,normalMap,economy){
 shader.uniforms.hedgeLeafNormals={value:normalMap};
 shader.fragmentShader='uniform sampler2D hedgeLeafNormals;\n'+shader.fragmentShader;
 const sample=economy?`
 vec2 leafPlane;vec3 leafSlope;
 if(leafWeights.x>leafWeights.y&&leafWeights.x>leafWeights.z){leafPlane=texture2D(hedgeLeafNormals,leafP.yz).xy*2.0-1.0;leafSlope=vec3(0.0,leafPlane.x,leafPlane.y);}
 else if(leafWeights.y>leafWeights.z){leafPlane=texture2D(hedgeLeafNormals,leafP.xz).xy*2.0-1.0;leafSlope=vec3(leafPlane.x,0.0,leafPlane.y);}
 else{leafPlane=texture2D(hedgeLeafNormals,leafP.xy).xy*2.0-1.0;leafSlope=vec3(leafPlane.x,leafPlane.y,0.0);}`:`
 leafWeights*=leafWeights;leafWeights*=leafWeights;leafWeights/=max(dot(leafWeights,vec3(1.0)),.001);
 vec2 leafX=texture2D(hedgeLeafNormals,leafP.yz).xy*2.0-1.0,leafY=texture2D(hedgeLeafNormals,leafP.xz).xy*2.0-1.0,leafZ=texture2D(hedgeLeafNormals,leafP.xy).xy*2.0-1.0;
 vec3 leafSlope=vec3(0.0,leafX.x,leafX.y)*leafWeights.x+vec3(leafY.x,0.0,leafY.y)*leafWeights.y+vec3(leafZ.x,leafZ.y,0.0)*leafWeights.z;`;
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec3 leafWeights=abs(vSurfaceNormal),leafP=vSurfacePosition*surfaceInvScale;
 ${sample}
 vec3 leafViewSlope=mat3(viewMatrix)*leafSlope;
 normal=normalize(normal+leafViewSlope-normal*dot(normal,leafViewSlope));`);
}
