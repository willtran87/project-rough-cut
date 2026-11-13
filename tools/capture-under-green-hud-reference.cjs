const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/visual-upgrade/pass18-level-one';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.level-one-opening.v1',JSON.stringify({seen:true,skip:true})));
  await p.route('**/game.js*',r=>{const s=fs.readFileSync('web/game.js','utf8'),needle='  window.advanceTime = (milliseconds) => {';assert(s.includes(needle));return r.fulfill({contentType:'application/javascript',body:s.replace(needle,'  window.__hudReference={state};\n'+needle)});});
  await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__hudReference&&window.roughCutRebuild,null,{timeout:120000});
  await p.keyboard.press('Enter');await p.keyboard.press('Space');await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:120000});
  await p.evaluate(()=>{__hudReference.state.manualTime=true;roughCutRebuild.startLab('calibration');__hudReference.state.hole.rebuild.lab=null;advanceTime(0);});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
   await p.setViewportSize({width,height});await p.evaluate(async()=>{advanceTime(0);await RCScene3D.whenPresented();});
   const metrics=await p.evaluate(()=>({viewport:[innerWidth,innerHeight],graphics:RCScene3D.stats(),hudHidden:document.querySelector('#quality-hud').hidden,fields:[...document.querySelectorAll('.q-objective,.q-objective strong,.q-objective small')].map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {name:e.className||e.tagName,text:e.textContent,font:s.fontFamily,size:s.fontSize,color:s.color,background:s.background,border:s.borderLeftColor,x:r.x,y:r.y,w:r.width,h:r.height};})}));
   assert(!metrics.hudHidden);assert(metrics.fields.every(f=>f.font.includes('Courier New')));await p.screenshot({path:`${out}/level-one-${width}.png`});views.push(metrics);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,views,errors,limits:['Level 1 calibration placement with normal course HUD, not a natural route playthrough.','Typography/panel reference only; not full environment parity acceptance.']},null,2));console.log(JSON.stringify({passed:true,views:views.length,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
