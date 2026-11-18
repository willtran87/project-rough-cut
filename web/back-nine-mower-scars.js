import * as THREE from './vendor/three/three.module.js';
import {terrainHeight} from './course-terrain.js';
import {COURSE,surfaceAt,angleDelta,noise} from './back-nine-course.js';
import {canMarkMownGround} from './mower-track-ground.js';
import {onFootpath} from './chase-footpath-layout.js';
import {mowerMouthTarget} from './chase-destruction.js';

const WIDTHS=[-2,-1.72,-1.45,-1.28,-1.1,-.91,-.5,0,.5,.91,1.1,1.28,1.45,1.72,2];
const ROWS=5,STEP=1.1,LENGTH=1.22,SLOTS=32,BATCHES=8;
const VERTICES=WIDTHS.length*ROWS+8*4+12*5;
const INDICES=(WIDTHS.length-1)*(ROWS-1)*6+8*6+12*9;
const tint=new THREE.Color();

export async function loadMowerScarSoil(){
 const map=await new THREE.TextureLoader().loadAsync('./assets/under-green/sediment-field-v1.webp');
 map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;
 map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;
 return map;
}

// Preserve all existing ground/light hooks. Soil is its own authored material,
// mixed only along the torn wheel-lane edges, at the asset's 313.5 texels/metre.
export function finishMowerScarSoil(material,map){
 const compile=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
 material.onBeforeCompile=s=>{
  compile(s);s.uniforms.scarSoilMap={value:map};
  s.vertexShader='attribute float scarSoil;varying float vScarSoil;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvScarSoil=scarSoil;');
  s.fragmentShader='uniform sampler2D scarSoilMap;varying float vScarSoil;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('vec3 turfTexel=texture2D(map,vMapUv).rgb;',`
   vec3 turfTexel;
   if(vScarSoil>.999)turfTexel=texture2D(scarSoilMap,vTurfMeters/4.0).rgb;
   else {
    turfTexel=texture2D(map,vMapUv).rgb;
    if(vScarSoil>.001)turfTexel=mix(turfTexel,texture2D(scarSoilMap,vTurfMeters/4.0).rgb,vScarSoil);
   }
  `);
 };
 material.customProgramCacheKey=()=>key()+'-scar-soil-v1';
}

// Preallocated world-space geometry: the cut and both tire lanes follow the
// terrain independently. Eight spatial batches retain the latest 280 metres
// without drawing the whole history or allocating decals during a chase.
export function createBackNineMowerScars(scene,material){
 const batches=Array.from({length:BATCHES},(_,i)=>{
  const g=new THREE.BufferGeometry();
  for(const [name,size]of [['position',3],['normal',3],['color',4],['uv',2],['scarSoil',1]])g.setAttribute(name,new THREE.BufferAttribute(new Float32Array(SLOTS*VERTICES*size),size).setUsage(THREE.DynamicDrawUsage));
  const indices=[];
  for(let slot=0;slot<SLOTS;slot++){
   const base=slot*VERTICES;
   for(let row=0;row<ROWS-1;row++)for(let col=0;col<WIDTHS.length-1;col++){const a=base+row*WIDTHS.length+col,b=a+WIDTHS.length;indices.push(a,a+1,b,a+1,b+1,b);}
   for(let q=0;q<8;q++){const a=base+WIDTHS.length*ROWS+q*4;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
   for(let q=0;q<12;q++){const a=base+WIDTHS.length*ROWS+32+q*5;indices.push(a,a+1,a+2,a+1,a+3,a+2,a+2,a+3,a+4);}
  }
  g.setIndex(indices);g.setDrawRange(0,0);
  const mesh=new THREE.Mesh(g,material);mesh.name='Joe terrain scars '+i;mesh.visible=false;scene.add(mesh);
  return {mesh,g,used:0};
 });
 let owner=null,lastTime=0,previous=null,carry=0,cursor=0,serial=0,skipped=0,uploads=0,wetTotal=0;
 const dirty=new Set(),point={x:0,y:0},boundsPoint=new THREE.Vector3();
 function reset(){previous=null;carry=cursor=serial=skipped=wetTotal=0;for(const b of batches){b.used=0;b.g.setDrawRange(0,0);b.mesh.visible=false;}}
 function stamp(x,y,yaw,run){
  const sin=Math.sin(yaw),cos=Math.cos(yaw),wet=surfaceAt({x,y},run)==='wet';
  if(!canMarkMownGround(x,y,yaw,point)){skipped++;return;}
  // Narrow inset footways can lie between the legacy footprint's corners.
  for(let a=-2;a<=2;a+=.4)for(let l=-.6;l<=.61;l+=.3){point.x=x+a*cos+l*sin;point.y=y-a*sin+l*cos;if(onFootpath(point,COURSE.footways)){skipped++;return;}}
  const b=batches[Math.floor(cursor/SLOTS)],slot=cursor%SLOTS,offset=slot*VERTICES;
  if(slot===0){b.used=0;b.g.setDrawRange(0,0);}
  let vertex=0;
  function put(across,along,color,height=.059,opacity=1,soil=0){
   const wx=x+across*cos+along*sin,wy=y-across*sin+along*cos,index=offset+vertex++;
   b.g.attributes.position.setXYZ(index,wx,terrainHeight(wx,wy)+height,-wy);
   const dx=terrainHeight(wx+.12,wy)-terrainHeight(wx-.12,wy),dy=terrainHeight(wx,wy+.12)-terrainHeight(wx,wy-.12),n=Math.hypot(dx,.24,dy);
   b.g.attributes.normal.setXYZ(index,-dx/n,.24/n,dy/n);
   b.g.attributes.uv.setXY(index,wx/4.4,-wy/4.4);
   b.g.attributes.scarSoil.setX(index,soil);
   tint.setHex(color);b.g.attributes.color.setXYZW(index,tint.r,tint.g,tint.b,opacity);
  }
  for(let row=0;row<ROWS;row++)for(let col=0;col<WIDTHS.length;col++){
   let across=WIDTHS[col];
   const lane=Math.abs(across)>.85&&Math.abs(across)<1.6,wheel=Math.abs(across)>.94&&Math.abs(across)<1.44;
   if(lane)across+=.055*Math.sin(serial*.81+row*1.3+Math.sign(across)*2);
   if(col===0||col===WIDTHS.length-1)across*=.95+.025*Math.sin((serial*4+row)*2.17)+.015*Math.cos(serial+row*3.1);
   const edge=col===0||col===WIDTHS.length-1,opacity=edge?0:wheel?.95:wet?.48:.72;
   const bite=noise(serial*19+row*7+(across>0?113:31));
   const tear=wheel?(wet?.65+.35*bite:.25+.75*bite):lane?.12+.12*Math.sin(serial*1.7+row*2.3):0;
   put(across,(row/(ROWS-1)-.5)*LENGTH,wheel?(wet?0x878d81:0xaeb29b):(row%2?0x647854:0x607450),.059,serial===0&&row===0?0:opacity,tear);
  }
  // Broken diagonal tread edges and several deposited clippings share the
  // same lit geometry/material. No floating brown planes over the hillside.
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const a=side*1.22,l=-.46+i*.29,jitter=.025*Math.sin(serial*7+i*2),shade=wet?0x737963:0x959b7d,opacity=.35+.4*noise(serial*13+i*3+side);
   put(a-.14,l+jitter,shade,.064,opacity,1);put(a+.14,l+.17+jitter,shade,.064,opacity*.5,1);
   put(a-.14,l+.035+jitter,shade,.064,opacity*.5,1);put(a+.14,l+.205+jitter,shade,.064,opacity,1);
  }
  for(let i=0;i<4;i++){
   const a=(i%2?1:-1)*(1.57+.17*Math.sin(serial*3+i)),l=-.43+(i>>1)*.59+.07*Math.cos(serial+i);
   for(let blade=0;blade<3;blade++){
    const angle=serial*2.4+i*1.8+blade*2.1,c=Math.cos(angle),s=Math.sin(angle),length=.16+.05*Math.sin(serial+blade+i),width=.018+.004*blade;
    const shade=wet?[0x68734c,0x778354,0x54603e][blade]:[0x95a46a,0xa8ae70,0x76874e][blade];
    const leaf=(x,y,h)=>put(a+x*c-y*s,l+x*s+y*c,shade,h);
    leaf(-width,0,.065);leaf(width,0,.065);leaf(-width*.55,length*.55,.084);leaf(width*.55,length*.55,.077);leaf(0,length,.066);
   }
  }
  for(const a of Object.values(b.g.attributes)){a.addUpdateRange(offset*a.itemSize,VERTICES*a.itemSize);a.needsUpdate=true;}
  b.used=slot+1;b.g.setDrawRange(0,b.used*INDICES);b.mesh.visible=true;dirty.add(b);
  cursor=(cursor+1)%(SLOTS*BATCHES);serial++;uploads++;if(wet)wetTotal++;
 }
 return {batches,update(run){
  uploads=0;dirty.clear();
  if(owner!==run||run.time<lastTime){owner=run;reset();}lastTime=run.time;
  const j=run.joe;
  if(!mowerMouthTarget(run).cutting){previous=null;carry=0;return;}
  const current={x:j.x-Math.sin(j.yaw)*1.7,y:j.y-Math.cos(j.yaw)*1.7,yaw:j.yaw};
  if(previous){
   const distance=Math.hypot(current.x-previous.x,current.y-previous.y);
   // A loaded save/test teleport cannot draw a scar across untouched ground.
   if(distance>12){carry=0;}else if(distance>0){
    for(let d=STEP-carry;d<=distance;d+=STEP){const t=d/distance;stamp(previous.x+(current.x-previous.x)*t,previous.y+(current.y-previous.y)*t,previous.yaw+angleDelta(current.yaw,previous.yaw)*t,run);}
    carry=(carry+distance)%STEP;
   }
  }
  previous=current;
  for(const b of dirty){
   b.g.boundingBox??=new THREE.Box3();b.g.boundingBox.makeEmpty();
   for(let i=0;i<b.used*VERTICES;i++)b.g.boundingBox.expandByPoint(boundsPoint.fromBufferAttribute(b.g.attributes.position,i));
   b.g.boundingSphere??=new THREE.Sphere();b.g.boundingBox.getBoundingSphere(b.g.boundingSphere);
  }
 },stats:()=>({segments:batches.reduce((n,b)=>n+b.used,0),capacity:SLOTS*BATCHES,batches:BATCHES,verticesPerSegment:VERTICES,trianglesPerSegment:INDICES/3,clippingBladesPerSegment:12,soilTexelsPerMeter:313.5,skipped,uploads,stamped:serial,wetStamped:wetTotal,retainedMeters:Math.round(batches.reduce((n,b)=>n+b.used,0)*STEP)}),
 warm(){for(const b of batches){b.mesh.visible=true;b.mesh.frustumCulled=false;b.g.setDrawRange(0,INDICES);}},
 finishWarm(){for(const b of batches){b.mesh.frustumCulled=true;b.mesh.visible=b.used>0;b.g.setDrawRange(0,b.used*INDICES);}},
 dispose(){for(const b of batches){scene.remove(b.mesh);b.g.dispose();}}
 };
}
