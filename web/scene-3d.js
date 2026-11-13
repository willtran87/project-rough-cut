import {createVegetationContact,VEGETATION_PADDING} from './course-vegetation-contact.js';
import {createCourseVisualDetail} from './course-visual-detail.js';
let courseVisualDetail=null;
let vegetationContact=null;
import {courseRenderSize} from './course-viewport.js';
import {courseBallFlightPosition} from './course-ball-motion.js';
import {createCourseBallPresentation} from './course-ball-presentation.js';
let ballPresentation=null;
import {DRAIN_LAYOUT} from './drain-collision.js';
import {createCourseExitMechanisms} from './course-exit-mechanisms.js';
import {courseExitRelease} from './course-exit-release.js?v=20261113-audit-restored';
let exitMechanisms=null;
import {createCoursePlayerCraft} from './course-player-craft.js';
let playerCraft=null;
import {auditResponseBellPose} from './audit-response.js';
import {createNoiseHazardScene} from './noise-hazard-scene.js';
let noiseHazardScene=null;
import { sprinklerLayout, createSprinklerSpray } from './sprinkler-system.js?v=20261108-wet-atmosphere';
import { createWetGround } from './wet-ground.js?v=20261113-visual-pass';
let wetGround=null;
let sprinklerSpray=null;
import { practiceStatus, stationImpulse, stationMechanismPose } from './station-feedback.js?v=20261112-station-replies';
import { createCourseEntryGate } from './course-entry-gate.js';
let courseEntryGate=null;
import { createArrivalPhone } from './course-arrival-phone.js';
let arrivalPhone=null;
import {onDeadGreen} from './dead-green-refuge.js';
import {createDeadGreenRefuge} from './dead-green-refuge-scene.js';
import {createStaticInstanceCulling} from './static-instance-culling.js';
import {stableLightMaterialSort} from './local-light-culling.js?v=20261112-stable-material-order';
let understoryCulling=null;
import {createDeadGreenScene} from './dead-green-scene.js';
let deadGreenScene=null,deadGreenRefuge=null;
import { createTeeAnomaly } from './course-tee-anomaly.js';
let teeAnomaly=null;
import { createObjectiveCues } from './objective-cues.js?v=20261113-audit-restored';
import { createEnvironmentGuidance } from './environment-guidance.js?v=20261111-station-facing';
let objectiveCues=null,environmentGuidance=null;
import { createSoftwareFrameBudget } from './software-frame-budget.js?v=20261112-stable-budget';
import { courseLanternPairs, lanternPhase, lanternFlicker } from './lantern-layout.js?v=20261113-symmetric-28';
import * as THREE from './vendor/three/three.module.js';
import {stationFacing} from './station-facing.js';
import * as PixelArt from './pixel-art.js';
import { createParallax } from './parallax-scene.js?v=20261108-course-lanterns';
import { createIllustratedProps } from './illustrated-props.js';
import { detailedGroundMaterial, finishPaths } from './terrain-finish.js';
import { createPixelWorld } from './pixel-world-props.js?v=20261112-station-replies';
import { woodlandHeight } from './pixel-landscape.js';
import { createJoeModel } from './joe-model.js?v=20261113-visual-pass';
import { prepareRendering, yieldPreparation, waitForGPU, preparationStats, prepareStaticBuffers } from './render-preparation.js';
import { createPixelEffects, createImpactMask } from './pixel-effects.js?v=20261113-visual-pass';
import { createPixelWater } from './pixel-water.js';
import { updateFloodlight } from './floodlight-response.js?v=20261113-visual-pass';
import { loadBakedTerrain } from './baked-terrain.js';
import { bitmapDecodeStats } from './bitmap-decoder.js';
import { createScreenFracture, drawCopyFracture } from './screen-fracture.js';
let screenFracture=null;
let waterSurfaces=[];
let impactMask=null;
let pixelEffects=null;
let joeModel=null;
let pixelWorld=null;
let moonShadow=null,nearLamp=null;
let softwareRenderer=false,lastShadowTime=-Infinity,lastShadowX=Infinity,lastShadowZ=Infinity,lastShadowMechanisms="";
let coursePointLights=[];
const actorFrustum=new THREE.Frustum(),actorProjection=new THREE.Matrix4(),actorBounds=new THREE.Sphere(new THREE.Vector3(),2.4);
const particlePosition=new THREE.Vector3(),particleScale=new THREE.Vector3(),particleRotation=new THREE.Quaternion(),particleEuler=new THREE.Euler(),particleColor=new THREE.Color();
let illustrated=null;
let parallax=null;
const pixelStyle = new URLSearchParams(location.search).get('art') !== 'smooth';
const pixelVolume = pixelStyle && new URLSearchParams(location.search).get('art') !== 'illustrated';

