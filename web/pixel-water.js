import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {floodlightTint} from './floodlight-response.js';
import {pondBankGLSL,pondBankSeed} from './course-pond-bank.js';
import {createPondRunoff} from './course-pond-runoff.js';

// One opaque surface: illustrated reflections and ripples without a scene copy,
// refraction buffer, transparent stack, or a change to the pond's collision.
export function createPixelWater(parent,x,z,rx,rz,lamps=[],{runoff=false}={}){
  const outfall=runoff?createPondRunoff(parent,x,z,rx,rz):null;
  const clock={value:0},wind={value:0},shape={value:new THREE.Vector2(rx,rz)};
  const reflection={value:new THREE.Vector4(0,0,0,0)},axis={value:new THREE.Vector2(0,1)};
  const tint={value:new THREE.Color()};
  const lamp=lamps.filter(l=>Math.hypot(l.x-x,l.z-z)<18).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
  const material=new THREE.MeshBasicMaterial({color:0xffffff});
  material.onBeforeCompile=shader=>{
    shader.uniforms.waterClock=clock;shader.uniforms.waterWind=wind;shader.uniforms.waterShape=shape;shader.uniforms.bankSeed={value:pondBankSeed(x,z)};
    shader.uniforms.lampReflection=reflection;shader.uniforms.lampAxis=axis;shader.uniforms.lampTint=tint;
    shader.uniforms.reflectionArt={value:Art.texture('rough-cut-night-sky-v2')};
    shader.vertexShader='varying vec2 vWater;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWater=position.xy;');
    shader.fragmentShader='uniform float bankSeed;\n'+pondBankGLSL+'\nuniform vec3 lampTint;\nuniform vec4 lampReflection;\nuniform vec2 lampAxis;\nuniform float waterWind;\nuniform float waterClock;\nuniform vec2 waterShape;\nuniform sampler2D reflectionArt;\nvarying vec2 vWater;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 p=floor(vWater*waterShape*96.0)/96.0;
      float radius=length(vWater);
      float edge=pondEdge(atan(vWater.y,vWater.x),bankSeed);
      if(radius>edge)discard;
      float bankDistance=(edge-radius)*min(waterShape.x,waterShape.y);
      float reedShadow=.5+.5*sin(p.x*1.8+sin(p.x*3.6)*.7);
      float wave=sin(p.y*19.0+sin(p.x*2.4+waterClock*.28)*1.8-waterClock*.72);
      float broken=.5+.5*sin(p.x*8.0+p.y*3.0+waterClock*.15);
      float glint=step(.94-waterWind*.025,wave)*step(.60,broken);
      float shallows=1.0-smoothstep(.025,.58,bankDistance);
      vec3 sky=texture2D(reflectionArt,vec2(.5+p.x*.025,.21+p.y*.04+wave*.002)).rgb;
      vec3 deep=mix(vec3(.009,.024,.030),vec3(.021,.048,.056),.5+.5*sin(p.y*.8));
      deep=mix(deep,sky*vec3(.35,.48,.46),.32);
      deep*=.55*mix(.68,1.0,reedShadow*smoothstep(.12,.65,1.0-radius));
      // Stable, clustered stones under shallow water. Their shoulders and lower
      // edges have distinct tones; the bed disappears gradually into deep water.
      vec2 cell=floor(p*5.0),q=fract(p*5.0)-.5;
      float seed=fract(sin(dot(cell,vec2(127.1,311.7))+bankSeed)*43758.5453);
      q+=vec2(sin(seed*21.0),cos(seed*17.0))*.15;
      float stone=1.0-step(.18+seed*.16,length(q*vec2(1.0,1.4)));
      float stoneFace=step(.015,q.y)*stone;
      float sediment=.5+.25*sin(p.x*4.0+sin(p.y*6.0))+.25*cos(p.y*9.0-p.x*2.0);
      vec3 bed=mix(vec3(.007,.012,.010),vec3(.014,.020,.015),floor(sediment*4.0)/4.0);
      bed=mix(bed,vec3(.021,.025,.018)+stoneFace*vec3(.006,.006,.004),stone*.55);
      vec3 water=mix(deep,bed,shallows*.7);
      water+=glint*mix(vec3(.018,.031,.029),vec3(.045,.065,.061),step(.78,broken))*(1.0-shallows)*.55;
      // Broken reflection of the actual nearby powered floodlight. Its mirror
      // point follows the viewing ray, while the source remains fixed in world.
      vec2 delta=p-lampReflection.xy;
      float along=dot(delta,lampAxis),across=dot(delta,vec2(-lampAxis.y,lampAxis.x));
      float streak=exp(-across*across/0.035-along*along/1.1);
      float fragments=.18+.82*step(.35,sin(p.y*43.0+sin(p.x*11.0+waterClock*.4)-waterClock*.65));
      water+=lampTint*vec3(.13,.17,.16)*streak*fragments*lampReflection.z*(1.0-shallows);
      // An irregular dark meniscus anchors the bank without a bright outline.
      water*=mix(.62,1.0,smoothstep(.006,.055,bankDistance));
      diffuseColor.rgb=water;
    `);
  };
  material.customProgramCacheKey=()=> 'rough-cut-pixel-water-v6-local-contact';
  const mesh=new THREE.Mesh(new THREE.CircleGeometry(1,48),material);
  mesh.rotation.x=-Math.PI/2;mesh.scale.set(rx,rz,1);mesh.position.set(x,.083,z);parent.add(mesh);
  let time=0,last=null;
  return {update(frame,camera){outfall?.update(frame);const dt=last===null?0:Math.max(0,Math.min(.1,frame.time-last));if(last!==null&&frame.time<last)time=0;last=frame.time;if(!frame.paused&&!frame.reducedMotion){wind.value=THREE.MathUtils.damp(wind.value,THREE.MathUtils.clamp(frame.fx?.wind?.strength||0,0,1),2,dt);time+=dt*(1+wind.value*.3);}clock.value=time;
    if(lamp&&camera){const c=camera.position,t=(c.y-.083)/(c.y+3.13),px=c.x+(lamp.x-c.x)*t,pz=c.z+(lamp.z-c.z)*t;
      reflection.value.set(px-x,z-pz,THREE.MathUtils.clamp(frame.lightPower?.(lamp.source)??0,0,1),0);floodlightTint(reflection.value.z,tint.value);axis.value.set(lamp.x-c.x,c.z-lamp.z).normalize();}
    outfall?.setLight(tint.value,reflection.value.z);
  },stats:()=>({time,wind:wind.value,opaque:true,draws:1,position:[x,.083,z],radius:[rx,rz],runoff:outfall?.stats()||null,reflection:{source:lamp?.source.id||null,point:reflection.value.toArray().slice(0,2),power:reflection.value.z}})};
}
