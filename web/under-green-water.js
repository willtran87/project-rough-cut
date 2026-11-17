import {applyHorizontalWaterNormal} from './under-green-water-normal.js';
import {channelShoreMeshData,channelSurfaceHeight} from './under-green-channel-shore.js';
import {waterPoint,waterLocal,distance,onFloor,solid} from './under-green-course.js';
import {channelJets,jetPoint} from './under-green-flow.js';
import {spraySeed,sprayDrop,impactCloud,sprayFootprint} from './under-green-spray.js';
import {floodState} from './under-green-flood.js';
import {createDrainWaterContacts,DRAIN_DRIPS,drainDripSample,waterContactHeight} from './under-green-water-contacts.js';
import {waterEffectTexture,fadingWaterInstances} from './under-green-water-particles.js';
import {CONTACT_SPLASH_DROPS,contactSplashSample} from './under-green-contact-splash.js';
import {SHALLOW_WATER_HEIGHT,shallowWaterHeight} from './under-green-wet-ground.js';
import * as THREE from './vendor/three/three.module.js';

// Seepage cells sampled around the player, and a 2.9 m fall from the crown.
const NEAR_DRIP_CELLS=25,NEAR_DRIP_HEIGHT=2.9,NEAR_DRIP_FALL=Math.sqrt(NEAR_DRIP_HEIGHT/4.9);
// Opaque silty beds and separate ballistic droplets. Every water material is
// lit by the scene: a failing lamp dims water as well as the surrounding stone.
export function createDrainWater(scene,waters,camera,{software=false,renderHeight=()=>600,sediment}={}){
 const time={value:0},surfaces=[],plumeFrustum=new THREE.Frustum(),plumeProjection=new THREE.Matrix4();
 for(const w of waters){
  const group=new THREE.Group();group.position.set(w.x,0,-w.y);group.rotation.y=w.axis==='x'?-Math.PI/2:0;scene.add(group);
  const jets=channelJets(w),jetLandings=jets.map(jet=>waterPoint(w,jet.end.x,jet.end.y));
  const energy={value:0},foam={value:0},churn={value:0},wakes=[new THREE.Vector4(),new THREE.Vector4()],material=new THREE.MeshPhongMaterial({color:0xffffff,specular:0x7a8576,shininess:240,side:THREE.DoubleSide});
  material.userData.drainColorRole='water';
  material.onBeforeCompile=shader=>{
   shader.uniforms.drainTime=time;shader.uniforms.drainEnergy=energy;shader.uniforms.drainSize={value:new THREE.Vector2(w.width,w.depth)};shader.uniforms.drainFoam=foam;shader.uniforms.drainWakes={value:wakes};shader.uniforms.drainChurn=churn;shader.uniforms.drainJets={value:jets.map(jet=>new THREE.Vector2(jet.end.x,jet.end.y))};
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
   shader.fragmentShader='varying float drainShoreWeight;varying float drainEdgeDistance;varying vec2 drainShoreSlope;uniform float drainTime;uniform float drainEnergy;uniform float drainFoam;uniform float drainChurn;uniform vec4 drainWakes[2];uniform vec2 drainJets[DRAIN_JETS];uniform vec2 drainSize;uniform sampler2D drainSedimentMap;uniform vec2 drainSedimentScale;varying vec2 drainPoint;varying vec3 drainBedWorld;\n'+shader.fragmentShader;
   shader.fragmentShader=`
    // Reflection weights are set once per fragment and read by every light.
    float drainSheenLobe=0.;
    float drainSheenWall=0.;
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
    float drainFoamNoise(vec2 point){
     vec2 cell=floor(point),f=fract(point),u=f*f*(3.-2.*f);
     return mix(mix(drainRippleHash(cell),drainRippleHash(cell+vec2(1.,0.)),u.x),mix(drainRippleHash(cell+vec2(0.,1.)),drainRippleHash(cell+vec2(1.,1.)),u.x),u.y);
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
    diffuseColor.rgb=mix(murk,bedColor,bedVisibility)*(1.-contact*.55);
    // Aerated water is lit pigment, never emissive: it reads where a lamp
    // reaches it and goes dark with that lamp. Long streaks run with the
    // surge, lace gathers against the retaining sides, and each outlet's
    // landing boils while its jet runs. The amount lingers as water recedes.
    float foamBroad=drainFoamNoise(vec2(p.x*4.6+curl*.3,p.y*.85-drainTime*1.15));
    float foamFine=drainFoamNoise(vec2(p.x*17.+foamBroad*3.6,p.y*3.1-drainTime*2.2));
    float foamThread=smoothstep(.74,.95,1.-abs(2.*foamFine-1.));
    float foamStreak=foamThread*smoothstep(.76-drainFoam*.27,.92-drainFoam*.22,foamBroad)*drainFoam;
    float foamLace=(1.-smoothstep(.015,.15+foamBroad*.12,shoreDistance))*smoothstep(.42,.6,foamFine)*drainFoam;
    float foamChurn=0.;
    // Each landing boils: a bright rolling core, rings of foam that travel
    // outward from it, and steep short ripples that scatter the lamp.
    vec2 drainWakeSlope=vec2(0.);
    for(int i=0;i<DRAIN_JETS;i++){
     vec2 spill=p-drainJets[i];float reach=length(spill)+.001,rough=reach+(foamFine-.5)*.3;
     ${software?'foamChurn=max(foamChurn,1.-smoothstep(.04,.7,rough));':`float roll=.5+.5*sin(reach*15.-drainTime*8.5+foamBroad*6.+float(i)*2.1);
     foamChurn=max(foamChurn,max(1.-smoothstep(.04,.34,rough),(1.-smoothstep(.2,.95,rough))*(.25+.75*roll*roll)));
     drainWakeSlope+=spill/reach*cos(reach*13.-drainTime*9.+float(i)*1.3)*drainChurn*exp(-reach*1.5)*.3;`}
    }
    foamChurn*=drainChurn*(.6+.4*foamThread);
    // Anything wading here radiates rings that bend the lamp reflections and
    // drags a little broken foam with it: x/y is the wader in channel-local
    // metres, z its eased disturbance. The player is first, Joe second.
    float foamWake=0.;
    for(int i=0;i<2;i++){
     vec2 away=p-drainWakes[i].xy;float reach=length(away)+.001,disturbance=drainWakes[i].z;
     drainWakeSlope+=away/reach*cos(reach*8.5-drainTime*6.5+float(i)*1.7)*disturbance*exp(-reach*.4)*smoothstep(.05,.4,reach)*.5;
     foamWake=max(foamWake,disturbance*(1.-smoothstep(.3,1.7+foamBroad*.9,reach))*(.45+.55*foamThread));
    }
    float drainFoamCover=clamp(max(max(foamStreak,foamLace*.7),max(foamChurn,foamWake)),0.,1.)*drainShoreWeight;
    diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.30,.32,.28),vec3(.66,.68,.62),foamChurn),drainFoamCover*.84);
    // A broad lobe spreads each practical's reflection across the ripples,
    // and grazing water mirrors the lamp-lit masonry around that practical.
    float sheenBreak=clamp(.55+14.*(capillarySlope.x-capillarySlope.y)+.25*waveB,0.,1.6);
    drainSheenLobe=(.10+waterFresnel*.9)*(1.-bank*.35)*(1.-drainFoamCover*.7);
    drainSheenWall=waterFresnel*.08*sheenBreak*(1.-bank*.5)*(1.-drainFoamCover*.7);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
    // Broad dark water is interrupted by reflected sources and moving crests.
    // Deposit margins mute the reflection but retain a thin wet transition.
    specularStrength*=(.18+waterFresnel*.34)*(1.-bank*.35)*(1.-drainFoamCover*.75);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_phong_pars_fragment>',THREE.ShaderChunk.lights_phong_pars_fragment.replace('reflectedLight.directSpecular +=',
    'reflectedLight.directSpecular += directLight.color * material.specularColor * ( pow( saturate( dot( geometryNormal, normalize( directLight.direction + geometryViewDir ) ) ), 13. ) * drainSheenLobe + drainSheenWall );\n\treflectedLight.directSpecular +='));
   shader.fragmentShader=shader.fragmentShader.replace(/DRAIN_JETS/g,String(jets.length));
   applyHorizontalWaterNormal(shader,'((-.0624*waveA+.0068*waveB)*slopeEnergy+capillarySlope.x*capillaryEnergy+drainWakeSlope.x)*drainShoreWeight+drainShoreSlope.x','((.0312*waveA+.0432*waveB)*slopeEnergy-drainWakeSlope.y+capillarySlope.y*capillaryEnergy)*drainShoreWeight+drainShoreSlope.y');

  };
  material.customProgramCacheKey=()=> 'drain-silt-bed-depth-v12-boil-wake-broad-reflection-'+jets.length+(software?'-software':'');
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
  surfaces.push({w,group,surface,material,energy,foam,churn,wakes,jets,jetLandings,impactHeights:new Float64Array(jets.length),plumeBounds,flowing:false});
 }
 const streamCount=software?384:768,splashCount=software?96:192,perChannel=streamCount+splashCount;
 const dropTexture=waterEffectTexture('drop'),ringTexture=waterEffectTexture('ripple');
 const contactDropCapacity=40*CONTACT_SPLASH_DROPS,dropCapacity=waters.length*perChannel+DRAIN_DRIPS.length+contactDropCapacity+NEAR_DRIP_CELLS;
 const dropPool=fadingWaterInstances(scene,dropCapacity,dropTexture,{color:0xb8b5a7,opacity:.9,scatter:.35,gain:2.4}),drops=dropPool.mesh;
 const contacts=createDrainWaterContacts(waters),ringCapacity=waters.length*12+120+NEAR_DRIP_CELLS,mistCapacity=waters.length*16+120;
 const ringPool=fadingWaterInstances(scene,ringCapacity,ringTexture,{color:0x84927b,opacity:.5,shininess:30,gain:2}),rings=ringPool.mesh;
 const sprayTexture=waterEffectTexture('spray'),mistPool=fadingWaterInstances(scene,mistCapacity,sprayTexture,{color:0xb4b3a6,opacity:.5,diffuseOnly:true,scatter:.3,gain:3}),mist=mistPool.mesh;
 // Dense aerated water: the body of each outlet jet and the boil it lands in.
 const frothPerChannel=software?32:72,frothPool=fadingWaterInstances(scene,waters.length*frothPerChannel+120,sprayTexture,{color:0xc9c8ba,opacity:.82,diffuseOnly:true,scatter:.45,gain:5}),froth=frothPool.mesh;froth.name='Drain outlet froth';
 drops.name='Drain droplets';rings.name='Drain contact ripples';mist.name='Drain impact spray';
 const dummy=new THREE.Object3D(),velocity=new THREE.Vector3(),viewVelocity=new THREE.Vector3(),viewPosition=new THREE.Vector3(),inverseCamera=new THREE.Quaternion(),color=new THREE.Color();
 const random=n=>{const v=Math.sin(n*127.1+71.7)*43758.5453;return v-Math.floor(v);},nearDrip={x:0,y:0,height:NEAR_DRIP_HEIGHT,period:1,offset:0},bowPoint={x:0,y:0},wakeLast=new Float64Array(4);
 const seeds=Array.from({length:perChannel},(_,i)=>spraySeed(i));
 // Fixed per-instance color variation, not bright uniform foam.
 for(let i=0;i<dropCapacity;i++){color.setHex([0xaaa99b,0xbcb9aa,0x92978b,0xc3c0af][i%4]);drops.setColorAt(i,color);}
 let activeDrops=0,activeSplashes=0,activeRipples=0,activeMist=0,activeContactDrops=0,lastContactDrop=null,visibleChannels=0,footprintBoosted=0,maxFootprintScale=1,foamClock=null;
 return {
  update(r,states,reduced,actor){
   time.value=reduced?0:r.time;let count=0,ringCount=0,mistCount=0,frothCount=0,splashes=0;activeContactDrops=0;lastContactDrop=null;visibleChannels=0;footprintBoosted=0;maxFootprintScale=1;
   // Foam is presentation memory of the schedule: it builds through a surge
   // and thins over several seconds afterwards. A retry or time jump clears it.
   const foamStep=foamClock===null||r.time<foamClock||r.time-foamClock>.5?-1:r.time-foamClock;foamClock=r.time;
   const pixelHeight=renderHeight(),projectionY=camera.projectionMatrix.elements[5];
   const floodDepth=floodState(r.elapsed).depth;inverseCamera.copy(camera.quaternion).invert();
   camera.updateMatrixWorld();plumeFrustum.setFromProjectionMatrix(plumeProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
   for(let k=0;k<surfaces.length;k++){
    const v=surfaces[k],s=states[k],channelDistance=distance(r.player,v.w),near=channelDistance<48;
    v.flowing=s.danger;v.group.visible=near;if(!near)continue;visibleChannels++;
    v.energy.value=s.level;
    for(let n=0;n<2;n++){
     const wader=n?r.joe:r.player,local=waterLocal(wader,v.w),wake=v.wakes[n],inside=Math.abs(local.x)<v.w.width/2+.3&&Math.abs(local.y)<v.w.depth/2+.3&&(n===0||!['absent','enter'].includes(r.joe.phase));
     const moved=foamStep>0?Math.hypot(wader.x-wakeLast[n*2],wader.y-wakeLast[n*2+1])/foamStep:0,target=inside?Math.min(1,.12+moved*.3)*(n?1.25:1):0;
     wake.x=local.x;wake.y=local.y;wake.z=foamStep<0?target:wake.z+(target-wake.z)*(1-Math.exp(-foamStep*(target>wake.z?5:1.3)));
    }
    if(foamStep<0){v.foam.value=s.danger?1:0;v.churn.value=s.danger?1:0;}
    else{const target=s.danger?1:s.phase==='warning'?s.level*.3:0;v.foam.value+=(target-v.foam.value)*(1-Math.exp(-foamStep*(target>v.foam.value?2.6:.6)));v.churn.value+=((s.danger?1:0)-v.churn.value)*(1-Math.exp(-foamStep*(s.danger?4:1.1)));}v.surface.position.y=.025+s.level*.08;
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
    // A continuous white body follows each jet's own arc from nozzle to water,
    // widening as it breaks up, and three rolling heads of froth turn over at
    // its landing. Both follow the pressure, so a receding surge thins them.
    const flow=Math.min(1,s.level*1.15)*v.churn.value*Math.min(1,density*1.4),bodySteps=software?2:6;
    for(let j=0;j<v.jets.length;j++){
     const jet=v.jets[j],impactHeight=v.impactHeights[j];
     for(let n=0;n<bodySteps;n++){
      const t=(n+.5+.32*Math.sin(time.value*11+j*2.1+n*1.7))/bodySteps,a=jetPoint(jet,Math.max(0,t-.09)),b=jetPoint(jet,Math.min(1,t+.09)),from=waterPoint(v.w,a.x,a.y),to=waterPoint(v.w,b.x,b.y);
      const fromHeight=a.height+(impactHeight-.12)*(t-.09)**2,toHeight=b.height+(impactHeight-.12)*(t+.09)**2;
      dummy.position.set((from.x+to.x)/2,Math.max(impactHeight+.03,(fromHeight+toHeight)/2),-(from.y+to.y)/2);
      velocity.set(to.x-from.x,toHeight-fromHeight,-(to.y-from.y));const reach=velocity.length();velocity.normalize();
      viewVelocity.copy(velocity).applyQuaternion(inverseCamera);dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(-Math.atan2(viewVelocity.x,viewVelocity.y));
      dummy.scale.set(.1+t*.2,reach*1.7+.08,1);dummy.updateMatrix();froth.setMatrixAt(frothCount,dummy.matrix);frothPool.alphas.setX(frothCount++,flow*(.55+.3*Math.sin(time.value*14+n*2.3+j)**2)*(1-t*.35));
     }
     if(!software||j%2===0)for(let n=0;n<3;n++){
      const cycle=time.value*(1.25+n*.21)+j*.37+n*.31,phase=cycle-Math.floor(cycle),turn=(Math.floor(cycle)*2.399+j*1.3+n*2.1),radius=.06+phase*.42,landing=v.jetLandings[j];
      dummy.position.set(landing.x+Math.cos(turn)*radius,impactHeight+.05+Math.sin(Math.PI*phase)*(.16+n*.05),-(landing.y+Math.sin(turn)*radius));dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(turn);
      dummy.scale.set(.26+phase*.42,.2+phase*.26,1);dummy.updateMatrix();froth.setMatrixAt(frothCount,dummy.matrix);frothPool.alphas.setX(frothCount++,flow*Math.sin(Math.PI*phase)**1.5*.9);
     }
    }
   }
   if(!reduced)for(const drip of DRAIN_DRIPS){
    if(Math.hypot(drip.x-r.player.x,drip.y-r.player.y)>24)continue;
    const height=waterContactHeight(drip,waters,states,floodDepth);if(height===null)continue;
    const sample=drainDripSample(drip,r.time,height);if(!sample.falling)continue;
    dummy.position.set(drip.x,sample.height,-drip.y);dummy.quaternion.copy(camera.quaternion);dummy.scale.set(.028,.055,1);dummy.updateMatrix();drops.setMatrixAt(count,dummy.matrix);dropPool.alphas.setX(count++,1);
   }
   // Ceiling seepage around the player: one analytic drip per 2.4 m cell, so
   // a rear glance or a retry never restarts it. A drop that meets standing
   // or shallow water leaves a ring; one that meets dry paving just ends.
   const cellX=Math.round(r.player.x/2.4),cellY=Math.round(r.player.y/2.4);
   for(let n=0;n<NEAR_DRIP_CELLS;n++){
    const cx=cellX+n%5-2,cy=cellY+Math.floor(n/5)-2,seed=cx*37.3+cy*91.7;
    nearDrip.x=(cx+(random(seed)-.5)*.8)*2.4;nearDrip.y=(cy+(random(seed+1)-.5)*.8)*2.4;nearDrip.period=3.1+random(seed+2)*4.6;nearDrip.offset=random(seed+3)*9;
    const cycle=(r.time+nearDrip.offset)%nearDrip.period;if(cycle>NEAR_DRIP_FALL+1.1)continue;
    const landing=waterContactHeight(nearDrip,waters,states,floodDepth);
    if(cycle<NEAR_DRIP_FALL){
     if(landing===null&&(!onFloor(nearDrip.x,nearDrip.y)||solid(nearDrip,.05)))continue;
     dummy.position.set(nearDrip.x,nearDrip.height-4.9*cycle*cycle,-nearDrip.y);dummy.quaternion.copy(camera.quaternion);dummy.scale.set(.03,.075,1);dummy.updateMatrix();drops.setMatrixAt(count,dummy.matrix);dropPool.alphas.setX(count++,.95);
    }else if(landing!==null){
     const spread=(cycle-NEAR_DRIP_FALL)/1.1;
     dummy.position.set(nearDrip.x,landing+.005,-nearDrip.y);dummy.rotation.set(-Math.PI/2,0,seed);dummy.scale.set(.06+spread*.7,.05+spread*.58,1);dummy.updateMatrix();rings.setMatrixAt(ringCount,dummy.matrix);ringPool.alphas.setX(ringCount++,.5*(1-spread)**2);
    }
   }
   for(const contact of contacts.update(r,states,actor)){
    if(reduced&&contact.kind==='drip')continue;
    const stride=contact.kind==='player'||contact.kind==='joe',age=(r.time-contact.time)/1.15,diameter=.08+age*(contact.kind==='blade'?.5:contact.kind==='joe'?1.9:stride?1.35:.75);
    if(Math.hypot(contact.x-r.player.x,contact.y-r.player.y)>24)continue;
    const currentHeight=waterContactHeight(contact,waters,states,floodDepth);if(currentHeight===null)continue;
    dummy.position.set(contact.x,currentHeight+.005,-contact.y);dummy.rotation.set(-Math.PI/2,0,contact.serial*2.399);
    dummy.scale.set(diameter,diameter*.82,1);dummy.updateMatrix();rings.setMatrixAt(ringCount,dummy.matrix);ringPool.alphas.setX(ringCount++,contact.strength*(1-age)**2*(reduced?.5:1));
    // A stride leaves a second, later crest inside the first; Joe's heavier
    // tread also lifts a short-lived veil of spray that the lamps can catch.
    if(stride&&age>.14){dummy.rotation.z+=1.9;dummy.scale.set(diameter*.56,diameter*.47,1);dummy.updateMatrix();rings.setMatrixAt(ringCount,dummy.matrix);ringPool.alphas.setX(ringCount++,contact.strength*.7*(1-age)**2);}
    // Wading pushes a low bow crest and a veil of spray ahead of the walker.
    // Both travel with the stride that made them, so they stay in a level
    // first-person view instead of being left under the camera.
    if(contact.kind==='player'&&age<.5){
     const push=age/.5,seconds=age*1.15,pace=Math.hypot(contact.vx,contact.vy)||1,ahead=pace*seconds+2.1+seconds*2.2,envelope=Math.sin(Math.PI*push**.7)**2;
     const bowX=contact.x+contact.vx/pace*ahead,bowY=contact.y+contact.vy/pace*ahead;bowPoint.x=bowX;bowPoint.y=bowY;
     const bowHeight=waterContactHeight(bowPoint,waters,states,floodDepth);
     if(bowHeight!==null){
      dummy.position.set(bowX,bowHeight+.006,-bowY);dummy.rotation.set(-Math.PI/2,0,Math.atan2(-contact.vx,contact.vy));dummy.scale.set(1+push*1.5,.5+push*.6,1);dummy.updateMatrix();rings.setMatrixAt(ringCount,dummy.matrix);ringPool.alphas.setX(ringCount++,envelope);
      dummy.position.set(bowX,bowHeight+.16+push*.34,-bowY);dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(contact.serial*2.399);dummy.scale.set(.7+push*1.1,.34+push*.5,1);dummy.updateMatrix();froth.setMatrixAt(frothCount,dummy.matrix);frothPool.alphas.setX(frothCount++,envelope*.6);
     }
    }
    if(contact.kind==='joe'&&age<.7)for(let layer=0;layer<2;layer++){const veil=age/.7;dummy.position.set(contact.x,currentHeight+.16+veil*(.3+layer*.42),-contact.y);dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(contact.serial*2.399+layer*1.7);dummy.scale.set(.5+veil*(1.5-layer*.6),.34+veil*(.6+layer*.5),1);dummy.updateMatrix();froth.setMatrixAt(frothCount,dummy.matrix);frothPool.alphas.setX(frothCount++,Math.sin(Math.PI*veil**.6)**2*.75);}
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
   wakeLast[0]=r.player.x;wakeLast[1]=r.player.y;wakeLast[2]=r.joe.x;wakeLast[3]=r.joe.y;
   activeDrops=count;activeSplashes=splashes;activeRipples=ringCount;
   dropPool.finish(count);ringPool.finish(ringCount);
   activeMist=mistCount;mistPool.finish(mistCount);frothPool.finish(frothCount);
  },
  stats:()=>({footprintBoosted,maxFootprintScale,renderHeight:renderHeight(),channels:surfaces.length,visibleChannels,activeDrops,activeSplashes,activeRipples,activeMist,activeContactDrops,lastContactDrop,solidStreams:0,animationTime:time.value,dripSources:DRAIN_DRIPS,contacts:contacts.stats(),capacity:{drops:dropCapacity,contactDrops:contactDropCapacity,ripples:ringCapacity,mist:mistCapacity},jetsPerChannel:surfaces.map(v=>({id:v.w.id,count:v.jets.length,flowing:v.flowing})),presentation:'neutral silty droplets, gravity-driven impact fans, advecting dissipating spray and contact ripples'}),
  dispose(){for(const v of surfaces){v.material.dispose();v.surface.geometry.dispose();}dropPool.dispose();ringPool.dispose();frothPool.dispose();dropTexture.dispose();ringTexture.dispose();mistPool.dispose();sprayTexture.dispose();}
 };
}
