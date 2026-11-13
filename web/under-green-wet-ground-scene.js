import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {partitionDrainSurfaces} from './under-green-light-partitions.js';
import {floodState} from './under-green-flood.js';
import {waterPoint} from './under-green-course.js';
import {channelJets} from './under-green-flow.js';
import {fadingWaterInstances} from './under-green-water-particles.js';
import {DRAIN_PUDDLES,DRAIN_RUNNELS,DRAIN_SHALLOW_PATCHES,DRAIN_BOOT_TRACES,DRAIN_SCYTHE_SCORES,SHALLOW_WATER_HEIGHT,runnelPolygon} from './under-green-wet-ground.js';

const hash=n=>{const v=Math.sin(n*127.1+39.7)*43758.5453;return v-Math.floor(v);};
function flatPolygon(points,height){
 const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const geometry=new THREE.ShapeGeometry(shape);geometry.rotateX(-Math.PI/2);geometry.translate(0,height,0);return geometry;
}
function merge(parts){const geometry=mergeIndexedGeometries(parts);parts.forEach(p=>p.dispose());return geometry;}
function pixelTexture(width,height,draw){
 const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'));
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;return t;
}
function bootMask(){return pixelTexture(128,256,c=>{
 for(let y=7;y<249;y++)for(let x=9;x<119;x++){
  const py=y/256,px=(x-64)/64,width=py<.25?.62*Math.sqrt(Math.max(0,1-((py-.25)/.24)**2)):py<.66?.62:.48;
  const edge=Math.abs(px)/Math.max(.01,width),tread=(Math.floor((y+x*.18)/13)%3===0&&edge<.79)||(Math.abs(px)<.07&&py<.61);
  if(edge>.97||tread||py>.67&&py<.72)continue;
  // Broken clusters and a partly washed edge, not sharp pristine boot stamps.
  const wear=hash(Math.floor(x/3)+Math.floor(y/4)*71),alpha=(1-edge*.6)*(wear<.17?.08:.5+wear*.5);
  c.fillStyle=`rgba(165,148,119,${alpha})`;c.fillRect(x,y,1,1);
 }
});}
function leafTexture(){return pixelTexture(64,128,c=>{
 c.fillStyle='#716444';c.fillRect(0,0,64,128);
 for(let y=0;y<128;y++)for(let x=0;x<64;x++){
  const spine=Math.abs(x-31)<1,vein=Math.abs(((y+Math.abs(x-31)*1.2)%21)-10)<1.5,patch=hash(Math.floor(x/5)+Math.floor(y/7)*17);
  c.fillStyle=spine?'#ab9060':vein?'#89764e':patch<.19?'#4c4932':'#716444';c.fillRect(x,y,1,1);
 }
});}
function siltMask(){return pixelTexture(64,64,c=>{
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const px=(x-31.5)/31.5,py=(y-31.5)/31.5,r=Math.hypot(px,py),lobe=.1*Math.sin(px*13+py*7)+.07*Math.cos(py*17);
  const alpha=Math.max(0,1-r+lobe)**2*.5;
  if(alpha>.01){c.fillStyle=`rgba(132,117,76,${alpha})`;c.fillRect(x,y,1,1);}
 }
});}

