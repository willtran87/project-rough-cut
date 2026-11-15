import * as THREE from './vendor/three/three.module.js';
import {COURSE} from './back-nine-course.js';
import {terrainHeight} from './course-terrain.js';

// Shallow world-space volumes. Extinction is integrated only between the
// camera and the visible surface, so foreground props occlude the mist and
// moving through a bank never reveals a billboard or a ground-plane seam.
export const MIST_HOLLOWS=COURSE.wet.map((w,i)=>({
 id:['nursery-drainage','east-reservoir','west-reservoir'][i],
 x:w.x,y:w.y,base:terrainHeight(w.x,w.y)+.22,
 rx:w.r*1.18,ry:2.25,rz:w.r*1.65,density:.065
}));

// Integral of (1-radiusSquared)^2 through an ellipsoid. Normalising the
// clipped chord avoids subtracting large world-coordinate polynomials.
export function mistChord(origin,end,center,radii){
 const delta=end.map((v,i)=>v-origin[i]),length=Math.hypot(...delta);
 if(length<1e-6)return 0;
 const o=origin.map((v,i)=>(v-center[i])/radii[i]),d=delta.map((v,i)=>v/length/radii[i]);
 const a=d.reduce((s,v)=>s+v*v,0),b=o.reduce((s,v,i)=>s+v*d[i],0),c=o.reduce((s,v)=>s+v*v,0);
 const k=Math.min(1,1-c+b*b/a);if(k<=0)return 0;
 const half=Math.sqrt(k/a),mid=-b/a,lo=Math.max(0,mid-half),hi=Math.min(length,mid+half);
 if(hi<=lo)return 0;
 const primitive=u=>u-u*u*u*(2/3)+u*u*u*u*u/5;
 return Math.max(0,k*k*half*(primitive((hi-mid)/half)-primitive((lo-mid)/half)));
}

const mistGLSL=`
 uniform vec4 hollowOrigin[3];
 uniform vec4 hollowScale[3];
 uniform float hollowEnabled;
 uniform vec3 hollowTint;
 uniform float mistScatterStrength;
 uniform vec4 mistLampPosition[2];
 uniform vec4 mistLampDirection[2];
 uniform vec2 mistLampShape[2];
 vec3 mistBeam(vec3 point){
  vec3 light=vec3(0.0);
  for(int i=0;i<2;i++){
   vec3 delta=point-mistLampPosition[i].xyz;float d2=dot(delta,delta),range=mistLampShape[i].x;
   if(mistLampPosition[i].w<=0.0||d2>=range*range)continue;
   float cone=smoothstep(mistLampDirection[i].w,mistLampShape[i].y,dot(delta*inversesqrt(max(d2,.01)),mistLampDirection[i].xyz));
   float edge=max(0.0,1.0-d2*d2/(range*range*range*range));
   light+=vec3(1.0,.78,.47)*min(.14,mistLampPosition[i].w*cone*edge*edge*.02/(d2+4.0));
  }
  return light*mistScatterStrength;
 }


 float hollowChord(vec3 ray,vec4 origin,vec4 scale,out float middle){
  middle=0.0;
  if(scale.w<=0.0)return 0.0;
  vec3 d=ray*scale.xyz;
  float invA=1.0/max(dot(d,d),1e-12),b=dot(origin.xyz,d);
  float k=min(1.0,origin.w+b*b*invA);if(k<=0.0)return 0.0;
  float halfChord=sqrt(k*invA),mid=-b*invA;
  vec2 clipped=clamp(vec2(mid-halfChord,mid+halfChord),0.0,1.0);
  if(clipped.y<=clipped.x)return 0.0;
  middle=(clipped.x+clipped.y)*.5;
  vec2 u=(clipped-vec2(mid))/halfChord;
  vec2 integral=u-u*u*u*(2.0/3.0)+u*u*u*u*u*.2;
  return max(0.0,k*k*halfChord*(integral.y-integral.x))*scale.w;
 }
`;

