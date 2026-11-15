import * as THREE from './vendor/three/three.module.js';

// Editable pixel masters specific to the hand tool. Quiet fields carry long
// grain/forging marks, with clustered wear rather than all-over noise.
export function createScytheArt(){
 const textures=[];
 function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
 function texture(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;textures.push(t);return t;}
 const [wood,w]=canvas(256,1024);w.fillStyle='#514333';w.fillRect(0,0,256,1024);
 for(let n=0;n<31;n++){
  const x=n*9-8;w.fillStyle=['#594936','#63513b','#3d352b','#746047'][n%4];
  for(let y=0;y<1024;y+=4){const knot=Math.exp(-Math.pow((y-318)/78,2))*12-Math.exp(-Math.pow((y-788)/52,2))*8;
   if((Math.floor(y/36)+n*3)%11<2)continue;
   w.fillRect(Math.round((x+Math.sin(y/150+n)*3+knot)/2)*2,y,n%5===0?4:2,4);
  }
 }
 for(const [x,y]of [[80,318],[190,788]])for(let ring=4;ring>0;ring--){w.strokeStyle=ring%2?'#3d342a':'#66513a';w.lineWidth=2;w.beginPath();w.ellipse(x,y,ring*3,ring*7,0,0,Math.PI*2);w.stroke();}
 for(const [x,y,l]of [[30,140,80],[120,540,66],[214,900,46]]){w.fillStyle='#7b694e';w.fillRect(x,y,4,l);w.fillStyle='#40372b';w.fillRect(x+6,y+10,2,l-14);}
 const [steel,s]=canvas(1024,512),[sheen,k]=canvas(1024,512);
 s.fillStyle='#5c655f';s.fillRect(0,0,1024,512);k.fillStyle='#343434';k.fillRect(0,0,1024,512);
 for(let band=0;band<32;band++){
  const y=band*16;s.fillStyle=['#5e6761','#59625c','#606963','#5b645e'][band%4];s.fillRect((band*91)%210,y,520+(band*31)%280,8+(band%3)*2);
  for(let i=0;i<4;i++){const x=(band*173+i*271)%1024;s.fillStyle=band%3?'#68716a':'#505a54';s.fillRect(x,y+4+(i%3)*2,20+(i*17+band*13)%86,2);}
 }
 // Oxide near the socket. The physical cutting edge has a separate finish.
 for(let i=0;i<40;i++){
  const x=850+(i*47)%170,y=(i*83)%512;s.fillStyle=['#4c5149','#5c5746','#716149'][i%3];
  s.fillRect(x,y,8+(i*7)%26,2+(i*3)%8);k.fillStyle='#161616';k.fillRect(x,y,24,10);
 }
 const [grip,g]=canvas(128,256);g.fillStyle='#302f26';g.fillRect(0,0,128,256);
 for(let y=0;y<256;y+=16){g.fillStyle='#484435';g.fillRect(0,y,128,2);g.fillStyle='#22271f';g.fillRect(0,y+2,128,2);for(let x=0;x<128;x+=24){g.fillStyle='#55503c';g.fillRect(x+(y%32)/4,y+10,8,2);}}
 const steelMap=texture(steel),sheenMap=texture(sheen);sheenMap.colorSpace=THREE.NoColorSpace;
 const materials={
  wood:new THREE.MeshPhongMaterial({map:texture(wood),shininess:5,specular:0x191c17}),
  blade:new THREE.MeshPhongMaterial({map:steelMap,specularMap:sheenMap,shininess:46,specular:0x959c87}),
  edge:new THREE.MeshPhongMaterial({color:0x9aab9b,shininess:90,specular:0xb4bda5}),
  iron:new THREE.MeshPhongMaterial({color:0x393e35,shininess:18,specular:0x495447}),
  grip:new THREE.MeshPhongMaterial({map:texture(grip),shininess:7,specular:0x282d20})
 };
 materials.wood.map.wrapT=THREE.RepeatWrapping;
 return {materials,stats:()=>({style:'forged-grass-scythe',masters:{wood:[256,1024],steel:[1024,512],grip:[128,256]},textures:textures.length,emissive:false,independentSteelSheen:true}),dispose(){Object.values(materials).forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
