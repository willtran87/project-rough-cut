import * as THREE from './vendor/three/three.module.js';
// Small native pixel maps, built once. Cloth weave and face features belong to
// the moving model; no screen-space filter, extra atlas download or post pass.
export function runnerMaterials(base){
 const make=()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;return [canvas,canvas.getContext('2d')];};
 const [cloth,c]=make();c.fillStyle='#526d70';c.fillRect(0,0,128,128);
 let seed=9173;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;};
 for(let i=0;i<6500;i++){c.fillStyle=['#405758','#5b7474','#6d8581','#344b50'][i%4];c.globalAlpha=.24;c.fillRect(Math.floor(rand()*128),Math.floor(rand()*128),1,1+Math.floor(rand()*3));}c.globalAlpha=1;
 for(let y=4;y<128;y+=8){c.fillStyle='#708580';c.fillRect(4,y,1,3);c.fillRect(122,y,1,3);}
 // Broken diagonal twill, stitched seams and broad stepped fold shading read
 // at chase distance; fine wear only becomes apparent when the actor is near.
 for(let y=0;y<128;y+=4)for(let x=y%8;x<128;x+=8){c.fillStyle='#78928b';c.globalAlpha=.13;c.fillRect(x,y,2,1);}c.globalAlpha=1;
 for(let i=0;i<12;i++){const x=9+i*10,y=12+(i*23)%99;c.fillStyle='#435e62';c.fillRect(x,y,3,13);c.fillRect(x+2,y+8,2,9);c.fillStyle='#6b8480';c.fillRect(x-1,y,1,11);}
 const [face,f]=make();f.fillStyle='#b6a188';f.fillRect(0,0,128,128);
 for(let i=0;i<7000;i++){const x=rand()*128,y=rand()*128;f.fillStyle=['#b8a38a','#a8917d','#c4b097','#89796b'][i%4];f.globalAlpha=.16;f.fillRect(x|0,y|0,1,2);}f.globalAlpha=1;
 f.fillStyle='#74685f';f.fillRect(16,38,30,4);f.fillRect(83,38,29,4);f.fillStyle='#b7b4a0';f.fillRect(21,45,25,5);f.fillRect(83,45,24,5);f.fillStyle='#343c37';f.fillRect(33,44,6,7);f.fillRect(88,44,6,7);
 f.fillStyle='#574e45';f.fillRect(18,34,29,3);f.fillRect(82,33,29,3);f.fillStyle='#8b7564';f.fillRect(62,51,4,25);f.fillRect(53,75,19,3);f.fillStyle='#cebaa0';f.fillRect(59,52,3,22);f.fillStyle='#796458';f.fillRect(45,95,38,3);f.fillStyle='#c3aa91';f.fillRect(49,100,31,2);
 const patch=(color,points)=>{f.fillStyle=color;f.beginPath();points.forEach(([x,y],i)=>i?f.lineTo(x,y):f.moveTo(x,y));f.closePath();f.fill();};
 patch('#a18a76',[[0,29],[12,33],[15,65],[25,80],[20,106],[37,128],[0,128]]);
 patch('#a18a76',[[128,24],[116,33],[111,70],[104,81],[108,106],[90,128],[128,128]]);
 patch('#c3ad93',[[30,62],[45,60],[48,66],[40,71],[26,73]]);
 patch('#c3ad93',[[83,62],[99,60],[105,71],[90,74]]);
 // Tired lower lids, asymmetric raised brows and a tightly parted mouth.
 f.fillStyle='#7e6b5d';f.fillRect(23,53,22,2);f.fillRect(85,53,20,2);f.fillRect(28,56,16,1);f.fillRect(86,57,14,1);
 f.fillStyle='#4e443a';f.fillRect(21,32,22,3);f.fillRect(40,34,7,3);f.fillRect(83,31,23,3);f.fillRect(80,34,6,2);
 f.fillStyle='#ddc8aa';f.fillRect(34,44,2,2);f.fillRect(89,44,2,2);
 f.fillStyle='#947b68';f.fillRect(49,82,2,7);f.fillRect(78,81,2,8);f.fillRect(49,92,30,2);
 f.fillStyle='#564b43';f.fillRect(48,95,32,2);f.fillRect(55,97,20,1);f.fillStyle='#d0b69b';f.fillRect(53,101,24,2);
 f.fillStyle='#9b826f';f.fillRect(45,23,37,1);f.fillRect(51,27,27,1);
 for(let i=0;i<230;i++){const x=23+rand()*82,y=87+rand()*40;if(y<103&&x>42&&x<85)continue;f.fillStyle='#75675b';f.globalAlpha=.3;f.fillRect(x|0,y|0,1,1);}f.globalAlpha=1;
 const [hairCanvas,h]=make();h.fillStyle='#342e29';h.fillRect(0,0,128,128);
 for(let i=0;i<900;i++){const x=rand()*128,y=rand()*128;h.fillStyle=['#514438','#6c5841','#262724','#40372e'][i%4];const length=3+(rand()*15|0);h.fillRect(x|0,y|0,1,length);h.fillRect((x+1)|0,(y+length*.6)|0,1,length*.4);}
 const texture=canvas=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;return t;},weave=texture(cloth),portrait=texture(face);
 const shirt=base.cloth.clone();shirt.color.setHex(0xffffff);shirt.map=weave;
 const trousers=shirt.clone();trousers.color.setHex(0x626b63);
 const hairMap=texture(hairCanvas),hair=shirt.clone();hair.color.setHex(0xffffff);hair.map=hairMap;
 const skin=base.skin.clone();skin.map=portrait;skin.color.setHex(0xffffff);
 const skinBody=base.skin.clone();skinBody.color.setHex(0xb6a188);
 // Material.clone does not copy shader callbacks. Keep the course's pixel
 // quantization and reuse its prepared textured Lambert program.
 for(const m of [shirt,trousers,hair,skin,skinBody]){m.onBeforeCompile=base.cloth.onBeforeCompile;m.customProgramCacheKey=base.cloth.customProgramCacheKey;}
 return {materials:{...base,cloth:shirt,trousers,face:skin,hair,skin:skinBody},dispose(){shirt.dispose();trousers.dispose();hair.dispose();skin.dispose();skinBody.dispose();weave.dispose();portrait.dispose();hairMap.dispose();}};
}
