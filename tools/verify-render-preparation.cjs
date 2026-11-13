const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
  const out='output/joe-finish/preparation';fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  const results=[];
  try{for(const fallback of [false,true]){
    const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const source=fs.readFileSync('web/game.js','utf8');
    await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__prep={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
    if(fallback)await page.route('**/joe-pixel-rig.glb*',r=>r.abort());
    await page.goto('http://127.0.0.1:4187/');await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>window.__prep&&JSON.parse(render_game_to_text()).assets.course.ready);
    await page.evaluate(()=>{
      const {state:s,resetFirstHole,render}=__prep;resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;
      Object.assign(s.player,{x:0,y:45,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:0,y:69,effectHeading:-Math.PI/2,effectSpeed:4,walkMeters:0,mode:'patrol'});render();
      window.__prepFrames=[];let last;function frame(now){const preparing=RCScene3D.stats().preparing,t=performance.now();render();__prepFrames.push({preparing,dt:last===undefined?0:now-last,submit:performance.now()-t});last=now;if(!window.__stopPrepFrames)requestAnimationFrame(frame);}requestAnimationFrame(frame);
    });
    const held=await page.evaluate(()=>{const s=__prep.state,t=s.time,y=s.player.y;s.keys.add('w');advanceTime(1000);s.keys.clear();return {preparing:RCScene3D.stats().preparing,dt:s.time-t,dy:s.player.y-y};});
    assert(held.preparing);assert.equal(held.dt,0);assert.equal(held.dy,0);

    await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__prep.state.mode),'paused');
    await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__prep.state.mode),'first_hole');
    await page.waitForFunction(()=>RCScene3D.stats().ready&&(RCScene3D.stats().joeModel?.ready||RCScene3D.stats().joeModel?.error),null,{timeout:60000});
    await page.waitForTimeout(700);
    const cold=await page.evaluate(()=>{window.__stopPrepFrames=true;return {frames:__prepFrames,stats:RCScene3D.stats()};});
    assert.equal(cold.stats.error,null);assert.equal(!!cold.stats.joeModel.ready,!fallback);
    const active=cold.frames.filter(f=>!f.preparing);assert(active.length>5);
    assert(Math.max(...active.map(f=>f.submit))<100,'Active render regressed to a blocking first-use submission');
    await page.screenshot({path:out+`/ready-${fallback}.png`});
    // Dispose a scene while its asynchronous preparation is still pending.
    await page.evaluate(()=>{RCScene3D.reset();__prep.render();RCScene3D.reset();__prep.render();});
    await page.waitForFunction(()=>RCScene3D.stats().ready&&(RCScene3D.stats().joeModel?.ready||RCScene3D.stats().joeModel?.error),null,{timeout:60000});
    await page.evaluate(()=>__prep.render());assert.equal(await page.locator('#course-loading').isVisible(),false);
    assert.deepEqual(errors,[]);
    results.push({fallback,held,firstActiveSubmitMs:active[0].submit,maxActiveSubmitMs:Math.max(...active.map(f=>f.submit)),maxPreparationFrameMs:Math.max(...cold.frames.filter(f=>f.preparing).map(f=>f.dt)),prepareMs:cold.stats.prepareMs,warmupSubmitMs:cold.stats.warmupSubmitMs,errors});
    await page.close();
  }}finally{await browser.close();}
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks:['Simulation held until prepared','Pause/resume during preparation','First active render','Failed model uses directional fallback','Scene replacement cancels stale preparation'],results},null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});

