const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const baseline=process.argv.includes('--baseline'),out='output/under-green/service-supports/'+(baseline?'before':'after');fs.mkdirSync(out,{recursive:true});
 if(baseline&&fs.existsSync(out+'/browser.json'))throw Error('Preserve the retained pre-change views; run without --baseline for current verification.');
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],errors=[];
 try{
  for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
   const c=await b.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<500}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   for(const [name,x,y,yaw,pitch]of [['wide-gallery',0,5,0,.45],['junction',0,37,0,.45],['bunker-lamp',-20,67,-.7,.4],['pump-lamp',-17,43,1,.4]]){
    await p.evaluate(async({x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(2);r.mode='playing';r.messageTime=0;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},{x,y,yaw,pitch});
    if(width<900){await p.touchscreen.tap(width/2,height/2);await p.evaluate(()=>advanceTime(0));}
    await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));
    const file=`${out}/${name}-${width}.png`;await p.screenshot({path:file});views.push({name,width,height,file,graphics:state.graphics});
   }
   if(!baseline){
    const audit=await p.evaluate(async()=>{const {floorLayout,solid,BOUNDS}=await import('./under-green-course.js');const {lampMount}=await import('./under-green-services.js');const g=JSON.parse(render_game_to_text()).graphics,points=[];
     for(let y=BOUNDS.minY+1;y<BOUNDS.maxY;y+=2)for(let x=BOUNDS.minX+.5;x<BOUNDS.maxX;x+=1)if(!solid({x,y},.3))points.push({x,y});
     return {supports:g.serviceSupports,points:points.length,hits:__underGreen.inspectClearance(points),mounts:g.serviceSupports.lamps.map(l=>lampMount(l,floorLayout()))};
    });
    assert.deepEqual(audit.hits,[]);assert(audit.supports.arches===9&&audit.supports.spine===16);assert(audit.supports.lamps.length===13);assert.equal(audit.supports.signs.length,8);
    assert.equal(audit.supports.lamps.filter(l=>l.mount.kind==='spine').length,3);assert.equal(audit.supports.lamps.filter(l=>l.mount.kind==='cross-feed').length,2);
    assert(audit.mounts.some(m=>m.kind==='wall')&&audit.mounts.some(m=>m.kind==='ceiling'));
    views.push({name:'clearance',width,height,audit});
   }
   await c.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,baseline,views,errors},null,2));console.log(JSON.stringify({passed:true,baseline,views:views.length,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
