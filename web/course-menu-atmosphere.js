(() => {
 // Cache text regions only when layout changes; particle frames never read layout.
 const quietSelectors='.course-menu-logo,.course-menu-heading,.course-menu-rail>nav button,.chapter-card-label,.course-menu-invitation h2,.course-menu-invitation>p:not([hidden]),.course-highlights,.course-menu-notice,.course-menu-extras,footer>small,.course-menu-start,.course-chapters>h2,.course-menu-records>summary,.course-menu-feature figcaption';
 window.RCMenuGrassLayout={measure(panel){
  const origin=panel.getBoundingClientRect(),rects=[];
  for(const el of panel.querySelectorAll(quietSelectors)){
   if(!el.getClientRects().length||rects.length>=20)continue;
   let r=el.getBoundingClientRect();
   if(el.tagName!=='IMG'){
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),bounds=[];let node;
    while((node=walker.nextNode()))if(node.textContent.trim()){const range=document.createRange();range.selectNodeContents(node);const box=range.getBoundingClientRect();if(box.width&&box.height)bounds.push(box);}
    if(!bounds.length)continue;
    r={left:Math.min(...bounds.map(b=>b.left)),top:Math.min(...bounds.map(b=>b.top)),right:Math.max(...bounds.map(b=>b.right)),bottom:Math.max(...bounds.map(b=>b.bottom))};
   }
   rects.push([r.left-origin.left-5,r.top-origin.top-4,r.right-origin.left+5,r.bottom-origin.top+4]);
  }
  return rects;
 },quiet(x,y,rects){let quiet=1;for(const r of rects){const dist=Math.max(r[0]-x,x-r[2],r[1]-y,y-r[3],0),v=Math.min(1,dist/28);quiet=Math.min(quiet,.24+.76*v*v*(3-2*v));}return quiet;}};
 const vertex=`attribute vec4 a_particle;uniform vec2 u_size;uniform float u_time;uniform vec4 u_quiet[20];uniform int u_quietCount;varying vec4 v_shape;varying vec4 v_shade;
 void main(){float i=a_particle.w,d=a_particle.z,t=u_time;float speed=(13.0+mod(i,7.0)*2.0)*(.45+d*.75)*1.65;
 // Nearby height bands share a rolling gust, while individual flutter stays independent.
 float gustPhase=t*.52-a_particle.y*5.0;float gust=sin(gustPhase);float breeze=sin(t*.23);
 float x=mod(a_particle.x*(u_size.x+80.0)+t*speed+gust*22.0*d+breeze*10.0*d,u_size.x+80.0)-40.0;
 float margin=min(70.0,u_size.y*.12);float y=margin+a_particle.y*(u_size.y-margin*2.0)-cos(gustPhase)*14.0*d+sin(t*.38+i*.8)*(6.0+8.0*d)+sin(t*.83+i)*2.5-sin(t*.12+i)*16.0*d;
 float fade=max(0.0,min(1.0,min((x+20.0)/60.0,(u_size.x+20.0-x)/60.0)));float flutter=sin(t*(.62+d*.2)+i*1.7);
 float angle=radians(-26.0+gust*12.0+flutter*(12.0+14.0*d));float kind=mod(i,10.0);float len=d>.9?12.0+mod(i,3.0):(d<.5?3.0+mod(i,2.0):6.0+mod(i,3.0));if(kind>8.5)len*=.55;
 float h=(d>.9?3.4:(d<.5?1.7:2.4))*(.72+.28*cos(t*.7+i));if(kind>8.5)h*=1.25;
 float quiet=1.0;for(int n=0;n<20;n++){if(n<u_quietCount){vec4 r=u_quiet[n];float distance=max(0.0,max(max(r.x-x,x-r.z),max(r.y-y,y-r.w)));quiet=min(quiet,mix(.24,1.0,smoothstep(0.0,28.0,distance)));}}
 float catchLight=mod(i,4.0)<.5?pow(max(0.0,cos(t*.72+i*1.7)),8.0):0.0;
 float opacity=(d>.9?.86:(d<.5?.43:.70))*fade*(.94+.06*flutter)*quiet;
 v_shape=vec4(len,h,angle,opacity);v_shade=vec4(mod(i,4.0),kind,catchLight,d);gl_Position=vec4(x/u_size.x*2.0-1.0,1.0-y/u_size.y*2.0,0.0,1.0);gl_PointSize=18.0;}`;
 const fragment=`precision mediump float;varying vec4 v_shape;varying vec4 v_shade;
 void main(){vec2 p=(gl_PointCoord-.5)*18.0;float c=cos(v_shape.z),s=sin(v_shape.z);p=vec2(c*p.x+s*p.y,-s*p.x+c*p.y);float along=p.x/v_shape.x+.5;if(along<0.0||along>1.0)discard;
 float profile=sin(along*3.141593);float bend=(along-.5)*(along-.5)*v_shape.y*.6;float halfWidth=pow(profile,.75)*v_shape.y*.5;
 if(v_shade.y>5.5&&v_shade.y<8.5){bend=sin(along*4.2-.7)*v_shape.y*.55;halfWidth=pow(profile,.85)*v_shape.y*.36;}
 if(v_shade.y>8.5){bend=0.0;halfWidth=sqrt(max(0.0,profile))*v_shape.y*.5;}
 float edge=abs(p.y-bend)-halfWidth;float alpha=(1.0-smoothstep(-.25,.65,edge))*v_shape.w;
 vec3 base=v_shade.x>1.5&&v_shade.x<2.5?vec3(.59,.60,.34):vec3(.40,.54,.30);vec3 lit=v_shade.x>1.5&&v_shade.x<2.5?vec3(.91,.83,.60):vec3(.78,.85,.61);
 vec3 color=mix(base,lit,clamp(.65-p.y/v_shape.y*.4+along*.15,0.0,1.0));color=mix(color,vec3(.96,.87,.63),v_shade.z*.72);gl_FragColor=vec4(color*alpha,alpha);}`;
 window.RCMenuAtmosphere={create(panel){
  // One point-sprite batch; motion and shading run on the GPU, not DOM styles.
  const canvas=document.createElement('canvas');canvas.className='menu-grass-speckles menu-grass-canvas';canvas.setAttribute('aria-hidden','true');panel.append(canvas);
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,powerPreference:'low-power'});
  if(!gl){canvas.remove();return window.RCMenuAtmosphereFallback.create(panel);}
  const rendererInfo=gl.getExtension('WEBGL_debug_renderer_info');
  if(rendererInfo&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))){gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();return window.RCMenuAtmosphereFallback.create(panel);}
  let program,buffer;
  function initialize(){
   const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
   const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   const data=new Float32Array(320);for(let i=0;i<80;i++)data.set([(i*.61803398875)%1,(i*.41421356237+.17)%1,i%9===0?1:i%3===0?.35:.7,i],i*4);
   gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'a_particle');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,4,gl.FLOAT,false,0,0);
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  }
  try{initialize();}catch(error){gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();return window.RCMenuAtmosphereFallback.create(panel);}
  let sizeUniform=gl.getUniformLocation(program,'u_size'),timeUniform=gl.getUniformLocation(program,'u_time');const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let quietRects=[],quietUniform=gl.getUniformLocation(program,'u_quiet[0]'),quietCountUniform=gl.getUniformLocation(program,'u_quietCount');
  function measureQuiet(){quietRects=window.RCMenuGrassLayout.measure(panel);const values=new Float32Array(80);quietRects.forEach((r,i)=>values.set(r,i*4));if(!lost){gl.uniform4fv(quietUniform,values);gl.uniform1i(quietCountUniform,quietRects.length);}}
  let active=false,focused=document.hasFocus(),enabled=false,chapter='',raf=null,last=0,time=0,frames=0,width=0,height=0,count=0,lost=false;
  function draw(){if(lost||!width||!height)return;gl.viewport(0,0,width,height);gl.uniform2f(sizeUniform,width,height);gl.uniform1f(timeUniform,time);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.POINTS,0,count);frames++;}
  function stop(){active=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;}
  function frame(now){raf=null;if(!active||lost)return;if(now-last>=1000/60-.5){time+=Math.min(100,now-last)/1000;last=now;draw();}raf=requestAnimationFrame(frame);}
  function reconcile(){const run=enabled&&!panel.hidden&&panel.dataset.screen==='menu'&&focused&&document.hasFocus()&&!document.hidden&&!reduced.matches&&!document.querySelector('dialog[open]')&&!lost;
   canvas.hidden=!enabled||reduced.matches;panel.dataset.atmosphere=run?'moving':'still';if(!run){stop();return;}if(!active){active=true;last=performance.now();raf=requestAnimationFrame(frame);}}
  new ResizeObserver(()=>{const w=panel.clientWidth,h=panel.clientHeight;if(!w||!h||(w===width&&h===height))return;width=w;height=h;canvas.width=w;canvas.height=h;count=Math.max(24,Math.min(80,Math.round(w*h/16000)));measureQuiet();draw();}).observe(panel);
  panel.addEventListener('scroll',measureQuiet,true);document.fonts.ready.then(measureQuiet);
  window.addEventListener('blur',()=>{focused=false;reconcile();});window.addEventListener('focus',()=>{focused=true;reconcile();});for(const event of ['pointerdown','keydown'])panel.addEventListener(event,()=>{focused=document.hasFocus();reconcile();});
  document.addEventListener('visibilitychange',reconcile);window.addEventListener('pagehide',stop);window.addEventListener('pageshow',reconcile);reduced.addEventListener('change',reconcile);
  new MutationObserver(reconcile).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stop();});canvas.addEventListener('webglcontextrestored',()=>{initialize();sizeUniform=gl.getUniformLocation(program,'u_size');timeUniform=gl.getUniformLocation(program,'u_time');quietUniform=gl.getUniformLocation(program,'u_quiet[0]');quietCountUniform=gl.getUniformLocation(program,'u_quietCount');lost=false;measureQuiet();draw();reconcile();});
  return {seedTime(seconds){if(Number.isFinite(seconds))time=Math.max(0,seconds);},sync(data){enabled=!data.reducedMotion;chapter=window.RCChapterSelect.selected().id;measureQuiet();reconcile();},stop,
   stats:()=>({active,scheduled:raf!==null,driver:'webgl-points',time:time*1000,frames,particles:count,quietRegions:quietRects.length,playing:active?count:0,chapter})};
 }};
})();
