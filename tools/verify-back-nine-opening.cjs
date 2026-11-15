const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/back-nine-opening/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});const errors=[],results={software,slides:[],layouts:[],checkpoints:[]};
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(r.url().includes('/back-nine-opening/'))requests.push(r.url().split('/').pop());});
  const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  const slide=n=>page.waitForFunction(n=>{if(!window.render_game_to_text)return false;const s=JSON.parse(render_game_to_text()).openingStory;return s.active&&s.ready&&s.slide===n;},n,{timeout:20000});
  const ready=()=>page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  await page.goto('http://127.0.0.1:4187/back-nine.html?test');await slide(1);
  const before=await state();assert.equal(before.ready,false);assert.equal(before.graphics.frames,0);
  await page.keyboard.press('ArrowRight');await slide(2);await page.keyboard.press('ArrowLeft');await slide(1);
  for(let i=1;i<=5;i++){
   await slide(i);await page.waitForTimeout(700);const s=await state();
   assert.equal(s.seconds,0);assert.equal(s.cart.health,100);assert.equal(s.graphics.frames,0);assert(s.openingStory.retainedImages<=2);assert.equal(s.audio.voices,9);
   results.slides.push({chapter:i,story:s.openingStory,audio:s.audio,frames:s.graphics.frames});
   await page.screenshot({path:`${out}/slide-${i}-2560.png`});if(i<5)await page.keyboard.press('ArrowRight');
  }
  assert.equal(new Set(requests).size,5);await page.keyboard.press('Enter');await ready();
  assert.equal((await state()).mode,'back_nine_briefing');assert.equal((await state()).seconds,0);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(100);
   const geometry=await page.locator('#panel').evaluate(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,scroll:e.scrollHeight,client:e.clientHeight,horizontal:e.scrollWidth>e.clientWidth+1}));
   assert(!geometry.horizontal);assert(geometry.width<=width);assert(geometry.height<=height);results.layouts.push({width,height,...geometry});
   await page.screenshot({path:`${out}/guide-${width}.png`});
  }
  await page.setViewportSize({width:1280,height:720});
  const guideBefore=JSON.stringify((await state()).cart);await page.waitForTimeout(200);assert.equal(JSON.stringify((await state()).cart),guideBefore);
  await page.locator('#primary').click();await page.keyboard.down('KeyW');await page.waitForTimeout(550);await page.keyboard.up('KeyW');assert.equal((await state()).mode,'back_nine_driving');assert((await state()).cart.speed>0);assert.equal((await state()).speedDisplay.unit,'mph');
  await page.keyboard.press('Escape');const paused=await state();await page.locator('#replay-story').click();await slide(1);await page.locator('.opening-preference input').check();await page.keyboard.press('Escape');
  assert.equal((await state()).mode,'back_nine_paused');assert.deepEqual((await state()).cart,paused.cart);assert.equal((await state()).seconds,paused.seconds);
  await page.locator('#restart').click();assert.equal((await state()).mode,'back_nine_briefing');assert.equal((await state()).openingStory.active,false);
  await page.locator('#replay-story').click();await slide(1);await page.locator('[data-opening="skip"]').click();assert.equal((await state()).mode,'back_nine_briefing');
  // A checkpoint resume does not fetch/play an intro, even if its preference is on.
  for(const checkpoint of [1,2]){
   await page.evaluate(cp=>{localStorage.setItem('rough-cut.back-nine.v1',JSON.stringify({checkpoint:cp,collected:1}));localStorage.removeItem('rough-cut.back-nine-opening.v1');localStorage.setItem('rough-cut.settings.v1',JSON.stringify({volume:0,reducedMotion:true}));},checkpoint);
   const count=requests.length;await page.reload();await ready();const s=await state();assert.equal(s.mode,'back_nine_briefing');assert.equal(s.checkpoint,checkpoint);assert(requests.slice(count).every(name=>name==='05-seen-you.webp'),'Checkpoint loads only the reused guide splash, not the opening sequence');
   const completed=await page.locator('[data-relay][data-complete="true"]').count();assert.equal(completed,checkpoint);results.checkpoints.push({checkpoint,goal:await page.locator('#guide-goal').innerText(),completed});
   await page.screenshot({path:`${out}/checkpoint-${checkpoint}.png`});
  }
  await page.locator('#replay-story').click();await slide(1);assert.equal(await page.locator('.opening-image img').evaluate(e=>getComputedStyle(e).animationName),'none');await page.locator('[data-opening="skip"]').click();
  assert.deepEqual(errors,[]);results.errors=errors;fs.writeFileSync(out+'/report.json',JSON.stringify(results,null,2));console.log('PASS: five scenes, no hidden chase render, guide, controls, pause replay, skip, both checkpoint resumes, reduced motion');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
