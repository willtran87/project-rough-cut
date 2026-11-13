import {createExperienceArt} from './chase-experience-art.js';
import {experienceMotor} from './chase-experience.js';
import {addChaseVehicleCraft} from './chase-feature-craft.js';
import {buildCourseDetail} from './chase-course-detail.js';
import {createMowerClippings} from './chase-mower-clippings.js';
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
import {shelterCameraCeiling} from './chase-camera.js';
import {roundedCourseRoute,courseRibbonAsync,coursePatch,bunkerLip,buildEstateGroundAsync,buildBunkerRouteEdges,COURSE_RESERVOIRS} from './back-nine-landscape.js';
import {createCourseSkyCoverage} from './course-sky-coverage.js';
import {createChaseAtmosphere} from './chase-atmosphere.js';
import {panelLoft,vehicleTireGeometry,addWheelCraft,addVehicleCraft,addDeckCraft} from './vehicle-craft.js';
import {specializeQuadraticLights} from './quadratic-light-material.js';
import {createMowerTracks} from './mower-tracks.js';
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
import {waitForGPU} from './render-preparation.js';
import {createLocalLightCulling} from './local-light-culling.js';
import {commitmentPose} from './chase-commitments.js';
import {instanceVehicleParts} from './repeated-vehicle-parts.js';
import {skinInfluenceMask,specializeSkinning} from './skin-influences.js';
import {createCourseBatchCulling} from './course-batch-culling.js';
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
import {createCoursePines,loadCoursePineGeometry} from './course-pines.js';
import {COURSE,noise,clamp,distance,angleDelta,surfaceAt,lineClear} from './back-nine-course.js';

