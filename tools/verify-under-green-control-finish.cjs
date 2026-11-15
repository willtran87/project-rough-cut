const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass20-controls/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],errors=[];
 try{
  for(const before of [true,false]){
   const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   for(const file of ['under-green-scene.js','under-green-machinery-detail.js','under-green-pump-scene.js','under-green-release-scene.js'])await p.route('**/'+file,r=>{
    let body=fs.readFileSync((before?'output/under-green/visual-upgrade/pass20-source/':'web/')+file,'utf8');
    if(!before&&file==='under-green-pump-scene.js')body=body.replace(' let state={};',' window.__controlArt={root,lever,gauges,glassMaterial}; let state={};');
    if(file==='under-green-scene.js')body=body.replace(' return {draw,drainJoeFootsteps:',' window.__machineAudit={scene,materials,renderer}; return {draw,drainJoeFootsteps:');
    return r.fulfill({contentType:'application/javascript',body});
   });
   await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
   const fixtures=[['overview',-19,38,-1,.05],['front',-24,40.9,-.77,-.17],['rear',-24,45,-2.35,-.15],['casting',-24.7,41.7,-.85,-.3],['motor',-24.8,43.5,-1.8,-.25],['operator',-25.7,40,Math.PI/2,-.2],['release',14.65,3.3,Math.PI,-.48]];
   async function seed(f){await p.evaluate(async([name,x,y,yaw,pitch])=>{const {createRun}=await import('./under-green-sim.js'),{SLUICE,onFloor}=await import('./under-green-course.js');const r=createRun();r.mode='playing';r.time=30;r.joe.phase='absent';if(name==='release'){r.bypass=true;r.bypassAt=20;x=SLUICE.x;y=SLUICE.y+1.3;}if(!onFloor(x,y))throw Error('Fixture outside actual floor: '+name);Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
   async function capture(name){await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));if(name==='release')assert.equal(state.action?.id,'gate');const viewport=p.viewportSize();views.push({before,name,viewport,state});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${viewport.width}.png`});}
   for(const f of fixtures){await seed(f);await capture(f[0]);}
   if(!before){
    const audit=await p.evaluate(()=>{
     const a=__machineAudit,control=__controlArt,mat=Object.fromEntries(['machinePaint','machineIron','machineSteel','machineRust','machineRed'].map(n=>{const m=a.materials[n];return [n,{size:[m.map.image.width,m.map.image.height],span:m.userData.drainUVMetres,mag:m.map.magFilter,bump:!!m.bumpMap,independentWet:m.map!==m.specularMap}];}));
     const textures=new Set();a.scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])for(const v of Object.values(m))if(v?.isTexture)textures.add(v);});
     const glass=control.root.children.find(o=>o.material===control.glassMaterial),glassZ=glass.geometry.attributes.position;
     let glassFront=-Infinity,glassBack=Infinity,needleFront=-Infinity,gripRadius=0;
     for(let i=0;i<glassZ.count;i++){glassFront=Math.max(glassFront,glassZ.getZ(i));glassBack=Math.min(glassBack,glassZ.getZ(i));}
     control.root.updateMatrixWorld(true);const rootInverse=control.root.matrixWorld.clone().invert();
     for(const gauge of control.gauges)gauge.needle.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(rootInverse.clone().multiply(o.matrixWorld));for(let i=0;i<g.attributes.position.count;i++)needleFront=Math.max(needleFront,g.attributes.position.getZ(i));g.dispose();});
     for(const o of control.lever.children)for(let i=0;i<o.geometry.attributes.position.count;i++)gripRadius=Math.max(gripRadius,Math.hypot(o.geometry.attributes.position.getY(i),o.geometry.attributes.position.getZ(i)));
     return {glass:{front:glassFront,back:glassBack,needleFront,depthWrite:control.glassMaterial.depthWrite},gripRadius,mat,textureObjects:textures.size,sameMetal:a.materials.machineIron.map===a.materials.machineSteel.map,paintNotWall:a.materials.machinePaint.map!==a.materials.rangeStone.map};
    });
    assert(audit.sameMetal&&audit.paintNotWall);assert(audit.glass.back>audit.glass.needleFront+.002);assert(!audit.glass.depthWrite);assert(audit.gripRadius<.50);for(const m of Object.values(audit.mat)){assert.equal(m.span,1);assert.equal(m.mag,1003);assert(!m.bump&&m.independentWet);}
    fs.writeFileSync(out+'/materials.json',JSON.stringify(audit,null,2));
    await seed(fixtures.find(f=>f[0]==='operator'));await p.keyboard.press('e');await p.evaluate(()=>advanceTime(200));await capture('operator-moving');
    let s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(s.bypass);for(const g of s.graphics.pump.gauges)assert.equal(g.level,s.waters.find(w=>w.id===g.id).level);
    await p.keyboard.press('Escape');const paused=s.graphics.pump;await p.evaluate(()=>advanceTime(500));s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.deepEqual(s.graphics.pump,paused);await p.click('#primary');await p.evaluate(()=>advanceTime(2100));await capture('operator-latched');assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics.pump.latched);
    await seed(fixtures.find(f=>f[0]==='release'));await p.keyboard.press('e');await p.evaluate(()=>advanceTime(350));await capture('release-moving');s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(s.closing&&s.gate>0&&s.gate<1);await p.evaluate(()=>advanceTime(1500));await capture('release-secured');assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics.release.secured);
    if(!software)for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const f of fixtures.filter(f=>['front','operator','release'].includes(f[0]))){await seed(f);await capture(f[0]);}}
   }
   await p.close();console.log(JSON.stringify({before,software,views:views.filter(v=>v.before===before).length}));
  }
  for(const old of views.filter(v=>v.before)){const v=views.find(v=>!v.before&&v.name===old.name&&v.viewport.width===old.viewport.width);assert.deepEqual(v.state.graphics.resolution,old.state.graphics.resolution);assert(v.state.graphics.draws<=old.state.graphics.draws+3,old.name+' draw budget');assert(v.state.graphics.triangles<=old.state.graphics.triangles+2000,old.name+' triangle budget');}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
