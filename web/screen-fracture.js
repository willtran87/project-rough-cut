import * as THREE from './vendor/three/three.module.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// The signal displaces the scene already being presented. It never touches the
// camera, HUD, simulation or a captured illustration of a different scene.
export function fractureSample(frame,ghost){
  const f=frame.fx||{};
  if(!f.screen || f.enabled===false || frame.reducedMotion || f.suppressScares || frame.joe.mode==='chase')return null;
  const flash=f.flashes?f.horror?.visualFlash:null;
  const course=flash?.type==='course_tear' && flash.seconds>0 ? {
    kind:'course',side:flash.side||1,variant:0,
    progress:clamp(1-flash.seconds/flash.duration,0,1),
    strength:Math.sin(clamp(1-flash.seconds/flash.duration,0,1)*Math.PI)*.36,
  }:null;
  const cue=f.ghostInterference!==false && ghost?.strength>0 ? ghost:course;
  if(!cue)return null;
  const progress=clamp(cue.progress??(cue.slice||0)/6,0,1);
  const held=cue.kind==='stare'||cue.kind==='hesitate',away=cue.kind==='lookaway';
  const variant=cue.variant||0,side=cue.side<0?-1:1;
  const strength=clamp(cue.strength,0,.65);
  // A single slip with an eased recoil, not alternating full-screen jitter.
  const recoil=cue.kind==='feint'||cue.kind==='lookback'?1-1.35*(progress*progress*(3-2*progress)):1;
  const shift=strength*(held?5:away?6:10)*side*recoil;
  let center=cue.focusY==null?(variant===1?.36:.64):clamp(cue.focusY+(cue.focusY<.5?-.09:.09),.23,.77);
  if(center>.4&&center<.6)center=center<.5?.39:.61;
  return {kind:cue.kind,shift,shiftPixels:Math.abs(shift),strength,
    center,
    halfWidth:held?.016:away?.022:.035,
    edge:cue.kind==='stare'?3:away||cue.kind==='course'?(side<0?1:2):0};
}

export function createScreenFracture(material,{software=false}={}){
  const uniforms={rcFracture:{value:new THREE.Vector4()},rcFractureSize:{value:new THREE.Vector2(960,540)},rcFractureEdge:{value:0},rcFractureEcho:{value:software?0:.13}};
  let sample=null;
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.fragmentShader=`uniform vec4 rcFracture;
uniform vec2 rcFractureSize;
uniform float rcFractureEdge;
uniform float rcFractureEcho;
vec4 rcFracturedScene(sampler2D sceneMap, vec2 uv) {
  if(abs(rcFracture.x)<.25)return texture2D(sceneMap,uv);
  vec2 pixel=1.0/rcFractureSize;
  if(abs(uv.y-rcFracture.y)>rcFracture.z+3.0*pixel.y && abs(uv.y-(1.0-rcFracture.y))>4.0*pixel.y)return texture2D(sceneMap,uv);
  float column=floor(uv.x*7.0);
  float irregular=(mod(column,3.0)-1.0)*pixel.y*1.5;
  float y=uv.y+irregular;
  float primary=1.0-smoothstep(rcFracture.z-pixel.y,rcFracture.z+pixel.y,abs(y-rcFracture.y));
  float secondary=1.0-smoothstep(pixel.y,pixel.y*3.0,abs(y-(1.0-rcFracture.y)));
  float edges=1.0;
  if(rcFractureEdge>2.5)edges=smoothstep(.30,.45,abs(uv.x-.5));
  else if(rcFractureEdge>1.5)edges=smoothstep(.78,.96,uv.x);
  else if(rcFractureEdge>.5)edges=1.0-smoothstep(.04,.22,uv.x);
  float center=1.0-(1.0-smoothstep(.08,.16,abs(uv.x-.5)))*(1.0-smoothstep(.08,.16,abs(uv.y-.5)));
  float offset=floor(rcFracture.x*(primary-secondary*.38)*edges*center*(.72+mod(column,3.0)*.14)+.5);
  vec2 displaced=clamp(uv+vec2(offset*pixel.x,0.0),pixel*.5,1.0-pixel*.5);
  vec4 scene=texture2D(sceneMap,displaced);
  if(rcFractureEcho>0.0 && primary>0.0 && primary<.95 && abs(offset)>.5){
    vec4 echo=texture2D(sceneMap,uv);
    scene.rgb=mix(scene.rgb,echo.rgb,rcFractureEcho*edges);
  }
  // A faint loss of colour inside the slip; no white bars or RGB fringes.
  float luma=dot(scene.rgb,vec3(.2126,.7152,.0722));
  scene.rgb=mix(scene.rgb,vec3(luma)*vec3(.96,1.0,.985),primary*edges*center*rcFracture.w*.16);
  return scene;
}
`+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','rcFracturedScene( map, vMapUv )'));
  };
  material.customProgramCacheKey=()=> 'rough-cut-screen-fracture-v1';
  return {
    update(frame,ghost,width,height){
      sample=fractureSample(frame,ghost);uniforms.rcFractureSize.value.set(width,height);
      uniforms.rcFracture.value.set(sample?.shift||0,sample?.center||.72,sample?.halfWidth||.035,sample?.strength||0);
      uniforms.rcFractureEdge.value=sample?.edge||0;
    },
    clear(){sample=null;uniforms.rcFracture.value.x=0;},
    stats:()=>({mode:'scene-displacement',shiftPixels:sample?.shiftPixels||0,kind:sample?.kind||null,extraPasses:0,readbacks:0,echo:!software}),
  };
}

// Explicit copy-presentation fallback: two small self-blits of the already
// copied scene, before its HUD is drawn. No additional WebGL canvas readback.
export function drawCopyFracture(ctx,frame,ghost,width,height){
  const sample=fractureSample(frame,ghost);
  if(!sample || sample.shiftPixels<.25)return sample;
  const w=ctx.canvas.width,h=ctx.canvas.height;
  ctx.save();ctx.imageSmoothingEnabled=false;
  for(const [center,half,scale]of [[sample.center,sample.halfWidth,1],[1-sample.center,2/height,-.38]]){
    const y=Math.round((1-center-half)*h),band=Math.max(1,Math.round(half*2*h));
    let regions=sample.edge===3?[[0,w*.2],[w*.8,w*.2]]:sample.edge===1?[[0,w*.2]]:sample.edge===2?[[w*.8,w*.2]]:[[0,w]];
    for(const [x,length]of regions){const shift=Math.round(sample.shift*scale)*w/width;
      ctx.save();ctx.beginPath();ctx.rect(x,y,length,band);ctx.clip();ctx.drawImage(ctx.canvas,0,y,w,band,shift,y,w,band);ctx.restore();}
  }
  ctx.restore();return sample;
}
