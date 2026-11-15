import * as THREE from './vendor/three/three.module.js';

const kinds=['moss','algae','mineral','fungus'];
const hash=n=>{const v=Math.sin(n*127.1+43.71)*43758.5453;return v-Math.floor(v);};

// Opaque, gently raised growth follows a real wall plane. Irregular outlines
// and continuous patches replace evenly spaced spherical beads. No alpha cards.
export function drainGrowthGeometry(kind,width,height,seed=0){
 const slot=kinds.indexOf(kind==='tide'?'mineral':kind);if(slot<0)throw Error('Unknown drain growth');
 const segments=24,positions=[0,0,.013],uv=[(slot+.5)/4,.5],colors=[1,1,1],indices=[];
 for(const ring of [.54,1])for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2,r=.70+.18*Math.sin(a*3+seed)+.12*Math.cos(a*7-seed*.7);
  let x=Math.cos(a)*width*.5*r*ring,y=Math.sin(a)*height*.5*r*ring;
  if(kind==='mineral')x*=.35+.65*(y/height+.5);
  const z=ring===1?.001:.009+(kind==='fungus'?.012:.004)*(.5+.5*Math.sin(a*4+seed));
  positions.push(x,y,z);uv.push((slot+.035+.93*(x/width+.5))/4,.035+.93*(y/height+.5));
  const tone=kind==='tide'?[.42,.36,.25]:[1,1,1],edge=ring===1?(kind==='mineral'?.38:.62):1;colors.push(...tone.map(v=>v*edge));
 }
 if(kind==='tide')colors.splice(0,3,.42,.36,.25);
 for(let i=0;i<segments;i++){const j=(i+1)%segments;indices.push(0,1+i,1+j,1+i,25+i,1+j,1+j,25+i,25+j);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

function growthAtlas(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');
 const pixel=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,Math.max(2,Math.round(w/2)*2),Math.max(2,Math.round(h/2)*2));};
 for(let slot=0;slot<4;slot++){
  c.save();c.translate(slot*256,0);c.beginPath();c.rect(0,0,256,256);c.clip();
  pixel(0,0,256,256,['#293525','#202c23','#353e31','#69654d'][slot]);
  if(slot===0){
   // Small forked leaf clusters share stems; quiet dark gaps separate tufts.
   for(let i=0;i<115;i++){
    const x=hash(i+17)*256,y=hash(i+211)*256,h=8+hash(i+89)*15;
    pixel(x,y-h,2,h,'#19271b');
    for(let j=0;j<3;j++){const yy=y-h+j*h/3,spread=3+j*2;pixel(x-spread,yy,spread,3,['#47583a','#536245','#37482f'][(i+j)%3]);pixel(x+2,yy+2,spread,3,['#37482f','#60704b','#47583a'][(i+j)%3]);}
   }
  }else if(slot===1){
   // Connected olive films carry long submerged folds, without cyan foam.
   for(let band=0;band<12;band++)for(let x=0;x<256;x+=4){const y=band*25+Math.sin(x*.037+band)*9;pixel(x,y,5,5+band%3,['#2c3d2e','#354532','#19271f'][band%3]);}
   for(let i=0;i<28;i++)pixel(hash(i+31)*256,hash(i+43)*256,4,14+hash(i)*28,'#3b4936');
  }else if(slot===2){
   // Mineral crust fans out at a failed joint, then narrows into broken runs.
   for(let i=0;i<32;i++){const x=hash(i+3)*256,y=hash(i+4)*80;for(let j=0;j<8;j++)pixel(x+Math.sin(j*.7+i)*5,y+j*22,2+i%4*2,14+i%3*3,['#858574','#51594c','#777a68','#98927b'][i%4]);}
  }else{
   // Thin overlapping fruiting layers, rendered as stepped pixel arcs.
   for(let band=0;band<13;band++)for(let x=0;x<256;x+=2){const y=band*23+Math.sin(x*.023+band*.41)*15;pixel(x,y,3,3,['#908b70','#4b4c39','#7b795f'][band%3]);}
  }
  c.restore();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;return texture;
}

export function createDrainGrowth({materials,put}){
 const texture=growthAtlas(),records=[];
 const material=new THREE.MeshPhongMaterial({map:texture,color:0xd3d0b9,vertexColors:true,specular:0x65715b,shininess:16});
 // One atlas/material batch family; UV regions choose physically different
 // responses without extra texture samples, transparency or animated shading.
 material.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
   float drainGrowthKind=floor(vMapUv.x*4.);
   specularStrength*=drainGrowthKind<.5?.08:drainGrowthKind<1.5?.48:drainGrowthKind<2.5?.025:.055;
  `).replace('#include <lights_phong_fragment>',`#include <lights_phong_fragment>
   material.specularShininess=drainGrowthKind<.5?7.:drainGrowthKind<1.5?68.:drainGrowthKind<2.5?4.:12.;
  `);
 };
 material.customProgramCacheKey=()=> 'drain-growth-atlas-v1';materials.rootMoss=material;
 function patch(c,kind,along,height,width,span,seed){
  // The bunker's upper retaining earth is set back from its lower stone face
  // (enclosure face at boundary + .01 above 3.26m). Follow that real surface.
  const geometry=drainGrowthGeometry(kind,width,span,seed);geometry.computeBoundingBox();
  const vertical=c.axis==='x',normal=c.id==='bunker-taproot'&&height+geometry.boundingBox.min.y>3.26?.0118:.1118;
  const x=vertical?c.boundary+c.side*normal:along,z=-(vertical?along:c.boundary+c.side*normal),yaw=vertical?c.side*Math.PI/2:c.side===1?Math.PI:0;
  put(geometry,'rootMoss',x,height,z,1,1,1,0,yaw);geometry.dispose();records.push({id:c.id,kind,axis:c.axis,boundary:c.boundary,side:c.side,along,height,width,span,normal});
 }
 function rootEntry(c,along,height,seed){
  patch(c,'moss',along+.37,height-.36,.28,.70,seed+1);
  patch(c,'moss',along+.16,height-.64,.38,.27,seed+4);
  // Each type follows a moisture source: wet low masonry, an old high-water
  // line, gravity below a failed joint, or a sheltered damp fork.
  patch(c,'tide',c.along-.12,.64,Math.min(1.7,c.span),.075,seed+9);
  if(seed!==3)patch(c,'algae',c.along+.36,.37,.85,.31,seed+3);
  if([0,3,5].includes(seed))patch(c,'mineral',along-.56,height-.56,.23,.96,seed+8);
  if([2,4].includes(seed))patch(c,'fungus',along+.52,height-.23,.23,.16,seed+11);
 }
 return {rootEntry,stats:()=>({patches:records.map(p=>({...p})),atlas:[1024,256],opaque:true,materials:1}),dispose(){texture.dispose();material.dispose();}};
}