export async function createChaseScene(renderer,software,onProgress=()=>{}){
 const yieldCpuPreparation=createCourseConstructionYield();
 const skyCoverage=software?createCourseSkyCoverage():null,skySize=new THREE.Vector2(),skyScissor=new THREE.Vector4();let skySkippedRows=0;
 const batchCulling=createCourseBatchCulling(),localLights=software?createLocalLightCulling():null;
 let preparation={};
 const scene=new THREE.Scene();scene.background=null;scene.fog=new THREE.Fog(0x03080e,software?42:58,software?92:120);
 const beaconShadows=createChaseBeaconShadows(scene);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.BasicShadowMap;
 const dryFog=new THREE.Color(0x03080e),valleyFog=new THREE.Color(0x08131a);
 const camera=new THREE.PerspectiveCamera(64,16/9,.1,software?110:145),materials={},batches=new Map(),roadLights=[],pinePlacements=[];
 // Fetch/decode independent assets while the course is built; GPU uploads
 // still use the bounded preparation queue below.
 const loader=new GLTFLoader();let decodeQueue=Promise.resolve();loader.register(parser=>{const load=parser.loadTextureImage.bind(parser);parser.loadTextureImage=(...args)=>{const next=decodeQueue.then(async()=>{await new Promise(r=>setTimeout(r,8));return load(...args);});decodeQueue=next;return next;};return {name:'RIDER_cooperative_decode'};});

 const pineAsset=loadCoursePineGeometry();pineAsset.catch(()=>{});
 Art.source('rough-cut-needle-sprays-v1');Art.source('rough-cut-verge-atlas-v1');
 const riderAsset=loader.loadAsync('./assets/models/joe-riding-pixel.glb');riderAsset.catch(()=>{});
 const surfaceAssets=loadBakedCourseSurfaces();surfaceAssets.catch(()=>{});
 const backdrop=createParallax({travelScale:.08,showEstate:false,storm:.97,night:.92});
 const groundMap=Art.texture('rough-cut-course-ground-v4',[600,650,256,256],null,true);
 const stoneMap=Art.texture('rough-cut-architecture-surfaces-v1',[1024,0,512,512],null,true);
 const woodMap=Art.texture('rough-cut-architecture-surfaces-v1',[0,0,512,512],null,true);
 const leafMap=Art.texture('rough-cut-hedge-hide-v2',[280,275,190,190],null,true);
 const slateMap=Art.texture('rough-cut-architecture-surfaces-v1',[512,512,512,512],null,true);
 await Promise.all(['rough-cut-course-ground-v4','rough-cut-architecture-surfaces-v1','rough-cut-night-sky-v2','rough-cut-moon-v1','rough-cut-cloud-atlas-v2','rough-cut-far-ridge-v1','rough-cut-distant-treeline-v1','rough-cut-hedge-hide-v2'].map(Art.source));
 const surfaces=await surfaceAssets;
 function mat(name,color,map=null,unlit=false){const m=unlit?new THREE.MeshBasicMaterial({color,map}):new THREE.MeshLambertMaterial({color,map});if(!unlit){m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.65));');s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',(name==='grass'?'#ifdef USE_COLOR\noutgoingLight=max(outgoingLight,vColor.rgb*vec3(.06,.065,.055)+diffuseColor.rgb*.045);\n#endif\n':'')+'vec3 pixelShade=floor(sqrt(max(outgoingLight,vec3(0.0)))*48.0+.5)/48.0;outgoingLight=pixelShade*pixelShade;\n#include <opaque_fragment>');};m.customProgramCacheKey=()=> 'back-nine-shared-pixel-surfaces'+(name==='grass'?'-turf-fill':'');}materials[name]=m;return m;}
 mat('fairway',0x687e5b,groundMap);mat('fairwayCut',0x718563,groundMap);mat('green',0x819279,groundMap);mat('grass',0x455b43,groundMap);mat('track',0x807c64,surfaces.texture('stone'));mat('rough',0x475c43,groundMap);mat('road',0x68746e,surfaces.texture('stone'));mat('pathEdge',0x53654b,groundMap);mat('stone',0xb2bdb7,surfaces.texture('stone'));mat('masonry',0xb2bdb7,stoneMap);mat('wood',0xaaa58c,surfaces.texture('wood'));mat('weatherboard',0xa8b1ae,woodMap);mat('roof',0xb6c5cb,slateMap);mat('leaf',0x9bb5a4,leafMap);mat('sand',0xb7ae93,surfaces.texture('sand'));mat('wet',0x405d58,groundMap);
 // Keep ground shoulders legible under the same moonlit turf fill.
 materials.wet.emissive.setRGB(.003,.006,.005);materials.rough.emissive.setRGB(.006,.008,.004);materials.pathEdge.emissive.setRGB(.009,.011,.006);
 mat('stucco',0xb2b9ac,surfaces.texture('plaster'));mat('paint',0xc0c8ca,surfaces.texture('cart-enamel'));mat('mower',0x8caa91,surfaces.texture('paint'));mat('rust',0xbca285,surfaces.texture('rust'));mat('iron',0xa1a59b,surfaces.texture('iron'));mat('rubber',0x728476,surfaces.texture('rubber'));mat('seat',0x758475,surfaces.texture('rubber'));mat('brass',0xbca66b,surfaces.texture('brass'));mat('lamp',0xe4c88e,null,true);mat('red',0x963f2f,null,true);mat('sheen',0x506e66,null,true);mat('cloth',0x405259);mat('skin',0xb7a489);mat('hair',0x201d18);mat('flag',0x977f57);mat('pathLamp',0xe4c88e,null,true);mat('windowLamp',0xe4c88e,null,true);mat('mowerLamp',0xf2bd72,null,true);
 mat('faultLamp0',0xc6b379,null,true);mat('faultLamp1',0xb1c5bd,null,true);
 mat('clockFace',0x718171,null,true);
 const unitBox=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
 // Turf shares one material batch; baked vertex tints preserve different cuts
 // without a separate draw submission for every fairway/green in view.
 const turfColors=Object.fromEntries(['grass','fairway','fairwayCut','green'].map(k=>[k,materials[k].color.clone()]));
 materials.grass.color.setHex(0xffffff);materials.grass.vertexColors=true;
 mat('siren',0xff2918,null,true);mat('mown',0x475c4b,groundMap);
 // Match the turf's low moonlit floor so fresh cuts do not become black
 // trenches. Reuse the Lambert emissive uniform, with no shader/map variant.
 materials.mown.emissive.setRGB(.004,.006,.0035);
 const tracks=createMowerTracks(scene,materials.mown);
 const alarmMeters=[];
 function put(g,type,x,y,z,sx=1,sy=1,sz=1,ry=0,parent=null){
  if(parent){const m=new THREE.Mesh(g,materials[type]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=ry;parent.add(m);return m;}
  // Larger material batches reduce software-driver submissions; per-piece
  // index culling still removes offscreen geometry. Keep lamp circuit cells.
  const ground=['grass','fairway','fairwayCut','green','rough','road','pathEdge','track','sand','wet'].includes(type);
  const batchType=turfColors[type]?'grass':type,key=batchType+':'+Math.floor(-z/(type==='pathLamp'?48:type==='plantCourse'?32:192));if(!batches.has(key))batches.set(key,{material:materials[batchType],geometries:[]});
  dummy.position.set(x,y+(ground?0:terrainHeight(x,-z)),z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,ry,0);dummy.updateMatrix();let copy=g.clone();copy.applyMatrix4(dummy.matrix);if(ground){const flat=copy;copy=contourGround(THREE,flat);flat.dispose();}if(!type.startsWith('plant'))projectUV(copy,type);
  if(turfColors[type]&&!copy.attributes.color){const c=turfColors[type],colors=new Float32Array(copy.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=c.r**.65;colors[i+1]=c.g**.65;colors[i+2]=c.b**.65;}copy.setAttribute('color',new THREE.BufferAttribute(colors,3));}
  if(!ground)beaconShadows.collect(copy,materials[type]);batches.get(key).geometries.push(copy);
 }
 function projectUV(g,type){const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,scale={grass:1.7,fairway:1.7,fairwayCut:1.7,green:2.2,rough:2.6,road:1.4,pathEdge:1.7,masonry:1.7,weatherboard:1.05,roof:1.2,leaf:.7}[type]||.7;if(!u)return;for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));u.setXY(i,(x>y&&x>z?p.getZ(i):p.getX(i))/scale,(y>x&&y>z?p.getZ(i):p.getY(i))/scale);}}
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
  await courseRibbonAsync(yieldCpuPreparation,THREE,put,'pathEdge',rounded,Math.max(6,width+.5),.03);
  if(paved)await courseRibbonAsync(yieldCpuPreparation,THREE,put,'road',rounded,ri===0?4.1:3.4,.033);
  else{
   // The same full-width driveable corridor, expressed as compacted twin
   // wheel tracks through turf rather than another expanse of asphalt.
   for(const side of [-1,1])await courseRibbonAsync(yieldCpuPreparation,THREE,put,'track',rounded,.62,.034,false,side*.78);
  }
  let traveled=0,next=ri?14:10;
  for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
   while(next<traveled+length){const t=(next-traveled)/length,x=a[0]+dx*t,y=a[1]+dy*t;for(const side of [-1,1])lantern(x+dy/length*(width/2+.65)*side,-y+dx/length*(width/2+.65)*side);next+=spacing;}traveled+=length;
  }
 }
 // Rutted maintenance cuts are narrow, rough alternatives to the paved bends.
 for(const route of COURSE.footPaths){await yieldCpuPreparation();await courseRibbonAsync(yieldCpuPreparation,THREE,put,'rough',roundedCourseRoute(route,.35),1.1,.016);for(let i=1;i<route.length;i++){
  const b=route[i];
  if(i===1||i===route.length-1)lantern(b[0]+.9,-b[1]);
 }}
 for(const cut of COURSE.shortcuts){await yieldCpuPreparation();const route=[[cut.from.x,cut.from.y],[cut.to.x,cut.to.y]];
  // A pale latch plate and short operating handle distinguish service gates
  // from loose hurdles. Reuse the existing opaque metal/wood batches.
  const side=-1.75,cy=Math.cos(cut.yaw),sy=Math.sin(cut.yaw),hx=cut.x+cy*side,hz=-cut.y+sy*side;
  for(const face of [-1,1]){
   const px=hx-sy*.24*face,pz=hz+cy*.24*face;
   box('brass',px,1.08,pz,.25,.18,.035,-cut.yaw);box('iron',px-sy*.04*face,.99,pz+cy*.04*face,.07,.2,.06,-cut.yaw);
   box('paint',px-sy*.08*face,1.12,pz+cy*.08*face,.3,.055,.08,-cut.yaw);
  }
  // Flush wear through turf disappears beneath paving at each junction.
  await courseRibbonAsync(yieldCpuPreparation,THREE,put,'rough',route,3.5,.016);
  for(const side of [-1,1])await courseRibbonAsync(yieldCpuPreparation,THREE,put,'track',route,.28,.02,false,side*.65);
 }
 await yieldCpuPreparation();
 const courseDetail=await buildCourseDetail({put,box,cylinder,mat,yieldCpuPreparation,software});
 const routeClues=buildRouteClues({THREE,COURSE,put,box});
 for(const s of COURSE.sand){await yieldCpuPreparation();const patch=coursePatch(THREE,s.y),lip=bunkerLip(THREE,s,COURSE.paths);put(lip,'rough',s.x,0,-s.y);put(patch,'sand',s.x,.028,-s.y,s.rx,1,s.ry);patch.dispose();lip.dispose();}
 landscape.bunkerEdges=buildBunkerRouteEdges({COURSE,box});
 const irrigationArt=COURSE.wet.map(w=>{
  const group=new THREE.Group();scene.add(group);
  const flat=coursePatch(THREE,w.y,2);flat.scale(w.r,1,w.r);flat.translate(w.x,.055,-w.y);const basin=contourGround(THREE,flat);flat.dispose();group.add(new THREE.Mesh(basin,materials.wet));
  for(let i=0;i<38;i++){const a=i*2.4,r=noise(i+w.y)*w.r*.92,x=w.x+Math.sin(a)*r,z=-w.y+Math.cos(a)*r;box('sheen',x,terrainHeight(x,-z)+.067,z,.15+noise(i)*.4,.008,.025,0,group);}
  batchVehicleParts(group);
  // A visible pop-up head gives each changing wet patch an understandable source.
  put(cylinder,'iron',w.x-w.r*.72,.09,-w.y,.13,.18,.13);put(cylinder,'brass',w.x-w.r*.72,.21,-w.y,.18,.06,.18);
  return group;
 });
 let irrigationState=[];
 // Low planted islands have irregular shoulders and a continuous footprint.
 // They are authored in the collision layout, never invisible decorative walls.
 let plantedTrees=0;
 for(const o of COURSE.obstacles){if(o.kind!=='hedge')continue;await yieldCpuPreparation();
  put(circle,'rough',o.x,.032,-o.y,o.r+ .25,1,o.r+.25);
  put(sphere,'leaf',o.x,.62,-o.y,o.r,.85,o.r);
  for(let i=0;i<5;i++){const a=i*2.4,r=o.r*.52;put(sphere,'leaf',o.x+Math.sin(a)*r,.95+noise(i+o.y)*.28,-o.y+Math.cos(a)*r,o.r*.48,.65,o.r*.46);}
  // Redistribute a few existing trees into established solid planting beds.
  // No added tree budget, collision footprint, or trunk across a route.
  if(plantedTrees<15){const tree=pinePlacements.filter(p=>Math.sign(p.x)===Math.sign(o.x)&&Math.abs(p.x)>40).sort((a,b)=>Math.abs(-a.z-o.y)-Math.abs(-b.z-o.y))[0];if(tree){Object.assign(tree,{x:o.x,z:-o.y,h:6.5+noise(o.y)*2,w:.9});plantedTrees++;}}
 }
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
 for(let y=36;y<800;y+=32)for(const side of [-1,1]){
  if(side>0&&(Math.abs(y-232)<35||Math.abs(y-474)<40))continue;
  put(sphere,'leaf',side*(44+noise(y)*1.3),.7,-y,2.4,1.1,4.5);
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
  box('leaf',s.x,1.65,-s.y,s.rx*1.75,2.9,s.ry*2-.3);
  for(let y=s.y-s.ry+1.4;y<s.y+s.ry;y+=2.7){
   put(sphere,'leaf',s.x,2.65+noise(y)*.18,-y,s.rx,.95,1.7);
   for(const side of [-1,1])put(sphere,'leaf',s.x+side*s.rx*.65,1.5+noise(y+side)*.25,-y,s.rx*.35,1.3,1.6);
  }
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
 const courseFeatures=buildCourseFeatures({THREE,COURSE,box,put,cylinder,sphere,circle,scene,batchVehicleParts});
 await yieldCpuPreparation();
 const shiftRecords=buildShiftRecords({scene,materials,box,put,cylinder});
 await yieldCpuPreparation();
 const storyArt=buildCourseStoryArt({THREE,box,put,cylinder,pitchedRoof,batchVehicleParts,scene,COURSE,materials,pinePlacements});
 // Preserve the tree budget, moving trees out of the new water to bank groves.
 for(const p of pinePlacements)for(const [x,y,rx,ry]of COURSE_RESERVOIRS){
  if(((p.x-x)/rx)**2+((-p.z-y)/ry)**2<1.25){const side=-p.z<y?-1:1;p.x=50+noise(p.z)*12;p.z=-(y+side*(ry+5+noise(p.x)*4));}
 }
 await yieldCpuPreparation();
 let mergeSlice=performance.now();
 for(const [key,b] of batches){if(key.startsWith('pathLamp:')){b.material=b.material.clone();roadLights.push({material:b.material,y:Number(key.split(':')[1])*48+24});}const g=mergeIndexedGeometries(b.geometries);g.computeBoundingSphere();g.computeBoundingBox();const mesh=new THREE.Mesh(g,b.material);scene.add(mesh);const pieces=batchCulling.register(mesh,b.geometries,key.startsWith('plantCourse:')?{maxDistance:software?32:60,boundsPadding:.5}:undefined);localLights?.register(mesh,pieces);for(const piece of b.geometries)piece.dispose();b.geometries.length=0;if(performance.now()-mergeSlice>=8){await yieldCpuPreparation();mergeSlice=performance.now();}}
 await yieldCpuPreparation();
 const shutter=new THREE.Group();shutter.position.set(-23,7.3,-800);scene.add(shutter);box('iron',0,0,0,11,4.8,.14,0,shutter);for(let y=-2.25;y<2.4;y+=.28)box('rust',0,y,.09,10.9,.035,.04,0,shutter);batchVehicleParts(shutter);
 const hemi=new THREE.HemisphereLight(0xb7cbd8,0x48503e,.5);scene.add(hemi);scene.add(new THREE.AmbientLight(0x87958a,.09));const moon=new THREE.DirectionalLight(0xa9c7d9,.88);moon.position.set(-30,55,10);scene.add(moon);
 const headlamp=new THREE.PointLight(0xd8d8ac,16,16,2);scene.add(headlamp);
 const beaconRed=new THREE.Color(0xff2010),mowerLight=new THREE.PointLight(0xff2010,0,40,2);scene.add(mowerLight);
 await yieldCpuPreparation();
 beaconShadows.build(mowerLight);
 beaconShadows.addCaster(shutter);
 pinePlacements.forEach(p=>p.y=terrainHeight(p.x,-p.z));
 const pines=await createCoursePines(scene,materials.wood,pinePlacements,software,pineAsset);
 onProgress('Preparing the cart and the mower…');
 function batchVehicleParts(group){
  const grouped=new Map();group.updateMatrixWorld(true);for(const m of [...group.children]){if(!m.isMesh)continue;const key=m.material.uuid;if(!grouped.has(key))grouped.set(key,{mat:m.material,list:[]});const g=m.geometry.clone();g.applyMatrix4(m.matrix);projectUV(g,'vehicle');grouped.get(key).list.push(g);group.remove(m);}
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
  put(roofShape(width,length,.22),mower?'mower':'paint',0,mower?.75:.57,0,1,1,1,0,body);
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
  const steering=new THREE.Mesh(new THREE.TorusGeometry(mower?.29:.24,.035,5,16),materials.iron);steering.rotation.x=Math.PI*.32;steering.position.set(mower?0:-.36,mower?1.48:1.18,-.35);body.add(steering);
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
   box('iron',0,1.12,-1.67,1.93,.57,.09,0,body);
   for(let i=0;i<11;i++){
    const x=-.83+i*.166;box('rust',x,1.18,-1.73,.055,.44,.06,0,body);
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
   for(const y of [.97,1.34])box('iron',0,y,-1.78,1.84,.045,.035,0,body);
   for(const x of [-.72,-.36,0,.36,.72])box('brass',x,1.34,-1.808,.035,.035,.022,0,body);
   const eye=put(new THREE.TorusGeometry(.11,.035,5,12),'iron',0,.63,1.78,1,1,1,0,body);eye.rotation.x=Math.PI/2;
   // Welded exhaust clamp and bent outlet, using the existing rough metal maps.
   for(const y of [1.69,2.33])put(cylinder,'rust',.93,y,.77,.11,.075,.11,0,body);
   rail(body,[[.93,2.82,.77],[.93,2.96,.82],[.93,2.99,1.02]],.068,'iron');
  }
  addVehicleDetail({THREE,mower,body,parts,box,put,cylinder,rail});
  addVehicleCraft({THREE,mower,body,parts,box,put,cylinder,rail});addChaseVehicleCraft({THREE,mower,body,box,put,cylinder});
  const wear=parts?buildCartWear({THREE,parts,body,box,batchVehicleParts}):[];
  // Retain five breakaway assemblies; their details still batch by material.
  if(parts)for(const part of Object.values(parts))batchVehicleParts(part);
  batchVehicleParts(body);
  const repeated=instanceVehicleParts(root,[...wheels,...decks]);
  const damage=parts?createCartDamage({body,driver,wheels,parts,wear}):null;
  return {root,body,driver,wheels,decks,repeated,damage,phase:0};
 }
 const cart=vehicle(false);await yieldCpuPreparation();const mower=vehicle(true);await yieldCpuPreparation();const runner=createChaseRunner(scene,materials,terrainHeight);let wasOnFoot=false;let rider=null,head=null,headRest=null,chest=null,chestRest=null;
 // Reuse Joe's authored high-resolution face, hair, shoulders and cloth. Only
 // his skeleton is seated; the old push mower is excluded from this level.
 try{
  const gltf=await riderAsset;rider=gltf.scene;let skinMap=null;rider.traverse(o=>{if(o.material?.name==='Skin')skinMap=o.material.map;});
  rider.traverse(o=>{if(o.name==='MowerRigidBody'||o.name.startsWith('Wheel'))o.visible=false;if(o.isMesh){const source=Array.isArray(o.material)?o.material:[o.material],skinMask=skinInfluenceMask(o.geometry);o.material=source.map(m=>{if(m.map){m.map.magFilter=THREE.NearestFilter;m.map.minFilter=THREE.NearestMipmapLinearFilter;}const n=new THREE.MeshLambertMaterial({map:m.map,color:m.color,side:THREE.DoubleSide});const face=m.name==='Face'&&!!o.geometry.attributes.color&&!!skinMap;n.onBeforeCompile=s=>{
    specializeSkinning(s,skinMask);
    if(face){s.uniforms.joeSkinMap={value:skinMap};s.vertexShader='attribute vec3 color;\nvarying float joeFaceWeight;\nvarying vec2 joeSkinUv;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\njoeFaceWeight=color.r;joeSkinUv=position.xy*1.2+vec2(.2);');s.fragmentShader='uniform sampler2D joeSkinMap;\nvarying float joeFaceWeight;\nvarying vec2 joeSkinUv;\n'+s.fragmentShader;}
    s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+(face?'diffuseColor.rgb=mix(texture2D(joeSkinMap,fract(joeSkinUv)).rgb,diffuseColor.rgb,clamp(joeFaceWeight,0.0,1.0));':'')+(m.name==='Collar'?'float luma=dot(diffuseColor.rgb,vec3(.299,.587,.114));diffuseColor.rgb=vec3(.24,.34,.43)*(.62+luma*.85);':'')+'\ndiffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.78));');};n.customProgramCacheKey=()=> 'back-nine-joe-'+(face?'face':m.name==='Collar'?'collar':'surface')+'-skin-'+skinMask;return n;});if(!Array.isArray(source)||o.material.length===1)o.material=o.material[0];o.frustumCulled=false;}
   if(o.name.startsWith('Thigh'))o.rotateX(Math.PI/2);if(o.name.startsWith('Shin'))o.rotateX(-Math.PI/2);if(o.name==='Head'){head=o;headRest=o.quaternion.clone();}if(o.name==='Chest'){chest=o;chestRest=o.quaternion.clone();}
  });rider.position.set(0,.28,.1);mower.root.add(rider);
 }catch(error){throw new Error('Joe could not load. Reload to retry. '+error.message);}
 await yieldCpuPreparation();
 const experienceArt=createExperienceArt({scene,materials,box,put,cylinder,batchVehicleParts});experienceArt.warm();
 const ghosts=await createCourseGhosts(scene);ghosts.warm();const clippings=createMowerClippings(scene);
 const staffSighting=createStaffSighting(scene,rider),riderCulling=createChaseRiderCulling(rider);
 const spray=new THREE.InstancedMesh(new THREE.BoxGeometry(.025,.06,.025),materials.sheen,32);spray.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(spray);
 const impactSparks=new THREE.InstancedMesh(new THREE.BoxGeometry(.035,.035,.13),materials.lamp,12);impactSparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);impactSparks.frustumCulled=false;scene.add(impactSparks);
 const destructionArt=createDestructionArt(scene,materials);let mouthPose={cutting:false,height:.68,target:.68};let mouthRun=null;
 const hurdleArt=createCourseHurdles(scene,COURSE.hurdles,unitBox,materials.wood);
 const vehicleFrustum=new THREE.Frustum(),vehicleProjection=new THREE.Matrix4(),mowerBounds=new THREE.Sphere(new THREE.Vector3(),6);
 const nightShadows=createNightShadows(scene,pinePlacements,moon);
 const atmosphere=createChaseAtmosphere();let atmospherePose=atmosphere.stats();
 const deathCameraStart=new THREE.Vector3();let presentedDeath=null,presentedDeathSide=1;
 const deathPose={},approach=createPursuitFeedback();let approachPose=approach.stats();
 const look=new THREE.Vector3(),desired=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),impactPose={};let drawCalls=0,impactRecoil=0,rumbleIntensity=0,rumbleMotion=0,ramPose={};let initialized=false,lastTime=0,lastRear=false,closed=false;
 const runnerViewAnchor={x:0,y:0};
 let beaconPose={},cameraClearance=1;
 function update(run,{rear=false,reducedMotion=false,shake=1,flash=1}={}){
  const cameraSweep=(from,to)=>runnerCameraFraction(from,to,run);
  storyArt.update(run,reducedMotion);tracks.update(run);atmospherePose=atmosphere.update(run);approachPose=approach.update(run,reducedMotion);
  if(rear!==lastRear){if(!run.foot)initialized=false;lastRear=rear;}
  const dt=Math.min(.05,Math.max(0,run.time-lastTime));lastTime=run.time;const c=chaseActor(run),j=run.joe,t=run.tension||{},fear=t.intensity||0,ram=ramWindup(run),panic=panicPose(run),commit=commitmentPose(run),rev=Math.max(t.windup||0,ram.charge,commit.load*.9),surge=t.surge||0,dip=reducedMotion?0:(t.lightDip||0)*flash;ramPose=ram;shutter.visible=true;shutter.position.y=7.3-(run.finale?.gate||0)*4.9-(run.exitRelease&&!['sealing','complete'].includes(run.mode)?4.9*(1-run.exitRelease.open):0);
  for(const [v,s]of [[cart,run.cart],[mower,j]]){v.root.position.set(s.x,terrainHeight(s.x,s.y),-s.y);const slope=terrainSlope(s.x,s.y,s.yaw);v.root.rotation.set(slope.pitch,-s.yaw,slope.roll,'YXZ');v.phase-=dt*s.speed/(v===cart?.36:.57);for(const wheel of v.wheels)wheel.rotation.x=v.phase;v.body.rotation.z=reducedMotion?0:-(s.steer||0)*Math.abs(s.speed)*.003;}
  irrigationState=COURSE.wet.map((w,i)=>({x:w.x,y:w.y,...irrigationPhase(run,i)}));irrigationArt.forEach((g,i)=>g.visible=irrigationState[i].active);ghosts.update(run,c,reducedMotion);clippings.update(run,reducedMotion);experienceArt.update(run,reducedMotion);
  courseFeatures.update(run,reducedMotion);hurdleArt.update(run,reducedMotion);destructionArt.update(run,reducedMotion);
  const hit=run.impact,hitAge=hit?.age??99,recoil=!reducedMotion&&hitAge<.55?Math.sin(hitAge*28)*Math.exp(-hitAge*8)*(hit.strength||0):0;
  const rumble=cartRumble(run),motion=reducedMotion?0:1;rumbleIntensity=rumble.intensity;rumbleMotion=rumble.heave*motion;impactRecoil=-recoil*.12;
  cart.body.position.y=impactRecoil+rumbleMotion;cart.body.rotation.x=-recoil*.028+rumble.pitch*motion;cart.body.rotation.z=clamp(cart.body.rotation.z+rumble.roll*motion,-.048,.048);mower.body.position.y=-recoil*.045-(reducedMotion?0:ram.load*.035);mower.body.rotation.x=-recoil*.014-(reducedMotion?0:ram.load*.018+Math.sin(run.time*55)*ram.load*.002);
  cartImpactPose(run,reducedMotion,impactPose);for(const name of ['pitch','roll'])impactPose[name]*=shake;approachPose.roll*=shake;approachPose.heave*=shake;approachPose.fov*=shake;cart.body.position.y+=impactPose.heave;cart.body.rotation.x+=impactPose.bodyPitch;cart.body.rotation.z+=impactPose.bodyRoll;
  impactSparks.count=!run.death&&!reducedMotion&&hitAge<.38?12:0;
  for(let i=0;i<impactSparks.count;i++){const a=i*2.4,v=.7+noise(i+47)*1.5,t=hitAge,longitudinal=Math.abs(hit.front||0)>Math.abs(hit.side||0),side=i<6?-1:1,sx=longitudinal?side*(.85+v*t):Math.sin(a)*v*t,sz=longitudinal?Math.cos(a)*v*t:side*.4+Math.cos(a)*v*t,yaw=hit.yaw||0;dummy.position.set(hit.x+Math.cos(yaw)*sx+Math.sin(yaw)*sz,.65+(1.1+noise(i)*1.2)*t-5*t*t,-hit.y+Math.sin(yaw)*sx-Math.cos(yaw)*sz);dummy.rotation.set(a+t*8,a,0);dummy.scale.setScalar(1-t/.45);dummy.updateMatrix();impactSparks.setMatrixAt(i,dummy.matrix);}if(impactSparks.count)impactSparks.instanceMatrix.needsUpdate=true;
  const folding=j.ram?.phase==='backoff'||COURSE.checkpoints.some(p=>distance(p,j)<16)||['signal','flank'].includes(run.hunt?.phase);for(let i=0;i<mower.decks.length;i++){const d=mower.decks[i],target=(i-1)*-.85*(ram.active?ram.deckLift:commit.warning?.3+commit.load*.5:folding?1:reducedMotion?0:panic.deckLift);if(ram.active)d.rotation.z=target;else d.rotation.z+=(target-d.rotation.z)*(1-Math.exp(-dt*4));}
  const mouth=mowerMouthTarget(run),center=mower.decks[1];if(mouthRun!==run){mouthRun=run;center.position.y=mouth.height;}else if(run.mode==='paused'){}else if(reducedMotion)center.position.y=mouth.height;else center.position.y+=(mouth.height-center.position.y)*(1-Math.exp(-dt*(mouth.cutting?9:4)));mouthPose={cutting:mouth.cutting,target:mouth.height,height:center.position.y};
  cart.damage.update(run,reducedMotion,rumble.mechanics);
  cart.driver.visible=!run.foot;runner.update(run.foot,dt,reducedMotion,run.death,run.time);if(run.foot)runner.root.position.y+=terrainHeight(runner.root.position.x,-runner.root.position.z);if(!run.foot)runner.seated(cart.driver,run.cart,reducedMotion,run.time);if(!!run.foot!==wasOnFoot){wasOnFoot=!!run.foot;}
  cart.repeated.update();mower.repeated.update();
  if(chest){chest.quaternion.copy(chestRest);chest.rotateX(reducedMotion?0:-surge*.065-ram.load*.13-commit.load*.08+Math.sin(run.time*1.4)*.012*(ram.active?.2:1));}
  if(head){head.quaternion.copy(headRest);if(!reducedMotion){head.rotateX(-rev*.12-ram.load*.08);head.rotateZ(rev*(ram.active?.025:.065));}head.rotateY(clamp(angleDelta(Math.atan2(c.x-j.x,c.y-j.y),j.yaw),-.35,.35));}
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
  const yaw=(run.foot?c.viewYaw:c.yaw)+(rear&&!run.foot?Math.PI:0),follow=run.foot?2.4+2.1*footClearance+3.6*breakdownView:rear?4.8:6.5,lookAhead=run.foot?.8+1.7*footClearance:7;
  desired.set(viewX-Math.sin(yaw)*follow+Math.cos(yaw)*breakdownView*1.8*breakdownSide,(run.foot?2.7+.6*footClearance+breakdownView*1.1:rear?4.8:4.2)+approachPose.heave,-viewY+Math.cos(yaw)*follow+Math.sin(yaw)*breakdownView*1.8*breakdownSide);
  desired.y+=groundHeight;
  // Keep Joe's roll cage out of the chase lens during close approaches to
  // the shutter. Pull forward over the cart, preserving the escape view.
  const mowerBehind=!run.foot&&!rear&&(j.x-c.x)*Math.sin(yaw)+(j.y-c.y)*Math.cos(yaw)<-1&&Math.abs((j.x-c.x)*Math.cos(yaw)-(j.y-c.y)*Math.sin(yaw))<3.3&&distance(c,j)<9;
  if(mowerBehind){const safeFollow=Math.max(1.4,distance(c,j)-3.3);desired.x=viewX-Math.sin(yaw)*Math.min(follow,safeFollow);desired.z=-viewY+Math.cos(yaw)*Math.min(follow,safeFollow);}
  const shelterCeiling=shelterCameraCeiling(c);desired.y=Math.min(desired.y,shelterCeiling);
  cameraClearance=1;if(run.foot){cameraClearance=cameraSweep(runnerViewAnchor,{x:desired.x,y:-desired.z});desired.x=viewX+(desired.x-viewX)*cameraClearance;desired.z=-viewY+(desired.z+viewY)*cameraClearance;desired.y=groundHeight+1.85+(desired.y-groundHeight-1.85)*(cameraClearance+(1-cameraClearance)*flightFocus);}
  if(!run.death){if(!initialized||reducedMotion||run.foot&&cameraClearance<.99||mowerBehind&&Math.hypot(camera.position.x-j.x,camera.position.z+j.y)<3.3)camera.position.copy(desired);else camera.position.lerp(desired,1-Math.exp(-dt*8));}
  if(flightView){const clear=cameraSweep(runnerViewAnchor,{x:camera.position.x,y:-camera.position.z});camera.position.x=viewX+(camera.position.x-viewX)*clear;camera.position.z=-viewY+(camera.position.z+viewY)*clear;}
  if(!run.death)camera.position.y=Math.min(camera.position.y,shelterCeiling);
  // Aim the automatic foot camera through the player at chest height. A fixed
  // mouse-look pitch cropped the legs whenever the camera moved near the wreck.
  look.set(c.x+Math.sin(yaw)*lookAhead,groundHeight+(run.foot?1.2:rear?1.15:2.3),-c.y-Math.cos(yaw)*lookAhead);if(run.foot){const view=yaw+Math.PI*(reducedMotion?Number(rear):(c.rearBlend||0)),aimDistance=Math.max(2.4,Math.hypot(camera.position.x-viewX,camera.position.z+viewY)+lookAhead),aimDrop=(camera.position.y-groundHeight-1.2)*8/aimDistance;look.set(camera.position.x+Math.sin(view)*8,camera.position.y-aimDrop-(c.viewPitch||0)*8,camera.position.z-Math.cos(view)*8);}if(!initialized||reducedMotion||run.foot)cameraTarget.copy(look);else cameraTarget.lerp(look,1-Math.exp(-dt*10));if(flightView&&!rear){look.set(viewX,runner.root.position.y+1,-viewY);cameraTarget.lerp(look,flightFocus);}camera.lookAt(cameraTarget);if(run.foot&&!run.death)runner.root.visible=Math.hypot(camera.position.x-c.x,camera.position.z+c.y)>1.1;camera.rotateZ(approachPose.roll*(rear?-1:1));initialized=true;
  const missAge=run.time-(run.experience?.nearMiss.at??-99),missKick=!reducedMotion&&missAge>=0&&missAge<.5?Math.sin(missAge*22)*Math.exp(-missAge*9)*.008*shake*(run.experience.nearMiss.side||1):0;camera.rotateZ(missKick);
  camera.rotateX(impactPose.pitch*(rear?-1:1));camera.rotateZ(impactPose.roll*(rear?-1:1));
  if(!run.death)presentedDeath=null;
  if(run.death){const d=run.death;if(presentedDeath!==d){presentedDeath=d;deathCameraStart.copy(camera.position);presentedDeathSide=runoverCameraSide(d,cameraSweep);}const a=d.yaw,p=runoverPose(d.age,reducedMotion,deathPose);p.side=(6+(p.side-6)*shake)*presentedDeathSide;p.height=4.2+(p.height-4.2)*shake;p.roll*=shake;p.fov=64+(p.fov-64)*shake;desired.set(d.x+Math.cos(a)*p.side-Math.sin(a)*p.behind,p.height+terrainHeight(d.x,d.y),-d.y+Math.sin(a)*p.side+Math.cos(a)*p.behind);desired.y=Math.min(desired.y,shelterCeiling);const clear=cameraSweep(d,{x:desired.x,y:-desired.z});desired.x=d.x+(desired.x-d.x)*clear;desired.z=-d.y+(desired.z+d.y)*clear;const enter=clamp(d.age/.4,0,1),blend=enter*enter*(3-2*enter);if(reducedMotion)camera.position.copy(desired);else camera.position.lerpVectors(deathCameraStart,desired,blend);const entryClear=cameraSweep(d,{x:camera.position.x,y:-camera.position.z});camera.position.x=d.x+(camera.position.x-d.x)*entryClear;camera.position.z=-d.y+(camera.position.z+d.y)*entryClear;cameraTarget.set(d.x+Math.sin(a)*.4,.65+terrainHeight(d.x,d.y),-d.y-Math.cos(a)*.4);camera.lookAt(cameraTarget);camera.rotateZ(p.roll);}
  const fov=run.death?deathPose.fov:64+approachPose.fov;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  if(run.mode==='sealing'||run.mode==='complete'){const blend=reducedMotion||run.mode==='complete'?1:clamp((run.finale?.age||0)/.8,0,1);desired.set(-26,3.3,-811.5);camera.position.lerp(desired,blend);look.set(-23,1.5,-799);cameraTarget.lerp(look,blend);camera.lookAt(cameraTarget);}
  headlamp.intensity=run.foot?7:16;headlamp.distance=run.foot?12:16;
  headlamp.position.set(c.x+Math.sin(c.yaw)*3,1.5+terrainHeight(c.x,c.y),-c.y-Math.cos(c.yaw)*3);
  // Slow circuit sag travels behind the cart. Road lamps retain a readable
  // minimum, while shelter/garage and player headlights stay fully powered.
  for(const light of roadLights){const behind=clamp((c.y-light.y+30)/60,0,1);light.material.color.setHex(0xe4c88e).multiplyScalar(Math.max(.68,1-dip*(.35+.6*behind)));}
  // Electrical faults belong to two identifiable service fixtures. Gate and
  // foot-route lanterns keep a readable floor; they do not inherit the fault.
  for(let i=0;i<2;i++)materials['faultLamp'+i].color.setHex(i?0xb1c5bd:0xc6b379).multiplyScalar(lampFlicker(run.time,COURSE_LANDMARKS[i].fault,flash,reducedMotion));
  materials.windowLamp.color.setHex(0xe4c88e).multiplyScalar((c.y>620?1-dip*.95:1)*lampFlicker(run.time,811,flash*.45,reducedMotion));
  materials.mowerLamp.color.setRGB(1,.62-rev*.16,.3-rev*.12).multiplyScalar((1+ram.load*.25)*(reducedMotion||ram.active?1:1+(panic.lamps-1)*flash));
  // Low-lying water sections carry denser, cool haze. This uses the existing
  // fog uniforms: no translucent layers, extra lights or particle overdraw.
  const valley=Math.max(Math.exp(-(((c.y-238)/43)**4)),Math.exp(-(((c.y-467)/52)**4)));
  const shadow=reducedMotion?0:atmospherePose.shadow*flash;hemi.intensity=.35-dip*.035-shadow*.16;moon.intensity=.62-shadow*.52-valley*.09;scene.fog.color.copy(dryFog).lerp(valleyFog,valley);scene.fog.near=(software?40:54)-dip*4-valley*9;scene.fog.far=(software?92:120)-valley*8;
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
  courseDetail.update(run,reducedMotion,j,headlamp,mowerLight);
  beaconPose.range=mowerLight.distance;beaconPose.intensity=mowerLight.intensity;
  // The seated skeleton disables per-mesh culling because its rest bounds
  // do not follow the bones. A generous whole-vehicle sphere includes Joe,
  // the folding decks, wheels, impact recoil and windup without freezing them.
  camera.updateMatrixWorld();vehicleFrustum.setFromProjectionMatrix(vehicleProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  mowerBounds.center.set(j.x,2,-j.y);mower.root.visible=vehicleFrustum.intersectsSphere(mowerBounds);
  riderCulling.update();staffSighting.update(run,camera);
  batchCulling.update(camera);
  localLights?.update([headlamp,mowerLight]);pines.update(camera,[headlamp,mowerLight]);backdrop.update(camera,run.time,reducedMotion,run.mode!=='driving');
  // Tire spray shares the existing 32-instance pool with the sprinklers.
  
  const tireSpray=!run.foot&&!reducedMotion&&c.surface==='wet'&&Math.abs(c.speed)>6&&panic.level>.3,ambientLimit=32-(tireSpray?8:0);
  let count=0;for(const [wi,w] of COURSE.wet.entries())if(irrigationState[wi].active&&distance(w,c)<45)for(let i=0;i<16&&count<ambientLimit;i++){const boosted=!!irrigationState[wi].manual,t=((reducedMotion?0:run.time*(boosted?1.15:.7))+i/16)%1;dummy.position.set(w.x-w.r*.72+t*w.r*1.4,terrainHeight(w.x-w.r*.72,w.y)+.23+Math.sin(t*Math.PI)*(boosted?2.5:1.6),-w.y+(i%2)*.5);dummy.rotation.set(0,0,-.5);dummy.scale.set(boosted?1.7:1,boosted?1.8:1,boosted?1.7:1);dummy.updateMatrix();spray.setMatrixAt(count++,dummy.matrix);}
  if(tireSpray)for(let i=0;i<8;i++){const t=(run.time*3+i/8)%1,side=i%2?1:-1,x=side*(.82+t*.9),z=.9+t*Math.min(2.4,Math.abs(c.speed)*.15);dummy.position.set(c.x+Math.cos(c.yaw)*x-Math.sin(c.yaw)*z,terrainHeight(c.x,c.y)+.13+Math.sin(t*Math.PI)*.65,-c.y+Math.sin(c.yaw)*x+Math.cos(c.yaw)*z);dummy.rotation.set(0,-c.yaw,side*.6);dummy.scale.set(1.8,1+t*2,1.8);dummy.updateMatrix();spray.setMatrixAt(count++,dummy.matrix);}spray.count=count;spray.visible=count>0;if(count){spray.instanceMatrix.needsUpdate=true;spray.computeBoundingSphere();}
 }
 update({time:0,cart:{...COURSE.start,yaw:0,speed:0},joe:{x:0,y:3,yaw:0,speed:0}});
 await Art.source('rough-cut-verge-atlas-v1');pines.warm();tracks.warm();clippings.warm();experienceArt.warm();
 // Prepare distant roofs/foliage before driving in bounded upload batches.
 // Otherwise the first rear view can upload several atlases at once.
 const maps=new Set();for(const root of [scene,backdrop.scene])root.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.map)maps.add(m.map);});

 if(localLights){
  // The source geometry also participates in paced preparation. Equivalent Lambert programs
  // and attribute layouts need only one extra preparation draw per variant.
  const layouts=new Set();for(const proxy of [...localLights.preparation.children]){const m=proxy.material,g=proxy.geometry,key=[m.customProgramCacheKey(),m.side,!!m.map,m.map?.colorSpace,m.map?.channel,m.alphaTest>0,m.vertexColors,m.flatShading,m.transparent,m.toneMapped,g.index.array.constructor.name,Object.entries(g.attributes).map(([n,a])=>n+':'+a.itemSize+':'+a.array.constructor.name+':'+a.normalized).join(',')].join('|');if(layouts.has(key))localLights.preparation.remove(proxy);else layouts.add(key);}
  scene.add(localLights.preparation);
 }
 if(software){const lit=new Set(Object.values(materials));scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)lit.add(m);});for(const m of lit)specializeQuadraticLights(m,[headlamp,mowerLight]);}
 scene.traverse(o=>{if(o.isMesh&&o.layers.test(camera.layers))o.receiveShadow=true;});
 // Include dormant light-culling variants, not only the representatives kept
 // for warm-up. They must share the prepared key on their first visible use.
 const shadowMaterials=new Set([...Object.values(materials),...(localLights?.allMaterials()||[]),...pines.allMaterials()]);scene.traverse(o=>{for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m)shadowMaterials.add(m);});for(const m of shadowMaterials)skipUnlitBeaconLookups(m);
 const programsReady=(async()=>{await renderer.compileAsync(backdrop.scene,backdrop.camera);await renderer.compileAsync(scene,camera);})();programsReady.catch(()=>{});
 const texturePreparation=await prepareCourseTextures(renderer,maps,()=>closed);await programsReady;onProgress('Preparing course details…');preparation=await prepareCourseBuffers(renderer,scene,camera,()=>closed);const skyPreparation=await prepareCourseBuffers(renderer,backdrop.scene,backdrop.camera,()=>closed);preparation.textures=texturePreparation;preparation.surfaces=surfaces.stats();preparation.batches+=skyPreparation.batches;preparation.maxBytes=Math.max(preparation.maxBytes,skyPreparation.maxBytes);if(localLights)scene.remove(localLights.preparation);pines.finishWarm();tracks.finishWarm();staffSighting.finishWarm();pines.update(camera,[headlamp,mowerLight]);if(closed)throw new Error('Level closed');beaconShadows.warm(renderer,camera);await waitForGPU(renderer,()=>closed);
 const runoverVisible=()=>wasOnFoot&&runner.root.visible&&presentedDeath!==null;
 return {scene,camera,update,draw(){renderer.autoClear=false;renderer.clear();const scissored=renderer.getScissorTest();renderer.getSize(skySize);skySkippedRows=skyCoverage&&!scissored?skyCoverage.rows(camera,skySize.y):0;
  if(skySkippedRows){renderer.getScissor(skyScissor);renderer.setScissor(0,skySkippedRows,skySize.x,skySize.y-skySkippedRows);renderer.setScissorTest(true);}
  renderer.render(backdrop.scene,backdrop.camera);const backgroundDraws=renderer.info.render.calls;
  if(skySkippedRows){renderer.setScissor(skyScissor);renderer.setScissorTest(scissored);}
  renderer.clearDepth();renderer.render(scene,camera);renderer.autoClear=true;drawCalls=backgroundDraws+renderer.info.render.calls;},staffSightingActive:()=>staffSighting.active(),drainRunnerContacts(){return runner.drainContacts();},resetCamera(){initialized=false;},stats:()=>({experience:experienceArt.stats(),courseDetail:courseDetail.stats(),mowerClippings:clippings.stats(),irrigation:irrigationState,ghosts:ghosts.stats(),terrain:{forms:TERRAIN_FORMS.length,cartHeight:cart.root.position.y,joeHeight:mower.root.position.y,runnerHeight:runner.root.position.y},destruction:destructionArt.stats(),mowerMouth:{...mouthPose},riderCulling:riderCulling.stats(),shiftRecords:shiftRecords.stats(),staffSighting:staffSighting.stats(),beaconShadows:beaconShadows.stats(),landmarks,routeClues,alarmMeters:alarmMeters.map(m=>m.bars),serviceMeters:storyArt.stats(),cameraHeight:camera.position.y,nightShadows:nightShadows.stats(),skySkippedRows,landscape:{...landscape,lanterns:lanterns.length},atmosphere:{...atmospherePose},mowerTracks:tracks.stats(),beacon:{...beaconPose},cameraClearance,courseFeatures:courseFeatures.count,destructibleFeatures:courseFeatures.stats(),impactFeedback:{...impactPose},cartDamage:cart.damage.stats(),pursuitFeedback:{...approachPose},runOver:runoverVisible(),runOverCamera:runner.root.visible&&runoverVisible()?{...deathPose}:null,onFoot:runner.root.visible&&wasOnFoot,ejection:runner.stats(),localLights:localLights?.stats(),vehicleInstancing:{batches:cart.repeated.batches+mower.repeated.batches,savedDraws:cart.repeated.savedDraws+mower.repeated.savedDraws},mowerVisible:mower.root.visible,batchCulling:batchCulling.stats(),preparation,rider:!!rider,horrorLights:2,ramWindup:ramPose,hurdlePieces:hurdleArt.stats().pieces,hurdleUploads:hurdleArt.stats().uploads,impactParticles:impactSparks.count,impactRecoil,cartRumble:rumbleIntensity,cartRumbleHeave:rumbleMotion,cartBodyRoll:cart.body.rotation.z,artStyle:'shared-level-one',parallax:backdrop.stats(),pines:pines.stats(),roadLampBatches:roadLights.length,staticBatches:batches.size,programs:renderer.info.programs.length,textures:renderer.info.memory.textures,draws:drawCalls,triangles:renderer.info.render.triangles}),dispose(){closed=true;experienceArt.dispose();clippings.dispose();ghosts.dispose();shiftRecords.dispose();staffSighting.dispose();beaconShadows.dispose();hurdleArt.dispose();destructionArt.dispose();nightShadows.dispose();tracks.dispose();runner.dispose();localLights?.dispose();cart.repeated.dispose();mower.repeated.dispose();backdrop.dispose();pines.dispose();surfaces.dispose();scene.traverse(o=>{o.geometry?.dispose();});Object.values(materials).forEach(m=>m.dispose());roadLights.forEach(l=>l.material.dispose());}};
}
