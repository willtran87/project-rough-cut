// Shared final-image pass for every chapter: bloom on bright lamps, a per-chapter
// colour grade, vignette and film grain. The chapter draws its frame to the
// screen exactly as before, then calls apply(): the finished frame is copied
// into a texture and redrawn through the grade. Working from the finished
// frame (rather than rendering the scene into a linear target) keeps every
// authored blend, tone map and unlit material identical underneath.
// At level 'off' apply() does nothing.
//
// Cost at 'high': one frame copy, one full-resolution composite and five
// quarter/eighth resolution passes. At 'low' the bloom passes are skipped.
// Nothing here adds scene draw calls.
//
// THREE is passed in because chapters load three.js by different specifiers and
// a page must never hold two copies of it.

export const LOOKS={
 // shadowTint/highTint multiply dark and bright areas of the finished frame.
 nightOrder:{shadowTint:[.98,1.03,1.12],highTint:[1.06,1.02,.94],saturation:1.1,contrast:1,vignette:.15,grain:.03,bloom:.6,threshold:.6},
 backNine:{shadowTint:[.92,.98,1.1],highTint:[1.06,1.02,.93],saturation:1.08,contrast:1.03,vignette:.2,grain:.028,bloom:.45,threshold:.7},
 underGreen:{shadowTint:[1.04,1.16,1.1],highTint:[1.1,1.06,.96],saturation:1.0,contrast:1.0,vignette:.1,grain:.03,bloom:.5,threshold:.6},
 finalCut:{shadowTint:[.95,.98,1.06],highTint:[1.07,1.0,.92],saturation:1.06,contrast:1.03,vignette:.2,grain:.028,bloom:.4,threshold:.72},
};
export const FINISH_LEVELS=['off','low','high'];

const VERT='varying vec2 vUv;void main(){vUv=position.xy*.5+.5;gl_Position=vec4(position.xy,0.,1.);}';
const BRIGHT=`uniform sampler2D tScene;uniform float threshold;varying vec2 vUv;
void main(){vec3 c=texture2D(tScene,vUv).rgb;float l=max(c.r,max(c.g,c.b));
 float k=smoothstep(threshold,1.,l);gl_FragColor=vec4(c*k,1.);}`;
const BLUR=`uniform sampler2D tMap;uniform vec2 step;varying vec2 vUv;
void main(){vec3 c=texture2D(tMap,vUv).rgb*.227;
 c+=(texture2D(tMap,vUv+step*1.385).rgb+texture2D(tMap,vUv-step*1.385).rgb)*.316;
 c+=(texture2D(tMap,vUv+step*3.231).rgb+texture2D(tMap,vUv-step*3.231).rgb)*.0703;
 gl_FragColor=vec4(c,1.);}`;
const FINAL=`uniform sampler2D tScene,tBloomA,tBloomB;uniform float bloom,saturation,contrast,vignette,grain,time,pulse,flash,fade;
uniform vec3 shadowTint,highTint,flashColor;varying vec2 vUv;
// Hash without sine or large multipliers: the earlier fract(p*k) form showed a
// regular cross-hatch on dark sky.
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
void main(){
 vec3 g=clamp(texture2D(tScene,vUv).rgb,0.,1.);
 if(bloom>0.){vec3 b=clamp((texture2D(tBloomA,vUv).rgb*.6+texture2D(tBloomB,vUv).rgb*.4)*bloom,0.,1.);g=1.-(1.-g)*(1.-b);}
 float l=dot(g,vec3(.2126,.7152,.0722));
 g=mix(vec3(l),g,saturation);
 g=(g-.1)*contrast+.1;
 g*=mix(shadowTint,highTint,smoothstep(0.,.75,l));
 vec2 q=(vUv-.5)*vec2(1.,.84);
 g*=1.-smoothstep(.34,.86,length(q))*(vignette+pulse*.4);
 float tick=floor(time*24.);g+=(hash(gl_FragCoord.xy+vec2(mod(tick*37.,251.),mod(tick*91.,241.)))-.5)*grain;
 g=mix(g,flashColor,flash);
 gl_FragColor=vec4(clamp(g,0.,1.)*fade,1.);
}`;

