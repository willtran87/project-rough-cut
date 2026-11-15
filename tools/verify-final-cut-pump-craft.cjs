const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const before=process.argv.includes('--before'),software=process.argv.includes('--software');
const out=`output/final-cut/pump-craft/${before?'before':software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}});p.setDefaultTimeout(120000);const errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(before)for(const name of ['scene','estate-detail','irrigation'])await p.route(`**/final-cut-${name}.js`,r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(`output/final-cut/pump-craft/source/final-cut-${name}-before.js`,'utf8')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready);
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const shot=async name=>{await tick(0);const s=await read();await p.screenshot({path:out+'/'+name+'.png'});views.push({name,render:[s.graphics.width,s.graphics.height],graphics:s.graphics,player:s.player,pump:s.pump,water:s.water});};
 const fixture=async v=>p.evaluate(async v=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({openingSeen:true});r.mode='playing';r.rig.phase='waiting';Object.assign(r.player,{x:v.x,y:v.y,yaw:Math.atan2((v.tx??8)-v.x,(v.ty??39)-v.y),pitch:v.pitch??.17});__finalCut.run=r;await advanceTime(0);},v);
 for(const v of [{name:'front',x:8,y:37.35},{name:'front-wide',x:8,y:36.5,pitch:.3},{name:'quarter',x:9.25,y:37.8,pitch:.24},{name:'rear',x:8.6,y:40.3,pitch:.28},{name:'shelter',x:13,y:37.8,tx:8.5,ty:39,pitch:.08},{name:'outlet',x:10,y:37.3,tx:9.5,ty:39,pitch:.7},{name:'flange',x:18,y:42,tx:17,ty:43,pitch:.6}]){await fixture(v);await shot(v.name);}
 await fixture({x:8,y:37.35});assert.equal((await read()).action?.id,'pump');
 await p.keyboard.press('Enter');await tick(17);assert.equal((await read()).pump,false);
 await p.keyboard.press('e');await tick(17);assert.equal((await read()).pump,true);await shot('opened');
 const samples=[];for(const [name,ms]of [['filling',2800],['charged',3400]]){await tick(ms);await shot(name);samples.push((await read()).graphics.pumpHardware);}
 let s=await read();assert.equal(s.water,1);assert.equal(s.checkpoint,1);assert.equal(s.won,false);assert.equal(s.graphics.irrigation.streams,36);
 if(!before){assert(samples[0].fill>0&&samples[0].fill<1);assert.equal(samples[1].fill,1);assert(samples[1].needle<samples[0].needle);assert.equal(samples[1].flanges,6);}
 await p.keyboard.press('Escape');await tick(0);const frozen=await p.screenshot(),paused=await read();await tick(1200);assert((await p.screenshot()).equals(frozen));assert.deepEqual((await read()).graphics.pumpHardware,paused.graphics.pumpHardware);
 await p.reload();await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready);await tick(0);await p.click('#primary');await tick(0);s=await read();assert(s.pump&&s.water===1);if(!before)assert.equal(s.graphics.pumpHardware.needle,-2.3);await shot('restored');
 for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await fixture({x:8,y:37.35});await shot('front-'+width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 // Traverse all directions before measuring allocations; off-screen materials
 // may only upload when first presented.
 for(let j=0;j<2;j++)for(let i=0;i<8;i++)await p.evaluate(async i=>{__finalCut.run.player.yaw=i*Math.PI/4;await advanceTime(0);},i);
 const memory=(await read()).graphics;for(let i=0;i<20;i++)await tick(33);s=await read();assert.equal(s.graphics.geometries,memory.geometries);assert.equal(s.graphics.textures,memory.textures);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,samples,resources:{geometries:memory.geometries,textures:memory.textures},checks:['Enter does not use; E opens bypass','six-second fill drives instrument; preparation does not win','pause pixels exact; real reload restores charge','five viewport sizes; stable animated allocations'],errors},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,resources:{geometries:memory.geometries,textures:memory.textures},errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
