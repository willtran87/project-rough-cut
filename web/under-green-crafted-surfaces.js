import * as THREE from './vendor/three/three.module.js';

// Dedicated illustrated material art, sampled at its native pixel resolution.
// World-facing surfaces preserve 313.5 source pixels per metre. The masonry
// field spans four metres in both directions. No diffuse image is used as
// a bump map: structural relief is geometry, gloss is separately authored.
export async function createCraftedDrainSurfaces(){
 const sets={},owned=[],sources=[];
 const texture=(canvas,color=true)=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=color?THREE.NearestFilter:THREE.LinearFilter;t.minFilter=color?THREE.NearestMipmapLinearFilter:THREE.LinearMipmapLinearFilter;owned.push(t);return t;};
 const hash=n=>{const v=Math.sin(n*127.1+43.71)*43758.5453;return v-Math.floor(v);};
 // Bark, sand and concrete/tile ship as the exact tiles formerly cut from
 // three 2x2 atlases; the unused quadrants are archived outside the bundle.
 const definitions=[['surfaces-bark-v1.png',['bark'],1],['surfaces-sand-v1.png',['sand'],1],['surfaces-concrete-tile-v3.png',['concrete','tile'],2,1],['masonry-field-v4.png',['masonry'],1],['sediment-field-v1.png',['mud'],1],['paving-field-v3.png',['floor'],1]];
 definitions.push(['bunker-earth-sand-v1.png',['bankSoil','bankSand'],2,1]);
 // A full four-metre painted-steel field replaces the two-metre repeating
 // peel strip. Quiet coating between unequal corrosion islands lets the
 // physical range ribs and folded lining explain the construction.
 definitions.push(['range-painted-steel-v2.png',['panel'],1]);
 const images=await Promise.all(definitions.map(async([name])=>{const img=new Image();img.src='./assets/under-green/'+name;await img.decode();return img;}));
 for(let a=0;a<images.length;a++){
  const atlas=images[a],columns=definitions[a][2]||2,rows=definitions[a][3]||columns,width=Math.floor(atlas.naturalWidth/columns),height=Math.floor(atlas.naturalHeight/rows);
  sources.push({asset:definitions[a][0],size:[atlas.naturalWidth,atlas.naturalHeight],tileSize:[width,height],texelsPerMetre:313.5,materials:definitions[a][1].filter(Boolean)});
  for(let i=0;i<4;i++){
   const name=definitions[a][1][i];if(!name)continue;
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   // The full masonry field contains distinct repairs and quieter intact faces
   // across the wall height, instead of repeating an eight-course strip twice.
   canvas.getContext('2d').drawImage(atlas,i%columns*width,Math.floor(i/columns)*height,width,height,0,0,width,height);
   const mask=document.createElement('canvas');mask.width=mask.height=256;const c=mask.getContext('2d');c.fillStyle='#080808';c.fillRect(0,0,256,256);
   const horizontal=name==='floor'||name==='mud',bark=name==='bark';
   // Puddle masks retain their existing independent shapes. Vertical seep
   // films have narrow, interrupted highlights within a dim broader margin.
   // This avoids glossy capsule-like bars when practical light catches a wall.
   for(let n=0;n<(horizontal?18:24);n++){
    const x=Math.floor(hash(n+31)*256),y=Math.floor(hash(n+71)*256),w=horizontal?8+hash(n)*38:bark?1+hash(n)*2:1+hash(n)*4,h=horizontal?2+hash(n+8)*9:15+hash(n+9)*88;
    if(horizontal){
     c.fillStyle=n%3?'#303030':'#626262';c.beginPath();
     for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.65+hash(n*19+i)*.35,px=Math.round(x+Math.cos(a)*w*r),py=Math.round(y+Math.sin(a)*h*r);if(i)c.lineTo(px,py);else c.moveTo(px,py);}
     c.closePath();c.filter='blur(1px)';c.fill();c.filter='none';
    }else{
     for(let k=0;k<h;k+=3){
      const t=k/h,drift=Math.sin(t*4.3+n)*2+Math.sin(t*11+n)*.6,px=Math.round(x+drift),py=y+k;
      // A restrained damp margin remains below the sharp reflection threshold.
      c.fillStyle='#101010';c.fillRect(px-1,py,3,3);
      const broken=hash(n*131+Math.floor(k/3));
      if(broken<.34||t>.92)continue;
      const value=Math.round(25+broken*37);c.fillStyle=`rgb(${value},${value},${value})`;
      c.fillRect(px,py,1,broken>.76?3:2);
     }
    }
   }
   const map=texture(canvas);map.repeat.set(627/width,627/height);
   // Reflection preserves texel density and joins the generated bank fields
   // without an albedo step at the opposite edges of the source square.
   if(name==='bankSoil'||name==='bankSand'||name==='panel')map.wrapS=map.wrapT=THREE.MirroredRepeatWrapping;
   sets[name]={map,bump:null,wet:texture(mask,false),worldTileMetres:[width/313.5,height/313.5],texelsPerMetre:[313.5,313.5]};
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
