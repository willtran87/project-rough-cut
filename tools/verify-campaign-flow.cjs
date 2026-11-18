const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=(process.env.GAME_URL||'http://127.0.0.1:4187').replace(/\/$/,'');
const out=process.env.FLOW_EVIDENCE||'output/campaign-flow';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600},hasTouch:true}),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__flow={state,render,enterMenu,completeHole,resetFirstHole,resultActionPresentations,activateResultAction,shedEscapeTableauArt,drainEscapeTableauArt};\n  window.advanceTime = (milliseconds) => {')}));
 const open=async()=>{await page.goto(base+'/index.html');await page.waitForFunction(()=>window.__flow,null,{timeout:120000});await page.evaluate(()=>{__flow.state.manualTime=true;__flow.enterMenu();__flow.render();});await page.evaluate(()=>Promise.all([...document.querySelectorAll('#course-menu img')].map(img=>img.decode())));};
 await open();
 for(const id of ['back-nine','under-green','final-cut'])assert(await page.locator(`[data-chapter="${id}"]`).isDisabled());
 for(const key of ['ArrowRight','ArrowLeft']){await page.keyboard.press(key);assert.equal(await page.evaluate(()=>RCChapterSelect.selected().id),'night-order');}
 await page.evaluate(()=>{RCChapterSelect.select('final-cut');__flow.render();});assert.equal(await page.evaluate(()=>RCChapterSelect.selected().id),'night-order');
 for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){await page.setViewportSize({width,height});await page.screenshot({path:`${out}/locked-${width}.png`});}
 checks.push('Fresh menu locks all later chapters; keyboard and API selection cannot bypass locks');
 await page.goto(base+'/final-cut.html?from=garage');await page.waitForURL('**/index.html');checks.push('Unearned direct finale link returns to the start');
 await open();await page.evaluate(()=>{__flow.resetFirstHole();__flow.completeHole('shed');__flow.render();});
 assert.deepEqual(await page.evaluate(()=>__flow.resultActionPresentations('victory').map(a=>a.id)),['rematch','clubhouse']);
 await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>__flow.state.resultIndex),1);await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>__flow.state.resultIndex),0);
 await page.evaluate(async()=>{await __flow.shedEscapeTableauArt.decode();__flow.render();});await page.screenshot({path:out+'/night-order-win.png'});
 await page.evaluate(()=>{__flow.enterMenu();__flow.render();});assert(await page.locator('[data-chapter="back-nine"]').isDisabled());assert.equal(await page.locator('.course-menu-start strong').textContent(),'Continue story');
 await page.locator('.course-menu-start').click();await page.waitForURL('**/back-nine.html?from=shed');
 await page.waitForFunction(()=>window.render_game_to_text,null,{timeout:120000});
 assert(await page.evaluate(()=>RCProgression.available('back-nine')));assert(!(await page.evaluate(()=>RCProgression.available('under-green'))));
 checks.push('Level 1 win has two actions; continuation enters and unlocks only the shed route');
 // Exercise real chapter UI with test-only fixture placement, preserving production handlers.
 await page.goto(base+'/back-nine.html?test');await page.waitForFunction(()=>window.__backNine,null,{timeout:120000});
 await page.evaluate(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
 // Skip the illustrated story using its actual UI, then wait for renderer readiness.
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await page.evaluate(()=>{const r=__backNine.run;r.mode='complete';r.saveSerial=(r.saveSerial||0)+1;__backNine.run=r;RCProgression.complete('back-nine');__backNine.render();});
 assert(await page.locator('#primary').isHidden());assert(await page.locator('#replay-story').isHidden());assert(await page.locator('#continue-final-cut').isVisible());
 await page.screenshot({path:out+'/back-nine-win.png'});
 await page.evaluate(()=>{const r=__backNine.run;r.mode='caught';__backNine.run=r;__backNine.render();});assert(await page.locator('#primary').isVisible());await page.locator('#primary').click();assert.equal(await page.evaluate(()=>__backNine.run.mode),'driving');
 checks.push('Back Nine win exposes continuation without replay; loss retry still starts driving');
 await open();assert(await page.locator('[data-chapter="back-nine"]').isEnabled());assert(await page.locator('[data-chapter="final-cut"]').isDisabled());
 await page.locator('.course-menu-start').click();await page.waitForURL('**/final-cut.html?from=garage');await page.waitForFunction(()=>window.render_game_to_text,null,{timeout:180000});
 assert(await page.evaluate(()=>RCProgression.available('final-cut')));checks.push('Finale unlocks only on continuation from completed Chapter 02');
 await open();await page.locator('[data-chapter="back-nine"]').click();
 // With the finale already unlocked, Start launches the selected chapter; the separate replay command is only for a locked continuation.
 assert(await page.locator('[data-clubhouse-command="replay"]').isHidden());{const label=await page.locator('.course-menu-start').innerText();assert(label.includes('Replay chapter')&&label.includes('The Back Nine'),label);}
 await page.locator('.course-menu-start').click();await page.waitForURL('**/back-nine.html?replay=1');checks.push('Start launches the selected chapter once its continuation is unlocked; earned replay is available only from the main menu');
 await open();await page.evaluate(()=>{__flow.resetFirstHole();__flow.completeHole('drain');__flow.enterMenu();__flow.render();});
 await page.locator('.course-menu-start').click();await page.waitForURL('**/under-green.html?from=drain');await page.waitForFunction(()=>window.render_game_to_text,null,{timeout:120000});assert(await page.evaluate(()=>RCProgression.available('under-green')));
 await page.evaluate(()=>localStorage.setItem('rough-cut.under-green-opening.v1',JSON.stringify({skip:true})));
 await page.goto(base+'/under-green.html?test');await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await page.evaluate(()=>{const r=__underGreen.run;r.mode='complete';r.finished=true;r.saveSerial++;__underGreen.run=r;__underGreen.render();});
 assert(await page.locator('#primary').isHidden());assert(await page.locator('#restart').isHidden());assert(await page.locator('#comfort').isHidden());assert(await page.locator('#continue-final-cut').isVisible());
 await page.screenshot({path:out+'/under-green-win-390.png'});
 await page.evaluate(()=>{const r=__underGreen.run;r.mode='caught';__underGreen.run=r;__underGreen.render();});await page.locator('#primary').click();assert.equal(await page.evaluate(()=>__underGreen.run.mode),'playing');
 checks.push('Drain route unlock, focused win screen and loss retry pass');
 await page.evaluate(()=>localStorage.setItem('rough-cut.final-cut-story.v1',JSON.stringify({skipIntro:true})));
 await page.goto(base+'/final-cut.html?from=drain&test');await page.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await page.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');__finalCut.run=createRun({route:'drain',checkpoint:2,won:true,completed:true});await advanceTime(0);});
 if(await page.locator('#final-cut-story').isVisible())await page.locator('[data-story="skip"]').click();
 assert.equal(await page.locator('#primary').textContent(),'Return to main menu');assert(await page.locator('#story-replay').isHidden());assert.equal(await page.locator('#replay-options').count(),0);
 for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){await page.setViewportSize({width,height});await page.locator('#ending-image').evaluate(img=>img.decode());await page.screenshot({path:`${out}/final-win-${width}.png`});}
 await page.locator('#primary').click();await page.waitForURL('**/index.html');
 await page.goto(base+'/final-cut.html?test&replay=1');await page.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});assert.equal(await page.evaluate(()=>__finalCut.run.mode),'briefing');
 await page.evaluate(async()=>{__finalCut.run.mode='caught';await advanceTime(0);});await page.locator('#primary').click();assert.equal(await page.evaluate(()=>__finalCut.run.mode),'playing');
 checks.push('Final win offers closure without replay; menu replay starts a fresh finale; loss retry remains playable');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
