const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass22-ghost/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[],metrics=[];
 try{
  for(const before of [true,false]){
   const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   for(const file of ['under-green-actor.js','under-green-shadow.js','under-green-scene.js'])await p.route('**/'+file,r=>{
    const source=before&&file!=='under-green-scene.js'?'output/under-green/visual-upgrade/pass22-source/':'web/';let body=fs.readFileSync(source+file,'utf8');
    if(file==='under-green-shadow.js')body=body.replace('root.add(mesh);state.ready=true;','root.add(mesh);window.__ghostVisual={root,mesh,material};state.ready=true;');
    if(file==='under-green-scene.js')body=body.replace(' return {draw,drainJoeFootsteps:',' window.__ghostScene={renderer,scene,camera}; return {draw,drainJoeFootsteps:');
    return r.fulfill({contentType:'application/javascript',body});
   });
   await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
   async function seed(y=24){await p.evaluate(async y=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.elapsed=10;r.time=10;Object.assign(r.player,{x:0,y,yaw:0});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},y);}
   async function age(age){await p.evaluate(async age=>{__underGreen.run.elapsed=10+age;__underGreen.run.time=10+age;advanceTime(0);await __underGreen.whenPresented();},age);}
   async function capture(name){const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.png`});views.push({before,name,viewport:p.viewportSize(),state});return state;}
   await seed();for(const t of [0,.3,.75,1.1,2.5,3.05,5.5,6.5,7.5,8.5,9.1]){await age(t);await capture('fade-'+t);}
   await seed();await age(2.5);
   const pixels=await p.evaluate(async()=>{
    const {renderer,scene,camera}=__ghostScene,{root,mesh,material}=__ghostVisual,canvas=renderer.domElement,c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;const context=c.getContext('2d',{willReadFrequently:true});
    const read=()=>{renderer.render(scene,camera);context.drawImage(canvas,0,0);return context.getImageData(0,0,c.width,c.height).data;};
    const measure=()=>{mesh.visible=false;const absent=read();mesh.visible=true;const shown=read();let changed=0,total=0,bright=0,dark=0,max=0;for(let i=0;i<shown.length;i+=4){const d=(shown[i]-absent[i])*.2126+(shown[i+1]-absent[i+1])*.7152+(shown[i+2]-absent[i+2])*.0722;if(Math.abs(d)>.9){changed++;total+=Math.abs(d);if(d>0)bright++;else dark++;max=Math.max(max,Math.abs(d));}}return {changed,meanAbsolute:total/Math.max(1,changed),bright,dark,max};};
    const visible=measure(),stored=root.position.clone();
    // Place the baked apparition behind the opaque side wall; it must add
    // no pixels even though its transparent mesh is still submitted.
    const run=__underGreen.run,savedYaw=run.player.yaw;run.player.yaw=Math.atan2(12-run.player.x,-stored.z-run.player.y);advanceTime(0);await __underGreen.whenPresented();
    root.position.x=12;root.updateMatrixWorld(true);const projected=root.position.clone();projected.y=1;projected.project(camera);const occluded=measure();
    run.player.yaw=savedYaw;advanceTime(0);await __underGreen.whenPresented();root.position.copy(stored);
    const colors=mesh.geometry.attributes.color,metal=mesh.geometry.attributes.ghostMetal;
    const result={visible,occluded,occludedNDC:projected.toArray(),emissive:material.emissive.getHex(),depthWrite:material.depthWrite,depthTest:material.depthTest,textures:Object.values(material).filter(v=>v?.isTexture).length,extraAttributeBytes:(colors?.array.byteLength||0)+(metal?.array.byteLength||0),materialRange:colors?{min:Math.min(...colors.array),max:Math.max(...colors.array)}:null};read();return result;
   });assert(pixels.visible.changed>20,'Ghost has visible pixels at peak');assert(Math.abs(pixels.occludedNDC[0])<.1&&Math.abs(pixels.occludedNDC[1])<.9,'Occluded ghost is centred in the camera');assert.equal(pixels.occluded.changed,0,'No ghost through opaque wall');if(!before){assert.equal(pixels.emissive,0);assert(pixels.depthTest&&!pixels.depthWrite);assert.equal(pixels.textures,0);assert(pixels.materialRange.max>pixels.materialRange.min*2);}metrics.push({before,...pixels});
   if(!before){
    const lifecycle=views.filter(v=>!v.before&&v.name.startsWith('fade-'));assert.equal(lifecycle[0].state.graphics.ghost.alpha,0);assert.equal(lifecycle.at(-1).state.graphics.ghost.visible,false);assert(lifecycle[4].state.graphics.ghost.alpha>.4);assert.notEqual(lifecycle[4].state.graphics.ghost.gait,lifecycle[5].state.graphics.ghost.gait);
    await seed();await age(3);await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ghost);await p.evaluate(()=>advanceTime(1000));assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ghost),frozen);await p.locator('#comfort summary').click();await p.locator('#reduced').check();await p.click('#primary');await age(3.5);const reduced=await capture('reduced');assert(reduced.graphics.ghost.visible);assert.notEqual(reduced.graphics.ghost.gait,frozen.gait);
    // Turning away changes neither fade age nor world location.
    const stable=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ghost);await p.evaluate(async()=>{__underGreen.run.player.yaw=Math.PI;advanceTime(0);await __underGreen.whenPresented();});assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ghost),stable);await capture('away');
    await seed(26.5);await age(3);await capture('closer');
    const sites=await p.evaluate(async()=>{
     const {createRun}=await import('./under-green-sim.js'),{HAUNT_SITES,createDrainHaunting}=await import('./under-green-haunting.js'),{solid}=await import('./under-green-course.js');const found=[];
     for(let index=0;index<HAUNT_SITES.length;index++){
      const site=HAUNT_SITES[index];let candidate=null;
      for(const distance of [8,10,12,15]){for(let a=0;a<Math.PI*2;a+=Math.PI/16){const x=site.x+Math.sin(a)*distance,y=site.y+Math.cos(a)*distance;if(solid({x,y},.35,true))continue;const r=createRun();r.mode='playing';r.elapsed=10;Object.assign(r.player,{x,y,yaw:Math.atan2(site.x-x,site.y-y)});const ghost=createDrainHaunting().sample(r);if(ghost&&Math.hypot(ghost.x-site.x,ghost.y-site.y)<3){candidate={index,x,y,yaw:r.player.yaw};break;}}if(candidate)break;}
      if(!candidate)throw Error('No valid sighting viewpoint for site '+index);found.push(candidate);
     }return found;
    });
    for(const site of sites){await p.evaluate(async site=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.elapsed=10;r.time=10;Object.assign(r.player,site);__underGreen.run=r;advanceTime(0);r.elapsed=13;r.time=13;advanceTime(0);await __underGreen.whenPresented();},site);const s=await capture('site-'+site.index);assert(s.graphics.ghost.visible);}

    if(!software)for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await seed();await age(2.5);await capture('peak');}
    await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(0));assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics.ghost.serial,0);
   }
   await p.close();console.log(JSON.stringify({before,software,views:views.filter(v=>v.before===before).length,pixels}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views,metrics,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
