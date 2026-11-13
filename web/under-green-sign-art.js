import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

// Enamel plates share the course's lettering and green/brass palette, with
// corrosion concentrated around edges and fasteners rather than over words.
export function createDrainSignArt(){
 const textures=[],materials=[],geometries=[],records=[];
 const iron=new THREE.MeshPhongMaterial({color:0x3d4032,specular:0x70735c,shininess:18});materials.push(iron);
 function artwork(label,width,height,ink){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');
  let seed=2166136261;for(const char of label)seed=Math.imul(seed^char.charCodeAt(0),16777619);
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
  c.fillStyle='#34483b';c.fillRect(0,0,width,height);
  // Broad drips and subdued paint variation have readable pixel clusters.
  for(let i=0;i<100;i++){const x=Math.floor(random()*width/2)*2,y=Math.floor(random()*height/2)*2;c.fillStyle=i%2?'rgba(9,24,17,.10)':'rgba(128,137,92,.06)';c.fillRect(x,y,8+Math.floor(random()*30)*2,2+Math.floor(random()*9)*2);}
  const inset=Math.max(5,Math.round(height*.065));c.strokeStyle='#a29567';c.lineWidth=3;c.strokeRect(inset,inset,width-inset*2,height-inset*2);
  // Gravity carries rust down from the two upper mounting points.
  const boltX=[inset+5,width-inset-5],boltY=[inset+5,height-inset-5];
  for(const x of boltX){for(let layer=0;layer<4;layer++){c.fillStyle=['#62533a','#514a33','#43462f','#3d432e'][layer];c.fillRect(x-3+layer,inset+8,7-layer*2,Math.floor(height*(.28+random()*.32)));}}
  // Broken perimeter chips, quiet central paint, no indiscriminate white noise.
  for(let i=0;i<Math.ceil(width*.36);i++){
   const edge=i%4,t=random(),d=1+Math.floor(random()*Math.min(8,height*.045));
   const x=edge<2?Math.floor(t*width):edge===2?d:width-d-3,y=edge>=2?Math.floor(t*height):edge===0?d:height-d-2;
   c.fillStyle=['#18291f','#756344','#9a8050','#29392c'][i%4];c.fillRect(x,y,2+Math.floor(random()*5),1+Math.floor(random()*3));
  }
  // Rasterize text separately, then snap coverage to crisp paint pixels.
  const mask=document.createElement('canvas');mask.width=width;mask.height=height;const m=mask.getContext('2d');
  const lines=label.split('\n'),available=width-inset*2-30;let font=Math.floor(height*(lines.length>1?.29:.29));
  do{m.font=`bold ${font}px monospace`;if(Math.max(...lines.map(line=>m.measureText(line).width))<=available)break;font--;}while(font>8);
  m.textAlign='center';m.textBaseline='middle';m.fillStyle=ink;
  lines.forEach((line,i)=>m.fillText(line,width/2,height*(i+1)/(lines.length+1)));
  const pixels=m.getImageData(0,0,width,height);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=128?255:0;m.putImageData(pixels,0,0);c.drawImage(mask,0,0);
  // A few fine cracks live outside the lettering band.
  c.fillStyle='#1d3025';for(let i=0;i<7;i++){const x=Math.floor(random()*width),y=i%2?inset+3:height-inset-6;c.fillRect(x,y,4+i%3,1);c.fillRect(x+3,y+1,2,2);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;textures.push(texture);
  return {texture,font,boltX,boltY,inset,inkWidth:Math.max(...lines.map(line=>m.measureText(line).width)),available};
 }
 function make(text,w=512,h=128,color='#e1d1a0'){
  const root=new THREE.Group();root.name='Weathered enamel: '+text;
  const width=3.2,height=width*h/w,parts=[new THREE.BoxGeometry(width,height,.036)];
  const faceGeometry=new THREE.PlaneGeometry(width-.018,height-.018);geometries.push(faceGeometry);
  const faces=[];
  for(const side of [1,-1]){
   const label=side===1?text:text.replace(/[←→]/g,a=>a==='←'?'→':'←'),art=artwork(label,w,h,color);
   const material=new THREE.MeshPhongMaterial({map:art.texture,color:0xe1e3cd,specular:0x566047,shininess:18});
   // Lift diffuse bounce on enamel so safety lettering survives dark lamp
   // intervals. Direct lamps still shade the plate; there is no emissive map.
   material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= 4.0;');};
   // Three inserts the material name into a GLSL preprocessor definition.
   // Keep layout newlines in the artwork only, never in the shader label.
   material.customProgramCacheKey=()=> 'drain-enamel-bounce-v1';material.name='drain-sign:'+label.replace(/\s+/g,' ');materials.push(material);
   const face=new THREE.Mesh(faceGeometry,material);face.rotation.y=side===1?0:Math.PI;face.position.z=side*.019;face.userData.drainStaticLight=true;root.add(face);
   for(const px of art.boltX)for(const py of art.boltY){const bolt=new THREE.CylinderGeometry(.016,.017,.008,6);bolt.rotateX(Math.PI/2);bolt.translate((px/w-.5)*width,(.5-py/h)*height,side*.024);parts.push(bolt);}
   faces.push({label,pixels:[w,h],font:art.font,inkWidth:art.inkWidth,available:art.available});
  }
  const geometry=mergeIndexedGeometries(parts);parts.forEach(g=>g.dispose());geometries.push(geometry);
  const backing=new THREE.Mesh(geometry,iron);backing.userData.drainStaticLight=true;root.add(backing);
  records.push({text,width,height,depth:.056,faces});return root;
 }
 return {make,stats:()=>({count:records.length,plates:records,style:'weathered-lit-enamel',textures:textures.length}),dispose(){textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());}};
}
