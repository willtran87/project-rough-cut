import * as THREE from './vendor/three/three.module.js';

// Dedicated illustrated material art, sampled at its native pixel resolution.
// World-facing surfaces map two metres to a source tile. The paired masonry
// strip spans four metres at the same pixel density. No diffuse image is used as
// a bump map: structural relief is geometry, gloss is separately authored.
export async function createCraftedDrainSurfaces(){
 const sets={},owned=[],sources=[];
 const texture=(canvas,color=true)=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=color?THREE.NearestFilter:THREE.LinearFilter;t.minFilter=color?THREE.NearestMipmapLinearFilter:THREE.LinearMipmapLinearFilter;owned.push(t);return t;};
 const hash=n=>{const v=Math.sin(n*127.1+43.71)*43758.5453;return v-Math.floor(v);};
 const definitions=[['./assets/under-green/surfaces-v1.png',[null,'bark','floor','mud']],['./assets/under-green/surfaces-industrial-v1.png',[null,null,'panel','sand']],['./assets/under-green/surfaces-masonry-v3.png',['masonry',null,'concrete','tile']]];
 const images=await Promise.all(definitions.map(async([url])=>{const img=new Image();img.src=url;await img.decode();return img;}));
 for(let a=0;a<images.length;a++){
  const atlas=images[a],width=Math.floor(atlas.naturalWidth/2),height=Math.floor(atlas.naturalHeight/2);
  sources.push({asset:definitions[a][0].split('/').pop(),size:[atlas.naturalWidth,atlas.naturalHeight],tileSize:[width,height],texelsPerMetre:width/2,materials:definitions[a][1].filter(Boolean)});
  for(let i=0;i<4;i++){
   const name=definitions[a][1][i];if(!name)continue;
   const paired=name==='masonry',canvas=document.createElement('canvas');canvas.width=width*(paired?2:1);canvas.height=height;
   // Keep both coordinated brick variants in one texture/sample. A four-metre
   // repeat breaks the former two-metre stain cadence without changing texel
   // scale, per-frame shader work, batch count or the physical wall geometry.
   canvas.getContext('2d').drawImage(atlas,i%2*width,Math.floor(i/2)*height,canvas.width,height,0,0,canvas.width,height);
   const mask=document.createElement('canvas');mask.width=mask.height=256;const c=mask.getContext('2d');c.fillStyle='#080808';c.fillRect(0,0,256,256);
   const horizontal=name==='floor'||name==='mud',bark=name==='bark';
   // Separate runoff or puddle masks; large dry areas remain matte. Their
   // placement is deterministic and independent from bright albedo pigments.
   for(let n=0;n<(horizontal?18:24);n++){
    const x=Math.floor(hash(n+31)*256),y=Math.floor(hash(n+71)*256),w=horizontal?8+hash(n)*38:bark?1+hash(n)*2:1+hash(n)*4,h=horizontal?2+hash(n+8)*9:15+hash(n+9)*88;
    c.fillStyle=horizontal?(n%3?'#303030':'#626262'):(n%3?'#242424':'#474747');
    c.beginPath();
    if(horizontal){
     for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.65+hash(n*19+i)*.35,px=Math.round(x+Math.cos(a)*w*r),py=Math.round(y+Math.sin(a)*h*r);if(i)c.lineTo(px,py);else c.moveTo(px,py);}
    }else{
     // Narrow irregular seep paths replace the visibly rectangular glossy
     // strips. Taper and broken edges follow gravity at a fixed world position.
     for(const side of [-1,1])for(let k=0;k<=12;k++){
      const t=(side===-1?k:12-k)/12,drift=Math.sin(t*4.3+n)*2+Math.sin(t*11+n)*.6;
      const radius=w*(.15+.7*Math.sin(t*Math.PI))*(.7+hash(n*13+Math.floor(t*12))*.3);
      const px=Math.round(x+drift+side*radius),py=Math.round(y+t*h);
      if(side===-1&&k===0)c.moveTo(px,py);else c.lineTo(px,py);
     }
    }
    // Wetness is a lighting mask, not diffuse art. A soft seep margin prevents
    // the specular lobe from turning a damp patch into a luminous pixel bar;
    // the illustrated color texture retains crisp nearest magnification.
    c.closePath();c.filter=horizontal?'blur(1px)':'blur(2px)';c.fill();c.filter='none';
   }
   const map=texture(canvas);if(paired)map.repeat.x=.5;
   sets[name]={map,bump:null,wet:texture(mask,false),worldTileMetres:paired?[4,2]:[2,2],texelsPerMetre:[width/2,height/2]};
  }
 }
 return {sets,stats:()=>({sources,materials:Object.keys(sets),sampling:Object.fromEntries(Object.entries(sets).map(([name,set])=>[name,{worldTileMetres:set.worldTileMetres,texelsPerMetre:set.texelsPerMetre,size:[set.map.image.width,set.map.image.height]}])),separateRelief:true,separateWetness:true}),dispose(){owned.forEach(t=>t.dispose());}};
}

// Broad, stationary variation breaks the two-metre repeat. Quantizing the field
// keeps the shading in the same pixel language as the textures. Roots and wall
// bases receive static grounding without an extra transparent pass or SSAO.
export function shadeDrainMaterial(material,{wall=false,root=false}={}){
 material.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 drainWorld;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\ndrainWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='varying vec3 drainWorld;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 q=floor(drainWorld*128.)/128.;
   float stainField=sin(q.x*.73+sin(q.z*.31))*sin(q.z*.87+q.y*.51);
   float seep=pow(.5+.5*sin(q.x*2.3+q.z*1.7+sin(q.x*.23+q.z*.29)),5.);
   diffuseColor.rgb*=.93+stainField*.10;
   ${wall?'diffuseColor.rgb*=mix(.57,1.,smoothstep(0.,.8,q.y)); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.64,.76,.61),seep*.32);':''}
   ${root?'diffuseColor.rgb*=.91+.09*sin(q.y*5.+q.x*2.+q.z);':''}
  `);
 };
 material.customProgramCacheKey=()=>`drain-crafted-${wall}-${root}`;material.needsUpdate=true;
}
