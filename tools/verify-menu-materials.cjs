const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const out=(process.env.MENU_EVIDENCE||'output/menu-materials')+'/layout';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(page);}page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__materials={state,enterMenu,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__materials);
 await page.evaluate(()=>{__materials.enterMenu();__materials.render();});await page.waitForTimeout(500);
 for(const id of ['night-order','back-nine','under-green','final-cut']){
  await page.locator(`[data-chapter="${id}"]`).click();await page.evaluate(()=>Promise.all([...document.querySelectorAll('#course-menu img')].map(i=>i.decode())));await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>__materials.state.mode),'menu');assert.equal(await page.locator('#course-menu').getAttribute('data-selected-chapter'),id);
  const marks=await page.evaluate(id=>{const path=e=>e.querySelector('path').getAttribute('d');return {card:path(document.querySelector(`[data-chapter="${id}"] .chapter-emblem`)),heading:path(document.querySelector('.chapter-heading-mark')),start:path(document.querySelector('.start-emblem')),diagram:document.querySelector('.course-menu-diagram').dataset.equipment};},id);
  assert.equal(marks.card,marks.heading);assert.equal(marks.card,marks.start);assert.equal(marks.diagram,id);
  await page.screenshot({path:`${out}/${id}-2560.png`});
 }
 await page.locator('[data-chapter="night-order"]').click();
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844],[320,568]])for(const scale of [1,1.3]){
  await page.setViewportSize({width,height});await page.evaluate(scale=>{__materials.state.uiScale=scale;__materials.render();document.querySelector('.course-menu-scroll').scrollTop=0;},scale);await page.waitForTimeout(150);
  const geometry=await page.evaluate(()=>{const panel=document.querySelector('#course-menu'),scroll=panel.querySelector('.course-menu-scroll'),footer=panel.querySelector('footer'),start=panel.querySelector('.course-menu-start'),r=footer.getBoundingClientRect(),s=start.getBoundingClientRect();return {overflow:scroll.scrollWidth-scroll.clientWidth,bodyHeight:scroll.clientHeight,footer:r.bottom,start:[s.x,s.y,s.right,s.bottom],targetMin:Math.min(...[...panel.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect().height)),titleClips:[...panel.querySelectorAll('#chapter-links strong span')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)};});
  assert(geometry.overflow<=1,JSON.stringify({width,scale,geometry}));assert(geometry.bodyHeight>60);assert(geometry.footer<=height+1);assert(geometry.start[0]>=0&&geometry.start[2]<=width+1);assert(geometry.targetMin>=44);assert.deepEqual(geometry.titleClips,[]);
  if(width<=650){const cards=await page.locator('#chapter-links button').evaluateAll(bs=>bs.map(b=>{const a=b.querySelector('.chapter-card-art').getBoundingClientRect(),l=b.querySelector('.chapter-card-label').getBoundingClientRect();return {imageHeight:a.height,beside:l.left>=a.right-1};}));assert(cards.every(c=>c.imageHeight>=104&&c.beside));}
  views.push({width,height,scale,...geometry});await page.screenshot({path:`${out}/menu-${width}-${scale}.png`});
 }
 await page.setViewportSize({width:1280,height:720});await page.evaluate(()=>{__materials.state.uiScale=1;__materials.render();});
 await page.locator('.course-menu-start').focus();await page.screenshot({path:out+'/start-focus.png'});
 await page.locator('.course-menu-start').hover();await page.mouse.down();await page.screenshot({path:out+'/start-pressed.png'});await page.mouse.move(1,1);await page.mouse.up();
 await page.locator('[data-menu-action="1"]').click();assert.equal(await page.evaluate(()=>__materials.state.mode),'settings');await page.keyboard.press('Escape');await page.locator('#course-menu').waitFor({state:'visible'});
 await page.locator('#controls-launch').click();assert(await page.locator('#controls-dialog').evaluate(e=>e.open));await page.keyboard.press('Escape');
 await page.locator('[data-chapter="under-green"]').click();assert.equal(await page.evaluate(()=>__materials.state.mode),'menu');
 await page.route('**/under-green.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Chapter navigation verified</title>'}));await page.locator('.course-menu-start').click();await page.waitForURL('**/under-green.html');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({views,chapterLaunch:'under-green.html',errors},null,2));console.log(JSON.stringify({views:views.length,chapterLaunch:'under-green.html',errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
