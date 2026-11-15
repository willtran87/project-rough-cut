import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const wrap=x=>x-Math.floor(x);
const mirror=x=>1-Math.abs(1-wrap(x/2)*2);
// Two cloud heights share authored density, with different scales, headings
// and drift. The CPU moon probe uses exactly these same sky coordinates.
export function stormCoordinates(direction,time){
 const qx=direction.x/(direction.y+.65),qy=direction.z/(direction.y+.65);
 return [[qx*.68+.14+time*.0028,qy*.68+.31+time*.0011],
  [(qx*.89+qy*.45)*.93+.63-time*.0013,(-qx*.45+qy*.89)*.93+.11+time*.0032]];
}
export function stormOpacity(upper,lower,elevation){
 const a=smooth(.18,.74,upper)*.86,b=smooth(.20,.75,lower)*.92;
 return (1-(1-a)*(1-b))*smooth(-.03,.14,elevation);
}
export function sampleStormDensity(data,width,height,u,v){
 // Texture upload flips the source canvas vertically. Preserve that mapping
 // in the lighting probe; repeating texture coordinates wrap in both axes.
 const x=Math.min(width-1,Math.floor(mirror(u)*width)),y=Math.min(height-1,Math.floor((1-mirror(v))*height));
 return data[y*width+x]/255;
}
export function stormMoonCoverage(sample,time,moonDirection){
 const center=new THREE.Vector3().copy(moonDirection).normalize();
 const right=new THREE.Vector3().crossVectors(center,new THREE.Vector3(0,1,0)).normalize();
 const up=new THREE.Vector3().crossVectors(right,center).normalize();
 let coverage=0;
 // Nine equal-area disk samples avoid abrupt whole-moon light changes at a
 // narrow cloud fringe. The moon's displayed radius is 29/822 radians.
 for(let i=0;i<9;i++){
  const radius=i?Math.sqrt((i-.5)/8)*.0353:0,angle=i*2.39996323;
  const direction=center.clone().addScaledVector(right,Math.cos(angle)*radius).addScaledVector(up,Math.sin(angle)*radius).normalize();
  const uv=stormCoordinates(direction,time);
  coverage+=stormOpacity(sample(...uv[0]),sample(...uv[1]),direction.y);
 }
 return coverage/9;
}

export function createBackNineStormSky(moonDirection){
 const map=Art.texture('back-nine-storm-density-v1',null,null,true);
 // It is authored scalar density, not sRGB surface color.
 map.colorSpace=THREE.NoColorSpace;
 // Mirror the authored tile at its edges so a slight mismatch in painted
 // border values cannot make a seam across the sky. Differently oriented
 // layers prevent their mirrored shapes lining up in the same direction.
 map.wrapS=map.wrapT=THREE.MirroredRepeatWrapping;
 let density=null,width=0,height=0,time=0,coverage=0,closed=false;
 const ready=Art.source('back-nine-storm-density-v1').then(image=>{
  if(!image||closed)return;
  const canvas=document.createElement('canvas');canvas.width=width=image.width;canvas.height=height=image.height;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
  const rgba=context.getImageData(0,0,width,height).data;density=new Uint8Array(width*height);
  for(let i=0;i<density.length;i++)density[i]=rgba[i*4];canvas.width=canvas.height=1;
 });
 const material=new THREE.ShaderMaterial({
  uniforms:{densityMap:{value:map},windTime:{value:0}},
  vertexShader:`varying vec3 skyDirection;
   void main(){skyDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D densityMap;uniform float windTime;varying vec3 skyDirection;
   void main(){
    vec3 direction=normalize(skyDirection);
    vec2 q=direction.xz/(direction.y+.65);
    vec2 upperUV=q*.68+vec2(.14,.31)+windTime*vec2(.0028,.0011);
    vec2 lowerUV=vec2(q.x*.89+q.y*.45,-q.x*.45+q.y*.89)*.93+vec2(.63,.11)+windTime*vec2(-.0013,.0032);
    float upper=texture2D(densityMap,upperUV).r,lower=texture2D(densityMap,lowerUV).r;
    float a=smoothstep(.18,.74,upper)*.86,b=smoothstep(.20,.75,lower)*.92;
    float opacity=1.0-(1.0-a)*(1.0-b);
    vec3 highColor=vec3(.008,.015,.024)+vec3(.020,.028,.040)*upper;
    vec3 lowColor=vec3(.003,.008,.013)+vec3(.014,.020,.025)*lower;
    vec3 color=(highColor*a*(1.0-b)+lowColor*b)/max(.001,opacity);
    color=pow(floor(sqrt(color)*96.0+.5)/96.0,vec3(2.0));
    gl_FragColor=vec4(color,opacity*smoothstep(-.03,.14,direction.y));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`,
  side:THREE.BackSide,transparent:true,depthWrite:false,depthTest:true,toneMapped:false
 });
 // One canopy draw with two authored samples replaces the nine disconnected
 // cards. Its horizon fades behind the existing distant ridge/tree rings.
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(890,64,24,0,Math.PI*2,0,Math.PI*.52),material);
 mesh.renderOrder=-3;mesh.frustumCulled=false;
 return {mesh,map,ready,update(value){time=value;material.uniforms.windTime.value=time;
   if(density)coverage=stormMoonCoverage((u,v)=>sampleStormDensity(density,width,height,u,v),time,moonDirection);
  },coverage:()=>coverage,stats:()=>({layers:2,motionTime:time,moonCoverage:coverage,densityReady:!!density,densitySize:[width,height]}),
  dispose(){closed=true;density=null;mesh.geometry.dispose();material.dispose();}
 };
}
