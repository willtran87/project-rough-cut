const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const before=process.argv.includes('--before'),software=process.argv.includes('--software'),out=`output/final-cut/refuge-interiors/${before?'before':software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{const p=await b.newPage({viewport:{width:2560,height:1600}});p.setDefaultTimeout(120000);const errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(before)for(const name of ['scene','course'])await p.route(`**/final-cut-${name}.js`,r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(`output/final-cut/refuge-interiors/source/final-cut-${name}-before.js`,'utf8')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready);
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const fixtures=[{name:'pump-room',x:13.5,y:38.3,tx:10,ty:41,pitch:.10},{name:'bench',x:11.1,y:39.6,tx:11.1,ty:41.25,pitch:.15},{name:'hose',x:8,y:38,tx:6,ty:38,pitch:.13},{name:'damp',x:7,y:40,tx:6.4,ty:42,pitch:.45},{name:'bunker',x:-11.3,y:16.5,tx:-13.5,ty:17.9,pitch:.27},{name:'pavilion-room',x:-15,y:86,tx:-19,ty:88.5,pitch:-.02},{name:'starter',x:-18.1,y:88.5,tx:-20.25,ty:88.7,pitch:.33},{name:'pennants',x:-17.5,y:86,tx:-18,ty:89,pitch:-.35}];
 const fixture=async v=>{await p.evaluate(async v=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1,openingSeen:true});r.mode='playing';Object.assign(r.rig,{x:39,y:50,phase:'disabled'});Object.assign(r.player,{x:v.x,y:v.y,yaw:Math.atan2(v.tx-v.x,v.ty-v.y),pitch:v.pitch});__finalCut.run=r;await advanceTime(0);},v);};
 const shot=async name=>{await tick(0);const s=await read();await p.screenshot({path:`${out}/${name}.png`});views.push({name,player:s.player,graphics:s.graphics});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));};
 for(const v of fixtures){await fixture(v);await shot(v.name);}
 if(!before){assert.equal((await read()).graphics.refugeInteriors.furniture.length,5);
  // Actual input against the front of each reachable storage unit: it should
  // stop before visible furniture, then allow the player to back out.
  for(const id of ['bunker-grit-chest','pump-service-bench','pump-hose-rack','pavilion-starter-cabinet']){
   await p.evaluate(async id=>{const {REFUGE_FURNITURE}=await import('./final-cut-course.js');const f=REFUGE_FURNITURE.find(f=>f.id===id),east=['hose','starter'].includes(f.kind);Object.assign(__finalCut.run.player,{x:east?f.x+f.w/2+1:f.x,y:east?f.y:f.y-f.d/2-1,yaw:east?-Math.PI/2:0,pitch:.2});await advanceTime(0);},id);
   await p.keyboard.down('w');await tick(800);await p.keyboard.up('w');const stopped=(await read()).player;const f=(await read()).graphics.refugeInteriors.furniture.find(f=>f.id===id);assert(['hose','starter'].includes(f.kind)?stopped.x>=f.x+f.w/2+.299:stopped.y<=f.y-f.d/2-.299);await p.keyboard.down('s');await tick(350);await p.keyboard.up('s');const backed=(await read()).player;assert(Math.hypot(backed.x-stopped.x,backed.y-stopped.y)>.5);
  }
 }
 await fixture(fixtures[1]);await p.keyboard.press('Escape');await tick(0);const frozen=await p.screenshot();await tick(700);assert((await p.screenshot()).equals(frozen));await p.keyboard.press('Escape');await tick(0);
 for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});for(const v of [fixtures[0],fixtures[5]]){await fixture(v);await shot(v.name+'-'+width);}}
 for(let k=0;k<2;k++)for(const v of fixtures)await fixture(v);const memory=(await read()).graphics;for(const v of fixtures)await fixture(v);const after=(await read()).graphics;assert.equal(after.geometries,memory.geometries);assert.equal(after.textures,memory.textures);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,resources:{geometries:after.geometries,textures:after.textures},errors},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,resources:{geometries:after.geometries,textures:after.textures},errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
