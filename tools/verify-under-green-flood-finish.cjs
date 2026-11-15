const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),preview=process.argv.includes('--preview');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass84/${software?'software':'hardware'}`;
const files=['under-green-flood-scene','under-green-scene'];
const fixtures=[['entry',0,8,0,-.18],['root',0,12,-.5,-.4],['reverse',0,18,Math.PI,-.3],['controls',-25.7,40,Math.PI/2,-.27],['crossing',0,19,0,-.35],['keeper',12,13.5,-2.4,-.35],['floor',0,10,0,-.65],['west-wall',-3,14.7,-Math.PI/2,-.38],['east-wall',3,10.5,Math.PI/2,-.38]];
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[],audits=[];try{
for(const before of [true,false]){
 const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const name of files)await p.route('**/'+name+'.js',r=>{let s=fs.readFileSync(before&&name!=='under-green-scene'?'output/under-green/visual-pass84/source/'+name+'-before.js':'web/'+name+'.js','utf8');if(name==='under-green-scene')s=s.replace(' return {draw,inspectCastShadow:',' window.__pumpLight={scene,renderer,camera,lamps,batchCulling,structureMeshes,practicalLighting}; return {draw,inspectCastShadow:');return r.fulfill({contentType:'application/javascript',body:s});});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 async function place(f,elapsed=49,time=26.3){await p.evaluate(async({f,elapsed,time})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');const assertClear=!solid({x:f[1],y:f[2]},.3);if(!assertClear)throw Error('Solid fixture '+f[0]);const r=createRun();r.mode='playing';r.time=time;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,elapsed,time});}
 async function shot(name){const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:s.graphics});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
 for(const f of fixtures){await place(f);await shot(f[0]);}
 for(const [view,jy,yaw,py]of [['joe-approach',14,Math.PI,10],['joe-return',11.7,0,16.5]]){
  await place([view,0,py,yaw+Math.PI,0]);await p.evaluate(async({jy,yaw})=>{const {settleWeapon}=await import('./under-green-clearance.js');Object.assign(__underGreen.run.joe,{x:0,y:jy,yaw,phase:'walk',age:.3,speed:0,walk:.2});settleWeapon(__underGreen.run,1/60);advanceTime(0);await __underGreen.whenPresented();},{jy,yaw});await shot(view);
 }

 for(const elapsed of [0,35,39,42,49,60,70,90]){await place(fixtures[0],elapsed,elapsed);await shot('cycle-'+elapsed);const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(state.graphics.flood.wallFilm.waterline,state.flood.depth);}
 const audit={};audits.push(audit);
 if(!before&&!preview){
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const f of [fixtures[0],fixtures[3]]){await place(f);await shot(f[0]);}}
  await p.setViewportSize({width:2560,height:1600});await place(fixtures[3]);const settled=await p.screenshot({type:'png'});await place(fixtures[0]);await place(fixtures[3]);assert(settled.equals(await p.screenshot({type:'png'})),'Camera-dependent illumination');
  await p.keyboard.down('e');await p.evaluate(()=>advanceTime(1200));await p.keyboard.up('e');await p.evaluate(()=>advanceTime(1800));assert(await p.evaluate(()=>__underGreen.run.bypass),'E failed to divert pump');await shot('operated');
  await p.keyboard.press('Escape');const elapsed=await p.evaluate(()=>__underGreen.run.elapsed);await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>__underGreen.run.elapsed),elapsed);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[0]);await shot('reduced');
  await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').uncheck();await p.click('#primary');
  const dip=await p.evaluate(async()=>{const {dampLampLevel}=await import('./under-green-atmosphere.js');let best={time:0,level:Infinity};for(let n=0;n<900;n++){const time=n/10,level=dampLampLevel(time,1);if(level<best.level)best={time,level};}return best;});await place(fixtures[0],0,dip.time);await shot('lamp-minimum');
  await place(fixtures[0]);await p.keyboard.down('c');await p.evaluate(()=>advanceTime(300));await shot('crouch');await p.keyboard.up('c');await p.evaluate(()=>advanceTime(300));await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('lookback');await p.keyboard.up('q');
  audit.clearance=await p.evaluate(async()=>{const {solid}=await import('./under-green-course.js'),poses=[];for(const x of [-4.5,-3.9,-3,-1,0,2,4.5])for(const y of [7,8,10.5,11.5,13,15,15.5,17]){if(solid({x,y},.3))continue;for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [390/844,844/390])for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5])poses.push({x,y,height,pitch,fov,aspect,yaw});}return {samples:poses.length,hits:__underGreen.inspectCameraClearance(poses).filter(r=>r.hits.length)};});assert.deepEqual(audit.clearance.hits,[]);
 }
 await p.close();
}
fs.writeFileSync(out+'/audit.json',JSON.stringify(audits,null,2));
for(const a of rows.filter(r=>r.before)){const z=rows.find(r=>!r.before&&r.name===a.name);assert.deepEqual(a.player,z.player);assert.deepEqual(a.graphics.resolution,z.graphics.resolution);assert(z.graphics.textures>=a.graphics.textures&&z.graphics.textures<=a.graphics.textures+1);assert.equal(a.graphics.draws,z.graphics.draws);assert.equal(a.graphics.triangles,z.graphics.triangles);}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,audits,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,cameras:audits[1].clearance?.samples}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

