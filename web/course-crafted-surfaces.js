import * as THREE from './vendor/three/three.module.js';
import {createCourseSurfaces} from './course-surfaces.js';

// Level 1's small repeating materials use directional, connected pixel marks.
// Keep the shared chapter palette/fallback and the existing .7 m surface scale.
const palettes={
  wood:['#292c23','#3c3d2c','#57513a','#797052','#a18b64'],
  paint:['#203c38','#31554a','#426a59','#67765c','#9c8657'],
  brass:['#53452a','#7b673d','#a28c52','#c0a76b','#466358'],
  iron:['#252f2b','#3b4438','#565a46','#7d7758','#a0926a'],
  stone:['#303d3a','#465650','#607168','#819086','#a5aca0'],
  rubber:['#151e1c','#202d27','#334037','#485044','#666750'],
  rust:['#442c22','#67402b','#8e5b38','#ad7d50','#5c6950']
};

export function paintCourseSurface(g,type){
  const colors=palettes[type];if(!colors)return false;
  let seed=173+Object.keys(palettes).indexOf(type)*307;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const integer=n=>Math.floor(random()*n);
  // Wrap every mark so no hard border is introduced at repeat seams.
  const rect=(x,y,w,h,shade,alpha=1)=>{
    g.fillStyle=colors[shade];g.globalAlpha=alpha;
    for(const dx of [-128,0,128])for(const dy of [-128,0,128])g.fillRect(Math.floor(x)+dx,Math.floor(y)+dy,Math.ceil(w),Math.ceil(h));
  };
  const cluster=(x,y,w,h,shade,alpha=1)=>{
    rect(x+2,y,w-4,h,shade,alpha);rect(x,y+2,w,h-4,shade,alpha);
    rect(x+integer(3),y+h-2,w*.6,2,shade,alpha);
  };
  g.clearRect(0,0,128,128);rect(0,0,128,128,1);
  if(type!=='rubber')rect(0,0,128,128,2,type==='stone'?.55:.3);
  if(type==='stone'){
    // Broad mineral planes, stepped fractures and a few lighter inclusions.
    for(let i=0;i<32;i++)cluster(integer(128),integer(128),8+integer(23),6+integer(13),i%3===0?0:2,.23);
    // Intermediate flaked faces bridge the large planes and sparse fine grains.
    // Their highlights occupy one side, giving each cluster a readable shape.
    for(let i=0;i<220;i++){
      const x=integer(128),y=integer(128),w=2+integer(5),h=2+integer(4);
      rect(x,y,w,h,i%4===0?0:2,.27);
      rect(x+1,y,w-1,1,i%5===0?4:3,.34);
      if(i%3===0)rect(x,y+h,Math.max(1,w-2),1,0,.25);
    }
    for(let i=0;i<13;i++){
      let x=integer(128),y=integer(128);
      for(let j=0;j<3+integer(4);j++){const w=3+integer(6);rect(x,y,w,1,0,.46);rect(x,y+1,w-1,1,3,.22);x+=w-1;y+=integer(3)-1;}
    }
    for(let i=0;i<240;i++)rect(integer(128),integer(128),1+integer(3),1+integer(2),i%5===0?4:i%3===0?0:2,.25);
  }else if(type==='wood'){
    // Grain follows the plank rather than forming isotropic static.
    for(let i=0;i<100;i++){
      let x=integer(128),y=integer(128);const shade=i%3===0?0:2;
      for(let j=0;j<4;j++){rect(x,y,1+integer(2),5+integer(15),shade,.46);y+=10+integer(8);x+=integer(3)-1;}
    }
    for(const [x,y]of [[27,38],[92,100]]){
      rect(x-3,y-9,7,19,0,.28);rect(x-5,y-5,11,10,0,.28);
      rect(x-2,y-4,4,9,0,.8);rect(x+3,y-6,1,13,3,.5);
    }
    for(let i=0;i<18;i++)rect(integer(128),integer(128),1,4+integer(14),3,.27);
  }else if(type==='rubber'){
    // Quiet vulcanized rubber: broad compression variation, sparse shallow scuffs.
    for(let i=0;i<16;i++)cluster(integer(128),integer(128),9+integer(21),5+integer(12),i%3===0?0:2,.13);
    for(let i=0;i<22;i++)rect(integer(128),integer(128),3+integer(7),1,i%4===0?3:0,.24);
  }else{
    const patina=type==='brass',rust=type==='rust',paint=type==='paint';
    for(let i=0;i<18;i++)cluster(integer(128),integer(128),8+integer(18),5+integer(12),i%3===0?0:2,.16);
    // Small connected islands of corrosion/chipping, with a one-pixel edge.
    for(let i=0;i<(rust?37:paint?11:patina?14:9);i++){
      const x=integer(128),y=integer(128),w=4+integer(rust?11:5),h=4+integer(rust?9:4);
      cluster(x,y,w,h,patina?4:rust?2:0,patina?.52:.7);
      rect(x+2,y+h,w-3,1,rust?3:2,.55);
      if(i%3===0)rect(x+2,y+1,2,1,3,.5);
    }
    for(let i=0;i<(paint?12:24);i++)rect(integer(128),integer(128),2+integer(8),1,i%4===0?3:2,.25);
  }
  g.globalAlpha=1;return true;
}

export function createCraftedCourseSurfaces(surfaceTextures=new Map()){
  const fallback=createCourseSurfaces(surfaceTextures);
  return {
    texture(type){
      if(surfaceTextures.has(type))return surfaceTextures.get(type);
      if(!palettes[type])return fallback.texture(type);
      const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
      paintCourseSurface(canvas.getContext('2d'),type);
      const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
      t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;
      t.name='CourseCraftedSurface:'+type;surfaceTextures.set(type,t);return t;
    },
    dispose:fallback.dispose
  };
}
