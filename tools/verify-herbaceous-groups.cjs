const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{chromium}=require('playwright');
const out=process.argv[2],before=process.argv.includes('--before'),software=process.argv.includes('--software');if(!out)throw Error('Output directory required');
const views=[['nursery-fern',4,49,.2],['formal-approach',5,641,.15],['nursery-approach',-3,108,-.2],['nursery-side',-7,124,-.65],['nursery-end',-12,111,0],['range-side',-14,420,-.65],['range-end',-19,407,0],['clubhouse-side',5,665,-.65],['clubhouse-end',0,657,0],['border',36,61,.85]];
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__mistWorld={scene,camera,renderer,update,draw()')}));
 if(before)await p.route('**/back-nine-planting.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/back-nine-visual-upgrade/herbaceous-groups/baseline-source/back-nine-planting.js','utf8')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const capture=async name=>{await p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));samples.push({name,state});await p.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:93});console.log('captured',name);return state;};
 const stage=async(x,y,yaw)=>p.evaluate(async({x,y,yaw})=>{const{createRun}=await import('./back-nine-sim.js'),{blocked}=await import('./back-nine-course.js');if(blocked({x,y},.5))throw Error('Invalid viewpoint '+x+','+y);const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(0);},{x,y,yaw});
 for(const[name,x,y,yaw]of views){await stage(x,y,yaw);await capture(name+'-2560');}
 await stage(-7,124,-.65);
 await p.evaluate(async()=>{Object.assign(__backNine.run.joe,{x:-3,y:128,yaw:-Math.PI/2,speed:0});await advanceTime(0);});await capture('beacon-near');
 await p.evaluate(async()=>{__backNine.run.time=21;await advanceTime(0);});await capture('beacon-next');
 await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.stringify(__backNine.run));await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),frozen);await p.click('#primary');
 await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));});await capture('reduced');
 for(const[width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await stage(-7,124,-.65);await capture('hedge-'+width);}
 await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__backNine.run.checkpoint),0);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,before,software,samples,errors},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