export function createDrainWetGround(scene,waters){
 const time={value:0};
 const material=new THREE.MeshPhongMaterial({color:0x3a3927,specular:0x43503e,shininess:68,transparent:true,opacity:.46,depthWrite:false});
 material.onBeforeCompile=s=>{
  s.uniforms.puddleTime=time;s.vertexShader='varying vec2 puddlePoint;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npuddlePoint=position.xz;');
  s.fragmentShader='varying vec2 puddlePoint;uniform float puddleTime;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=floor(puddlePoint*128.)/128.;
   float silt=.5+.5*sin(p.x*3.7+sin(p.y*4.1));
   float crest=smoothstep(.985,.999,sin(p.y*31.+sin(p.x*7.+sin(p.y*2.))*1.1-puddleTime*.4));
   crest*=smoothstep(.4,.88,sin(p.x*17.+p.y*5.)*sin(p.y*8.-p.x*3.));
   diffuseColor.rgb*=.72+silt*.28;
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize(normal+vec3(sin(puddlePoint.x*23.+puddleTime*.2)*.012,0.,cos(puddlePoint.y*27.-puddleTime*.2)*.012));');
  s.fragmentShader=s.fragmentShader.replace('#include <specularmap_fragment>','#include <specularmap_fragment>\nspecularStrength*=.025+crest*.18;');
 };
 const puddles=partitionDrainSurfaces(scene,DRAIN_SHALLOW_PATCHES.map(p=>flatPolygon(p.points,SHALLOW_WATER_HEIGHT)),material,'Shallow runoff pools');puddles.setRenderOrder(-1);

 const boot=bootMask(),footprints=fadingWaterInstances(scene,DRAIN_BOOT_TRACES.length,boot,{color:0x332b19,opacity:1,shininess:1});
 footprints.mesh.name='Washed historical boot traces';footprints.mesh.renderOrder=-2;footprints.mesh.material.specular.setHex(0);
 const dummy=new THREE.Object3D();
 DRAIN_BOOT_TRACES.forEach((f,i)=>{dummy.position.set(f.x,.004,-f.y);dummy.rotation.set(-Math.PI/2,0,f.yaw);dummy.scale.set(.19,.33,1);dummy.updateMatrix();footprints.mesh.setMatrixAt(i,dummy.matrix);footprints.alphas.setX(i,f.fade*1.9);});footprints.finish(DRAIN_BOOT_TRACES.length);
 const scores=[];
 for(const [width,height,color,opacity]of [[.026,.003,0x807351,.19],[.008,.004,0x191a12,.5]]){
  const parts=DRAIN_SCYTHE_SCORES.map(s=>{const points=Array.from({length:25},(_,i)=>{const a=s.start+(s.end-s.start)*i/24;return [s.x+Math.cos(a)*s.radius,s.y+Math.sin(a)*s.radius];});return flatPolygon(runnelPolygon({points,width}),height);});
  const mesh=new THREE.Mesh(merge(parts),new THREE.MeshLambertMaterial({color,transparent:true,opacity,depthWrite:false}));mesh.name='Old scythe floor scores';mesh.renderOrder=-2;scene.add(mesh);scores.push(mesh);
 }

 // Small folded leaves use a real pointed outline; one instanced batch holds
 // all clumps. Floor clumps lift only as the local physical water rises.
 const clumps=[];
 DRAIN_PUDDLES.forEach((p,index)=>{
  const center=p.points.reduce((v,point)=>({x:v.x+point[0]/p.points.length,y:v.y+point[1]/p.points.length}),{x:0,y:0});
  for(let i=0;i<p.clumps;i++){const edge=p.points[Math.floor((i/p.clumps+index*.19)%1*p.points.length)];clumps.push({x:center.x+(edge[0]-center.x)*.48,y:center.y+(edge[1]-center.y)*.48,channel:-1,direction:i%2?1:-1});}
 });
 waters.forEach((w,index)=>{
  const jets=channelJets(w);
  for(const jet of [jets[0],jets[jets.length-1]]){const p=waterPoint(w,jet.end.x,jet.end.y*.72);clumps.push({...p,channel:index,direction:jet.direction});}
 });
 const leaves=clumps.flatMap((c,i)=>Array.from({length:c.channel<0?4:5},(_,k)=>({clump:i,angle:hash(i*41+k)*Math.PI*2,radius:.025+hash(i*73+k+4)*.075,length:.065+hash(i*19+k+7)*.055,turn:hash(i*23+k)*Math.PI*2,color:new THREE.Color().setHSL(.10+hash(i+k)*.07,.12+hash(k+i*31)*.12,.58+hash(i*61+k)*.22)})));
 const outline=[[-.02,-.5],[-.27,-.25],[-.38,.07],[-.26,.35],[0,.5],[.25,.3],[.34,0],[.22,-.3]],vertices=[],uv=[];
 for(let i=0;i<outline.length;i++)for(const [x,y,h]of [[0,0,.045],[...outline[i],0],[...outline[(i+1)%outline.length],0]]){vertices.push(x,h,-y);uv.push(x+.5,y+.5);}
 const leafGeometry=new THREE.BufferGeometry();leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));leafGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));leafGeometry.computeVertexNormals();
 const leafMap=leafTexture(),leafMaterial=new THREE.MeshPhongMaterial({map:leafMap,color:0xffffff,specular:0x3b4330,shininess:12,side:THREE.DoubleSide});
 const leafMesh=new THREE.InstancedMesh(leafGeometry,leafMaterial,leaves.length);leafMesh.name='Drainage leaf clumps';leafMesh.frustumCulled=false;leafMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);leaves.forEach((l,i)=>leafMesh.setColorAt(i,l.color));scene.add(leafMesh);
 const silt=siltMask(),plumes=fadingWaterInstances(scene,waters.length*2,silt,{color:0x796e46,opacity:.22,shininess:1});plumes.mesh.name='Outlet suspended silt';plumes.mesh.material.specular.setHex(0);plumes.mesh.renderOrder=1;
 let owner=null,lastTime=null,phases=clumps.map(()=>0),state={};
 function update(r,states,reduced){
  const reset=owner!==r||lastTime===null||r.time<lastTime||r.time-lastTime>.5,dt=reset?0:Math.max(0,r.time-lastTime);
  if(reset)phases.fill(0);owner=r;lastTime=r.time;
  const flood=floodState(r.elapsed).depth;time.value=reduced?0:r.time;
  const positions=clumps.map((c,i)=>{
   const flow=c.channel<0?null:states[c.channel],energy=flow?.level||0;
   if(!reduced)phases[i]+=dt*c.direction*(flow?.danger ? .34 : .065+energy*.06);
   const phase=phases[i]+i*2.39,lift=THREE.MathUtils.smoothstep(flood,SHALLOW_WATER_HEIGHT,.12),radius=c.channel<0?.035+lift*.035:.11;
   const height=c.channel<0?Math.max(SHALLOW_WATER_HEIGHT,flood):Math.max(.025+energy*.08,flood);
   return {x:c.x+Math.sin(phase)*radius,y:c.y+Math.cos(phase*.83)*radius,height:height+.003,phase,energy};
  });
  leaves.forEach((leaf,i)=>{
   const p=positions[leaf.clump],a=leaf.angle+p.phase*.13;
   dummy.position.set(p.x+Math.cos(a)*leaf.radius,p.height,-p.y-Math.sin(a)*leaf.radius);dummy.rotation.set(0,leaf.turn+p.phase*.22,0);dummy.scale.setScalar(leaf.length);dummy.updateMatrix();leafMesh.setMatrixAt(i,dummy.matrix);
  });leafMesh.instanceMatrix.needsUpdate=true;
  let count=0;
  for(let i=0;i<clumps.length;i++)if(clumps[i].channel>=0){
   const p=positions[i],angle=p.phase*.2;dummy.position.set(p.x,p.height-.001,-p.y);dummy.rotation.set(-Math.PI/2,0,angle);dummy.scale.set(.44+p.energy*.14,.67+p.energy*.21,1);dummy.updateMatrix();plumes.mesh.setMatrixAt(count,dummy.matrix);plumes.alphas.setX(count,.3+p.energy*.7);count++;
  }plumes.finish(count);
  state={puddles:DRAIN_PUDDLES.length,runnels:DRAIN_RUNNELS.length,shallowHeight:SHALLOW_WATER_HEIGHT,bootTraces:DRAIN_BOOT_TRACES.length,scytheScores:DRAIN_SCYTHE_SCORES.length,clumps:clumps.length,leaves:leaves.length,siltPlumes:count,capacity:{leaves:leaves.length,silt:waters.length*2},floodDepth:flood,animationTime:time.value,positions:positions.map((p,i)=>({id:i,channel:clumps[i].channel,...p})),cosmeticOnly:true,addedColliders:0};
 }
 return {update,stats:()=>state,dispose(){
  puddles.dispose();material.dispose();for(const mesh of [...scores,leafMesh]){mesh.geometry.dispose();mesh.material.dispose();mesh.removeFromParent();}
  footprints.dispose();plumes.dispose();boot.dispose();leafMap.dispose();silt.dispose();
 }};
}
