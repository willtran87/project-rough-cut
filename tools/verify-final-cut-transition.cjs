const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4187/final-cut.html');
 await page.evaluate(()=>{
  localStorage.removeItem('rough-cut.final-cut.v1');localStorage.setItem('rough-cut.under-green.v1',JSON.stringify({version:3,checkpoint:3,completed:true,bypass:true,evidence:true}));
  localStorage.setItem('rough-cut.career.v1',JSON.stringify({filedChangeRequests:['standard','crosswind']}));
 });
 await page.goto('http://127.0.0.1:4187/under-green.html');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 await page.locator('#continue-final-cut').click();await page.waitForURL('**/final-cut.html?from=drain');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 const drain=await page.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(drain.route,'drain');assert(drain.evidence);await page.screenshot({path:'output/final-cut/from-drain.png'});checks.push('Completed legacy drain save offers actual continuation; route and evidence arrive');
 await page.evaluate(()=>{localStorage.setItem('rough-cut.back-nine.v1',JSON.stringify({version:1,checkpoint:2,completed:true,collected:1}));localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true}));});
 await page.goto('http://127.0.0.1:4187/back-nine.html');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 await page.locator('#continue-final-cut').click();await page.waitForURL('**/final-cut.html?from=garage');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 const garage=await page.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(garage.route,'garage');assert(!garage.evidence);await page.screenshot({path:'output/final-cut/from-garage.png'});checks.push('Completed legacy Back Nine save offers actual continuation; distinct garage arrival');
 assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.under-green.v1')).completed));assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.back-nine.v1')).completed));checks.push('Both earned branch completions preserved');
 assert.deepEqual(errors,[]);fs.writeFileSync('output/final-cut/transitions.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
