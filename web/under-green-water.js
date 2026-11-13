import {waterPoint,distance} from './under-green-course.js';
import {channelJets} from './under-green-flow.js';
import {spraySeed,sprayDrop,impactCloud,sprayFootprint} from './under-green-spray.js';
import {floodState} from './under-green-flood.js';
import {createDrainWaterContacts,DRAIN_DRIPS,drainDripSample,waterContactHeight} from './under-green-water-contacts.js';
import {waterEffectTexture,fadingWaterInstances} from './under-green-water-particles.js';
import {CONTACT_SPLASH_DROPS,contactSplashSample} from './under-green-contact-splash.js';
import * as THREE from './vendor/three/three.module.js';

// Opaque silty beds and separate ballistic droplets. Every water material is
// lit by the scene: a failing lamp dims water as well as the surrounding stone.
export function createDrainWater(scene,waters,camera,{software=false,renderHeight=()=>600}={}){
 const time={value:0},surfaces=[],plumeFrustum=new THREE.Frustum(),plumeProjection=new THREE.Matrix4();
 for(const w of waters){
  const group=new THREE.Group();group.position.set(w.x,0,-w.y);group.rotation.y=w.axis==='x'?-Math.PI/2:0;scene.add(group);
  const energy={value:0},material=new THREE.MeshPhongMaterial({color:0xffffff,specular:0x647461,shininess:58,side:THREE.DoubleSide});
  material.userData.drainColorRole='water';
  material.onBeforeCompile=shader=>{
   shader.uniforms.drainTime=time;shader.uniforms.drainEnergy=energy;shader.uniforms.drainSize={value:new THREE.Vector2(w.width,w.depth)};
   shader.vertexShader='uniform float drainTime;uniform float drainEnergy;varying vec2 drainPoint;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    drainPoint=vec2(position.x,-position.z);
    transformed.y+=sin(position.x*5.+drainTime*1.3)*cos(position.z*4.-drainTime*.9)*.008*drainEnergy;`);
   shader.fragmentShader='uniform float drainTime;uniform float drainEnergy;uniform vec2 drainSize;varying vec2 drainPoint;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 p=floor(drainPoint*96.)/96.;
    float curl=sin(p.x*2.3+sin(p.y*1.8-drainTime*.3)*1.2);
    float silt=.5+.5*sin(p.x*3.1+p.y*1.7+curl-drainTime*.19);
    float bank=smoothstep(.62,1.,abs(p.x)/(drainSize.x*.5));
    vec2 drift=p+vec2(sin(p.y*.9+curl)*.24,sin(p.x*1.7-drainTime*.13)*.19);
    float wave=sin(drift.y*29.+sin(drift.x*6.3)*2.1+curl-drainTime*(.7+drainEnergy*1.7));
    float broken=smoothstep(.48,.86,sin(p.x*17.+p.y*4.1)*sin(p.y*7.3-p.x*3.7));
    float glint=smoothstep(.93,.995,wave)*broken;
    vec3 murk=mix(vec3(.013,.022,.016),vec3(.029,.035,.020),silt);
    murk=mix(murk,vec3(.038,.033,.019),bank*.7);
    diffuseColor.rgb=murk+glint*vec3(.008,.012,.008)*(1.-bank*.7);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
    specularStrength*=.025+glint*.65;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
    normal=normalize(normal+vec3(sin(drainPoint.x*17.+drainTime*.8)*.035,0.,sin(drainPoint.y*21.-drainTime)*.035));`);

  };
  material.customProgramCacheKey=()=> 'drain-silt-lit-v1';
  const bed=new THREE.PlaneGeometry(w.width,w.depth-.4,12,8);bed.rotateX(-Math.PI/2);
  const surface=new THREE.Mesh(bed,material);surface.position.y=.025;surface.userData.drainStaticLight=true;surface.userData.drainLightPadding=.10;group.add(surface);
  const extentX=(w.axis==='x'?w.depth:w.width)/2,extentY=(w.axis==='x'?w.width:w.depth)/2;
  const plumeBounds=new THREE.Box3(new THREE.Vector3(w.x-extentX,0,-w.y-extentY),new THREE.Vector3(w.x+extentX,1.8,-w.y+extentY));
  surfaces.push({w,group,surface,material,energy,jets:channelJets(w),plumeBounds,flowing:false});
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
    const impactHeight=Math.max(v.surface.position.y,floodDepth);
    // Visibility affects only this frame's drawing. Phase remains analytic,
    // so a Q rear glance reveals an already-moving plume without restarting it.
    if(!s.danger||channelDistance>32||!plumeFrustum.intersectsBox(v.plumeBounds))continue;
    const density=THREE.MathUtils.clamp(1.1-(channelDistance-12)/24,.25,1.1);
    for(let i=0;i<perChannel;i++){
     const seed=seeds[i];if(seed.lod>=density)continue;
     const lodFade=Math.min(1,(density-seed.lod)*10),jet=v.jets[i%v.jets.length];
     const sample=sprayDrop(jet,seed,time.value,impactHeight,i>=streamCount);
     let {x,y,height:h}=sample;
     if(i>=streamCount)splashes++;
     velocity.set(v.w.axis==='x'?sample.vy:sample.vx,sample.vh,v.w.axis==='x'?sample.vx:-sample.vy).normalize();
     x=THREE.MathUtils.clamp(x,-v.w.width/2+.03,v.w.width/2-.03);y=THREE.MathUtils.clamp(y,-v.w.depth/2+.22,v.w.depth/2-.22);
     const point=waterPoint(v.w,x,y);
     dummy.position.set(point.x,Math.max(impactHeight+.004,h),-point.y);
     // Camera-facing droplets align to projected travel, preserving a small
     // rounded silhouette from front, side and rear instead of a diamond.
     viewVelocity.copy(velocity).applyQuaternion(inverseCamera);dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(-Math.atan2(viewVelocity.x,viewVelocity.y));
     viewPosition.copy(dummy.position).applyMatrix4(camera.matrixWorldInverse);
     const footprint=sprayFootprint(sample.width,sample.length,-viewPosition.z,projectionY,pixelHeight);
     if(footprint>1.001)footprintBoosted++;maxFootprintScale=Math.max(maxFootprintScale,footprint);
     dummy.scale.set(sample.width*footprint,sample.length*footprint,1);dummy.updateMatrix();drops.setMatrixAt(count,dummy.matrix);dropPool.alphas.setX(count++,sample.alpha*lodFade);
    }
    for(let i=0;i<12;i++){
     const jet=v.jets[i%v.jets.length],t=(time.value*.9+i*.371)%1,point=waterPoint(v.w,jet.end.x,jet.end.y);
     dummy.position.set(point.x,impactHeight+.004+i*.0001,-point.y);dummy.rotation.set(-Math.PI/2,0,i*2.399);
     const diameter=.05+t*.52;dummy.scale.set(diameter,diameter*(.72+random(i)*.28),1);dummy.updateMatrix();rings.setMatrixAt(ringCount,dummy.matrix);ringPool.alphas.setX(ringCount++,(1-t)*(1-t));
    }
    for(let i=0;i<v.jets.length*2;i++){
     const cloud=impactCloud(v.jets[i%v.jets.length],i,time.value,impactHeight);
     const point=waterPoint(v.w,cloud.x,cloud.y);
     dummy.position.set(point.x,cloud.height,-point.y);dummy.quaternion.copy(camera.quaternion);
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
