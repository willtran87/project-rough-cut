import * as THREE from './vendor/three/three.module.js';
import {COURSE} from './back-nine-course.js';
import {terrainHeight,contourGround} from './course-terrain.js';
import {coursePatch} from './back-nine-landscape.js';
import {FLOOD_DRY_CULL_RATIO,floodShoreGLSL} from './back-nine-flood-shore.js';
import {finishTurfCondition} from './back-nine-turf-condition.js';

// The head is at the centre of its actual wet footprint. Each emitted drop
// retains its launch heading as the rotor turns; it never orbits in midair.
export function sprinklerDrop(zone,clock,index,boosted=false){
 const flight=boosted?1.05:1.3,age=((clock/flight+(index+.16*Math.sin(index*31))/(boosted?32:24))%1+1)%1;
 const angle=(clock-age*flight)*1.35+zone.y*.013+(index%5-2)*.014;
 const reach=zone.r*(boosted?.96:.86)*( .97+.03*Math.sin(index*17)),x=zone.x+Math.sin(angle)*reach*age,y=zone.y+Math.cos(angle)*reach*age;
 const ground=terrainHeight(x,y),height=ground+.25*(1-age)+4*(boosted?2.1:1.45)*age*(1-age);
 return {x,y,height,age,angle,landingX:zone.x+Math.sin(angle)*reach,landingY:zone.y+Math.cos(angle)*reach};
}