export function createScreenFinish(THREE,renderer,{look=LOOKS.nightOrder,level='high',reduced=false}={}){
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));
 const quad=new THREE.Mesh(geometry,null);quad.frustumCulled=false;const scene=new THREE.Scene();scene.add(quad);
 // Every pass reads and writes display-referred values, so nothing is tone
 // mapped or colour-converted a second time.
 const pass=(fragmentShader,uniforms)=>new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader,uniforms,depthTest:false,depthWrite:false,toneMapped:false,fog:false});
 const target=(w,h)=>new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,generateMipmaps:false});
 const size=new THREE.Vector2(),state={level:FINISH_LEVELS.includes(level)?level:'high',reduced};
 let frame=null,quarter=[],eighth=[],failed=false,applied=0;
 const bright=pass(BRIGHT,{tScene:{value:null},threshold:{value:look.threshold}});
 const blur=pass(BLUR,{tMap:{value:null},step:{value:new THREE.Vector2()}});
 const final=pass(FINAL,{tScene:{value:null},tBloomA:{value:null},tBloomB:{value:null},bloom:{value:0},saturation:{value:1},contrast:{value:1},vignette:{value:0},grain:{value:0},time:{value:0},pulse:{value:0},flash:{value:0},fade:{value:1},shadowTint:{value:new THREE.Color(1,1,1)},highTint:{value:new THREE.Color(1,1,1)},flashColor:{value:new THREE.Color(1,1,1)}});
 const current={...look},dynamic={tension:0,pulse:0,flash:0,fade:1,bloomScale:1};
 function applyLook(){
  const u=final.uniforms;u.saturation.value=current.saturation;u.contrast.value=current.contrast;
  u.shadowTint.value.setRGB(...current.shadowTint);u.highTint.value.setRGB(...current.highTint);bright.uniforms.threshold.value=current.threshold;
 }
 applyLook();
 function allocate(w,h){
  dispose(false);frame=new THREE.FramebufferTexture(w,h);frame.minFilter=frame.magFilter=THREE.LinearFilter;frame.generateMipmaps=false;
  const qw=Math.max(2,w>>2),qh=Math.max(2,h>>2),ew=Math.max(2,w>>3),eh=Math.max(2,h>>3);
  quarter=[target(qw,qh),target(qw,qh)];eighth=[target(ew,eh),target(ew,eh)];
 }
 function dispose(all=true){
  for(const t of [frame,...quarter,...eighth])t?.dispose();frame=null;quarter=[];eighth=[];
  if(all){geometry.dispose();bright.dispose();blur.dispose();final.dispose();}
 }
 function draw(material,to){quad.material=material;renderer.setRenderTarget(to);renderer.render(scene,camera);}
 function blurInto(pair,source){
  blur.uniforms.tMap.value=source;blur.uniforms.step.value.set(1/pair[0].width,0);draw(blur,pair[1]);
  blur.uniforms.tMap.value=pair[1].texture;blur.uniforms.step.value.set(0,1/pair[0].height);draw(blur,pair[0]);
 }
 const api={
  LOOKS,
  get level(){return failed?'off':state.level;},
  get applied(){return applied;},
  setLevel(next){if(FINISH_LEVELS.includes(next))state.level=next;},
  setReduced(value){state.reduced=!!value;},
  setLook(change){Object.assign(current,change);applyLook();},
  // tension 0..1 deepens vignette and grain; pulse 0..1 is a heartbeat darkening;
  // flash 0..1 mixes toward a colour; fade 0..1 scales the whole image.
  setTension(v){dynamic.tension=Math.max(0,Math.min(1,v||0));},
  setPulse(v){dynamic.pulse=Math.max(0,Math.min(1,v||0));},
  setFlash(v,color){dynamic.flash=Math.max(0,Math.min(1,v||0));if(color!==undefined)final.uniforms.flashColor.value.set(color);},
  setFade(v){dynamic.fade=Math.max(0,Math.min(1,v??1));},
  setBloomScale(v){dynamic.bloomScale=Math.max(0,v??1);},
  // Call once per frame after the chapter has drawn to the screen (render
  // target null). seconds is any monotonic clock; it only animates the grain.
  // Read renderer.info for your own statistics before calling this.
  apply(seconds=performance.now()/1000){
   if(failed||state.level==='off'||renderer.getRenderTarget())return false;
   const autoClear=renderer.autoClear,shadowUpdate=renderer.shadowMap.autoUpdate,shadowNeeds=renderer.shadowMap.needsUpdate;
   renderer.autoClear=false;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;
   try{
    renderer.getDrawingBufferSize(size);const w=Math.max(2,size.x|0),h=Math.max(2,size.y|0);
    if(!frame||frame.image.width!==w||frame.image.height!==h)allocate(w,h);
    renderer.copyFramebufferToTexture(frame);
    const u=final.uniforms,bloomOn=state.level==='high'&&current.bloom*dynamic.bloomScale>0;
    if(bloomOn){
     bright.uniforms.tScene.value=frame;draw(bright,quarter[0]);
     blurInto(quarter,quarter[0].texture);blurInto(eighth,quarter[0].texture);
     u.tBloomA.value=quarter[0].texture;u.tBloomB.value=eighth[0].texture;
    }
    u.bloom.value=bloomOn?current.bloom*dynamic.bloomScale:0;u.tScene.value=frame;
    const calm=state.reduced;
    u.vignette.value=current.vignette*(1+dynamic.tension*.45);u.grain.value=current.grain*(calm?.5:1+dynamic.tension*.8);
    u.time.value=calm?0:seconds;u.pulse.value=calm?0:dynamic.pulse;u.flash.value=calm?Math.min(.25,dynamic.flash):dynamic.flash;u.fade.value=dynamic.fade;
    draw(final,null);applied++;
   }catch(error){failed=true;renderer.setRenderTarget(null);console.warn('Screen finish disabled:',error);}
   finally{renderer.autoClear=autoClear;renderer.shadowMap.autoUpdate=shadowUpdate;renderer.shadowMap.needsUpdate=shadowNeeds;}
   return true;
  },
  dispose,
 };
 return api;
}
