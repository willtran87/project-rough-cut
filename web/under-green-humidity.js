import * as THREE from './vendor/three/three.module.js';
import {WATERS,waterState,onFloor,solid} from './under-green-course.js';
import {floodState} from './under-green-flood.js';
import {COURSE_SHAFTS} from './under-green-overhead.js';
import {dampLampLevel} from './under-green-atmosphere.js';

// Fixed pockets of cold damp air. Their particles follow an analytic clock,
// never a visibility-triggered spawn, so rear glances reveal continuous motion.
export const HUMIDITY_POCKETS=Object.freeze([
 ...WATERS.filter(w=>['lesson','bunker','return','range-b','sluice'].includes(w.id)).map(w=>({id:w.id,x:w.x,y:w.y,water:w.id,height:.19,spread:.72,width:1.25,tall:.34,count:5})),
 ...COURSE_SHAFTS.map(s=>({id:s.id,x:s.x,y:s.y,height:3.35,spread:.35,width:1.05,tall:.42,count:4})),
]);
export function humiditySamples(run,reduced=false){
 const time=reduced?0:run.time,flood=floodState(run.elapsed).depth,result=[];
 HUMIDITY_POCKETS.forEach((p,k)=>{
  const water=p.water&&WATERS.find(w=>w.id===p.water),surface=water?Math.max(flood,.025+waterState(water,run.time,run.bypass,run.bypassAt).level*.08):0;
  for(let i=0;i<p.count;i++){
   const phase=i*2.399+k*1.731,t=time*(.038+k*.003)+phase;
   const x=p.x+Math.cos(phase)*p.spread+Math.sin(t*.7)*.12,y=p.y+Math.sin(phase)*p.spread*.55+Math.cos(t*.61)*.13;
   const width=p.width*(.9+Math.sin(t*.43)*.08),tall=p.tall*(.9+Math.cos(t*.37)*.08);
   const height=Math.max(surface+p.height+Math.sin(t*.53)*.035,surface+tall*.5+.018),radius=Math.hypot(width,tall)/2;
   // Keep the complete camera-facing card inside the real floor boundary.
   if(![0,1,2,3,4,5,6,7].every(n=>{const a=n*Math.PI/4;return onFloor(x+Math.cos(a)*radius,y+Math.sin(a)*radius);})||solid({x,y},.04))continue;
   result.push({id:p.id,index:k*8+i,x,y,height,width,tall,alpha:(reduced?.04:.075)*(.66+.34*Math.sin(t*.41)**2),surface});
  }
 });
 return result;
}
function humidityTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),data=c.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  // Deliberate two-pixel clusters retain the game's texture language. Smooth
  // broad lobes and a broken rim avoid noisy white smoke or a visible card.
  const u=(Math.floor(x/2)*2-63)/63,v=(Math.floor(y/2)*2-63)/63;
  const bend=Math.sin(u*4.3)*.14,edge=Math.max(0,1-u*u-(v+bend)*(v+bend));
  const fold=.62+.22*Math.sin(u*6.1+v*2.7)+.16*Math.cos(v*9.3-u*3.7);
  const alpha=Math.round(Math.min(1,edge*edge*fold)*255),i=(y*128+x)*4;
  data.data.set([255,255,255,alpha],i);
 }
 c.putImageData(data,0,0);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;return texture;
}
export function createDrainHumidity({scene,camera,lamps}){
 const capacity=HUMIDITY_POCKETS.reduce((n,p)=>n+p.count,0),texture=humidityTexture(),geometry=new THREE.PlaneGeometry(1,1),alpha=new THREE.InstancedBufferAttribute(new Float32Array(capacity),1);
 geometry.setAttribute('humidityAlpha',alpha);alpha.setUsage(THREE.DynamicDrawUsage);
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});
 material.onBeforeCompile=s=>{
  s.vertexShader='attribute float humidityAlpha;varying float dampAlpha;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ndampAlpha=humidityAlpha;');
  s.fragmentShader='varying float dampAlpha;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=dampAlpha;');
 };
 material.customProgramCacheKey=()=> 'drain-local-humidity-v1';
 const mesh=new THREE.InstancedMesh(geometry,material,capacity);mesh.name='Local damp air';mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.renderOrder=1.5;mesh.count=0;scene.add(mesh);
 const transform=new THREE.Object3D(),color=new THREE.Color(),lampColor=new THREE.Color(),base=new THREE.Color(0x63746c);let enabled=true,shown=[];
 return {
  setEnabled(value){enabled=!!value;mesh.visible=enabled&&mesh.count>0;},
  update(run,reduced){
   camera.updateMatrixWorld();
   shown=humiditySamples(run,reduced).map(p=>({...p,distance:Math.hypot(p.x-camera.position.x,p.height-camera.position.y,-p.y-camera.position.z)})).filter(p=>p.distance<32).sort((a,b)=>b.distance-a.distance);
   let count=0;
   for(const p of shown){
    const fade=Math.min(1,(32-p.distance)/6)*Math.min(1,Math.max(0,(p.distance-.4)/.8));
    transform.position.set(p.x,p.height,-p.y);transform.quaternion.copy(camera.quaternion);transform.scale.set(p.width,p.tall,1);transform.updateMatrix();mesh.setMatrixAt(count,transform.matrix);
    alpha.setX(count,p.alpha*fade);color.copy(base);
    // Small local color shifts follow the same fixed practical sources and
    // flicker as the world. Air scattering needs no 17-light surface shader.
    lamps.forEach((lamp,i)=>{const d=Math.hypot(lamp.x-p.x,lamp.y-p.y,(lamp.height??2.8)-p.height);if(d>7)return;lampColor.setHex(lamp.color??(i%3===1?0x79c8c5:0xe9b575));const gain=(1-d/7)**2*dampLampLevel(run.time,i,reduced)*.045;color.r+=lampColor.r*gain;color.g+=lampColor.g*gain;color.b+=lampColor.b*gain;});
    mesh.setColorAt(count++,color);
   }
   mesh.count=count;mesh.visible=enabled&&count>0;if(count){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;alpha.needsUpdate=true;}
  },
  stats:()=>({kind:'localized-damp-air',capacity,active:mesh.count,draws:mesh.visible?1:0,texture:[128,128],enabled,pockets:HUMIDITY_POCKETS.map(p=>p.id),samples:shown.map(p=>({id:p.id,index:p.index,x:p.x,y:p.y,height:p.height,surface:p.surface,alpha:p.alpha}))}),
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();texture.dispose();},
 };
}