export function createBackNineLocalMist(camera){
 const centers={value:MIST_HOLLOWS.map(()=>new THREE.Vector4())};
 const radii={value:MIST_HOLLOWS.map(h=>new THREE.Vector3(h.rx,h.ry,h.rz))};
 const origins={value:MIST_HOLLOWS.map(()=>new THREE.Vector4())},scales={value:MIST_HOLLOWS.map(h=>new THREE.Vector4(1/h.rx,1/h.ry,1/h.rz,0))},enabled={value:0};
 const tint={value:new THREE.Vector3(.23,.29,.31)},viewInverse={value:camera.matrixWorld};
 const scatter={value:1};
 const lamps={value:[new THREE.Vector4(),new THREE.Vector4()]},directions={value:[new THREE.Vector4(),new THREE.Vector4()]},shapes={value:[new THREE.Vector2(1,1),new THREE.Vector2(1,1)]},axis=new THREE.Vector3();
 const attached=new Set();let clock=0,active=0;
 function finish(material){
  if(!material||material.fog===false||attached.has(material)||!(material.isMeshLambertMaterial||material.isMeshBasicMaterial||material.isMeshStandardMaterial||material.isMeshPhongMaterial))return;
  attached.add(material);const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=function(shader,renderer){
   compile.call(this,shader,renderer);
   shader.uniforms.hollowOrigin=origins;shader.uniforms.hollowScale=scales;shader.uniforms.hollowEnabled=enabled;shader.uniforms.hollowTint=tint;shader.uniforms.hollowViewInverse=viewInverse;shader.uniforms.mistScatterStrength=scatter;shader.uniforms.mistLampPosition=lamps;shader.uniforms.mistLampDirection=directions;shader.uniforms.mistLampShape=shapes;
   shader.vertexShader=mistGLSL+'uniform mat4 hollowViewInverse;varying float hollowDepth;varying vec3 hollowLight;\n'+shader.vertexShader;
   // Reuse the world position already required by source lighting. The fallback
   // also includes skinning/instancing. Integrating on existing mesh vertices
   // avoids repeated ray work through every overlapping foliage pixel.
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
    #if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined( USE_SHADOWMAP ) || defined( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
     vec3 hollowWorld=worldPosition.xyz;
    #else
     vec3 hollowWorld=(hollowViewInverse*mvPosition).xyz;
    #endif
    hollowDepth=0.0;hollowLight=vec3(0.0);
    if(hollowEnabled>0.0){
     vec3 hollowRay=hollowWorld-cameraPosition;
     for(int hollowIndex=0;hollowIndex<3;hollowIndex++){
      float midpoint;float chord=hollowChord(hollowRay,hollowOrigin[hollowIndex],hollowScale[hollowIndex],midpoint);
      if(chord>0.0)hollowLight+=mistBeam(cameraPosition+hollowRay*midpoint)*chord;
      hollowDepth+=chord;
     }
     hollowLight/=max(hollowDepth,.00001);
     hollowDepth*=length(hollowRay);
    }
   `);
   shader.fragmentShader='uniform vec3 hollowTint;varying float hollowDepth;varying vec3 hollowLight;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',`#include <fog_fragment>

    // A clear visibility floor keeps silhouettes and routes readable, even
    // when the two reservoir banks overlap in a grazing line of sight.
    float hollowOpacity=min(.42,1.0-exp(-hollowDepth));
    gl_FragColor.rgb=mix(gl_FragColor.rgb,hollowTint+hollowLight,hollowOpacity);
   `);
  };
  material.customProgramCacheKey=()=>key+'-back-nine-local-mist-v4';
 }
 function update(run,reducedMotion=false,headlights=null){
  for(const [i,light]of [headlights?.player,headlights?.mower].entries()){
   if(!light){lamps.value[i].set(0,0,0,0);continue;}
   lamps.value[i].set(light.position.x,light.position.y,light.position.z,light.intensity);
   axis.subVectors(light.target.position,light.position).normalize();directions.value[i].set(axis.x,axis.y,axis.z,Math.cos(light.angle));shapes.value[i].set(light.distance,Math.cos(light.angle*(1-light.penumbra)));
  }
  clock=reducedMotion?0:run.time||0;active=0;
  for(let i=0;i<MIST_HOLLOWS.length;i++){
   const h=MIST_HOLLOWS[i],drift=Math.sin(clock*.055+i*2.3);
   // A smooth far-distance fade is beyond the course draw range; it avoids
   // paying intersection cost in the nursery/clubhouse with no bank nearby.
   const distance=Math.hypot(camera.position.x-h.x,camera.position.z+h.y);
   const visibility=THREE.MathUtils.smoothstep(150-distance,0,20);
   centers.value[i].set(h.x+drift*.65,h.base+Math.sin(clock*.04+i)*.08,-h.y+Math.cos(clock*.047+i)*.8,h.density*visibility);
   const center=centers.value[i],scale=scales.value[i],origin=origins.value[i];scale.w=center.w;
   origin.set((camera.position.x-center.x)*scale.x,(camera.position.y-center.y)*scale.y,(camera.position.z-center.z)*scale.z,0);
   origin.w=1-origin.x*origin.x-origin.y*origin.y-origin.z*origin.z;
   if(visibility>0)active++;
  }
  enabled.value=active;
 }
 return {finish,update,setScattering(value){scatter.value=Math.max(0,Math.min(1,value));},stats:()=>({hollows:MIST_HOLLOWS.length,active,clock,headlightScatter:true,maxOpacity:.42,materials:attached.size,centers:centers.value.map(v=>v.toArray()),radii:radii.value.map(v=>v.toArray())})};
}
