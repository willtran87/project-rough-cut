import * as THREE from './vendor/three/three.module.js';

// Close-range metal artwork is independent of the wall-panel sheet. Geometry
// supplies seams/bolts; these swatches supply enamel, abrasion and corrosion.
export async function createMachinerySurfaces(){
 const image=new Image();image.src='./assets/under-green/machinery-surfaces-v1.png';await image.decode();
 const tile=Math.floor(image.naturalWidth/2),owned=[],sets={};
 const texture=(canvas,color)=>{
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=color?THREE.NearestFilter:THREE.LinearFilter;
  t.minFilter=color?THREE.NearestMipmapLinearFilter:THREE.LinearMipmapLinearFilter;owned.push(t);return t;
 };
 // Independent subdued oil/damp response. No bright pigment is interpreted as
 // raised metal or a glossy patch; broad dry areas retain the base response.
 const mask=document.createElement('canvas');mask.width=mask.height=256;
 const c=mask.getContext('2d');c.fillStyle='#181818';c.fillRect(0,0,256,256);
 for(let i=0;i<9;i++){
  const x=(i*83+31)%256,y=(i*137+17)%256;c.fillStyle=i%3?'#353535':'#535353';
  c.beginPath();for(let j=0;j<18;j++){const a=j/18*Math.PI*2,r=1+.2*Math.sin(j*2.4+i);const px=x+Math.cos(a)*(5+i%4)*r,py=y+Math.sin(a)*(18+i%5*6)*r;j?c.lineTo(px,py):c.moveTo(px,py);}
  c.closePath();c.filter='blur(3px)';c.fill();c.filter='none';
 }
 const wet=texture(mask,false);
 for(const [i,name]of ['paint','metal','red','rust'].entries()){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=tile;
  canvas.getContext('2d').drawImage(image,i%2*tile,Math.floor(i/2)*tile,tile,tile,0,0,tile,tile);
  sets[name]={map:texture(canvas,true),wet};
 }
 return {sets,stats:()=>({asset:'machinery-surfaces-v1.png',tilePixels:tile,worldTileMetres:1,texelsPerMetre:tile,colorMaps:4,wetMaps:1,separateWetness:true,rgba8MipBytes:Math.round((4*tile*tile+256*256)*4*4/3)}),dispose(){owned.forEach(t=>t.dispose());}};
}
