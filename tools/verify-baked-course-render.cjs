const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const hardware=process.argv.includes('--hardware'),label=hardware?'hardware':'software',out='output/back-nine-experience/loading';const b=await chromium.launch({headless:true,args:hardware?['--use-angle=d3d11','--ignore-gpu-blocklist']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__surfaceWorld={scene,camera,renderer,mowerLight,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const rows=[];for(const [width,height] of [[2560,1600],[1280,720],[844,390]]){await p.setViewportSize({width,height});
 for(const [name,x,y,foot,rear] of [['wet-lane',18,162,false,false],['foliage-mower',-29,443,false,true],['shelter',0,287,false,false],['foot-garage',-33.15,764,true,false]]){
 const result=await p.evaluate(async({width,height,x,y,foot,rear})=>{
  const {createRun}=await import('./back-nine-sim.js'),{createCourseSurfaces}=await import('./course-surfaces.js'),w=__surfaceWorld,original=createCourseSurfaces(),targets=[],seen=new Set();
  w.scene.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.map?.userData.bakedCourseSurface&&!seen.has(m)){seen.add(m);targets.push({m,baked:m.map,old:original.texture(m.map.userData.bakedCourseSurface)});}});
  const r=createRun();r.mode='driving';r.time=10;r.grace=0;Object.assign(r.cart,{x,y,yaw:0,speed:8});if(foot){r.foot={x,y,yaw:0,viewYaw:0,onFoot:true,speed:7.2,invulnerable:0};Object.assign(r.cart,{x:0,y:10,health:0});}Object.assign(r.joe,{x:x+10,y:y-12,yaw:0,speed:12});
  w.renderer.setPixelRatio(1);w.renderer.setSize(width,height,false);w.camera.aspect=width/height;w.camera.updateProjectionMatrix();w.resetCamera();w.update(r,{rear});
  for(const t of targets)w.renderer.initTexture(t.old);
  const gl=w.renderer.getContext();function capture(baked){for(const t of targets)t.m.map=baked?t.baked:t.old;w.mowerLight.shadow.needsUpdate=true;w.draw();const a=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;}
  capture(false);capture(true);const a=capture(false),z=capture(true);let changed=0,maxDifference=0;for(let i=0;i<a.length;i++)if(a[i]!==z[i]){changed++;maxDifference=Math.max(maxDifference,Math.abs(a[i]-z[i]));}
  const types=[...new Set(targets.map(t=>t.baked.userData.bakedCourseSurface))];original.dispose();return {changed,maxDifference,materialCount:targets.length,types,preparation:w.stats().preparation};
 },{width,height,x,y,foot,rear});assert.equal(result.changed,0,`${label} ${name} ${width}`);assert.equal(result.types.length,10);rows.push({name,width,height,...result});
 if((width===2560&&name==='foliage-mower')||(width===1280&&name==='wet-lane')||(width===844&&name==='foot-garage'))await p.screenshot({path:`${out}/${label}-${name}-${width}.png`});
 }}assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${label}-render-proof.json`,JSON.stringify({passed:true,rows,errors},null,2));console.log(JSON.stringify({passed:true,label,views:rows.length,changed:rows.reduce((n,r)=>n+r.changed,0),materialCount:rows[0].materialCount,types:rows[0].types,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
