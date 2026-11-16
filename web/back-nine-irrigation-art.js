import * as THREE from './vendor/three/three.module.js';
import {COURSE} from './back-nine-course.js';
import {terrainHeight,contourGround} from './course-terrain.js';
import {coursePatch} from './back-nine-landscape.js';
import {FLOOD_DRY_CULL_RATIO,floodShoreGLSL} from './back-nine-flood-shore.js';
import {finishTurfCondition} from './back-nine-turf-condition.js';
import {createLampUniforms,bindLampUniforms,lampGLSL} from './back-nine-glow-sprites.js';

// The head is at the centre of its actual wet footprint. Each emitted drop
// retains its launch heading as the rotor turns; it never orbits in midair.
export function sprinklerDrop(zone,clock,index,boosted=false,out=null){
 const flight=boosted?1.05:1.3,age=((clock/flight+(index+.16*Math.sin(index*31))/(boosted?32:24))%1+1)%1;
 const angle=(clock-age*flight)*1.35+zone.y*.013+(index%5-2)*.014;
 const reach=zone.r*(boosted?.96:.86)*( .97+.03*Math.sin(index*17)),x=zone.x+Math.sin(angle)*reach*age,y=zone.y+Math.cos(angle)*reach*age;
 const ground=terrainHeight(x,y),height=ground+.25*(1-age)+4*(boosted?2.1:1.45)*age*(1-age);
 if(out){out.x=x;out.y=y;out.height=height;out.age=age;out.angle=angle;return out;}
 return {x,y,height,age,angle,landingX:zone.x+Math.sin(angle)*reach,landingY:zone.y+Math.cos(angle)*reach};
}

