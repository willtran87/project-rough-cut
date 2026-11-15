import * as THREE from './vendor/three/three.module.js';

// Shared palette and texture grain for both chapters. Cache ownership stays local.
export function createCourseSurfaces(surfaceTextures=new Map()){
 const random=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a);};
  function pixelSurface(type){
    if(surfaceTextures.has(type))return surfaceTextures.get(type);
    const palettes={wood:['#242a21','#3c3d2c','#57513a','#797052','#a18b64'],paint:['#203c38','#31554a','#426a59','#67765c','#9c8657'],brass:['#53452a','#7b673d','#a28c52','#c0a76b','#466358'],iron:['#252f2b','#3b4438','#565a46','#7d7758','#a0926a'],stone:['#303d3a','#465650','#607168','#819086','#a5aca0'],rubber:['#151e1c','#202d27','#334037','#485044','#666750'],rust:['#442c22','#67402b','#8e5b38','#ad7d50','#5c6950']};
    palettes.paper=['#a39470','#c3b28c','#d2c3a1','#e0d2b3','#ece0c4'];
    palettes['cart-enamel']=['#343b3d','#515b5d','#737d7e','#98a09e','#bec3bd'];
    palettes.weatherboard=['#1b292d','#2e4246','#4b5c5b','#758079','#9c937c'];
    palettes['roof-metal']=['#172a36','#293f4c','#3e5863','#697e83','#937957'];
    palettes.slate=['#182c39','#2a4354','#405d70','#637c89','#8a9c9f'];
    palettes.plaster=['#394845','#58675f','#7d8778','#a4aa96','#c1c1a9'];
    palettes.sand=['#555b4a','#74745c','#8b896a','#a7a080','#c3b995'];
    palettes['window-glass']=['#6f532a','#9f793d','#bd934f','#d3ac65','#e7c984'];
    const colors=palettes[type];if(!colors)return null;
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d',{willReadFrequently:true});g.fillStyle=colors[1];g.fillRect(0,0,128,128);
    const grain=type==='wood'||type==='weatherboard';
    for(let i=0;i<7000;i++){const x=Math.floor(random(i+31)*128),y=Math.floor(random(i+915)*128),shade=Math.floor(random(i+713)*colors.length);g.fillStyle=colors[shade];g.globalAlpha=grain?.38:type==='cart-enamel'?.13:.45;g.fillRect(x,y,grain?1:1+Math.floor(random(i)*3),grain?4+random(i+99)*22:1+Math.floor(random(i+1)*3));}g.globalAlpha=1;
    if(type==='cart-enamel'){for(let i=0;i<28;i++){const x=Math.floor(random(i+45)*128),y=Math.floor(random(i+841)*128);g.fillStyle=i%3?'#67706a':'#aab3aa';g.globalAlpha=.28;g.fillRect(x,y,1,2+Math.floor(random(i+32)*9));}g.globalAlpha=1;}
    if(type==='weatherboard')for(let i=0;i<32;i++){g.fillStyle=i%3?'#263c3e':'#8e8873';g.globalAlpha=.45;g.fillRect(Math.floor(random(i+4)*128),Math.floor(random(i+9)*128),1,8+random(i)*32);}g.globalAlpha=1;
    if(type==='roof-metal')for(let i=0;i<38;i++){g.fillStyle=i%3?'#715641':'#ab8156';g.globalAlpha=.35;g.fillRect(Math.floor(random(i+7)*128),Math.floor(random(i+29)*128),1+random(i)*3,3+random(i+15)*14);}g.globalAlpha=1;
    if(type==='wood')for(const x of [2,65]){g.fillStyle=colors[0];g.fillRect(x,0,2,128);g.fillStyle=colors[3];g.fillRect(x+2,0,1,128);}
    if(type==='paper'){
      // Ink and fibers belong to a real page; never reuse a painted clipboard,
      // fastener or prop silhouette as surface detail.
      g.fillStyle='#8d9983';for(let y=12;y<128;y+=12)g.fillRect(0,y,128,1);
      g.fillStyle='#a77d66';g.fillRect(15,0,1,128);
      g.fillStyle='#656b59';g.globalAlpha=.75;
      for(let row=0;row<8;row++)for(let word=0;word<3;word++){
        const x=23+word*30,y=20+row*12,w=8+Math.floor(random(row*3+word+84)*17);
        g.fillRect(x,y,w,1);g.fillRect(x+2,y-2,Math.max(2,w-6),1);
      }g.globalAlpha=1;
    }
    if(type==='stone')for(let i=0;i<28;i++){g.fillStyle=i%2?'rgba(38,65,39,.35)':'rgba(166,172,146,.16)';g.fillRect(random(i+4)*128,random(i+80)*128,4+random(i)*12,2+random(i+99)*6);}
    if(type==='sand'){
      // Fine, irregular rake grain, drawn into the small repeating pixel map.
      // No extra geometry, transparency pass or per-frame texture updates.
      for(let row=0;row<10;row++)for(let x=0;x<128;x++){
        const y=(row*13+Math.round(Math.sin(x/128*Math.PI*2+row*.6)*2))%128;
        g.fillStyle='#66694f';g.globalAlpha=.3;g.fillRect(x,y,1,1);
        g.fillStyle='#c3b995';g.globalAlpha=.18;g.fillRect(x,y+1,1,1);
      }g.globalAlpha=1;
    }
    if(['paint','brass','iron','rust'].includes(type))for(let i=0;i<85;i++){const x=random(i+921)*128,y=random(i+271)*128;g.fillStyle=i%3?'#8e7048':colors[4];g.fillRect(x,y,1+random(i+31)*4,1+random(i+41)*2);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;surfaceTextures.set(type,t);return t;
  }
 return {texture:pixelSurface,dispose(){for(const t of surfaceTextures.values())t.dispose();}};
}
