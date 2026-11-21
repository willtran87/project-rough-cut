const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const motion=process.argv.includes('--motion'),software=process.argv.includes('--software'),out=`output/under-green/visual-pass89/views/${software?'software':'hardware'}${motion?'-motion':''}`;
fs.mkdirSync(out,{recursive:true});
const fixtures=[['gallery',0,8,0,.1],['crossing',0,19,0,-.05],['pump',-25.7,40,Math.PI/2,-.27],['range',12,35,Math.PI,.05],['keeper',12,13.5,-2.4,.05],['release',14.65,15.9,Math.PI,-.48],['bunker',-29.5,65,Math.PI,.15]];
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),pages=[],errors=[],rows=[];
try{
 for(const enabled of [false,true]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}pages.push(p);p.on('pageerror',e=>errors.push(e.stack));p.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
  await p.route('**/under-green-scene.js',r=>{let s=fs.readFileSync(enabled?'web/under-green-scene.js':'output/under-green/visual-pass89/source/under-green-scene-before.js','utf8');const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));s=s.replace(marker,' window.__shadowProbe={renderer,scene,camera,practicalLighting,practicalShadows,lamps};'+marker);return r.fulfill({contentType:'application/javascript',body:s});});
  await p.route('**/under-green-practical-lighting.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(enabled?'web/under-green-practical-lighting.js':'output/under-green/visual-pass89/source/under-green-practical-lighting-before.js','utf8')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__shadowProbe&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 }
 async function place(f,time=26.3,elapsed=0){for(const p of pages)await p.evaluate(async({f,time,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=time;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,time,elapsed});}
 async function capture(p){return p.evaluate(async()=>{advanceTime(0);await __underGreen.whenPresented();const gl=__shadowProbe.renderer.getContext(),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))).map(x=>x.toString(16).padStart(2,'0')).join('');const s=JSON.parse(render_game_to_text());return {hash,player:s.player,mode:s.mode,bypass:__underGreen.run.bypass,gate:__underGreen.run.gate,graphics:{resolution:s.graphics.resolution,practicals:s.graphics.practicalLighting,actor:s.graphics.actor}};});}
 async function compare(name){const pair=[];for(const p of pages)pair.push(await capture(p));rows.push({name,pair});await pages[1].screenshot({path:`${out}/${name}.jpg`,quality:91});fs.writeFileSync(out+'/partial.json',JSON.stringify({rows,errors},null,2));if(fixtures.some(f=>f[0]===name))await pages[0].screenshot({path:`${out}/before-${name}.jpg`,quality:91});assert.equal(pair[0].hash,pair[1].hash,'Pixel difference: '+name);for(const k of ['player','mode','bypass','gate'])assert.deepEqual(pair[0][k],pair[1][k]);}
 if(motion){
  // Turn through each district and return to the starting pose. Large cover
  // volumes cross the near plane as the camera turns; discarded geometry
  // must be restored immediately, including around the keeper recesses.
  for(const f of fixtures)for(let step=0;step<=8;step++){
   const angle=step*Math.PI/4,pose=[f[0],f[1]+Math.sin(angle)*.18,f[2]+Math.cos(angle)*.18,f[3]+angle,f[4]+Math.sin(angle)*.22];
   await place(pose);await compare(f[0]+'-turn-'+step);
  }
 }else{
 for(const f of fixtures){await place(f);await compare(f[0]);}
 for(const time of [1,7.2,16.4,41,64,96]){await place(fixtures[1],time);await compare('pressure-'+time);}
 for(const elapsed of [42,49,60]){await place(fixtures[1],26.3,elapsed);await compare('flood-'+elapsed);}
 for(const [width,height]of [[1280,720],[390,844],[844,390]]){for(const p of pages)await p.setViewportSize({width,height});await place(fixtures[2]);await compare('pump-'+width);}
 for(const p of pages)await p.setViewportSize({width:2560,height:1600});
 await place(fixtures[2]);for(const p of pages)await p.keyboard.down('e');
 for(const ms of [80,150,250,700,2000]){for(const p of pages)await p.evaluate(async ms=>{advanceTime(ms);await __underGreen.whenPresented();},ms);await compare('pump-motion-'+ms);}
 for(const p of pages){await p.keyboard.up('e');assert(await p.evaluate(()=>__underGreen.run.bypass),'E failed');}
 await place(fixtures[5]);for(const p of pages){await p.evaluate(()=>{__underGreen.run.bypass=true;__underGreen.run.bypassAt=20;__underGreen.run.lessonCrossed=true;advanceTime(0)});await p.keyboard.press('e');}
 for(const ms of [80,250,500,800]){for(const p of pages)await p.evaluate(async ms=>{advanceTime(ms);await __underGreen.whenPresented();},ms);await compare('release-motion-'+ms);}
 for(const key of ['q','c']){await place(fixtures[2]);for(const p of pages){await p.keyboard.down(key);await p.evaluate(async()=>{advanceTime(250);await __underGreen.whenPresented()});}await compare('input-'+key);for(const p of pages)await p.keyboard.up(key);}
 await place(fixtures[1]);for(const p of pages){await p.keyboard.press('Escape');const time=await p.evaluate(()=>__underGreen.run.time);await p.evaluate(()=>advanceTime(1000));assert.equal(await p.evaluate(()=>__underGreen.run.time),time);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');}await place(fixtures[1]);await compare('reduced');
 }
 const shadowChanges=rows.filter(r=>fixtures.some(f=>f[0]===r.name)).map(r=>({name:r.name,changed:r.pair[0].hash!==r.pair[1].hash}));
 assert(shadowChanges.every(s=>!s.changed),'Expected identical enclosure shadows');assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,shadowChanges,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,shadowChanges}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