// Pooled water is shaded as water: ring trains spread from where each jet
// lands, mist-fall dimples and wind wavelets keep the surface alive, the cart
// leaves a wake, and both vehicle lamps rake the ripples. The lamp terms read
// the existing headlight cones through uniforms; no light is added.
export function createIrrigationArt({scene,map,materials,put,box,cylinder,wetMasks=null,turfConditionMaps=null,sprites=null,lamps=null,software=false}){
 const jets={value:COURSE.wet.map(w=>new THREE.Vector4(0,.86,0,w.r))},wake={value:new THREE.Vector4()},lampUniforms=lamps||createLampUniforms(),scratch={x:0,y:0,height:0,age:0,angle:0};
 const time={value:0},dummy=new THREE.Object3D(),waterMaterial=new THREE.MeshLambertMaterial({map,color:0xffffff,transparent:true,depthWrite:false});
 waterMaterial.onBeforeCompile=s=>{
  s.uniforms.floodTime=time;s.uniforms.floodJet=jets;s.uniforms.floodWake=wake;bindLampUniforms(s.uniforms,lampUniforms);
  s.vertexShader='attribute vec2 floodLocal;attribute float floodZone;varying vec2 vFloodLocal;varying vec3 vFloodPoint;varying float vFloodPocket;varying float vFloodZone;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vFloodLocal=floodLocal;vFloodZone=floodZone;vFloodPoint=(modelMatrix*vec4(transformed,1.0)).xyz;
   vFloodPocket=.70+.18*sin(vFloodPoint.x*.73+sin(vFloodPoint.z*.37))+.12*cos(vFloodPoint.z*.51+vFloodPoint.x*.2);
  `);
  s.fragmentShader='#define FLOOD_RINGS '+(software?5:10)+'\nuniform float floodTime;uniform vec4 floodJet[3];uniform vec4 floodWake;varying vec2 vFloodLocal;varying vec3 vFloodPoint;varying float vFloodPocket;varying float vFloodZone;\n'+lampGLSL+'float floodHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+s.fragmentShader;
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
   vec4 jet=vFloodZone<.5?floodJet[0]:(vFloodZone<1.5?floodJet[1]:floodJet[2]);
   // Metres from the head, snapped to the turf's texel grid.
   vec2 pm=floor(vFloodLocal*jet.w*32.0+.5)/32.0;
   vec2 slope=vec2(0.0);float crest=0.0;
   // A train of rings is born along the arc the jet has just swept.
   for(int k=0;k<FLOOD_RINGS;k++){
    float age=fract(floodTime*.42+float(k)/float(FLOOD_RINGS));
    float swept=jet.x-age*3.214;
    vec2 d=pm-vec2(sin(swept),-cos(swept))*jet.y*jet.w;
    float dist=length(d)+.001,u=(dist-.12-age*3.5)*3.0,g=exp(-u*u)*(1.0-age)*(1.0-age)*jet.z*1.4;
    crest+=g;slope-=d/dist*(u*g*6.0);
   }
   // Falling mist dimples the rest of the pool; wind keeps it restless.
   vec2 cell=floor(pm/1.6);float seed=floodHash(cell+vFloodZone*17.0),dimpleClock=floodTime*(.45+seed*.3)+seed*7.0,dimpleAge=fract(dimpleClock);
   vec2 dd=(fract(pm/1.6)-.5-(vec2(floodHash(cell+3.1),floodHash(cell+7.7))-.5)*.4)*1.6;
   float dimple=length(dd)+.001,du=(dimple-dimpleAge*.5)*9.0,dg=exp(-du*du)*(1.0-dimpleAge)*.5*(.35+.65*jet.z)*step(.5,fract(seed*5.3+floor(dimpleClock)*.37));
   crest+=dg*.6;slope-=dd/dimple*(du*dg*6.3);
   float w1=dot(pm,vec2(2.3,1.1))+floodTime*1.9,w2=dot(pm,vec2(-1.3,2.7))-floodTime*1.4;
   slope+=(vec2(2.3,1.1)*cos(w1)+vec2(-1.3,2.7)*cos(w2))*.05;
   if(floodWake.z>0.0){
    vec2 wd=floodPixel-floodWake.xy;float wl=length(wd)+.001,wp=wl*4.2-floodTime*8.5,wa=floodWake.z*exp(-wl*.42)*smoothstep(.5,1.3,wl);
    crest+=max(0.0,sin(wp))*wa*.8;slope+=wd/wl*cos(wp)*wa*2.6;
   }
   vec3 rippleNormal=normalize(vec3(-slope.x*.22,1.0,-slope.y*.22)),toEye=normalize(cameraPosition-vFloodPoint);
   float fresnel=.04+.96*pow(1.0-max(dot(rippleNormal,toEye),0.0),4.0);
   // The mirrored storm sky brightens toward the horizon.
   vec3 sky=mix(vec3(.040,.062,.074),vec3(.012,.021,.030),clamp(reflect(-toEye,rippleNormal).y*1.7,0.0,1.0));
   // Ripple faces turned toward a lamp catch it; a few texels glitter.
   float twinkle=step(.992,floodHash(floodPixel*32.0+floor(floodTime*7.0)*.37));
   vec3 lampGlow=vec3(0.0),lampWash=vec3(0.0);
   for(int i=0;i<2;i++){
    vec3 toLamp;float reach=glowLampReach(i,vFloodPoint,toLamp);if(reach<=0.0)continue;
    float facing=max(dot(rippleNormal,toLamp),0.0)-max(toLamp.y,0.0);
    float spec=pow(max(dot(rippleNormal,normalize(toLamp+toEye)),0.0),56.0);
    lampGlow+=glowLampColor[i]*reach*(max(facing,0.0)*.55+spec*1.6+crest*.05);lampWash+=glowLampColor[i]*reach;
   }
   outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.34,.40,.43));
   outgoingLight=mix(outgoingLight,outgoingLight*.56+sky*fresnel*1.6,waterCover*.7);
   outgoingLight+=(crest*vec3(.010,.017,.020)+lampGlow)*waterCover+lampWash*twinkle*.5*max(waterCover,dampFringe*.6);
   #include <opaque_fragment>
  `);
 };
 waterMaterial.customProgramCacheKey=()=> 'back-nine-submerged-turf-shore-v4-ripples'+(software?'-5':'-10');
 if(turfConditionMaps)finishTurfCondition(waterMaterial,turfConditionMaps.dry,turfConditionMaps.soil,turfConditionMaps.field,'texture2D(map,vFloodPoint.xz/4.4).rgb');
 const water=[],heads=[],geometry=new THREE.BoxGeometry(.16,.065,.085);
 for(const [zone,w]of COURSE.wet.entries()){
  // Geometry stops at the physical wet boundary. The irregular translucent
  // margin blends into retained turf without extending onto dry ground.
  const flat=coursePatch(THREE,w.y,0);flat.scale(w.r,1,w.r);flat.translate(w.x,.055,-w.y);
  const basin=contourGround(THREE,flat);flat.dispose();const p=basin.attributes.position,local=[];
  for(let i=0;i<p.count;i++)local.push((p.getX(i)-w.x)/w.r,(p.getZ(i)+w.y)/w.r);
  basin.setAttribute('floodLocal',new THREE.Float32BufferAttribute(local,2));basin.setAttribute('floodZone',new THREE.Float32BufferAttribute(new Float32Array(p.count).fill(zone),1));
  const mesh=new THREE.Mesh(basin,waterMaterial);scene.add(mesh);water.push(mesh);
  put(cylinder,'iron',w.x,.065,-w.y,.19,.13,.19);
  put(cylinder,'brass',w.x,.15,-w.y,.12,.06,.12);
  // Recessed bolt plate, buried feed pipe and protective turf collar.
  for(const side of [-1,1])box('iron',w.x+side*.14,.14,-w.y,.035,.025,.035);
  box('iron',w.x,.025,-w.y+.3,.07,.05,.55);
  const head=new THREE.Mesh(geometry,materials.brass);head.position.set(w.x,terrainHeight(w.x,w.y)+.22,-w.y);scene.add(head);heads.push(head);
 }
 const dropGeometry=new THREE.OctahedronGeometry(.03);dropGeometry.scale(.65,1.6,.65);
 const dropMaterial=new THREE.MeshLambertMaterial({color:0xc4dcd6,emissive:0x14262a});
 // Fine impact spray shares the jet's geometry/material and draw submission.
 // Small solid facets keep the pixel silhouette without large alpha planes.
 const drops=new THREE.InstancedMesh(dropGeometry,dropMaterial,144);drops.userData.rigidInstanceBounds=true;drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);drops.frustumCulled=false;drops.count=0;scene.add(drops);
 const ringGeometry=new THREE.TorusGeometry(.13,.009,3,16);ringGeometry.rotateX(-Math.PI/2);
 const ringMaterial=new THREE.MeshLambertMaterial({color:0x779d99,emissive:0x071014});
 const rings=new THREE.InstancedMesh(ringGeometry,ringMaterial,24);rings.userData.rigidInstanceBounds=true;rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);rings.frustumCulled=false;rings.count=0;scene.add(rings);
 let owner=null,last=0,clock=0,active=0,visible=0,boosted=0,mist=0,veil=0;
 function update(run,actor,states,reduced=false){
  if(owner!==run){owner=run;last=run.time||0;clock=run.time||0;}
  const dt=Math.max(0,(run.time||0)-last);last=run.time||0;
  // Sprinklers always run: Reduced motion calms the camera, not the water.
  if(run.mode!=='paused')clock+=dt;
  time.value=clock;active=visible=boosted=mist=veil=0;let count=0,splashes=0;
  // Wake rings follow whoever is moving through standing water.
  const wading=actor.surface==='wet'?Math.min(1,Math.abs(actor.speed||0)/8)*(run.foot?.5:1):0;wake.value.set(actor.x,-actor.y,wading,0);
  for(const [i,w]of COURSE.wet.entries()){
   const phase=states[i],near=Math.hypot(actor.x-w.x,actor.y-w.y)<55;
   water[i].visible=!!phase.active&&near;
   wetMasks?.value[i].set(w.x,-w.y,water[i].visible?w.r*FLOOD_DRY_CULL_RATIO:0);
   jets.value[i].set(clock*1.35+w.y*.013,phase.manual?.96:.86,phase.active&&near?1:0,w.r);
   heads[i].visible=near;heads[i].position.y=terrainHeight(w.x,w.y)+(phase.active?.22:.12);
   if(phase.active){active++;if(phase.manual)boosted++;}
   if(!phase.active||!near)continue;visible++;
   heads[i].rotation.y=-(clock*1.35+w.y*.013);
   for(let n=0;n<(phase.manual?32:24);n++){
    const drop=sprinklerDrop(w,clock,n,!!phase.manual,scratch);
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
   if(sprites){
    // Fine spray hangs along the arc, bursts where it lands and leaves a
    // slow veil over the pool. All of it blooms inside either lamp cone.
    const power=phase.manual?1.3:1,reach=w.r*(phase.manual?.96:.86);
    for(let n=0;n<12;n++){
     const drop=sprinklerDrop(w,clock,n*2+1,!!phase.manual,scratch);
     sprites.push(drop.x,drop.height+.05,-drop.y,.45+drop.age*1.1*power,.13,.175,.19,.34*Math.sin(drop.age*Math.PI),1,1.5,0,1.5);veil++;
    }
    for(let n=0;n<6;n++){
     const age=(clock*1.15+n/6)%1,angle=(clock-age*.7)*1.35+w.y*.013,x=w.x+Math.sin(angle)*reach+age*.9,y=w.y+Math.cos(angle)*reach;
     sprites.push(x,terrainHeight(x,y)+.3+age*1.25*power,-y,.45+age*1.6*power,.16,.215,.235,.55*(1-age)*(1-age),1,1.6,.3,2);veil++;
    }
    if(!software)for(let n=0;n<6;n++){
     const angle=n*1.047+clock*.045,radius=w.r*(.42+.28*Math.sin(n*2.1)),x=w.x+Math.sin(angle)*radius+Math.sin(clock*.11+n)*1.2,y=w.y+Math.cos(angle)*radius;
     sprites.push(x,terrainHeight(x,y)+1.25+.35*Math.sin(clock*.31+n*1.9),-y,w.r*.42,.13,.175,.19,.16,.42,1.2,.45,7);veil++;
    }
   }
  }
  drops.count=count;drops.visible=count>0;rings.count=splashes;rings.visible=splashes>0;
  if(count)drops.instanceMatrix.needsUpdate=true;if(splashes)rings.instanceMatrix.needsUpdate=true;
 }
 return {update,stats:()=>({active,visible,boosted,drops:drops.count-mist,mist,mistCapacity:48,dropCapacity:96,veil,veilCapacity:72,shaderRings:software?5:10,ripples:rings.count,rippleCapacity:24,clock,waterVisible:water.map(m=>m.visible),heads:heads.map(h=>({height:h.position.y,yaw:h.rotation.y}))}),
  warm(){water.forEach(m=>m.visible=true);drops.visible=rings.visible=true;drops.count=rings.count=1;dummy.position.set(0,-10,0);dummy.scale.setScalar(1);dummy.updateMatrix();drops.setMatrixAt(0,dummy.matrix);rings.setMatrixAt(0,dummy.matrix);},
  dispose(){water.forEach(m=>{scene.remove(m);m.geometry.dispose();});heads.forEach(h=>scene.remove(h));scene.remove(drops,rings);drops.dispose();rings.dispose();geometry.dispose();dropGeometry.dispose();ringGeometry.dispose();waterMaterial.dispose();dropMaterial.dispose();ringMaterial.dispose();}
 };
}
