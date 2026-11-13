import {finishFinalCutGround} from './final-cut-ground-finish.js';
import {paintFinalCutSign,finalCutSignMaterial} from './final-cut-sign-art.js';
import {createFinalCutRough} from './final-cut-rough.js';
import {REFUGE_ARCHITECTURE} from './final-cut-architecture-layout.js';
import {createFinalCutVerges} from './final-cut-verges.js';
import {createParallax} from './parallax-scene.js';
import {finalCutRenderSize} from './final-cut-visual-settings.js';
import {GROUND_SLABS} from './final-cut-ground-layout.js';
import * as THREE from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import * as Art from './pixel-art.js';
import {collapsePose} from './final-cut-ending.js';
import {createFinalCutJoe} from './final-cut-joe.js';
import {finishFinalCutJoe} from './final-cut-joe-finish.js';
import {ARRIVAL_WALLS,OVERLOOK,OVERLOOK_RAMPS,BAY,ACCESS,OVERLOOK_ACCESS,ACCESS_GATE,ACCESS_FENCE,groundHeight} from './final-cut-arrival-layout.js';
import {WALLS,REFUGES,SECTORS,BREAKABLES,PUMP,BELL,NOTE,BALL_BASKETS,SWALE,LANES,clamp,isCut,inside,distance,lineClear} from './final-cut-course.js';
import {MAX_WORLD_BALLS,flightPoint} from './final-cut-balls.js';
import {ROUTE_WALLS,FORK,FORK_SIGN,FINAL_ROUTES} from './final-cut-route-layout.js';
import {CAB,cabPerformance} from './final-cut-cab.js';
import {defeatView} from './final-cut-defeat.js';
import {RIG_BODY,RIG_WHEELS,RIG_BANK,RIG_WING_PARTS,wingPartId,rigWheelAngle} from './final-cut-rig.js';
import {UNEASE_BANNER,uneaseFrame} from './final-cut-unease.js';
import {championshipBoard} from './final-cut-announcement.js';
import {finishCourseSurfaces} from './final-cut-surfaces.js';
import {createFinalCutLandscape} from './final-cut-landscape.js';
import {createFinalCutIrrigation} from './final-cut-irrigation.js';
import {buildFinalCutGrandstand} from './final-cut-grandstand.js';
import {createFinalCutCourseContour} from './final-cut-course-contour.js';
import {createFinalCutMachinery,machineryPose} from './final-cut-machinery.js';
import {createFinalCutHydraulics} from './final-cut-hydraulics.js';
import {createFinalCutBodywork} from './final-cut-bodywork.js';
import {createFinalCutTires} from './final-cut-tires.js';
import {createFinalCutLamps} from './final-cut-lamps.js';
import {rigLampState,courseLightState} from './final-cut-reveal.js';
import {createFinalCutEngine} from './final-cut-engine.js';
import {createCabLighting} from './final-cut-cab-lighting.js';
import {createMaintenanceLight} from './final-cut-maintenance-light.js';
import {createFinalCutHeadlights} from './final-cut-lighting.js';
import {createFinalCutActorCulling} from './final-cut-actor-culling.js';
import {createAmbushReeds} from './final-cut-reeds.js';
import {createFinalCutBoss} from './final-cut-boss.js';
import {buildFinalCutEstateDetail} from './final-cut-estate-detail.js';
import {buildFinalCutPumpHardware} from './final-cut-pump-hardware.js';
import {buildFinalCutRefugeInteriors} from './final-cut-refuge-interiors.js';
import {createRefugeLighting} from './final-cut-refuge-lighting.js';

