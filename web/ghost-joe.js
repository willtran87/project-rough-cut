import * as THREE from './vendor/three/three.module.js';
import { GLTFLoader } from './vendor/three/addons/loaders/GLTFLoader.js';

// Baked poses of the original textured Joe: one mesh, no animation mixer,
// shadows, collision, or AI. Level 1 opts into smooth translucent fades.
export function createGhostJoe(parent,{muted=false,softFade=false}={}){
  const root=new THREE.Group();root.name='GhostJoe';root.position.y=-1000;parent.add(root);
  const fade={value:0},travel={value:0},resolve={value:0},posture={value:new THREE.Vector2()},state={ready:false,error:null,visible:false,triangles:0,drawCalls:0};
  const headRotation={value:new THREE.Matrix3()},secondary={value:new THREE.Vector3()},headEuler=new THREE.Euler(),headMatrix=new THREE.Matrix4();
  const torsoRotation={value:new THREE.Vector2(1,0)};
  let disposed=false,asset=null,material=null,body=null;
  function release(){
    if(asset)asset.traverse(o=>{o.geometry?.dispose();});
    material?.map?.dispose();material?.dispose();root.removeFromParent();
  }
  const ready=new GLTFLoader().loadAsync('./assets/models/ghost-joe.glb?v=20261107-motion').then(gltf=>{
    asset=gltf.scene;
    if(disposed){asset.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();});return;}
    asset.traverse(o=>{
      if(!o.isMesh)return;
      body=o;state.poses=Object.keys(o.morphTargetDictionary||{});
      if(!o.geometry.attributes._ghost_wheel)o.geometry.setAttribute('_ghost_wheel',new THREE.BufferAttribute(new Float32Array(o.geometry.attributes.position.count*3),3));
      const source=o.material,map=source.map;
      if(map){map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;map.needsUpdate=true;}
      material=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,color:0xffffff,transparent:softFade,depthWrite:!softFade,forceSinglePass:true});
      material.onBeforeCompile=s=>{
        s.uniforms.ghostFade=fade;
        s.uniforms.ghostTravel=travel;
        s.uniforms.ghostResolve=resolve;s.uniforms.ghostPosture=posture;s.uniforms.ghostHeadRotation=headRotation;s.uniforms.ghostSecondary=secondary;s.uniforms.ghostTorsoRotation=torsoRotation;
        s.vertexShader='attribute vec3 _ghost_wheel;\nuniform float ghostTravel;\nuniform vec2 ghostPosture;\nuniform mat3 ghostHeadRotation;\nuniform vec3 ghostSecondary;\nuniform vec2 ghostTorsoRotation;\nvarying float ghostShade;\nvarying float ghostHeight;\nvarying float ghostFace;\n'+s.vertexShader;
        s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
          vec3 ghostNormal=normal;
          if(_ghost_wheel.y>.01){
            float a=-ghostTravel/_ghost_wheel.y,c=cos(a),s=sin(a);
            mat2 spin=mat2(c,s,-s,c);
            transformed.yz=_ghost_wheel.yz+spin*(transformed.yz-_ghost_wheel.yz);
            ghostNormal.yz=spin*ghostNormal.yz;
          }`);
        // Apply after baked morph poses; the grounded mower and feet stay rigid.
        s.vertexShader=s.vertexShader.replace('#include <morphtarget_vertex>',`#include <morphtarget_vertex>
          ghostHeight=position.y;
          ghostFace=smoothstep(1.46,1.51,position.y)*(1.0-smoothstep(1.67,1.70,position.y))*(1.0-smoothstep(.04,.12,position.z));
          float neck=smoothstep(1.40,1.52,position.y);
          float jaw=smoothstep(1.46,1.51,position.y)*(1.0-smoothstep(1.54,1.58,position.y))*(1.0-smoothstep(.02,.08,position.z));
          transformed.y-=ghostSecondary.z*jaw;
          vec3 pivot=vec3(0.0,1.44,.09);
          transformed=mix(transformed,pivot+ghostHeadRotation*(transformed-pivot),neck);
          vec2 torsoPivot=vec2(0.0,.09);
          mat2 torsoRotation=mat2(ghostTorsoRotation.x,-ghostTorsoRotation.y,ghostTorsoRotation.y,ghostTorsoRotation.x);
          transformed.xz=mix(transformed.xz,torsoPivot+torsoRotation*(transformed.xz-torsoPivot),smoothstep(1.10,1.36,position.y));
          ghostNormal=mix(ghostNormal,ghostHeadRotation*ghostNormal,neck);
          ghostNormal.xz=mix(ghostNormal.xz,torsoRotation*ghostNormal.xz,smoothstep(1.10,1.36,position.y));
          ghostShade=.48+.52*max(0.0,dot(normalize(mat3(modelMatrix)*ghostNormal),normalize(vec3(-.4,.8,.2))));
          float torso=smoothstep(.75,1.25,position.y);
          transformed.x+=ghostSecondary.x*torso;
          transformed.y+=ghostSecondary.y*position.x*torso;
          transformed.z-=max(0.0,position.y-.70)*ghostPosture.y;`);
        s.fragmentShader='uniform float ghostFade;\nuniform float ghostResolve;\nvarying float ghostShade;\nvarying float ghostHeight;\nvarying float ghostFace;\n'+s.fragmentShader;
        s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
          vec2 cell=mod(floor(gl_FragCoord.xy),4.0);
          float threshold=mod(cell.x*2.0+cell.y*3.0,4.0)*.25+mod(cell.x+cell.y*2.0,4.0)*.0625;
          float face=smoothstep(1.28,1.50,ghostHeight);
          ${softFade?'float lowerBody=1.0-smoothstep(.28,1.48,ghostHeight); float grain=.94+.06*sin(floor(gl_FragCoord.x*.5)*2.3+floor(gl_FragCoord.y*.5)*1.7); diffuseColor.a*=smoothstep(lowerBody*.20,1.0,ghostFade)*grain; if(diffuseColor.a<.002)discard;':'if(ghostFade*min(1.85,1.0+ghostResolve*(.65+.20*face))<=threshold)discard;'}
          float ink=dot(diffuseColor.rgb,vec3(.299,.587,.114));
          vec3 pale=mix(vec3(.70,.92,.82),vec3(.90,.96,1.0),ghostResolve);
          vec3 dark=mix(vec3(.025,.08,.085),vec3(.045,.10,.13),ghostResolve);
          // Keep the atlas's dark eyes/folds; reveal pale facial planes in
          // discrete tones without a glow pass, extra texture or light.
          float facialTone=clamp((pow(ink,.64)-.12)*1.20,0.0,1.0);
          float tone=floor(mix(pow(ink,.42),facialTone,ghostFace*(.45+.55*ghostResolve))*12.0+.5)/12.0;
          diffuseColor.rgb=mix(dark,pale,tone)*mix(ghostShade,max(.78,ghostShade),ghostResolve);`);
      };
      if(muted){const compile=material.onBeforeCompile;material.onBeforeCompile=s=>{compile(s);s.fragmentShader=s.fragmentShader.replace('vec3 pale=mix(vec3(.70,.92,.82),vec3(.90,.96,1.0),ghostResolve);','vec3 pale=vec3(.24,.34,.29);').replace('diffuseColor.rgb=mix(dark,pale,tone)', 'tone=mix(tone,min(tone,.66),smoothstep(1.35,1.50,ghostHeight)); diffuseColor.rgb=mix(dark,pale,tone)');};}
      material.customProgramCacheKey=()=> 'pixel-ghost-joe-attention-v7'+(muted?'-muted':'')+(softFade?'-soft-fade':'');
      source.dispose();o.material=material;o.castShadow=o.receiveShadow=false;
      state.triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
    });
    root.add(asset);state.ready=true;
  }).catch(error=>{state.error=String(error.message||error);});
  function show(anchor,alpha,motion=null){
    state.visible=state.ready&&!!anchor&&alpha>(softFade?.002:.04);state.alpha=alpha;state.softFade=softFade;
    root.visible=state.visible;state.drawCalls=state.visible?1:0;fade.value=alpha;
    travel.value=motion?.distance||0;
    resolve.value=THREE.MathUtils.clamp(motion?.resolve||0,0,1);
    posture.value.set(motion?.headTilt||0,motion?.bodyLean||0);
    headEuler.set(motion?.headNod||0,motion?.headYaw||0,-posture.value.x);
    headRotation.value.setFromMatrix4(headMatrix.makeRotationFromEuler(headEuler));
    secondary.value.set(motion?.sway||0,motion?.shoulderRoll||0,motion?.jawDrop||0);
    const torsoTurn=motion?.torsoTurn||0;torsoRotation.value.set(Math.cos(torsoTurn),Math.sin(torsoTurn));state.torsoTurn=torsoTurn;
    state.headYaw=headEuler.y;state.headNod=headEuler.x;state.sway=secondary.value.x;state.shoulderRoll=secondary.value.y;state.jawDrop=secondary.value.z;
    state.resolve=resolve.value;state.headTilt=posture.value.x;state.bodyLean=posture.value.y;
    if(anchor){root.position.set(anchor.x,anchor.y,anchor.z);root.rotation.y=anchor.yaw;}
    if(body?.morphTargetInfluences){
      const weights=body.morphTargetInfluences,names=body.morphTargetDictionary;weights.fill(0);
      const walk=motion?.walkWeight||0,phase=(motion?.phase||0)*6,index=Math.floor(phase),fraction=phase-index;
      const set=(name,value)=>{if(names[name]!==undefined)weights[names[name]]=value;};
      // Periodic cubic blending keeps velocity continuous at pose boundaries.
      // Four existing poses contribute; no additional targets or mixer.
      const f2=fraction*fraction,f3=f2*fraction;
      set('Walk'+((index+5)%6),walk*(1-fraction)**3/6);
      set('Walk'+index,walk*(3*f3-6*f2+4)/6);
      set('Walk'+((index+1)%6),walk*(-3*f3+3*f2+3*fraction+1)/6);
      set('Walk'+((index+2)%6),walk*f3/6);
      const breath=Math.sin((motion?.time||0)*Math.PI*2/3.8*(motion?.breathRate||1))*(1-(motion?.heldBreath||0));
      set('IdleHigh',(1-walk)*Math.max(0,breath));set('IdleLow',(1-walk)*Math.max(0,-breath));
      state.pose=walk>.01?'push-walk':'planted-idle';state.phase=motion?.phase||0;state.walkWeight=walk;
      state.distance=motion?.distance||0;state.laneLength=motion?.laneLength||0;state.motionTime=motion?.time||0;
      state.behavior=motion?.behavior||'passing';state.behaviorPhase=motion?.behaviorPhase||state.pose;state.noticed=!!motion?.noticed;
      state.movementPattern=motion?.movementPattern||'still';state.movementSpeed=motion?.movementSpeed||0;
      state.gesture=motion?.gesture||null;
      state.gazeGesture=motion?.gazeGesture||null;
      state.gazeVariant=motion?.gazeVariant||0;
      state.weights=weights.slice();
    }
    state.position=root.position.toArray();
  }
  return {root,ready,show,stats:()=>({...state}),dispose(){disposed=true;release();}};
}
