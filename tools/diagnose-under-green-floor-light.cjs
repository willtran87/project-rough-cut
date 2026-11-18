const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out='output/under-green/visual-pass92/diagnostic';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/under-green-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-scene.js','utf8').replace(' return {draw,inspectCastShadow:',' window.__lightProbe={scene,renderer,practicalShadows,materials}; return {draw,inspectCastShadow:')}));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__lightProbe&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 const inventory=await p.evaluate(()=>{const names=[];__lightProbe.scene.traverse(o=>{if(o.isMesh&&(o.name==='floor'||o.name==='walkway'||o.name.startsWith('Shallow runoff'))){names.push(o.name);o.userData.probeSpec=o.material.specular?.clone();}});return names;});
 for(const [name,x,y,pitch]of [['floor',0,10,-.48],['entry',0,8,.1]]){
  await p.evaluate(async({x,y,pitch})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();Object.assign(r,{mode:'playing',time:26.3});r.joe.phase='absent';Object.assign(r.player,{x,y,yaw:0,pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();},{x,y,pitch});
  for(const mode of ['baseline','no-puddles','no-floor-specular','no-shadows','diffuse-only']){
   await p.evaluate(async mode=>{const t=__lightProbe;t.practicalShadows.setEnabled(!['no-shadows','diffuse-only'].includes(mode));t.scene.traverse(o=>{if(o.isMesh&&o.name.startsWith('Shallow runoff'))o.visible=!['no-puddles','diffuse-only'].includes(mode);if(o.isMesh&&['floor','walkway'].includes(o.name)){if(['no-floor-specular','diffuse-only'].includes(mode))o.material.specular.setHex(0);else o.material.specular.copy(o.userData.probeSpec);}});advanceTime(0);await __underGreen.whenPresented();},mode);
   await p.screenshot({path:`${out}/${name}-${mode}.jpg`,quality:88});
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({inventory,errors},null,2));console.log('PASS: ten isolated lighting views');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
