const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass28-fill/${software?'software':'hardware'}`;
const threatsOnly=process.argv.includes('--threats-only');
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],errors=[];
 try{for(const before of threatsOnly?[false]:[true,false]){
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before)await p.route('**/under-green-fill-light.js',route=>{const s=fs.readFileSync('web/under-green-fill-light.js','utf8');return route.fulfill({contentType:'application/javascript',body:s.replace('new THREE.Color(chroma[name])','new THREE.Color(legacy[name])')});});
  if(before)await p.route('**/under-green-tonal-grade.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-tonal-grade.js','utf8').replace('const strength=.42;','const strength=0;')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=[['gallery',0,12,0,.05],['roots',1.7,25,1.2,.1],['mud',3.8,11.3,1.25,-.45],['pump',-23.4,42,-1,.05],['keeper',12,19,Math.PI,.1],['bunker',-29.5,65,Math.PI,.15],['water',0,19,0,-.35],['joe',0,4,0,-.12]];
  async function place(f){await p.evaluate(async([name,x,y,yaw,pitch])=>{const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=0;r.messageTime=0;Object.assign(r.player,{x,y,yaw,pitch,grace:100});if(name==='joe'){Object.assign(r.joe,{x:0,y:8,yaw:Math.PI,phase:'walk',speed:1,walk:.4,paceScale:1});settleWeapon(r,1/60);}else r.joe.phase='absent';__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));for(const c of Object.values(state.graphics.fillLighting.palette))assert(Math.abs(c.luminance-c.referenceLuminance)<1e-12);views.push({before,name,viewport:p.viewportSize(),state});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.png`});}
  if(!threatsOnly)for(const f of fixtures){await place(f);await shot(f[0]);}
  if(!before){
   for(const phase of ['windup','sweep','recover']){await place(fixtures[7]);const posed=await p.evaluate(async phase=>{const {settleWeapon}=await import('./under-green-clearance.js');const r=__underGreen.run;Object.assign(r.joe,{phase,age:phase==='windup'?.7:phase==='sweep'?.11:0,speed:0});delete r.joe.weaponPose;settleWeapon(r,1/60);advanceTime(0);return r.joe.weaponPose;},phase);assert(Math.abs(posed.pitch)<1e-6,'Attack fixture must use the actual raised blade, not its cached carry pose');await shot('joe-'+phase);}
   for(const side of [-1,1]){await place(fixtures[7]);await p.evaluate(side=>{__underGreen.run.joe.x=side*1.8;advanceTime(0);},side);await shot('joe-flank-'+side);}
   await place(fixtures[7]);await p.evaluate(()=>{__underGreen.run.player.yaw=Math.PI;advanceTime(0);});await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('joe-rear-glance');await p.keyboard.up('q');
   if(!threatsOnly){
   for(const time of [6.1,20.3,49,54]){await place(fixtures[6]);await p.evaluate(time=>{__underGreen.run.time=time;__underGreen.run.elapsed=time;advanceTime(0);},time);await shot('water-time-'+time);}
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures[7]);await shot('joe-responsive');}
   await p.setViewportSize({width:2560,height:1600});await place(fixtures[7]);await p.keyboard.press('Escape');await shot('paused');await p.evaluate(()=>advanceTime(1000));await shot('pause-wait');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[0]);await shot('reduced');
   }
  }
  await p.close();
 }
 for(const a of views.filter(v=>v.before)){const b=views.find(v=>!v.before&&v.name===a.name);for(const key of ['draws','triangles','textures','programs'])assert.equal(b.state.graphics[key],a.state.graphics[key],key+' changed');assert.deepEqual(b.state.player,a.state.player);assert.deepEqual(b.state.joe,a.state.joe);assert.deepEqual(b.state.graphics.resolution,a.state.graphics.resolution);}
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:!errors.length,views,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,views:views.length,out}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
