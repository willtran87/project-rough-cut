const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=`output/under-green/visual-pass84/motion/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/under-green-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-scene.js','utf8').replace(' return {draw,inspectCastShadow:',' window.__floodProbe={scene,renderer}; return {draw,inspectCastShadow:')}));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=26.3;r.elapsed=49;r.joe.phase='absent';Object.assign(r.player,{x:0,y:8,yaw:0,pitch:-.18,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();});
 const frames=[],canvas=p.locator('canvas').first();
 for(let n=0;n<8;n++){await p.evaluate(async n=>{__underGreen.run.elapsed=49+n*.12;advanceTime(0);await __underGreen.whenPresented();},n);frames.push(await canvas.screenshot({path:`${out}/motion-${n}.png`}));}
 assert(frames.slice(1).every((v,i)=>!v.equals(frames[i])),'Flood wave motion froze');
 await p.evaluate(async()=>{__underGreen.run.elapsed=49;advanceTime(0);await __underGreen.whenPresented();});assert(frames[0].equals(await canvas.screenshot()),'Flood phase did not return deterministically');
 await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()));await p.evaluate(()=>advanceTime(1200));assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics.flood.animationTime,frozen.graphics.flood.animationTime);
 await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');
 await p.evaluate(async()=>{advanceTime(0);await __underGreen.whenPresented();});const still=await canvas.screenshot();
 await p.evaluate(async()=>{__underGreen.run.elapsed=50;advanceTime(0);await __underGreen.whenPresented();});assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics.flood.animationTime,0);assert(still.equals(await canvas.screenshot()),'Reduced motion changed flood pixels within the high plateau');
 const shore=await p.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),{floorLayout}=await import('./under-green-course.js'),{scene,renderer}=__floodProbe,root=scene.getObjectByName('Drain flood'),source=root.children[0].material;
  const m=source.clone(),compile=source.onBeforeCompile,key=source.customProgramCacheKey();m.fog=false;m.toneMapped=false;m.transparent=false;m.opacity=1;
  m.onBeforeCompile=function(s,r){compile.call(this,s,r);s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=vec3(shoreDistance,.5,contact);diffuseColor.a=1.;\n#include <opaque_fragment>');};m.customProgramCacheKey=()=>key+'-shore-diagnostic';
  const oldAuto=renderer.autoClear;renderer.autoClear=true;const target=new T.WebGLRenderTarget(1,1,{colorSpace:T.NoColorSpace}),g=new T.PlaneGeometry(2,2);g.rotateX(-Math.PI/2);const plane=new T.Mesh(g,m),probe=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.01,10),pixel=new Uint8Array(4),rows=[];probe.add(plane,new T.PointLight(0xffffff,0));const walls=floorLayout().walls;
  const points=[['east-contact',4.86,10],['east-bank',4.65,10],['east-clear',3,10],['west-contact',-4.86,14],['west-bank',-4.65,14],['west-clear',-3,14],['pump',-26.85,40],['bunker',-31.85,60],['keeper',12,-2.85],['range',14.85,30]];
  try{for(const [name,x,y]of points){plane.position.set(x,.38,-y);camera.position.set(x,2,-y);camera.up.set(0,0,-1);camera.lookAt(x,.38,-y);camera.updateMatrixWorld();renderer.setRenderTarget(target);renderer.render(probe,camera);renderer.readRenderTargetPixels(target,0,0,1,1,pixel);
   const expected=Math.min(1,...walls.map(w=>new T.Box2(new T.Vector2(w.x-w.w/2,w.y-w.d/2),new T.Vector2(w.x+w.w/2,w.y+w.d/2)).distanceToPoint(new T.Vector2(x,y))));rows.push({name,x,y,expected,actual:pixel[0]/255,marker:pixel[1],contact:pixel[2]/255});
  }}finally{renderer.setRenderTarget(null);renderer.autoClear=oldAuto;target.dispose();g.dispose();m.dispose();advanceTime(0);await __underGreen.whenPresented();}return rows;
 });
 fs.writeFileSync(out+'/shore-samples.json',JSON.stringify({shore,errors},null,2));
 for(const sample of shore){assert(Math.abs(sample.marker-128)<=1,'Diagnostic failed to render');assert(Math.abs(sample.actual-sample.expected)<.025,'World shore misregistration '+JSON.stringify(sample));}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,motionFrames:frames.length,pause:true,reduced:true,deterministicReturn:true,shore,errors},null,2));console.log(JSON.stringify({passed:true,software,motionFrames:frames.length,shoreSamples:shore.length}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
