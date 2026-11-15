import * as THREE from './vendor/three/three.module.js';
import {rigLampState} from './final-cut-reveal.js';
import {RIG_HEADLAMPS} from './final-cut-rig.js';
import {headlampOrigin} from './final-cut-lamps.js';

export const HEADLIGHT_INTENSITY=48;
// A work-light reflector spreads a broad horizontal shoulder around its
// central pool. This static optical mask moves with the real lamp/shadow
// matrix; it never follows the camera or changes the warning timing.
function reflectorProfile(){
 const size=128,data=new Uint8Array(size*size*4),smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1,r=Math.hypot(u,v/0.82);
  const shoulder=1-smooth(.66,1.08,r),core=.66+.34*Math.exp(-r*r*3.4),fluting=.975+.025*Math.cos(u*Math.PI*12),value=Math.round(255*shoulder*core*fluting),k=(y*size+x)*4;
  data[k]=data[k+1]=data[k+2]=value;data[k+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size);texture.name='Finale-work-light-reflector';texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;return texture;
}

// The rig's two shadow-casting headlights share its live position and roll.
// The separate apron work light only illuminates the initial boarding beat.
export function createFinalCutHeadlights(renderer,body,{software=false}={}){
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=software?THREE.BasicShadowMap:THREE.PCFShadowMap;
 const mapSize=software?256:512,profile=reflectorProfile();
 const lights=RIG_HEADLAMPS.map(spec=>{
  const light=new THREE.SpotLight('#ffe3b2',HEADLIGHT_INTENSITY,38,.65,.4,1.2);
  light.map=profile;
  light.position.set(...headlampOrigin(spec));light.target.position.set(spec.side,.2,-22);
  light.castShadow=true;light.shadow.mapSize.set(mapSize,mapSize);
  light.shadow.camera.near=.15;light.shadow.camera.far=38;
  light.shadow.bias=-.0001;light.shadow.normalBias=.025;
  light.shadow.autoUpdate=false;
  body.add(light,light.target);return light;
 });
 let previous='',updates=0;
 return {lights,update(r){
  const intensity=HEADLIGHT_INTENSITY*rigLampState(r).beam;
  // Wheel/reel rotation also changes the near-field shadow. Simulation time
  // is frozen by pause; reduced motion never removes this spatial cue.
  const key=[r.rig.x,r.rig.y,r.rig.yaw,r.rig.deployment,r.rig.distance,r.rig.steering,r.rig.reelAngle,r.arrival.gate,r.ending.gate,r.won?r.ending.age:0].join('|');
  for(const light of lights){light.intensity=intensity;if(intensity>0&&key!==previous)light.shadow.needsUpdate=true;}
  if(intensity>0&&key!==previous){previous=key;updates++;}
 },stats:()=>({lights:2,mapSize,filter:software?'basic':'pcf',updates,intensity:lights[0].intensity,peakIntensity:HEADLIGHT_INTENSITY,profile:[128,128],shadows:lights.every(l=>!!l.shadow.map)}),dispose(){profile.dispose();for(const light of lights){light.shadow.map?.dispose();light.shadow.mapPass?.dispose();}}};
}
