import * as THREE from './vendor/three/three.module.js';

// The profile travels down the cavity and back up the outside. Reversing this
// order makes the outer bronze face inward and exposes the rear inner wall.
export const AUDIT_BELL_PROFILE=[
 [.07,-.10],[.16,-.35],[.27,-.51],[.30,-.55],[.34,-.52],
 [.31,-.49],[.20,-.38],[.12,-.18],[.10,-.06],[.07,0],[.07,-.10]
];

export function createAuditBellGeometry(){
 const g=new THREE.LatheGeometry(AUDIT_BELL_PROFILE.map(p=>new THREE.Vector2(...p)),32);
 const uv=g.attributes.uv,p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const row=i%AUDIT_BELL_PROFILE.length,inside=row<=3||row===10;
  // Separate exterior/cavity bands; world height sets the vertical pixel size.
  // Half-texel gutters keep the nearest-filtered face away from the other band.
  const y=(inside?129:1)+Math.max(0,Math.min(1,-p.getY(i)/.55))*125;
  // Present the cast stamps to the western interaction approach and its reverse.
  uv.setX(i,uv.getX(i)+.25);
  uv.setY(i,1-(y+.5)/256);
 }
 g.computeBoundingBox();return g;
}

export function paintAuditBell(g){
 const width=384;
 let seed=41041;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const integer=n=>Math.floor(rand()*n);
 // All strokes are whole texels. Marks wrap around the circumference, including
 // the front maker's stamp which straddles the cylindrical UV seam.
 const rect=(x,y,w,h,color)=>{g.fillStyle=color;for(const offset of [-width,0,width])g.fillRect(x+offset,y,w,h);};
 const chip=(x,y,w,h,color)=>{rect(x+1,y,w-2,h,color);rect(x,y+1,w,h-2,color);};
 rect(0,0,width,128,'#9f8855');rect(0,128,width,128,'#756645');
 for(let i=0;i<180;i++){
  const x=integer(width),y=integer(126),w=3+integer(11),h=2+integer(5);
  chip(x,y,w,h,i%3===0?'#877547':i%3===1?'#ae9863':'#947e4f');
 }
 // Casting seams wrap around the shoulder and sound bow; abrasion follows
 // the lower lip rather than being distributed like random static.
 for(const y of [24,28,108,113]){rect(0,y,width,1,'#746341');rect(0,y+1,width,1,'#b49b62');}
 rect(0,120,width,7,'#bca36b');rect(0,125,width,2,'#d0b87d');
 for(let i=0;i<55;i++){
  const x=integer(width),y=i<25?integer(20):96+integer(26),w=3+integer(8),h=2+integer(7);
  chip(x,y,w,h,'#677353');chip(x+1,y+1,Math.max(3,w-2),Math.max(3,h-2),i%3?'#657665':'#4f685b');
  if(i%3===0)rect(x+1,y+h,w-1,1,'#8b885a');
 }
 for(let i=0;i<18;i++){
  const x=integer(width),y=14+integer(17);rect(x,y,1,5+integer(13),'#89764b');rect(x+1,y,1,3+integer(7),'#b19a63');
 }
 for(let i=0;i<45;i++){const x=integer(width);rect(x,121+integer(5),2+integer(6),1,i%3?'#d2bb80':'#947b4e');}
 // Two small cast foundry stamps, front and rear. This is surface decoration,
 // not another navigation label or a glowing instruction.
 const digits={0:['111','101','101','101','111'],4:['101','101','111','001','001'],1:['010','110','010','010','111']};
 for(const center of [0,192]){
  const y=67;
  rect(center-15,y-5,30,1,'#78643e');rect(center-18,y-2,1,19,'#78643e');rect(center+17,y-2,1,19,'#78643e');rect(center-15,y+20,30,1,'#c0a56a');
  for(const [n,d]of [...'041'].entries())for(let row=0;row<5;row++)for(let col=0;col<3;col++)if(digits[d][row][col]==='1'){
   rect(center-11+n*8+col*2,y+row*2+1,2,2,'#c0a56a');rect(center-11+n*8+col*2,y+row*2,2,2,'#75613e');
  }
  for(let x=-12;x<=12;x+=4)rect(center+x,y+15,2,1,'#b7a068');
 }
 for(let i=0;i<110;i++)chip(integer(width),130+integer(124),3+integer(9),3+integer(7),i%3?'#7b6a47':'#62634b');
 rect(0,252,width,4,'#b39a65');
}

export function createAuditBellBody(){
 const canvas=document.createElement('canvas');canvas.width=384;canvas.height=256;paintAuditBell(canvas.getContext('2d'));
 const map=new THREE.CanvasTexture(canvas);map.name='AuditBellCastBronze';map.colorSpace=THREE.SRGBColorSpace;map.wrapS=THREE.RepeatWrapping;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;
 const material=new THREE.MeshLambertMaterial({map,color:0xffffff});material.name='AuditBellCastBronze';
 material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','vec3 bellShade=floor(sqrt(max(outgoingLight,vec3(0.0)))*48.0+.5)/48.0;\noutgoingLight=bellShade*bellShade;\n#include <opaque_fragment>');};
 material.customProgramCacheKey=()=> 'course-audit-bell-bronze-v1';
 const body=new THREE.Mesh(createAuditBellGeometry(),material);body.name='AuditBellBody';body.castShadow=body.receiveShadow=true;
 // This dynamic mesh owns its geometry/material/map. The scene teardown
 // releases them; they are intentionally not also in the static surface cache.
 return body;
}