export function createIrrigationArt({scene,map,materials,put,box,cylinder,wetMasks=null,turfConditionMaps=null}){
 const time={value:0},dummy=new THREE.Object3D(),waterMaterial=new THREE.MeshLambertMaterial({map,color:0xffffff,transparent:true,depthWrite:false});
 waterMaterial.onBeforeCompile=s=>{
  s.uniforms.floodTime=time;
  s.vertexShader='attribute vec2 floodLocal;varying vec2 vFloodLocal;varying vec3 vFloodPoint;varying float vFloodPocket;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vFloodLocal=floodLocal;vFloodPoint=(modelMatrix*vec4(transformed,1.0)).xyz;
   vFloodPocket=.70+.18*sin(vFloodPoint.x*.73+sin(vFloodPoint.z*.37))+.12*cos(vFloodPoint.z*.51+vFloodPoint.x*.2);
  `);
  s.fragmentShader='uniform float floodTime;varying vec2 vFloodLocal;varying vec3 vFloodPoint;varying float vFloodPocket;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   vec2 floodPixel=floor(vFloodPoint.xz*32.0)/32.0;
   float radial=length(vFloodLocal);
   ${floodShoreGLSL}
   float waterCover=clamp(vFloodPocket,.25,1.0)*shore;
   vec3 submerged=texture2D(map,vFloodPoint.xz/4.4).rgb;
   // Saturated blades remain readable under shallow water. The bank changes
   // toward muddy olive rather than ending in a uniform black disk.
   diffuseColor.rgb=(submerged*2.05+vec3(.018))*mix(vec3(.23,.23,.14),vec3(.11,.20,.20),shore);
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`
   float grazing=1.0-clamp(dot(normal,geometryViewDir),0.0,1.0);
   float wave=1.0-abs(fract(floodPixel.x*.38+floodPixel.y*1.1+submerged.g*1.4-floodTime*.24)-.5)*2.0;
   float glint=smoothstep(.97,.999,wave)*waterCover*smoothstep(.68,.86,vFloodPocket)*smoothstep(.11,.24,submerged.g);
   // Broken sky-coloured reflections are confined to pooled water. Nearby
   // lamps/beacon still illuminate the actual material through Lambert light.
   vec3 sky=vec3(.0045,.008,.011)*(1.0+grazing*grazing*2.0);
   outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.34,.40,.43));
   outgoingLight=mix(outgoingLight,outgoingLight*.56+sky,waterCover*.7);
   outgoingLight+=glint*vec3(.006,.012,.015)*(1.0+grazing);
   #include <opaque_fragment>
  `);
 };
 waterMaterial.customProgramCacheKey=()=> 'back-nine-submerged-turf-shore-v2';
 if(turfConditionMaps)finishTurfCondition(waterMaterial,turfConditionMaps.dry,turfConditionMaps.soil,turfConditionMaps.field,'texture2D(map,vFloodPoint.xz/4.4).rgb');
 const water=[],heads=[],geometry=new THREE.BoxGeometry(.16,.065,.085);
 for(const w of COURSE.wet){
  // Geometry stops at the physical wet boundary. The irregular translucent
  // margin blends into retained turf without extending onto dry ground.
  const flat=coursePatch(THREE,w.y,0);flat.scale(w.r,1,w.r);flat.translate(w.x,.055,-w.y);
  const basin=contourGround(THREE,flat);flat.dispose();const p=basin.attributes.position,local=[];
  for(let i=0;i<p.count;i++)local.push((p.getX(i)-w.x)/w.r,(p.getZ(i)+w.y)/w.r);
  basin.setAttribute('floodLocal',new THREE.Float32BufferAttribute(local,2));
  const mesh=new THREE.Mesh(basin,waterMaterial);scene.add(mesh);water.push(mesh);
  put(cylinder,'iron',w.x,.065,-w.y,.19,.13,.19);
  put(cylinder,'brass',w.x,.15,-w.y,.12,.06,.12);
  // Recessed bolt plate, buried feed pipe and protective turf collar.
  for(const side of [-1,1])box('iron',w.x+side*.14,.14,-w.y,.035,.025,.035);
  box('iron',w.x,.025,-w.y+.3,.07,.05,.55);
  const head=new THREE.Mesh(geometry,materials.brass);head.position.set(w.x,terrainHeight(w.x,w.y)+.22,-w.y);scene.add(head);heads.push(head);
 }
 const dropGeometry=new THREE.OctahedronGeometry(.023);dropGeometry.scale(.65,1.6,.65);
 const dropMaterial=new THREE.MeshLambertMaterial({color:0xb5d2c9,emissive:0x0b181b});
 // Fine impact spray shares the jet's geometry/material and draw submission.
 // Small solid facets keep the pixel silhouette without large alpha planes.
 const drops=new THREE.InstancedMesh(dropGeometry,dropMaterial,144);drops.userData.rigidInstanceBounds=true;drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);drops.frustumCulled=false;drops.count=0;scene.add(drops);
 const ringGeometry=new THREE.TorusGeometry(.13,.009,3,16);ringGeometry.rotateX(-Math.PI/2);
 const ringMaterial=new THREE.MeshLambertMaterial({color:0x779d99,emissive:0x071014});
 const rings=new THREE.InstancedMesh(ringGeometry,ringMaterial,24);rings.userData.rigidInstanceBounds=true;rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);rings.frustumCulled=false;rings.count=0;scene.add(rings);
 let owner=null,last=0,clock=0,active=0,visible=0,boosted=0,mist=0;
 function update(run,actor,states,reduced=false){
  if(owner!==run){owner=run;last=run.time||0;clock=run.time||0;}
  const dt=Math.max(0,(run.time||0)-last);last=run.time||0;
  // Sprinklers always run: Reduced motion calms the camera, not the water.
  if(run.mode!=='paused')clock+=dt;
  time.value=clock;active=visible=boosted=mist=0;let count=0,splashes=0;
  for(const [i,w]of COURSE.wet.entries()){
   const phase=states[i],near=Math.hypot(actor.x-w.x,actor.y-w.y)<55;
   water[i].visible=!!phase.active&&near;
   wetMasks?.value[i].set(w.x,-w.y,water[i].visible?w.r*FLOOD_DRY_CULL_RATIO:0);
   heads[i].visible=near;heads[i].position.y=terrainHeight(w.x,w.y)+(phase.active?.22:.12);
   if(phase.active){active++;if(phase.manual)boosted++;}
   if(!phase.active||!near)continue;visible++;
   heads[i].rotation.y=-(clock*1.35+w.y*.013);
   for(let n=0;n<(phase.manual?32:24);n++){
    const drop=sprinklerDrop(w,clock,n,!!phase.manual);
    dummy.position.set(drop.x,drop.height,-drop.y);dummy.rotation.set(0,-drop.angle,(drop.age-.5)*1.5);
    dummy.scale.setScalar(phase.manual?1.35:1);dummy.updateMatrix();drops.setMatrixAt(count++,dummy.matrix);
   }
   for(let n=0;n<8;n++){
    const age=(clock*1.9+n/8)%1,angle=(clock-age*.52)*1.35+w.y*.013,reach=w.r*(phase.manual?.96:.86);
    const x=w.x+Math.sin(angle)*reach,y=w.y+Math.cos(angle)*reach;
    dummy.position.set(x,terrainHeight(x,y)+.071,-y);dummy.rotation.set(0,angle,0);dummy.scale.set(.25+age*2.2,1-age,.25+age*2.2);dummy.updateMatrix();rings.setMatrixAt(splashes++,dummy.matrix);
   }
   for(let n=0;n<16;n++){
    const age=(clock*1.7+n/16)%1,angle=(clock-age*.58)*1.35+w.y*.013,reach=w.r*(phase.manual?.96:.86);
    const drift=age*(phase.manual?.7:.4),fan=n*2.39996;
    const x=w.x+Math.sin(angle)*reach+Math.cos(fan)*drift+age*.2,y=w.y+Math.cos(angle)*reach+Math.sin(fan)*drift;
    dummy.position.set(x,terrainHeight(x,y)+.08+Math.sin(age*Math.PI)*.38,-y);dummy.rotation.set(fan,angle,0);
    dummy.scale.setScalar((1-age)*.65);dummy.updateMatrix();drops.setMatrixAt(count++,dummy.matrix);mist++;
   }
  }
  drops.count=count;drops.visible=count>0;rings.count=splashes;rings.visible=splashes>0;
  if(count)drops.instanceMatrix.needsUpdate=true;if(splashes)rings.instanceMatrix.needsUpdate=true;
 }
 return {update,stats:()=>({active,visible,boosted,drops:drops.count-mist,mist,mistCapacity:48,dropCapacity:96,ripples:rings.count,rippleCapacity:24,clock,waterVisible:water.map(m=>m.visible),heads:heads.map(h=>({height:h.position.y,yaw:h.rotation.y}))}),
  warm(){water.forEach(m=>m.visible=true);drops.visible=rings.visible=true;drops.count=rings.count=1;dummy.position.set(0,-10,0);dummy.scale.setScalar(1);dummy.updateMatrix();drops.setMatrixAt(0,dummy.matrix);rings.setMatrixAt(0,dummy.matrix);},
  dispose(){water.forEach(m=>{scene.remove(m);m.geometry.dispose();});heads.forEach(h=>scene.remove(h));scene.remove(drops,rings);drops.dispose();rings.dispose();geometry.dispose();dropGeometry.dispose();ringGeometry.dispose();waterMaterial.dispose();dropMaterial.dispose();ringMaterial.dispose();}
 };
}
