import {createSolidOcclusion} from './solid-occlusion.js';
import {createRigidInstanceCulling} from './rigid-instance-culling.js';
import {createRigidVertexBatches} from './rigid-vertex-batches.js';
import {createBackNineWind} from './back-nine-wind.js';
import {createScreenFinish,LOOKS} from './screen-finish.js';
import {createBackNineCartMotion} from './back-nine-cart-motion.js';
import {createBackNineTyreMarks} from './back-nine-tyre-marks.js';
import {buildTreeIvy,composeEncounterTrees} from './back-nine-tree-finish.js';
import {createBreakFragments} from './back-nine-break-fragments.js';
import {createGreenFlags} from './back-nine-green-flags.js';
import {createSceneryContacts} from './back-nine-scenery-contact.js';
import {createGarageMotion,garageOpening} from './back-nine-garage-motion.js';
import {createBackNinePracticalLights,practicalLightAnchors} from './back-nine-practical-lights.js';
import {finishWindbreakSurface} from './back-nine-windbreak-growth.js';
import {createBackNineLocalMist} from './back-nine-local-mist.js';
import {createBackNineRiderMotion} from './back-nine-rider-motion.js';
import {createRouteMargins} from './back-nine-route-margins.js';
import {createTurfConditionField,finishTurfCondition,TURF_CONDITION_AREAS} from './back-nine-turf-condition.js';
import {createIrrigationArt} from './back-nine-irrigation-art.js';
import {createBackNineNightFx} from './back-nine-night-fx.js';
import {finishWetSheen} from './back-nine-weather.js';
import {buildBackNineDistrictScenery} from './back-nine-district-scenery.js';
import {buildBackNineArchitecture} from './back-nine-architecture.js';
import {buildBunkerBanks} from './back-nine-bunker-banks.js';
import {buildBedCraft} from './back-nine-bed-craft.js';
import {BORDER_SHRUBS,borderShrubPlants,windbreakPlants,windbreakCoreGeometry} from './back-nine-shrub-craft.js';
import {finishBackNineSurface} from './back-nine-surface-finish.js';
import {createExperienceArt} from './chase-experience-art.js';
import {experienceMotor} from './chase-experience.js';
import {addChaseVehicleCraft} from './chase-feature-craft.js';
import {buildCourseDetail} from './chase-course-detail.js';
import {createMowerClippings} from './chase-mower-clippings.js';
import {createMowerMouthCraft} from './back-nine-mower-mouth.js';
import {finishMowerMaterials,loadMowerSurfaceMaps} from './back-nine-mower-finish.js';
import {finishBackNineBeacon} from './back-nine-beacon-finish.js';
import {createBackNineHeadlights,finishHeadlightGround} from './back-nine-headlights.js';
import {terrainHeight,terrainSlope,contourGround,TERRAIN_FORMS} from './course-terrain.js';
import {irrigationPhase} from './chase-irrigation.js';
import {createCourseGhosts} from './chase-ghosts.js';
import {buildShiftRecords,createStaffSighting} from './chase-staff-art.js';
import {createChaseRiderCulling} from './chase-rider-culling.js';
import {createCourseHurdles} from './course-hurdles.js';
import {createChaseBeaconShadows,skipUnlitBeaconLookups} from './chase-beacon-shadows.js';
import {buildCourseLandmarks,COURSE_LANDMARKS} from './course-landmarks.js';
import {buildRouteClues} from './chase-route-art.js';
import {lampFlicker,createNightShadows} from './chase-night.js';
import {createBackNineContactShadows} from './back-nine-contact-shadows.js';
import {shelterCameraCeiling,trackCartCamera} from './chase-camera.js';
import {roundedCourseRoute,courseRibbonAsync,coursePatch,buildEstateGroundAsync,buildBunkerRouteEdges,COURSE_RESERVOIRS} from './back-nine-landscape.js';
import {createCourseSkyCoverage} from './course-sky-coverage.js';
import {createChaseAtmosphere} from './chase-atmosphere.js';
import {panelLoft,vehicleTireGeometry,addWheelCraft,addVehicleCraft,addDeckCraft} from './vehicle-craft.js';
import {specializeQuadraticLights} from './quadratic-light-material.js';
import {createBackNineMowerScars,loadMowerScarSoil,finishMowerScarSoil} from './back-nine-mower-scars.js';
import {runnerCameraFraction} from './runner-camera.js';
import {buildCourseFeatures} from './course-features.js';
import {mowerBeacon} from './mower-beacon.js';
import {cartImpactPose} from './cart-impact.js';
import {addVehicleDetail,addDeckDetail,buildCartWear} from './vehicle-detail.js';
import {createPursuitFeedback} from './pursuit-feedback.js';
import {runoverPose,runoverCameraSide} from './runover-presentation.js';
import {createDestructionArt} from './chase-destruction-art.js';
import {mowerMouthTarget} from './chase-destruction.js';
import {createCartDamage} from './cart-damage.js';
import {chaseActor} from './chase-player.js';
import {createChaseRunner} from './chase-runner.js';
import {loadRunnerCloth,loadRunnerFace,loadRunnerHair,loadRunnerGear} from './runner-materials.js';
import {waitForGPU} from './render-preparation.js';
import {createLocalLightCulling} from './local-light-culling.js';
import {commitmentPose} from './chase-commitments.js';
import {instanceVehicleParts} from './repeated-vehicle-parts.js';
import {skinInfluenceMask,specializeSkinning} from './skin-influences.js';
import {createCourseBatchCulling} from './course-batch-culling.js';
import {prepareRasterVisibility} from './raster-visibility.js';
import {buildCourseStoryArt} from './back-nine-story-art.js';
import {ramWindup} from './ram-windup.js';
import {cartRumble} from './cart-rumble.js';
import {panicPose} from './chase-panic.js';
import {createCourseConstructionYield,prepareCourseBuffers,prepareCourseTextures} from './course-render-preparation.js';
import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import * as Art from './pixel-art.js';
import {createParallax} from './parallax-scene.js';
import {loadBakedCourseSurfaces} from './baked-course-surfaces.js';
import {loadBakedContours,releaseBakedContours} from './baked-contours.js';
import {createCoursePines,loadCoursePineGeometry} from './course-pines.js';
import {COURSE,noise,clamp,distance,angleDelta,surfaceAt,lineClear} from './back-nine-course.js';

