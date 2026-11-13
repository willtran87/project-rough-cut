import * as THREE from './vendor/three/three.module.js';

// Four small, native pixel panes share one atlas and one instanced draw. Dirt
// obscures the bulb rather than glowing itself; ribs catch only a thin line.
export function createDrainLampGlass(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const c=canvas.getContext('2d'),size=128;
 const noise=n=>{const v=Math.sin(n*127.1+17.3)*43758.5453;return v-Math.floor(v);};
 for(let pane=0;pane<4;pane++){
  c.save();c.translate((pane%2)*size,Math.floor(pane/2)*size);
  c.fillStyle='#11110f';c.fillRect(0,0,size,size);
  // Frosted glass surrounds a modest, elongated bulb. Quantized light bands
  // preserve the pixel-art edge language without a smooth luminous rectangle.
  for(let y=6;y<122;y+=2)for(let x=6;x<122;x+=2){
   const dx=(x-62-pane*2)/39,dy=(y-65)/55;
   const bulb=Math.max(0,1-dx*dx-dy*dy),v=Math.round((19+bulb*65+noise(x+y*131+pane*917)*6)/5)*5;
   c.fillStyle=`rgb(${v},${v},${Math.round(v*.94)})`;c.fillRect(x,y,2,2);
  }
  // Interior socket, two lead wires and a narrow incandescent U. These stay
  // behind the exterior dirt, cracks and the existing physical cage bars.
  c.fillStyle='#1a1916';c.fillRect(51,8,26,17);
  c.fillStyle='#77766c';c.fillRect(55,26,2,53);c.fillRect(70,26,2,53);
  c.fillStyle='#c4c1a6';c.fillRect(57,49,2,31);c.fillRect(68,49,2,31);c.fillRect(59,79,9,2);
  c.fillStyle='#ece6ca';c.fillRect(59,78,9,1);
  for(let x=16;x<120;x+=16){c.fillStyle='#242522';c.fillRect(x,7,2,114);c.fillStyle='#56564e';c.fillRect(x+2,8,1,111);}
  // Heavy deposits belong to the gasket and lower corners, with broken edges.
  for(let i=0;i<110;i++){
   const x=Math.floor(noise(i+pane*103)*120)+4,y=Math.floor(noise(i*3+pane*79)*120)+4;
   const edge=Math.min(x,127-x,y,127-y);
   if(edge>12&&noise(i*17+pane)<.87)continue;
   c.fillStyle=i%3?'#171916':'#303129';c.fillRect(x,y,2+i%4,1+i%3);
  }
  for(let i=0;i<12;i++){
   const x=8+Math.floor(noise(i+pane*19)*109),y=91+Math.floor(noise(i*7+pane)*29);
   c.fillStyle='#1e211b';c.fillRect(x,y,1+i%3,Math.min(122-y,3+i%7));
  }
  // A different short corner fracture in each pane; no bright white starburst.
  let x=pane%2?109:17,y=10+pane*3;
  for(let i=0;i<16;i++){c.fillStyle=i%3?'#1c201b':'#626356';c.fillRect(x,y,2,2);x+=pane%2?-1:1;y+=2;if(i===8)c.fillRect(x-4,y,5,1);}
  c.restore();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
 const material=new THREE.MeshBasicMaterial({map:texture});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='attribute vec2 lampPane;\nvarying float lampFace;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=vMapUv*.5+lampPane;\nlampFace=abs(normal.z);');
  shader.fragmentShader='varying float lampFace;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(.035,1.,lampFace);');
 };
 material.customProgramCacheKey=()=> 'drain-lamp-pane-v1';
 return {material,texture,bind(geometry,count){
  const offsets=new Float32Array(count*2);
  for(let i=0;i<count;i++){offsets[i*2]=(i%2)*.5;offsets[i*2+1]=Math.floor(i%4/2)*.5;}
  geometry.setAttribute('lampPane',new THREE.InstancedBufferAttribute(offsets,2));
 },stats:{variants:4,atlas:[256,256],pane:[128,128],additionalDraws:0},dispose(){texture.dispose();material.dispose();}};
}
