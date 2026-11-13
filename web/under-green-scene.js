import {createJoeCastShadow} from './under-green-cast-shadow-scene.js';
import {createDrainFillLights} from './under-green-fill-light.js';
import {createDrainTonalGrade} from './under-green-tonal-grade.js';
import {createStrikeDebris} from './under-green-strike-debris-scene.js';
import {createDrainShadow} from './under-green-shadow.js';
import {panicCameraMotion} from './under-green-camera-motion.js';
import {createDrainHaunting} from './under-green-haunting.js';
import {createDrainFlood} from './under-green-flood-scene.js';
import {createUnderGreenSurfaces} from './under-green-surfaces.js';
import {createCraftedDrainSurfaces,shadeDrainMaterial} from './under-green-crafted-surfaces.js';
import {buildDrainVaults} from './under-green-vaults.js';
import {buildDistrictEnclosure} from './under-green-district-enclosure.js';
import {buildDrainWallRepairs} from './under-green-wall-repairs.js';
import {finishDrainGround} from './under-green-ground-finish.js';
import {createDrainWetGround} from './under-green-wet-ground-scene.js';
import {keeperWallPieces} from './under-green-keeper-layout.js';
import {prepareDrainMachinery} from './under-green-machinery-detail.js';
import {finishDrainLamps,finishSignalHousing,signalGlassTexture,prepareSignalLens} from './under-green-fixture-finish.js';
import {createCourseSurfaces} from './course-surfaces.js';
import {createKeeperGate} from './under-green-gate-scene.js';
import {createKeeperRelease} from './under-green-release-scene.js';
import {createServiceSupports,galleryBallPositions} from './under-green-services.js';
import {buildServiceGrate} from './under-green-grating.js';
import {buildUnderGreenDistricts} from './under-green-districts.js';
import {buildUnderGreenStructure} from './under-green-structure.js';
import {roofPanels,buildCourseOverhead} from './under-green-overhead.js';
import {createSoftwareFrameBudget} from './software-frame-budget.js';
import {createCourseBatchCulling} from './course-batch-culling.js';
import {createSolidOcclusion} from './solid-occlusion.js';
import {inspectGeometrySpheres,inspectGeometryBoxes,createCameraClearanceAudit} from './geometry-clearance-audit.js';
import {channelNozzles} from './under-green-flow.js';
import {bankSignalMount} from './under-green-signals.js';
import {DRY_ROUTES,rangeY,RANGE_SCALE} from './under-green-layout.js';
import {ARRIVAL} from './under-green-encounters.js';
import {PUMP_KNOCKS} from './under-green-pump.js';
import {createPumpControl} from './under-green-pump-scene.js';
import {createDrainHumidity} from './under-green-humidity.js';
import {createDrainContactShade} from './under-green-contact-shade.js';
import {createDrainSignArt} from './under-green-sign-art.js';
import {createDrainFogMaterials} from './under-green-fog-materials.js';
import {createDrainPracticalLighting} from './under-green-practical-lighting.js';
import {buildDampAtmosphere} from './under-green-atmosphere.js';
import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {FLOORS,OBSTACLES,WATERS,LEVER,NOTE,SLUICE,GATE,onFloor,floorLayout,covered,waterState,distance,district} from './under-green-course.js';
import {createTrimmerJoe} from './under-green-actor.js';
import {createDrainWater} from './under-green-water.js';

