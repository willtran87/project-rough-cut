const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/on-foot-keyboard-scope';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const visit=async name=>{await p.goto(`http://127.0.0.1:4187/${name}.html?test`);await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));};
  await visit('under-green');const underGreenEditors=await p.locator('[data-binding]').count();
  await visit('final-cut');await p.locator('#comfort summary').click();
  await p.evaluate(()=>{
   const original=Storage.prototype.setItem;
   Storage.prototype.setItem=function(k,v){if(k==='rough-cut.settings.v1'&&JSON.parse(v).keyboardBindingsVersion===2)throw new DOMException('Fixture rejects versioned write','QuotaExceededError');return original.call(this,k,v);};
  });
  await p.locator('[data-binding=interact]').selectOption('Enter');
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1'))),status=await p.locator('[data-keyboard-status]').innerText();
  await visit('under-green');await p.locator('#comfort summary').click();const guide=await p.locator('#control-guide').innerText();
  await p.locator('#control-guide').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/baseline-inherited-2560.png'});
  assert.equal(underGreenEditors,0);assert.equal(saved.keyboardBindings.interact,'Enter');assert.equal(saved.keyboardBindingsVersion,undefined);assert.match(guide,/E uses/);assert.match(status,/saved/);
  fs.writeFileSync(out+'/baseline.json',JSON.stringify({underGreenEditors,saved,status,guide,errors},null,2));console.log(JSON.stringify({underGreenEditors,storedUse:saved.keyboardBindings.interact,storedVersion:saved.keyboardBindingsVersion??null,status,inheritedUse:'E',errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
