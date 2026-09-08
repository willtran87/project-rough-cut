/* Walk into the shed from multiple lanes, then file using actual input.
 * Test-only injection seeds prerequisites and keeps Joe away to isolate access.
 * node tools/verify-shed-clearance.cjs [--probe] [--url URL]
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
  const probe=process.argv.includes('--probe');
  const urlIndex=process.argv.indexOf('--url');
  const url=urlIndex>=0?process.argv[urlIndex+1]:'http://127.0.0.1:4187';
  const out=path.resolve(`output/shed-clearance/${urlIndex>=0?'published':probe?'before':'after'}`);fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const source=urlIndex>=0?await (await fetch(new URL('game.js',url))).text():fs.readFileSync(path.resolve('web/game.js'),'utf8');
  await page.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',
    '  window.__shedTest = {state, resetFirstHole, NIGHT_ORDER_ACTIONS, SHED_EXIT, SHED_APPROACH_ROUTE, obstacleAtPosition, shedApproachReadabilityState};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=n=>page.evaluate(n=>window.advanceTime(n*1000/60),n);
  const press=async(key,n=1)=>{await page.keyboard.down(key);await tick(n);await page.keyboard.up(key);await tick(1);};
  const read=()=>page.evaluate(()=>{const s=JSON.parse(window.render_game_to_text());return {mode:s.mode,player:s.player,prompt:s.hole.interactionPromptOwner,filing:s.hole.escapeFiling,guide:s.hole.navigationReadability.firstPersonGuidance};});
  const reset=async(x,variant=0,key=true,checks=true,y=680)=>{
    await page.evaluate(({x,variant,key,checks,y})=>{const t=window.__shedTest;t.resetFirstHole();t.state.mode='first_hole';t.state.manualTime=true;t.state.transitionAlpha=0;
      const h=t.state.hole;h.variantIndex=variant;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;
      h.keyCollected=key;h.nightOrderActionsCompleted=checks?t.NIGHT_ORDER_ACTIONS.map(a=>a.id):[];
      h.joe.x=100;h.joe.y=80;h.joe.patrolPause=100;
      t.state.player.x=x;t.state.player.y=y;
    },{x,variant,key,checks,y});await tick(1);
  };
  try{
    await page.goto(url);await page.waitForFunction(()=>typeof window.advanceTime==='function');
    await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>{const s=JSON.parse(window.render_game_to_text());return s.assets.course.loaded===42&&s.assets.results.loaded===4;},null,{timeout:60000});await tick(180);
    for(const variant of (probe?[0]:[0,1,2]))for(const x of [-36,-27,-18,-9,0]){
      await reset(x,variant);
      if(x===-18&&variant===0)await page.screenshot({path:path.join(out,'approach.png')});
      await press('ArrowUp',130);
      const reached=await read();
      if(x===-18&&variant===0)await page.screenshot({path:path.join(out,'door-ready.png')});
      await press('Enter');const filing=await read();await tick(150);const finished=await read();
      results.push({variant,x,reached:reached.player,prompt:reached.prompt,filing:filing.filing.active,mode:finished.mode});
      if(!probe){assert.equal(reached.prompt?.targetId,'maintenance-shed');assert.equal(reached.guide.direction,'FILE RELEASE');assert.equal(filing.filing.active,true);assert.equal(finished.mode,'victory');}
    }
    if(!probe){
      // Cross the former gate location using ordinary forward input over a
      // broad band, instead of only spawning beyond it or following its center.
      for(const variant of [0,1,2])for(const x of [-24,-18,-12,-6,0,6]){
        await reset(x,variant,true,true,650);
        if(x===0&&variant===0)await page.screenshot({path:path.join(out,'open-approach.png')});
        await press('ArrowUp',200);
        const reached=await read();assert.equal(reached.prompt?.targetId,'maintenance-shed',`Open lane ${x} must reach the shed`);
        await press('Enter');await tick(150);assert.equal((await read()).mode,'victory');
        results.push({variant,x,approachStart:{x,y:650},mode:'victory'});
      }
      // The full final approach must be navigable, not only a seeded doorstep.
      for(const x of [-92,24,92]){
        await reset(x,0,true,true,632);
        assert.equal(await page.evaluate(()=>Boolean(window.__shedTest.obstacleAtPosition(window.__shedTest.state.player.x,632))),false);
        let reached=false;
        for(let i=0;i<250;i++){
          const s=await read();if(s.prompt?.targetId==='maintenance-shed'){reached=true;break;}
          const p=s.guide.nextWaypoint;assert.ok(p,'Route must provide a reachable waypoint');
          const keys=[];const dx=p.x-s.player.x,dy=p.y-s.player.progress;
          if(Math.abs(dx)>1)keys.push(dx>0?'ArrowRight':'ArrowLeft');if(Math.abs(dy)>1)keys.push(dy>0?'ArrowUp':'ArrowDown');
          for(const key of keys)await page.keyboard.down(key);await tick(4);for(const key of keys)await page.keyboard.up(key);
        }
        assert.ok(reached,`Approach from ${x},632 must reach Use`);await press('Enter');await tick(150);assert.equal((await read()).mode,'victory');
        results.push({approachStart:{x,y:632},mode:'victory'});
      }
      for(const [key,checks] of [[false,true],[true,false]]){
        await reset(-18,0,key,checks);await press('ArrowUp',130);await press('Enter');assert.equal((await read()).filing.active,false);
      }
      await reset(-18);await press('ArrowUp',130);await press('Enter');await press('ArrowDown');assert.equal((await read()).filing.active,false);
      await press('Enter');await tick(150);assert.equal((await read()).mode,'victory');
      const geometry=await page.evaluate(()=>window.__shedTest.shedApproachReadabilityState());assert.equal(geometry.clear,true);assert.equal(geometry.interactionReachable,true);
      fs.writeFileSync(path.join(out,'geometry.json'),JSON.stringify(geometry,null,2));
      await reset(-18);await press('ArrowUp',36);
      for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]){await page.setViewportSize({width,height});await tick(1);await page.screenshot({path:path.join(out,`forecourt-${width}.png`)});}
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({probe,results,errors},null,2));
    console.log(JSON.stringify({probe,results:results.map(r=>({variant:r.variant,x:r.x,y:r.reached?.progress,filing:r.filing,mode:r.mode,approachStart:r.approachStart})),errors},null,2));
  }catch(error){
    await page.screenshot({path:path.join(out,'failure.png')});
    fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:error.message,state:await read(),results},null,2));
    throw error;
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
