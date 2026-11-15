import * as THREE from './vendor/three/three.module.js';
import {compactVisibleIndices} from './visible-indices.js';

// The turf's moonlight floor keeps its authored blades readable at night.
// Add the actual (shadowed) headlight contribution above that floor, instead
// of letting max(outgoingLight, floor) erase a lamp until it exceeds moonlight.
export function finishHeadlightGround(material,optimize=false){
 if(!material.isMeshLambertMaterial)return;
 const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=function(shader,renderer){
  compile.call(this,shader,renderer);
  if(optimize){
   // All Back Nine spots have finite reach and inverse-square falloff. Reject
   // a fragment by squared range/cone before normalization. Inside the cone,
   // reuse one inverse length for direction, angle and attenuation.
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin).replace('getSpotLightInfo( spotLight, geometryPosition, directLight );',`
   {
    vec3 lampDelta=spotLight.position-geometryPosition;
    float lampD2=dot(lampDelta,lampDelta),lampAxis=dot(lampDelta,spotLight.direction);
    float lampRange2=spotLight.distance*spotLight.distance;
    directLight.visible=false;directLight.color=vec3(0.0);directLight.direction=vec3(0.0);
    if(lampD2<lampRange2 && lampAxis>0.0 && lampAxis*lampAxis>lampD2*spotLight.coneCos*spotLight.coneCos){
     float lampInverse=inversesqrt(max(.000001,lampD2));
     float lampCone=smoothstep(spotLight.coneCos,spotLight.penumbraCos,lampAxis*lampInverse);
     float lampEdge=1.0-lampD2*lampD2/(lampRange2*lampRange2);
     directLight.direction=lampDelta*lampInverse;
     directLight.color=spotLight.color*(lampCone*lampEdge*lampEdge/max(.01,lampD2));
     directLight.visible=any(notEqual(directLight.color,vec3(0.0)));
    }
   }
   `).replace('( directLight.visible && receiveShadow ) ? getShadow','( directLight.visible && receiveShadow && dot( geometryNormal, directLight.direction ) > 0.0 ) ? getShadow');
  }
  const floor='outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.34,.40,.43));';
  if(!shader.fragmentShader.includes(floor))return;
  let source=shader.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin);
  const start=source.indexOf('SpotLight spotLight;'),end=source.indexOf('#if ( NUM_SUN_LIGHTS',start);
  if(start<0||end<0)throw Error('Unsupported headlight ground shader');
  const spot=source.slice(start,end).replace('SpotLight spotLight;','SpotLight spotLight;\nbackNineHeadlightDiffuse=reflectedLight.directDiffuse;').replace('#pragma unroll_loop_end','#pragma unroll_loop_end\nbackNineHeadlightDiffuse=reflectedLight.directDiffuse-backNineHeadlightDiffuse;');
  source=source.slice(0,start)+spot+source.slice(end);
  shader.fragmentShader=source.replace('vec3 geometryPosition =','vec3 backNineHeadlightDiffuse=vec3(0.0);\nvec3 geometryPosition =').replace(floor,'outgoingLight=max(outgoingLight-backNineHeadlightDiffuse,diffuseColor.rgb*vec3(.34,.40,.43))+backNineHeadlightDiffuse;');
 };
 material.customProgramCacheKey=()=>key+'-headlight-ground-v1'+(optimize?'-finite-spots-v1':'');
}