export async function createUnderGreenScene(canvas,onProgress=()=>{},{captureBuffer=false}={}){
 const renderer=new THREE.WebGLRenderer({canvas,stencil:true,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:captureBuffer});renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info'),gpu=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'',software=/swiftshader|software|llvmpipe/i.test(gpu);
 // This chapter's software target is near 30fps, with room for polling jitter.
 // Other chapters retain the shared helper's existing default thresholds.
 // The final step is the existing 50% software resolution (480px wide).
 // The HUD remains native, and the user's preference is always the ceiling.
 const budget=createSoftwareFrameBudget({slowMs:38,recoverMs:26,scales:[.75,.625,.5,.375]}),completionTimes=[];let fence=null,renderStarted=-Infinity,measureFrame=false;
 const solidOcclusion=software?createSolidOcclusion({maxSolids:24}):null;
 const batchCulling=software?createCourseBatchCulling({occlusion:{
  update:camera=>solidOcclusion.update(camera),
  // Thin strips and poles can leave software-raster edge samples behind
  // cover. Cull substantial volumes only; keep details under 10cm thick on
  // the original GPU path, including painted routes and course flagpoles.
  hidden:bounds=>Math.min(bounds.max.x-bounds.min.x,bounds.max.y-bounds.min.y,bounds.max.z-bounds.min.z)>=.1&&solidOcclusion.hidden(bounds)
 }}):null;
 // Skinned meshes intentionally disable their stale bind-pose bounds. Cull
 // the complete actor only when this generous world-space envelope is outside
 // the camera. Current body/tool pose samples reach 1.53m from its center;
 // retain a 3m radius and revalidate it when the rig or weapon changes.
 const actorFrustum=software?new THREE.Frustum():null,actorProjection=new THREE.Matrix4(),actorEnvelope=new THREE.Sphere(new THREE.Vector3(),3);
 let actorCulled=false;
 function poll(measure=true){
  if(!fence)return false;
  const status=gl.clientWaitSync(fence,0,0);
  if(status===gl.TIMEOUT_EXPIRED)return true;
  gl.deleteSync(fence);fence=null;
  if(status===gl.WAIT_FAILED)throw Error('Underground rendering fence failed');
  if(measure&&measureFrame&&!document.hidden){const ms=performance.now()-renderStarted;budget.observe(ms);completionTimes.push(ms);if(completionTimes.length>120)completionTimes.shift();}
  return false;
 }
 async function whenPresented(){while(poll(false))await new Promise(resolve=>setTimeout(resolve,4));}
 const presentationDelay=()=>software?Math.max(0,1000/60-(performance.now()-renderStarted)):0;
 const scene=new THREE.Scene();scene.fog=new THREE.Fog('#050d0f',14,43);scene.background=new THREE.Color('#050d0f');const camera=new THREE.PerspectiveCamera(58,16/9,.06,200);
 const fillLights=createDrainFillLights(scene),{playerLight}=fillLights;let lightSources=[];
 onProgress('Preparing wet stone and root galleries…');await Promise.all(['rough-cut-architecture-surfaces-v1','rough-cut-course-ground-v4','rough-cut-needle-sprays-v1'].map(Art.source));
 if(Art.stats().errors.length)throw Error('Course texture could not load. Reload to retry.');
 let drawCalls=0,triangles=0;
 const surfaces=createUnderGreenSurfaces(),stone=surfaces.textures.brick,floor=surfaces.textures.floor,wood=Art.texture('rough-cut-architecture-surfaces-v1',[0,0,512,512],null,true),grass=Art.texture('rough-cut-course-ground-v4',[600,650,256,256],null,true);
 const materials={};for(const [name,color,map,basic]of [['stone',0x87998d,stone],['floor',0x697679,floor],['walkway',0xb19c68,floor],['ceiling',0x55615c,stone],['greenSignal',0x88efbb,null,true],['amberSignal',0xffca67,null,true],['redSignal',0xff7350,null,true],['offSignal',0x263938],['wood',0x85745b,wood],['grass',0x5a7153,grass],['iron',0x394c4a],['rust',0x976849],['steel',0xbdcec9],['brass',0xc39d54],['rubber',0x202d29],['red',0x943e2f],['sand',0x9b8d6b,floor],['lamp',0xffd393,null,true],['white',0xd5d9bb],['water',0x427f81],['foam',0x93c4ba,null,true]])materials[name]=basic?new THREE.MeshBasicMaterial({color,map}):new THREE.MeshLambertMaterial({color,map});
 for(const name of ['redSignal','amberSignal','greenSignal','offSignal'])materials[name].side=THREE.DoubleSide;
 const signalGlass=signalGlassTexture();for(const name of ['redSignal','amberSignal','greenSignal','offSignal'])materials[name].map=signalGlass;
 // Wet ground and mineral-stained masonry catch only nearby practical light.
 // Puddles are a material response, not extra obstacles or a water slowdown.
 for(const name of ['floor','walkway'])materials[name]=new THREE.MeshPhongMaterial({color:name==='floor'?0x9b9784:0xa49a7a,map:surfaces.textures.mud,specular:0x75988b,specularMap:surfaces.textures.wetness,shininess:58});
 materials.stone=new THREE.MeshPhongMaterial({color:0x87998d,map:stone,specular:0x506c62,specularMap:surfaces.textures.wetness,shininess:24});
 // Match Level 1's worked metal, corrosion and wood grain on actual fixtures.
 const courseSurfaces=createCourseSurfaces();
 const illustrated={stone:Art.texture('rough-cut-architecture-surfaces-v1',[1024,0,512,512],null,true),concrete:Art.texture('rough-cut-architecture-surfaces-v1',[0,512,512,512],null,true),metal:Art.texture('rough-cut-architecture-surfaces-v1',[512,0,512,512],null,true),earth:Art.texture('rough-cut-architecture-surfaces-v1',[1024,512,512,512],null,true)};
 for(const [name,type]of [['iron','iron'],['steel','iron'],['rust','rust'],['brass','brass'],['rubber','rubber'],['red','paint'],['wood','wood'],['white','paint']]){
  materials[name].map=courseSurfaces.texture(type);materials[name].color.lerp(new THREE.Color(0xc8c4b2),.35);
 }
 materials.stone.map=illustrated.stone;
 for(const name of ['floor','walkway']){materials[name].map=illustrated.earth;materials[name].color.setHex(0xb4a485);}
 for(const name of ['floor','walkway','stone']){materials[name].bumpMap=materials[name].map;materials[name].bumpScale=name==='stone'?.022:.012;}
 // Distinct construction materials share the same restrained pixel scale.
 materials.ceiling.map=illustrated.concrete;materials.sand.map=surfaces.textures.sand;
 for(const [key,color,surface]of [['rootStone',0x879082,'brick'],['bunkerStone',0xb6a083,'sand'],['pumpStone',0x75968d,'concrete'],['rangeStone',0x8d9ba3,'panel'],['keeperStone',0xacae97,'tile']]){
  materials[key]=materials.stone.clone();materials[key].color.setHex(color);materials[key].map=surfaces.textures[surface];materials[key].bumpMap=materials[key].map;
 }
 for(const [key,map]of [['rootStone',illustrated.stone],['bunkerStone',illustrated.stone],['pumpStone',illustrated.concrete],['rangeStone',illustrated.metal]]){materials[key].map=map;materials[key].bumpMap=map;}
 const crafted=await createCraftedDrainSurfaces();
 const machinerySurfaces=await prepareDrainMachinery(materials);
 for(const [name,kind]of [['stone','masonry'],['rootStone','masonry'],['bunkerStone','masonry'],['pumpStone','concrete'],['rangeStone','panel'],['keeperStone','tile'],['floor','floor'],['walkway','floor'],['ceiling','concrete'],['sand','sand']]){
  const set=crafted.sets[kind],wall=!['floor','walkway','ceiling','sand'].includes(name);
  materials[name]=new THREE.MeshPhongMaterial({color:0xe5e3ce,map:set.map,bumpMap:set.bump,bumpScale:wall?.025:.012,specularMap:set.wet,specular:0x75816b,shininess:wall?22:48});
  shadeDrainMaterial(materials[name],{wall});
 }
 const districtStone=(y,x=0)=>x>6&&y<42?(y<rangeY(6)?'keeperStone':'rangeStone'):x<-12?(y<51?'pumpStone':'bunkerStone'):'rootStone';
 const signArt=createDrainSignArt();
 const structureMeshes=[],signGroups=[],batches=new Map(),unit=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
 function put(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,parent=null){if(parent){
  // Dynamic handles and needles also need physical texel scale. Their source
  // unit geometry is shared, so author UVs on a private copy before scaling.
  let geometry=g;const span=materials[type].userData.drainUVMetres;
  if(span){geometry=g.clone();const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;if(uv)for(let i=0;i<p.count;i++){const xx=Math.abs(n.getX(i)),yy=Math.abs(n.getY(i)),zz=Math.abs(n.getZ(i));uv.setXY(i,(xx>yy&&xx>zz?p.getZ(i)*sz:p.getX(i)*sx)/span,(yy>xx&&yy>zz?p.getZ(i)*sz:p.getY(i)*sy)/span);}}
  const m=new THREE.Mesh(geometry,materials[type]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);parent.add(m);return m;}
  // Local batches keep lighting bounds near the actual corridor. A single
  // north/south strip used to span the gallery, pump and range simultaneously.
  const cell=Math.floor((x+6)/12)+':'+Math.floor(-z/24),key=type+':'+cell;if(!batches.has(key))batches.set(key,{type,parts:[]});const copy=g.clone();dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();copy.applyMatrix4(dummy.matrix);
  if(!g.userData.preserveDrainUV&&(materials[type].userData.drainWorldUV||['stone','floor','walkway','ceiling','wood','grass','sand','iron','steel','rust','brass','rubber','red','white'].includes(type)||type.endsWith('Stone'))){const span=materials[type].userData.drainUVMetres||2,p=copy.attributes.position,n=copy.attributes.normal,uv=copy.attributes.uv;if(uv)for(let i=0;i<p.count;i++){const xx=Math.abs(n.getX(i)),yy=Math.abs(n.getY(i)),zz=Math.abs(n.getZ(i));uv.setXY(i,(xx>yy&&xx>zz?p.getZ(i):p.getX(i))/span,(yy>xx&&yy>zz?p.getZ(i):p.getY(i))/span);}}
  batches.get(key).parts.push(copy);return null;
 }
 const box=(type,x,y,z,w,h,d,parent=null)=>put(unit,type,x,y,z,w,h,d,0,0,0,parent),cyl=new THREE.CylinderGeometry(1,1,1,8),ball=new THREE.IcosahedronGeometry(1,1),lamps=[];
 // Floors, outer walls and ceilings all derive from the collision footprint.
 // Every overhead detail stays above 2.2 m, including over side-route openings.
 const layout=floorLayout(),flood=createDrainFlood(scene,layout),haunting=createDrainHaunting(),ghost=createDrainShadow(scene,materials);await ghost.ready;if(ghost.stats().error)throw Error(ghost.stats().error);
 const contactShade=createDrainContactShade({scene,layout});
 const groundFinish=finishDrainGround({materials,crafted,layout,waters:WATERS});
 const services=createServiceSupports({layout,box,put,cyl,unit});
 for(const t of layout.tiles)box(Math.abs(t.x)>3?'walkway':'floor',t.x,-.14,-t.y,t.w,.28,t.d);
 buildServiceGrate(box);
 for(const t of roofPanels(layout.tiles))box('ceiling',t.x,4.25,-t.y,t.w,.2,t.d);
 for(const t of layout.walls){
  const h=t.covered?4.2:1.8,type=districtStone(t.y,t.x),pieces=keeperWallPieces(t,h);
  for(const p of pieces){
   box(type,p.x,p.base+p.height/2,-p.y,p.w,p.height,p.d);
   // The renderer's conservative occluders match the actual carved walls.
   // Keeping the old full box would incorrectly hide the recessed furniture.
   if(solidOcclusion)solidOcclusion.add(new THREE.Box3(new THREE.Vector3(p.x-p.w/2,p.base,-p.y-p.d/2),new THREE.Vector3(p.x+p.w/2,p.base+p.height,-p.y+p.d/2)).expandByScalar(-.005),new THREE.Matrix4());
   const trimHeight=type==='pumpStone'?2.85:1.05;
   if((type==='pumpStone'||type==='keeperStone')&&p.base<=trimHeight-.06&&p.base+p.height>=trimHeight+.06)box(type==='pumpStone'?'iron':'brass',p.x,trimHeight,-p.y,p.w+.015,.12,p.d+.015);
  }
  box('iron',t.x,h+.08,-t.y,t.w+.08,.16,t.d+.08);
 }
 for(const o of OBSTACLES)if(!['pump-control','record-stand','sluice-console','pump-machine','root-pillar'].includes(o.id))box(o.id.includes('machine')?'iron':'stone',o.x,1.25,-o.y,o.w,2.5,o.d);
 // A ground-level maintenance door replaces the unrigged ladder descent.
 const doorX=ARRIVAL.spawn.x,doorY=43.87;
 for(const x of [doorX-.95,doorX+.95])box('steel',x,1.45,-doorY,.16,2.9,.24);
 box('steel',doorX,2.9,-doorY,2.05,.16,.24);
 const hatch=new THREE.Group();hatch.position.set(doorX-.85,0,-doorY);scene.add(hatch);
 box('iron',.85,1.4,.03,1.7,2.8,.14,hatch);box('brass',1.45,1.2,.13,.06,.25,.06,hatch);
 lamps.push({x:doorX,y:doorY-.2,height:3.22,lensOffset:-.02});
 // The entrance fitting is higher than the ordinary lamps; its own short
 // ceiling stem joins the housing without touching the swinging door.
 box('iron',doorX,3.74,-doorY+.18,.045,.82,.045);box('steel',doorX,4.115,-doorY+.18,.25,.07,.23);
 // Each district has its own roofline. Frames sit at actual openings.
 for(const [x,y,width]of [[0,35,6],[-20,51,6],[12,rangeY(35),6]]){
  box('iron',x,4.15,-y,width+.3,.24,.4);
  for(const side of [-1,1])box(districtStone(y,x),x+side*(width/2+.08),2.05,-y,.18,4.1,.42);
 }
 const lamp=(x,y)=>{lamps.push({x,y});box('iron',x,2.8,-y,.3,.55,.32);for(const off of [-.11,.11])box('iron',x+off,2.8,-y+.23,.025,.4,.025);if(!(x===16.5&&Math.abs(y-rangeY(23.5))<.001))services.lamp(x,y);};
 for(let y=8;y<=72;y+=8){
  const arch=new THREE.TorusGeometry(3,.08,5,24,Math.PI);put(arch,'rust',0,2.95,-y,1,.35,1);arch.dispose();
  services.arch(y);
  if(y%16===8)lamp(y%32===8?-2.6:2.6,y);
  if(y<72){put(cyl,'rust',-2.65,3.25,-y-4,.12,8,.12,Math.PI/2);for(const d of [1,7]){put(cyl,'iron',-2.65,3.25,-y-d,.17,.09,.17,Math.PI/2);services.pipe(-2.65,y+d);}}
  for(let i=0;i<3;i++){const rx=Math.sin(y+i*4)*2.2;put(cyl,'wood',rx,4.05,-y-i,.045,.7,.045,.2,0,.3);}
 }
 for(const [x,y]of [[-10,75.6],[-22.6,70],[-22.6,54],[-25.65,41.25],[-13.3,46],[-10,41.7],[12,rangeY(39.7)],[16.5,rangeY(23.5)],[16.5,rangeY(2)]])lamp(x,y);
 // A wall-supported work lamp reveals the bank's exposed taproot and the
 // inspection grate. It joins the existing two-source light-selection pool.
 lamp(-30.9,63.7);
 // The open-air middle landing has no ceiling to suspend its lamp from.
 // Seat a mast in the existing north boundary and cantilever above clearance.
 const middleLampY=rangeY(23.5),middleMastY=rangeY(26)+.12;
 box('iron',16.5,1.65,-middleMastY,.12,3.3,.12);
 box('iron',16.5,3.2,-(middleMastY+middleLampY)/2,.12,.12,middleMastY-middleLampY);
 box('iron',16.5,3.1,-middleLampY,.08,.2,.08);
 // The pump pipe visibly connects the closed northern return to the eastern outlet.
 for(const [ax,ay,bx,by]of [[LEVER.x,LEVER.y,-20,LEVER.y],[-20,LEVER.y,-20,40],[-20,49,-20,40],[-20,40,6,40],[6,40,6,38]]){
  const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);if(len<.001)continue;put(cyl,'rust',(ax+bx)/2,3.65,-(ay+by)/2,.2,len,.2,dy?Math.PI/2:0,0,dx?Math.PI/2:0);
  for(const t of [.1,.5,.9])box('iron',ax+dx*t,3.97,-ay-dy*t,.06,.55,.06);
 }
 const pipeValves=PUMP_KNOCKS.map(source=>{
  const root=new THREE.Group();root.position.set(source.x,3.65,-source.y);scene.add(root);
  put(cyl,'iron',0,0,0,.31,.4,.31,0,0,Math.PI/2,root);
  const spindle=new THREE.Group();spindle.position.set(0,-.28,0);root.add(spindle);
  box('red',0,0,0,.65,.08,.08,spindle);box('brass',0,.12,0,.07,.25,.07,spindle);
  const status=box('amberSignal',0,-.05,.23,.18,.16,.035,root);
  return {source,root,spindle,status};
 });
 for(const path of DRY_ROUTES)for(let i=1;i<path.length;i++){
  const [ax,ay]=path[i-1],[bx,by]=path[i],x=(ax+bx)/2,z=-(ay+by)/2;
  // A dark painted border keeps the brass route visible on the sand-colored
  // walkway. Both layers are flush decoration, with no new collision edges.
  box('rubber',x,.001,z,Math.abs(bx-ax)||.24,.001,Math.abs(by-ay)||.24);
  box('brass',x,.0025,z,Math.abs(bx-ax)||.1,.001,Math.abs(by-ay)||.1);
 }
 // The bunker exposes layered sand; the range has tee dividers and net supports.
 for(const y of [57,67]){box('sand',-34,1.9,-y,3,.3,7);put(cyl,'white',-34,5.9,-y,.035,4,.035);box('red',-33.6,7.5,-y,.8,.45,.025);}
 for(let y=14;y<35;y+=5){box('wood',23.2,3.3,-rangeY(y),.18,6.6,.18);box('wood',23.2,6.5,-rangeY(y+2.5),.15,.12,5*RANGE_SCALE);box('grass',24,.02,-rangeY(y),1.6,.04,2.4*RANGE_SCALE);}
 for(const {x,y}of galleryBallPositions(FLOORS,OBSTACLES))put(ball,'white',x,.05,-y,.047,.047,.047);
 const waterObjects=[],drainWater=createDrainWater(scene,WATERS,camera,{software,renderHeight:()=>canvas.height}),wetGround=createDrainWetGround(scene,WATERS);
 for(const w of WATERS){
  const group=new THREE.Group();group.position.set(w.x,0,-w.y);group.rotation.y=w.axis==='x'?-Math.PI/2:0;scene.add(group);
  box('iron',0,-.035,0,w.width,.06,w.depth,group);
  // Painted bank stripes and inset grates stay flush with the walking plane.
  // Raised decorative strips previously passed through Joe's moving shoes.
  for(const end of [-1,1])for(let i=0;i<12;i++)box(i%2?'iron':'brass',-2.75+i*.5,.0015,end*(w.depth/2+.4),.5,.001,.3,group);
  for(const side of [-1,1])put(cyl,'rust',side*(w.width/2-.01),1.05,0,.12,w.depth,.12,Math.PI/2,0,0,group);
  for(const nozzle of channelNozzles(w)){
   put(cyl,'rust',nozzle.x+nozzle.side*.12,nozzle.height,-nozzle.y,.19,.22,.19,0,0,Math.PI/2,group);
   put(cyl,'rubber',nozzle.x,nozzle.height,-nozzle.y,.13,.025,.13,0,0,Math.PI/2,group);
  }
  // Visible collection grates outside the flowing bed, on both catch banks.
  for(const end of [-1,1]){
   const z=end*(w.depth/2-.1);box('iron',0,-.004,z,w.width,.01,.2,group);
   for(let x=-w.width/2+.12;x<w.width/2;x+=.25)box('steel',x,.0015,z,.045,.001,.18,group);
  }
  const signals=[];
  for(const end of [-1,1]){
   // A centered horizontal signal remains in the crossing sightline on a
   // portrait display. Mounts attach to a roof or the actual bank boundary,
   // with all overhead pieces above 2.2m and no post in a walking route.
   const {z,postX,ceiling,gateHousing,supportZ}=bankSignalMount(w,end),signal=new THREE.Group();signal.position.set(0,2.5,z);group.add(signal);
   box('iron',0,0,0,1.08,.34,.22,signal);
   finishSignalHousing({signal,box,put,cyl});
   if(gateHousing){
    box('iron',0,3.36,(z+supportZ)/2,.08,.12,Math.abs(z-supportZ)+.08,group);
    box('iron',0,3.045,z,.08,.75,.12,group);
   }
   else if(ceiling&&w.lesson&&end===1){
    // Carry the signal around the teaching plate. A central ceiling stem
    // otherwise cuts through both printed faces and hides the crossing rule.
    // Side seats touch only the enamel's outer border; the bottom rail joins
    // the signal housing while every piece stays above walking clearance.
    for(const x of [-1.04,1.04]){
     box('iron',x,3.41,z,.05,1.48,.06,group);
     box('iron',Math.sign(x)*.98,2.95,z,.17,.045,.045,group);
    }
    box('iron',0,2.685,z,2.13,.05,.06,group);
   }
   else if(ceiling)box('iron',0,3.36,z,.08,1.58,.12,group);
   else{
    box('iron',postX,1.4,z,.12,2.8,.12,group);
    box('iron',postX/2,2.75,z,Math.abs(postX),.12,.14,group);
    box('iron',0,2.67,z,.08,.16,.12,group);
   }
   const stop=new THREE.CircleGeometry(.135,8),warning=new THREE.CircleGeometry(.145,3);warning.rotateZ(Math.PI/2);
   const arrow=new THREE.Shape();arrow.moveTo(-.12,.03);arrow.lineTo(0,-.1);arrow.lineTo(.12,.03);arrow.lineTo(.065,.085);arrow.lineTo(0,.02);arrow.lineTo(-.065,.085);arrow.closePath();
   const shapes=[stop,warning,new THREE.ShapeGeometry(arrow)].map(prepareSignalLens);
   const lights=[1,-1].flatMap(facing=>shapes.map((geometry,i)=>{
    const light=new THREE.Mesh(geometry,materials[['redSignal','amberSignal','greenSignal'][i]]);light.position.set(-.32+i*.32,0,facing*.14);light.rotation.y=facing<0?Math.PI:0;light.userData.dynamic=true;signal.add(light);return light;
   }));signals.push(lights);
  }
  // Teach once at the first protected crossing. Later banks use the same
  // physical symbol stack instead of another large overhead instruction.
  if(w.lesson){
   const sign=makeSign('LOW FLOW: CROSS\nPRESSURE: WAIT',512,128,'#bdd0bb');sign.scale.setScalar(.6);sign.position.set(0,2.95,w.depth/2+1);group.add(sign);
  }
  // Bake static fixture pieces by material; preserve independent signal faces.
  group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),fixtureParts=new Map(),original=[];
  group.traverse(mesh=>{if(!mesh.isMesh||mesh.userData.dynamic)return;const material=mesh.material;if(!fixtureParts.has(material))fixtureParts.set(material,[]);fixtureParts.get(material).push(mesh.geometry.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld)));original.push(mesh);});
  for(const mesh of original)mesh.removeFromParent();
  for(const [material,parts]of fixtureParts){group.add(new THREE.Mesh(mergeIndexedGeometries(parts),material));parts.forEach(g=>g.dispose());}
  waterObjects.push({w,signals,group});
 }
 function makeSign(text,w=512,h=128,color='#e1d1a0'){const sign=signArt.make(text,w,h,color);signGroups.push(sign);return sign;}

 for(const [text,x,y,yaw=0,scale=.65]of [['DRY WALKWAY →',0,54,0,.75],['BUNKER / PUMP ←',0,73],['WEST WALK / RECORD',-20,71,Math.PI],['PUMP HOUSE',-20,52,Math.PI],['SERVICE PASSAGE / PUMP',-7,40,Math.PI/2],['RANGE / KEEPER →',1.2,38],['CLUBHOUSE IRRIGATION\nSECTOR 18 · MAINTENANCE ONLY',0,8,0,.7]]){const sign=makeSign(text);sign.scale.setScalar(scale);sign.position.set(x,3.05,-y);sign.rotation.y=yaw;scene.add(sign);services.sign(x,y,yaw,scale);}
 const pumpControl=createPumpControl({scene,box,put,cyl,materials,makeSign}),pump=pumpControl.root;
 const noteRoot=new THREE.Group();noteRoot.position.set(NOTE.x,0,-NOTE.y);noteRoot.rotation.y=Math.PI/2;scene.add(noteRoot);
 // Face the record toward the corridor, above its supported stand.
 box('white',0,NOTE.height,0,.48,.38,.025,noteRoot);box('brass',0,NOTE.height,-.02,.54,.44,.025,noteRoot);
 for(let i=0;i<4;i++)box('iron',0,NOTE.height+.09-i*.055,.015,i===0?.28:.34,.012,.004,noteRoot);
 box('brass',0,NOTE.height+.15,.025,.08,.05,.03,noteRoot);
 const nSign=makeSign('MAINTENANCE RECORDS',512,128);nSign.scale.setScalar(.42);nSign.position.set(NOTE.x,2.2,-57.30);scene.add(nSign);
 const keeperGate=createKeeperGate({scene,box,put,cyl}),gate=keeperGate.root;
 const keeperRelease=createKeeperRelease({scene,box,put,cyl,materials});
 const releaseSign=makeSign('SLUICE RELEASE',512,128);releaseSign.scale.setScalar(.5);releaseSign.position.set(SLUICE.x,2.9,-SLUICE.y);scene.add(releaseSign);services.sign(SLUICE.x,SLUICE.y,0,.5,2.9);
 const entryGate=new THREE.Group();scene.add(entryGate);for(let x=-4;x<=4;x+=.45)box('iron',x,1.5,-.5,.08,3,.12,entryGate);
 const districtDetails=buildUnderGreenDistricts({scene,materials,box,put,cyl,ball,makeSign,lamps,registerFixture:mesh=>structureMeshes.push(mesh)});
 districtDetails.groundFinish=groundFinish.stats;
 districtDetails.vaults=buildDrainVaults({materials,put,box});
 districtDetails.lampFinish=finishDrainLamps({lamps,box,put,cyl});
 const atmosphere=buildDampAtmosphere({scene,layout,materials,put,lamps,barkTexture:crafted.sets.bark.map,mudTexture:crafted.sets.mud.map,barkRelief:crafted.sets.bark.bump,barkWet:crafted.sets.bark.wet,mudRelief:crafted.sets.mud.bump,mudWet:crafted.sets.mud.wet,lowDetail:software,contactShade});contactShade.finish();
 const humidity=createDrainHumidity({scene,camera,lamps});
 districtDetails.enclosure=buildDistrictEnclosure({layout,materials,box,put});
 districtDetails.wallRepairs=buildDrainWallRepairs({box,put});
 // Software rasterization keeps the illustrated detail but avoids derivative
 // bump shading on the extensive masonry/root batches. It still receives
 // ordinary lighting, wet highlights and the same hazard presentation.
 if(software)for(const material of Object.values(materials))if(material.bumpMap){material.bumpMap=null;material.bumpScale=0;}
 const structureDetails=buildUnderGreenStructure({layout,box});
 structureDetails.courseOverhead=buildCourseOverhead({box,put,cyl,ball});
 onProgress('Preparing Joe and the grass scythe…');const joe=await createTrimmerJoe(scene,materials);
 const joeCastShadow=createJoeCastShadow({scene,joe,lamps});
 const strikeDebris=createStrikeDebris(scene);
 const staticLightMeshes=[];
 for(const batch of batches.values()){const geometry=mergeIndexedGeometries(batch.parts),mesh=new THREE.Mesh(geometry,materials[batch.type]);geometry.computeBoundingSphere();geometry.computeBoundingBox();batchCulling?.register(mesh,batch.parts);mesh.name=batch.type;scene.add(mesh);structureMeshes.push(mesh);staticLightMeshes.push(mesh);batch.parts.forEach(g=>g.dispose());}
 scene.traverse(mesh=>{if(mesh.isMesh&&mesh.userData.drainStaticLight)staticLightMeshes.push(mesh);});
 const practicalLighting=createDrainPracticalLighting({scene,renderer,lamps,staticMeshes:staticLightMeshes,additionalMaterials:Object.values(materials)});
 const tonalGrade=createDrainTonalGrade(scene,Object.values(materials));
 const fogMaterials=createDrainFogMaterials(scene,structureMeshes);
 unit.dispose();cyl.dispose();ball.dispose();let frames=0,prevTime=0;
 let resolutionScale=1;
 function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),cap=software?960:2560,scale=Math.min(1,cap/w)*Math.min(resolutionScale,software?budget.scale()/.75:1),rw=Math.max(1,Math.round(w*scale)),rh=Math.max(1,Math.round(h*scale));if(canvas.width!==rw||canvas.height!==rh)renderer.setSize(rw,rh,false);if(camera.aspect!==w/h){camera.aspect=w/h;camera.updateProjectionMatrix();}}
 function draw(r,prefs,manual=false){
  const busy=poll(!manual&&r.mode==='playing');
  if(software&&!manual&&(busy||presentationDelay()>0))return false;
  // Deterministic QA can explicitly request a new image. Ordinary gameplay
  // never replaces an in-flight frame or advances simulation from a GPU wake.
  if(fence){gl.deleteSync(fence);fence=null;}
  resolutionScale=Number.isFinite(prefs.resolution)?Math.min(1,Math.max(.5,prefs.resolution)):1;resize();const p=r.player,yaw=p.yaw+(p.rearAngle||0),bob=panicCameraMotion(p,r.joe,prefs.cameraBob,prefs.reduced);if(camera.fov!==prefs.fov){camera.fov=prefs.fov;camera.updateProjectionMatrix();}camera.position.set(p.x,(p.eyeHeight??1.65)+bob.height,-p.y);camera.rotation.set(p.pitch+bob.pitch,-yaw,bob.roll,'YXZ');
  batchCulling?.update(camera);flood.update(r,prefs.reduced);const apparition=haunting.sample(r,prefs.reduced);ghost.show(apparition?{x:apparition.x,y:0,z:-apparition.y,yaw:apparition.yaw}:null,apparition?.alpha||0,apparition?.motion);
  practicalLighting.update(camera,r.time,prefs.reduced);lightSources=practicalLighting.stats().lights;atmosphere.update(r.time,prefs.reduced);playerLight.position.copy(camera.position);joe.update(r,prefs.reduced);joeCastShadow.update(r,prefs.reduced);const waterStates=WATERS.map(w=>waterState(w,r.time,r.bypass,r.bypassAt));drainWater.update(r,waterStates,prefs.reduced,joe.stats());wetGround.update(r,waterStates,prefs.reduced);humidity.update(r,prefs.reduced);strikeDebris.update(r,prefs.reduced);
  for(const v of waterObjects){const state=waterState(v.w,r.time,r.bypass,r.bypassAt),active=state.danger?0:state.phase==='warning'?1:2;for(const lights of v.signals)lights.forEach((light,i)=>light.material=materials[i%3===active?['redSignal','amberSignal','greenSignal'][i%3]:'offSignal']);}
  for(const valve of pipeValves){const age=r.time-r.bypassAt-valve.source.age,progress=r.bypass?Math.min(1,Math.max(0,(age+.35)/.35)):0;valve.spindle.rotation.y=progress*Math.PI/2;valve.status.material=materials[progress>=1?(valve.source.id==='return'?'redSignal':'greenSignal'):'amberSignal'];}
  hatch.rotation.y=r.joe.phase==='absent'?0:r.joe.phase==='enter'?Math.min(1,r.joe.age/ARRIVAL.doorSeconds)*-1.6:-1.6;pumpControl.update(r);noteRoot.visible=!r.evidence;keeperGate.update(r.gate);keeperRelease.update(r);
  renderStarted=performance.now();renderer.autoClear=false;renderer.clear();
  drawCalls=0;triangles=0;
  renderer.clearDepth();
  const actorVisible=joe.root.visible;actorCulled=false;
  if(actorFrustum&&actorVisible){
   camera.updateMatrixWorld();actorFrustum.setFromProjectionMatrix(actorProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
   actorEnvelope.center.copy(joe.root.position).y+=1.2;
   actorCulled=!actorFrustum.intersectsSphere(actorEnvelope);joe.root.visible=!actorCulled;
  }
  // Render visibility must not suppress footsteps, animation, or geometry QA.
  fogMaterials.apply(camera);
  try{renderer.render(scene,camera);}finally{fogMaterials.restore();joe.root.visible=actorVisible;}
  renderer.autoClear=true;
  drawCalls+=renderer.info.render.calls;triangles+=renderer.info.render.triangles;prevTime=r.time;frames++;
  if(software){measureFrame=!manual&&r.mode==='playing';fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();}
  return true;
 }
 resize();onProgress('Warming the underground course…');await renderer.compileAsync(scene,camera);
 function inspectClearance(points){batchCulling?.restore();scene.updateMatrixWorld(true);const ray=new THREE.Raycaster(),hits=[],dirs=[new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)];ray.far=.17;const sides=structureMeshes.map(m=>m.material.side);for(const m of structureMeshes)m.material.side=THREE.DoubleSide;
  for(const p of points)for(const height of [1.12,1.65])for(const dir of dirs){ray.set(new THREE.Vector3(p.x,height,-p.y),dir);const contact=ray.intersectObjects(structureMeshes,false)[0];if(contact)hits.push({x:p.x,y:p.y,height,distance:contact.distance});}
  structureMeshes.forEach((m,i)=>m.material.side=sides[i]);return hits;
 }
 function inspectCameraClearance(poses){
  batchCulling?.restore();
  scene.updateMatrixWorld(true);
  const meshes=[...structureMeshes];
  for(const [name,group]of [['release',keeperRelease.root],['pump',pump],['gate',gate],['arrival',hatch],['record',noteRoot],['entry',entryGate],['joe',joe.root],...signGroups.map(group=>['sign',group]),...pipeValves.map(v=>['valve',v.root]),...waterObjects.map(v=>[v.w.id,v.group])])group.traverse(o=>{if(o.isMesh){if(!o.name)o.name=name;meshes.push(o);}});
  const inspect=createCameraClearanceAudit(meshes),probe=camera.clone();
  return poses.map(p=>{probe.position.set(p.x,p.height,-p.y);probe.rotation.set(p.pitch||0,-(p.yaw||0),0,'YXZ');probe.fov=p.fov??camera.fov;probe.aspect=p.aspect??camera.aspect;probe.updateProjectionMatrix();return {pose:p,hits:inspect(probe)};});
 }
 function inspectJoeGeometry(){batchCulling?.restore();const meshes=[...structureMeshes];for(const group of [keeperRelease.root,pump,gate,hatch,noteRoot,entryGate,...signGroups,...pipeValves.map(v=>v.root),...waterObjects.map(v=>v.group)])group.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});const points=joe.inspectMeshPoints().filter(p=>p.height>.035);return {points:points.length,hits:inspectGeometrySpheres(meshes,points)};}
 function inspectGateTravel(){
  batchCulling?.restore();scene.updateMatrixWorld(true);const points=[];
  // Inspect the moving panel inside its guides; edge insertion into the
  // existing side walls is intentional. Roof and header contacts are not.
  for(let x=-4.8;x<5;x+=.35)if(Math.abs(x)<4.8)for(let height=.08;height<2.99;height+=.08)for(const side of [-1,1])points.push({x:GATE.x+x,y:GATE.y+side*.06,height:gate.position.y+height,radius:.012});
  for(const height of [.2,1.5,2.8])for(let x=-4.7;x<4.8;x+=.25)for(const side of [-1,1])points.push({x:GATE.x+x,y:GATE.y+side*.07,height:gate.position.y+height,radius:.012});
  const meshes=[...structureMeshes];for(const v of waterObjects)v.group.traverse(o=>{if(o.isMesh)meshes.push(o);});
  const boxes=[],lift=gate.position.y;
  for(let x=-4.8;x<5;x+=.35)if(Math.abs(x)<4.8)boxes.push({id:'bar-'+x,box:new THREE.Box3(new THREE.Vector3(GATE.x+x-.05,Math.max(.003,lift),-GATE.y-.06),new THREE.Vector3(GATE.x+x+.05,lift+3,-GATE.y+.06))});
  for(const height of [.2,1.5,2.8])boxes.push({id:'crossbar-'+height,box:new THREE.Box3(new THREE.Vector3(GATE.x-4.75,lift+height-.05,-GATE.y-.07),new THREE.Vector3(GATE.x+4.75,lift+height+.05,-GATE.y+.07))});
  return {samples:points.length,hits:inspectGeometrySpheres(meshes,points),boxes:boxes.length,boxHits:inspectGeometryBoxes(meshes,boxes),...keeperGate.stats()};
 }
 function inspectView(points){batchCulling?.restore();scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const meshes=[...structureMeshes];pump.traverse(o=>{if(o.isMesh)meshes.push(o);});const ray=new THREE.Raycaster();return points.map(p=>{const target=new THREE.Vector3(p.x,p.height??1.2,-p.y),direction=target.clone().sub(camera.position),distance=direction.length(),screen=target.clone().project(camera);ray.set(camera.position,direction.normalize());ray.far=Math.max(0,distance-.1);const hit=ray.intersectObjects(meshes,false)[0];return {id:p.id,clear:!hit,obstructionDistance:hit?.distance,distance,inView:Math.abs(screen.x)<=1&&Math.abs(screen.y)<=1&&screen.z>=-1&&screen.z<=1,screen:{x:screen.x,y:screen.y}};});}
 function inspectOverhead(points){
  batchCulling?.restore();scene.updateMatrixWorld(true);const ray=new THREE.Raycaster(),up=new THREE.Vector3(0,1,0);
  return points.map(p=>{ray.set(new THREE.Vector3(p.x,p.height??1.65,-p.y),up);ray.far=9;const hit=ray.intersectObjects(structureMeshes,false)[0];return {point:p,hit:hit?{height:hit.point.y,name:hit.object.name,opaque:!hit.object.material.transparent&&hit.object.material.opacity===1}:null};});
 }
 return {draw,inspectCastShadow:()=>joeCastShadow.inspect(),drainJoeFootsteps:()=>joe.drainFootsteps(),inspectGateTravel,resize,poll,whenPresented,presentationDelay,inspectClearance,inspectCameraClearance,inspectJoeGeometry,inspectJoeFooting:()=>{const points=joe.inspectMeshPoints().filter(p=>p.kind==='body');return {minHeight:Math.min(...points.map(p=>p.height)),belowFloor:points.filter(p=>p.height<-.002).length};},inspectView,inspectOverhead,stats:()=>({camera:{fov:camera.fov,height:camera.position.y,pitch:camera.rotation.x,roll:camera.rotation.z,far:camera.far},actorCulled,frames,gpu,software,captureBuffer,resolutionScale,budget:budget.stats(),pendingFrame:!!fence,completionSamples:completionTimes.length,completionAverage:completionTimes.length?completionTimes.reduce((a,b)=>a+b,0)/completionTimes.length:0,completionP95:[...completionTimes].sort((a,b)=>a-b)[Math.floor(completionTimes.length*.95)]||0,draws:drawCalls,triangles,backdrop:{kind:'opaque-underground',outdoorTrees:false},flood:flood.stats(),ghost:{...ghost.stats(),...haunting.stats()},textures:renderer.info.memory.textures,programs:renderer.info.programs.length,resolution:[canvas.width,canvas.height],lights:lightSources,practicalLighting:practicalLighting.stats(),fillLighting:fillLights.stats(),tonalGrade:tonalGrade.stats(),fogMaterials:fogMaterials.stats(),signArt:signArt.stats(),contactShade:contactShade.stats(),humidity:humidity.stats(),atmosphere:atmosphere.stats,craftedSurfaces:crafted.stats(),machinerySurfaces:machinerySurfaces.stats(),water:drainWater.stats(),strikeDebris:strikeDebris.stats(),joeCastShadow:joeCastShadow.stats(),wetGround:wetGround.stats(),districtDetails,structureDetails,serviceSupports:services.stats(),pump:{...pumpControl.stats(),valves:pipeValves.map(v=>({id:v.source.id,angle:v.spindle.rotation.y}))},release:keeperRelease.stats(),actor:joe.stats(),layout:{tiles:layout.tiles.length,walls:layout.walls.length,minOverhead:2.2}}),dispose(){if(fence){gl.deleteSync(fence);fence=null;}fogMaterials.dispose();tonalGrade.dispose();practicalLighting.dispose();signArt.dispose();contactShade.dispose();humidity.dispose();atmosphere.dispose();signalGlass.dispose();groundFinish.dispose();wetGround.dispose();crafted.dispose();machinerySurfaces.dispose();districtDetails.dispose();pumpControl.dispose();keeperRelease.dispose();surfaces.dispose();courseSurfaces.dispose();ghost.dispose();flood.dispose();joe.dispose();drainWater.dispose();strikeDebris.dispose();joeCastShadow.dispose();scene.traverse(o=>o.geometry?.dispose());renderer.dispose();}};
}
