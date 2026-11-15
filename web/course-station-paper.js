import * as THREE from './vendor/three/three.module.js';

// Small printed capitals drawn as whole texels, without font-loading or
// anti-aliased glyph edges. This lettering belongs to physical paperwork.
const GLYPHS={
 A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,18,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,25,21,19,17,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,10,4,4,4,4],Z:[31,1,2,4,8,16,31],
 0:[14,17,19,21,25,17,14],1:[4,12,4,4,4,4,14],2:[14,17,1,2,4,8,31],3:[30,1,1,14,1,1,30],4:[2,6,10,18,31,2,2],5:[31,16,16,30,1,1,30],6:[14,16,16,30,17,17,14],7:[31,1,2,4,8,8,8],8:[14,17,17,14,17,17,14],9:[14,17,17,15,1,1,14],'-':[0,0,0,31,0,0,0],'/':[1,2,2,4,8,8,16],':':[0,4,4,0,4,4,0],'.':[0,0,0,0,0,4,4]
};
// Physical screens and paperwork share the same authored whole-pixel capitals.
export {GLYPHS as COURSE_PIXEL_GLYPHS};
export const STATION_PAPER={log:[256,320],release:[192,256],stamp:[128,128],receipt:[128,128]};
export function paintStationPaper(g,kind){
 const [w,h]=STATION_PAPER[kind];
 const rect=(x,y,width,height,color)=>{g.fillStyle=color;g.fillRect(x,y,width,height);};
 const text=(label,x,y,scale=1,color='#465044')=>{for(const ch of label){const rows=GLYPHS[ch]||[];rows.forEach((bits,row)=>{for(let col=0;col<5;col++)if(bits&(1<<(4-col)))rect(x+col*scale,y+row*scale,scale,scale,color);});x+=6*scale;}};
 const line=(y)=>rect(12,y,w-24,1,'#8c977f');
 const frame=(x,y,width,height,color='#8c977f')=>{rect(x,y,width,1,color);rect(x,y+height-1,width,1,color);rect(x,y,1,height,color);rect(x+width-1,y,1,height,color);};
 rect(0,0,w,h,'#cfc3a2');rect(0,0,3,h,'#b2a784');rect(w-2,0,2,h,'#b9ae8c');rect(0,h-3,w,3,'#b0a482');
 // Sparse fibre clusters and folded edges leave the writing area quiet.
 let seed=411+Object.keys(STATION_PAPER).indexOf(kind)*37;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<130;i++){const x=Math.floor(random()*w),y=Math.floor(random()*h);rect(x,y,1+Math.floor(random()*3),1,i%3?'#cabe9d':'#d5caac');}
 rect(8,h-16,18,1,'#b8ad8c');rect(8,h-15,12,1,'#dbcfb0');
 if(kind==='log'){
  rect(12,12,w-24,33,'#475548');text('FIELD LOG',22,21,2,'#e0d5b5');text('NIGHT ORDER / 041',14,55);text('GROUNDS MAINTENANCE',14,70);line(85);
  text('AREA',18,96);text('PASS',90,96);text('REMARKS',140,96);rect(78,90,1,142,'#8c977f');rect(127,90,1,142,'#8c977f');
  const rows=['TEE','ROUGH','RANGE','DRAIN'];for(let i=0;i<4;i++){const y=118+i*28;line(y+20);text(rows[i],18,y);frame(94,y-1,11,11);for(let j=0;j<3;j++)rect(141+j*19,y+3+(j%2),12+(i+j)%5,1,'#76806a');}
  text('SHIFT RECORD',16,251);line(269);text('STAMP COPY BELOW',16,282);text('FORM 02 / RETAIN ON SITE',16,302,1,'#7b715b');
 }else if(kind==='release'){
  rect(10,12,w-20,28,'#475548');text('RELEASE REVIEW',17,22,1,'#e0d5b5');text('ORDER 041',14,52);line(68);text('FIELD CHECKS: 3',14,80);text('AUDIT / LOG / REVIEW',14,96);line(113);
  frame(14,125,w-28,47);text('SIGN OFF',20,132,1,'#7a8069');text('FILE AT SERVICE DESK',14,188);line(206);text('RETAIN ISSUED COPY',14,219);text('FORM 03',14,238,1,'#7b715b');
 }else if(kind==='stamp'){
  text('FIELD COPY',12,13);text('041 / LOG',12,27);line(41);frame(26,53,76,48);text('STAMP',48,72,1,'#9b9f82');text('RETAIN',45,111,1,'#7b715b');
 }else{
  for(let x=6;x<w-4;x+=5)rect(x,5,2,1,'#9b947a');text('ORDER 041',12,16);text('RELEASE',12,32);line(46);text('FILED',17,61,2,'#855e4a');line(85);text('COPY 03',12,97);text('NIGHT SHIFT',12,111,1,'#7b715b');
 }
}

export function createStationPaperFace(kind,width,height,thickness=.012){
 const canvas=document.createElement('canvas');[canvas.width,canvas.height]=STATION_PAPER[kind];paintStationPaper(canvas.getContext('2d'),kind);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;map.name='StationPaper:'+kind;
 const material=new THREE.MeshLambertMaterial({map});
 // Crispness comes from the authored ink texels. Keep continuous physical
 // lighting on this pale stock so a nearby source does not form contour bands.
 const geometry=new THREE.BoxGeometry(width,height,thickness),uv=geometry.attributes.uv,normal=geometry.attributes.normal;
 // Printed face and blank stock edges/back belong to one physical sheet.
 // Avoid a second almost-coplanar receiver above a bevelled backing sheet.
 for(let i=0;i<uv.count;i++)if(normal.getZ(i)<.5)uv.setXY(i,4/canvas.width,1-4/canvas.height);
 const face=new THREE.Mesh(geometry,material);face.name='StationPaper:'+kind;face.castShadow=face.receiveShadow=true;face.userData.keepDynamic=true;
 // Each face owns its geometry/material/map. The existing world teardown
 // disposes them once; they do not also enter the static surface cache.
 return face;
}

// Ink is a single flat mesh of connected pixel strokes, not a raised seal.
// Row runs keep the lettering crisp without one mesh/draw per printed pixel.
export function createStationInkGeometry(width,height){
 const w=44,h=13,pixels=Array.from({length:h},()=>Array(w).fill(false));
 for(let x=0;x<w;x++)if(x!==5&&x!==31){pixels[0][x]=true;pixels[h-1][x]=true;}
 for(let y=1;y<h-1;y++){pixels[y][0]=true;pixels[y][w-1]=y!==8;}
 let x=7;for(const ch of 'FILED'){GLYPHS[ch].forEach((bits,y)=>{for(let col=0;col<5;col++)if(bits&(1<<(4-col)))pixels[y+3][x+col]=true;});x+=6;}
 const positions=[],normals=[],uvs=[],indices=[];
 for(let y=0;y<h;y++)for(let x=0;x<w;){if(!pixels[y][x]){x++;continue;}const start=x;while(x<w&&pixels[y][x])x++;
  const left=(start/w-.5)*width,right=(x/w-.5)*width,top=(.5-y/h)*height,bottom=(.5-(y+1)/h)*height,index=positions.length/3;
  positions.push(left,bottom,0,right,bottom,0,right,top,0,left,top,0);normals.push(0,0,1,0,0,1,0,0,1,0,0,1);uvs.push(0,0,1,0,1,1,0,1);indices.push(index,index+1,index+2,index,index+2,index+3);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);return geometry;
}
