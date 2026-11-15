const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
const out='output/level-one-single-chapter';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),report={scenarios:[],errors:[]};
 try{for(const legacy of [false,true]){
  const context=await browser.newContext({viewport:{width:2560,height:1600}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.addInitScript(legacy=>{localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true}));if(legacy)localStorage.setItem('rough-cut.career.v1',JSON.stringify({roundsStarted:8,escapes:3,captures:2,completedVariants:['standard_review','eastern_exception','closing_shift'],filedChangeRequests:['standard_review','eastern_exception','closing_shift'],selectedVariantId:'closing_shift',overtimeEnabled:true}));},legacy);
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__single={state,render,enterMenu,resetFirstHole,runVariantForRound,activeRunVariant,selectedMenuVariant,nextNightOrderVariant,startNextNightOrder,retryFirstHole,selectPortfolioVariant,toggleOvertimeAudit,resultActionPresentations,saveCareer,RUN_VARIANTS,SETTINGS_CATEGORIES,SETTINGS_ROWS,settingsVisibleIndices,selectSettingsCategory};\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__single,null,{timeout:120000});
  await page.evaluate(()=>{__single.state.manualTime=true;__single.enterMenu();__single.render();});
  await page.locator('#course-menu').waitFor({state:'visible'});
  assert.equal(await page.locator('#course-menu h1').textContent(),'Night Order');
  assert.equal(await page.locator('.course-order-cards,.course-menu-overtime').count(),0);
  assert.equal(await page.locator('#course-menu [data-menu-action="0"] strong').innerText(),'CHAPTERS');
  assert.equal(await page.locator('#chapter-links [data-chapter]').count(),4);
  assert.equal(await page.locator('#chapter-links [aria-pressed="true"]').getAttribute('data-chapter'),'night-order');
  if(!legacy){for(const size of [{width:2560,height:1600},{width:1280,height:720},{width:390,height:844}]){
   await page.setViewportSize(size);await page.evaluate(()=>{__single.render();document.querySelector('.course-menu-scroll').scrollTop=0;});
   await page.screenshot({path:`${out}/menu-${size.width}.png`});
   assert(await page.locator('#course-menu').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await page.locator('.course-menu-records summary').first().click();
   await page.screenshot({path:`${out}/records-${size.width}.png`});
   await page.locator('.course-menu-records summary').first().click();
  }await page.setViewportSize({width:1280,height:720});}
  await page.locator('[data-menu-action="1"]').click();assert.equal(await page.evaluate(()=>__single.state.mode),'settings');
  const settings=await page.evaluate(()=>{const t=__single;return t.SETTINGS_CATEGORIES.map((c,i)=>{t.selectSettingsCategory(i);t.render();return {name:c.name,indices:t.settingsVisibleIndices(),valid:c.ids.every(id=>t.SETTINGS_ROWS.some(r=>r.id===id))};});});assert(settings.every(c=>c.valid&&c.indices.every(i=>i>=0)));
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>{__single.render();return __single.state.mode;}),'menu');
  assert.deepEqual(await page.locator('#course-menu [data-menu-action] strong').allTextContents(),['CHAPTERS','SETTINGS','CLOCK OUT','START GAME']);
  await page.locator('[data-menu-action="2"]').click();assert.equal(await page.evaluate(()=>__single.state.mode),'clocked_out');await page.locator('[data-clubhouse-command="return"]').click();
  await page.evaluate(()=>{__single.enterMenu();__single.render();});
  for(const key of ['ArrowLeft','ArrowRight','r'])await page.keyboard.press(key);
  const selectors=await page.evaluate(()=>{const t=__single;t.selectPortfolioVariant(2,true);t.toggleOvertimeAudit();return {rotation:Array.from({length:6},(_,i)=>t.runVariantForRound(i).id),selected:t.selectedMenuVariant().id,overtime:t.state.overtimeSelected};});assert(selectors.rotation.every(x=>x==='standard_review'));assert.equal(selectors.selected,'standard_review');assert.equal(selectors.overtime,false);
  await page.locator('[data-menu-action="3"]').click();await page.waitForFunction(()=>{advanceTime(17);return __single.state.mode==='first_hole';},null,{timeout:120000});
  const behavior=await page.evaluate(()=>{const t=__single;const rows=[];const snap=name=>rows.push({name,index:t.state.hole.variantIndex,id:t.activeRunVariant().id,overtime:t.state.hole.overtime});snap('start');t.retryFirstHole();snap('retry');t.startNextNightOrder();snap('replay');t.state.overtimeSelected=true;t.resetFirstHole(t.RUN_VARIANTS[2]);snap('legacy-override');t.saveCareer();return {rows,career:JSON.parse(localStorage.getItem('rough-cut.career.v1')),next:t.nextNightOrderVariant().id,action:t.resultActionPresentations('victory').find(a=>a.id==='next_order')};});
  assert(behavior.rows.every(r=>r.index===0&&r.id==='standard_review'&&!r.overtime));assert.equal(behavior.next,'standard_review');assert.equal(behavior.action.label,'REPLAY CHAPTER');
  if(legacy){assert.deepEqual(behavior.career.completedVariants,['standard_review','eastern_exception','closing_shift']);assert.equal(behavior.career.selectedVariantId,'closing_shift');assert.equal(behavior.career.overtimeEnabled,true);}
  report.scenarios.push({legacy,selectors,settings,rows:behavior.rows,replay:behavior.action,historyPreserved:legacy});await context.close();
 }assert.deepEqual(report.errors,[]);report.passed=true;fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