export async function createChaseScene(renderer,software,onProgress=()=>{}){
 const context=renderer.getContext(),rendererInfo=context.getExtension('WEBGL_debug_renderer_info');
 // WARP processes these vertices faster than the CPU can project them again.
 // Retain every original triangle and ordinary bounds/occluder culling there;
 // SwiftShader keeps the measured sample-coverage acceleration. Unknown
 // software drivers retain the existing path. No material or quality changes.
 const sampleCoverage=software&&!/microsoft basic render/i.test(rendererInfo?context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL):'');
 if(sampleCoverage)await prepareRasterVisibility();
 const yieldCpuPreparation=createCourseConstructionYield();
 const skyCoverage=software?createCourseSkyCoverage():null,skySize=new THREE.Vector2(),skyScissor=new THREE.Vector4();let skySkippedRows=0;
 const environmentWind=createBackNineWind();
 const solidOcclusion=software?createSolidOcclusion({maxSolids:3}):null;
 const rasterSize=new THREE.Vector2(),rasterGround=new Set(['grass','rough','road','pathEdge','track','trackMargin','sand','sandMargin','wet','turfMargin','soilMargin']);
 const batchCulling=createCourseBatchCulling({occlusion:solidOcclusion,sampleCoverage,retainOffscreen:true}),localLights=software?createLocalLightCulling({prepareFull:true,includeSpots:true}):null;
 let preparation={};
 const scene=new THREE.Scene();scene.background=null;scene.fog=new THREE.Fog(0x03080e,software?42:58,software?92:120);
 const beaconShadows=createChaseBeaconShadows(scene);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.BasicShadowMap;
 const dryFog=new THREE.Color(0x03080e),valleyFog=new THREE.Color(0x08131a);
 const camera=new THREE.PerspectiveCamera(64,16/9,.1,software?110:145),materials={},batches=new Map(),roadLights=[],pinePlacements=[];
 // Fetch/decode independent assets while the course is built; GPU uploads
 // still use the bounded preparation queue below.
 const loader=new GLTFLoader();let decodeQueue=Promise.resolve();loader.register(parser=>{const load=parser.loadTextureImage.bind(parser);parser.loadTextureImage=(...args)=>{const next=decodeQueue.then(async()=>{await new Promise(r=>setTimeout(r,8));return load(...args);});decodeQueue=next;return next;};return {name:'RIDER_cooperative_decode'};});

 const pineAsset=loadCoursePineGeometry();pineAsset.catch(()=>{});
 const runnerClothAsset=loadRunnerCloth();runnerClothAsset.catch(()=>{});
 const runnerFaceAsset=loadRunnerFace();runnerFaceAsset.catch(()=>{});
 const runnerHairAsset=loadRunnerHair();runnerHairAsset.catch(()=>{});
 const runnerGearAsset=loadRunnerGear();runnerGearAsset.catch(()=>{});
 const mowerSurfaceAssets=loadMowerSurfaceMaps();mowerSurfaceAssets.catch(()=>{});
 const scarSoilAsset=loadMowerScarSoil();scarSoilAsset.catch(()=>{});
 Art.source('rough-cut-needle-sprays-v1');Art.source('rough-cut-verge-atlas-v1');
 const riderAsset=loader.loadAsync('./assets/models/joe-riding-pixel.glb');riderAsset.catch(()=>{});
 // The course ghosts are created after the scene is built; warm their model
 // in the HTTP cache now so that late request does not wait on the network.
 fetch('./assets/models/ghost-joe.glb?v=20261107-motion').then(response=>response.ok?response.arrayBuffer():null).catch(()=>{});
 const surfaceAssets=loadBakedCourseSurfaces();surfaceAssets.catch(()=>{});
 // Exact ground tessellation for the authored layout; must be in place before
 // the first contoured patch. A missing or stale bake builds it live.
 const contourAsset=loadBakedContours();
 const backdrop=createParallax({travelScale:.08,showEstate:false,storm:.97,night:.92,stormCanopy:true,estateHorizon:true});
 const glassMap=Art.texture('back-nine-glass-v1',null,null,true);
 const groundMap=Art.texture('back-nine-short-turf-v2',null,null,true);
 const dryTurfMap=Art.texture('back-nine-weathered-turf-v1',null,null,true);
 const stoneMap=Art.texture('rough-cut-architecture-surfaces-v1',[1024,0,512,512],null,true);
 const woodMap=Art.texture('rough-cut-architecture-surfaces-v1',[0,0,512,512],null,true);
 const leafMap=Art.texture('rough-cut-hedge-hide-v2',[280,275,190,190],null,true);
 const slateMap=Art.texture('rough-cut-architecture-surfaces-v1',[512,512,512,512],null,true);
 await Promise.all(['back-nine-weathered-turf-v1','back-nine-storm-density-v1','back-nine-glass-v1','back-nine-short-turf-v2','rough-cut-architecture-surfaces-v1','rough-cut-night-sky-v2','rough-cut-moon-v1','rough-cut-far-ridge-v1','rough-cut-distant-treeline-v1','rough-cut-hedge-hide-v2'].map(Art.source));
 const surfaces=await surfaceAssets;
 await contourAsset;
 const scarSoilMap=await scarSoilAsset;
 const turfConditionField=createTurfConditionField();
 const maintenanceCanvas=await runnerClothAsset;
 const wetMasks={value:COURSE.wet.map(()=>new THREE.Vector3())};
 function mat(name,color,map=null,unlit=false){const m=unlit?new THREE.MeshBasicMaterial({color,map}):new THREE.MeshLambertMaterial({color,map});if(!unlit)finishBackNineSurface(m,name,wetMasks);materials[name]=m;return m;}
 mat('fairway',0x687e5b,groundMap);mat('fairwayCut',0x718563,groundMap);mat('green',0x819279,groundMap);mat('grass',0x455b43,groundMap);mat('track',0x807c64,surfaces.texture('stone'));mat('rough',0x475c43,groundMap);mat('road',0x68746e,surfaces.texture('stone'));mat('pathEdge',0x53654b,groundMap);mat('stone',0xb2bdb7,surfaces.texture('stone'));mat('masonry',0xb2bdb7,stoneMap);mat('wood',0xaaa58c,surfaces.texture('wood'));mat('weatherboard',0xa8b1ae,woodMap);mat('roof',0xb6c5cb,slateMap);mat('leaf',0x9bb5a4,leafMap);mat('sand',0xb7ae93,surfaces.texture('sand'));mat('wet',0x405d58,groundMap);
 const windbreakArt=finishWindbreakSurface(mat('windbreakLeaf',0xc1cebd,leafMap));
 // Keep ground shoulders legible under the same moonlit turf fill.
 materials.wet.emissive.setRGB(.003,.006,.005);materials.rough.emissive.setRGB(.006,.008,.004);materials.pathEdge.emissive.setRGB(.009,.011,.006);
 mat('stucco',0xb2b9ac,surfaces.texture('plaster'));mat('paint',0xc0c8ca,surfaces.texture('cart-enamel'));mat('mower',0x8caa91,surfaces.texture('paint'));mat('rust',0xbca285,surfaces.texture('rust'));mat('iron',0xa1a59b,surfaces.texture('iron'));mat('rubber',0x728476,surfaces.texture('rubber'));mat('seat',0x758475,surfaces.texture('rubber'));mat('brass',0xbca66b,surfaces.texture('brass'));mat('lamp',0xe4c88e,null,true);mat('red',0x963f2f,null,true);mat('sheen',0x506e66,null,true);mat('tireSpray',0xb5d2c9);mat('glass',0xb5c9c3,glassMap);mat('glassPale',0xd0dfd8,glassMap);mat('cloth',0x405259);mat('skin',0xb7a489);mat('hair',0x201d18);mat('flag',0x977f57);mat('pathLamp',0xe4c88e,null,true);mat('windowLamp',0xe4c88e,null,true);mat('mowerLamp',0xf2bd72,null,true);materials.tireSpray.emissive.setHex(0x0b181b);
 mat('faultLamp0',0xc6b379,null,true);mat('faultLamp1',0xb1c5bd,null,true);
 mat('clockFace',0x718171,null,true);
 // Reuse the already-loaded illustrated work-cloth map for woven supply sacks.
 mat('workCanvas',0xc6b695,maintenanceCanvas);
 const unitBox=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
 // Turf shares one material batch; baked vertex tints preserve different cuts
 // without a separate draw submission for every fairway/green in view.
 const turfColors=Object.fromEntries(['grass','fairway','fairwayCut','green'].map(k=>[k,materials[k].color.clone()]));
 materials.grass.color.setHex(0xffffff);materials.grass.vertexColors=true;
 mat('siren',0xff2918,null,true);mat('mown',0xffffff,groundMap);materials.mown.vertexColors=true;materials.mown.transparent=true;materials.mown.depthWrite=false;
 // Match the turf's low moonlit floor so fresh cuts do not become black
 // trenches. Reuse the Lambert emissive uniform, with no shader/map variant.
 materials.mown.emissive.setRGB(.004,.006,.0035);
 finishMowerScarSoil(materials.mown,scarSoilMap);
 finishTurfCondition(materials.mown,dryTurfMap,scarSoilMap,turfConditionField);
 finishTurfCondition(materials.grass,dryTurfMap,scarSoilMap,turfConditionField);
 const tracks=createBackNineMowerScars(scene,materials.mown);
 const routeMargins=createRouteMargins(COURSE);
 for(const [name,map]of [['turfMargin',groundMap],['soilMargin',scarSoilMap]]){
  const m=mat(name,0xffffff,map);m.vertexColors=true;m.transparent=true;m.depthWrite=false;
  finishBackNineSurface(m,'grass',wetMasks);
  if(name==='turfMargin')finishTurfCondition(m,dryTurfMap,scarSoilMap,turfConditionField);
 }

 const trackMargin=mat('trackMargin',0x807c64,surfaces.texture('stone'));trackMargin.vertexColors=true;trackMargin.transparent=true;trackMargin.depthWrite=false;
 const alarmMeters=[];
 function put(g,type,x,y,z,sx=1,sy=1,sz=1,ry=0,parent=null){
  if(parent){const m=new THREE.Mesh(g,materials[type]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=ry;parent.add(m);return m;}
  // Larger material batches reduce software-driver submissions; per-piece
  // index culling still removes offscreen geometry. Keep lamp circuit cells.
  const ground=['grass','fairway','fairwayCut','green','rough','road','pathEdge','track','trackMargin','sand','sandMargin','wet','turfMargin','soilMargin'].includes(type);
  const batchType=turfColors[type]?'grass':type,key=batchType+':'+Math.floor(-z/(type==='pathLamp'?48:type==='plantCourse'?32:192));if(!batches.has(key))batches.set(key,{material:materials[batchType],geometries:[]});
  dummy.position.set(x,y+(ground?0:terrainHeight(x,-z)),z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,ry,0);dummy.updateMatrix();let copy=g.clone();copy.applyMatrix4(dummy.matrix);if(ground){const flat=copy;copy=contourGround(THREE,flat,{retainFlatTriangles:!!g.userData.bunkerSurface});flat.dispose();}if(!type.startsWith('plant'))projectUV(copy,type);
  if(turfColors[type]&&!copy.attributes.color){const c=turfColors[type],colors=new Float32Array(copy.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=c.r**.65;colors[i+1]=c.g**.65;colors[i+2]=c.b**.65;}copy.setAttribute('color',new THREE.BufferAttribute(colors,3));}
  if(!ground)beaconShadows.collect(copy,materials[type]);batches.get(key).geometries.push(copy);
 }
 function projectUV(g,type){if(type==='workCanvas')return;const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,scale={glass:4.5,glassPale:4.5,grass:4.4,fairway:4.4,fairwayCut:4.4,green:2.2,rough:4.8,wet:4.4,mown:4.4,road:.7,pathEdge:4.4,turfMargin:4.4,soilMargin:4,masonry:1.7,weatherboard:1.05,roof:1.2,leaf:.7}[type]||.7;if(!u)return;for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));u.setXY(i,(x>y&&x>z?p.getZ(i):p.getX(i))/scale,(y>x&&y>z?p.getZ(i):p.getY(i))/scale);}}
 const box=(type,x,y,z,w,h,d,ry=0,parent=null)=>put(unitBox,type,x,y,z,w,h,d,ry,parent);
 const cylinder=new THREE.CylinderGeometry(1,1,1,12),sphere=new THREE.IcosahedronGeometry(1,1);
 function roofShape(w,d,h){const shape=new THREE.Shape();const r=.18;shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.lineTo(w/2,-d/2+r);shape.lineTo(w/2,d/2-r);shape.lineTo(w/2-r,d/2);shape.lineTo(-w/2+r,d/2);shape.lineTo(-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:1,steps:1});g.rotateX(-Math.PI/2);return g;}
 onProgress('Laying out the back nine…');
 for(let z=0;z<COURSE.length;z+=24){
  const tile=new THREE.PlaneGeometry(84,24,42,12);tile.rotateX(-Math.PI/2);put(tile,'grass',0,-.005,-z-12);tile.dispose();for(const side of [-1,1]){
   box('rough',side*55,-.06,-z-12,28,.35,24);
   for(const dz of [0,12]){const y=z+dz+Math.sin(z*.19+side)*2.5,x=side*(46+Math.sin(y*.04)*3+noise(z+dz)*6),h=6+noise(z+dz+9)*6;
    pinePlacements.push({x,z:-y,h,w:.85+noise(y+side)*.35,variant:Math.floor(noise(y+side*19)*4),turn:noise(y+side*31)*6.28});
    box('wood',side*40.8,.8,-y,.16,1.6,.16);box('wood',side*40.8,.8,-y-6,.07,.09,12);box('wood',side*40.8,1.3,-y-6,.07,.09,12);
   }
  }
  await yieldCpuPreparation();
 }
 const circle=new THREE.CircleGeometry(1,28);circle.rotateX(-Math.PI/2);

 const lanterns=[];function lantern(x,z){if(lanterns.some(p=>Math.hypot(p.x-x,p.z-z)<4))return;lanterns.push({x,z});put(cylinder,'iron',x,.08,z,.16,.16,.16);box('pathLamp',x,.35,z,.18,.34,.18);for(const a of [-1,1])for(const b of [-1,1])box('iron',x+a*.12,.35,z+b*.12,.025,.4,.025);put(cylinder,'brass',x,.59,z,.19,.08,.19);const ring=new THREE.TorusGeometry(.075,.014,4,10);put(ring,'iron',x,.72,z);ring.dispose();}
 await yieldCpuPreparation();
 const landscape=await buildEstateGroundAsync({THREE,put,box,cylinder,circle,COURSE,turfColors},yieldCpuPreparation);
 for(const [ri,route]of COURSE.paths.entries()){await yieldCpuPreparation();
  const option=COURSE.routeOptions.find(r=>r.path===ri),width=option?.width||(ri?4.6:5.8),paved=ri===0||[4,5,6].includes(ri),spacing=paved?52:70,rounded=roundedCourseRoute(route,ri===0?4.2:2.3);
  // The movement model's six-metre corridor includes a compacted shoulder.
  // Keep it above bunker sand but below the genuinely flooded turf overlays.
  await routeMargins.build(routeMargins.route(ri,Math.max(6,width+.5)),put,yieldCpuPreparation);
  if(paved)await courseRibbonAsync(yieldCpuPreparation,THREE,put,'road',rounded,ri===0?4.1:3.4,.033);
  // Unpaved routes use the feathered soil wheel lines built above.
  let traveled=0,next=ri?14:10;
  for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
   while(next<traveled+length){const t=(next-traveled)/length,x=a[0]+dx*t,y=a[1]+dy*t;for(const side of [-1,1])lantern(x+dy/length*(width/2+.65)*side,-y+dx/length*(width/2+.65)*side);next+=spacing;}traveled+=length;
  }
 }
 // Rutted maintenance cuts are narrow, rough alternatives to the paved bends.
 await routeMargins.build(routeMargins.minorRoutes(),put,yieldCpuPreparation);
 for(const route of COURSE.footPaths){await yieldCpuPreparation();for(let i=1;i<route.length;i++){
  const b=route[i];
  if(i===1||i===route.length-1)lantern(b[0]+.9,-b[1]);
 }}
 for(const cut of COURSE.shortcuts){await yieldCpuPreparation();
  // A pale latch plate and short operating handle distinguish service gates
  // from loose hurdles. Reuse the existing opaque metal/wood batches.
  const side=-1.75,cy=Math.cos(cut.yaw),sy=Math.sin(cut.yaw),hx=cut.x+cy*side,hz=-cut.y+sy*side;
  for(const face of [-1,1]){
   const px=hx-sy*.24*face,pz=hz+cy*.24*face;
   box('brass',px,1.08,pz,.25,.18,.035,-cut.yaw);box('iron',px-sy*.04*face,.99,pz+cy*.04*face,.07,.2,.06,-cut.yaw);
   box('paint',px-sy*.08*face,1.12,pz+cy*.08*face,.3,.055,.08,-cut.yaw);
  }
 }
 await yieldCpuPreparation();
 await routeMargins.build(routeMargins.courts(),put,yieldCpuPreparation);
 const courseDetail=await buildCourseDetail({put,box,cylinder,mat,yieldCpuPreparation,software});
 const routeClues=buildRouteClues({THREE,COURSE,put,box});
 materials.sand.vertexColors=true;
 const sandMargin=mat('sandMargin',0xb7ae93,surfaces.texture('sand'));sandMargin.vertexColors=true;sandMargin.transparent=true;sandMargin.depthWrite=false;finishBackNineSurface(sandMargin,'sand');
 landscape.bunkerBanks=[];
 for(const s of COURSE.sand){await yieldCpuPreparation();
  const bank=buildBunkerBanks(s,COURSE.paths);landscape.bunkerBanks.push(bank.stats);
  for(const {geometry,type}of bank.parts){put(geometry,type,0,0,0);geometry.dispose();}
 }
 landscape.bunkerEdges=buildBunkerRouteEdges({COURSE,box});
 // Additive night air (mist, halos, fog, the mower's lamp shaft) shares one
 // pooled sprite batch and the two existing headlight cones. No new lights.
 const nightFx=createBackNineNightFx({scene,camera,software,lanterns,fixtures:[...COURSE.checkpoints.map(p=>({x:p.x,y:terrainHeight(p.x,p.y)+3.16,z:-p.y,size:2.5,alpha:.22})),{x:-23,y:terrainHeight(-23,799.78)+4.6,z:-799.6,size:3.3,alpha:.26},{x:0,y:terrainHeight(0,-1.9)+3.45,z:1.8,size:1.8,alpha:.22},{x:2,y:7.1,z:-781.8,size:2.3,alpha:.15},{x:12,y:3.5,z:-781.8,size:2.3,alpha:.15}]});
 const irrigationArt=createIrrigationArt({scene,map:groundMap,materials,put,box,cylinder,wetMasks,turfConditionMaps:{dry:dryTurfMap,soil:scarSoilMap,field:turfConditionField},sprites:nightFx.sprites,lamps:nightFx.lamps,software});
 let irrigationState=[];
 // Low planted islands have irregular shoulders and a continuous footprint.
 // They are authored in the collision layout, never invisible decorative walls.
 let plantedTrees=0;
 const bedCraft={beds:0,roots:0,crowns:0,stones:0,ivyLeaves:0};
 for(const o of COURSE.obstacles){if(o.kind!=='hedge')continue;await yieldCpuPreparation();
  const craft=buildBedCraft({THREE,bed:o,put,sphere,circle});bedCraft.ivyLeaves+=buildTreeIvy({THREE,bed:o,put}).leaves;bedCraft.beds++;for(const key of ['roots','crowns','stones'])bedCraft[key]+=craft[key];
  // Redistribute a few existing trees into established solid planting beds.
  // No added tree budget, collision footprint, or trunk across a route.
  if(plantedTrees<15){const tree=pinePlacements.filter(p=>Math.sign(p.x)===Math.sign(o.x)&&Math.abs(p.x)>40).sort((a,b)=>Math.abs(-a.z-o.y)-Math.abs(-b.z-o.y))[0];if(tree){Object.assign(tree,{x:o.x,z:-o.y,h:6.5+noise(o.y)*2,w:.9});plantedTrees++;}}
 }
 landscape.bedCraft=bedCraft;
 function pitchedRoof(x,z,width,depth,eave,rise){const half=depth/2,slope=Math.hypot(half,rise),a=Math.atan2(rise,half);for(const side of [-1,1]){const g=new THREE.BoxGeometry(width,.13,slope);g.rotateX(side*a);put(g,'roof',x,eave+rise/2,z+side*half/2);g.dispose();box('weatherboard',x,eave,z+side*half,width,.18,.14);}box('iron',x,eave+rise+.04,z,width,.15,.17);}
 function shelter(c){for(const side of [-1,1])for(const dz of [-4,4])box('wood',c.x+side*3.7,1.7,-c.y+dz,.25,3.4,.25);pitchedRoof(c.x,-c.y,8.4,10,3.45,1.2);box('lamp',c.x,3.2,-c.y,1.1,.08,.3);}
 COURSE.checkpoints.forEach(shelter);
 await yieldCpuPreparation();
 // Enclosed irrigation cabinets have matching solid footprints. Existing
 // pixel metal/wood maps and spatial batches keep this scenery inexpensive.
 for(const [i,p]of COURSE.machinery.entries()){await yieldCpuPreparation();
  box('masonry',p.x,.12,-p.y,2.8,.24,2.4);box('paint',p.x,1,-p.y,1.7,1.6,1.1);
  box('iron',p.x,1,-p.y+.56,.035,1.5,.025);for(const side of [-1,1])box('iron',p.x+side*.25,1.08,-p.y+.59,.035,.22,.035);
  for(let n=0;n<5;n++)box('iron',p.x,1.45+n*.06,-p.y+.57,1.35,.022,.025);
  put(cylinder,'mower',p.x+.9,.65,-p.y,.32,1.2,.32);put(cylinder,'iron',p.x-.9,.72,-p.y,.25,1.4,.25);
  box('iron',p.x,1.85,-p.y,2.1,.12,1.4);box('brass',p.x-.55,1.6,-p.y-.6,.3,.2,.035);
  const wheel=new THREE.TorusGeometry(.25,.035,4,12);put(wheel,'rust',p.x+.85,1.1,-p.y-.38);wheel.dispose();
  box('stone',p.x,.15,-p.y,3.5,.3,3.2);box('iron',p.x+.85,1.05,-p.y-.44,.3,.1,.055);
  box('paint',p.x-.5,1.2,-p.y+.585,.28,.16,.015);box('red',p.x-.5,1.2,-p.y+.596,.15,.025,.008);
 }
 // Lower border planting connects the tree line to the ground, with gaps
 // around the reservoir banks and authored maintenance compounds.
 // Shallow banks are entirely beyond the boundary fence. They break up the
 // flat arena silhouette without changing the player's collision surface.
 for(const y of [45,285,400,620])for(const side of [-1,1])put(sphere,'rough',side*57,-.65,-y,11,2.1+noise(y+side)*.6,22);
 for(const [x,y,rx,ry]of COURSE_RESERVOIRS)for(const a of [2.35,2.8,3.45,3.9]){
  const bx=x+Math.cos(a)*(rx+.5),by=y+Math.sin(a)*(ry+.4);
  // Sparse, opaque reed silhouettes on the bank; no blended grass cards.
  for(let i=0;i<4;i++){const h=.85+noise(i+by)*.65,px=bx+(i%2)*.22,pz=-by+Math.floor(i/2)*.28;put(cylinder,'leaf',px,.14+h*.5,pz,.014,h,.014);put(cylinder,'wood',px,.14+h,pz,.04,.18,.04);}
 }
 for(const s of BORDER_SHRUBS){
  for(const offset of [-2.4,0,2.4])put(sphere,'leaf',s.x,.35,-s.y+offset,1.2,.5,1.5);
  for(const p of borderShrubPlants(s))courseDetail.addPlant(p);
 }
 // Broken, branchy silhouettes outside the fence deepen the course border.
 for(const y of [118,447,706])for(const side of [-1,1]){
  const x=side*(43+noise(y)*3);put(cylinder,'wood',x,2.3,-y,.2,4.6,.2);
  for(let n=0;n<3;n++){const g=new THREE.CylinderGeometry(.025,.11,2.4,6);g.rotateZ(side*(.65+n*.25));put(g,'wood',x+side*.65,2.7+n*.55,-y+n*.35);g.dispose();}
 }
 // Tall, opaque planted windbreaks separate the two driving lanes. They are
 // the same boxes used by sight tests/navigation, not a visibility toggle.
 for(const s of COURSE.sightbreaks){await yieldCpuPreparation();
  // A trimmed hedge on a low stone footing: retain the solid footprint and
  // sight break, but give the foliage a rounded crown and irregular shoulders.
  box('masonry',s.x,.18,-s.y,s.rx*2,.36,s.ry*2);
  const core=windbreakCoreGeometry(THREE,s);put(core,'windbreakLeaf',s.x,0,-s.y);core.dispose();
  // This contracted box sits inside the immovable, closed hedge core. It
  // cannot cover its crown, leaf tips, ends, or either navigable side.
  const base=terrainHeight(s.x,s.y);solidOcclusion?.add(new THREE.Box3(new THREE.Vector3(s.x-s.rx*.65,base+.25,-s.y-s.ry+.25),new THREE.Vector3(s.x+s.rx*.65,base+1.8,-s.y+s.ry-.25)),new THREE.Matrix4());
  for(const p of windbreakPlants(s))courseDetail.addPlant(p);
 }
 for(const y of [-1,836]){box('rough',0,-.14,-y,84,.25,18);for(let x=-40;x<=40;x+=5){box('wood',x,.8,-y,.16,1.6,.16);if(x<40){box('wood',x+2.5,.8,-y,5,.09,.07);box('wood',x+2.5,1.3,-y,5,.09,.07);}}}

 // A substantial clubhouse and a warm, open service garage make the end leg
 // readable through the dark without a floating objective arrow.
 box('stucco',4,4.8,-795,32,9.6,26);box('masonry',4,1.1,-795,32.12,2.2,26.12);pitchedRoof(4,-795,35,29,9.8,3.2);for(let x=-12;x<=20;x+=4)box('weatherboard',x,4.8,-781.9,.18,9.6,.18);
 for(let x=-8;x<19;x+=5)for(const y of [3.5,7.1]){
  const lit=(x===2&&y===7.1)||(x===12&&y===3.5);
  box('iron',x,y,-781.94,2.5,2.5,.08);box(lit?'windowLamp':'wet',x,y,-781.87,1.9,1.9,.02);
  // Closed curtains and deep sills leave only two rooms apparently occupied.
  for(const side of [-1,1])box('cloth',x+side*.73,y,-781.84,.4,1.9,.03);
  box('wood',x,y,-781.80,.09,2,.03);box('wood',x,y,-781.79,2,.09,.03);box('stone',x,y-1.1,-781.77,2.5,.13,.3);
 }
 // Ordered architectural details make the clubhouse a real destination.
 for(const side of [-1,1]){box('weatherboard',4+side*15.7,4.8,-781.84,.36,9.6,.2);for(let y=2.35;y<9.8;y+=3.8)box('stone',4,y,-781.82,32.1,.16,.26);}
 box('iron',4,1.7,-781.78,3.2,3.4,.1);for(const side of [-1,1]){box('weatherboard',4+side*.79,1.7,-781.70,1.5,3.2,.08);box('windowLamp',4+side*.79,2.1,-781.65,1.1,1.8,.02);box('brass',4+side*.13,1.3,-781.59,.045,.34,.04);}
 box('roof',4,3.65,-781.6,5,.16,.6);box('stone',4,.12,-781.6,4,.24,.6);
 box('masonry',-29,2.5,-807,1,5,14);box('masonry',-17,2.5,-807,1,5,14);pitchedRoof(-23,-807,13,15,5.1,.8);box('masonry',-23,2.5,-814,12,5,1);box('lamp',-23,4.65,-800,3,.12,.12);box('road',-23,.05,-807,11,.08,14);
 for(const x of [-24.9,-21.1]){put(cylinder,'iron',x,.52,-800,.18,1.04,.18);put(cylinder,'brass',x,.85,-800,.185,.18,.185);}
 // A cart-width maintenance gap: heavy posts explain why the larger mower
 // must route around. Paired lamps show the opening without directional signs.
 for(const g of COURSE.cartGates)for(const side of [-1,1]){const x=g.x+Math.cos(g.yaw)*side*1.75,y=g.y-Math.sin(g.yaw)*side*1.75;put(cylinder,'iron',x,.65,-y,.2,1.3,.2);put(cylinder,'brass',x,1.02,-y,.205,.18,.205);lantern(x+side*.45,-y);}
 // A warm, steady destination remains visible through the last exposed turn.
 box('lamp',-23,4.65,-799.78,3,.14,.12);box('iron',-23,4.85,-799.7,3.3,.12,.5);
 for(let i=0;i<9;i++)for(const side of [-1,1])box('wet',-23+side*.7,.033,-787-i*1.5,.18,.01,1.1);
 // The shed the player just escaped: visible behind the starting cart.
 box('weatherboard',0,2,4,9,4,4);pitchedRoof(0,4,9.6,4.8,4.1,.9);box('iron',0,1.6,1.96,2.3,3.2,.08);box('lamp',0,3.5,1.9,.3,.2,.15);
 await yieldCpuPreparation();
 const landmarks=buildCourseLandmarks({THREE,box,put,cylinder});
 await yieldCpuPreparation();
 const courseFeatures=buildCourseFeatures({THREE,COURSE,box,put,cylinder,sphere,circle,scene,batchVehicleParts,addPlant:courseDetail.addPlant});
 await yieldCpuPreparation();
 const shiftRecords=buildShiftRecords({scene,materials,box,put,cylinder});
 await yieldCpuPreparation();
 const storyArt=buildCourseStoryArt({THREE,box,put,cylinder,pitchedRoof,batchVehicleParts,scene,COURSE,materials,pinePlacements});
 const architecture=buildBackNineArchitecture({THREE,box,put,cylinder,COURSE});
 // Preserve the tree budget, moving trees out of the new water to bank groves.
 for(const p of pinePlacements)for(const [x,y,rx,ry]of COURSE_RESERVOIRS){
  if(((p.x-x)/rx)**2+((-p.z-y)/ry)**2<1.25){const side=-p.z<y?-1:1;p.x=50+noise(p.z)*12;p.z=-(y+side*(ry+5+noise(p.x)*4));}
 }
 await yieldCpuPreparation();
 const districtScenery=buildBackNineDistrictScenery({THREE,box,put,cylinder,pinePlacements});
 await yieldCpuPreparation();
 const encounterVistas=composeEncounterTrees(pinePlacements);
 const breakFragments=createBreakFragments(scene,materials);
 const greenFlags=createGreenFlags(scene);
 const sceneryContacts=createSceneryContacts(scene,COURSE,courseDetail.contactPlants,software?batchCulling:null);
 const practicalLights=createBackNinePracticalLights(practicalLightAnchors(lanterns,COURSE.checkpoints));
 let mergeSlice=performance.now();
 for(const [key,b] of batches){if(key.startsWith('pathLamp:')){b.material=b.material.clone();roadLights.push({material:b.material,y:Number(key.split(':')[1])*48+24});}const g=mergeIndexedGeometries(b.geometries);g.computeBoundingSphere();g.computeBoundingBox();const mesh=new THREE.Mesh(g,b.material);mesh.matrixAutoUpdate=false;/* world-space static batch: identity transform, never moved */if(key.startsWith('turfMargin:'))mesh.renderOrder=-3;else if(key.startsWith('soilMargin:'))mesh.renderOrder=-2;else if(key.startsWith('sandMargin:'))mesh.renderOrder=-1;if(key.startsWith('plantCourse:'))g.boundingSphere.radius+=1.25;scene.add(mesh);const pieces=batchCulling.register(mesh,b.geometries,{maxTrianglesPerPart:software?64:Infinity,rasterCull:software&&rasterGround.has(key.split(':')[0]),...(key.startsWith('plantCourse:')?{maxDistance:software?32:60,boundsPadding:1.25}:software&&key.startsWith('windbreakLeaf:')?{boundsPadding:.05}:{})});localLights?.register(mesh,pieces);for(const piece of b.geometries)piece.dispose();b.geometries.length=0;if(performance.now()-mergeSlice>=8){await yieldCpuPreparation();mergeSlice=performance.now();}}
 await yieldCpuPreparation();
 const garageMotion=createGarageMotion(scene,materials),shutter=garageMotion.root;
 const hemi=new THREE.HemisphereLight(0xb7cbd8,0x48503e,.5);scene.add(hemi);scene.add(new THREE.AmbientLight(0x87958a,.09));const moon=new THREE.DirectionalLight(0xa9c7d9,.88);moon.position.set(-30,55,10);scene.add(moon);
 const beaconRed=new THREE.Color(0xff2010),mowerLight=new THREE.PointLight(0xff2010,0,40,2);scene.add(mowerLight);
 await yieldCpuPreparation();
 beaconShadows.build(mowerLight);
 beaconShadows.addCaster(shutter);
 const headlights=createBackNineHeadlights(scene,beaconShadows.coverGeometry()),headlamp=headlights.player,localSources=[headlamp,headlights.mower,mowerLight];headlights.addCaster(shutter);
 pinePlacements.forEach(p=>p.y=terrainHeight(p.x,-p.z));
 const pines=await createCoursePines(scene,materials.wood,pinePlacements,software,pineAsset,{includeSpots:true,wind:environmentWind});
 onProgress('Preparing the cart and the mower…');
 function batchVehicleParts(group){
  const grouped=new Map();group.updateMatrixWorld(true);for(const m of [...group.children]){if(!m.isMesh)continue;const key=m.material.uuid;if(!grouped.has(key))grouped.set(key,{mat:m.material,list:[]});const g=m.geometry.clone();g.applyMatrix4(m.matrix);if(!g.attributes.vergeTip)projectUV(g,'vehicle');grouped.get(key).list.push(g);group.remove(m);}
  for(const b of grouped.values()){const g=mergeIndexedGeometries(b.list);b.list.forEach(g=>g.dispose());group.add(new THREE.Mesh(g,b.mat));}
 }
 function rail(parent,points,r=.025,type='iron'){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));put(new THREE.TubeGeometry(curve,points.length*3,r,6,false),type,0,0,0,1,1,1,0,parent);}
 // A rolled sheet-metal arch, with a turned-down outside lip. Its sparse
 // silhouette geometry merges into the existing paint batch, not a new draw.
 function wheelArch(parent,type,x,y,z,r,side){
  const p=[],uv=[],indices=[];
  for(let i=0;i<=10;i++){const a=-1.24+i*.248;for(let j=0;j<3;j++){const radius=r-(j===2?.055:0);p.push(x+side*[-.17,.17,.17][j],y+Math.cos(a)*radius,z+Math.sin(a)*radius);uv.push(j/2,i/10);}}
  for(let i=0;i<10;i++)for(let j=0;j<2;j++){const a=i*3+j,b=a+3;indices.push(...(side>0?[a,b,a+1,a+1,b,b+1]:[a,a+1,b,a+1,b+1,b]));}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();put(g,type,0,0,0,1,1,1,0,parent);
 }
 function vehicle(mower){
  const root=new THREE.Group(),body=new THREE.Group(),driver=new THREE.Group(),wheels=[],decks=[];scene.add(root);root.add(body);
  const parts=mower?null:Object.fromEntries(['roof','hood','bumper','hatch','frame'].map(name=>{const g=new THREE.Group();g.name='cart-'+name;body.add(g);return [name,g];}));
  const width=mower?2.5:1.7,length=mower?3.7:2.8,wheelRadius=mower?.57:.36;
  put(roofShape(width,mower?length-1:length,.22),mower?'mower':'paint',0,mower?.75:.57,mower?.5:0,1,1,1,0,body);
  box('iron',0,.4,0,width*.7,.17,length*.78,0,body);
  const seatW=mower?.48:.74,seatY=mower?1.22:.95;
  put(panelLoft(THREE,[[-.07,seatW-.07,seatY-.09,seatY+.04],[.04,seatW,seatY-.1,seatY+.12],[.53,seatW,seatY-.1,seatY+.12],[.67,seatW-.06,seatY-.08,seatY+.04]]),'seat',0,0,0,1,1,1,0,body);
  put(panelLoft(THREE,[[.52,seatW-.07,seatY,seatY+.58],[.61,seatW,seatY-.05,seatY+.66],[.71,seatW-.06,seatY,seatY+.59]]),'seat',0,0,0,1,1,1,0,body);
  put(panelLoft(THREE,mower?[[-1.55,.91,.8,1.27],[-1.2,1.06,.77,1.48],[-.8,1.06,.77,1.48],[-.27,.85,.82,1.29]]:[[-1.43,.55,.68,.87],[-1.2,.73,.65,1.025],[-.78,.74,.67,1.05],[-.55,.63,.72,.98]],.07),mower?'mower':'paint',0,0,0,1,1,1,0,mower?body:parts.hood);
  for(const side of [-1,1]){
   box('iron',side*width*.47,.65,-length*.47,.11,.15,.3,0,body);
   box(mower?'mowerLamp':'lamp',side*width*.32,mower?1.15:.83,-length*.5-.06,.26,.15,.055,0,mower?body:parts.hood);box('red',side*width*.38,.75,length*.48,.18,.1,.05,0,body);
   for(const z of [-length*.3,length*.3]){const wheel=new THREE.Group();wheel.position.set(side*width*.49,wheelRadius,z);root.add(wheel);const tire=new THREE.Mesh(vehicleTireGeometry(THREE,wheelRadius),materials.rubber);wheel.add(tire);const hub=new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius*.48,wheelRadius*.48,.29,12),materials.iron);hub.rotation.z=Math.PI/2;wheel.add(hub);
    for(let i=0;i<16;i++){const a=i*Math.PI/8,m=box('rubber',0,Math.cos(a)*(wheelRadius-.008),Math.sin(a)*(wheelRadius-.008),.27,.035,.065,0,wheel);m.rotation.x=a;}
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5,m=put(cylinder,'iron',side*.155,Math.cos(a)*wheelRadius*.3,Math.sin(a)*wheelRadius*.3,.023,.022,.023,0,wheel);m.rotation.z=Math.PI/2;}
    addWheelCraft({THREE,wheel,side,r:wheelRadius,mower,put,box,cylinder});batchVehicleParts(wheel);wheels.push(wheel);}
   for(const z of [-length*.3,length*.3])wheelArch(body,mower?'mower':'paint',side*width*.49,wheelRadius,z,wheelRadius+.085,side);
  }
  const steering=new THREE.Group();steering.name=mower?'joe-steering-wheel':'cart-steering-wheel';steering.rotation.x=Math.PI*.32;steering.position.set(mower?0:-.36,mower?1.48:1.18,mower?-.25:-.35);body.add(steering);
  const steeringRim=new THREE.Mesh(new THREE.TorusGeometry(mower?.29:.24,.035,5,16),materials.iron);steering.add(steeringRim);
  if(mower){for(const sign of [-1,1])box('iron',sign*.13,0,0,.26,.026,.024,0,steering);box('iron',0,-.13,0,.026,.26,.024,0,steering);const hub=put(cylinder,'iron',0,0,0,.06,.05,.06,0,steering);hub.rotation.x=Math.PI/2;batchVehicleParts(steering);rail(body,[[0,1.48,-.25],[0,.98,.07]],.025,'iron');box('iron',0,.98,.07,.18,.055,.16,0,body);}else{steeringRim.position.copy(steering.position);steeringRim.quaternion.copy(steering.quaternion);body.add(steeringRim);body.remove(steering);}
  if(!mower){
   for(const side of [-1,1])for(const z of [-.75,1])box('iron',side*.77,1.55,z,.045,1.75,.045,0,parts.frame);
   put(panelLoft(THREE,[[-1.12,.83,2.46,2.52],[-.9,.97,2.47,2.56],[.1,.98,2.5,2.6],[1.15,.97,2.46,2.54],[1.38,.82,2.45,2.51]],.02),'paint',0,0,0,1,1,1,0,parts.roof);
   // Open windshield, small instrument panel and footwell preserve sightlines.
   box('iron',0,.95,-.6,1.5,.15,.22,0,body);box('lamp',-.36,1.05,-.57,.16,.045,.09,0,body);
   // Framed roof, rear luggage basket, battery hatch, tread plates and gauges.
   for(const side of [-1,1]){
    rail(parts.roof,[[side*.95,2.53,-1.02],[side*.95,2.56,0],[side*.95,2.53,1.25]],.018);
    rail(body,[[side*.76,.77,1.25],[side*.76,1.45,1.25],[side*.76,1.45,.78]],.025);
    box('iron',side*.82,.56,.12,.07,.06,1.7,0,body);
    for(let i=0;i<6;i++)box('rubber',side*.64,.71,-.52+i*.13,.28,.018,.035,0,body);
   }
   for(const y of [1.08,1.28,1.46])rail(body,[[-.76,y,1.25],[0,y,1.28],[.76,y,1.25]],.022);
   for(const x of [-.5,0,.5])box('iron',x,1.26,1.27,.018,.4,.025,0,body);
   box('iron',0,.63,1.42,.88,.22,.025,0,parts.hatch);box('paint',0,.64,1.44,.78,.16,.018,0,parts.hatch);box('iron',0,.67,1.46,.13,.025,.02,0,parts.hatch);
   rail(parts.bumper,[[-.76,.43,-1.43],[0,.43,-1.49],[.76,.43,-1.43]],.035);
   for(const x of [-.25,.13]){put(new THREE.TorusGeometry(.065,.012,4,12),'iron',x,1.055,-.54,1,1,1,0,body);box('lamp',x,1.06,-.52,.008,.055,.008,.35,body);}
   for(const x of [.37,.57]){const ring=put(new THREE.TorusGeometry(.065,.015,4,12),'rubber',x,1.03,-.57,1,1,1,0,body);ring.rotation.x=Math.PI/2;}
   // Broad roof channels and upholstery seams read from the chase camera.
   for(const x of [-.66,-.33,0,.33,.66])box('paint',x,2.59,.12,.045,.035,2.05,0,parts.roof);
   for(const side of [-1,1]){
    box('iron',side*.9,2.54,.12,.025,.03,2.15,0,parts.roof);
    rail(body,[[side*.65,1.06,.6],[side*.71,1.09,.1],[side*.68,1.09,-.03]],.033,'seat');
    // Inboard mirrors retain clearance through the cart-only gap.
    box('iron',side*.87,1.94,-.73,.1,.025,.06,0,parts.frame);
    box('rubber',side*.96,1.95,-.73,.16,.19,.065,-side*.2,parts.frame);
    box('paint',side*.96,1.95,-.69,.12,.14,.018,-side*.2,parts.frame);
    for(const y of [.53,.72])box('iron',side*.63,y,1.46,.07,.04,.03,0,body);
    box('red',side*.66,.87,1.43,.19,.065,.03,0,body);
   }
   for(const x of [-.58,-.3,0,.3,.58]){
    box('rubber',x,1.32,.697,.012,.48,.014,0,body);
    box('rubber',x,1.067,.32,.012,.014,.52,0,body);
   }
   // A strapped service case and rolled rain cover make the rear basket useful.
   put(roofShape(.61,.43,.23),'paint',-.37,.97,1.0,1,1,1,.04,body);
   for(const x of [-.57,-.17])box('rubber',x,1.22,1,.035,.02,.44,0,body);
   box('iron',-.37,1.13,1.24,.12,.08,.025,0,body);
   rail(body,[[-.49,1.23,1],[-.47,1.29,1],[-.27,1.29,1],[-.25,1.23,1]],.016);
   const cover=put(cylinder,'seat',.39,1.12,1.02,.11,.48,.11,0,body);cover.rotation.z=Math.PI/2;
   for(const x of [.24,.54]){const strap=put(new THREE.TorusGeometry(.114,.012,4,10),'rubber',x,1.12,1.02,1,1,1,0,body);strap.rotation.y=Math.PI/2;}
   // Hood trim and a recessed, non-emissive maker's badge.
   box('iron',0,.88,-1.256,.3,.12,.025,0,parts.hood);box('paint',0,.88,-1.272,.19,.05,.012,0,parts.hood);
   for(const side of [-1,1])box('iron',side*.64,1.027,-.93,.025,.015,.49,0,parts.hood);
   // The same detailed actor occupies the seat and escapes on foot.
   body.add(driver);
  }else{
   for(const side of [-1,0,1]){const deck=new THREE.Group();deck.position.set(side*1.45,.25,-1.4);root.add(deck);put(cylinder,'rust',0,0,0,.94,.16,.8,0,deck);put(cylinder,'mower',0,.12,0,.78,.14,.66,0,deck);box('iron',0,.25,.35,.15,.15,1,0,deck);
    put(cylinder,'iron',0,.24,0,.22,.12,.22,0,deck);put(cylinder,'mower',0,.32,0,.15,.055,.15,0,deck);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;put(cylinder,'iron',Math.sin(a)*.62,.22,Math.cos(a)*.5,.025,.035,.025,0,deck);box('iron',Math.sin(a)*.42,.205,Math.cos(a)*.36,.08,.018,.15,a,deck);}
    rail(deck,[[-.12,.32,.1],[-.24,.48,.35],[0,.43,.64]],.026,'rubber');
    for(let i=0;i<7;i++){const a=-1.15+i*.38,x=Math.sin(a)*.77,z=-Math.cos(a)*.65;box('iron',x,-.035,z,.13,.13,.19,-a,deck);box('brass',x,.15,z,.08,.025,.08,0,deck);}
    for(let n=0;n<5;n++){const x=-.54+n*.27,tooth=box('rust',x,.025,-.73,.09,.16,.13,0,deck);tooth.rotation.x=.25+(n%2)*.18;box('iron',x,.17,-.68,.11,.035,.16,0,deck);}
   const releaseDetail=addDeckDetail({THREE,deck,box,put,cylinder});addDeckCraft({THREE,deck,box,put,cylinder,rail});batchVehicleParts(deck);releaseDetail();decks.push(deck);}
   for(let i=0;i<8;i++)box('iron',-.8+i*.23,1.4,-1.45,.09,.12,.6,0,body);
   put(cylinder,'iron',.93,1.8,.77,.065,2.1,.065,0,body);box('rust',.93,2.85,.77,.16,.12,.23,0,body);
   for(let i=0;i<10;i++)box('iron',-1+i*.22,.92,1.87,.06,.18,.045,0,body);
   // Service panels, radiator fins, fuel hardware and hydraulic controls.
   for(const side of [-1,1]){
    box('iron',side*1.095,1.1,-.91,.025,.48,1.03,0,body);box('mower',side*1.115,1.1,-.91,.02,.4,.95,0,body);
    for(let i=0;i<5;i++)box('iron',side*1.13,.98+i*.055,-1,.012,.018,.57,0,body);
    for(const z of [-1.33,-.51])for(const y of [.94,1.26])box('iron',side*1.14,y,z,.018,.035,.035,0,body);
    rail(body,[[side*.8,.7,.7],[side*1.02,.9,.3],[side*1.08,.62,-.3]],.03,'rubber');
    box('iron',side*.94,1.17,.6,.22,.1,.55,0,body);
   }
   put(cylinder,'iron',-.78,1.48,-.62,.095,.065,.095,0,body);
   box('iron',.65,1.42,.1,.3,.1,.42,0,body);for(let i=0;i<3;i++){box('iron',.56+i*.09,1.59,.03,.018,.27,.018,0,body);put(sphere,'rubber',.56+i*.09,1.74,.03,.035,.035,.035,0,body);}
   for(let i=0;i<5;i++)box('iron',.93,1.6+i*.16,.77,.19,.045,.19,0,body);
   rail(body,[[-.94,.6,1.7],[0,.6,1.82],[.94,.6,1.7]],.05);
   // An industrial silhouette: bent roll cage, slotted intake like a jaw,
   // hooked guards and hanging chain curtains, all within the solid hull.
   for(const side of [-1,1]){
    rail(body,[[side*1.02,.84,.85],[side*1.07,2.7,.78],[side*.92,3.22,.48],[side*.74,3.25,-.22]],.055,'rust');
    rail(body,[[side*.74,3.25,-.22],[side*.9,2.65,-.5],[side*1.05,1.4,-.58]],.035);
    box('rust',side*.99,1.38,.56,.18,.06,.9,0,body);
   }
   rail(body,[[-.92,3.22,.48],[0,3.32,.43],[.92,3.22,.48]],.06,'rust');
   box('iron',0,1.24,-1.67,1.93,.33,.09,0,body);
   for(let i=0;i<11;i++){
    const x=-.83+i*.166;box('rust',x,1.24,-1.73,.055,.32,.06,0,body);
    box('brass',x,1.44,-1.69,.09,.06,.08,-.3,body);
    for(let k=0;k<3;k++)box('iron',x,.68-k*.095,-1.67,k%2?.025:.06,.1,k%2?.06:.025,0,body);
   }
   for(const side of [-1,1])box('iron',side*.8,1.23,-1.85,.38,.04,.1,0,body);
   put(cylinder,'iron',-.74,3.32,.45,.13,.12,.13,0,body);put(cylinder,'siren',-.74,3.47,.45,.15,.23,.15,0,body);for(const side of [-1,1]){box('iron',-.74+side*.18,3.46,.45,.025,.36,.035,0,body);box('iron',-.74,3.46,.45+side*.18,.035,.36,.025,0,body);}box('iron',-.74,3.66,.45,.38,.035,.38,0,body);
   for(let i=0;i<6;i++)box('brass',-.7+i*.27,.82,1.8,.12,.08,.035,.45,body);
   // Layered engine armor: a patched bonnet, riveted straps and cooling slots.
   box('rust',-.29,1.45,-.9,.65,.045,.75,.07,body);
   for(const x of [-.53,-.06])for(const z of [-1.19,-.61])put(cylinder,'iron',x,1.49,z,.026,.025,.026,0,body);
   for(const x of [-.87,.81])box('iron',x,1.455,-.94,.065,.035,.94,0,body);
   for(let i=0;i<7;i++)box('rubber',.34+i*.07,1.447,-.91,.027,.015,.58,0,body);
   for(const side of [-1,1]){
    // Reinforced arch edges, hose unions and access steps stay inside the hull.
    box('rust',side*1.29,1.17,.99,.07,.07,.79,0,body);
    box('iron',side*1.12,.78,.3,.33,.06,.43,0,body);
    for(let i=0;i<4;i++)box('rubber',side*1.12,.818,.15+i*.1,.27,.018,.026,0,body);
    rail(body,[[side*.88,1.2,-.15],[side*1.2,.95,-.34],[side*1.18,.62,-.67]],.035,'rubber');
    for(const y of [.65,.73])put(cylinder,'brass',side*1.18,y,-.66,.051,.045,.051,0,body);
    box('rust',side*.67,1.76,.78,.21,.3,.045,side*.12,body);
    for(const y of [1.65,1.85])box('iron',side*.67,y,.813,.05,.04,.025,0,body);
   }
   // Radiator crossmembers and a bolted towing eye reinforce the jaw silhouette.
   for(const y of [1.34])box('iron',0,y,-1.78,1.84,.045,.035,0,body);
   for(const x of [-.72,-.36,0,.36,.72])box('brass',x,1.34,-1.808,.035,.035,.022,0,body);
   const eye=put(new THREE.TorusGeometry(.11,.035,5,12),'iron',0,.63,1.78,1,1,1,0,body);eye.rotation.x=Math.PI/2;
   // Welded exhaust clamp and bent outlet, using the existing rough metal maps.
   for(const y of [1.69,2.33])put(cylinder,'rust',.93,y,.77,.11,.075,.11,0,body);
   rail(body,[[.93,2.82,.77],[.93,2.96,.82],[.93,2.99,1.02]],.068,'iron');
  }
  addVehicleDetail({THREE,mower,body,parts,box,put,cylinder,rail,openMouth:mower});
  addVehicleCraft({THREE,mower,body,parts,box,put,cylinder,rail});addChaseVehicleCraft({THREE,mower,body,box,put,cylinder});
  const mouthCraft=mower?createMowerMouthCraft({THREE,root,body,deck:decks[1],materials,box,put,cylinder,rail,batch:batchVehicleParts}):null;
  const wear=parts?buildCartWear({THREE,parts,body,box,batchVehicleParts}):[];
  // Retain five breakaway assemblies; their details still batch by material.
  if(parts)for(const part of Object.values(parts))batchVehicleParts(part);
  batchVehicleParts(body);
  const repeated=instanceVehicleParts(root,[...wheels,...decks]);
  const damage=parts?createCartDamage({body,driver,wheels,parts,wear}):null;
  const finish=mower?finishMowerMaterials(root,materials,mowerSurfaceMaps):null;
  return {root,body,driver,wheels,decks,steering,repeated,damage,mouthCraft,finish,phase:0};
 }
 const cart=vehicle(false);await yieldCpuPreparation();const mowerSurfaceMaps=await mowerSurfaceAssets;const mower=vehicle(true);await yieldCpuPreparation();const runner=createChaseRunner(scene,materials,terrainHeight,await runnerClothAsset,await runnerFaceAsset,await runnerHairAsset,await runnerGearAsset);headlights.mountRunner(runner,materials);let wasOnFoot=false;let rider=null,riderMotion=null;
 // Reuse Joe's authored high-resolution face, hair, shoulders and cloth. Only
 // his skeleton is seated; the old push mower is excluded from this level.
 try{
  const gltf=await riderAsset;rider=gltf.scene;let skinMap=null;rider.traverse(o=>{if(o.material?.name==='Skin')skinMap=o.material.map;});
  rider.traverse(o=>{if(o.name==='MowerRigidBody'||o.name.startsWith('Wheel'))o.visible=false;if(o.isMesh){const source=Array.isArray(o.material)?o.material:[o.material],skinMask=skinInfluenceMask(o.geometry);o.material=source.map(m=>{if(m.map){m.map.magFilter=THREE.NearestFilter;m.map.minFilter=THREE.NearestMipmapLinearFilter;}const n=new THREE.MeshLambertMaterial({map:m.map,color:m.color,side:THREE.DoubleSide});const face=m.name==='Face'&&!!o.geometry.attributes.color&&!!skinMap;n.onBeforeCompile=s=>{
    specializeSkinning(s,skinMask);
    if(face){s.uniforms.joeSkinMap={value:skinMap};s.vertexShader='attribute vec3 color;\nvarying float joeFaceWeight;\nvarying vec2 joeSkinUv;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\njoeFaceWeight=color.r;joeSkinUv=position.xy*1.2+vec2(.2);');s.fragmentShader='uniform sampler2D joeSkinMap;\nvarying float joeFaceWeight;\nvarying vec2 joeSkinUv;\n'+s.fragmentShader;}
    s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+(face?'diffuseColor.rgb=mix(texture2D(joeSkinMap,fract(joeSkinUv)).rgb,diffuseColor.rgb,clamp(joeFaceWeight,0.0,1.0));':'')+(m.name==='Collar'?'float luma=dot(diffuseColor.rgb,vec3(.299,.587,.114));diffuseColor.rgb=vec3(.24,.34,.43)*(.62+luma*.85);':'')+'\ndiffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.78));');};n.customProgramCacheKey=()=> 'back-nine-joe-'+(face?'face':m.name==='Collar'?'collar':'surface')+'-skin-'+skinMask;return n;});if(!Array.isArray(source)||o.material.length===1)o.material=o.material[0];o.frustumCulled=false;}
   if(o.name.startsWith('Thigh'))o.rotateX(Math.PI/2);if(o.name.startsWith('Shin'))o.rotateX(-Math.PI/2);
  });rider.position.set(0,.28,.1);mower.body.add(rider);riderMotion=createBackNineRiderMotion(rider,mower.steering);
 }catch(error){throw new Error('Joe could not load. Reload to retry. '+error.message);}
 await yieldCpuPreparation();
 const experienceArt=createExperienceArt({scene,materials,box,put,cylinder,batchVehicleParts});experienceArt.warm();
 const ghosts=await createCourseGhosts(scene);ghosts.warm();const clippings=createMowerClippings(scene);
 const staffSighting=createStaffSighting(scene,rider),riderCulling=createChaseRiderCulling(rider);
 nightFx.mount(mower.body);const spray=new THREE.InstancedMesh(new THREE.BoxGeometry(.025,.06,.025),materials.tireSpray,32);spray.userData.rigidInstanceBounds=true;spray.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(spray);
 const impactSparks=new THREE.InstancedMesh(new THREE.BoxGeometry(.035,.035,.13),materials.lamp,12);impactSparks.userData.rigidInstanceBounds=true;impactSparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);impactSparks.frustumCulled=false;scene.add(impactSparks);
 const destructionArt=createDestructionArt(scene,materials);let mouthPose={cutting:false,height:.68,target:.68};let mouthRun=null;
 const hurdleArt=createCourseHurdles(scene,COURSE.hurdles,unitBox,materials.wood);
 const vehicleFrustum=new THREE.Frustum(),vehicleProjection=new THREE.Matrix4(),mowerBounds=new THREE.Sphere(new THREE.Vector3(),6);
 const nightShadows=createNightShadows(scene,pinePlacements,moon);
 const contactShadows=createBackNineContactShadows(scene,{runner,cart,mower});
 const localMist=createBackNineLocalMist(camera);
 const atmosphere=createChaseAtmosphere();let atmospherePose=atmosphere.stats();
 const deathCameraStart=new THREE.Vector3();let presentedDeath=null,presentedDeathSide=1;
 const deathPose={},approach=createPursuitFeedback();let approachPose=approach.stats();
 const orbitEye=new THREE.Vector3(),look=new THREE.Vector3(),desired=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),impactPose={};let drawCalls=0,impactRecoil=0,rumbleIntensity=0,rumbleMotion=0,ramPose={};let initialized=false,lastTime=0,lastRear=false,closed=false;
 const runnerViewAnchor={x:0,y:0};
 let beaconPose={},cameraClearance=1;
 // Presentation-only lens moves: the chase boom settles in from a wider,
 // higher pose as a run begins, and the lens tightens on the closing shutter.
 // Neither touches the simulation; Reduced motion skips both.
 let introAt=-99,introRun=null,introMode='',introPose=0,sealZoom=0;
 // The capture moment lingers: the camera's own pose runs behind for the first
 // beat and the weather hangs in the air. Simulation time is never touched.
 const fxFrame={actor:null,joe:null,reducedMotion:false,dip:0,beacon:null,headlights:null,fog:null,timeScale:1,impact:null,effects:true},captureImpact={x:0,y:0,h:0,age:9,power:0};let captureSlow=0,wetSheenMaterials=0;
 const lingerAge=age=>{if(age>=.9)return age;const t=age/.9;return age*(.42+.58*t*t*(3-2*t));};
 // Polish pass. Everything here is presentation: the shared screen finish
 // (bloom, grade, vignette, grain), the quality preset's knobs, sprung cart
 // suspension, tyre traces and a little lens feel. Software rendering keeps
 // its measured path: no finish pass and no added draws.
 const cartMotion=createBackNineCartMotion(cart),finish=software?null:createScreenFinish(THREE,renderer,{look:LOOKS.backNine,level:'high'});
 const quality={viewScale:1,shadows:true,effects:true},shadowOwed=new Set(),baseFar=camera.far;let tyreMarks=null,polishTriangles=0,speedFov=0,feelHeave=0,feelApplied=0,polishFrame=0,finishPulse=0,finishFlash=0,photoActive=false;
 const photoPose={yaw:0,pitch:.3,distance:7,fov:55,target:new THREE.Vector3()};
 // The HUD's own dread vignette already darkens the frame edge with tension,
 // so this chapter runs the shared vignette lighter.
 finish?.setLook({vignette:.14});
 function update(run,{rear=false,reducedMotion=false,shake=1,flash=1,pulse=0}={}){
  const cameraSweep=(from,to)=>runnerCameraFraction(from,to,run);
  if(run.mode==='driving'&&(introRun===run?introMode==='briefing':(run.time||0)<.25)){introAt=run.time||0;if(!reducedMotion&&!run.foot)initialized=false;}
  introRun=run;introMode=run.mode;
  const introAge=(run.time||0)-introAt,introLeft=reducedMotion||run.foot||run.death||introAge<0||introAge>=1.8?0:1-introAge/1.8,intro=introLeft*introLeft*(3-2*introLeft);introPose=intro;
  const sealAge=run.mode==='sealing'||run.mode==='complete'?clamp((run.finale?.age||0)/4.8,0,1):0;sealZoom=reducedMotion?0:sealAge*sealAge*(3-2*sealAge);
  nightFx.begin();environmentWind.update(run,reducedMotion);storyArt.update(run,reducedMotion);tracks.update(run);atmospherePose=atmosphere.update(run);approachPose=approach.update(run,reducedMotion);
  if(rear!==lastRear){if(!run.foot)initialized=false;lastRear=rear;}
  const dt=Math.min(.05,Math.max(0,run.time-lastTime));lastTime=run.time;const c=chaseActor(run),j=run.joe,t=run.tension||{},fear=t.intensity||0,ram=ramWindup(run),panic=panicPose(run),commit=commitmentPose(run),rev=Math.max(t.windup||0,ram.charge,commit.load*.9),surge=t.surge||0,dip=reducedMotion?0:(t.lightDip||0)*flash;ramPose=ram;garageMotion.update(run,reducedMotion);sceneryContacts.update(run);greenFlags.update(run,reducedMotion);breakFragments.update(run,reducedMotion);
  for(const [v,s]of [[cart,run.cart],[mower,j]]){v.root.position.set(s.x,terrainHeight(s.x,s.y),-s.y);const slope=terrainSlope(s.x,s.y,s.yaw);v.root.rotation.set(slope.pitch,-s.yaw,slope.roll,'YXZ');v.phase-=dt*s.speed/(v===cart?.36:.57);for(const wheel of v.wheels)wheel.rotation.x=v.phase;v.body.rotation.z=reducedMotion?0:-(s.steer||0)*Math.abs(s.speed)*.003;}
  irrigationState=COURSE.wet.map((w,i)=>({x:w.x,y:w.y,...irrigationPhase(run,i)}));irrigationArt.update(run,c,irrigationState,reducedMotion);ghosts.update(run,c,reducedMotion);clippings.update(run,reducedMotion);experienceArt.update(run,reducedMotion);
  courseFeatures.update(run,reducedMotion);hurdleArt.update(run,reducedMotion);destructionArt.update(run,reducedMotion);
  const hit=run.impact,hitAge=hit?.age??99,recoil=!reducedMotion&&hitAge<.55?Math.sin(hitAge*28)*Math.exp(-hitAge*8)*(hit.strength||0):0;
  const rumble=cartRumble(run),motion=reducedMotion?0:1;rumbleIntensity=rumble.intensity;rumbleMotion=rumble.heave*motion;impactRecoil=-recoil*.12;
  cart.body.position.y=impactRecoil+rumbleMotion;cart.body.rotation.x=-recoil*.028+rumble.pitch*motion;cart.body.rotation.z=clamp(cart.body.rotation.z+rumble.roll*motion,-.048,.048);mower.body.position.y=-recoil*.045-(reducedMotion?0:ram.load*.035);mower.body.rotation.x=-recoil*.014-(reducedMotion?0:ram.load*.018+Math.sin(run.time*55)*ram.load*.002);
  cartImpactPose(run,reducedMotion,impactPose);for(const name of ['pitch','roll'])impactPose[name]*=shake;approachPose.roll*=shake;approachPose.heave*=shake;approachPose.fov*=shake;cart.body.position.y+=impactPose.heave;cart.body.rotation.x+=impactPose.bodyPitch;cart.body.rotation.z+=impactPose.bodyRoll;
  impactSparks.count=!run.death&&!reducedMotion&&hitAge<.38?12:0;
  for(let i=0;i<impactSparks.count;i++){const a=i*2.4,v=.7+noise(i+47)*1.5,t=hitAge,longitudinal=Math.abs(hit.front||0)>Math.abs(hit.side||0),side=i<6?-1:1,sx=longitudinal?side*(.85+v*t):Math.sin(a)*v*t,sz=longitudinal?Math.cos(a)*v*t:side*.4+Math.cos(a)*v*t,yaw=hit.yaw||0;dummy.position.set(hit.x+Math.cos(yaw)*sx+Math.sin(yaw)*sz,.65+(1.1+noise(i)*1.2)*t-5*t*t,-hit.y+Math.sin(yaw)*sx-Math.cos(yaw)*sz);dummy.rotation.set(a+t*8,a,0);dummy.scale.setScalar(1-t/.45);dummy.updateMatrix();impactSparks.setMatrixAt(i,dummy.matrix);}if(impactSparks.count)impactSparks.instanceMatrix.needsUpdate=true;
  const folding=j.ram?.phase==='backoff'||COURSE.checkpoints.some(p=>distance(p,j)<16)||['signal','flank'].includes(run.hunt?.phase);for(let i=0;i<mower.decks.length;i++){const d=mower.decks[i],target=(i-1)*-.85*(ram.active?ram.deckLift:commit.warning?.3+commit.load*.5:folding?1:reducedMotion?0:panic.deckLift);if(ram.active)d.rotation.z=target;else d.rotation.z+=(target-d.rotation.z)*(1-Math.exp(-dt*4));}
  const mouth=mowerMouthTarget(run),center=mower.decks[1];if(mouthRun!==run){mouthRun=run;center.position.y=mouth.height;}else if(run.mode==='paused'){}else if(reducedMotion)center.position.y=mouth.height;else center.position.y+=(mouth.height-center.position.y)*(1-Math.exp(-dt*(mouth.cutting?9:4)));mouthPose={cutting:mouth.cutting,target:mouth.height,height:center.position.y};
  cartMotion.body(run,dt,{reducedMotion,rough:rumble.intensity});
  cart.damage.update(run,reducedMotion,rumble.mechanics);cartMotion.wheels(run);tyreMarks?.update(run);
  mower.mouthCraft.update(run,mouthPose,dt,reducedMotion);
  cart.driver.visible=!run.foot;runner.update(run.foot,dt,reducedMotion,run.death,run.time);if(run.foot)runner.root.position.y+=terrainHeight(runner.root.position.x,-runner.root.position.z);if(!run.foot)runner.seated(cart.driver,run.cart,reducedMotion,run.time);if(!!run.foot!==wasOnFoot){wasOnFoot=!!run.foot;}
  cart.repeated.update();mower.repeated.update();
  riderMotion.update(run,{ram,commit,surge,rev,reducedMotion});
  const footClearance=run.foot?clamp((distance(c,run.cart)-3.5)/4,0,1):1;
  // Briefly widen the escape view so the player sees the collapse while
  // retaining immediate running control and the same movement heading.
  const breakdownView=run.foot&&!rear&&!reducedMotion?clamp((1.8-(run.time-(run.cart.failedAt??-99)))/1.1,0,1):0;
  const breakdownSide=run.foot?.ejection?-run.foot.ejection.side:1;
  // While airborne the physical actor already occupies its validated landing,
  // but the visible body is still leaving the seat. Follow that body so walls
  // cannot sit between the ejection animation and a landing-centred camera.
  const flightView=run.foot?.ejection&&!run.death&&!reducedMotion&&run.time-run.foot.ejection.at<1.18;
  const flightFocus=flightView?clamp((1.18-(run.time-run.foot.ejection.at))/.32,0,1):0;
  runnerViewAnchor.x=flightView?runner.root.position.x:c.x;runnerViewAnchor.y=flightView?-runner.root.position.z:c.y;
  const viewX=runnerViewAnchor.x,viewY=runnerViewAnchor.y,groundHeight=terrainHeight(viewX,viewY);
  const yaw=(run.foot?c.viewYaw:c.yaw)+(rear&&!run.foot?Math.PI:0),follow=run.foot?2.4+2.1*footClearance+3.6*breakdownView:rear?4.8:6.5+intro*3.4,lookAhead=run.foot?.8+1.7*footClearance:7;
  desired.set(viewX-Math.sin(yaw)*follow+Math.cos(yaw)*breakdownView*1.8*breakdownSide,(run.foot?2.7+.6*footClearance+breakdownView*1.1:rear?4.8:4.2+intro*1.7)+approachPose.heave,-viewY+Math.cos(yaw)*follow+Math.sin(yaw)*breakdownView*1.8*breakdownSide);
  desired.y+=groundHeight;
  // Keep Joe's roll cage out of the chase lens during close approaches to
  // the shutter. Pull forward over the cart, preserving the escape view.
  const mowerBehind=!run.foot&&!rear&&(j.x-c.x)*Math.sin(yaw)+(j.y-c.y)*Math.cos(yaw)<-1&&Math.abs((j.x-c.x)*Math.cos(yaw)-(j.y-c.y)*Math.sin(yaw))<3.3&&distance(c,j)<9;
  if(mowerBehind){const safeFollow=Math.max(1.4,distance(c,j)-3.3);desired.x=viewX-Math.sin(yaw)*Math.min(follow,safeFollow);desired.z=-viewY+Math.cos(yaw)*Math.min(follow,safeFollow);}
  const shelterCeiling=shelterCameraCeiling(c);desired.y=Math.min(desired.y,shelterCeiling);
  const chaseSweep=eye=>run.foot?cameraSweep(runnerViewAnchor,{x:eye.x,y:-eye.z}):runnerCameraFraction(c,{x:eye.x,y:-eye.z},run,{from:groundHeight+2.45,to:eye.y});
  cameraClearance=chaseSweep(desired);
  // Near a wall, first seek a clear shoulder view. A straight retraction can
  // put the lens over the cart canopy and conceal the entire escape route.
  if(!run.foot&&!run.death&&cameraClearance<.99&&!mowerBehind){
   let best=-Infinity,bx=desired.x,bz=desired.z,clearance=cameraClearance;
   for(let step=1;step<=11;step++)for(const side of [1,-1]){
    const angle=step*Math.PI/12;
    orbitEye.set(viewX-Math.sin(yaw+angle*side)*follow,desired.y,-viewY+Math.cos(yaw+angle*side)*follow);
    const clear=chaseSweep(orbitEye),travel=initialized?Math.hypot(orbitEye.x-camera.position.x,orbitEye.z-camera.position.z):0;
    // Prefer a clear nearby angle over switching to the opposite shoulder.
    const score=(clear===1?100:clear*20)-travel-angle*.2;
    if(score>best){best=score;clearance=clear;bx=orbitEye.x;bz=orbitEye.z;}
   }
   if(clearance>cameraClearance+.01){cameraClearance=clearance;desired.x=bx;desired.z=bz;}
  }
  desired.x=viewX+(desired.x-viewX)*cameraClearance;desired.z=-viewY+(desired.z+viewY)*cameraClearance;
  if(run.foot)desired.y=groundHeight+1.85+(desired.y-groundHeight-1.85)*(cameraClearance+(1-cameraClearance)*flightFocus);
  camera.position.y-=feelApplied;feelApplied=0;
  if(!run.death){if(!initialized||reducedMotion&&run.foot||run.foot&&cameraClearance<.99||mowerBehind&&Math.hypot(camera.position.x-j.x,camera.position.z+j.y)<3.3)camera.position.copy(desired);else if(run.foot)camera.position.lerp(desired,1-Math.exp(-dt*8));else trackCartCamera(camera.position,desired,c,dt,chaseSweep);}
  // A clear desired eye does not guarantee that smoothing around a corner
  // keeps the actual lens clear. Constrain the presented eye every frame.
  if(!run.death){const clear=chaseSweep(camera.position);cameraClearance=Math.min(cameraClearance,clear);camera.position.x=viewX+(camera.position.x-viewX)*clear;camera.position.z=-viewY+(camera.position.z+viewY)*clear;camera.position.y=Math.max(camera.position.y,terrainHeight(camera.position.x,-camera.position.z)+.45);}
  if(!run.death)camera.position.y=Math.min(camera.position.y,shelterCeiling);
  // Lens feel, scaled by the Camera shake preference and absent under
  // Reduced motion: a slight widening at speed, a small stride bob and a
  // landing dip on foot. Applied as a removable offset so the follow
  // smoothing never integrates it.
  {const still=reducedMotion||run.death||run.mode!=='driving',v=Math.abs(c.speed||0),want=still||run.foot||rear?0:clamp((v-6)/5,0,1)*4.5*shake;speedFov+=(want-speedFov)*(1-Math.exp(-dt*3));
   const landAge=run.foot?.ejection?run.time-run.foot.ejection.at-1.18:-1;
   feelHeave=still||!run.foot?0:(Math.sin(run.time*11.5)*.016*clamp(v/6,0,1)-(landAge>=0&&landAge<.42?Math.sin(landAge/.42*Math.PI)*.11:0))*shake;
   camera.position.y+=feelHeave;feelApplied=feelHeave;}
  // Aim the automatic foot camera through the player at chest height. A fixed
  // mouse-look pitch cropped the legs whenever the camera moved near the wreck.
  // Side views aim closer to the cart so the vehicle and forward route both
  // fit the frame. Open-road camera composition retains its original aim.
  const cartSide=clamp(Math.abs((camera.position.x-viewX)*Math.cos(yaw)+(camera.position.z+viewY)*Math.sin(yaw))/follow,0,1),cartAimAhead=lookAhead*(1-.78*cartSide);
  look.set(c.x+Math.sin(yaw)*(run.foot?lookAhead:cartAimAhead),groundHeight+(run.foot?1.2:rear?1.15:2.3),-c.y-Math.cos(yaw)*(run.foot?lookAhead:cartAimAhead));if(run.foot){const view=yaw+Math.PI*(reducedMotion?Number(rear):(c.rearBlend||0)),aimDistance=Math.max(2.4,Math.hypot(camera.position.x-viewX,camera.position.z+viewY)+lookAhead),aimDrop=(camera.position.y-groundHeight-1.2)*8/aimDistance;look.set(camera.position.x+Math.sin(view)*8,camera.position.y-aimDrop-(c.viewPitch||0)*8,camera.position.z-Math.cos(view)*8);}if(!initialized||reducedMotion||run.foot||cameraClearance<.99)cameraTarget.copy(look);else cameraTarget.lerp(look,1-Math.exp(-dt*10));if(flightView&&!rear){look.set(viewX,runner.root.position.y+1,-viewY);cameraTarget.lerp(look,flightFocus);}camera.lookAt(cameraTarget);if(run.foot&&!run.death)runner.root.visible=Math.hypot(camera.position.x-c.x,camera.position.z+c.y)>1.1;camera.rotateZ(approachPose.roll*(rear?-1:1));initialized=true;
  const missAge=run.time-(run.experience?.nearMiss.at??-99),missKick=!reducedMotion&&missAge>=0&&missAge<.5?Math.sin(missAge*22)*Math.exp(-missAge*9)*.008*shake*(run.experience.nearMiss.side||1):0;camera.rotateZ(missKick);
  camera.rotateX(impactPose.pitch*(rear?-1:1));camera.rotateZ(impactPose.roll*(rear?-1:1));
  if(!run.death)presentedDeath=null;
  if(run.death){const d=run.death;if(presentedDeath!==d){presentedDeath=d;deathCameraStart.copy(camera.position);presentedDeathSide=runoverCameraSide(d,cameraSweep);}const a=d.yaw,p=runoverPose(reducedMotion?d.age:lingerAge(d.age),reducedMotion,deathPose);p.side=(6+(p.side-6)*shake)*presentedDeathSide;p.height=4.2+(p.height-4.2)*shake;p.roll*=shake;p.fov=64+(p.fov-64)*shake;desired.set(d.x+Math.cos(a)*p.side-Math.sin(a)*p.behind,p.height+terrainHeight(d.x,d.y),-d.y+Math.sin(a)*p.side+Math.cos(a)*p.behind);desired.y=Math.min(desired.y,shelterCeiling);const clear=cameraSweep(d,{x:desired.x,y:-desired.z});desired.x=d.x+(desired.x-d.x)*clear;desired.z=-d.y+(desired.z+d.y)*clear;const enter=clamp(d.age/.4,0,1),blend=enter*enter*(3-2*enter);if(reducedMotion)camera.position.copy(desired);else camera.position.lerpVectors(deathCameraStart,desired,blend);const entryClear=cameraSweep(d,{x:camera.position.x,y:-camera.position.z});camera.position.x=d.x+(camera.position.x-d.x)*entryClear;camera.position.z=-d.y+(camera.position.z+d.y)*entryClear;cameraTarget.set(d.x+Math.sin(a)*.4,.65+terrainHeight(d.x,d.y),-d.y-Math.cos(a)*.4);camera.lookAt(cameraTarget);camera.rotateZ(p.roll);}
  const slowLeft=run.death&&!reducedMotion?1-clamp((run.death.age-.3)/.65,0,1):0;captureSlow=slowLeft*slowLeft*(3-2*slowLeft);
  const fov=run.death?deathPose.fov-captureSlow*3.5*shake:64+approachPose.fov+intro*6-sealZoom*7+speedFov;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  if(run.mode==='sealing'||run.mode==='complete'){const blend=reducedMotion||run.mode==='complete'?1:clamp((run.finale?.age||0)/.8,0,1);desired.set(-26,3.3,-811.5);camera.position.lerp(desired,blend);look.set(-23,1.5,-799);cameraTarget.lerp(look,blend);camera.lookAt(cameraTarget);}
  headlights.update(run,cart,mower,runner);
  // Slow circuit sag travels behind the cart. Road lamps retain a readable
  // minimum, while shelter/garage and player headlights stay fully powered.
  for(const light of roadLights){const behind=clamp((c.y-light.y+30)/60,0,1);light.material.color.setHex(0xe4c88e).multiplyScalar(Math.max(.68,1-dip*(.35+.6*behind)));}
  practicalLights.update(c,dip,garageOpening(run));
  // Electrical faults belong to two identifiable service fixtures. Gate and
  // foot-route lanterns keep a readable floor; they do not inherit the fault.
  for(let i=0;i<2;i++)materials['faultLamp'+i].color.setHex(i?0xb1c5bd:0xc6b379).multiplyScalar(lampFlicker(run.time,COURSE_LANDMARKS[i].fault,flash,reducedMotion));
  materials.windowLamp.color.setHex(0xe4c88e).multiplyScalar((c.y>620?1-dip*.95:1)*lampFlicker(run.time,811,flash*.45,reducedMotion));
  materials.mowerLamp.color.setRGB(1,.62-rev*.16,.3-rev*.12).multiplyScalar((1+ram.load*.25)*(reducedMotion||ram.active?1:1+(panic.lamps-1)*flash));
  // Low-lying water sections carry denser, cool haze. This uses the existing
  // fog uniforms: no translucent layers, extra lights or particle overdraw.
  const valley=Math.max(Math.exp(-(((c.y-238)/43)**4)),Math.exp(-(((c.y-467)/52)**4)));
  const shadow=reducedMotion?0:atmospherePose.shadow*flash;hemi.intensity=.43-dip*.025-shadow*.10;moon.intensity=.72-shadow*.35-valley*.07;scene.fog.color.copy(dryFog).lerp(valleyFog,valley);scene.fog.near=((software?40:54)-dip*4-valley*9)*quality.viewScale;scene.fog.far=((software?92:120)-valley*8)*quality.viewScale;
  nightShadows.update(c,run.time,reducedMotion);
  // Actual course geometry blocks the broad roof beacon. Losing player sight
  // no longer dims the whole world indiscriminately.
  beaconPose=mowerBeacon(run.time,flash,reducedMotion);
  // The old lamp fell below the terrain's moonlit floor a few metres away.
  // A stronger source makes its approach readable across a service lane;
  // physical cover now confines that light instead of washing through walls.
  beaconPose.power*=3*(experienceMotor(run)===0?.12:1);
  materials.siren.color.setRGB(1,.018,.006).multiplyScalar(beaconPose.lens);
  mowerLight.color.copy(beaconRed);
  mowerLight.position.set(j.x-.74*Math.cos(j.yaw)-.45*Math.sin(j.yaw),3.45+terrainHeight(j.x,j.y),-j.y-.74*Math.sin(j.yaw)+.45*Math.cos(j.yaw));
  mowerLight.intensity=beaconPose.power*clamp((75-distance(c,j))/20,0,1);beaconShadows.update(run.time);
  courseDetail.update(run,reducedMotion,j,headlamp,mowerLight,headlights.mower);
  beaconPose.range=mowerLight.distance;beaconPose.intensity=mowerLight.intensity;
  // Low quality refreshes the three lamp shadow maps on every third frame.
  // A skipped refresh is owed, so a lamp that stops never keeps a stale map.
  polishFrame++;if(!quality.shadows)for(const light of localSources){if(!light.shadow||!light.castShadow)continue;if(light.shadow.needsUpdate)shadowOwed.add(light);if(polishFrame%3)light.shadow.needsUpdate=false;else if(shadowOwed.delete(light))light.shadow.needsUpdate=true;}
  if(finish){const driving=run.mode==='driving',struck=driving&&hit?.damaged&&hitAge<.14&&!reducedMotion?(1-hitAge/.14)*.15*(hit.strength||0)*flash:0;finishPulse=driving&&!reducedMotion?clamp(pulse,0,1)*flash:0;finishFlash=struck;
   finish.setReduced(reducedMotion);finish.setTension(driving||run.mode==='dying'?fear:0);finish.setPulse(finishPulse);finish.setFlash(struck,0xff7a48);}
  // The seated skeleton disables per-mesh culling because its rest bounds
  // do not follow the bones. A generous whole-vehicle sphere includes Joe,
  // the folding decks, wheels, impact recoil and windup without freezing them.
  camera.updateMatrixWorld();vehicleFrustum.setFromProjectionMatrix(vehicleProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  mowerBounds.center.set(j.x,2,-j.y);mower.root.visible=vehicleFrustum.intersectsSphere(mowerBounds);
  contactShadows.update(run);localMist.update(run,reducedMotion,headlights);windbreakArt.update(run,reducedMotion);
  fxFrame.actor=c;fxFrame.joe=j;fxFrame.reducedMotion=reducedMotion;fxFrame.dip=dip;fxFrame.beacon=beaconPose;fxFrame.headlights=headlights;fxFrame.fog=scene.fog;fxFrame.timeScale=1-.85*captureSlow;fxFrame.impact=null;fxFrame.effects=quality.effects;
  if(run.death&&!reducedMotion&&flash>0){captureImpact.x=run.death.x;captureImpact.y=run.death.y;captureImpact.h=terrainHeight(run.death.x,run.death.y);captureImpact.age=run.death.age;captureImpact.power=Math.min(1,flash);fxFrame.impact=captureImpact;}
  nightFx.update(run,fxFrame);
  riderCulling.update();staffSighting.update(run,camera);
  if(software)renderer.getDrawingBufferSize(rasterSize);
  batchCulling.update(camera,rasterSize.x,rasterSize.y);
  localLights?.update(localSources);pines.update(camera,localSources);backdrop.update(camera,run.time,reducedMotion,run.mode!=='driving');
  // The visible cloud field, independent of camera yaw, attenuates moonlight.
  // Keep diffuse night fill and the terrain's readability floor intact.
  moon.intensity*=1-backdrop.moonCoverage()*.32;hemi.intensity*=1-backdrop.moonCoverage()*.06;
  // Tire spray has its own bounded pool; sprinkler drops/impacts are owned
  // by irrigation art and follow the same authoritative wet/dry state.
  // Water keeps moving under Reduced motion; only the camera is calmed.
  const tireSpray=!run.foot&&c.surface==='wet'&&Math.abs(c.speed)>3;let count=0;
  if(tireSpray)for(let i=0;i<28;i++){const t=(run.time*(2.3+(i%5)*.22)+i*.618)%1,side=i%2?1:-1,x=side*(.8+t*(.5+(i%7)*.14)),z=Math.sign(c.speed)*(.9+t*Math.min(3.4,Math.abs(c.speed)*(.12+(i%4)*.04)));dummy.position.set(c.x+Math.cos(c.yaw)*x-Math.sin(c.yaw)*z,terrainHeight(c.x,c.y)+.13+Math.sin(t*Math.PI)*.65,-c.y+Math.sin(c.yaw)*x+Math.cos(c.yaw)*z);dummy.rotation.set(0,-c.yaw,side*.6);dummy.scale.set(3,1.8+t*3,3).multiplyScalar(1-t*.55);dummy.updateMatrix();spray.setMatrixAt(count++,dummy.matrix);}spray.count=count;spray.visible=count>0;if(count){spray.instanceMatrix.needsUpdate=true;spray.computeBoundingSphere();}
 }
 update({time:0,cart:{...COURSE.start,yaw:0,speed:0},joe:{x:0,y:3,yaw:0,speed:0}});
 await Art.source('rough-cut-verge-atlas-v1');pines.warm();tracks.warm();clippings.warm();experienceArt.warm();irrigationArt.warm();nightFx.warm();
 // Prepare distant roofs/foliage before driving in bounded upload batches.
 // Otherwise the first rear view can upload several atlases at once.
 // Custom shader samplers are not discoverable through material.map. Include
 // both turf inputs in the staged upload queue before warming draw buffers.
 const maps=new Set([...backdrop.textures,...courseDetail.textures,...practicalLights.textures,scarSoilMap,dryTurfMap,turfConditionField]);for(const root of [scene,backdrop.scene])root.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.map)maps.add(m.map);});

 if(localLights){
  // The source geometry also participates in paced preparation. Equivalent Lambert programs
  // and attribute layouts need only one extra preparation draw per variant.
  const layouts=new Set();for(const proxy of [...localLights.preparation.children]){const m=proxy.material,g=proxy.geometry,key=[m.customProgramCacheKey(),m.side,!!m.map,m.map?.colorSpace,m.map?.channel,m.alphaTest>0,m.vertexColors,m.flatShading,m.transparent,m.toneMapped,g.index.array.constructor.name,Object.entries(g.attributes).map(([n,a])=>n+':'+a.itemSize+':'+a.array.constructor.name+':'+a.normalized).join(',')].join('|');if(layouts.has(key))localLights.preparation.remove(proxy);else layouts.add(key);}
  scene.add(localLights.preparation);
 }
 // Deduplication removes redundant preparation proxies, not their dormant
 // material variants. Give every variant the same lighting specialization,
 // so first use after a driving/foot transition reuses its prepared program.
 if(software){const lit=new Set([...Object.values(materials),...(localLights?.allMaterials()||[]),...pines.allMaterials()]);scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)lit.add(m);});for(const m of lit)specializeQuadraticLights(m,localSources);}
 scene.traverse(o=>{if(o.isMesh&&o.layers.test(camera.layers))o.receiveShadow=true;});
 // Include dormant light-culling variants, not only the representatives kept
 // for warm-up. They must share the prepared key on their first visible use.
 const shadowMaterials=new Set([...Object.values(materials),...(localLights?.allMaterials()||[]),...pines.allMaterials()]);scene.traverse(o=>{for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m)shadowMaterials.add(m);});for(const m of shadowMaterials){skipUnlitBeaconLookups(m);finishBackNineBeacon(m);finishHeadlightGround(m,software);localMist.finish(m);practicalLights.apply(m);}
 // Rain sheen goes on last so it can read every earlier ground finish. The
 // software path keeps its ground shaders exactly as they were.
 if(!software){for(const name of ['road','track','trackMargin','pathEdge'])if(finishWetSheen(materials[name],nightFx.lamps,nightFx.wetTime,1))wetSheenMaterials++;for(const name of ['grass','mown','turfMargin','soilMargin','rough'])if(finishWetSheen(materials[name],nightFx.lamps,nightFx.wetTime,.5))wetSheenMaterials++;}
 if(!software){tyreMarks=createBackNineTyreMarks(scene);tyreMarks.warm();}
 const instanceCulling=software?(/swiftshader/i.test(rendererInfo?context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL):'')?createRigidVertexBatches(scene):createRigidInstanceCulling(scene)):null;instanceCulling?.update(camera);
 releaseBakedContours();
 const programsReady=(async()=>{await renderer.compileAsync(backdrop.scene,backdrop.camera);await renderer.compileAsync(scene,camera);})();programsReady.catch(()=>{});
 const texturePreparation=await prepareCourseTextures(renderer,maps,()=>closed);await programsReady;onProgress('Preparing course details…');preparation=await prepareCourseBuffers(renderer,scene,camera,()=>closed);const skyPreparation=await prepareCourseBuffers(renderer,backdrop.scene,backdrop.camera,()=>closed);preparation.textures=texturePreparation;preparation.surfaces=surfaces.stats();preparation.batches+=skyPreparation.batches;preparation.maxBytes=Math.max(preparation.maxBytes,skyPreparation.maxBytes);if(localLights)scene.remove(localLights.preparation);pines.finishWarm();tracks.finishWarm();courseFeatures.finishWarm();staffSighting.finishWarm();pines.update(camera,localSources);if(closed)throw new Error('Level closed');beaconShadows.warm(renderer,camera);await waitForGPU(renderer,()=>closed);
 const runoverVisible=()=>wasOnFoot&&runner.root.visible&&presentedDeath!==null;
 return {scene,camera,update,draw(){
  instanceCulling?.update(camera);
  // Loading and resize can change the target between update and presentation.
  // Sample coverage must use the actual framebuffer, even for that first draw.
  if(software){const gl=renderer.getContext();if(rasterSize.x!==gl.drawingBufferWidth||rasterSize.y!==gl.drawingBufferHeight){rasterSize.set(gl.drawingBufferWidth,gl.drawingBufferHeight);batchCulling.update(camera,rasterSize.x,rasterSize.y);}}
  renderer.autoClear=false;renderer.clear();const scissored=renderer.getScissorTest();renderer.getSize(skySize);skySkippedRows=skyCoverage&&!scissored?skyCoverage.rows(camera,skySize.y):0;
  if(skySkippedRows){renderer.getScissor(skyScissor);renderer.setScissor(0,skySkippedRows,skySize.x,skySize.y-skySkippedRows);renderer.setScissorTest(true);}
  renderer.render(backdrop.scene,backdrop.camera);const backgroundDraws=renderer.info.render.calls;
  if(skySkippedRows){renderer.setScissor(skyScissor);renderer.setScissorTest(scissored);}
  renderer.clearDepth();renderer.render(scene,camera);renderer.autoClear=true;drawCalls=backgroundDraws+renderer.info.render.calls;polishTriangles=renderer.info.render.triangles;
   // The finished frame is copied and redrawn through the grade. Its own
   // passes are not counted in the scene's draw statistics above.
   finish?.apply();},
  // Quality preset knobs: finish level, fog/draw distance, lamp shadow refresh
  // and decorative effects. Programs never change, so nothing recompiles.
  setQuality(preset,{grain=true}={}){quality.viewScale=preset.viewScale;quality.shadows=preset.shadows;quality.effects=preset.effects;finish?.setLevel(preset.finish);finish?.setLook({grain:grain?LOOKS.backNine.grain:0});
   camera.far=baseFar*preset.viewScale;camera.updateProjectionMatrix();tyreMarks?.setEnabled(preset.effects);if(preset.shadows)for(const light of shadowOwed){light.shadow.needsUpdate=true;shadowOwed.delete(light);}},
  // Photo mode: a free orbit around the paused scene. Nothing is simulated;
  // leaving it resets the chase camera.
  photo:{
   begin(run){const c=chaseActor(run);photoActive=true;photoPose.target.set(c.x,terrainHeight(c.x,c.y)+1.3,-c.y);const dx=camera.position.x-photoPose.target.x,dy=camera.position.y-photoPose.target.y,dz=camera.position.z-photoPose.target.z,span=Math.max(.1,Math.hypot(dx,dy,dz));
    photoPose.distance=clamp(span,2.5,14);photoPose.yaw=Math.atan2(dx,dz);photoPose.pitch=clamp(Math.asin(clamp(dy/span,-1,1)),-.1,1.2);photoPose.fov=55;this.apply();},
   look(dx,dy){photoPose.yaw-=dx*.006;photoPose.pitch=clamp(photoPose.pitch+dy*.005,-.12,1.3);this.apply();},
   zoom(sign){photoPose.distance=clamp(photoPose.distance*(sign>0?1.12:.89),1.8,22);this.apply();},
   move(x,y,dt){const s=Math.sin(photoPose.yaw),k=Math.cos(photoPose.yaw),step=6*dt;photoPose.target.x+=(x*k-y*s)*step;photoPose.target.z+=(-x*s-y*k)*step;photoPose.target.y=terrainHeight(photoPose.target.x,-photoPose.target.z)+1.3;this.apply();},
   apply(){const p=photoPose,flat=Math.cos(p.pitch)*p.distance;camera.position.set(p.target.x+Math.sin(p.yaw)*flat,p.target.y+Math.sin(p.pitch)*p.distance,p.target.z+Math.cos(p.yaw)*flat);
    camera.position.y=Math.max(camera.position.y,terrainHeight(camera.position.x,-camera.position.z)+.35);camera.lookAt(p.target);if(camera.fov!==p.fov){camera.fov=p.fov;camera.updateProjectionMatrix();}camera.updateMatrixWorld();batchCulling.update(camera,rasterSize.x,rasterSize.y);pines.update(camera,localSources);},
   end(){photoActive=false;initialized=false;feelApplied=0;},
   get active(){return photoActive;}},
  finish,staffSightingActive:()=>staffSighting.active(),drainRunnerContacts(){return runner.drainContacts();},resetCamera(){initialized=false;},stats:()=>({instanceCulling:instanceCulling?.stats(),wind:environmentWind.stats(),encounterVistas,breakFragments:breakFragments.stats(),greenFlags:greenFlags.stats(),sceneryContacts:sceneryContacts.stats(),garageMotion:garageMotion.stats(),practicalLights:practicalLights.stats(),windbreakArt:windbreakArt.stats(),localMist:localMist.stats(),turfCondition:{areas:TURF_CONDITION_AREAS.length,dryMap:'back-nine-weathered-turf-v1',fieldBytes:turfConditionField.image.data.byteLength,worldField:true},contactShadows:contactShadows.stats(),routeMargins:routeMargins.stats(),districtScenery,architecture,experience:experienceArt.stats(),courseDetail:courseDetail.stats(),mowerClippings:clippings.stats(),irrigation:irrigationState,irrigationArt:irrigationArt.stats(),nightFx:nightFx.stats(),transitions:{intro:introPose,sealZoom,captureSlow},weather:{drizzle:true,wetSheenMaterials,gameplay:false},tireSpray:{active:spray.count,capacity:32},ghosts:ghosts.stats(),terrain:{forms:TERRAIN_FORMS.length,cartHeight:cart.root.position.y,joeHeight:mower.root.position.y,runnerHeight:runner.root.position.y},destruction:destructionArt.stats(),mowerMouth:{...mouthPose,mechanism:mower.mouthCraft.stats()},riderCulling:riderCulling.stats(),shiftRecords:shiftRecords.stats(),staffSighting:staffSighting.stats(),beaconShadows:beaconShadows.stats(),headlights:headlights.stats(),landmarks,routeClues,alarmMeters:alarmMeters.map(m=>m.bars),serviceMeters:storyArt.stats(),cameraHeight:camera.position.y,nightShadows:nightShadows.stats(),skySkippedRows,landscape:{...landscape,lanterns:lanterns.length},atmosphere:{...atmospherePose},mowerTracks:tracks.stats(),beacon:{...beaconPose},cameraClearance,courseFeatures:courseFeatures.count,destructibleFeatures:courseFeatures.stats(),impactFeedback:{...impactPose},cartDamage:cart.damage.stats(),pursuitFeedback:{...approachPose},runOver:runoverVisible(),runOverCamera:runner.root.visible&&runoverVisible()?{...deathPose}:null,onFoot:runner.root.visible&&wasOnFoot,ejection:runner.stats(),localLights:localLights?.stats(),vehicleInstancing:{batches:cart.repeated.batches+mower.repeated.batches,savedDraws:cart.repeated.savedDraws+mower.repeated.savedDraws},mowerVisible:mower.root.visible,batchCulling:batchCulling.stats(),preparation,rider:!!rider,riderMotion:riderMotion.stats(),horrorLights:3,ramWindup:ramPose,hurdlePieces:hurdleArt.stats().pieces,hurdleUploads:hurdleArt.stats().uploads,impactParticles:impactSparks.count,impactRecoil,cartRumble:rumbleIntensity,cartRumbleHeave:rumbleMotion,cartBodyRoll:cart.body.rotation.z,artStyle:'shared-level-one',parallax:backdrop.stats(),pines:pines.stats(),roadLampBatches:roadLights.length,staticBatches:batches.size,programs:renderer.info.programs.length,textures:renderer.info.memory.textures,draws:drawCalls,triangles:finish?polishTriangles:renderer.info.render.triangles,polish:{finish:finish?{level:finish.level,applied:finish.applied,pulse:finishPulse,flash:finishFlash}:null,quality:{...quality,far:camera.far},cartMotion:cartMotion.stats(),tyreMarks:tyreMarks?.stats()||null,speedFov,heave:feelHeave}}),dispose(){closed=true;finish?.dispose();tyreMarks?.dispose();instanceCulling?.dispose();garageMotion.dispose();sceneryContacts.dispose();greenFlags.dispose();breakFragments.dispose();practicalLights.dispose();contactShadows.dispose();courseDetail.dispose();scarSoilMap.dispose();turfConditionField.dispose();mower.mouthCraft.dispose();mower.finish.dispose();irrigationArt.dispose();nightFx.dispose();experienceArt.dispose();clippings.dispose();ghosts.dispose();shiftRecords.dispose();staffSighting.dispose();headlights.dispose();beaconShadows.dispose();hurdleArt.dispose();destructionArt.dispose();nightShadows.dispose();tracks.dispose();runner.dispose();localLights?.dispose();cart.repeated.dispose();mower.repeated.dispose();backdrop.dispose();pines.dispose();surfaces.dispose();scene.traverse(o=>{o.geometry?.dispose();});Object.values(materials).forEach(m=>m.dispose());roadLights.forEach(l=>l.material.dispose());}};
}
