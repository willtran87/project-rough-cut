const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/pass35-selected/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[];
try{for(const before of [true,false]){
 const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(before)for(const name of ['under-green-organic-geometry','under-green-ground-finish'])await p.route('**/'+name+'.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass35-source/'+name+'-before.js','utf8')}));
 await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');await p.addStyleTag({content:'#district {visibility:hidden}'});
 const fixtures=[['gallery',-1.6,12,-.6,-.5],['gallery-close',-2.15,15.2,-1.1,-.8],['gallery-return',-1.6,23,-2.5,-.4],['bunker',-30.5,62,-1.1,-.5],['pump',-25.4,36,-.9,-.5],['range',22.1,27,1,-.5],['keeper',8.3,14,-1.6,-.5]];
 async function place(f){await p.evaluate(async([name,x,y,yaw,pitch])=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=0;r.messageTime=0;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
 async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:s.graphics});await p.screenshot({path:out+'/'+(before?'before':'after')+'-'+name+'-'+p.viewportSize().width+'.png'});}
 for(const f of fixtures){await place(f);await shot(f[0]);}
 if(!before){for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures[0]);await shot('gallery');}
 await p.setViewportSize({width:2560,height:1600});await place(fixtures[0]);await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');await p.evaluate(()=>advanceTime(300));await p.keyboard.press('Escape');await shot('paused');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[0]);await shot('reduced');}
 await p.close();}
 assert.deepEqual(errors,[]);for(const a of rows.filter(r=>r.before)){const b=rows.find(r=>!r.before&&r.name===a.name);assert.deepEqual(a.player,b.player);assert.deepEqual(a.graphics.resolution,b.graphics.resolution);}
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
