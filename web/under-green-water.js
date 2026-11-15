import {applyHorizontalWaterNormal} from './under-green-water-normal.js';
import {channelShoreMeshData,channelSurfaceHeight} from './under-green-channel-shore.js';
import {waterPoint,distance} from './under-green-course.js';
import {channelJets} from './under-green-flow.js';
import {spraySeed,sprayDrop,impactCloud,sprayFootprint} from './under-green-spray.js';
import {floodState} from './under-green-flood.js';
import {createDrainWaterContacts,DRAIN_DRIPS,drainDripSample,waterContactHeight} from './under-green-water-contacts.js';
import {waterEffectTexture,fadingWaterInstances} from './under-green-water-particles.js';
import {CONTACT_SPLASH_DROPS,contactSplashSample} from './under-green-contact-splash.js';
import {SHALLOW_WATER_HEIGHT,shallowWaterHeight} from './under-green-wet-ground.js';
import * as THREE from './vendor/three/three.module.js';

// Opaque silty beds and separate ballistic droplets. Every water material is
// lit by the scene: a failing lamp dims water as well as the surrounding stone.
export function createDrainWater(scene,waters,camera,{software=false,renderHeight=()=>600,sediment}={}){
 const time={value:0},surfaces=[],plumeFrustum=new THREE.Frustum(),plumeProjection=new THREE.Matrix4();
 for(const w of waters){
  const group=new THREE.Group();group.position.set(w.x,0,-w.y);group.rotation.y=w.axis==='x'?-Math.PI/2:0;scene.add(group);
  const energy={value:0},material=new THREE.MeshPhongMaterial({color:0xffffff,specular:0x7a8576,shininess:240,side:THREE.DoubleSide});
  material.userData.drainColorRole='water';
  material.onBeforeCompile=shader=>{
   shader.uniforms.drainTime=time;shader.uniforms.drainEnergy=energy;shader.uniforms.drainSize={value:new THREE.Vector2(w.width,w.depth)};
   shader.uniforms.drainSedimentMap={value:sediment.map};shader.uniforms.drainSedimentScale={value:new THREE.Vector2(...sediment.worldTileMetres.map(m=>1/m))};
   shader.vertexShader='attribute float drainShore;attribute float drainShoreDistance;attribute vec2 drainShoreGradient;varying float drainShoreWeight;varying float drainEdgeDistance;varying vec2 drainShoreSlope;uniform float drainTime;uniform float drainEnergy;varying vec2 drainPoint;varying vec3 drainBedWorld;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    drainPoint=vec2(position.x,-position.z);
    drainShoreWeight=drainShore;
    drainEdgeDistance=drainShoreDistance;
    drainShoreSlope=drainShoreGradient*(.025+drainEnergy*.08-.0018);
    transformed.y-=(1.-drainShore)*(.025+drainEnergy*.08-.0018);
    transformed.y+=sin(position.x*5.+drainTime*1.3)*cos(position.z*4.-drainTime*.9)*.008*drainEnergy*drainShore;
    drainBedWorld=(modelMatrix*vec4(transformed,1.)).xyz;`);
   shader.fragmentShader='varying float drainShoreWeight;varying float drainEdgeDistance;varying vec2 drainShoreSlope;uniform float drainTime;uniform float drainEnergy;uniform vec2 drainSize;uniform sampler2D drainSedimentMap;uniform vec2 drainSedimentScale;varying vec2 drainPoint;varying vec3 drainBedWorld;\n'+shader.fragmentShader;
   shader.fragmentShader=`
    float drainRippleHash(vec2 cell){
     vec3 q=fract(vec3(cell.xyx)*.1031);
     q+=dot(q,q.yzx+33.33);
     return fract((q.x+q.y)*q.z);
    }
    vec2 drainRippleGradient(vec2 point){
     vec2 cell=floor(point),f=fract(point),u=f*f*(3.-2.*f),du=6.*f*(1.-f);
     float a=drainRippleHash(cell),b=drainRippleHash(cell+vec2(1.,0.));
     float c=drainRippleHash(cell+vec2(0.,1.)),d=drainRippleHash(cell+vec2(1.,1.));
     return vec2(mix(b-a,d-c,u.y)*du.x,mix(c-a,d-b,u.x)*du.y);
    }
   `+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 p=floor(drainPoint*160.)/160.;
    float curl=sin(p.x*2.3+sin(p.y*1.8-drainTime*.3)*1.2);
    float silt=.5+.5*sin(p.x*3.1+p.y*1.7+curl-drainTime*.19);
    // Sediment collects at the retaining sides and both real catch grates.
    // Narrow contact shade sits inside the existing water footprint; broken
    // deposits leave quiet stretches rather than a uniform bright foam rim.
    float sideDistance=drainSize.x*.5-abs(p.x);
    float endDistance=drainEdgeDistance;
    float shoreDistance=max(0.,min(sideDistance,endDistance));
    float shoreVariation=.5+.5*sin(p.x*11.7+sin(p.y*8.3)*2.);
    float bank=1.-smoothstep(.025,.12+shoreVariation*.13,shoreDistance);
    float contact=1.-smoothstep(.005,.045,shoreDistance);
    // Phase stays continuous across pressure changes; only amplitude changes.
    // Two crossing wave families create a softly broken reflected source.
    // Slopes are the derivatives of small 12 mm / 4 mm height fields, in
    // channel-local coordinates. The existing normal transform rotates an
    // east-west channel and its reflection together; the camera cannot drag it.
    float waveA=cos(p.x*5.2+p.y*2.6-drainTime*.9);
    float waveB=cos(p.y*10.8-p.x*1.7-drainTime*.6);
    float slopeEnergy=.3+.7*drainEnergy;
    // Millimetre capillary ripples break the reflected lamp across the broad
    // sheet. Their short wavelengths add surface structure without changing
    // the collision height or inventing a glowing diffuse stripe.
    // Two drifting irregular ripple fields avoid repeated parallel stripes.
    // The gradient is analytic, so light follows the same continuous height
    // field as the camera moves; world-local pixel sampling remains fixed.
    vec2 rippleA=drainRippleGradient(vec2(p.x*23.+p.y*7.,p.y*19.-p.x*5.)+vec2(drainTime*.19,-drainTime*.31));
    vec2 rippleB=drainRippleGradient(vec2(p.x*41.-p.y*17.,p.y*31.+p.x*11.)+vec2(-drainTime*.27,drainTime*.13));
    vec2 capillarySlope=vec2(-.004*(23.*rippleA.x-5.*rippleA.y)-.0018*(41.*rippleB.x+11.*rippleB.y),
      .004*(7.*rippleA.x+19.*rippleA.y)+.0018*(-17.*rippleB.x+31.*rippleB.y));
    float capillaryEnergy=.65+.35*drainEnergy;
    vec3 murk=mix(vec3(.013,.018,.014),vec3(.027,.030,.020),silt);
    murk=mix(murk,vec3(.031,.027,.015),bank*(.35+shoreVariation*.4));
    // The shallow channels cover a sediment-coated walking floor. Reuse its
    // authored grain at physical pixel density; it does not drift with waves.
    // Optical path length conceals that bed as pressure raises the water and
    // as the view approaches grazing. This stays in the opaque, lit pass:
    // submerged actors keep their existing depth occlusion, without sorting.
    // Refract the view onto the real walking-floor height. Grain therefore
    // sits beneath the moving surface instead of looking painted onto it.
    vec3 bedView=normalize(cameraPosition-drainBedWorld);
    vec3 bedRay=refract(-bedView,vec3(0.,1.,0.),.7502);
    float opticalDepth=max(0.,drainBedWorld.y)/max(.12,-bedRay.y);
    vec3 bedHit=drainBedWorld+bedRay*opticalDepth;
    vec2 bedPoint=floor(vec2(bedHit.x,-bedHit.z)*313.5)/313.5;
    vec3 bedColor=texture2D(drainSedimentMap,bedPoint*drainSedimentScale).rgb*vec3(.65,.60,.50);
    // Dielectric water reflects more at grazing angles. Keep that response
    // in source lighting, not in the pigment: the water cannot glow when a
    // practical goes out. A low floor preserves broken highlights overhead.
    float waterFresnel=pow(1.-max(0.,bedView.y),5.);
    float surfaceTransmission=1.-waterFresnel;
    float bedVisibility=exp(-opticalDepth*14.)*surfaceTransmission*(1.-bank*.35);
    diffuseColor.rgb=mix(murk,bedColor,bedVisibility)*(1.-contact*.55);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
    // Broad dark water is interrupted by reflected sources and moving crests.
    // Deposit margins mute the reflection but retain a thin wet transition.
    specularStrength*=(.18+waterFresnel*.34)*(1.-bank*.35);`);
   applyHorizontalWaterNormal(shader,'((-.0624*waveA+.0068*waveB)*slopeEnergy+capillarySlope.x*capillaryEnergy)*drainShoreWeight+drainShoreSlope.x','((.0312*waveA+.0432*waveB)*slopeEnergy+capillarySlope.y*capillaryEnergy)*drainShoreWeight+drainShoreSlope.y');

  };
  material.customProgramCacheKey=()=> 'drain-silt-bed-depth-v9-irregular-reflection';
  const shore=channelShoreMeshData(w),bed=new THREE.BufferGeometry();
  bed.setAttribute('position',new THREE.Float32BufferAttribute(shore.positions,3));
  bed.setAttribute('uv',new THREE.Float32BufferAttribute(shore.uv,2));
  bed.setAttribute('drainShoreDistance',new THREE.Float32BufferAttribute(shore.distances,1));
  bed.setAttribute('drainShore',new THREE.Float32BufferAttribute(shore.weights,1));
  bed.setAttribute('drainShoreGradient',new THREE.Float32BufferAttribute(shore.gradients,2));
  bed.setIndex(shore.indices);bed.computeVertexNormals();
  bed.computeBoundingSphere();bed.boundingSphere.radius+=.11;
  const surface=new THREE.Mesh(bed,material);surface.position.y=.025;surface.userData.drainStaticLight=true;surface.userData.drainLightPadding=.10;group.add(surface);
  const extentX=(w.axis==='x'?w.depth:w.width)/2,extentY=(w.axis==='x'?w.width:w.depth)/2;
  const plumeBounds=new THREE.Box3(new THREE.Vector3(w.x-extentX,0,-w.y-extentY),new THREE.Vector3(w.x+extentX,1.8,-w.y+extentY));
  const jets=channelJets(w),jetLandings=jets.map(jet=>waterPoint(w,jet.end.x,jet.end.y));
  surfaces.push({w,group,surface,material,energy,jets,jetLandings,impactHeights:new Float64Array(jets.length),plumeBounds,flowing:false});
 }
 const streamCount=software?384:768,splashCount=software?96:192,perChannel=streamCount+splashCount;
 const dropTexture=waterEffectTexture('drop'),ringTexture=waterEffectTexture('ripple');
 const contactDropCapacity=40*CONTACT_SPLASH_DROPS,dropCapacity=waters.length*perChannel+DRAIN_DRIPS.length+contactDropCapacity;
 const dropPool=fadingWaterInstances(scene,dropCapacity,dropTexture,{color:0xb8b5a7,opacity:.9,scatter:.35}),drops=dropPool.mesh;
 const contacts=createDrainWaterContacts(waters);
 const ringPool=fadingWaterInstances(scene,waters.length*12+40,ringTexture,{color:0x84927b,opacity:.38,shininess:30}),rings=ringPool.mesh;
 const sprayTexture=waterEffectTexture('spray'),mistPool=fadingWaterInstances(scene,waters.length*16,sprayTexture,{color:0xa7a69a,opacity:.24,diffuseOnly:true,scatter:.18}),mist=mistPool.mesh;
 drops.name='Drain droplets';rings.name='Drain contact ripples';mist.name='Drain impact spray';
 const dummy=new THREE.Object3D(),velocity=new THREE.Vector3(),viewVelocity=new THREE.Vector3(),viewPosition=new THREE.Vector3(),inverseCamera=new THREE.Quaternion(),color=new THREE.Color();
 const random=n=>{const v=Math.sin(n*127.1+71.7)*43758.5453;return v-Math.floor(v);};
 const seeds=Array.from({length:perChannel},(_,i)=>spraySeed(i));
 // Fixed per-instance color variation, not bright uniform foam.
 for(let i=0;i<dropCapacity;i++){color.setHex([0xaaa99b,0xbcb9aa,0x92978b,0xc3c0af][i%4]);drops.setColorAt(i,color);}
 let activeDrops=0,activeSplashes=0,activeRipples=0,activeMist=0,activeContactDrops=0,lastContactDrop=null,visibleChannels=0,footprintBoosted=0,maxFootprintScale=1;
 return {
  update(r,states,reduced,actor){
   time.value=reduced?0:r.time;let count=0,ringCount=0,mistCount=0,splashes=0;activeContactDrops=0;lastContactDrop=null;visibleChannels=0;footprintBoosted=0;maxFootprintScale=1;
   const pixelHeight=renderHeight(),projectionY=camera.projectionMatrix.elements[5];
   const floodDepth=floodState(r.elapsed).depth;inverseCamera.copy(camera.quaternion).invert();
   camera.updateMatrixWorld();plumeFrustum.setFromProjectionMatrix(plumeProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
   for(let k=0;k<surfaces.length;k++){
    const v=surfaces[k],s=states[k],channelDistance=distance(r.player,v.w),near=channelDistance<48;
    v.flowing=s.danger;v.group.visible=near;if(!near)continue;visibleChannels++;
    v.energy.value=s.level;v.surface.position.y=.025+s.level*.08;
    // Visibility affects only this frame's drawing. Phase remains analytic,
    // so a Q rear glance reveals an already-moving plume without restarting it.
    if(!s.danger||channelDistance>32||!plumeFrustum.intersectsBox(v.plumeBounds))continue;
    for(let j=0;j<v.jets.length;j++)v.impactHeights[j]=waterContactHeight(v.jetLandings[j],waters,states,floodDepth)??Math.max(floodDepth,channelSurfaceHeight(v.w,v.jets[j].end.x,v.jets[j].end.y,s.level));
    const density=THREE.MathUtils.clamp(1.1-(channelDistance-12)/24,.25,1.1);
    for(let i=0;i<perChannel;i++){
     const seed=seeds[i];if(seed.lod>=density)continue;
     const lodFade=Math.min(1,(density-seed.lod)*10),jetIndex=i%v.jets.length,jet=v.jets[jetIndex],impactHeight=v.impactHeights[jetIndex];
     const sample=sprayDrop(jet,seed,time.value+k*.713,impactHeight,i>=streamCount);
     let {x,y,height:h}=sample;
     if(i>=streamCount)splashes++;
     velocity.set(v.w.axis==='x'?sample.vy:sample.vx,sample.vh,v.w.axis==='x'?sample.vx:-sample.vy).normalize();
     x=THREE.MathUtils.clamp(x,-v.w.width/2+.03,v.w.width/2-.03);y=THREE.MathUtils.clamp(y,-v.w.depth/2+.22,v.w.depth/2-.22);
     const point=waterPoint(v.w,x,y);
     let localHeight=Math.max(floodDepth,channelSurfaceHeight(v.w,x,y,s.level));
     if(localHeight<SHALLOW_WATER_HEIGHT)localHeight=Math.max(localHeight,shallowWaterHeight(point)??0);
     dummy.position.set(point.x,Math.max(localHeight+.004,h),-point.y);
     // Camera-facing droplets align to projected travel, preserving a small
     // rounded silhouette from front, side and rear instead of a diamond.
     viewVelocity.copy(velocity).applyQuaternion(inverseCamera);dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(-Math.atan2(viewVelocity.x,viewVelocity.y));
     viewPosition.copy(dummy.position).applyMatrix4(camera.matrixWorldInverse);
     const footprint=sprayFootprint(sample.width,sample.length,-viewPosition.z,projectionY,pixelHeight);
     if(footprint>1.001)footprintBoosted++;maxFootprintScale=Math.max(maxFootprintScale,footprint);
     dummy.scale.set(sample.width*footprint,sample.length*footprint,1);dummy.updateMatrix();drops.setMatrixAt(count,dummy.matrix);dropPool.alphas.setX(count++,sample.alpha*lodFade);
    }
    for(let i=0;i<12;i++){
     const jetIndex=i%v.jets.length,jet=v.jets[jetIndex],impactHeight=v.impactHeights[jetIndex],t=(time.value*.9+i*.371)%1,point=v.jetLandings[jetIndex];
     dummy.position.set(point.x,impactHeight+.004+i*.0001,-point.y);dummy.rotation.set(-Math.PI/2,0,i*2.399);
     const diameter=.05+t*.52;dummy.scale.set(diameter,diameter*(.72+random(i)*.28),1);dummy.updateMatrix();rings.setMatrixAt(ringCount,dummy.matrix);ringPool.alphas.setX(ringCount++,(1-t)*(1-t));
    }
    for(let i=0;i<v.jets.length*2;i++){
     const jetIndex=i%v.jets.length,cloud=impactCloud(v.jets[jetIndex],i,time.value,v.impactHeights[jetIndex]);
     const point=waterPoint(v.w,cloud.x,cloud.y);
     dummy.position.set(point.x,cloud.height,-point.y);dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(i*2.399+v.jets[jetIndex].start.x);
     dummy.scale.set(cloud.width,cloud.tall,1);dummy.updateMatrix();mist.setMatrixAt(mistCount,dummy.matrix);mistPool.alphas.setX(mistCount++,cloud.alpha);
    }
   }
   if(!reduced)for(const drip of DRAIN_DRIPS){
    if(Math.hypot(drip.x-r.player.x,drip.y-r.player.y)>24)continue;
    const height=waterContactHeight(drip,waters,states,floodDepth);if(height===null)continue;
    const sample=drainDripSample(drip,r.time,height);if(!sample.falling)continue;
    dummy.position.set(drip.x,sample.height,-drip.y);dummy.quaternion.copy(camera.quaternion);dummy.scale.set(.028,.055,1);dummy.updateMatrix();drops.setMatrixAt(count,dummy.matrix);dropPool.alphas.setX(count++,1);
   }
   for(const contact of contacts.update(r,states,actor)){
    if(reduced&&contact.kind==='drip')continue;
    const age=(r.time-contact.time)/1.15,diameter=.08+age*(contact.kind==='blade'?.5:.75);
    if(Math.hypot(contact.x-r.player.x,contact.y-r.player.y)>24)continue;
    const currentHeight=waterContactHeight(contact,waters,states,floodDepth);if(currentHeight===null)continue;
    dummy.position.set(contact.x,currentHeight+.005,-contact.y);dummy.rotation.set(-Math.PI/2,0,contact.serial*2.399);
    dummy.scale.set(diameter,diameter*.82,1);dummy.updateMatrix();rings.setMatrixAt(ringCount,dummy.matrix);ringPool.alphas.setX(ringCount++,contact.strength*(1-age)**2*(reduced?.5:1));
    if(!reduced)for(let i=0;i<CONTACT_SPLASH_DROPS;i++){
     const sample=contactSplashSample(contact,i,r.time);if(!sample)continue;
     const surface=waterContactHeight(sample,waters,states,floodDepth);
     if(surface===null||sample.height<surface)continue;
     dummy.position.set(sample.x,sample.height,-sample.y);
     velocity.set(sample.vx,sample.vh,-sample.vy).normalize();viewVelocity.copy(velocity).applyQuaternion(inverseCamera);
     dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(-Math.atan2(viewVelocity.x,viewVelocity.y));
     viewPosition.copy(dummy.position).applyMatrix4(camera.matrixWorldInverse);
     const footprint=sprayFootprint(sample.width,sample.length,-viewPosition.z,projectionY,pixelHeight);
     dummy.scale.set(sample.width*footprint,sample.length*footprint,1);dummy.updateMatrix();drops.setMatrixAt(count,dummy.matrix);dropPool.alphas.setX(count++,sample.alpha);
     activeContactDrops++;lastContactDrop={kind:contact.kind,serial:contact.serial,origin:{x:contact.x,y:contact.y,height:contact.height},position:{x:sample.x,y:sample.y,height:sample.height}};
    }
   }
   activeDrops=count;activeSplashes=splashes;activeRipples=ringCount;
   dropPool.finish(count);ringPool.finish(ringCount);
   activeMist=mistCount;mistPool.finish(mistCount);
  },
  stats:()=>({footprintBoosted,maxFootprintScale,renderHeight:renderHeight(),channels:surfaces.length,visibleChannels,activeDrops,activeSplashes,activeRipples,activeMist,activeContactDrops,lastContactDrop,solidStreams:0,animationTime:time.value,dripSources:DRAIN_DRIPS,contacts:contacts.stats(),capacity:{drops:dropCapacity,contactDrops:contactDropCapacity,ripples:waters.length*12+40,mist:waters.length*16},jetsPerChannel:surfaces.map(v=>({id:v.w.id,count:v.jets.length,flowing:v.flowing})),presentation:'neutral silty droplets, gravity-driven impact fans, advecting dissipating spray and contact ripples'}),
  dispose(){for(const v of surfaces){v.material.dispose();v.surface.geometry.dispose();}dropPool.dispose();ringPool.dispose();dropTexture.dispose();ringTexture.dispose();mistPool.dispose();sprayTexture.dispose();}
 };
}
