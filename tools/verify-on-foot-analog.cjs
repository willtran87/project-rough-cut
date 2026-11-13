// Actual chapter input polling; fixtures place the player on clear ground only.
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/on-foot-analog',baseline=process.argv.includes('--baseline');
const base='http://127.0.0.1:4187';
const close=(a,b,message)=>assert(Math.abs(a-b)<1e-5,`${message}: ${a} != ${b}`);
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 if(baseline)assert(!fs.existsSync(out+'/baseline.json'),'Keep the original baseline');
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const rows=[],errors=[],settings=[];
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.analogPad={id:'Analog QA',index:0,connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
   navigator.getGamepads=()=>[analogPad];
  });
  await page.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__analogSettings={state,SETTINGS_ROWS};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=ms=>page.evaluate(ms=>advanceTime(ms),ms);
  async function tap(index){
   await page.evaluate(i=>analogPad.buttons[i]={pressed:true,value:1},index);await tick(17);
   await page.evaluate(i=>analogPad.buttons[i]={pressed:false,value:0},index);await tick(17);
  }
  async function selectDeadzone(value){
   await page.goto(base+'/index.html');await page.waitForFunction(()=>window.__analogSettings&&window.render_game_to_text);
   await tick(17);await tap(0);await tap(0);await tap(13);await tap(0);
   assert.equal(await page.evaluate(()=>__analogSettings.state.mode),'settings');
   for(let n=0;n<60;n++){
    if(await page.evaluate(()=>__analogSettings.SETTINGS_ROWS[__analogSettings.state.settingsIndex].id==='stick_deadzone'))break;
    await tap(13);
   }
   assert.equal(await page.evaluate(()=>__analogSettings.SETTINGS_ROWS[__analogSettings.state.settingsIndex].id),'stick_deadzone');
   if(value!==.22)for(let n=0;n<8;n++)await tap(value===.1?14:15);
   close(await page.evaluate(()=>__analogSettings.state.stickDeadzone),value,'Level 1 settings');
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')||'{}').stickDeadzone??.22);
   close(saved,value,'Saved setting');settings.push({value,saved});
  }
  async function visit(chapter){
   await page.goto(`${base}/${chapter}.html?test`);
   await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   await tick(0);await page.locator('#primary').click();await tick(17);
  }
  async function reset(chapter){
   await page.evaluate(async chapter=>{
    analogPad.axes=[0,0,0,0];analogPad.buttons.forEach(b=>{b.pressed=false;b.value=0;});
    const {createRun}=await import(`./${chapter}-sim.js`),r=createRun();r.mode='playing';
    if(chapter==='final-cut'){Object.assign(r.player,{x:16,y:8,yaw:0});__finalCut.run=r;}
    else{__underGreen.clearInput();__underGreen.run=r;}
   },chapter);await tick(17);
  }
  const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  for(const deadzone of [.22,.1,.3]){
   await selectDeadzone(deadzone);
   for(const chapter of ['under-green','final-cut']){
    await visit(chapter);
    // A reload is part of the preference contract, not just an in-memory test.
    await page.reload();await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await page.locator('#primary').click();await tick(17);
    const diagonal=(deadzone+.06)/Math.SQRT2;
    const cases=[['neutral',0,0],['below',0,deadzone-.02],['edge',0,deadzone],['above',0,deadzone+.06],['diagonal',diagonal,diagonal],['half',.5,0],['full',0,1],['full-diagonal',1,1],['reverse',-.5,-.5]];
    for(const [name,x,y]of cases){
     await reset(chapter);await page.keyboard.press('z');const start=(await read()).player;
     await page.evaluate(({x,y})=>analogPad.axes=[x,-y,0,0],{x,y});await tick(500);const end=await read();
     const magnitude=Math.hypot(x,y),gain=Math.max(0,Math.min(1,(magnitude-deadzone)/(1-deadzone))),expected=3.84*.5*gain;
     const travelled=Math.hypot(end.player.x-start.x,end.player.y-start.y);
     rows.push({chapter,deadzone,name,x,y,expected,travelled,device:end.inputMethod});
     if(!baseline){close(travelled,expected,`${chapter} ${deadzone} ${name}`);if(expected>0)assert.equal(end.inputMethod,'gamepad');}
     await page.evaluate(()=>analogPad.axes=[0,0,0,0]);await tick(100);const stopped=(await read()).player;
     if(!baseline){close(stopped.x,end.player.x,'stop x');close(stopped.y,end.player.y,'stop y');}
    }
    // Look must honor the saved threshold, with no movement introduced.
    await reset(chapter);const start=(await read()).player;
    await page.evaluate(d=>analogPad.axes=[0,0,d-.02,d-.02],deadzone);await tick(100);const quiet=(await read()).player;
    rows.push({chapter,deadzone,name:'look-below',yaw:quiet.yaw-start.yaw,pitch:quiet.pitch-start.pitch});
    if(!baseline){close(quiet.yaw,start.yaw,'look deadzone yaw');close(quiet.pitch,start.pitch,'look deadzone pitch');}
    await page.evaluate(d=>analogPad.axes=[0,0,d+.08,-(d+.08)],deadzone);await tick(100);const looking=(await read()).player;
    rows.push({chapter,deadzone,name:'look-above',yaw:looking.yaw-quiet.yaw,pitch:looking.pitch-quiet.pitch});
    if(!baseline){
     const response=Math.pow(.08/(1-deadzone),1.35);
     close(looking.yaw-quiet.yaw,response*2.2*.1,'shared look yaw');
     close((looking.pitch-quiet.pitch)*(chapter==='final-cut'?-1:1),response*1.6*.1,'shared visible look pitch');
    }
    if(deadzone===.3){await reset(chapter);await page.evaluate(()=>analogPad.axes=[.24,-.24,0,0]);await tick(500);await page.screenshot({path:`${out}/${chapter}-${baseline?'baseline':'verified'}-2560.png`});}
   }
  }
  assert.deepEqual(errors,[]);
  const mismatches=rows.filter(r=>r.expected!==undefined&&Math.abs(r.travelled-r.expected)>1e-5);
  if(baseline)assert(mismatches.some(r=>r.chapter==='final-cut'));
  fs.writeFileSync(`${out}/${baseline?'baseline':'verified'}.json`,JSON.stringify({baseline,settings,rows,mismatches,errors},null,2));
  console.log(JSON.stringify({baseline,cases:rows.length,movementMismatches:mismatches.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
