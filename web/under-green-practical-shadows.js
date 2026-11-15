import * as THREE from './vendor/three/three.module.js';
import {waitForGPU} from './render-preparation.js';

// Fixed architecture is baked once. Moving doors, Joe and translucent effects
// are excluded; their geometry must never be frozen into this atlas.
const blockers=new Set(['rootStone','bunkerStone','pumpStone','rangeStone','keeperStone','stone','floor','walkway','ceiling','bankEarth','mudBank','soil','sand','bankSand','root','shoringWood','bunkerCoping']);
const faces=[
 {direction:[1,0,0],up:[0,-1,0]}, {direction:[-1,0,0],up:[0,-1,0]},
 {direction:[0,1,0],up:[0,0,1]}, {direction:[0,-1,0],up:[0,0,-1]},
 {direction:[0,0,1],up:[0,-1,0]}, {direction:[0,0,-1],up:[0,-1,0]}
];
// All practical sources and visible receivers are at/above course grade.
// A floor wholly below that plane cannot obstruct their connecting rays.
// Baking it nevertheless makes low-resolution grazing taps shadow the floor
// itself. Keep raised floors eligible so future steps/platforms still cast.
export function isDrainPracticalCaster(source,bounds=new THREE.Box3(),minimumLightHeight=0){
 if(!blockers.has(source.name))return false;
 if(source.name!=='floor'&&source.name!=='walkway')return true;
 source.updateWorldMatrix(true,false);source.geometry.computeBoundingBox();
 bounds.copy(source.geometry.boundingBox).applyMatrix4(source.matrixWorld);
 return bounds.max.y>Math.min(0,minimumLightHeight)+0.00001;
}
export async function createDrainPracticalShadows({renderer,meshes,lamps,tileSize=128}){
 const start=performance.now(),width=tileSize*6,height=tileSize*lamps.length;
 const depth=new THREE.DepthTexture(width,height,THREE.UnsignedIntType);
 depth.compareFunction=THREE.LessEqualCompare;depth.minFilter=depth.magFilter=THREE.LinearFilter;
 const target=new THREE.WebGLRenderTarget(width,height,{format:THREE.RedFormat,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthTexture:depth,depthBuffer:true,stencilBuffer:false});
 const material=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide}),scene=new THREE.Scene(),bounds=new THREE.Box3(),minimumLightHeight=Math.min(...lamps.map(l=>l.height??2.8));let blockerBatches=0;
 for(const source of meshes){if(!isDrainPracticalCaster(source,bounds,minimumLightHeight))continue;source.updateWorldMatrix(true,false);const mesh=new THREE.Mesh(source.geometry,material);mesh.matrixAutoUpdate=false;mesh.matrix.copy(source.matrixWorld);scene.add(mesh);blockerBatches++;}
 const previous={target:renderer.getRenderTarget(),viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),scissorTest:renderer.getScissorTest(),autoClear:renderer.autoClear};
 const camera=new THREE.PerspectiveCamera(90,1,.05,13),point=new THREE.Vector3();let renders=0;
 try{
  renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.autoClear=false;renderer.clear(false,true,false);
  for(let row=0;row<lamps.length;row++){
   const lamp=lamps[row];camera.position.set(lamp.x,lamp.height??2.8,-lamp.y);camera.far=lamp.reach??13;camera.updateProjectionMatrix();
   for(let column=0;column<faces.length;column++){
    const face=faces[column];camera.up.fromArray(face.up);point.fromArray(face.direction).add(camera.position);camera.lookAt(point);camera.updateMatrixWorld();
    renderer.setViewport(column*tileSize,row*tileSize,tileSize,tileSize);renderer.render(scene,camera);renders++;
   }
   // Yield only after this lamp's work completes; a timer alone can enqueue
   // the entire atlas ahead of the first playable frame on software drivers.
   await waitForGPU(renderer);await new Promise(resolve=>setTimeout(resolve,0));
  }
 }catch(error){target.dispose();throw error;}
 finally{renderer.setRenderTarget(previous.target);renderer.setViewport(previous.viewport);renderer.setScissor(previous.scissor);renderer.setScissorTest(previous.scissorTest);renderer.autoClear=previous.autoClear;material.dispose();scene.clear();}
 const strength={value:1},atlas={value:new THREE.Vector4(tileSize,width,height,.05)},bakeMs=performance.now()-start;
 return {depth:target.depthTexture,atlas,strength,stats:()=>({kind:'baked-static-cube-atlas',faces:renders,tileSize,width,height,bytes:width*height*5,bakeMs,blockerBatches}),setEnabled(value){strength.value=value?1:0;},dispose(){target.dispose();}};
}

export const drainShadowGLSL=`
uniform sampler2DShadow drainShadowDepth;
uniform vec4 drainShadowAtlas;
uniform float drainShadowStrength;
varying vec3 vDrainShadowWorld;
float drainStaticShadow(vec3 world, vec4 origin, float reach) {
 vec3 d=world-origin.xyz,a=abs(d);float major;float face;vec2 uv;
 if(a.x>=a.y&&a.x>=a.z){major=a.x;if(d.x>=0.){face=0.;uv=vec2(-d.z,-d.y);}else{face=1.;uv=vec2(d.z,-d.y);}}
 else if(a.y>=a.z){major=a.y;if(d.y>=0.){face=2.;uv=vec2(d.x,d.z);}else{face=3.;uv=vec2(d.x,-d.z);}}
 else {major=a.z;if(d.z>=0.){face=4.;uv=vec2(d.x,-d.y);}else{face=5.;uv=vec2(-d.x,-d.y);}}
 if(major<=drainShadowAtlas.w||major>=reach)return 1.;
 uv=uv/major*.5+.5;
 // Clamp the four comparison taps inside their own cube-face tile.
 float tile=drainShadowAtlas.x;uv=clamp(uv,vec2(.5/tile),vec2(1.-.5/tile));
 vec2 atlasUV=(vec2(face,origin.w)*tile+uv*tile)/drainShadowAtlas.yz;
 float receiver=max(drainShadowAtlas.w,major-(.035+major*.003));
 float reference=reach/(reach-drainShadowAtlas.w)-reach*drainShadowAtlas.w/((reach-drainShadowAtlas.w)*receiver);
 return mix(1.,texture(drainShadowDepth,vec3(atlasUV,reference)),drainShadowStrength);
}
`;
export const drainShadowVertexGLSL=`
 vec4 drainShadowVertex=vec4(transformed,1.);
 #ifdef USE_BATCHING
  drainShadowVertex=batchingMatrix*drainShadowVertex;
 #endif
 #ifdef USE_INSTANCING
  drainShadowVertex=instanceMatrix*drainShadowVertex;
 #endif
 vDrainShadowWorld=(modelMatrix*drainShadowVertex).xyz;
`;
