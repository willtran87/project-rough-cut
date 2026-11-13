import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {floodlightTint} from './floodlight-response.js';

// One opaque surface: illustrated reflections and ripples without a scene copy,
// refraction buffer, transparent stack, or a change to the pond's collision.
export function createPixelWater(parent,x,z,rx,rz,lamps=[]){
  const clock={value:0},wind={value:0},shape={value:new THREE.Vector2(rx,rz)};
  const reflection={value:new THREE.Vector4(0,0,0,0)},axis={value:new THREE.Vector2(0,1)};
  const tint={value:new THREE.Color()};
  const lamp=lamps.filter(l=>Math.hypot(l.x-x,l.z-z)<18).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
  const material=new THREE.MeshBasicMaterial({color:0xffffff});
  material.onBeforeCompile=shader=>{
    shader.uniforms.waterClock=clock;shader.uniforms.waterWind=wind;shader.uniforms.waterShape=shape;
    shader.uniforms.lampReflection=reflection;shader.uniforms.lampAxis=axis;shader.uniforms.lampTint=tint;
    shader.uniforms.reflectionArt={value:Art.texture('rough-cut-night-sky-v2')};
    shader.vertexShader='varying vec2 vWater;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWater=position.xy;');
    shader.fragmentShader='uniform vec3 lampTint;\nuniform vec4 lampReflection;\nuniform vec2 lampAxis;\nuniform float waterWind;\nuniform float waterClock;\nuniform vec2 waterShape;\nuniform sampler2D reflectionArt;\nvarying vec2 vWater;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 p=floor(vWater*waterShape*42.0)/42.0;
      float radius=length(vWater);
      float reedShadow=.5+.5*sin(p.x*1.8+sin(p.x*3.6)*.7);
      float wave=sin(p.y*19.0+sin(p.x*2.4+waterClock*.28)*1.8-waterClock*.72);
      float broken=.5+.5*sin(p.x*8.0+p.y*3.0+waterClock*.15);
      float glint=step(.94-waterWind*.025,wave)*step(.60,broken);
      // Small offset rings interrupt the parallel reflection strokes. Each
      // expands, breaks into pixels and fades before its next cycle.
      float cycle=fract(waterClock*.17);
      vec2 center=vec2(sin(floor(waterClock*.17)*2.4)*.36,cos(floor(waterClock*.17)*1.7)*.30);
      float distanceToRing=length(p-center*waterShape);
      float ring=step(abs(distanceToRing-cycle*1.7),.025)*(1.0-cycle)*smoothstep(0.0,.08,cycle)*step(.48,broken);
      float shallows=smoothstep(.62,.99,radius);
      vec3 sky=texture2D(reflectionArt,vec2(.5+p.x*.025,.21+p.y*.04+wave*.002)).rgb;
      vec3 deep=mix(vec3(.009,.024,.030),vec3(.021,.048,.056),.5+.5*sin(p.y*.8));
      deep=mix(deep,sky*vec3(.35,.48,.46),.32);
      deep*=mix(.68,1.0,reedShadow*smoothstep(.12,.65,1.0-radius));
      vec3 water=mix(deep,vec3(.024,.042,.027),shallows);
      water+=ring*vec3(.013,.026,.027)*(1.0-shallows);
      water+=glint*mix(vec3(.018,.031,.029),vec3(.045,.065,.061),step(.78,broken))*(1.0-shallows);
      // Broken reflection of the actual nearby powered floodlight. Its mirror
      // point follows the viewing ray, while the source remains fixed in world.
      vec2 delta=p-lampReflection.xy;
      float along=dot(delta,lampAxis),across=dot(delta,vec2(-lampAxis.y,lampAxis.x));
      float streak=exp(-across*across/0.035-along*along/1.1);
      float fragments=.18+.82*step(.35,sin(p.y*43.0+sin(p.x*11.0+waterClock*.4)-waterClock*.65));
      water+=lampTint*vec3(.13,.17,.16)*streak*fragments*lampReflection.z*(1.0-shallows);
      // A broken wet lip follows the true ellipse, never a rectangular decal.
      float lip=step(.954,radius)*(1.0-step(.984,radius))*step(.32,broken);
      water=mix(water,vec3(.047,.060,.035),lip*.45);
      diffuseColor.rgb=water;
    `);
  };
  material.customProgramCacheKey=()=> 'rough-cut-pixel-water-v3';
  const mesh=new THREE.Mesh(new THREE.CircleGeometry(1,48),material);
  mesh.rotation.x=-Math.PI/2;mesh.scale.set(rx,rz,1);mesh.position.set(x,.083,z);parent.add(mesh);
  let time=0,last=null;
  return {update(frame,camera){const dt=last===null?0:Math.max(0,Math.min(.1,frame.time-last));if(last!==null&&frame.time<last)time=0;last=frame.time;if(!frame.paused&&!frame.reducedMotion){wind.value=THREE.MathUtils.damp(wind.value,THREE.MathUtils.clamp(frame.fx?.wind?.strength||0,0,1),2,dt);time+=dt*(1+wind.value*.3);}clock.value=time;
    if(lamp&&camera){const c=camera.position,t=(c.y-.083)/(c.y+3.13),px=c.x+(lamp.x-c.x)*t,pz=c.z+(lamp.z-c.z)*t;
      reflection.value.set(px-x,z-pz,THREE.MathUtils.clamp(frame.lightPower?.(lamp.source)??0,0,1),0);floodlightTint(reflection.value.z,tint.value);axis.value.set(lamp.x-c.x,c.z-lamp.z).normalize();}
  },stats:()=>({time,wind:wind.value,opaque:true,draws:1,position:[x,.083,z],radius:[rx,rz],reflection:{source:lamp?.source.id||null,point:reflection.value.toArray().slice(0,2),power:reflection.value.z}})};
}
