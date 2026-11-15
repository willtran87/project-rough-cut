import * as THREE from './vendor/three/three.module.js';

// One tiny atlas shared by all lantern metal. No extra geometry, lights or pass.
export function createLanternMetalTexture(){
 const c=document.createElement('canvas');c.width=64;c.height=64;
 const g=c.getContext('2d');g.fillStyle='#77705a';g.fillRect(0,0,64,64);
 const bands=[[0,3,'#c3b486'],[3,4,'#8c805c'],[7,3,'#3e483d'],[10,39,'#77705a'],[49,5,'#424b3d'],[54,3,'#b3a271'],[57,7,'#575945']];
 for(const [y,h,color]of bands){g.fillStyle=color;g.fillRect(0,y,64,h);}
 for(let i=0;i<56;i++){const x=(i*23+7)%64,y=(i*17+11)%64;g.fillStyle=i%3?'#635f4b':'#a49770';g.fillRect(x,y,2+i%4,1+i%2);}
 for(let x=7;x<64;x+=16){g.fillStyle='#303d34';g.fillRect(x,12,4,2);g.fillStyle='#a99a70';g.fillRect(x,14,3,1);g.fillStyle='#495344';g.fillRect(x+3,24,2,8);}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.userData.sharedPixelArt=true;return texture;
}
