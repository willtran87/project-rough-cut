const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass25-districts/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/under-green-water-contacts.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-water-contacts.js','utf8').replace('stats:()=>({capacity,','stats:()=>({events:events.map(e=>({...e})),capacity,')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));await p.screenshot({path:`${out}/${name}.png`});views.push({name,state});return state;}
  for(let index=0;index<6;index++){
   const name=await p.evaluate(async index=>{
    const {createRun}=await import('./under-green-sim.js'),{DRAIN_PUDDLES}=await import('./under-green-wet-ground.js'),{solid,lineClear}=await import('./under-green-course.js');
    const pool=DRAIN_PUDDLES[index],centre=pool.points.reduce((p,v)=>({x:p.x+v[0]/pool.points.length,y:p.y+v[1]/pool.points.length}),{x:0,y:0});
    const r=createRun();r.mode='playing';Object.assign(r.player,{x:centre.x-.14,y:centre.y-.05,yaw:0,walk:.7});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);__underGreen.setInput(['KeyW']);
    for(let i=0;i<10;i++){advanceTime(1000/60);if(JSON.parse(render_game_to_text()).graphics.water.contacts.totals.player>0)break;}
    __underGreen.clearInput();const hit=JSON.parse(render_game_to_text()).graphics.water.contacts.last;if(hit?.kind!=='player')throw Error('No real footstep in '+pool.id);
    const camera=[[1,-1.5],[-1,-1.5],[1,1.5],[-1,1.5],[0,-1.5],[0,1.5]].map(([dx,dy])=>({x:hit.x+dx,y:hit.y+dy})).find(c=>!solid(c,.35)&&lineClear(c,hit,.05));if(!camera)throw Error('No valid inspection camera '+pool.id);
    Object.assign(r.player,camera,{yaw:Math.atan2(hit.x-camera.x,hit.y-camera.y),pitch:-.7});r.time+=.06;advanceTime(0);await __underGreen.whenPresented();return pool.id;
   },index);
   const state=await shot(name);assert.equal(state.graphics.water.contacts.last.height,.012);assert(state.graphics.water.activeRipples>0);assert(state.graphics.water.activeContactDrops>0);
   if(index===0){for(const [name,steps]of [['gallery-fade',3],['gallery-expired',3]]){await p.evaluate(async steps=>{for(let i=0;i<steps;i++){__underGreen.run.time+=.2;advanceTime(0);}await __underGreen.whenPresented();},steps);const aged=await shot(name);if(name.endsWith('expired'))assert.equal(aged.graphics.water.contacts.events.filter(e=>e.kind==='player').length,0);}}
  }
  for(let index=0;index<3;index++){
   await p.evaluate(async index=>{
    const {createRun}=await import('./under-green-sim.js'),{DRAIN_DRIPS,drainDripSample,waterContactHeight}=await import('./under-green-water-contacts.js'),{WATERS,waterState}=await import('./under-green-course.js');
    const drip=DRAIN_DRIPS[index],r=createRun();r.mode='playing';r.time=drip.period*5-drip.offset;r.elapsed=49;Object.assign(r.player,{x:drip.x+1,y:drip.y-1.4,yaw:Math.atan2(-1,1.4),pitch:-.7});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
    const states=WATERS.map(w=>waterState(w,r.time,r.bypass,r.bypassAt)),height=waterContactHeight(drip,WATERS,states,.38),fall=drainDripSample(drip,r.time,height).fall;
    // Small chronological steps preserve real arrival detection and the pool.
    for(let t=0;t<fall+.05;t+=1/60){r.time+=1/60;advanceTime(0);}await __underGreen.whenPresented();
   },index);
   const state=await shot('drip-'+index);const source=state.graphics.water.dripSources[index];assert(state.graphics.water.contacts.events.some(e=>e.kind==='drip'&&Math.hypot(e.x-source.x,e.y-source.y)<1e-8));assert(state.graphics.water.activeRipples>0);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