// One broad source represents each pair of closely spaced vehicle lamps.
// It is attached at the midpoint of the actual lenses, in body coordinates.
// The red roof beacon remains a separate, omnidirectional warning source.
export function createBackNineHeadlights(scene,cover){
 const player=new THREE.SpotLight(0xe4dfb9,85,27,.58,.6,2);
 const mower=new THREE.SpotLight(0xffbd72,125,32,.55,.6,2);
 player.name='PlayerHeadlight';mower.name='MowerHeadlight';
 scene.add(player,player.target,mower,mower.target);
 const shadows=[createLampShadow(scene,player,cover,30),createLampShadow(scene,mower,cover,31)];
 const torch=new THREE.Group(),torchGeometry=new THREE.BoxGeometry(1,1,1);
 const offset=new THREE.Vector3(),aim=new THREE.Vector3();
 function attach(light,body,height,front,reach,across=0){
  body.updateWorldMatrix(true,false);
  light.position.copy(offset.set(across,height,-front).applyMatrix4(body.matrixWorld));
  light.target.position.copy(aim.set(across,height-.85,-front-reach).applyMatrix4(body.matrixWorld));
 }
 function update(run,cart,joe,runner){
  if(run.foot){
   // Stay with the body during a rear glance; the beam must not sweep through
   // the character simply because the chase camera looks over a shoulder.
   attach(player,torch,1.28,.24,11,-.18);
   player.intensity=42;player.distance=19;player.angle=.64;
  }else{attach(player,cart.body,.83,1.49,17);player.intensity=85;player.distance=27;player.angle=.58;}
  attach(mower,joe.body,1.15,1.94,21);
  // Keep the emitter/light inventory fixed across ejection, pause and retry.
  // A distant mower contributes zero; don't draw its shadow until nearby.
  const actor=run.foot||run.cart,gap=Math.hypot(actor.x-run.joe.x,actor.y-run.joe.y);
  mower.intensity=125*Math.max(0,Math.min(1,(72-gap)/18));
  player.updateMatrixWorld();player.target.updateMatrixWorld();mower.updateMatrixWorld();mower.target.updateMatrixWorld();
  shadows.forEach(s=>s.update(run.time));
 }
 return {player,mower,update,mountRunner(runner,materials){
  // A clipped work light makes the on-foot source visible. Reuse the scene's
  // painted metal, rubber and lamp materials; create it before preparation.
  for(const [m,x,y,z,sx,sy,sz]of [[materials.rubber,-.18,1.28,-.18,.105,.17,.025],[materials.iron,-.18,1.28,-.21,.085,.115,.065],[materials.lamp,-.18,1.28,-.245,.06,.065,.009]]){
   const mesh=new THREE.Mesh(torchGeometry,m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);torch.add(mesh);
  }
  torch.name='RunnerWorkLight';runner.attachUpperBody(torch);
 },addCaster(object){shadows.forEach(s=>s.addCaster(object));},stats:()=>({player:describe(player),mower:describe(mower),shadows:shadows.map(s=>s.stats())}),dispose(){shadows.forEach(s=>s.dispose());torch.removeFromParent();torchGeometry.dispose();scene.remove(player,player.target,mower,mower.target);}};
}
function describe(light){return {position:light.position.toArray(),target:light.target.position.toArray(),intensity:light.intensity,range:light.distance,angle:light.angle,penumbra:light.penumbra};}

export function createLampShadow(scene,light,cover,layer){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',cover.position);
 geometry.setIndex(new THREE.BufferAttribute(cover.indices.slice(),1).setUsage(THREE.DynamicDrawUsage));
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(geometry,material);
 mesh.name='HeadlightCover';mesh.layers.set(layer);mesh.castShadow=true;mesh.frustumCulled=false;scene.add(mesh);
 const parts=cover.parts.map(p=>({...p,visible:true,drawOffset:p.offset})),moving=[];
 const previous=new THREE.Matrix4(),lastPosition=new THREE.Vector3(Infinity,0,0),lastTarget=new THREE.Vector3(Infinity,0,0);
 let lastTime=-Infinity,updates=0,uploaded=0,active=false;
 light.castShadow=true;light.shadow.mapSize.set(256,256);light.shadow.camera.near=.12;light.shadow.camera.layers.set(layer);
 light.shadow.bias=-.00015;light.shadow.normalBias=.025;light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;
 function update(time){
  if(light.intensity<=0){active=false;light.shadow.needsUpdate=false;return;}
  let moved=false;
  for(const c of moving){c.object.updateWorldMatrix(true,false);if(!c.matrix.equals(c.object.matrixWorld)){c.matrix.copy(c.object.matrixWorld);moved=true;}}
  // Include orientation, cone/range and moving doors. No refresh merely for
  // time/intensity changes; no temporal lag when turning the steering wheel.
  light.shadow.updateMatrices(light);
  const camera=light.shadow.camera;
  if(!active||moved||time<lastTime||!lastPosition.equals(light.position)||!lastTarget.equals(light.target.position)||!previous.equals(camera.projectionMatrix)){
   const frustum=light.shadow.getFrustum();
   for(const p of parts)p.visible=p.bounds.distanceToPoint(light.position)<=light.distance+.05&&frustum.intersectsBox(p.bounds);
   uploaded+=compactVisibleIndices(geometry,parts,cover.indices);
   light.shadow.needsUpdate=true;updates++;active=true;lastPosition.copy(light.position);lastTarget.copy(light.target.position);previous.copy(camera.projectionMatrix);
  }
  lastTime=time;
 }
 return {update,addCaster(object){object.traverse(o=>{if(o.isMesh){o.layers.enable(layer);o.castShadow=true;}});moving.push({object,matrix:new THREE.Matrix4()});},stats:()=>({updates,submittedTriangles:geometry.drawRange.count/3,indexValuesUploaded:uploaded,size:256}),dispose(){for(const c of moving)c.object.traverse(o=>o.layers.disable(layer));mesh.removeFromParent();geometry.dispose();material.dispose();light.shadow.dispose();}};
}