// One physical scale for geometry, motion and camera; authored gameplay remains in course units.
const SCALE = window.RCQuality.scale.meters, X_SCALE = window.RCQuality.scale.x * SCALE;
const point = p => new THREE.Vector3(p.x * X_SCALE, 0, -p.y * SCALE);
const rand = n => { const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v); };
const clamp = THREE.MathUtils.clamp;
const legacy = new URLSearchParams(location.search).get('renderer') === 'legacy';
let skipPresentation=false;
let presentationFence=null,presentationPending=false,presentationPoll=false,frameAvailable=()=>{};
const presentationWaiters=[];
const gpuFrameSamples=[];
const softwareBudget=createSoftwareFrameBudget(),softwareTargets=new Map();
let customTarget=null;
let lastMeasuredFrame=0,presentationMeasuresScene=false,lastWorldSubmitStarted=0;
function presentationBusy(){
  if(!presentationFence)return false;
  const gl=renderer.getContext(),status=gl.clientWaitSync(presentationFence,0,0);
  if(status===gl.TIMEOUT_EXPIRED)return true;
  if(presentationMeasuresScene&&status!==gl.WAIT_FAILED){
    const completedMs=performance.now()-lastWorldSubmitStarted;softwareBudget.observe(completedMs);stats.quality.adaptive=softwareBudget.stats();
    gpuFrameSamples.push(completedMs);if(gpuFrameSamples.length>120)gpuFrameSamples.shift();
    const sorted=[...gpuFrameSamples].sort((a,b)=>a-b);
    stats.gpuFrameP95Ms=sorted[Math.floor(sorted.length*.95)];stats.gpuFrameSamples=sorted.length;
    stats.gpuFrameAverageMs=gpuFrameSamples.reduce((sum,ms)=>sum+ms,0)/gpuFrameSamples.length;
  }
  presentationMeasuresScene=false;
  gl.deleteSync(presentationFence);presentationFence=null;
  return false;
}
function pollPresentation(){
  if(presentationPoll)return;presentationPoll=true;
  // A completed software frame need not wait another display refresh before
  // the latest view can be submitted. Timed, zero-timeout fence queries yield
  // between checks; hidden tabs retain RAF's suspension behavior.
  const schedule=document.hidden?requestAnimationFrame:fn=>setTimeout(fn,8);
  schedule(()=>{
    presentationPoll=false;
    if(document.hidden){pollPresentation();return;}
    if(presentationBusy()){pollPresentation();return;}
    if(presentationPending){presentationPending=false;frameAvailable();}
    if(presentationFence||presentationPending)pollPresentation();
    else for(const resolve of presentationWaiters.splice(0))resolve();
  });
}
function deferPresentation(){
  presentationPending=true;stats.busyFramesSkipped=(stats.busyFramesSkipped||0)+1;pollPresentation();
}
function whenPresented(){
  if(!presentationFence&&!presentationPending)return Promise.resolve();
  return new Promise(resolve=>{presentationWaiters.push(resolve);pollPresentation();});
}
function performanceStats(){return {softwareRenderer,completedSceneSamples:gpuFrameSamples.length,averageCompletedSceneMs:stats.gpuFrameAverageMs||0,p95CompletedSceneMs:stats.gpuFrameP95Ms||0,method:'software scene submission through GPU fence completion, including bounded timer polling delay'};}
let frozenFrame='', renderer, world, camera, failure = null, currentKey = '', currentData, lastTime=0;
let lastHudKey=null, direct=false, surface=null, sceneTarget=null, compositor=null, screenCamera=null, sceneQuad=null, hudTexture=null, worldDrawn=false, useDomHud=false, overlayQuad=null;
PixelArt.onReady(()=>{frozenFrame='';});
let joeIllustration=null, joeView=0;
const stats = {artStyle:pixelVolume?'pixel-3d':pixelStyle?'original-pixel-art':'smooth',ready:false, renderer:'three-webgl2', revision:THREE.REVISION, scale:SCALE, drawCalls:0, triangles:0, frames:0, error:null};
let sky, restMarker, rollLine, staticRoot, dynamicRoot, joe, joeHead, wheels=[], stations=new Map(), lights=[], pickups={}, ball, aimLine, aimTarget, exitDoor, drainGate, recoveryBalls=[], particles, effectRings=[];
const geometries = {box:new THREE.BoxGeometry(1,1,1), cylinder:new THREE.CylinderGeometry(1,1,1,16), cone:new THREE.ConeGeometry(1,1,7), leaf:new THREE.IcosahedronGeometry(1,1), sprig:new THREE.IcosahedronGeometry(1,0), sphere:new THREE.SphereGeometry(1,10,6)};
// Authored crown profiles: clipped formal hedges versus fuller cover bushes.
// Their base is the authoritative ellipse; the crown recedes inside that footprint.
geometries.hedge=new THREE.LatheGeometry([[0,-.5],[1,-.5],[1,-.34],[.99,.12],[.93,.31],[.79,.44],[.46,.5],[0,.51]].map(([r,y])=>new THREE.Vector2(r,y)),32);
geometries.clippedHedge=new THREE.LatheGeometry([[0,-.5],[1,-.5],[1,.1],[.98,.34],[.89,.46],[.65,.5],[0,.5]].map(([r,y])=>new THREE.Vector2(r,y)),32);
const materials = new Map();
const batches=new Map(), expandedGeometry=new Map();
const v = new THREE.Vector3(), normal = new THREE.Vector3(), matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion();
function material(color, unlit=false){const key=color+':'+unlit;if(!materials.has(key))materials.set(key,unlit?new THREE.MeshBasicMaterial({color}):new THREE.MeshLambertMaterial({color,flatShading:false}));return materials.get(key);}
function piece(parent,shape,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
  const brass=pixelStyle&&[0xb4964e,0xc8a458].includes(color),paper=pixelStyle&&color===0xd5c69e;const wood=pixelStyle&&[0x614b31,0x604b32,0x745c3c,0x836644].includes(color);const mesh=new THREE.Mesh(geometries[shape],brass?PixelArt.paintedMaterial('rough-cut-night-order-objectives-v1',[365,260,100,80],null,{alphaTest:0}):paper?PixelArt.paintedMaterial('rough-cut-night-order-objectives-v1',[810,230,140,120],null,{alphaTest:0}):wood?PixelArt.paintedMaterial('rough-cut-maintenance-shed-v2',[855,325,225,340],null,{alphaTest:0}):material(color));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);parent.add(mesh);return mesh;
}
function baked(shape,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
  const source=geometries[shape];if(!expandedGeometry.has(shape))expandedGeometry.set(shape,source.index?source.toNonIndexed():source);const g=expandedGeometry.get(shape);
  const key=Math.floor(x/12)+":"+Math.floor(z/12);if(!batches.has(key))batches.set(key,{position:[],normal:[],color:[]});const batch=batches.get(key);
  quaternion.setFromEuler(new THREE.Euler(rx,ry,rz));matrix.compose(new THREE.Vector3(x,y,z),quaternion,new THREE.Vector3(sx,sy,sz));const nm=new THREE.Matrix3().getNormalMatrix(matrix),c=new THREE.Color(color);
  for(let i=0;i<g.attributes.position.count;i++){v.fromBufferAttribute(g.attributes.position,i).applyMatrix4(matrix);normal.fromBufferAttribute(g.attributes.normal,i).applyMatrix3(nm).normalize();batch.position.push(v.x,v.y,v.z);batch.normal.push(normal.x,normal.y,normal.z);batch.color.push(c.r,c.g,c.b);}

}
function flush(){
  const shared=new THREE.MeshLambertMaterial({vertexColors:true});
  for(const batch of batches.values()){
    const geometry=new THREE.BufferGeometry();for(const key of ['position','normal','color'])geometry.setAttribute(key,new THREE.Float32BufferAttribute(batch[key],3));geometry.computeBoundingSphere();
    staticRoot.add(new THREE.Mesh(geometry,shared));}
  batches.clear();
}
function label(text,width=2,color='#e8dcb6'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d',{willReadFrequently:true});
  const paint=image=>{g.fillStyle=pixelStyle?'#302e23':'#152b27';g.fillRect(0,0,512,128);if(image){g.drawImage(image,710,583,190,60,0,0,512,128);g.fillStyle='rgba(13,23,20,.66)';g.fillRect(0,0,512,128);}g.strokeStyle=pixelStyle?'#71694e':'#b2a47a';g.lineWidth=pixelStyle?3:6;g.strokeRect(7,7,498,114);if(pixelStyle){for(let i=0;i<18;i++){g.fillStyle=i%2?'rgba(198,176,119,.12)':'rgba(0,0,0,.15)';g.fillRect(12+rand(i)*480,12+rand(i+45)*103,20+rand(i+2)*65,2);}for(const x of [18,494])for(const y of [18,110]){g.fillStyle='#ad9260';g.fillRect(x-2,y-2,4,4);}}g.fillStyle=color;g.font='bold 35px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,65,456);};paint();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;
  if(pixelStyle){t.magFilter=THREE.NearestFilter;PixelArt.source('rough-cut-course-obstacle-kit-v1').then(image=>{if(image){paint(image);t.needsUpdate=true;frozenFrame='';}});}
  return new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));
}
function sign(text,x,z,width=2.3,height=1.6){
  baked('box',0x675842,x,height/2,z,.09,height,.09);const m=label(text,width);m.position.set(x,height,z);staticRoot.add(m);
}
let glowTexture=null,glowBillboards=null,glowFloor=null,glowAnchors=[],glowFloorPhases=[];
function lanternGlow(parent,x,y,z,size=.6){
  if(!pixelStyle)return;
  if(!glowTexture){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d',{willReadFrequently:true}),gradient=g.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,220,150,.55)');gradient.addColorStop(.18,'rgba(255,182,83,.20)');gradient.addColorStop(1,'rgba(255,153,59,0)');g.fillStyle=gradient;g.fillRect(0,0,64,64);glowTexture=new THREE.CanvasTexture(c);glowTexture.colorSpace=THREE.SRGBColorSpace;glowTexture.userData.sharedPixelArt=true;}
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.set(x,y,z);glow.scale.set(size,size,1);parent.add(glow);
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(size*3,size*3),new THREE.MeshBasicMaterial({map:glowTexture,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending}));pool.rotation.x=-Math.PI/2;pool.position.set(x,.025,z);parent.add(pool);
}
function batchGlows(){
  if(!glowTexture)return;
  world.updateMatrixWorld(true);const sprites=[],pools=[];
  world.traverse(o=>{if(o.material?.map===glowTexture)(o.isSprite?sprites:pools).push(o);});
  glowAnchors=sprites.map(o=>{const position=o.getWorldPosition(new THREE.Vector3());return {position,scale:o.getWorldScale(new THREE.Vector3()),phase:lanternPhase(position.x,position.z),intensity:1};});
  function instances(count,opacity){const m=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glowTexture,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}),count);m.frustumCulled=false;world.add(m);return m;}
  glowBillboards=sprites.length?instances(sprites.length,1):null;
  if(glowBillboards){glowBillboards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);for(let i=0;i<sprites.length;i++)glowBillboards.setColorAt(i,particleColor.setRGB(1,1,1));glowBillboards.instanceColor.setUsage(THREE.DynamicDrawUsage);}
  if(pools.length){const floor=glowFloor=instances(pools.length,.22);glowFloorPhases=[];pools.forEach((o,i)=>{
    // The source plane carries its dimensions in geometry, not Object3D.scale.
    matrix.copy(o.matrixWorld).scale(new THREE.Vector3(o.geometry.parameters.width,o.geometry.parameters.height,1));floor.setMatrixAt(i,matrix);
    const p=o.getWorldPosition(new THREE.Vector3());glowFloorPhases.push(lanternPhase(p.x,p.z));floor.setColorAt(i,particleColor.setRGB(1,1,1));
  });floor.instanceMatrix.needsUpdate=true;floor.instanceColor.setUsage(THREE.DynamicDrawUsage);}
  for(const o of [...sprites,...pools]){o.removeFromParent();if(!o.isSprite)o.geometry.dispose();o.material.dispose();}
  stats.glows={sources:sprites.length+pools.length,batches:Number(!!sprites.length)+Number(!!pools.length)};
}
function updateGlows(frame){
  if(!glowBillboards)return;
  const time=frame?.time||0,steady=!frame||frame.reducedMotion;
  pixelWorld?.updateLanterns(time,steady);
  glowAnchors.forEach((a,i)=>{a.intensity=lanternFlicker(time,a.phase,steady);const shimmer=.97+.03*a.intensity;matrix.compose(a.position,camera.quaternion,particleScale.copy(a.scale).multiplyScalar(shimmer));glowBillboards.setMatrixAt(i,matrix);glowBillboards.setColorAt(i,particleColor.setRGB(a.intensity,a.intensity,a.intensity));});
  glowBillboards.instanceMatrix.needsUpdate=true;glowBillboards.instanceColor.needsUpdate=true;
  if(glowFloor){glowFloorPhases.forEach((phase,i)=>{const value=lanternFlicker(time,phase,steady);glowFloor.setColorAt(i,particleColor.setRGB(value,value,value));});glowFloor.instanceColor.needsUpdate=true;}
}
function buildUnderstory(data){
  if(!pixelStyle)return;
  understoryCulling=softwareRenderer?createStaticInstanceCulling():null;
  vegetationContact=createVegetationContact({scale:SCALE,xScale:X_SCALE});
  const placements=[[],[],[],[],[],[]];
  const put=(x,z,h,seed)=>{if(onDeadGreen(x,z))return;const wet=z<-25&&z>-43,kind=z<-76?(rand(seed)>.4?5:4):wet?1:rand(seed)>.78?0:2;placements[kind].push({x,z,h,angle:rand(seed+9)*Math.PI});};
  // Low detail stays inside solid cover or beyond course bounds. No new hulls.
  for(const o of data.obstacles.filter(o=>o.blocks&&o.kind!=='drain-solid'&&!o.id.includes('cart')&&!o.id.startsWith('shed'))){const p=point(o),rx=(o.radiusX||o.radius)*SCALE,rz=(o.radiusY||o.radius)*SCALE;for(let i=0;i<5;i++){const a=i*Math.PI*.4+rand(o.y);put(p.x+Math.cos(a)*Math.max(0,rx-.35),p.z+Math.sin(a)*Math.max(0,rz-.35),.35+rand(i+o.y)*.45,i+o.y);}}
  for(let i=0;i<85;i++)for(const side of [-1,1])if(rand(i+side*67)>.3)put(side*(13.7+rand(i+8)*.7),3-i*1.45+rand(i+4)*.65,.22+rand(i+side)*.36,i*7+side);
  // Small tufts merge rough turf into the verge, with explicit path clearance.
  // They are ankle-low decoration and never introduce collision or slow footing.
  const routeSegments=data.paths.flatMap(path=>path.slice(1).map((p,i)=>[point(path[i]),point(p)]));
  for(const side of [-1,1])for(let i=0;i<95;i++){
    const x=side*(9.2+rand(i+side*41)*3.1),z=2-i*1.2+rand(i+3)*.8;
    const clear=routeSegments.every(([a,b])=>{const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-a.x-dx*t,z-a.z-dz*t)>1.35;});
    if(!clear||rand(i+side*37)<.25)continue;
    for(let j=0;j<3;j++)put(x+(rand(i*7+j)-.5)*.35,z+(rand(i*11+j)-.5)*.35,.09+rand(i*17+j)*.12,i*31+j);
  }
  for(let i=0;i<4;i++)for(const side of [-1,1])put(side*(2.8+rand(i+12)*1.6),-3.5-i*.7,.35+rand(i+4)*.3,i+side);
  // Low plants break up path edges without covering the walkable centerline.
  for(const path of data.paths)for(let i=1;i<path.length;i++){const a=point(path[i-1]),b=point(path[i]),length=a.distanceTo(b),dx=(b.z-a.z)/length,dz=(a.x-b.x)/length;if(!length)continue;for(let d=.7;d<length;d+=1.1+rand(d+i*19)*2.4){const p=a.clone().lerp(b,d/length),side=Math.floor(d*3+i)%2?1:-1;put(p.x+dx*side*1.24,p.z+dz*side*1.24,.18+rand(d+i)*.16,d+i*71);}}
  const crops=[[0,100,420,475],[420,90,415,485],[835,100,419,475],[0,665,420,480],[420,665,415,480],[835,665,419,480]];
  for(let k=0;k<placements.length;k++){
    const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),PixelArt.paintedMaterial('rough-cut-verge-atlas-v1',crops[k],null,{color:0x9eaba0,alphaTest:.2}),placements[k].length*2);
    let index=0;for(const p of placements[k])for(const turn of [0,Math.PI/2]){quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),p.angle+turn);matrix.compose(new THREE.Vector3(p.x,p.h/2,p.z),quaternion,new THREE.Vector3(p.h*.88,p.h,1));mesh.setMatrixAt(index++,matrix);}vegetationContact.attach(mesh.material);mesh.computeBoundingSphere();mesh.boundingSphere.radius+=VEGETATION_PADDING;mesh.name='CourseUnderstory-'+k;staticRoot.add(mesh);understoryCulling?.register(mesh,VEGETATION_PADDING);
  }
}
function hedge(o,neutral=false){
  const p=point(o),rx=(o.radiusX??o.radius)*SCALE,rz=(o.radiusY??o.radius)*SCALE,h=neutral?1.85:2.05;
  if(pixelVolume&&!neutral){pixelWorld.cover(p.x,p.z,rx,rz,false,o.y);return;}
  if(pixelStyle&&!neutral){
    const clipped=!!o.tunnelWing,hide=o.asset==='hedge-hide',dry=o.y>480&&!clipped&&!hide;
    // The complete closed-back hedge recess keeps its irregular branch silhouette
    // and full leaf resolution. Its pictured recess does not create a new route.
    illustrated.add(staticRoot,clipped||hide?'rough-cut-hedge-hide-v2':dry?'rough-cut-dead-green-kit-v1':'rough-cut-course-obstacle-kit-v1',clipped||hide?[40,145,1450,790]:dry?[40,50,585,420]:[30,125,535,340],p.x,p.z,rx*2,h,{kind:'grass-cover',ellipse:{rx,rz},color:clipped?0xaebfae:hide?0xc7d0c6:0xb2c1ad});
    return;
  }
  baked(neutral?'cylinder':o.tunnelWing?'clippedHedge':'hedge',neutral?0x73827b:0x36563d,p.x,h/2,p.z,rx,h,rz);
  if(neutral)return;
  // Foliage clusters follow the collision ellipse, including its visible base.
  const count=Math.max(12,Math.ceil((rx+rz)*10));
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2,seed=i+o.y*3;const y=.25+rand(seed)*1.55;const r=.08+rand(seed+17)*.10;baked('sprig',[0x355b3a,0x436543,0x31523b][i%3],p.x+Math.cos(a)*(rx-.1),y,p.z+Math.sin(a)*(rz-.1),r*1.3,r*.6,r,0,rand(seed)*6,0);}
  for(let i=0;i<10;i++){const a=i*Math.PI*.2;baked('sprig',0x52714b,p.x+Math.cos(a)*rx*.65,h-.06,p.z+Math.sin(a)*rz*.65,.35,.14,.3);}
}
function tree(x,z,height=6,radius=.75,clearance=null){
    if(pixelVolume){const trunk=pixelWorld.tree(x,z,height,radius);trunk.parent.position.y=woodlandHeight(x,z);if(clearance)trunk.parent.userData.courseCanopyClearance=clearance;return;}
  if(pixelStyle){
    // A complete isolated tree preserves transparent branch gaps. Cropping the
    // distant forest here also brought its rectangular mist/background forward.
    const entry=illustrated.add(staticRoot,'rough-cut-course-obstacle-kit-v1',[1140,30,475,435],x,z,height*.9,height,{kind:'tree',color:0xa0b2a0});
    if(rand(x*9+z)>.5)entry.mesh.scale.x=-1;
    return;
  }
  const seed=x*3+z,oak=rand(seed)>.35;
  baked('cylinder',0x65584b,x,height*.32,z,.13,height*.64,.13);
  if(oak){
    for(let j=0;j<4;j++){const a=j*Math.PI*.5+seed,dx=Math.cos(a),dz=Math.sin(a);
      baked('cylinder',0x625446,x+dx*.36,height*.54,z+dz*.36,.07,height*.28,.07,dz*.5,0,-dx*.5);
      baked('leaf',[0x405b51,0x4e6b58,0x3c574c,0x58705b][j],x+dx*radius*.65,height*(.7+rand(seed+j)*.12),z+dz*radius*.65,radius,height*.21,radius,0,a,0);}
    baked('leaf',0x526e5b,x,height*.88,z,radius*.8,height*.19,radius*.8);
  }else{
    for(let j=0;j<5;j++)baked('cone',j%2?0x314d46:0x3f5d50,x,height*(.42+j*.115),z,radius*(1.65-j*.26),height*.34,radius*(1.65-j*.26),0,j*.6,0);
  }
}
function cart(parent,x,z,width=2.7,depth=1.55,dynamic=false){
  if(pixelVolume&&!dynamic){return pixelWorld.cart(x,z,width,depth);}
  if(pixelStyle&&!dynamic){illustrated.cart(staticRoot,x,z,width,depth);return parent;}
  [width,depth]=[depth,width];
  const add=(shape,color,px,py,pz,sx,sy,sz,rx=0,ry=0,rz=0)=>dynamic?piece(parent,shape,color,px,py,pz,sx,sy,sz,rx,ry,rz):(()=>{const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz))),e=new THREE.Euler().setFromQuaternion(q);baked(shape,color,x+pz,py,z-px,sx,sy,sz,e.x,e.y,e.z);})();
  add('box',0xc2b795,0,.48,0,width,.35,depth);add('box',0xa6ab8c,0,.77,depth*.3,width*.92,.38,depth*.36);
  add('box',0x28302c,0,.95,0,width*.64,.18,depth*.48);add('box',0x4d5b46,0,1.2,.2,width*.64,.43,.15);
  for(const a of [-1,1])for(const b of [-1,1]){
    const wheel=add('cylinder',0x17201e,a*width*.4,.35,b*depth*.45,.29,.16,.29,Math.PI/2,0,0);if(dynamic)wheels.push(wheel);
    add('box',0x697165,a*width*.44,1.38,b*depth*.4,.045,1.35,.045);
  }
  add('box',0xc4bda2,0,2.05,0,width,.10,depth);
  add('box',0x707a6d,0,.88,-depth*.43,width*.9,.25,.18);
  add('box',0xddd3a7,0,.96,depth*.51,.48,.18,.025);
  add('box',0xe5d299,-width*.36,.8,-depth*.51,.25,.16,.04);add('box',0xe5d299,width*.36,.8,-depth*.51,.25,.16,.04);
  return parent;
}
async function buildTerrain(data,calibration,cancelled=()=>false){
  const baked=pixelStyle&&!calibration?await loadBakedTerrain(data,SCALE,X_SCALE):null;
  if(cancelled())return;
  stats.terrainBaked=!!baked;
  if(baked){const t=new THREE.Texture(baked);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=softwareRenderer?1:Math.min(4,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;addTerrain(t,calibration,data);return;}
  const c=document.createElement('canvas');c.width=pixelStyle?1536:768;c.height=pixelStyle?4096:2048;
  // This atlas is built once and uploaded to WebGL. CPU raster storage avoids
  // competing with SwiftShader for thousands of tiny Canvas2D paint commands.
  const g=c.getContext('2d',{willReadFrequently:true});const tx=x=>(x+24)/48*c.width,ty=z=>(z+120)/130*c.height;
  g.fillStyle=calibration?'#607169':'#3c5147';g.fillRect(0,0,c.width,c.height);
  if(!calibration){
    for(let y=0;y<720;y+=10){const z=data.zones.find(z=>y>=z.start&&y<z.end)||data.zones[0],half=(z?.fairwayHalfWidth||70)*X_SCALE;g.fillStyle=pixelStyle?(y%20?'#435449':'#48594b'):(y%20?'#4b6351':'#506756');g.fillRect(tx(-half),ty(-y*SCALE),tx(half)-tx(-half),-10*SCALE/130*c.height);}
    for(let i=0;i<65000;i++){const x=rand(i)*c.width,y=rand(i+70001)*c.height;g.fillStyle=i%2?'rgba(184,193,119,.045)':'rgba(10,25,17,.065)';g.fillRect(x,y,2,2);if(i%4096===4095){await yieldPreparation(cancelled);if(cancelled())return;}}
    for(const path of data.paths){g.strokeStyle='#6d7660';g.lineWidth=2.0/48*c.width;g.lineJoin='round';g.lineCap='round';g.beginPath();path.forEach((p,i)=>i?g.lineTo(tx(p.x*X_SCALE),ty(-p.y*SCALE)):g.moveTo(tx(p.x*X_SCALE),ty(-p.y*SCALE)));g.stroke();g.strokeStyle='#a49a7d';g.lineWidth=1.25/48*c.width;g.stroke();}
    for(const [zones,color]of [[data.sand,'#a3936f'],[data.footing,'#554d3a']])for(const z of zones){g.fillStyle=color;g.beginPath();g.ellipse(tx(z.x*X_SCALE),ty(-z.y*SCALE),(z.radiusX||16)*X_SCALE/48*c.width,(z.radiusY||16)*SCALE/130*c.height,0,0,Math.PI*2);g.fill();}
  }else{g.strokeStyle='#7b8d81';g.lineWidth=1;for(let x=-24;x<24;x+=2){g.beginPath();g.moveTo(tx(x),0);g.lineTo(tx(x),c.height);g.stroke();}for(let z=-120;z<10;z+=2){g.beginPath();g.moveTo(0,ty(z));g.lineTo(c.width,ty(z));g.stroke();}}
  // Grounded soft footprints are part of the terrain, not camera-facing discs.
  for(const o of data.obstacles.filter(o=>o.blocks)){
    const x=tx(o.x*X_SCALE),y=ty(-o.y*SCALE),rx=((o.radiusX||o.radius)*SCALE+.5)/48*c.width,ry=((o.radiusY||o.radius)*SCALE+.5)/130*c.height;
    g.save();g.translate(x,y);g.scale(rx,ry);const shadow=g.createRadialGradient(0,0,.3,0,0,1);shadow.addColorStop(0,'rgba(6,18,17,.38)');shadow.addColorStop(1,'rgba(6,18,17,0)');g.fillStyle=shadow;g.fillRect(-1,-1,2,2);g.restore();
  }
  if(pixelStyle&&!calibration)for(const o of [...data.actions,...data.reviews,data.practice,data.key,data.valve].filter(Boolean)){const x=tx(o.x*X_SCALE),y=ty(-o.y*SCALE),r=c.width/48*.9;const shadow=g.createRadialGradient(x,y,0,x,y,r);shadow.addColorStop(0,'rgba(5,12,11,.62)');shadow.addColorStop(1,'rgba(5,12,11,0)');g.fillStyle=shadow;g.fillRect(x-r,y-r,r*2,r*2);}
  const t=new THREE.CanvasTexture(c),terrainTexture=t;t.colorSpace=THREE.SRGBColorSpace;if(pixelStyle){t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.generateMipmaps=true;}t.anisotropy=softwareRenderer?1:Math.min(4,renderer.capabilities.getMaxAnisotropy());
  if(pixelStyle){
    const grass=PixelArt.texture('rough-cut-course-ground-v4',[600,650,256,256],null,true);
    await PixelArt.source('rough-cut-course-ground-v4');if(cancelled())return;
    {
      // This canvas has not changed since construction. Copying it to a second
      // six-megapixel canvas and back forces needless raster work/readbacks.
      g.save();g.globalCompositeOperation='multiply';g.globalAlpha=.42;g.fillStyle=g.createPattern(grass.image,'repeat');for(let row=0;row<c.height;row+=256){g.fillRect(0,row,c.width,Math.min(256,c.height-row));await yieldPreparation(cancelled);if(cancelled()){g.restore();return;}}g.restore();
      // Dust/gravel edges and warm center tones keep the route readable at night.
      for(const path of data.paths){g.lineJoin='round';g.lineCap='round';g.strokeStyle='#8c8970';g.lineWidth=1.05/48*c.width;g.globalAlpha=.30;g.beginPath();path.forEach((p,i)=>i?g.lineTo(tx(p.x*X_SCALE),ty(-p.y*SCALE)):g.moveTo(tx(p.x*X_SCALE),ty(-p.y*SCALE)));g.stroke();}g.globalAlpha=1;
      if(!calibration)await finishPaths(g,data,tx,ty,X_SCALE,SCALE,c.width/48,cancelled);if(cancelled())return;
      t.needsUpdate=true;frozenFrame='';
    }
  }
  addTerrain(t,calibration,data);
}
function addTerrain(t,calibration,data){
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(48,130),pixelStyle&&!calibration?detailedGroundMaterial(t):new THREE.MeshLambertMaterial({map:t}));if(pixelStyle&&!calibration)wetGround=createWetGround(ground.material,data,SCALE,X_SCALE);ground.receiveShadow=pixelVolume;ground.rotation.x=-Math.PI/2;ground.position.z=-55;staticRoot.add(ground);const outer=new THREE.Mesh(new THREE.PlaneGeometry(300,300),material(0x3c5147));outer.rotation.x=-Math.PI/2;outer.position.set(0,-.025,-55);staticRoot.add(outer);
}
function buildObstacle(o,calibration){
  // These footprints belong to separately constructed art, not generic cover.
  if(o.kind==='rest-bench'||o.kind==='drain-solid')return;
  if(!o.blocks)return;const p=point(o),rx=(o.radiusX||o.radius)*SCALE,rz=(o.radiusY||o.radius)*SCALE;
  if(calibration||o.tunnelWing||o.asset==='hedge-hide'){hedge(o,calibration);return;}
  if(o.id.includes('cart')){cart(null,p.x,p.z,rx*2,rz*2);return;}
  if(o.id.includes('pine')){hedge(o);tree(p.x,p.z,6+rand(o.y)*2,rx,{rx,rz,height:2.4});return;}
  if(o.lightRadius&&pixelStyle){
    const fixture=pixelVolume?pixelWorld.floodlight(p.x,p.z):illustrated.add(dynamicRoot,'rough-cut-expanded-course-kit-v1',[1210,475,210,410],p.x,p.z,1.25,3.35,{kind:'floodlight'}).mesh;
    const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d',{willReadFrequently:true}),gradient=g.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,255,255,.7)');gradient.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gradient;g.fillRect(0,0,64,64);const radius=o.lightRadius*SCALE,pool=new THREE.Mesh(new THREE.PlaneGeometry(radius*2,radius*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(p.x,.018,p.z);world.add(pool);wetGround?.applyToLightPool(pool);const source=pixelVolume?new THREE.PointLight(0xffedbb,18,radius+2,2):null;if(source){source.name='CourseFloodlightSource';source.position.set(p.x,2.8,p.z);world.add(source);}lights.push({o,pool,fixture,source});return;
  }
  if(o.lightRadius){baked('cylinder',0x525b53,p.x,1.6,p.z,.13,3.2,.13);baked('cylinder',0x4b534b,p.x,.2,p.z,rx,.4,rz);
    const fixture=piece(dynamicRoot,'box',0xd8c48e,p.x,3.12,p.z,.9,.22,.3);fixture.material=new THREE.MeshBasicMaterial({color:0xd8c48e});
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d',{willReadFrequently:true}),gradient=g.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.5,'rgba(255,255,255,.5)');gradient.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gradient;g.fillRect(0,0,128,128);
    const radius=o.lightRadius*SCALE,pool=new THREE.Mesh(new THREE.PlaneGeometry(radius*2,radius*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),color:0xf2d38a,transparent:true,opacity:.42,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(p.x,.018,p.z);world.add(pool);wetGround?.applyToLightPool(pool);lights.push({o,pool,fixture});return;}
  if(o.id.includes('pond')){if(pixelVolume){waterSurfaces.push(createPixelWater(staticRoot,p.x,p.z,rx,rz,currentData.obstacles.filter(l=>l.lightRadius).map(l=>({...point(l),source:l}))));pixelWorld.reeds(p.x,p.z,rx,rz);}else{baked('cylinder',0x2f4d43,p.x,.04,p.z,rx,.08,rz);if(pixelStyle){illustrated.add(staticRoot,'rough-cut-expanded-course-kit-v1',[1110,125,550,335],p.x,p.z,rx*2,2.05,{kind:'pond-reeds',ellipse:{rx,rz},color:0xb8c4b2});}else{for(let i=0;i<25;i++){const a=i/25*Math.PI*2;baked('cone',0x4b6846,p.x+Math.cos(a)*rx*.85,1,p.z+Math.sin(a)*rz*.85,.13,2,.13);}hedge({...o,radiusX:(o.radiusX||25)*.64,radiusY:(o.radiusY||11)*.64});}}return;}
  if(pixelVolume&&(o.id.includes('board')||o.id.includes('sign'))){pixelWorld.board(p.x,p.z,rx*2);return;}
  if(pixelStyle&&(o.id.includes('board')||o.id.includes('sign'))){illustrated.add(staticRoot,'rough-cut-expanded-course-kit-v1',[640,510,420,365],p.x,p.z,rx*2,2.1,{kind:'notice-board'});return;}
  if(o.id.includes('board')||o.id.includes('sign')){baked('cylinder',0x5e654a,p.x,.3,p.z,rx,.6,rz);baked('box',0x5e4e36,p.x,1.1,p.z,.18,2.2,.18);baked('box',0x32483d,p.x,1.7,p.z,rx*1.6,.8,.2);return;}
  if(o.id.startsWith('shed-')){
    // The default style builds the complete shed once at its exit anchor.
    if(pixelVolume||o.id==='shed-door')return;
    if(pixelStyle){
      const mesh=new THREE.Mesh(geometries.box,PixelArt.paintedMaterial('rough-cut-maintenance-shed-v2',[855,325,225,340],null,{alphaTest:0}));mesh.position.set(p.x,1.3,p.z);mesh.scale.set(rx*2,2.6,rz*2);staticRoot.add(mesh);return;
    }
    baked('box',0x657161,p.x,1.3,p.z,rx*2,2.6,rz*2);for(let i=-rx+.12;i<rx;i+=.32)baked('box',0x839080,p.x+i,1.3,p.z+rz+.01,.025,2.6,.02);return;
  }
  if(pixelVolume){pixelWorld.cover(p.x,p.z,rx,rz,true,o.y);return;}
  if(pixelStyle){illustrated.add(staticRoot,'rough-cut-stone-cover-v2',[50,200,1450,705],p.x,p.z,rx*2,2,{kind:'stone-cover',ellipse:{rx,rz},color:0xc0c6b7});return;}
  baked('cylinder',0x666c5c,p.x,1,p.z,rx,2,rz);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;baked('leaf',0x7e806c,p.x+Math.cos(a)*rx*.7,2,p.z+Math.sin(a)*rz*.7,.35,.17,.32);}
}
function illustratedStation(target,kind){
  const p=point(target),specs={
    bell:['rough-cut-night-order-objectives-v1',[55,55,500,760],1.35,2.05],
    log:['rough-cut-night-order-objectives-v1',[635,100,495,715],1.2,1.8],
    release:['rough-cut-night-order-objectives-v1',[1210,45,535,775],1.35,1.95],
    key:['rough-cut-interactable-props-v1',[30,90,550,500],.65,.6],
    valve:['rough-cut-interactable-props-v1',[55,640,490,570],.95,1.25]
  },spec=specs[kind]||specs.bell;
  const entry=illustrated.add(dynamicRoot,...spec.slice(0,2),p.x,p.z,spec[2],spec[3],{kind:'station-'+kind,y:kind==='key'?.55:0});
  const root=entry.root,moving=new THREE.Group();root.add(moving);
  if(kind==='key'){root.remove(entry.mesh);moving.add(entry.mesh);}
  const plate=label(target.name||target.shortLabel||target.label||kind.toUpperCase(),.95);plate.position.set(0,spec[3]+.12,.02);root.add(plate);
  // An illustrated seal is a persistent completion mark, independent of the
  // animation group. The field machine artwork itself is never stretched.
  const sealCanvas=document.createElement('canvas');sealCanvas.width=sealCanvas.height=96;const g=sealCanvas.getContext('2d',{willReadFrequently:true});g.strokeStyle='#b94e32';g.lineWidth=7;g.beginPath();g.arc(48,48,34,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(28,49);g.lineTo(42,63);g.lineTo(70,32);g.stroke();
  const sealMap=new THREE.CanvasTexture(sealCanvas),ink=new THREE.Mesh(new THREE.PlaneGeometry(.21,.21),new THREE.MeshBasicMaterial({map:sealMap,transparent:true,depthWrite:false}));ink.position.set(.06,kind==='log'?1.25:1.1,.035);ink.name='completed-ink';ink.visible=false;root.add(ink);
  const lamp=piece(root,'sphere',0xe2bd6c,.48,1.65,.01,.025,.025,.025);lamp.material=new THREE.MeshBasicMaterial({color:0xe2bd6c});
  lamp.visible=false; // Completion uses the ink seal; no floating status bulb.
  if(kind==='log')lanternGlow(root,-.37,1.38,.04,.40);
  if(kind==='release')lanternGlow(root,.34,1.44,.04,.36);
  return {root,moving,lamp,target,kind,illustration:entry.mesh};
}
function station(target,kind,data={}){
  if(pixelVolume){const p=point(target);return pixelWorld.station({...target,facing:stationFacing(target)},kind,p.x,p.z);}
  if(pixelStyle&&kind!=='supply'&&kind!=='practice')return illustratedStation(target,kind);
  const p=point(target),root=new THREE.Group();root.position.copy(p);dynamicRoot.add(root);
  piece(root,'cylinder',0x716246,0,.07,0,.65,.14,.65);piece(root,'box',0x604b32,0,.7,0,.16,1.4,.16);
  const moving=new THREE.Group();root.add(moving);
  if(kind==='bell'){
    piece(root,'box',0x614b31,0,1.9,0,1.1,.12,.16);for(const x of [-.49,.49])piece(root,'box',0x614b31,x,1,0,.1,2,.12);
    moving.position.y=1.72;piece(moving,'cone',0xb4964e,0,-.25,0,.28,.5,.28);piece(moving,'cylinder',0xc8a458,0,-.48,0,.3,.06,.3);piece(moving,'sphere',0x423921,0,-.54,0,.065,.08,.065);
  }else if(kind==='supply'){
    piece(root,'box',0x536659,0,.80,0,.95,1.2,.65);moving.position.set(0,.53,.38);piece(moving,'box',0x819581,0,0,0,.8,.38,.08);piece(moving,'box',0xc4b180,0,.1,.08,.22,.04,.06);
  }else if(kind==='practice'){
    piece(root,'box',0x6c795e,0,.7,-.1,.75,.9,.12);moving.position.set(.05,.83,.02);const gong=piece(moving,'cylinder',0xccb47e,0,0,0,.64,.06,.64);gong.rotation.x=Math.PI/2;
  }else if(kind==='log'){
    piece(root,'box',0x745c3c,0,1,0,.92,.13,.55);piece(root,'box',0xd5c69e,-.12,1.08,0,.54,.025,.42);const ink=piece(root,'box',0x984c41,-.12,1.096,0,.19,.006,.15);ink.name='completed-ink';ink.visible=false;moving.position.set(.23,1.2,0);piece(moving,'box',0x943f31,0,0,0,.18,.13,.18);piece(moving,'cylinder',0x423c2f,0,.13,0,.04,.18,.04);
  }else if(kind==='release'){
    piece(root,'box',0x485e56,0,1.1,0,.8,.9,.35);piece(root,'box',0x798a7a,-.08,1.1,.19,.56,.72,.03);for(const y of [.85,1.35])piece(root,'cylinder',0xc0b18a,-.4,y,.19,.035,.15,.035);moving.position.set(.2,1.2,-.23);piece(moving,'box',0xbe7947,0,.2,0,.07,.5,.07);piece(moving,'sphere',0xa34d39,0,.46,0,.12,.12,.12);
  }else if(kind==='valve'){
    piece(root,'cylinder',0x557e85,0,.56,0,.16,1.12,.16);moving.position.y=1.15;const ring=new THREE.Mesh(new THREE.TorusGeometry(.28,.045,6,16),material(0xbc7151));ring.rotation.x=Math.PI/2;moving.add(ring);piece(moving,'box',0xbc7151,0,0,0,.55,.045,.045);piece(moving,'box',0xbc7151,0,0,0,.045,.045,.55);
  }else if(kind==='key'){
    piece(root,'box',0x596b53,0,1,0,.5,.6,.3);moving.position.set(0,1.1,.2);const ring=new THREE.Mesh(new THREE.TorusGeometry(.095,.024,5,12),material(0xe0bd67));moving.add(ring);piece(moving,'box',0xe0bd67,0,-.17,0,.035,.22,.025);piece(moving,'box',0xe0bd67,.04,-.24,0,.1,.04,.025);
  }
  if(kind!=='supply'&&kind!=='practice'){const plate=label(target.name||target.shortLabel||target.label||kind.toUpperCase(),1.25);plate.position.set(0,kind==='bell'?2.25:1.8,.03);root.add(plate);}
  const lamp=piece(root,'sphere',0xe2bd6c,.45,1.75,0,.055,.055,.055);lamp.material=new THREE.MeshBasicMaterial({color:0xe2bd6c});
  lanternGlow(root,.45,1.75,0,.55);
  return {root,moving,lamp,target,kind};
}
function buildJoe(){
  if(pixelVolume&&new URLSearchParams(location.search).get('joe')!=='sprite'){
    const scene=world;
    joeModel=createJoeModel(dynamicRoot,()=>{frozenFrame='';},(asset,cancelled)=>prepareRendering(renderer,asset,camera,scene,direct?sceneTarget:null,cancelled));joe=null;
    return;
  }
  if(pixelStyle){
    // Decode all direction/pose cells before the first approach, avoiding a blank
    // frame when a new atlas region is selected during a turn or chase.
    for(const view of [1,2,3])for(let frame=0;frame<4;frame++)for(const name of ['rough-cut-joe-state-directions-v1','rough-cut-joe-walk-directions-v2'])PixelArt.texture(name,[frame*384+8,(view-1)*384+24,368,336]);
    for(const frame of [0,2,7])PixelArt.texture('joe-mower-animated-v1',[frame*192+48,8,96,184]);
    joeIllustration=PixelArt.card('joe-mower-animated-v1',[48,8,96,184],.96,1.84);joeIllustration.position.y=.92;dynamicRoot.add(joeIllustration);joe=null;joeView=0;return;
  }
  // A working ride-on mower, visibly different from the parked passenger carts.
  joe=new THREE.Group();dynamicRoot.add(joe);wheels=[];
  piece(joe,'box',0x394a43,0,.36,0,1.12,.22,1.65);
  piece(joe,'cylinder',0x8a8c5e,0,.16,-.55,.91,.16,.65);
  piece(joe,'box',0x8c9b69,0,.65,-.46,.78,.5,.75);
  for(let i=0;i<5;i++)piece(joe,'box',0x33483d,-.28+i*.14,.65,-.845,.055,.26,.025);
  for(const a of [-1,1])for(const b of [-1,1]){
    const wheel=piece(joe,'cylinder',0x202b29,a*.57,.31,b*.59,.28,.19,.28,0,0,Math.PI/2);wheels.push(wheel);
    piece(joe,'cylinder',0x9b9b7b,a*.675,.31,b*.59,.12,.025,.12,0,0,Math.PI/2);
  }
  piece(joe,'box',0x263530,0,.75,.32,.65,.15,.56);piece(joe,'box',0x263530,0,1,.58,.65,.55,.12);
  piece(joe,'cylinder',0x565c4e,0,.97,-.22,.035,.6,.035,-.4);
  const steering=new THREE.Mesh(new THREE.TorusGeometry(.22,.024,6,16),material(0x263530));steering.position.set(0,1.21,-.32);steering.rotation.x=1;joe.add(steering);
  piece(joe,'box',0x546a61,0,1.18,.24,.5,.6,.33);piece(joe,'box',0xc99a5b,0,1.2,.055,.42,.51,.035);
  for(const side of [-1,1]){
    piece(joe,'box',0xcbd0aa,side*.16,1.2,.028,.045,.47,.015);
    piece(joe,'cylinder',0x6e8270,side*.29,1.12,-.04,.085,.46,.085,.75,0,side*.22);
    piece(joe,'sphere',0xc1a382,side*.22,.99,-.21,.085,.08,.09);
    piece(joe,'box',0x364d51,side*.18,.77,.03,.21,.17,.49);piece(joe,'box',0x364d51,side*.19,.56,-.16,.18,.43,.2);
    piece(joe,'box',0x292e29,side*.19,.34,-.28,.23,.14,.37);
  }
  joeHead=new THREE.Group();joeHead.position.set(0,1.68,.18);joe.add(joeHead);
  piece(joeHead,'sphere',0xc1a382,0,0,0,.17,.22,.17);piece(joeHead,'sphere',0xb59b7a,0,-.01,-.18,.05,.055,.065);
  for(const side of [-1,1]){piece(joeHead,'sphere',0x1a2725,side*.075,.035,-.15,.025,.025,.019);piece(joeHead,'box',0x5c5943,side*.075,.08,-.15,.08,.022,.025);}
  piece(joeHead,'sphere',0x8b8d76,0,-.11,-.12,.13,.075,.07);
  piece(joeHead,'sphere',0x40564d,0,.18,.01,.21,.1,.21);piece(joeHead,'box',0x40564d,0,.15,-.21,.37,.035,.23);
}
async function buildLandmarks(data,cancelled=()=>false){
  // Large silhouettes outside the traversable boundaries, so their bases cannot become invisible obstacles.
  const x=-17,z=-37;
  if(pixelVolume){
    await pixelWorld.clubhouse(20,-52,cancelled);await yieldPreparation(cancelled);if(cancelled())return;
    await pixelWorld.shed(-18,-37,{cancelled});await yieldPreparation(cancelled);if(cancelled())return;
  }else if(pixelStyle){
    illustrated.add(staticRoot,'rough-cut-distant-clubhouse-v1',[80,280,1525,465],17,-52,13,4,{kind:'clubhouse',fixed:pixelVolume});
    illustrated.add(staticRoot,'rough-cut-maintenance-shed-v2',[160,110,1220,800],-17,-37,6.5,4.3,{kind:'service-building',fixed:pixelVolume});
  }else{
    for(const dx of [-1.4,1.4])for(const dz of [-1,1])baked('box',0x6b7463,x+dx,2.1,z+dz,.14,4.2,.14);
    baked('cylinder',0x557d7c,x,4.1,z,1.8,1.9,1.4);baked('cone',0x435c5b,x,5.25,z,1.9,.65,1.5);
    baked('box',0x66745e,17,1.8,-52,6,3.6,7);baked('cone',0x54493a,17,4,-52,5,.9,5,0,Math.PI/4,0);
    for(const dz of [-2,0,2])baked('box',0xd1ba79,13.98,1.7,-52+dz,.03,1,1);
  }
  for(const zone of data.zones.slice(1))sign(zone.name,zone.id==='night_range'?7:-10,-(zone.start+5)*SCALE,2.5);
  // Preserve the original exit anchor, collision footprint and filing contract.
  if(pixelVolume){
    const shed=point(data.shed);exitDoor=await pixelWorld.shed(shed.x,shed.z,{exit:true,cancelled});if(cancelled())return;
  }else{
    if(pixelStyle){illustrated.add(staticRoot,'rough-cut-shed-directions-v2',[115,30,730,465],-18*X_SCALE,-701*SCALE-.04,8.5,3.4,{kind:'shed-facade',fixed:true});}else baked('box',0x556859,-18*X_SCALE,2.8,-710*SCALE,8.5,.22,3.2);
    exitDoor=new THREE.Group();exitDoor.position.set(-18*X_SCALE-1,0,-701*SCALE);dynamicRoot.add(exitDoor);
    piece(exitDoor,'box',0x836644,1,1.2,0,2,2.4,.12);piece(exitDoor,'box',0xc8b76e,1.7,1.15,.09,.1,.25,.08);
    const door=label('MAINTENANCE EXIT',2.8);door.position.set(-18*X_SCALE,2.55,-701*SCALE);staticRoot.add(door);
  }
  const drain=point(data.drain);drain.z+=DRAIN_LAYOUT.archOffset;
  if(pixelVolume){pixelWorld.drain(drain.x,drain.z);}else if(pixelStyle){illustrated.add(staticRoot,'rough-cut-drain-culvert-v1',[150,160,1380,665],drain.x,drain.z-.08,4.15,2,{kind:'drain-facade',fixed:true});}
  const arch=new THREE.Mesh(new THREE.TorusGeometry(1.05,.19,6,20,Math.PI),material(0x8a9383));arch.position.set(drain.x,.12,drain.z);if(!pixelStyle)staticRoot.add(arch);else{arch.geometry.dispose();}
  baked('box',0x243936,drain.x,.07,drain.z-.4,1.85,.1,1.3);
  // The grate travels in front of the masonry, not through the stone arch.
  drainGate=new THREE.Group();drainGate.position.set(drain.x,0,drain.z+DRAIN_LAYOUT.gateOffset);drainGate.userData.masonryFrontZ=drain.z+.275;dynamicRoot.add(drainGate);
  for(let i=-.8;i<=.8;i+=.2){const h=Math.sqrt(1-i*i);piece(drainGate,pixelStyle?'cylinder':'box',pixelStyle?0x423a2c:0x546c68,i,h/2+.1,0,pixelStyle?.014:.045,h,pixelStyle?.014:.045);if(pixelStyle){piece(drainGate,'cylinder',0x8c6840,i,.29,.002,.019,.035,.019);piece(drainGate,'cylinder',0x6f5437,i,h*.7,.002,.016,.09,.016);}}
  if(pixelStyle)piece(drainGate,'cylinder',0x574431,0,.3,0,.018,1.7,.018,0,0,Math.PI/2);
  if(pixelVolume)exitMechanisms=createCourseExitMechanisms(dynamicRoot,exitDoor,drainGate);
  // Stateful shared pixel board marks the culvert without a duplicate sign.
    if(pixelVolume){await pixelWorld.landscape(cancelled);if(cancelled())return;}
    for(const side of [-1,1])for(let i=0;i<40;i++){
      const zz=3-i*3.2+(rand(i+13)-.5)*2.0,xx=side*(18+rand(i+side*43)*9);
      // Keep the service yard and clubhouse legible through natural clearings.
      if(pixelVolume&&((side<0&&Math.abs(zz+37)<4)||(side>0&&Math.abs(zz+52)<6)))continue;
      tree(xx,zz,4.2+rand(i*7)*5.0,.85+rand(i)*1.2);
    }
    if(pixelVolume){
      for(const side of [-1,1])for(let i=0;i<15;i++)tree(side*(27+rand(i+side*31)*13),4-i*9+rand(i+4)*3,4.5+rand(i+9)*5,1.2+rand(i)*1.0);
      for(let i=0;i<12;i++)tree(-19+i*3.45,-126-rand(i)*7,5+rand(i+4)*4,1.2+rand(i)*.7);
      for(let i=0;i<14;i++)tree(-21+i*3.3+rand(i+11),12+rand(i+73)*12,4.5+rand(i+37)*4,1.0+rand(i+19));
    }
  for(const side of [-1,1])for(let i=0;i<45;i++){if(pixelVolume){pixelWorld.post(side*13.1,1-i*2.7);}else if(pixelStyle){illustrated.add(staticRoot,'rough-cut-course-boundary-kit-v1',[70,70,530,870],side*13.1,1-i*2.7,.45,.9,{kind:'boundary-post'});}else baked('box',0x77725a,side*13.1,.45,1-i*2.7,.07,.9,.07);}
  if(pixelVolume)pixelWorld.rearFence(-data.bounds.maxX*X_SCALE-.12,data.bounds.maxX*X_SCALE+.12,-data.bounds.maxY*SCALE-.15);
  courseEntryGate=createCourseEntryGate(dynamicRoot,{halfWidth:data.bounds.maxX*X_SCALE+.12,z:-data.bounds.minY*SCALE+.42});
  stats.entryGate=courseEntryGate.stats();
  if(pixelVolume)for(const side of [-1,1])for(let i=0;i<44;i++){pixelWorld.boundaryRope(side*13.1,1-i*2.7);if(i%8===7){await yieldPreparation(cancelled);if(cancelled())return;}}
}
function disposeWorld(){courseVisualDetail?.dispose();courseVisualDetail=null;vegetationContact=null;ballPresentation=null;coursePointLights=[];exitMechanisms?.dispose();exitMechanisms=null;understoryCulling=null;playerCraft?.dispose();playerCraft=null;noiseHazardScene=null;wetGround?.dispose();wetGround=null;sprinklerSpray=null;objectiveCues=null;environmentGuidance=null;impactMask?.dispose();impactMask=null;waterSurfaces=[];pixelEffects?.dispose();pixelEffects=null;glowBillboards=null;glowFloor=null;glowAnchors=[];glowFloorPhases=[];pixelWorld?.dispose();joeModel?.dispose();joeModel=null;parallax?.dispose();parallax=null;if(!world)return;world.traverse(o=>{if(o.isLight)o.shadow?.dispose();o.customDepthMaterial?.dispose();if(o.isInstancedMesh)o.dispose();if(o.geometry&&!Object.values(geometries).includes(o.geometry))o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(![...materials.values()].includes(m)){if(!m.map?.userData.sharedPixelArt)m.map?.dispose();m.dispose();}}});}
function build(data){
  courseEntryGate=null;stats.entryGate=null;
  arrivalPhone=null;
  teeAnomaly=null;deadGreenScene=null;deadGreenRefuge=null;
  disposeWorld();frozenFrame='';currentData=data;world=new THREE.Scene();world.background=new THREE.Color(pixelStyle?0x142c36:0x334b5a);world.fog=new THREE.Fog(pixelStyle?0x0b151b:0x334b5a,24,70);
  staticRoot=new THREE.Group();dynamicRoot=new THREE.Group();world.add(staticRoot,dynamicRoot);stations=new Map();lights=[];pickups={};joe=null;joeIllustration=null;illustrated=createIllustratedProps();
  pixelWorld=pixelVolume?createPixelWorld(staticRoot,{label,glow:lanternGlow,economy:softwareRenderer}):null;
  camera.far=softwareRenderer?36:78;
  if(softwareRenderer)world.fog=new THREE.Fog(0x0b151b,18,34);
  const skyGeometry=new THREE.SphereGeometry(72,32,20),skyColors=[];
  for(let i=0;i<skyGeometry.attributes.position.count;i++){const y=skyGeometry.attributes.position.getY(i)/72,t=clamp(y*1.6,0,1),color=new THREE.Color(0x526b75).lerp(new THREE.Color(0x101e35),t);skyColors.push(color.r,color.g,color.b);}
  skyGeometry.setAttribute('color',new THREE.Float32BufferAttribute(skyColors,3));sky=new THREE.Mesh(skyGeometry,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));sky.renderOrder=-1;world.add(sky);
  if(pixelStyle){sky.visible=false;world.background=null;parallax=createParallax();}
  world.add(new THREE.HemisphereLight(0xc1d8df,0x657459,pixelVolume?.035:pixelStyle?.12:.18));world.add(new THREE.AmbientLight(0x9ba995,pixelVolume?.005:pixelStyle?.025:.035));const moon=new THREE.DirectionalLight(0xa9c7d9,pixelVolume?.14:pixelStyle?.18:.27);moon.position.set(-20,40,10);world.add(moon);
  moonShadow=null;nearLamp=null;if(pixelVolume){moonShadow=moon;moon.castShadow=!softwareRenderer;moon.shadow.mapSize.set(2048,2048);Object.assign(moon.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:.1,far:100});moon.shadow.bias=-.00025;moon.shadow.normalBias=.025;world.add(moon.target);nearLamp=new THREE.PointLight(0xffcb82,0,4,2);world.add(nearLamp);}
  lastShadowTime=-Infinity;lastShadowX=lastShadowZ=Infinity;lastShadowMechanisms="";
  if(!data.calibration)pixelEffects=createPixelEffects(world,{software:softwareRenderer,scale:SCALE,xScale:X_SCALE,moon,drain:data.drain?{x:data.drain.x*X_SCALE,z:-data.drain.y*SCALE}:null,blockers:data.obstacles.filter(o=>o.blocks&&!o.id.includes('pond')&&!o.lightRadius).map(o=>({id:o.id,x:o.x*X_SCALE,z:-o.y*SCALE,rx:(o.radiusX||o.radius)*SCALE,rz:(o.radiusY||o.radius)*SCALE})),ponds:data.obstacles.filter(o=>o.id.includes('pond')).map(o=>({id:o.id,x:o.x*X_SCALE,z:-o.y*SCALE,rx:(o.radiusX||o.radius)*SCALE,rz:(o.radiusY||o.radius)*SCALE}))});
  stats.ready=false;stats.preparing=true;currentKey=data.keyId;
  gpuFrameSamples.length=0;stats.gpuFrameAverageMs=stats.gpuFrameP95Ms=stats.gpuFrameSamples=0;presentationMeasuresScene=false;
  const scene=world,start=performance.now(),cancelled=()=>world!==scene;
  (async()=>{
  await yieldPreparation(cancelled);if(cancelled())return;
  const terrainStart=performance.now();await buildTerrain(data,data.calibration,cancelled);stats.terrainBuildMs=performance.now()-terrainStart;
  await yieldPreparation(cancelled);if(cancelled())return;
  let constructionSlice=performance.now();
  for(const o of data.obstacles){buildObstacle(o,data.calibration);if(performance.now()-constructionSlice>5){await yieldPreparation(cancelled);if(cancelled())return;constructionSlice=performance.now();}}

  if(!data.calibration){
    await buildLandmarks(data,cancelled);if(cancelled())return;await yieldPreparation(cancelled);if(cancelled())return;buildUnderstory(data);for(const a of data.actions){stations.set(a.id,station(a,a.id==='audit-bell'?'bell':a.id==='field-log'?'log':'release',data));const p=point(a);if(!pixelStyle){baked('box',0x746345,p.x+.8,2,p.z,.1,4,.1);baked('box',0xc3a968,p.x+.38,3.7,p.z,.8,.55,.025);}}
    pickups.practice=station({...data.practice,label:'PRACTICE TARGET'},'practice');
    // Matched pairs sit equally far from either side of each authored path.
    const routes=data.paths.map(route=>route.map(point));
    const pathSegments=data.paths.flatMap(path=>path.slice(1).map((p,i)=>[point(path[i]),point(p)]));
    const clearLamp=p=>{
      if(Math.abs(p.x)>data.bounds.maxX*X_SCALE-.25||p.z>-.25||p.z<-data.bounds.maxY*SCALE+.25)return false;
      if(data.obstacles.some(o=>{if(!o.blocks)return false;const c=point(o),rx=(o.radiusX||o.radius)*SCALE+.25,rz=(o.radiusY||o.radius)*SCALE+.25,dx=Math.abs(p.x-c.x)/rx,dz=Math.abs(p.z-c.z)/rz;return o.shape==='box'?dx<1&&dz<1:dx*dx+dz*dz<1;}))return false;
      return pathSegments.every(([a,b])=>{const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t)>1.08;});
    };
    const pairs=courseLanternPairs(routes,{clear:clearLamp});stats.pathLanterns={spacing:12,openingSpacing:10,offset:1.25,lampsPerSite:2,maxPairs:14,pairs};
    let lampSlice=performance.now();
    for(const pair of pairs)for(const p of pair.lamps){
      if(pixelVolume){pixelWorld.lantern(p.x,p.z);}else if(pixelStyle){illustrated.add(staticRoot,'rough-cut-path-lantern-atlas-v1',[135,35,345,555],p.x,p.z,.35,.6,{kind:'guide-lantern'});}else{baked('box',0x5c6751,p.x,.25,p.z,.07,.5,.07);baked('box',0xc7d7aa,p.x,.5,p.z,.15,.1,.15);}
      if(!pixelVolume)lanternGlow(staticRoot,p.x,.36,p.z,.32);
      if(performance.now()-lampSlice>5){await yieldPreparation(cancelled);if(cancelled())return;lampSlice=performance.now();}
    }
    for(const a of data.reviews)stations.set(a.id,station({...a,label:'SUPPLY LOCKER'},'supply',data));
    for(const a of data.notes){const p=point(a),plate=label(a.title,Math.max(1.2,(a.radiusX||7)*SCALE*1.6));plate.position.set(p.x,1.7,p.z+.112);staticRoot.add(plate);}
    pickups.key=station({...data.key,label:'SHED KEY'},'key',data);pickups.valve=station({...data.valve,label:'DRAIN VALVE'},'valve',data);
    noiseHazardScene=createNoiseHazardScene(staticRoot,data.noiseHazards||[],{scale:SCALE,xScale:X_SCALE});
    objectiveCues=createObjectiveCues(world,data,{scale:SCALE,xScale:X_SCALE});
    environmentGuidance=createEnvironmentGuidance(world,data,{scale:SCALE,xScale:X_SCALE});
    const irrigation=sprinklerLayout(data,SCALE,X_SCALE);
    if(pixelVolume)for(const head of irrigation)pixelWorld.irrigationHead(head);
    sprinklerSpray=createSprinklerSpray(world,irrigation,{software:softwareRenderer});
    buildJoe();
    if(pixelVolume)courseVisualDetail=createCourseVisualDetail(world,data,{scale:SCALE,xScale:X_SCALE,software:softwareRenderer});
    const moonMesh=new THREE.Mesh(new THREE.SphereGeometry(3,16,10),new THREE.MeshBasicMaterial({color:0xc9d7d1}));moonMesh.scale.setScalar(.5);moonMesh.position.set(-30,38,-48);sky.add(moonMesh);
  }else pickups.marker=station({...data.marker,label:'FINISH'},'bell');
  const buildingWorld=world,geometryReady=pixelWorld?.finish(()=>world!==buildingWorld);flush();
  ballPresentation=createCourseBallPresentation(world,{scale:SCALE,xScale:X_SCALE});ball=ballPresentation.ball;
  aimTarget=new THREE.Mesh(new THREE.RingGeometry(.25,.3,24),new THREE.MeshBasicMaterial({color:0xe9ce8c,side:THREE.DoubleSide}));aimTarget.rotation.x=-Math.PI/2;world.add(aimTarget);
  aimLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xe9ce8c}));world.add(aimLine);
  aimLine.geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(75),3));
  recoveryBalls=[];for(let i=0;i<12;i++){const b=new THREE.Mesh(geometries.sphere,material(0xf5f0d7,true));b.scale.setScalar(.065);world.add(b);recoveryBalls.push(b);}
  particles=new THREE.InstancedMesh(geometries.leaf,new THREE.MeshBasicMaterial({color:0xffffff}),64);particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);particles.frustumCulled=false;particles.setColorAt(0,particleColor.set(0xffffff));particles.setMatrixAt(0,matrix.makeTranslation(0,-1000,0));particles.count=1;world.add(particles);
  impactMask=pixelStyle?createImpactMask():null;effectRings=[];for(let i=0;i<16;i++){const ring=new THREE.Mesh(pixelStyle?new THREE.PlaneGeometry(2,2):new THREE.RingGeometry(.8,1,16),new THREE.MeshBasicMaterial({map:impactMask,alphaTest:pixelStyle?.02:0,color:0xd7c891,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;world.add(ring);effectRings.push(ring);}
  restMarker=new THREE.Mesh(new THREE.RingGeometry(.07,.11,20),new THREE.MeshBasicMaterial({color:0xc4e5db,side:THREE.DoubleSide}));restMarker.rotation.x=-Math.PI/2;world.add(restMarker);
  rollLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:0xc4e5db,dashSize:.15,gapSize:.1}));rollLine.geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));world.add(rollLine);
  playerCraft=createCoursePlayerCraft(world);
  if(!data.calibration)arrivalPhone=createArrivalPhone(world,playerCraft.attachPhoneHand);
  if(!data.calibration){deadGreenScene=createDeadGreenScene(world,{scale:SCALE,xScale:X_SCALE});deadGreenRefuge=createDeadGreenRefuge(world,{scale:SCALE,xScale:X_SCALE,paths:data.paths});}
  if(!data.calibration)teeAnomaly=createTeeAnomaly(world,{scale:SCALE,xScale:X_SCALE});
    await geometryReady;
    if(cancelled())return;batchGlows();
    stats.constructionMs=performance.now()-start;
    while(joeModel&&!joeModel.stats().ready&&!joeModel.stats().error){if(cancelled())return;await yieldPreparation(cancelled);}
    if(cancelled())return;
    if(pixelStyle&&joeModel?.stats().error){
      // Only construct directional fallback cells after an actual model failure.
      joeModel.dispose();
      for(const view of [1,2,3])for(let frame=0;frame<4;frame++)for(const name of ['rough-cut-joe-state-directions-v1','rough-cut-joe-walk-directions-v2'])PixelArt.texture(name,[frame*384+8,(view-1)*384+24,368,336]);
      for(const frame of [0,2,7])PixelArt.texture('joe-mower-animated-v1',[frame*192+48,8,96,184]);
      joeIllustration=PixelArt.card('joe-mower-animated-v1',[48,8,96,184],.96,1.84);joeIllustration.position.y=.92;dynamicRoot.add(joeIllustration);joeView=0;
    }
    await pixelEffects?.ready;if(cancelled())return;
    while(PixelArt.stats().pending&&world===scene)await yieldPreparation(cancelled);
    if(world!==scene)return;
    // Include authored building lamps as well as the nearest path lantern.
    // Omitting any point light here would incorrectly remove its contribution
    // from static scenery. Rebuild this inventory with each course scene.
    coursePointLights=[];scene.traverse(object=>{if(object.isPointLight)coursePointLights.push(object);});
    pixelWorld?.updateCulling(camera);updateGlows();
    const backdrop=parallax,target=direct?sceneTarget:null;
    if(backdrop)await prepareRendering(renderer,backdrop.scene,backdrop.camera,backdrop.scene,target,cancelled);
    await prepareRendering(renderer,scene,camera,scene,target,cancelled);
    const lightVariants=pixelWorld?.localLighting?.preparation;
    if(lightVariants){
      await prepareRendering(renderer,lightVariants,camera,scene,target,cancelled);
      await prepareStaticBuffers(renderer,lightVariants,camera,scene,target,cancelled);
    }
    // The scene target and the display framebuffer use different shader
    // variants. Prepare the final scene/HUD compositor before the first view.
    if(direct)await prepareRendering(renderer,compositor,screenCamera,compositor,null,cancelled);
    if(pixelEffects)await prepareStaticBuffers(renderer,pixelEffects.preparation,camera,scene,target,cancelled);
    await prepareStaticBuffers(renderer,staticRoot,camera,scene,target,cancelled);
    while(joeModel&&!joeModel.stats().ready&&!joeModel.stats().error){if(cancelled())return;await yieldPreparation(cancelled);}
    if(cancelled())return;
    // Allocate geometry buffers and the shadow framebuffer before simulation
    // resumes. Shader compilation/reflection above is already frame-sliced.
    const warmStart=performance.now();renderer.setRenderTarget(target);
    if(backdrop)renderer.render(backdrop.scene,backdrop.camera);
    renderer.render(scene,camera);stats.warmupSubmitMs=performance.now()-warmStart;
    const drainStart=performance.now();await waitForGPU(renderer,cancelled);stats.gpuDrainMs=performance.now()-drainStart;if(cancelled())return;
    stats.prepareMs=performance.now()-start;stats.preparing=false;stats.ready=true;frozenFrame='';
  })().catch(e=>{if(world===scene){failure=String(e?.message||e);stats.error=failure;stats.preparing=false;}});
}
function initialize(canvas){
  try{renderer=new THREE.WebGLRenderer({...(canvas?{canvas}:{}),antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.shadowMap.enabled=pixelVolume;renderer.shadowMap.type=THREE.BasicShadowMap;renderer.setSize(canvas?1280:960,canvas?720:540,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;camera=new THREE.PerspectiveCamera(58,16/9,.055,78);document.getElementById('game').style.imageRendering=pixelStyle?'pixelated':'auto';const gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');stats.gpu=info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);}
  catch(e){failure=e.message;stats.error=failure;}
  if(renderer&&!failure){softwareRenderer=/swiftshader|llvmpipe|software|microsoft basic render/i.test(stats.gpu);renderer.shadowMap.enabled=pixelVolume;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;stats.quality={softwareRenderer,shadows:renderer.shadowMap.enabled,moonShadows:pixelVolume&&!softwareRenderer,beaconShadows:false,textureDetail:'original',resolutionCap:softwareRenderer?.75:1};}
  if(renderer&&softwareRenderer)renderer.setOpaqueSort(stableLightMaterialSort);
}
function createSurface(canvas){
  if(legacy||new URLSearchParams(location.search).get('presentation')==='copy')return null;
  initialize(canvas);if(failure)return null;direct=true;
  surface=document.createElement('canvas');surface.width=1280;surface.height=720;
  sceneTarget=new THREE.WebGLRenderTarget(960,540,{depthBuffer:true,stencilBuffer:false,minFilter:pixelStyle?THREE.NearestFilter:THREE.LinearFilter,magFilter:pixelStyle?THREE.NearestFilter:THREE.LinearFilter});
  customTarget=softwareRenderer?sceneTarget.clone():sceneTarget;
  if(softwareRenderer)for(const scale of [.75,.625,.5]){
    const target=scale===.75?sceneTarget:sceneTarget.clone();target.setSize(1280*scale,720*scale);softwareTargets.set(target.width,target);renderer.initRenderTarget(target);
  }
  compositor=new THREE.Scene();screenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);screenCamera.position.z=1;
  sceneQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:sceneTarget.texture,depthTest:false,depthWrite:false}));compositor.add(sceneQuad);
  screenFracture=createScreenFracture(sceneQuad.material,{software:softwareRenderer});
  hudTexture=new THREE.CanvasTexture(surface);hudTexture.colorSpace=THREE.SRGBColorSpace;hudTexture.generateMipmaps=false;hudTexture.minFilter=THREE.LinearFilter;
  const overlay=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:hudTexture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));overlay.renderOrder=1;compositor.add(overlay);overlayQuad=overlay;
  stats.presentation='direct-gpu';return surface;
}
function beginFrame(){skipPresentation=false;worldDrawn=false;useDomHud=false;screenFracture?.clear();pixelEffects?.hide();window.RCQualityUI?.hide();const loading=document.getElementById('course-loading');if(loading)loading.hidden=true;}
function present(uiKey=null){
  if(!direct)return;
  if(skipPresentation)return;
  if(softwareRenderer&&presentationBusy()){deferPresentation();return;}
  // The software scene already has its final pixel grid. Let CSS nearest
  // sampling enlarge it instead of shading a second 1280x720 image. DOM HUD
  // stays full-size; canvas menus/maps restore their original backing size.
  const nativePixels=softwareRenderer&&pixelStyle&&worldDrawn&&useDomHud;
  const portrait=renderer.domElement.parentElement?.dataset.coursePortrait==='true';
  const outputWidth=nativePixels||portrait?sceneTarget.width:1280,outputHeight=nativePixels||portrait?sceneTarget.height:720;
  if(renderer.domElement.width!==outputWidth||renderer.domElement.height!==outputHeight)renderer.setSize(outputWidth,outputHeight,false);
  stats.presentationResolution=[outputWidth,outputHeight];
  const start=performance.now();sceneQuad.visible=worldDrawn;overlayQuad.visible=!useDomHud;if(!useDomHud&&(uiKey===null||uiKey!==lastHudKey))hudTexture.needsUpdate=true;lastHudKey=uiKey;renderer.setRenderTarget(null);renderer.render(compositor,screenCamera);stats.compositeSubmitMs=performance.now()-start;
  if(softwareRenderer){const gl=renderer.getContext();presentationMeasuresScene=stats.frames!==lastMeasuredFrame&&!stats.preparing;lastMeasuredFrame=stats.frames;presentationFence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();pollPresentation();}
}
function render(ctx,data,frame){
  courseEntryGate?.update(frame);
  if(legacy||failure)return false;if(!renderer)initialize();if(failure)return false;
  if(currentKey!==data.keyId){build(data);lastTime=frame.time;}
  const portrait=direct&&renderer.domElement.parentElement?.dataset.coursePortrait==='true';
  const aspect=portrait?renderer.domElement.clientWidth/renderer.domElement.clientHeight:16/9;
  const frozenSignature=[aspect,data.keyId,frame.time,frame.player.x,frame.player.y,frame.yaw,frame.pitch,frame.fov,frame.resolution,frame.eyeHeight,frame.fx?.flashes,frame.reducedMotion].join(':');
  if(!stats.preparing&&frame.paused&&frozenFrame===frozenSignature){worldDrawn=true;stats.worldSubmitMs=0;stats.copyMs=0;if(!direct){const start=performance.now();ctx.drawImage(renderer.domElement,0,0,1280,720);stats.copyMs=performance.now()-start;}return true;}
  // Simulation and DOM feedback still update on every input frame. Defer costly
  // scene culling, poses and buffer edits until this latest image can be drawn.
  pixelEffects?.screen(frame);
  if(!stats.preparing&&direct&&softwareRenderer&&presentationBusy()){skipPresentation=true;worldDrawn=true;deferPresentation();return true;}
  const dt=clamp(frame.time-lastTime,0,.1);lastTime=frame.time;
  const renderScale=Math.min(frame.resolution||.75,softwareRenderer?softwareBudget.scale():1,stats.quality?.resolutionCap||1),{width,height}=courseRenderSize(aspect,renderScale);if(direct){sceneTarget=(!portrait&&softwareTargets.get(width))||customTarget;if(sceneTarget.width!==width||sceneTarget.height!==height)sceneTarget.setSize(width,height);sceneQuad.material.map=sceneTarget.texture;}else if(renderer.domElement.width!==width)renderer.setSize(width,height,false);stats.resolution=[width,height];
  const p=point(frame.player),yaw=frame.yaw,eye=frame.eyeHeight??(frame.crouched?1.12:1.65);
  camera.aspect=aspect;camera.fov=frame.fov||58;camera.updateProjectionMatrix();stats.cameraAspect=aspect;camera.position.set(p.x,eye+(frame.bob||0),p.z);
  camera.rotation.set(frame.pitch||0,-yaw,frame.roll||0,'YXZ');camera.updateMatrixWorld();
  if(stats.preparing){const loading=document.getElementById('course-loading');if(loading)loading.hidden=frame.paused;skipPresentation=!frame.paused;if(!skipPresentation){renderer.setRenderTarget(direct?sceneTarget:null);renderer.setClearColor(0x081318);renderer.clear();}worldDrawn=true;return true;}
  const pitch=frame.pitch||0;camera.rotation.set(pitch,-yaw,frame.roll||0,'YXZ');camera.updateMatrixWorld();vegetationContact?.update(frame);understoryCulling?.update(camera);pixelWorld?.updateCulling(camera);pixelWorld?.updateReeds(frame);updateGlows(frame);for(const water of waterSurfaces)water.update(frame,camera);sky.position.copy(camera.position);parallax?.update(camera,frame.time,frame.reducedMotion,frame.paused,frame.fx?.nightfall);illustrated?.update(camera);
  if(moonShadow){const step=44/2048,x=Math.round(p.x/step)*step,z=Math.round(p.z/step)*step;moonShadow.target.position.set(x,0,z);moonShadow.position.set(x-20,40,z+10);let nearest=null,distance=4;for(const anchor of glowAnchors){const d=anchor.position.distanceTo(camera.position);if(d<distance){nearest=anchor;distance=d;}}nearLamp.intensity=nearest?4*(1-THREE.MathUtils.smoothstep(distance,1.1,4))*nearest.intensity:0;if(nearest)nearLamp.position.copy(nearest.position);}
  // Pose the door before the warning lamp checks moving shadow casters.
  // Sealing advances independently of the stopped course clock.
  const exitPose=courseExitRelease(frame);
  if(exitDoor)exitDoor.rotation.y=(pixelVolume?1:-1)*exitPose.shedDoor;
  if(exitMechanisms)exitMechanisms.update(frame);else if(drainGate)drainGate.position.y=exitPose.drainLift;
  for(const l of lights)updateFloodlight(l,frame.lightPower(l.o));
  pixelWorld?.localLighting?.update(coursePointLights);
  if(renderer.shadowMap.enabled){
    // Repeated renders and paused views reuse the shadow map. Movement refreshes
    // immediately; stationary actor animation needs at most 30 shadow samples/s.
    const mechanisms=[frame.sealing,frame.exitProgress,frame.valveOpen,frame.quietProgress,frame.hasKey,frame.completed.join(','),frame.reviews.join(',')].join(':');
    if(p.x!==lastShadowX||p.z!==lastShadowZ||mechanisms!==lastShadowMechanisms||frame.time<lastShadowTime||frame.time-lastShadowTime>=1/30){renderer.shadowMap.needsUpdate=true;lastShadowTime=frame.time;lastShadowX=p.x;lastShadowZ=p.z;lastShadowMechanisms=mechanisms;}
  }
  if(joeModel){
    const position=point(frame.joe);joeModel.setDistance(camera.position.distanceTo(position));joeModel.update(frame,position,SCALE,dt);
    actorProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);actorFrustum.setFromProjectionMatrix(actorProjection);
    actorBounds.center.copy(position);actorBounds.center.y=1.1;
    joeModel.root.visible=actorFrustum.intersectsSphere(actorBounds);
  }
  if(joeIllustration){
    joeIllustration.visible=!joeModel?.stats().ready;
    const jp=point(frame.joe),toViewer=Math.atan2(frame.player.y-frame.joe.y,(frame.player.x-frame.joe.x)*.72),heading=frame.joe.effectHeading||0,angle=heading-toViewer,facing=Math.cos(angle);
    // Hysteresis prevents atlas flicker at quarter-view boundaries.
    const threshold=joeView===0||joeView===2?.61:.75;
    joeView=facing>threshold?0:facing<-threshold?2:Math.sin(angle)>=0?1:3;
    const step=frame.joe.effectSpeed<.4?1:Math.floor((frame.joe.walkMeters||0)/1.6)%4;
    const pose=frame.joe.mode==='chase'?3:frame.joe.mode==='search'?2:frame.joe.mode==='investigate'?1:-1;
    const stopped=frame.joe.effectSpeed<.4&&pose>=0;
    const name=joeView===0?'joe-mower-animated-v1':stopped?'rough-cut-joe-state-directions-v1':'rough-cut-joe-walk-directions-v2';
    const crop=joeView===0?[(frame.inspecting?2:frame.joe.mode==='chase'?7:0)*192+48,8,96,184]:[(stopped?pose:step)*384+8,(joeView-1)*384+24,368,336];
    stats.joeView=joeView;joeIllustration.material.map=PixelArt.texture(name,crop);joeIllustration.scale.x=joeView===0?1:2.1;
    joeIllustration.position.set(jp.x,.92,jp.z);joeIllustration.rotation.y=Math.atan2(camera.position.x-jp.x,camera.position.z-jp.z);
  }
  if(joe){const jp=point(frame.joe);joe.position.copy(jp);joe.rotation.y=(frame.joe.effectHeading||0)-Math.PI/2;joeHead.rotation.y=0;joeHead.rotation.x=frame.inspecting?.18:frame.joe.mode==='chase'?-.08:0;for(const wheel of wheels)wheel.rotation.y=(frame.joe.walkMeters||0)*SCALE*3;}
  objectiveCues?.update(frame);
  environmentGuidance?.update(frame);
  sprinklerSpray?.update(frame,camera);
  wetGround?.update(frame);
  courseVisualDetail?.update(frame);stats.visualDetail=courseVisualDetail?.stats()||null;
  if(pickups.valve?.pressureNeedle)pickups.valve.pressureNeedle.rotation.z=frame.soakSeconds>0?-.8:1.1;
  noiseHazardScene?.update(frame.noiseHazards);
  for(const [id,entry]of stations){const done=frame.completed.includes(id)||frame.reviews.includes(id)||frame.notes.includes(id),activation=frame.activation?.id===id?frame.activation:null,t=activation?1-activation.timer/activation.duration:0;entry.lamp.material.color.setHex(done?0x8cc991:0xe2bd6c);const ink=entry.root.getObjectByName('completed-ink');if(ink)ink.visible=done;if(entry.illustration){entry.illustration.rotation.z=activation?Math.sin(t*Math.PI*7)*(1-t)*.018:0;entry.illustration.material.color.setHex(activation?0xffe8b8:0xffffff);}if(entry.kind==='supply'){const beat=frame.stationFeedback,age=beat?.id===id?(frame.time-beat.startedAt)/.3:1;entry.moving.position.z=.29+(done?.19*(frame.reducedMotion?1:THREE.MathUtils.smoothstep(age,0,1)):0)+stationImpulse(frame,id)*.025;}if(entry.kind==='bell')entry.moving.rotation.z=activation&&!frame.reducedMotion?Math.sin(t*Math.PI*7)*(1-t)*.5:id==='audit-bell'?auditResponseBellPose(frame.auditResponse,frame.reducedMotion):0;if(entry.kind==='log'||entry.kind==='release'){
    const pose=stationMechanismPose(frame,id,entry.kind);entry.mechanismPose=pose;
    if(entry.kind==='log'){entry.moving.position.y=(entry.mechanism?.stampRest??1.2)-pose.stamp*(entry.mechanism?.stampTravel??.06);if(entry.mechanism?.page)entry.mechanism.page.rotation.z=Math.PI*pose.pageTurn;}
    else {entry.moving.rotation.z=-.9*pose.release;const receipt=entry.mechanism?.receipt;if(receipt){receipt.visible=pose.done;receipt.position.y=.96+pose.receipt*.19;}if(entry.mechanism?.hood)entry.mechanism.hood.rotation.x=-Math.PI/2*pose.hoodClose;}
  }}
  if(pickups.key)pickups.key.moving.visible=!frame.hasKey;if(pickups.valve){pickups.valve.moving.rotation.y=THREE.MathUtils.damp(pickups.valve.moving.rotation.y,frame.valveOpen?Math.PI/2:0,9,dt);pickups.valve.lamp.material.color.setHex(frame.valveOpen?0x8cc991:0xe2bd6c);}if(pickups.marker)pickups.marker.lamp.material.color.setHex(frame.markerReached?0x8cc991:0xe2bd6c);
  if(pickups.practice){const status=practiceStatus(frame);pickups.practice.lamp.material.color.setHex(status==='ready'?0xe2bd6c:0x617567);const beat=frame.stationFeedback,age=beat?.id==='practice-bell'?(frame.time-beat.startedAt)/beat.duration:1;pickups.practice.moving.rotation.x=stationImpulse(frame,'practice-bell')*.45-(status==='ready'?0:frame.reducedMotion?.95:.95*THREE.MathUtils.smoothstep(age,.65,1));}
  for(const [name,done]of [['valve',frame.valveOpen],['practice',frame.practiceDone],['marker',frame.markerReached]]){const entry=pickups[name];if(entry){const ink=entry.root.getObjectByName('completed-ink');if(ink)ink.visible=!!done;if(done)entry.lamp.material.color.setHex(0x8cc991);}}

  arrivalPhone?.update(camera,frame);stats.arrivalPhoneVisible=arrivalPhone?.visible()||false;
  deadGreenScene?.update(frame);stats.deadGreen=deadGreenScene?.stats()||null;stats.deadGreenRefuge=deadGreenRefuge?.stats()||null;
  teeAnomaly?.update(frame);stats.teeAnomaly=teeAnomaly?.stats()||null;

  ballPresentation.update(frame);
  for(let i=0;i<recoveryBalls.length;i++){const entry=frame.balls?.[i],mesh=recoveryBalls[i];mesh.visible=Boolean(entry);if(entry){mesh.position.copy(point(entry));mesh.position.y=.065;}}
  const motes=(frame.particles||[]).slice(-64);particles.count=motes.length;
  for(let i=0;i<motes.length;i++){
    const e=motes[i],p=particlePosition.set(e.x*X_SCALE,0,-e.y*SCALE),life=clamp(1-e.age/e.duration,0,1),spark=e.kind==='mower_spark',dust=e.kind==='grass_dust',wet=e.kind==='wet_clipping';
    const size=(spark?.018:dust?.05:.027)*(.4+.6*life);p.y=Math.max(.025,e.z||.04);
    const q=particleRotation.setFromEuler(particleEuler.set(e.rotation||0,(e.rotation||0)*.4,0));
    matrix.compose(p,q,particleScale.set(size,dust?size*.35:wet?size*2.2:spark?size*2.6:size*.7,size*.6));particles.setMatrixAt(i,matrix);
    particles.setColorAt(i,particleColor.set(e.color||0x8eac69).multiplyScalar(.55+.45*life));
  }
  particles.instanceMatrix.needsUpdate=true;if(particles.instanceColor)particles.instanceColor.needsUpdate=true;
  const impacts=(frame.effects||[]).filter(e=>['ball_impact','ball_settle','filing_stamp','pickup','sprinkler'].includes(e.kind)),steps=(frame.steps||[]).filter(e=>e.kind==='wet'||e.kind==='sand'||e.kind==='footing_mud');
  const effects=[...impacts,...steps].slice(-16);for(let i=0;i<effectRings.length;i++){const ring=effectRings[i],e=effects[i];ring.visible=Boolean(e);if(e){const t=clamp(e.age/e.duration,0,1),size=(e.kind.startsWith('ball')?.22:.12)+t*.55;ring.position.copy(point(e));ring.position.y=e.height??.025;if(e.height)ring.quaternion.copy(camera.quaternion);else ring.rotation.set(-Math.PI/2,0,0);ring.scale.set(size,size*(e.kind==='wet'||e.kind==='sprinkler'?1:.68),1);ring.material.opacity=(1-t)*(1-t)*(pixelStyle?.38:.5);ring.material.color.set(e.color||(e.kind==='wet'?0x91b8b5:e.kind==='footing_mud'?0x6c634e:0xd5c48b));}}
  aimTarget.visible=aimLine.visible=Boolean(frame.aim);if(frame.aim){const target=point(frame.aim),contact=frame.shotPlan?.flightContact;target.y=contact?.height??.03;aimTarget.position.copy(target);aimTarget.scale.setScalar(contact?.45:1);if(contact)aimTarget.quaternion.copy(camera.quaternion);else aimTarget.rotation.set(-Math.PI/2,0,0);const attr=aimLine.geometry.attributes.position;for(let i=0;i<=24;i++){const sample=courseBallFlightPosition({start:frame.player,target:frame.aim,power:frame.charge||0,shotPlan:frame.shotPlan},i/24);attr.setXYZ(i,sample.x*X_SCALE,sample.height,-sample.y*SCALE);}attr.needsUpdate=true;aimLine.geometry.computeBoundingSphere();}
  restMarker.visible=rollLine.visible=Boolean(frame.aim&&frame.rest);if(restMarker.visible){const a=point(frame.aim),b=point(frame.rest);restMarker.position.set(b.x,.035,b.z);const attr=rollLine.geometry.attributes.position;attr.setXYZ(0,a.x,.035,a.z);attr.setXYZ(1,b.x,.035,b.z);attr.needsUpdate=true;rollLine.geometry.computeBoundingSphere();rollLine.computeLineDistances();}
  playerCraft?.update(camera,frame);
  if(pixelEffects){
    // Reuse authored fixture positions; moths respond to actual lamp power.
    frame.fx.lamps=lights.map(l=>({x:l.pool.position.x,y:2.8,z:l.pool.position.z,power:l.power,color:l.tint}));
    pixelEffects.update(frame,camera,parallax?.moonCoverage()||0);
  }
  screenFracture?.update(frame,pixelEffects?.interference(),width,height);
  stats.screenFracture=screenFracture?.stats();
  const submit=performance.now();renderer.setRenderTarget(direct?sceneTarget:null);if(parallax){renderer.autoClear=false;renderer.clear();renderer.render(parallax.scene,parallax.camera);stats.backgroundDrawCalls=renderer.info.render.calls;renderer.clearDepth();renderer.render(world,camera);renderer.autoClear=true;}else renderer.render(world,camera);stats.worldSubmitMs=performance.now()-submit;worldDrawn=true;
  if(!direct){const copy=performance.now();ctx.imageSmoothingEnabled=!pixelStyle;ctx.drawImage(renderer.domElement,0,0,1280,720);ctx.imageSmoothingEnabled=false;const fracture=drawCopyFracture(ctx,frame,pixelEffects?.interference(),width,height);stats.screenFracture={mode:'scene-self-blit',shiftPixels:fracture?.shiftPixels||0,extraPasses:0,readbacks:0};stats.copyMs=performance.now()-copy;stats.presentation='copy';}else stats.copyMs=0;
  lastWorldSubmitStarted=submit;frozenFrame=frozenSignature;
  stats.drawCalls=renderer.info.render.calls+(parallax?stats.backgroundDrawCalls:0);stats.triangles=renderer.info.render.triangles;stats.frames++;return true;
}
function project(p,height=0){if(!camera)return null;const q=point(p);q.y=height;q.project(camera);return {x:(q.x+1)*640,y:(1-q.y)*360,visible:q.z>-1&&q.z<1&&Math.abs(q.x)<1&&Math.abs(q.y)<1};}
window.RCScene3D={ready:true,encounterPhase:()=>pixelEffects?.encounterPhase()||'quiet',ambientAudioState:()=>pixelEffects?.audioState()||null,performanceStats,onFrameAvailable:fn=>{frameAvailable=fn;},whenPresented,isPreparing:()=>stats.preparing,domHud:()=>direct,showDomHud:()=>{useDomHud=true;},render,project,createSurface,beginFrame,present,stats:()=>({...stats,vegetation:vegetationContact?.stats(),ball:ballPresentation?.stats(),exitMechanisms:exitMechanisms?.stats(),understory:understoryCulling?.stats(),playerCraft:playerCraft?.stats(),objectiveCues:objectiveCues?.stats(),environmentGuidance:environmentGuidance?.stats(),sprinklers:sprinklerSpray?.stats(),wetGround:wetGround?.stats(),stationVisuals:[...stations].map(([id,e])=>({id,kind:e.kind,rotation:e.moving.rotation.z,drawer:e.moving.position.z,height:e.moving.position.y,mechanism:e.mechanismPose||null,receipt:e.mechanism?.receipt?{visible:e.mechanism.receipt.visible,height:e.mechanism.receipt.position.y}:null,ink:e.root.getObjectByName('completed-ink')?.visible,facing:e.root.rotation.y,lamp:e.lamp.material.color.getHex()})),accessVisuals:['key','valve'].map(id=>({id,facing:pickups[id]?.root.rotation.y,lamp:pickups[id]?.lamp.material.color.getHex()})),practiceVisual:pickups.practice?{kind:pickups.practice.kind,tilt:pickups.practice.moving.rotation.x}:null,bitmapDecode:bitmapDecodeStats(),effects:pixelEffects?.stats(),water:waterSurfaces.map(w=>w.stats()),reeds:pixelWorld?.reedStats(),preparation:preparationStats(renderer),joeModel:joeModel?.stats(),pixelArt:PixelArt.stats(),parallax:parallax?.stats(),illustrated:illustrated?.stats(),pixelWorld:pixelWorld?.stats(),noiseHazards:noiseHazardScene?.stats(),localLighting:pixelWorld?.localLighting?.stats(),error:failure}),legacy,reset:()=>{currentKey='';}};
