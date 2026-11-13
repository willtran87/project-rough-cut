import * as THREE from './vendor/three/three.module.js';
import { GLTFLoader } from './vendor/three/addons/loaders/GLTFLoader.js';
import { waitForPreparationTurn } from './render-preparation.js';
import { decodeBitmapOffThread } from './bitmap-decoder.js';
import { createCourseMowerCraft } from './course-mower-craft.js?v=20261113-large-mower';
import { COURSE_MOWER_SIZE, enlargeMowerBody } from './course-mower-size.js';
import { createCoursePushPose } from './course-push-pose.js';
import {createCourseFootwork} from './course-footwork.js?v=20261112-first-step';

// One real skinned actor. Its pose follows travel and turning, never the viewer.
export function createJoeModel(parent, invalidate=()=>{}, prepare=async()=>{}) {
  const root=new THREE.Group();root.name='JoeActor';parent.add(root);
  const state={kind:'skinned-pixel-model',ready:false,error:null,bones:0,meshes:0,triangles:0,phase:0,distance:0,handError:0};
  let disposed=false,mixer=null,walk=null,idle=null,asset=null,head=null,lastDistance=null,meters=0;
  let lastTime=null,idleTime=0,moving=null,blend=0,blendFrom=0,transitionAge=0,headYaw=0,headPitch=0;
  const wheels=[],hands=[],feet=[],bindHead=new THREE.Quaternion();
  const bones=new Map();let pushPose=null,footwork=null;
  const lodMeshes=[];let distant=false;
  const craft=createCourseMowerCraft(root);craft.root.visible=false;
  const loader=new GLTFLoader();
  // A burst of parallel bitmap decodes competes with world construction. Keep
  // the exact original images but give each decoder a separate scheduling turn.
  let decodeQueue=Promise.resolve();
  loader.register(parser=>{
    const bitmapLoader=parser.textureLoader;
    if(bitmapLoader.isImageBitmapLoader){
      const nativeLoad=bitmapLoader.load.bind(bitmapLoader);
      bitmapLoader.load=(url,onLoad,onProgress,onError)=>{
        // Embedded GLB blob URLs need no custom headers or path resolution.
        // Keep the native loader for any externally supplied texture URL.
        if(!url.startsWith('blob:'))return nativeLoad(url,onLoad,onProgress,onError);
        return decodeBitmapOffThread(url,{...bitmapLoader.options,colorSpaceConversion:'none'},()=>disposed).then(onLoad,()=>{
          if(disposed){onError?.(Error('Joe load cancelled'));return;}
          return nativeLoad(url,onLoad,onProgress,onError);
        });
      };
    }
    const load=parser.loadTextureImage.bind(parser);
    parser.loadTextureImage=(...args)=>{const next=decodeQueue.catch(()=>{}).then(async()=>{if(!await waitForPreparationTurn(()=>disposed))throw Error('Joe load cancelled');await new Promise(resolve=>setTimeout(resolve,8));return load(...args);});decodeQueue=next;return next;};
    return {name:'ROUGH_CUT_cooperative_decode'};
  });
  loader.load('./assets/models/joe-pixel-rig.glb?v=20261107-cooperative-startup',async gltf=>{
    if(disposed){release(gltf.scene);return;}
    asset=gltf.scene;asset.visible=false;root.add(asset);state.preparing=true;
    let skinMap=null;asset.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(m.name==='Skin'&&m.map)skinMap=m.map;});
    asset.traverse(o=>{
      if(o.isBone){bones.set(o.name,o);state.bones++;if(o.name==='Head'){head=o;bindHead.copy(o.quaternion);}if(/^Hand[LR]$/.test(o.name))hands.push(o);if(/^Foot[LR]$/.test(o.name))feet.push(o);}
      if((o.parent?.name==='MowerRigidBody'||/^MowerRigidBody(?:_|$)/.test(o.name))&&o.geometry)enlargeMowerBody(o.geometry);
      if(o.name.startsWith('Wheel')&&o.userData.wheelRadius){
        const s=COURSE_MOWER_SIZE;
        o.position.set(o.position.x*s.width,o.position.y*s.height,s.pivotZ+(o.position.z-s.pivotZ)*s.length);
        o.scale.set(s.width,s.height,s.height);
        wheels.push({node:o,radius:o.userData.wheelRadius*s.height,rest:o.quaternion.clone()});
      }
      if(o.isMesh){
        state.meshes++;state.triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
        o.castShadow=o.receiveShadow=true;
        // Animated bounds must include feet in every phase. One nearby actor is cheap to submit.
        // Visibility is culled once at the actor root. Warming the actual actor
        // also reaches its rigid mower materials before the first encounter.
        o.frustumCulled=false;
        const source=Array.isArray(o.material)?o.material:[o.material];
        const mats=source.map(m=>{
          if(m.map){m.map.magFilter=THREE.NearestFilter;m.map.minFilter=THREE.NearestMipmapLinearFilter;m.map.generateMipmaps=true;m.map.needsUpdate=true;}
          const clothTint=m.name==='Collar'?'float clothLuma=dot(diffuseColor.rgb,vec3(.299,.587,.114)); diffuseColor.rgb=vec3(.24,.34,.43)*(.62+clothLuma*.85);':'';
          const faceBlend=m.name==='Face'&&!!o.geometry.attributes.color&&!!skinMap;
          const metal=o.parent?.name==='MowerRigidBody'||/MowerRigidBody|Handle|Metal/i.test(o.name);
          const p=metal?new THREE.MeshPhongMaterial({map:m.map,color:m.color,side:THREE.DoubleSide,specular:0x879da5,shininess:44}):new THREE.MeshLambertMaterial({map:m.map,color:m.color,side:THREE.DoubleSide});
          p.onBeforeCompile=s=>{
            if(faceBlend){
              s.uniforms.joeSkinMap={value:skinMap};
              s.vertexShader='attribute vec3 color;\nvarying float joeFaceWeight;\nvarying vec2 joeSkinUv;\n'+s.vertexShader;
              s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\njoeFaceWeight=color.r;joeSkinUv=position.xy*1.2+vec2(.2);');
              s.fragmentShader='uniform sampler2D joeSkinMap;\nvarying float joeFaceWeight;\nvarying vec2 joeSkinUv;\n'+s.fragmentShader;
            }
            s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+clothTint+(faceBlend?'\ndiffuseColor.rgb=mix(texture2D(joeSkinMap,fract(joeSkinUv)).rgb,diffuseColor.rgb,clamp(joeFaceWeight,0.0,1.0));':'')+'\ndiffuseColor.rgb = pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.78));');
            s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','float joeRim=pow(1.0-abs(dot(normal,normalize(vViewPosition))),3.0); outgoingLight+=min(vec3(.14),reflectedLight.directDiffuse*1.4)*joeRim; vec3 pixelShade = floor(sqrt(max(outgoingLight, vec3(0.0))) * 48.0 + .5) / 48.0; outgoingLight = pixelShade * pixelShade;\n#include <opaque_fragment>');
          };
          p.customProgramCacheKey=()=> 'joe-pixel-light-v4-'+(metal?'metal-':'')+(faceBlend?'face':m.name==='Collar'?'cloth':'surface');m.dispose();return p;
        });o.material=Array.isArray(o.material)?mats:mats[0];
      }
    });
    pushPose=createCoursePushPose(root,bones);
    footwork=createCourseFootwork(root,bones);
    mixer=new THREE.AnimationMixer(asset);const clip=gltf.animations.find(a=>a.name.includes('PushWalk'))||gltf.animations[0];
    if(!clip){state.error='Missing PushWalk animation';invalidate();return;}
    walk=mixer.clipAction(clip);walk.play();const idleClip=gltf.animations.find(a=>a.name.includes('PlantedIdle'));if(idleClip){idle=mixer.clipAction(idleClip);idle.play();idle.setEffectiveWeight(0);}mixer.setTime(0);state.clipDuration=clip.duration;state.clips=gltf.animations.map(a=>a.name);
    try{
      const start=performance.now();
      try{
        const lod=await loader.loadAsync('./assets/models/joe-pixel-rig-lod.glb?v=20261107');
        if(disposed){release(lod.scene);return;}
        const nodes=new Map();lod.scene.traverse(o=>{if(o.isMesh)nodes.set(o.name,o);});
        asset.traverse(o=>{const low=nodes.get(o.name);if(!o.isMesh||!low)return;
          const g=low.geometry.clone();
          if((o.parent?.name==='MowerRigidBody'||/^MowerRigidBody(?:_|$)/.test(o.name)))enlargeMowerBody(g);
          if(o.isSkinnedMesh&&low.isSkinnedMesh){
            const remap=low.skeleton.bones.map(b=>o.skeleton.bones.findIndex(n=>n.name===b.name));
            if(remap.some(i=>i<0)){g.dispose();return;}
            const weights=g.attributes.skinIndex;for(let i=0;i<weights.count;i++)for(let j=0;j<4;j++)weights.setComponent(i,j,remap[weights.getComponent(i,j)]);
          }
          lodMeshes.push({mesh:o,near:o.geometry,far:g});
        });
        state.lodTriangles=lodMeshes.reduce((sum,e)=>sum+(e.far.index?.count||e.far.attributes.position.count)/3,0);state.lodMeshes=lodMeshes.length;
        release(lod.scene);
      }catch(e){state.lodError=String(e?.message||e);}
      state.mowerSize={...COURSE_MOWER_SIZE};
      craft.root.visible=true;await prepare(root,()=>disposed);if(disposed)return;state.prepareMs=performance.now()-start;asset.visible=true;state.preparing=false;state.ready=true;invalidate();
    }
    catch(e){if(!disposed){state.preparing=false;state.error=String(e?.message||e);invalidate();}}
  },undefined,e=>{state.error=String(e?.message||e);invalidate();});
  function release(scene){
    const textures=new Set(),materials=new Set(),geometries=new Set(),skeletons=new Set();
    scene.traverse(o=>{
      if(o.geometry)geometries.add(o.geometry);
      if(o.isSkinnedMesh&&o.skeleton)skeletons.add(o.skeleton);
      if(o.customDepthMaterial)materials.add(o.customDepthMaterial);
      for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){materials.add(m);if(m.map)textures.add(m.map);}
    });
    // Several body meshes share one skeleton and its GPU bone texture.
    // Geometry/material disposal does not release that texture.
    for(const skeleton of skeletons)skeleton.dispose();
    for(const g of geometries)g.dispose();
    for(const m of materials)m.dispose();
    for(const t of textures)t.dispose();
  }
  function update(frame,position,scale,dt){
    root.position.copy(position);root.rotation.y=(frame.joe.effectHeading||0)-Math.PI/2;
    if(!state.ready)return;
    const distance=frame.joe.walkMeters||0;
    if(lastDistance!==null&&distance>=lastDistance)meters+=(distance-lastDistance)*scale;
    if(lastDistance===null||distance<lastDistance)meters=distance*scale;
    lastDistance=distance;state.distance=meters;
    // Presentation time is authoritative too: duplicate renders and Pause cannot
    // consume a crossfade, breathe, or accumulate a head rotation.
    const elapsed=lastTime===null||frame.paused?0:THREE.MathUtils.clamp(frame.time-lastTime,0,.1);
    lastTime=frame.time;
    const motion=footwork.advance(frame,meters,elapsed);
    const nextMoving=(frame.joe.effectSpeed||0)>=(moving ? .25 : .5)||motion.turning;
    if(moving===null){moving=nextMoving;blend=moving?1:0;blendFrom=blend;transitionAge=1;}
    else if(nextMoving!==moving){if(nextMoving&&blend<.2)footwork.start();moving=nextMoving;blendFrom=blend;transitionAge=0;}
    transitionAge+=elapsed;
    const duration=moving ? .28 : .38,t=Math.min(1,transitionAge/duration),ease=t*t*(3-2*t);
    blend=THREE.MathUtils.lerp(blendFrom,moving?1:0,ease);
    const phase=motion.phase;
    if(!frame.reducedMotion)idleTime+=elapsed/3;
    walk.setEffectiveWeight(idle?blend:1);walk.time=phase*state.clipDuration;
    if(idle){idle.setEffectiveWeight(1-blend);idle.time=frame.reducedMotion?0:idleTime%idle.getClip().duration;}
    pushPose.restore();
    footwork.restore();
    if(head)head.quaternion.copy(bindHead);
    mixer.update(0);
    state.phase=phase;state.walkWeight=blend;state.transition=moving?(t<1?'starting':'walking'):(t<1?'settling':'idle');
    state.pose=moving?'push-walk':'planted-idle';state.idleTime=idleTime;
    const reacting=(frame.joe.reactionTimer||0)>0;
    const closePhase=frame.closeEscape?.phase;
    const targetPitch=closePhase==='warning'?.16:closePhase==='push'?.22:closePhase==='recovery'?-.10:frame.inspecting?-.19:reacting?-.07:frame.joe.mode==='chase'?.085:0;
    const targetYaw=frame.inspecting&&!frame.reducedMotion?Math.sin(frame.time*1.8)*.16:frame.joe.mode==='search'&&!frame.reducedMotion?Math.sin(frame.time*.8)*.30:0;
    state.intent=closePhase==='warning'?'bracing':closePhase==='push'?'committed-push':closePhase==='recovery'?'recovering':frame.inspecting?'inspecting':reacting?'orienting':frame.joe.mode==='chase'?'pursuing':frame.joe.mode==='search'?'searching':'patrolling';
    const headEase=1-Math.exp(-elapsed*9);
    headYaw=THREE.MathUtils.lerp(headYaw,targetYaw,headEase);headPitch=THREE.MathUtils.lerp(headPitch,targetPitch,headEase);
    if(head){head.rotateX(headPitch);head.rotateY(headYaw);}
    pushPose.update(frame,elapsed);state.pushPose=pushPose.stats();
    footwork.update(frame,phase,moving,elapsed,blend);state.footwork=footwork.stats();
    const axis=new THREE.Vector3(1,0,0),q=new THREE.Quaternion();
    for(const w of wheels){w.node.quaternion.copy(w.rest).multiply(q.setFromAxisAngle(axis,meters/w.radius));}
    root.updateMatrixWorld(true);
    state.heading=root.rotation.y;state.position=root.position.toArray();
    state.handPositions=hands.map(h=>root.worldToLocal(h.getWorldPosition(new THREE.Vector3())).toArray());
    state.footPositions=feet.map(f=>root.worldToLocal(f.getWorldPosition(new THREE.Vector3())).toArray());
    craft.update(frame,meters,state.footPositions);state.mowerCraft=craft.stats();
    state.handError=Math.max(0,...state.handPositions.map(p=>Math.hypot(Math.abs(p[0])-.225,p[1]-1.07,p[2]+.10)));
    state.headRotation=head?.quaternion.toArray();
    state.wheelAngles=wheels.map(w=>meters/w.radius);
  }
  function setDistance(distance){
    const next=lodMeshes.length>0&&distance>(distant?11:14);
    if(next!==distant){distant=next;for(const e of lodMeshes)e.mesh.geometry=distant?e.far:e.near;}
    state.lod=distant?'distant':'original';state.activeTriangles=distant?state.lodTriangles:state.triangles;
  }
  return {root,update,setDistance,stats:()=>({...state,handPositions:state.handPositions?.map(v=>[...v]),wheelAngles:state.wheelAngles&&[...state.wheelAngles]}),dispose(){disposed=true;craft.dispose();mixer?.stopAllAction();if(asset)release(asset);for(const e of lodMeshes){e.near.dispose();e.far.dispose();}root.removeFromParent();}};
}
