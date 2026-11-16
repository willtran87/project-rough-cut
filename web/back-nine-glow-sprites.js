import * as THREE from './vendor/three/three.module.js';

// One pooled, additive billboard batch carries every soft light effect on the
// Back Nine: sprinkler mist, tire plumes, lamp halos, ground fog and exhaust.
// It is a single draw with a fixed capacity; nothing here is a real light, so
// the scene's light inventory (and every compiled program) never changes.
// Headlight scatter is evaluated per corner from the two existing lamp cones.
export function createLampUniforms(){
 return {position:{value:[new THREE.Vector4(),new THREE.Vector4()]},direction:{value:[new THREE.Vector4(0,0,-1,1),new THREE.Vector4(0,0,-1,1)]},shape:{value:[new THREE.Vector2(1,1),new THREE.Vector2(1,1)]},color:{value:[new THREE.Vector3(1,.95,.74),new THREE.Vector3(1,.72,.42)]}};
}
const axis=new THREE.Vector3();
// Intensity is normalised against each lamp's authored full power.
export function writeLampUniforms(uniforms,index,light,full){
 uniforms.position.value[index].set(light.position.x,light.position.y,light.position.z,Math.max(0,light.intensity/full));
 axis.subVectors(light.target.position,light.position).normalize();
 uniforms.direction.value[index].set(axis.x,axis.y,axis.z,Math.cos(light.angle));
 uniforms.shape.value[index].set(light.distance,Math.cos(light.angle*(1-light.penumbra)));
}
export const lampGLSL=`
 uniform vec4 glowLampPosition[2];
 uniform vec4 glowLampDirection[2];
 uniform vec2 glowLampShape[2];
 uniform vec3 glowLampColor[2];
 float glowLampReach(int i,vec3 point,out vec3 toLamp){
  vec3 delta=point-glowLampPosition[i].xyz;float d2=dot(delta,delta),range=glowLampShape[i].x;
  toLamp=-delta*inversesqrt(max(d2,.01));
  if(glowLampPosition[i].w<=0.0||d2>=range*range)return 0.0;
  float cone=smoothstep(glowLampDirection[i].w,glowLampShape[i].y,dot(-toLamp,glowLampDirection[i].xyz));
  float edge=max(0.0,1.0-d2*d2/(range*range*range*range));
  return glowLampPosition[i].w*cone*edge*edge/(1.0+d2*.03);
 }
`;
export function bindLampUniforms(shaderUniforms,lamps){
 shaderUniforms.glowLampPosition=lamps.position;shaderUniforms.glowLampDirection=lamps.direction;shaderUniforms.glowLampShape=lamps.shape;shaderUniforms.glowLampColor=lamps.color;
}

export function createGlowSprites(scene,lamps,capacity=256){
 const geometry=new THREE.InstancedBufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,1,-1,0,1,1,0,-1,1,0],3));geometry.setIndex([0,1,2,0,2,3]);
 const a=new THREE.InstancedBufferAttribute(new Float32Array(capacity*4),4),b=new THREE.InstancedBufferAttribute(new Float32Array(capacity*4),4),c=new THREE.InstancedBufferAttribute(new Float32Array(capacity*4),4);
 for(const attribute of [a,b,c])attribute.setUsage(THREE.DynamicDrawUsage);
 geometry.setAttribute('glowPlace',a);geometry.setAttribute('glowTint',b);geometry.setAttribute('glowShape',c);geometry.instanceCount=0;
 const fog={value:new THREE.Vector2(58,120)},uniforms={glowFog:fog};bindLampUniforms(uniforms,lamps);
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,toneMapped:false,fog:false,
  vertexShader:`attribute vec4 glowPlace;attribute vec4 glowTint;attribute vec4 glowShape;uniform vec2 glowFog;varying vec2 vGlowUv;varying vec3 vGlowColor;varying float vGlowFloor;
   ${lampGLSL}
   void main(){
    vec4 mv=viewMatrix*vec4(glowPlace.xyz,1.0);
    vec2 reach=vec2(glowPlace.w,glowPlace.w*glowShape.x);
    float centreDepth=-mv.z;
    mv.xy+=position.xy*reach;
    vec3 scatter=vec3(0.0);
    if(glowShape.y>0.0){
     vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),up=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]),toLamp;
     vec3 corner=glowPlace.xyz+(right*position.x*reach.x+up*position.y*reach.y)*.6;
     for(int i=0;i<2;i++)scatter+=glowLampColor[i]*glowLampReach(i,corner,toLamp);
    }
    // Distance fog, and a near fade so a puff never floods the lens.
    float visible=(1.0-smoothstep(glowFog.x,glowFog.y,centreDepth))*(glowShape.w>0.0?smoothstep(glowShape.w*.3,glowShape.w,centreDepth):1.0);
    vGlowColor=(glowTint.rgb+scatter*glowShape.y)*glowTint.a*visible;vGlowUv=position.xy;vGlowFloor=glowShape.z;
    gl_Position=projectionMatrix*mv;
   }`,
  fragmentShader:`varying vec2 vGlowUv;varying vec3 vGlowColor;varying float vGlowFloor;
   void main(){
    float falloff=max(0.0,1.0-dot(vGlowUv,vGlowUv));falloff*=falloff;
    // Ground-hugging puffs thin toward their base instead of ending on a
    // hard line where the billboard meets the turf.
    if(vGlowFloor>0.0)falloff*=smoothstep(-1.0,-1.0+vGlowFloor*2.0,vGlowUv.y);
    gl_FragColor=vec4(vGlowColor*falloff,1.0);
   }`});
 const mesh=new THREE.Mesh(geometry,material);mesh.name='BackNineGlowSprites';mesh.frustumCulled=false;mesh.renderOrder=6;scene.add(mesh);
 const pa=a.array,pb=b.array,pc=c.array;let count=0,dropped=0,peak=0;
 return {capacity,
  begin(){count=0;dropped=0;},
  // aspect: height/width. lit: share of headlight scatter. floor: 0..1 base
  // fade. near: distance (m) inside which the sprite fades from the lens.
  push(x,y,z,size,r,g,bl,alpha,aspect=1,lit=0,floor=0,near=0){
   if(alpha<=.002)return;if(count>=capacity){dropped++;return;}
   const i=count++*4;pa[i]=x;pa[i+1]=y;pa[i+2]=z;pa[i+3]=size;pb[i]=r;pb[i+1]=g;pb[i+2]=bl;pb[i+3]=alpha;pc[i]=aspect;pc[i+1]=lit;pc[i+2]=floor;pc[i+3]=near;
  },
  end(sceneFog){
   if(sceneFog)fog.value.set(sceneFog.near,sceneFog.far);
   geometry.instanceCount=count;mesh.visible=count>0;peak=Math.max(peak,count);
   if(count)a.needsUpdate=b.needsUpdate=c.needsUpdate=true;
  },
  warm(){geometry.instanceCount=1;mesh.visible=true;pa[0]=0;pa[1]=-20;pa[2]=0;pa[3]=.01;pb[3]=0;a.needsUpdate=b.needsUpdate=c.needsUpdate=true;},
  stats:()=>({active:count,capacity,dropped,peak,draws:1,blend:'additive'}),
  dispose(){scene.remove(mesh);geometry.dispose();material.dispose();}};
}
