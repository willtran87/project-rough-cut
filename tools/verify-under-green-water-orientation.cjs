const fs=require('node:fs'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade-local/pass44-views/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[],motion=[];try{
 for(const before of [true,false]){
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before)for(const f of ['under-green-water','under-green-wet-ground-scene'])await p.route('**/'+f+'.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`output/under-green/visual-upgrade-local/pass44-source/${f}-before.js`,'utf8')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=await p.evaluate(async()=>{
   const {WATERS,waterState,waterPoint,solid}=await import('./under-green-course.js'),{DRAIN_PUDDLES}=await import('./under-green-wet-ground.js'),fixtures=[];
   for(const w of WATERS)for(const phase of ['low','surge']){
    let found;for(const bypass of [false,true]){for(let t=15;t<60;t+=.05)if(waterState(w,t,bypass,0).phase===phase){found={time:t,bypass};break;}if(found)break;}if(!found)throw Error('No state '+w.id+' '+phase);
    const sign=w.forward||1,pos=waterPoint(w,0,-sign*(w.depth/2+1.4));if(solid(pos,.3))throw Error('Invalid channel camera '+w.id);fixtures.push({name:w.id+'-'+phase,...pos,yaw:(w.axis==='x'?Math.PI/2:0)+(sign<0?Math.PI:0),pitch:-.48,...found});
   }
   for(const pool of DRAIN_PUDDLES){const x=pool.points.reduce((v,p)=>v+p[0],0)/pool.points.length,y=pool.points.reduce((v,p)=>v+p[1],0)/pool.points.length;let view;
    for(const yaw of [0,Math.PI,Math.PI/2,-Math.PI/2]){const p={x:x-Math.sin(yaw)*1.9,y:y-Math.cos(yaw)*1.9};if(!solid(p,.3)){view={...p,yaw};break;}}if(!view)throw Error('No pool camera '+pool.id);fixtures.push({name:pool.id,...view,pitch:-.71,time:26.3,bypass:false});
   }
   return fixtures;
  });
  async function place(f){await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=f.time;r.elapsed=f.elapsed||0;r.bypass=f.bypass;r.bypassAt=0;r.joe.phase='absent';Object.assign(r.player,{x:f.x,y:f.y,yaw:f.yaw,pitch:f.pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
  async function shot(name){const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),state});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
  for(const f of fixtures){await place(f);await shot(f.name);}
  if(!before){
   for(const name of ['lesson-surge','bypass-surge','gallery-leak']){
    const f=fixtures.find(f=>f.name===name);await place(f);const original=await p.screenshot({type:'png'});
    for(let i=0;i<=24;i++){const offset=Math.sin(i/24*Math.PI*2)*.32;await p.evaluate(async({yaw})=>{__underGreen.run.player.yaw=yaw;advanceTime(0);await __underGreen.whenPresented();},{yaw:f.yaw+offset});const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));motion.push({name,step:i,yaw:s.player.yaw,waterClock:s.graphics.water.animationTime,puddleClock:s.graphics.wetGround.animationTime});if([6,12,18].includes(i))await shot(name+'-turn-'+i);}
    await place(f);assert(original.equals(await p.screenshot({type:'png'})),'Camera return altered fixed water scene '+name);
   }
   const f=fixtures.find(f=>f.name==='gallery-leak');for(const elapsed of [41,49,60,70]){await place({...f,elapsed,time:elapsed});await shot('flood-'+elapsed);const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(s.graphics.flood.wallFilm.waterline,s.flood.depth);}
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const name of ['bypass-surge','gallery-leak']){await place(fixtures.find(f=>f.name===name));await shot(name);}}
   await p.setViewportSize({width:2560,height:1600});await place(f);await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()));await p.evaluate(()=>advanceTime(500));const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(s.seconds,frozen.seconds);assert.equal(s.graphics.water.animationTime,frozen.graphics.water.animationTime);assert.equal(s.graphics.wetGround.animationTime,frozen.graphics.wetGround.animationTime);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(f);await shot('reduced');assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics.water.animationTime,0);
  }
  await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,motion,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,motion:motion.length}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
