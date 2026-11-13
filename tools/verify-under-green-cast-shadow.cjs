const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass27-shadow/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],errors=[];
 try{for(const before of [true,false]){
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before)await p.route('**/under-green-cast-shadow-scene.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-cast-shadow-scene.js','utf8').replace('enabled=true','enabled=false')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function prepare(bay='entrance',phase='walk'){
   await p.evaluate(async({bay,phase})=>{
    const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');
    const r=createRun();r.mode='playing';r.time=20;r.elapsed=0;r.messageTime=0;r.view={fov:58,aspect:innerWidth/innerHeight};
    const fixtures={entrance:{j:{x:0,y:8},p:{x:0,y:4,yaw:0}},'spillway-landing':{j:{x:0,y:56.8},p:{x:0,y:53.5,yaw:0}},'bunker-bank':{j:{x:-21.1,y:53.6},p:{x:-20.5,y:50.8,yaw:Math.atan2(-.6,2.8)}}};
    const f=fixtures[bay];Object.assign(r.player,f.p,{pitch:-.32,grace:100});Object.assign(r.joe,f.j,{yaw:Math.PI,phase,age:phase==='windup'?.7:phase==='sweep'?.11:0,speed:phase==='walk'?1:0,walk:.4,paceScale:1});settleWeapon(r,1/60);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
    for(let i=0;i<6;i++){r.time+=.05;advanceTime(0);}await __underGreen.whenPresented();
   },{bay,phase});
  }
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>JSON.parse(render_game_to_text())),pose=state.graphics.joeCastShadow.visible?await p.evaluate(()=>__underGreen.inspectCastShadow()):null;if(pose)assert(pose.maxPoseError<1e-7);await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.png`});views.push({before,name,viewport:p.viewportSize(),state,pose});return state;}
  for(const bay of ['entrance','spillway-landing','bunker-bank']){await prepare(bay);const s=await shot(bay);assert.equal(s.graphics.joeCastShadow.visible,!before);}
  await prepare();await p.evaluate(()=>{__underGreen.run.time+=6;advanceTime(0);});await shot('entrance-bright');
  await prepare();await p.evaluate(()=>{const r=__underGreen.run;Object.assign(r.player,{x:12,y:14.6,yaw:Math.atan2(-12,-6.6),pitch:0});advanceTime(0);});const behind=await shot('behind-wall');assert.equal(behind.graphics.joeCastShadow.visible,false);
  if(!before){
   for(const phase of ['windup','sweep','recover']){await prepare('entrance',phase);await shot(phase);}
   for(const kind of ['unseen','fast','outside','absent']){
    await prepare();await p.evaluate(kind=>{const r=__underGreen.run;if(kind==='unseen')r.player.yaw=Math.PI;if(kind==='fast'){r.joe.speed=5;r.joe.paceScale=2;}if(kind==='outside')r.joe.y=20;if(kind==='absent')r.joe.phase='absent';advanceTime(0);},kind);
    const s=await shot(kind);assert.equal(s.graphics.joeCastShadow.visible,false);
   }
   await prepare();for(let i=0;i<5;i++){
    await p.evaluate(()=>{const r=__underGreen.run;r.time+=.1;r.joe.walk+=.15;r.joe.y-=.15;advanceTime(0);});await shot('walk-'+i);
   }
   await prepare();await p.evaluate(()=>{const r=__underGreen.run;r.elapsed=49;r.time=49;advanceTime(0);});await shot('flood');
   await prepare();await p.evaluate(()=>{__underGreen.run.player.yaw=Math.PI;advanceTime(0);});
   assert.equal((await shot('before-rear-glance')).graphics.joeCastShadow.visible,false);
   await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));
   const rear=await shot('rear-glance');assert(rear.player.rearAmount>.8);assert.equal(rear.graphics.joeCastShadow.visible,true);
   await p.keyboard.up('q');
   await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun();__underGreen.run.mode='playing';__underGreen.clearInput();advanceTime(0);});
   assert.equal((await shot('fresh-run')).graphics.joeCastShadow.visible,false);
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await prepare();await shot('responsive');}
   await p.setViewportSize({width:2560,height:1600});await prepare();await p.keyboard.press('Escape');const pause=await shot('paused');await p.evaluate(()=>advanceTime(2000));assert.deepEqual((await shot('pause-wait')).graphics.joeCastShadow,pause.graphics.joeCastShadow);
   await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await prepare();await shot('reduced');
  }
  await p.close();
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:!errors.length,views,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,views:views.length,out}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