export async function createFinalCutScene(canvas,onProgress=()=>{}){
 onProgress('Preparing the championship grounds…');
 await Promise.all(['rough-cut-architecture-surfaces-v1','rough-cut-needle-sprays-v1','rough-cut-verge-atlas-v1','final-cut-reed-clumps-v1','final-cut-rough-clumps-v1','final-cut-stone-materials-v1','final-cut-ground-materials-v1','final-cut-industrial-materials-v1','rough-cut-night-sky-v2','rough-cut-moon-v1','rough-cut-cloud-atlas-v2','rough-cut-far-ridge-v1','rough-cut-distant-treeline-v1','rough-cut-distant-clubhouse-v1'].map(Art.source));
 if(Art.stats().errors.length)throw Error('Course materials could not load. Reload to retry.');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'',software=/swiftshader|software|llvmpipe/i.test(gpu);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#18252d');scene.fog=new THREE.Fog('#26383b',42,138);
 const camera=new THREE.PerspectiveCamera(58,16/9,.08,180);camera.rotation.order='YXZ';
 const skyLight=new THREE.HemisphereLight('#b9d6dc','#455738',2);scene.add(skyLight);const moonlight=new THREE.DirectionalLight('#a4c8d4',1.7);moonlight.position.set(-28,28,-72);scene.add(moonlight,moonlight.target);
 moonlight.castShadow=!software;moonlight.shadow.mapSize.set(2048,2048);Object.assign(moonlight.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:.5,far:145});moonlight.shadow.bias=-.00015;moonlight.shadow.normalBias=.035;moonlight.shadow.autoUpdate=false;
 const nightFog=new THREE.Color('#0c1919'),litFog=new THREE.Color('#243238');
 const backdrop=createParallax({travelScale:.25,storm:.15,night:.18});scene.background=null;
 const grass=Art.texture('final-cut-ground-materials-v1',[0,0,512,512],null,true),stone=Art.texture('rough-cut-architecture-surfaces-v1',[1024,0,512,512],null,true),paving=Art.texture('final-cut-stone-materials-v1',[0,0,512,512],null,true),wood=Art.texture('rough-cut-architecture-surfaces-v1',[0,0,512,512],null,true);
 const materials={};
 for(const [name,color,map]of [['grass','#c1cbb0',grass],['stripe','#cbd5b8',grass],['rough','#abb892',grass],['stone','#9d9982',stone],['path','#bcc2b6',paving],['wood','#827450',wood],['green','#1b4840'],['cream','#d5cfb0'],['metal','#728481'],['dark','#172523'],['brass','#b9994f'],['red','#9c4636'],['water','#3b7779'],['road','#303d3d'],['seat','#697e72']])materials[name]=new THREE.MeshLambertMaterial({color,map});
 for(const [name,color]of [['lamp','#ffe1a4'],['mint','#9be6d1'],['amber','#ffbd63'],['white','#d5ddc3']])materials[name]=new THREE.MeshBasicMaterial({color});
 for(const name of ['wingLamp','headLamp','floodLamp'])materials[name]=new THREE.MeshBasicMaterial({color:'#1b211b'});
 const lampDark=new THREE.Color('#1b211b'),lampWarm=new THREE.Color('#ffe1a4');
 materials.gravel=new THREE.MeshLambertMaterial({map:Art.texture('final-cut-ground-materials-v1',[0,512,512,512],null,true),color:'#c9c7b6'});
 const atlasImage=await Art.source('final-cut-industrial-materials-v1');
 const atlasCell=(col,row)=>{const x=Math.round(col*atlasImage.width/4),y=Math.round(row*atlasImage.height/2);return Art.texture('final-cut-industrial-materials-v1',[x,y,Math.round((col+1)*atlasImage.width/4)-x,Math.round((row+1)*atlasImage.height/2)-y],null,true);};
 for(const [name,col,row,tint]of [['green',0,0,'#d4dfd5'],['metal',1,0,'#cbd9dc'],['dark',2,0,'#b6c2c4'],['brass',3,0,'#c5c2a7'],['wood',0,1,'#aaa99d'],['cream',1,1,'#d4dbc9'],['red',3,1,'#c8b6a1']]){materials[name].map=atlasCell(col,row);materials[name].color.set(tint);}
 materials.roof=new THREE.MeshLambertMaterial({map:atlasCell(1,0),color:'#7f999f'});
 materials.slate=new THREE.MeshLambertMaterial({map:atlasCell(2,1),color:'#a3b1b7'});
 const stoneCell=(col,row)=>Art.texture('final-cut-stone-materials-v1',[col*512,row*512,512,512],null,true);
 for(const [name,col,row,tint]of [['ashlar',0,0,'#bcc2b6'],['ashlarWarm',1,0,'#c5c4b2'],['ashlarDark',2,0,'#b0bbba'],['coping',0,1,'#c4c8bc'],['ashlarMoss',1,1,'#aeb7a0'],['mortar',2,1,'#73786e']])materials[name]=new THREE.MeshLambertMaterial({map:stoneCell(col,row),color:tint});
 materials.stone.map=stoneCell(0,0);materials.stone.color.set('#bac1b2');
 materials.moss=new THREE.MeshLambertMaterial({map:stoneCell(1,1),color:'#8b9b78'});
 const surfaceScales=finishCourseSurfaces(materials);
 const groundFinish=finishFinalCutGround(materials);
 for(const m of Object.values(materials))if(m.map)m.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const unit=new THREE.BoxGeometry(),cylinder=new THREE.CylinderGeometry(1,1,1,12),sphere=new THREE.IcosahedronGeometry(1,1),staticParts=new Map(),staticSigns=[],atlasResources=[],walkingSurfaces=[],dummy=new THREE.Object3D();
 function mesh(mat,geo,x,y,z,sx,sy,sz,parent=null,rx=0,ry=0,rz=0){
  if(parent){const m=new THREE.Mesh(geo,materials[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);parent.add(m);return m;}
  const key=mat+':'+geo.uuid;if(!staticParts.has(key))staticParts.set(key,{mat,geo,items:[]});staticParts.get(key).items.push({x,y,z,sx,sy,sz,rx,ry,rz});return null;
 }
 const box=(mat,x,y,z,w,h,d,parent)=>mesh(mat,unit,x,y,z,w,h,d,parent);
 const cyl=(mat,x,y,z,r,h,parent,rz=0)=>mesh(mat,cylinder,x,y,z,r,h,r,parent,0,0,rz);
 function sign(text,x,y,z,width=4,height=1.4,color='#d1c69d',bg='#172c27',parent=scene,kind='direction'){
  const c=document.createElement('canvas');c.width=1024;const pixelStep=width<1?8:width<3?4:width<8?2:1;c.height=Math.max(pixelStep*4,Math.round(1024*height/width/pixelStep)*pixelStep);const ctx=c.getContext('2d');let layout;
  function paint(value){layout=paintFinalCutSign(ctx,value,{width,height,color,bg,kind});}
  paint(text);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),finalCutSignMaterial(texture));m.position.set(x,y,z);const back=new THREE.Mesh(m.geometry,new THREE.MeshLambertMaterial({color:bg}));back.rotation.y=Math.PI;back.position.z=-.005;m.add(back);parent.add(m);m.userData.signText=text;m.userData.signLayout=layout;m.userData.write=value=>{paint(value);m.userData.signText=value;m.userData.signLayout=layout;texture.needsUpdate=true;};m.userData.paint=draw=>{draw(ctx,c.width,c.height);texture.needsUpdate=true;};if(parent===scene)staticSigns.push({mesh:m,canvas:c});else atlasResources.push(texture,m.material,back.material);return m;
 }
 // The central turf slabs supply the floor. Keep the surrounding ground out
 // of that footprint so its new surface treatment does not add a third layer.
 for(const x of [-52,52])box('grass',x,-.2,-46,56,.4,146);
 box('grass',0,-.2,11.5,48,.4,31);box('grass',0,-.2,-109.5,48,.4,19);
 for(const slab of GROUND_SLABS){mesh(slab.material,unit,slab.x,slab.top-slab.h/2,-slab.y,slab.w,slab.h,slab.d,null,0,-(slab.yaw||0));staticParts.get(slab.material+':'+unit.uuid).items.at(-1).walkingSurface=slab.id;}
 const courseContour=createFinalCutCourseContour(scene,materials.grass);
 // Pale service paths flank the hole; their markings remain readable when cut.
 for(const x of [-23,23]){for(let y=5;y<96;y+=4)box('cream',x,.04,-y,.2,.015,.55);}
 const refugeLights=[];
 for(const s of REFUGES){
  const warm=new THREE.SpotLight('#ffd091',38,4.2,.94,.55,1.5);warm.position.set(s.x,2.48,-s.y);warm.target.position.set(s.x,0,-s.y);scene.add(warm,warm.target);refugeLights.push(warm);
  cyl('metal',s.x,2.73,-s.y,.035,.18);box('dark',s.x,2.59,-s.y,.46,.16,.46);box('lamp',s.x,2.50,-s.y,.34,.025,.34);
  for(const side of [-1,1]){box('brass',s.x+side*.18,2.47,-s.y,.025,.12,.41);box('brass',s.x,2.47,-s.y+side*.18,.41,.12,.025);}
  box('green',s.x,2.9,-s.y,s.w+.7,.3,s.d+.7);for(const w of WALLS.filter(w=>w.id.startsWith(s.id)&&!ROUTE_WALLS.includes(w)))box('mortar',w.x,(w.h-.115)/2,-w.y,w.w-.065,w.h-.115,w.d-.065);
  sign(s.id==='pump'?'PUMP / BYPASS':s.name.toUpperCase(),s.x,2.64,-s.y+s.d/2+.48,s.id==='pavilion'?3.5:2.8,.34,'#ded3a9','#172c27',scene,'identity');for(const side of [-1,1])box('metal',s.x+side*.95,2.79,-s.y+s.d/2+.44,.045,.4,.045);
  if(s.id==='bunker'){const rise=REFUGE_ARCHITECTURE.bunker.rise;const roofLabel=sign('',s.x+2.5,3.12+rise*(1-2.5/((s.w+.9)/2))+.16,-s.y+1.5,2.5,.65,'#d5cfb0','#1b4840');roofLabel.userData.decal=true;roofLabel.rotation.set(-Math.PI/2,Math.atan2(rise,(s.w+.9)/2),0);roofLabel.userData.paint((ctx,w,h)=>{ctx.fillStyle='#1b4840';ctx.fillRect(0,0,w,h);ctx.fillStyle='#d5cfb0';ctx.font='bold 160px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('BUNKER',w/2,h/2);});}
 }
 const refugeLighting=createRefugeLighting(scene,{box,software});
 // A real masonry bank creates a sheltered approach; the marked crossing at
 // its west end remains exposed to the final strip. Both paths reconnect.
 for(const w of ROUTE_WALLS)box('mortar',w.x,(w.h-.115)/2,-w.y,w.w-.065,w.h-.115,w.d-.065);
 for(const [name,points]of Object.entries(FINAL_ROUTES)){
  let a=FORK;
  for(const b of points){const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),bank=Math.min(a.y,b.y)>=55.7&&Math.max(a.y,b.y)<=60.3||Math.min(a.y,b.y)>=71.7;
   if(!bank)for(let d=.5;d<length;d+=1.5)mesh(name==='bank'?'cream':'mint',unit,a.x+dx*d/length,.045,-a.y-dy*d/length,.13,.025,.45,null,0,Math.atan2(-dx,dy));
   a=b;
  }
 }
 const forkSign=sign('PAVILION\n← BANK WALK / LONG\nOPEN CROSSING / SHORT →',FORK_SIGN.x,1.6,-FORK_SIGN.y,FORK_SIGN.d,.75);forkSign.rotation.y=Math.PI/2;cyl('metal',FORK_SIGN.x-.025,.9,-FORK_SIGN.y,.024,1.8);
 sign('BANK WALK\nCROSS AFTER THE PASS',-2,1.45,-58.06,2.7,.58);
 sign('PAVILION →',-14.5,1.55,-74.16,2.2,.35);
 sign('MIDDLE STRIP\nROUGH DOES NOT STOP REELS',17,1.5,-43.1,2.8,.55,'#ded3a9','#172c27',scene,'warning');cyl('metal',17.35,.62,-43.14,.04,1.24);box('metal',17.35,1.25,-43.12,.28,.06,.06);
 // Both branch paths are real geometry. They converge below the same raised
 // overlook; all walls use the simulation's collision dimensions.
 for(const w of ARRIVAL_WALLS)box('mortar',w.x,(w.h-.115)/2,-w.y,w.w-.065,w.h-.115,w.d-.065);
 box('mortar',OVERLOOK.x,(OVERLOOK.h-.115)/2,0,OVERLOOK.w-.065,OVERLOOK.h-.115,OVERLOOK.d-.065);
 box('path',OVERLOOK.x,OVERLOOK.h+.015,0,OVERLOOK.w-.4,.03,OVERLOOK.d-.4);
 // A permanent, shielded safety lamp lights the observation deck and ramp
 // while the tournament floodlights are off. The pole sits inside the west
 // parapet footprint; its cap is above the player's reachable head height.
 cyl('metal',-8,7.05,-4,.055,2.3);box('dark',-8,8.24,-4,.65,.16,.45);box('lamp',-8,8.145,-4,.48,.025,.3);
 const safetyLight=new THREE.PointLight('#ffe0ae',40,24,2);safetyLight.position.set(-8,8.1,-4);scene.add(safetyLight);
 function ramp(y0,y1,h0,h1){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-4,h0,-y0,0,h0,-y0,-4,h1,-y1,0,h1,-y1],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,2,1,2],2));g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();scene.add(new THREE.Mesh(g,materials.path));}
 ramp(OVERLOOK_RAMPS.entry.start,OVERLOOK_RAMPS.entry.end,0,OVERLOOK.h);ramp(OVERLOOK_RAMPS.exit.start,OVERLOOK_RAMPS.exit.end,OVERLOOK.h,0);
 box('path',-2,.015,14,36,.03,4);box('path',-2,.015,12,4,.03,4);
 for(const x of [-18,18]){box('stone',x,.02,15,8,.04,5);box(x<0?'green':'stone',x,3.35,15,8.4,.3,5.4);for(const z of [13,17])box('lamp',x,2.9,z,3,.07,.08);}
 // Closed garage shutter behind the player, with no occupied chase vehicle.
 for(let i=0;i<13;i++)box('metal',-21.77,.15+i*.23,15,.08,.17,4.5);
 for(const z of [13.2,16.8])box('brass',-21.65,1.5,z,.15,2.9,.18);
 const garageLabel=sign('SERVICE WALK',-13.7,2.7,15,2,.45);garageLabel.rotation.y=-Math.PI/2;
 // Damp sluice: pipes, ribbed tunnel mouth and a shallow water channel.
 box('water',18,.05,16.8,7.5,.02,.6);for(let x=14;x<=21;x+=1.2){box('metal',x,2.8,15,.08,.1,4.5);for(const z of [12.8,17.2])box('metal',x,1.4,z,.08,2.8,.08);}
 mesh('metal',cylinder,18,2.7,17,.12,7,.12,null,0,0,Math.PI/2);
 for(let z=13;z<=17;z+=.45)box('dark',21.77,1.5,z,.08,2.9,.08);
 const sluiceLabel=sign('KEEPER’S SLUICE',13.7,2.4,15,2,.45);sluiceLabel.rotation.y=Math.PI/2;
 for(const x of [-8,7]){const marker=sign(x<0?'OVERLOOK ↰':'OVERLOOK ↱',x,1.2,14.4,2.3,.5);marker.rotation.y=x<0?-Math.PI/2:Math.PI/2;cyl('metal',x,.55,14.4,.04,1.1);}
 sign('18 / CHAMPIONSHIP OVERLOOK',-2,OVERLOOK.h+.9,5.22,8,.6);
 // The close announcement sits on the side parapet, leaving the bunker and
 // destination view open. Both branch entrants can inspect it without a timer.
 const receiptFrame=new THREE.Group();scene.add(receiptFrame);
 for(const z of [-1.3,1.3])cyl('metal',-7.8,OVERLOOK.h+1,z,.035,.8);
 box('green',-7.79,OVERLOOK.h+1.65,0,.12,1.6,3.3);
 const receiptBoard=sign('FINAL ROUND\nASSOCIATE ANALYST\n18 · THE FINAL CUT',-7.71,OVERLOOK.h+1.65,0,3.2,1.5,'#dfd1a2','#122a26',receiptFrame,'board');receiptBoard.rotation.y=Math.PI/2;
 cyl('metal',-7.5,OVERLOOK.h+1.625,-5,.035,1.85);
 box('metal',-7.5,OVERLOOK.h+2.55,-5,.4,.35,.3);box('dark',-7.5,OVERLOOK.h+2.55,-4.83,.3,.25,.04);
 for(const fence of ACCESS_FENCE){box('metal',fence.x,.95,-fence.y,fence.w,.1,fence.d);box('metal',fence.x,.5,-fence.y,fence.w,.06,fence.d);for(let x=fence.x-fence.w/2;x<=fence.x+fence.w/2;x+=2)box('metal',x,.55,-fence.y,.08,1.1,.08);}
 const accessGate=new THREE.Group();accessGate.position.set(ACCESS_GATE.x,0,-ACCESS_GATE.y);scene.add(accessGate);for(const h of [.5,.95])box('metal',0,h,0,4,.09,.12,accessGate);for(const x of [-2,-1,0,1,2])box('metal',x,.55,0,.08,1.1,.1,accessGate);
 const accessLamps=[ACCESS,OVERLOOK_ACCESS].map(control=>{const h=groundHeight(control),upper=control===OVERLOOK_ACCESS;box('green',control.x,h+(upper?.45:.6),-control.y,.4,upper?.9:1.2,.4);sign('ROUND',control.x,h+(upper?.56:.86),-control.y+.211,.34,.1);const lamp=box('amber',control.x,h+(upper?.75:1.1),-control.y+.23,.15,.15,.04,scene);lamp.userData.dynamic=true;return lamp;});
 // Joe's service bay and access apron are separate from the pedestrian route.
 box('stone',BAY.x,1.7,-14,7,3.4,.4);box('stone',36.5,1.7,-17,.3,3.4,6);for(const y of [14,20])box('metal',29.5,1.7,-y,.12,3.4,.12);box('green',BAY.x,3.5,-17,7.5,.25,6.5);
 box('dark',BAY.x,1.5,-14.22,2.2,3,.08);box('lamp',BAY.x,3,-19.8,2.4,.12,.1);
 const maintenanceLight=createMaintenanceLight(scene,materials,{software});
 const baySign=sign('EQUIPMENT BAY\nSTAFF ACCESS',29.15,3.7,-17,5,1);baySign.rotation.y=-Math.PI/2;
 for(let y=2;y<94;y+=5)for(const x of [-25.7,25.7]){const length=Math.min(5,94-y);cyl('metal',x,1.1,-y,.045,2.2);box('metal',x,1.3,-y-length/2,.035,.04,length);box('metal',x,.6,-y-length/2,.035,.04,length);}
 // Structural empty seating stays outside the playable boundary.
 const grandstand=buildFinalCutGrandstand({mesh,box,cyl,sign,unit});
 // Lightweight sponsor cloth hangs beyond the east boundary, visible through
 // the pump shelter opening. Its rail stays fixed while the cloth deforms.
 const banner=UNEASE_BANNER;
 for(const y of [banner.y-1.5,banner.y+1.5])cyl('metal',banner.x,1.55,-y,.045,3.1);
 box('metal',banner.x,2.86,-banner.y,.08,.08,3.1);
 const clothGeometry=new THREE.PlaneGeometry(banner.width,banner.clothHeight,12,6),clothRest=clothGeometry.attributes.position.array.slice(),clothColors=[];
 for(let i=0;i<clothRest.length;i+=3){const band=clothRest[i+1]>.45||clothRest[i+1]<-.45,c=new THREE.Color(band?'#b9a572':'#426d61');clothColors.push(c.r,c.g,c.b);}
 clothGeometry.setAttribute('color',new THREE.Float32BufferAttribute(clothColors,3));
 const clothMaterial=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),cloth=new THREE.Mesh(clothGeometry,clothMaterial);
 cloth.position.set(banner.x,banner.height,-banner.y);cloth.rotation.y=-Math.PI/2;cloth.frustumCulled=false;scene.add(cloth);
 let bannerFold=0;
 for(const y of [17,88]){cyl('wood',-30,3,-y,.16,6);box('green',-30,5.4,-y+.20,4,1.8,.12);sign('ACCEPTANCE\nIS EVERYTHING',-30,5.4,-y+.28,3.7,1.5);}
 const score=new THREE.Group();score.position.set(12,0,-95);scene.add(score);for(const x of [-6,6])cyl('metal',x,4.45,0,.13,8.9,score);box('dark',0,7.1,0,13,3.5,.4,score);
 const normalBoard=sign('FINAL ROUND\nASSOCIATE ANALYST\n18 · THE FINAL CUT',0,7.1,.23,12.4,3.1,'#dfd1a2','#122a26',score,'board'),endBoard=sign('COURSE CONDITION:\nEXCELLENT',0,7.1,.25,12.4,3.1,'#b3e3ce','#122a26',score,'board');endBoard.visible=false;
 for(const x of [-6,6]){box('metal',x,8.92,.12,.08,.14,.34,score);box('dark',x,8.96,.4,.52,.2,.65,score);box('lamp',x,8.85,.4,.4,.025,.48,score);}
 cyl('cream',0,2.8,-88,.045,5.6);box('red',.6,5.1,-88,1.2,.65,.04);
 for(let x=-38;x<40;x+=5)box('cream',x,.04,-107,2,.02,.12);
 sign('PUBLIC ROAD\nLEAVE THE COURSE',0,1.7,-104,3.5,1);cyl('metal',0,.7,-104,.055,1.4);
 for(let x=-25;x<=25;x+=2)if(Math.abs(x)>2){box('metal',x,1.3,-94,.07,2.6,.07);box('metal',x,1.1,-94,2,.055,.055);}for(const x of [-2,2])box('metal',x,1.3,-94,.1,2.6,.1);for(const x of [-3,3])cyl('metal',x,3.25,-94,.08,6.5);sign('PUBLIC ROAD / EXIT',0,6.5,-93.9,5.5,.65,'#b3e3ce');
 const exitGate=new THREE.Group();exitGate.position.set(-2,0,-94);scene.add(exitGate);for(let x=0;x<=4;x+=.4)box('metal',x,1.3,0,.04,2.6,.045,exitGate);for(const y of [.2,1.3,2.5])box('metal',2,y,0,4,.05,.05,exitGate);
 const publicSideSign=sign('COURSE CLOSED',0,3.5,-94.03,5,.8);publicSideSign.rotation.y=Math.PI;
 // Distant floodlight silhouettes frame the authored moon and cloud layers.
 for(const baseX of [-28,27])for(const y of [22,70]){const x=baseX===27&&y===22?47:baseX;cyl('metal',x,5,-y,.1,10);box('dark',x,10,-y,1.6,.5,.3);box('floodLamp',x,9.9,-y+.18,1.4,.23,.02);}
 // Elevated stone skirt around the nursery; the water itself stays out of routes.
 // Nursery paving is part of GROUND_SLABS.
 sign('NURSERY SWALE\nNO HEAVY MACHINERY',17,1.4,-83,2.6,.75,'#ded3a9','#172c27',scene,'warning');cyl('metal',17,.6,-83,.05,1.2);
 const irrigation=createFinalCutIrrigation(scene,{materials,software});
 // Bypass hardware and connected pipe provide a visible cause for flooding.
 const pumpHardware=buildFinalCutPumpHardware({box,mesh,unit,cylinder,scene,materials});
 const lever=new THREE.Group();lever.position.set(PUMP.x,1.1,-PUMP.y+.42);scene.add(lever);box('brass',0,.18,0,.07,.6,.08,lever);box('red',0,.45,0,.4,.09,.12,lever);
 sign('BYPASS',PUMP.x,.8,-PUMP.y+.312,.7,.18);
 box('wood',NOTE.x,.7,-NOTE.y,.9,1.4,.55);const record=sign('LOAD LIMIT\nKEEP HEAVY EQUIPMENT\nOFF SATURATED TURF',NOTE.x,1.45,-NOTE.y+.3,1.8,1.1,'#29362e','#d3c69f',scene,'paper');
 record.userData.dynamic=true;
 // The collected sheet carries its small spring clip; it disappears with
 // the paper rather than leaving a floating fastener when the record is taken.
 box('metal',0,.515,.014,.32,.07,.018,record);box('brass',0,.548,.025,.20,.022,.035,record);
 // A permanent diagram stays on the shelter wall after the paper copy is taken.
 // The same source is readable in the paused journal, including compact screens.
 const maintenanceImage=new Image();maintenanceImage.src=new URL('./assets/final-cut-load-limit.svg',import.meta.url).href;await maintenanceImage.decode();
 const maintenanceDiagram=sign('',6.9,1.6,-41.62,2,1.32);
 maintenanceDiagram.userData.paint((ctx,w,h)=>ctx.drawImage(maintenanceImage,0,0,w,h));
 for(const x of [5.96,7.84])for(const y of [1,2.2])box('metal',x,y,-41.59,.045,.045,.02);
 const basketRim=new THREE.TorusGeometry(.28,.02,4,16);
 for(const b of BALL_BASKETS){
  cyl('green',b.x,.06,-b.y,.3,.12);for(let k=0;k<12;k++){const a=k*Math.PI/6;box('metal',b.x+Math.cos(a)*.28,.3,-b.y+Math.sin(a)*.28,.025,.5,.025);}
  for(const h of [.12,.48])mesh('metal',basketRim,b.x,h,-b.y,1,1,1,null,Math.PI/2);
  for(let k=0;k<7;k++)mesh('white',sphere,b.x+Math.sin(k*7)*.17,.4+(k%2)*.05,-b.y+Math.cos(k*7)*.17,.055,.055,.055);
  const label=sign('PRACTICE BALLS',b.x+.2,.88,-b.y+.2,1,.22);label.rotation.y=Math.PI/4;cyl('metal',b.x+.14,.65,-b.y+.14,.025,.5);
 }
 cyl('metal',BELL.x,1,-BELL.y,.06,2);const bell=new THREE.Group();bell.position.set(BELL.x,1.9,-BELL.y);scene.add(bell);mesh('brass',new THREE.ConeGeometry(.3,.45,12,1,true),0,0,0,1,1,1,bell,Math.PI,0,0);sign('GROUNDS BELL',BELL.x,2.26,-BELL.y+.085,1.2,.26);box('metal',BELL.x,2.17,-BELL.y+.025,.12,.08,.12);cyl('metal',BELL.x,2.14,-BELL.y,.035,.28);
 const rough=createFinalCutRough(scene);
 const breakables=BREAKABLES.map(b=>{
  const root=new THREE.Group(),intact=new THREE.Group(),debris=new THREE.Group();root.position.set(b.x,0,-b.y);root.add(intact,debris);scene.add(root);debris.visible=false;
  if(b.kind==='board'){
   for(const x of [-b.w*.4,b.w*.4]){box('wood',x,b.h/2,0,.09,b.h,.09,intact);box('wood',x,.06,0,.2,.12,b.d,intact);}
   box('green',0,b.h*.7,0,b.w,b.h*.6,.12,intact);sign('FINAL REVIEW',0,b.h*.7,.07,b.w-.1,b.h*.5,'#e2d6ac','#142e2b',intact);
  }else{
   const top=b.kind==='table'?.85:.5;box('wood',0,top,0,b.w,.12,b.d,intact);
   for(const x of [-b.w*.4,b.w*.4])for(const z of [-b.d*.35,b.d*.35])box('metal',x,top/2,z,.09,top,.09,intact);
   if(b.kind==='bench')box('wood',0,.9,-b.d*.4,b.w,.35,.1,intact);
   else{box('cream',.35,.99,.1,.5,.12,.35,intact);cyl('brass',-.45,1.05,-.15,.09,.28,intact);}
  }
  const pieces=[];for(let i=0;i<8;i++){const m=box(i%3?'wood':'metal',0,0,0,b.w*(i%3?.36:.1),.08,b.d*.28,debris);m.userData.dynamic=true;pieces.push(m);}
  return {data:b,intact,debris,pieces};
 });
 // Await the already-loaded atlas canvas before baking per-spray atlas UVs.
 Art.texture('rough-cut-needle-sprays-v1');await Promise.resolve();
 const landscape=createFinalCutLandscape(scene);
 Art.texture('rough-cut-verge-atlas-v1');await Promise.resolve();
 const verges=createFinalCutVerges(scene,{materials});
 // Index compaction saves software vertex work; hardware is faster with the
 // original static buffer. Both tiers retain identical plants and animation.
 const ambushReeds=createAmbushReeds(scene,{cull:software});
 // Fixed painted signs share one lit atlas and
 // draw. Mutable scoreboard/record/furniture signs keep their own parents.
 const estateDetail=buildFinalCutEstateDetail({box,cyl,mesh,unit,cylinder,sign});
 materials.refugeDamp=materials.moss.clone();materials.refugeDamp.opacity=.36;materials.refugeDamp.transparent=true;materials.refugeDamp.depthWrite=false;materials.refugeDamp.onBeforeCompile=materials.moss.onBeforeCompile;materials.refugeDamp.customProgramCacheKey=materials.moss.customProgramCacheKey;
 const refugeInteriors=buildFinalCutRefugeInteriors({mesh,unit,cylinder});
 // Backing plates and corner fasteners follow each sign's actual final
 // orientation, including side-facing entrance labels; roof stencils stay paint.
 scene.updateMatrixWorld(true);
 const mountPoint=new THREE.Vector3();let mountedSigns=0;
 for(const {mesh:m}of staticSigns){if(m.userData.dynamic||m.userData.decal)continue;const {width:w,height:h}=m.geometry.parameters;
  mountPoint.set(0,0,-.027).applyMatrix4(m.matrixWorld);mesh('metal',unit,mountPoint.x,mountPoint.y,mountPoint.z,w+.025,h+.025,.035,null,m.rotation.x,m.rotation.y,m.rotation.z);
  for(const side of [-1,1])for(const end of [-1,1]){mountPoint.set(side*w*.47,end*h*.35,.007).applyMatrix4(m.matrixWorld);const size=Math.min(.025,h*.08);mesh('brass',unit,mountPoint.x,mountPoint.y,mountPoint.z,size,size,.012,null,m.rotation.x,m.rotation.y,m.rotation.z);}mountedSigns++;
 }
 // A mutable scene-root sign bypasses atlas baking, so retain its original
 // texture and materials for disposal just like parented scoreboard signs.
 for(const {mesh:m}of staticSigns)if(m.userData.dynamic)atlasResources.push(m.material.map,m.material,m.children[0].material);
 const labels=staticSigns.filter(s=>!s.mesh.userData.dynamic),maxTexture=gl.getParameter(gl.MAX_TEXTURE_SIZE),columns=Math.max(1,Math.min(4,Math.floor(maxTexture/1024))),rows=[];let atlasHeight=0;
 for(let i=0;i<labels.length;i+=columns){const row=labels.slice(i,i+columns),h=Math.max(...row.map(s=>s.canvas.height));row.forEach((s,k)=>rows.push({...s,x:k*1024,y:atlasHeight}));atlasHeight+=h;}
 if(columns&&atlasHeight<=maxTexture){
  const atlas=document.createElement('canvas');atlas.width=columns*1024;atlas.height=atlasHeight;const ctx=atlas.getContext('2d'),positions=[],uvs=[],indices=[],point=new THREE.Vector3();scene.updateMatrixWorld(true);
  for(const s of rows){ctx.drawImage(s.canvas,s.x,s.y);for(const [face,back]of [[s.mesh,false],[s.mesh.children[0],true]]){const pos=face.geometry.getAttribute('position'),uv=face.geometry.getAttribute('uv'),offset=positions.length/3;for(let i=0;i<pos.count;i++){point.fromBufferAttribute(pos,i).applyMatrix4(face.matrixWorld);positions.push(point.x,point.y,point.z);uvs.push((s.x+(back?0:uv.getX(i)*(s.canvas.width-1))+.5)/atlas.width,1-(s.y+(back?0:(1-uv.getY(i))*(s.canvas.height-1))+.5)/atlas.height);}for(const i of face.geometry.index.array)indices.push(offset+i);}scene.remove(s.mesh);s.mesh.material.map.dispose();s.mesh.material.dispose();s.mesh.children[0].material.dispose();s.mesh.geometry.dispose();}
  const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();const signs=new THREE.Mesh(geometry,finalCutSignMaterial(texture));signs.name='StaticSignAtlas';scene.add(signs);atlasResources.push(texture,signs.material);
 }
 // Static scenery keeps every original instance, but software submits only
 // the spatial batches intersecting each camera/light. Hardware retains the
 // larger batches. Shared geometry/materials and authored transforms agree.
 const staticMeshes=[],masonryBatching={spatial:software,cellSize:software?16:0,batches:0,instances:0},staticBatching={spatial:software,cellSize:software?16:0,batches:0,instances:0};
 for(const {mat,geo,items:sourceItems}of staticParts.values()){
  // Keep the overlapping metal box/cylinder batches in their original order:
  // spatial sorting otherwise changes the winner at coincident rail fittings.
  const masonry=mat.startsWith('ashlar')||mat==='coping',spatial=software&&mat!=='metal',bins=new Map();
  for(const p of sourceItems){const key=spatial?Math.floor(p.x/16)+','+Math.floor(p.z/16):'all';if(!bins.has(key))bins.set(key,[]);bins.get(key).push(p);}
  for(const [cell,items]of bins){
   const m=new THREE.InstancedMesh(geo,materials[mat],items.length);m.name='FinalCutStatic-'+mat+'-'+cell;
   m.castShadow=['stone','ashlar','ashlarWarm','ashlarDark','ashlarMoss','coping','mortar','green','wood','metal','roof','slate','path'].includes(mat);items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy,p.sz);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);if(p.walkingSurface)walkingSurfaces.push({mesh:m,index:i,id:p.walkingSurface});});m.computeBoundingSphere();scene.add(m);staticMeshes.push(m);
   if(masonry){masonryBatching.batches++;masonryBatching.instances+=items.length;}
   staticBatching.batches++;staticBatching.instances+=items.length;
  }
 }
 onProgress('Preparing Joe and the tournament rig…');
 const rig=new THREE.Group();scene.add(rig);const body=new THREE.Group();rig.add(body);
 const contactMeshes=[],audit=(id,m,instance=null)=>{contactMeshes.push({id,mesh:m,parent:m.parent,instance});return m;};
 const engine=createFinalCutEngine(body,audit),bodywork=createFinalCutBodywork(body,audit),lamps=createFinalCutLamps(materials,audit);
 lamps.addHeadlamps(body);
 for(const b of RIG_BODY)if(!b.id.startsWith('headlamp-')&&!engine.addPart(b)&&!bodywork.addPart(b))audit(b.id,box(b.material,b.side,b.height,-b.forward,b.w,b.h,b.d,body));
 const tires=createFinalCutTires(RIG_WHEELS[0]);
 const wheels=[];for(const spec of RIG_WHEELS){const w=new THREE.Group();w.position.set(spec.side,spec.height,-spec.forward);body.add(w);tires.add(w,spec.id,audit);wheels.push(w);}
 const cab=new THREE.Group();cab.position.set(0,.8,-.1);body.add(cab);box('green',0,.45,0,2.2,.15,1.8,cab);
 const seatMeshes=[];for(const [name,spec]of [['seat',CAB.seat],['seatBack',CAB.seatBack],['seatSupport',CAB.seatSupport]]){const m=box(name==='seatSupport'?'metal':'dark',spec.x,spec.y,spec.z,spec.w,spec.h,spec.d,body);m.rotation.x=spec.tilt||0;seatMeshes.push({name,mesh:m,spec});}
 for(const x of [-1,1])for(const z of [-.9,1.05])box('metal',x,1.65,z,.08,2.3,.08,cab);const cabFixture=lamps.addCab(cab),cabLighting=createCabLighting(body,cabFixture,audit,{software});
 const steering=new THREE.Group();steering.position.set(CAB.wheel.x,CAB.wheel.y,CAB.wheel.z);steering.rotation.x=CAB.wheel.tilt;body.add(steering);
 const wheelRim=new THREE.Mesh(new THREE.TorusGeometry(CAB.wheel.radius,.035,5,12),materials.dark);steering.add(wheelRim);
 for(const angle of [0,Math.PI*2/3,Math.PI*4/3]){const spoke=box('metal',Math.sin(angle)*.11,Math.cos(angle)*.11,0,.025,.22,.035,steering);spoke.rotation.z=-angle;}
 cyl('metal',CAB.wheel.x,1.73,CAB.wheel.z,.04,.75,body);
 const cutControl=new THREE.Group();cutControl.position.set(CAB.lever.x,CAB.lever.y,CAB.lever.z);body.add(cutControl);cyl('metal',0,CAB.lever.length/2,0,.025,CAB.lever.length,cutControl);box('brass',0,CAB.lever.length,0,.11,.07,.08,cutControl);
 const machinery=createFinalCutMachinery(audit);
 const centerReel=machinery.addReel('reel-0',body,0,RIG_BANK.reelHeight,-RIG_BANK.reelForward,RIG_BANK.hinge*2);
 const wings=[];for(const side of [-1,1]){
  const wing=new THREE.Group();wing.position.set(side*RIG_BANK.hinge,RIG_BANK.height,-RIG_BANK.forward);body.add(wing);
  let reel;for(const p of RIG_WING_PARTS){if(p.id==='reel')reel=machinery.addReel(wingPartId(p,side),wing,side*p.side,p.height,-p.forward,p.w);else if(p.id==='lamp')lamps.add(wing,{...p,side:side*p.side},'wingLamp',0,wingPartId(p,side));else if(!bodywork.addWingPart(p,side,wing,wingPartId(p,side)))audit(wingPartId(p,side),box(p.material,side*p.side,p.height,-p.forward,p.w,p.h,p.d,wing));}
  wings.push({wing,reel,side});
 }
 const hydraulics=createFinalCutHydraulics(body,materials,audit);
 const boss=createFinalCutBoss(body,wings,wheels);
 const headlights=createFinalCutHeadlights(renderer,body,{software});
 const gltf=await new GLTFLoader().loadAsync('./assets/models/joe-riding-pixel.glb'),rider=gltf.scene;
 rider.traverse(o=>{if(o.name==='MowerRigidBody'||o.name.startsWith('Wheel'))o.visible=false;if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});
 const joeFinish=await finishFinalCutJoe(rider);joeFinish.prepare(renderer);
 rider.position.set(0,1.05,.05);body.add(rider);
 const joeActor=createFinalCutJoe(rider,gltf.animations,scene,body,steering,cutControl);
 const actorCulling=createFinalCutActorCulling(rider);actorCulling.update();
 for(const sign of [-1,1]){box('metal',sign*1.48,1.75,.2,.055,1.25,.055,body);box('metal',sign*1.4,1.3,.15,.22,.055,.15,body);}
 const aimMaterials={clear:new THREE.MeshBasicMaterial({color:'#9be6d1',depthTest:false,depthWrite:false}),blocked:new THREE.MeshBasicMaterial({color:'#ffbd63',depthTest:false,depthWrite:false}),recovery:new THREE.MeshBasicMaterial({color:'#d5ddc3',depthTest:false,depthWrite:false})};
 atlasResources.push(...Object.values(aimMaterials));
 const ballGeometry=new THREE.SphereGeometry(1,8,4),ballMeshes=new THREE.InstancedMesh(ballGeometry,materials.white,MAX_WORLD_BALLS),ballRings=new THREE.InstancedMesh(new THREE.TorusGeometry(.18,.012,3,20),aimMaterials.recovery,MAX_WORLD_BALLS),aimDots=new THREE.InstancedMesh(ballGeometry,materials.mint,49),aimTarget=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,4,24),aimMaterials.clear);
 for(const m of [ballMeshes,ballRings,aimDots,aimTarget]){scene.add(m);m.visible=false;m.frustumCulled=false;}aimTarget.renderOrder=8;ballRings.renderOrder=7;
 // Airborne cuttings are short individual blades, independent of the rooted
 // rough atlas. Reusing standing plants here would launch entire grass clumps.
 const clippingGeometry=new THREE.BufferGeometry();
 clippingGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.035,0,0,.035,0,0,.018,.32,.025,-.008,.49,.06],3));
 clippingGeometry.setIndex([0,1,2,0,2,3]);clippingGeometry.computeVertexNormals();
 const clippingMaterial=new THREE.MeshLambertMaterial({color:'#829052',side:THREE.DoubleSide});
 const clippings=new THREE.InstancedMesh(clippingGeometry,clippingMaterial,72);clippings.frustumCulled=false;scene.add(clippings);clippings.visible=false;
 // Rigid details retain their animated parent (wheel, wing, gate, lever).
 // Batch only siblings sharing geometry/material; independent reels and
 // breaking fragments remain individually animated.
 const parents=[];scene.traverse(o=>{if(o.children.length)parents.push(o);});
 for(const parent of parents){const batches=new Map();for(const m of [...parent.children]){if(!m.isMesh||m.isInstancedMesh||m.isSkinnedMesh||m.userData.dynamic||![unit,cylinder].includes(m.geometry)||Array.isArray(m.material))continue;const key=m.geometry.uuid+':'+m.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(m);}for(const parts of batches.values()){if(parts.length<2)continue;const batched=new THREE.InstancedMesh(parts[0].geometry,parts[0].material,parts.length);parts.forEach((m,i)=>{m.updateMatrix();batched.setMatrixAt(i,m.matrix);parent.remove(m);});batched.computeBoundingSphere();parent.add(batched);}}
 let renderQuality=finalCutRenderSize(1,1,{software}),backgroundDraws=0,backgroundTriangles=0;
 let width=0,height=0,lastRun=null,frameMs=0,lastBoard='';
 scene.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];o.receiveShadow=mats.some(m=>m.isMeshLambertMaterial);}});
 // Software retains architectural occlusion; tiny machinery self-shadows are
 // reserved for hardware. Neither tier changes the threat or sight rules.
 for(const root of [...(software?[]:[rig]),accessGate,exitGate])root.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&o.visible&&![materials.lamp,materials.headLamp,materials.wingLamp].includes(o.material))o.castShadow=true;});
 await Promise.resolve();
 await renderer.compileAsync(backdrop.scene,backdrop.camera);
 await renderer.compileAsync(scene,camera);
 onProgress('Preparing moving light and shelter shadows…');
 renderer.setSize(1,1,false);for(const light of headlights.lights)light.shadow.needsUpdate=true;
 renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4));
 return {rigGeometry(){
  scene.updateMatrixWorld(true);const v=new THREE.Vector3(),matrix=new THREE.Matrix4(),instanceMatrix=new THREE.Matrix4();
  return contactMeshes.map(({id,mesh,parent,instance})=>{mesh.updateMatrix();matrix.multiplyMatrices(parent.matrixWorld,mesh.matrix);if(instance!==null){mesh.getMatrixAt(instance,instanceMatrix);matrix.multiply(instanceMatrix);}const pos=mesh.geometry.attributes.position,points=[];for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(matrix);points.push([v.x,v.y,-v.z]);}return {id,points,triangles:Array.from(mesh.geometry.index.array)};});
 },render(r,prefs={}){
  const start=performance.now(),w=canvas.clientWidth,h=canvas.clientHeight;
  renderQuality=finalCutRenderSize(w,h,{tier:prefs.visualTier,resolution:prefs.resolution,software});
  const boardText=championshipBoard(r);if(boardText!==lastBoard){lastBoard=boardText;normalBoard.userData.write(boardText);receiptBoard.userData.write(boardText);}
  if(width!==renderQuality.width||height!==renderQuality.height){width=renderQuality.width;height=renderQuality.height;renderer.setSize(width,height,false);camera.aspect=w/h;}
  camera.clearViewOffset();camera.fov=prefs.fov||58;camera.updateProjectionMatrix();camera.position.set(r.player.x,groundHeight(r.player)+(r.player.crouch?1.1:1.72),-r.player.y);camera.rotation.set(-r.player.pitch,-r.player.yaw-r.player.rearAngle,0,'YXZ');
  if(r.mode==='caught'&&r.failure?.rig){
   const view=defeatView(r.failure);camera.fov=58;camera.position.set(view.eye.x,view.eye.y,view.eye.z);camera.lookAt(view.target.x,view.target.y,view.target.z);
   // Reserve space for the retry card without covering the frozen machine.
   camera.setViewOffset(w,h,w>700?-w*.22:0,w>700?0:h*.25,w,h);camera.updateProjectionMatrix();
  }
  const j=r.rig;rig.position.set(j.x,0,-j.y);rig.rotation.y=-j.yaw;
  const wash=courseLightState(r);
  camera.updateMatrixWorld();backdrop.update(camera,r.time,prefs.reduced,r.mode==='paused');
  skyLight.intensity=.12+.98*wash;moonlight.intensity=(.04+1.66*wash)*(1-backdrop.moonCoverage()*.3);
  const snap=48/2048,mx=Math.round(r.player.x/snap)*snap,mz=Math.round(-r.player.y/snap)*snap;moonlight.target.position.set(mx,0,mz);moonlight.position.set(mx-28,28,mz-72);
  if(!software)moonlight.shadow.needsUpdate=true;
  scene.fog.color.copy(nightFog).lerp(litFog,wash);
  materials.floodLamp.color.copy(lampDark).lerp(lampWarm,wash);
  const atmosphere=uneaseFrame(r,prefs.reduced),clothPoints=clothGeometry.attributes.position;bannerFold=atmosphere.fold;
  for(let i=0;i<clothPoints.count;i++){
   const x=clothRest[i*3],y=clothRest[i*3+1],drop=(banner.clothHeight/2-y)/banner.clothHeight;
   const crease=Math.sin((x/banner.width+.5)*Math.PI)*drop;
   const breeze=prefs.reduced||atmosphere.age!==null?0:Math.sin(r.time*.7+x*2+drop)*.025*drop;
   clothPoints.setXYZ(i,x,y+bannerFold*.25*crease,bannerFold*.65*crease+breeze);
  }
  clothPoints.needsUpdate=true;clothGeometry.computeVertexNormals();
  const collapse=collapsePose(r.ending.age,prefs.reduced);
  body.position.y=r.won?-collapse.sink+collapse.shudder:0;body.rotation.z=r.won?collapse.roll:0;
  const lampState=rigLampState(r);materials.wingLamp.color.copy(lampDark).lerp(lampWarm,lampState.marker);materials.headLamp.color.copy(lampDark).lerp(lampWarm,lampState.beam);
  const mechanics=machineryPose(r,prefs.reduced);centerReel.rotation.x=mechanics.reel;
  for(const {wing,reel,side}of wings){wing.rotation.z=side*(1-j.deployment)*1.15+(r.won?side*collapse.wing*(side<0?1:.35):0);reel.rotation.x=mechanics.reel;}
  hydraulics.update(-wings[0].wing.rotation.z,wings[1].wing.rotation.z);
  boss.update(r);engine.update(r);
  wheels.forEach((w,k)=>w.rotation.set(mechanics.wheels[k],-rigWheelAngle(j,{side:w.position.x,forward:-w.position.z}),0,'YXZ'));tires.update(r);headlights.update(r);
  const acting=cabPerformance(r,prefs.reduced);steering.rotation.set(CAB.wheel.tilt,0,acting.wheel);cutControl.rotation.x=acting.lever;
  joeActor.update(r,prefs.reduced);joeFinish.update(r);maintenanceLight.update(r);cabLighting.update(r);refugeLighting.update(r,camera);
  actorCulling.update();
  irrigation.update(r,prefs.reduced);
  pumpHardware.update(r);
  ambushReeds.update(r,prefs.reduced);verges.update(r,prefs.reduced);
  rough.update(r,prefs.reduced);lastRun=r;
  for(const b of breakables){const broken=r.broken.includes(b.data.id);b.intact.visible=!broken;b.debris.visible=broken;if(broken){const age=prefs.reduced?1:r.breakTimes[b.data.id]===undefined?1:clamp((r.time-r.breakTimes[b.data.id])/.55,0,1);b.pieces.forEach((m,i)=>{m.position.set(Math.sin(i*7)*b.data.w*.5*age,.06+(1-age)*b.data.h*.6+Math.sin(age*Math.PI)*.45,Math.cos(i*5)*b.data.d*.7*age);m.rotation.set(.1*age,i*1.7*age,Math.sin(i)*.2*age);});}}
  clippings.visible=!prefs.reduced&&j.phase==='pass'&&j.speed>0;
  if(clippings.visible){let count=0;for(let i=0;i<72;i++){const t=(r.time*2+i*.173)%1,across=Math.sin(i*13)*5.2,along=1.3-t*2.6,sn=Math.sin(j.yaw),cs=Math.cos(j.yaw),y=j.y+cs*along-sn*across,x=j.x+sn*along+cs*across,from={x:j.x+sn*1.3+cs*across,y:j.y+cs*1.3-sn*across};const active=SECTORS.some(s=>inside(from,s));dummy.position.set(x,.16+Math.sin(t*Math.PI)*(1+(i%4)*.15),-y);dummy.rotation.set(t*5,i*1.3,t*3);dummy.scale.setScalar(active?.16:0);dummy.updateMatrix();clippings.setMatrixAt(i,dummy.matrix);if(active)count++;}clippings.visible=count>0;clippings.instanceMatrix.needsUpdate=true;}
  accessGate.position.x=ACCESS_GATE.x-4*r.arrival.gate;for(const lamp of accessLamps)lamp.material=materials[r.arrival.open?'mint':'amber'];
  lever.rotation.z=r.pump?-1.25:0;exitGate.rotation.y=r.won?-(1-r.ending.gate)*Math.PI/2:0;record.visible=!r.loadLimit;bell.rotation.z=Math.sin(r.time*16)*.25*(r.bellCooldown/3);
  normalBoard.visible=!r.won;endBoard.visible=r.won;
  let ringCount=0;ballMeshes.count=r.balls.length;ballMeshes.visible=!!r.balls.length;
  for(let i=0;i<r.balls.length;i++){const b=r.balls[i],p=b.landed?b:flightPoint(b.plan,b.age/b.plan.duration);dummy.position.set(p.x,p.z,-p.y);dummy.rotation.set(0,0,0);dummy.scale.setScalar(.055);dummy.updateMatrix();ballMeshes.setMatrixAt(i,dummy.matrix);
   if(b.landed&&r.ballCount<3&&distance(r.player,b)<5&&Math.abs(groundHeight(r.player)-b.z)<.75&&lineClear(r.player,b,.4)){dummy.position.y=p.z+.08;dummy.quaternion.copy(camera.quaternion);dummy.scale.setScalar(clamp(distance(r.player,b)/8,.4,1));dummy.updateMatrix();ballRings.setMatrixAt(ringCount++,dummy.matrix);}
  }ballMeshes.instanceMatrix.needsUpdate=true;ballRings.count=ringCount;ballRings.visible=ringCount>0;ballRings.instanceMatrix.needsUpdate=true;
  const aim=r.ballAim;aimDots.visible=aimTarget.visible=aim.active&&!!aim.plan;
  if(aimDots.visible){const plan=aim.plan;aimDots.material=materials[plan.blocked?'amber':'mint'];aimTarget.material=aimMaterials[plan.blocked?'blocked':'clear'];aimDots.count=plan.points.length;
   plan.points.forEach((p,i)=>{dummy.position.set(p.x,p.z,-p.y);dummy.rotation.set(0,0,0);dummy.scale.setScalar(.035);dummy.updateMatrix();aimDots.setMatrixAt(i,dummy.matrix);});aimDots.instanceMatrix.needsUpdate=true;aimTarget.position.set(plan.target.x,plan.target.z+.12,-plan.target.y);aimTarget.quaternion.copy(camera.quaternion);aimTarget.scale.setScalar(clamp(distance(r.player,plan.target)/16,.3,2));
  }
  renderer.autoClear=false;renderer.clear();renderer.render(backdrop.scene,backdrop.camera);backgroundDraws=renderer.info.render.calls;backgroundTriangles=renderer.info.render.triangles;renderer.clearDepth();renderer.render(scene,camera);renderer.autoClear=true;frameMs=performance.now()-start;
 },stats:()=>({gpu,software,width,height,renderQuality,backdrop:backdrop.stats(),draws:renderer.info.render.calls+backgroundDraws,backgroundDraws,triangles:renderer.info.render.triangles+backgroundTriangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,frameMs,actorCulling:actorCulling.stats(),headlights:headlights.stats(),maintenanceLight:maintenanceLight.stats(),cabLighting:cabLighting.stats(),refugeLighting:refugeLighting.stats(),courseLighting:{wash:lastRun?courseLightState(lastRun):0,ambient:skyLight.intensity,directional:moonlight.intensity,safety:safetyLight.intensity,refugeLights:refugeLights.length,moonShadow:!software,moonShadowSize:software?0:2048},reveal:lastRun?rigLampState(lastRun):null,ambushReeds:ambushReeds.stats(),landscape:landscape.stats(),verges:verges.stats(),courseContour:courseContour.stats(),estateDetail,refugeInteriors,mountedSigns,grandstand,irrigation:irrigation.stats(),pumpHardware:pumpHardware.stats(),boss:boss.stats(),engine:engine.stats(),tires:tires.stats(),lamps:lamps.stats(),bodywork:bodywork.stats(),machinery:machinery.stats(),hydraulics:hydraulics.stats(),surfaceScales,groundFinish:groundFinish.stats(),masonryBatching,staticBatching,banner:{fold:bannerFold,hemDepth:clothGeometry.attributes.position.getZ(84),hemHeight:clothGeometry.attributes.position.getY(84),pinnedDepth:clothGeometry.attributes.position.getZ(6),pinnedHeight:clothGeometry.attributes.position.getY(6)},rider:true,joe:joeActor.stats(),joeFinish:joeFinish.stats(),collapse:collapsePose(lastRun?.ending.age||0),roughSectors:rough.stats().sectors,mownTufts:rough.stats().mownTufts,standingTufts:rough.stats().standingTufts,rough:rough.stats(),brokenProps:breakables.filter(b=>b.debris.visible).length}),dispose(){joeActor.dispose();joeFinish.dispose();backdrop.dispose();moonlight.shadow.map?.dispose();moonlight.shadow.mapPass?.dispose();boss.dispose();engine.dispose();tires.dispose();lamps.dispose();ambushReeds.dispose();headlights.dispose();maintenanceLight.dispose();cabLighting.dispose();refugeLighting.dispose();bodywork.dispose();hydraulics.dispose();machinery.dispose();irrigation.dispose();pumpHardware.dispose();landscape.dispose();verges.dispose();courseContour.dispose();groundFinish.dispose();staticMeshes.forEach(m=>m.dispose());renderer.dispose();scene.traverse(o=>o.geometry?.dispose());Object.values(materials).forEach(m=>m.dispose());rough.dispose();clippingMaterial.dispose();clothMaterial.dispose();atlasResources.forEach(r=>r.dispose());}};
}

