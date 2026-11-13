import * as THREE from './vendor/three/three.module.js';

// Damp masonry, mineral runs and trodden mud. All variation is deterministic
// at construction time; water sheen uses the same UVs as the surface below it.
export function createUnderGreenSurfaces(){
 const textures={};
 const grey=n=>`rgb(${n},${n},${n})`;
 function tile(name,paint){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.save();c.scale(2,2);paint(c);c.restore();
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;textures[name]=t;
 }
 const rect=(c,value,x,y,w,h)=>{c.fillStyle=grey(value);c.fillRect(x,y,w,h);};
 tile('brick',c=>{
  rect(c,132,0,0,128,128);
  for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
   const x=col*32+(row%2)*16,y=row*16,n=176+((row*13+col*7+35)%5)*3;
   rect(c,n,x+1,y+1,30,14);rect(c,n+6,x+2,y+1,28,1);rect(c,n-7,x+1,y+13,30,2);
   if((row+col*3)%4===0){rect(c,n-9,x+5,y+9,8,2);rect(c,n-9,x+9,y+7,4,2);}
  }
 });
 tile('sand',c=>{
  rect(c,192,0,0,128,128);
  for(const [y,h,value]of [[0,20,193],[20,4,181],[24,30,199],[54,12,188],[66,31,194],[97,3,179],[100,28,188]]){
   rect(c,value,0,y,128,h);
   for(let i=0;i<5;i++){const x=(i*29+y*3)%128;rect(c,value-5,x,y+Math.min(h-1,3+i%3),7+i*2,1);}
  }
 });
 tile('concrete',c=>{
  rect(c,185,0,0,128,128);rect(c,166,0,0,128,2);rect(c,174,0,64,128,1);
  for(const x of [16,112])for(const y of [16,112]){rect(c,161,x,y,3,3);rect(c,177,x+1,y+1,1,1);}
  for(const [x,y,w,h]of [[27,33,26,4],[32,37,19,3],[79,82,23,5],[82,87,13,4]])rect(c,180,x,y,w,h);
 });
 tile('panel',c=>{
  rect(c,188,0,0,128,128);
  for(let x=0;x<128;x+=32){rect(c,158,x,0,2,128);rect(c,198,x+2,0,2,128);rect(c,176,x+29,0,3,128);}
  for(const y of [8,119])for(const x of [8,40,72,104])rect(c,151,x,y,2,2);
  rect(c,178,69,81,3,17);rect(c,178,72,87,2,6);
 });
 tile('tile',c=>{
  rect(c,157,0,0,128,128);
  for(let y=0;y<128;y+=32)for(let x=0;x<128;x+=32){const n=201+((x+y)/32%3)*3;rect(c,n,x+1,y+1,30,30);rect(c,n+5,x+2,y+2,28,1);rect(c,n-5,x+2,y+29,28,2);}
 });
 tile('floor',c=>{
  rect(c,151,0,0,128,128);
  for(let row=0;row<4;row++)for(let col=-1;col<3;col++){const x=col*64+(row%2)*32,y=row*32,n=175+((row+col+4)%3)*3;rect(c,n,x+1,y+1,62,30);rect(c,n-5,x+8,y+22,14,3);rect(c,n-5,x+17,y+19,8,3);}
 });
 // Break the clean geometric tiles with broad seepage stains and root cracks.
 // Several scales keep the wall readable without a uniform television-noise layer.
 let seed=71431;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const name of ['brick','concrete','panel','tile','sand']){
  const c=textures[name].image.getContext('2d');c.save();c.scale(2,2);
  for(let i=0;i<34;i++){
   const x=Math.floor(random()*128),y=Math.floor(random()*128),w=3+Math.floor(random()*19),h=8+Math.floor(random()*45);
   c.fillStyle=i%3?'rgba(19,29,21,.13)':'rgba(65,43,25,.16)';c.fillRect(x,y,w,h);
   c.fillStyle='rgba(9,19,17,.16)';c.fillRect(x+2,y,Math.max(1,w/3),h+12);
   if(i%4===0){c.fillStyle='rgba(107,123,91,.16)';c.fillRect(x-1,y,1,h*.6);}
  }
  c.strokeStyle='rgba(10,17,14,.46)';c.lineWidth=1;
  for(let i=0;i<7;i++){let x=random()*128,y=random()*100;c.beginPath();c.moveTo(x,y);for(let j=0;j<5;j++){x+=random()*8-4;y+=4+random()*6;c.lineTo(Math.round(x),Math.round(y));}c.stroke();}
  c.restore();textures[name].needsUpdate=true;
 }
 tile('mud',c=>{
  c.fillStyle='#504735';c.fillRect(0,0,128,128);
  for(let i=0;i<170;i++){
   const x=Math.floor(random()*128),y=Math.floor(random()*128),w=2+Math.floor(random()*18),h=2+Math.floor(random()*7);
   c.fillStyle=['#554b36','#383b2e','#65543a','#33382f','#454331'][i%5];c.fillRect(x,y,w,h);
  }
  // Sunken water pockets, rutted edges and tiny wet stones interrupt the mud.
  for(let i=0;i<15;i++){
   const x=random()*128,y=random()*128;
   c.fillStyle='#202e2b';c.beginPath();c.ellipse(x,y,5+random()*17,2+random()*5,-.22,0,Math.PI*2);c.fill();
   c.fillStyle='#57645a';c.fillRect(x-3,y+2,4+random()*9,1);
  }
  for(let i=0;i<60;i++){const x=random()*128,y=random()*128;c.fillStyle=i%3?'#6a6650':'#7d8373';c.fillRect(x,y,1+random()*2,1);}
 });
 tile('mudDeposit',c=>{
  c.fillStyle='#897450';c.fillRect(0,0,128,128);
  for(let i=0;i<220;i++){
   c.fillStyle=['#64583e','#746746','#9b8560','#574e36','#827253'][i%5];
   const x=random()*128,y=random()*128;
   c.fillRect(x,y,2+random()*16,1+random()*7);
  }
  for(let i=0;i<35;i++){c.fillStyle='#aba285';c.fillRect(random()*128,random()*128,1,1);}
 });
 tile('rootBark',c=>{
  c.fillStyle='#85735b';c.fillRect(0,0,128,128);
  for(let i=0;i<105;i++){
   const x=Math.floor(random()*128),y=Math.floor(random()*128);
   c.fillStyle=['#514b38','#67583f','#9a8564','#746a4d'][i%4];
   c.fillRect(x,y,1+Math.floor(random()*3),5+Math.floor(random()*28));
  }
 });
 tile('wetness',c=>{
  c.fillStyle='#121212';c.fillRect(0,0,128,128);
  for(let i=0;i<24;i++){c.fillStyle=i%3?'#b1b1b1':'#eeeeee';c.beginPath();c.ellipse(random()*128,random()*128,4+random()*18,2+random()*6,-.22,0,Math.PI*2);c.fill();}
 });
 const wetContext=textures.wetness.image.getContext('2d'),wetData=wetContext.getImageData(0,0,256,256);
 for(let i=0;i<wetData.data.length;i+=4){
  const value=Math.round(wetData.data[i]*(.17+random()*.55));
  wetData.data[i]=wetData.data[i+1]=wetData.data[i+2]=value;
 }
 wetContext.putImageData(wetData,0,0);textures.wetness.needsUpdate=true;
 // Fine native-resolution pits, mineral grains and fibers sit over the larger
 // authored forms. Keep nearest magnification: detailed pixel art, not blur.
 for(const [name,texture]of Object.entries(textures)){
  if(name==='wetness')continue;
  const c=texture.image.getContext('2d'),data=c.getImageData(0,0,256,256),pixels=data.data;
  for(let i=0;i<pixels.length;i+=4){
   const grain=Math.floor(random()*7)-3,deep=random()<.025?-18:0;
   for(let channel=0;channel<3;channel++)pixels[i+channel]=Math.max(0,Math.min(255,pixels[i+channel]+grain*2+deep));
  }
  c.putImageData(data,0,0);texture.needsUpdate=true;
 }
 textures.wetness.colorSpace=THREE.NoColorSpace;
 return {textures,dispose(){Object.values(textures).forEach(t=>t.dispose());}};
}
