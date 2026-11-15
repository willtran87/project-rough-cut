const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const results=[];for(const baseline of [true,false,false,true]){
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  const dir=baseline?'output/back-nine-chase-drama/baseline-source':'web';
  await p.route('**/*',r=>{const u=new URL(r.request().url()),name=path.basename(u.pathname),file=path.join(dir,name);if(/\.(js|html|css)$/.test(name)&&fs.existsSync(file))return r.fulfill({path:file});return r.continue();});
  const start=Date.now();await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});const elapsed=Date.now()-start,graphics=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.deepEqual(errors,[]);results.push({baseline,elapsed,programs:graphics.programs,textures:graphics.textures,preparation:graphics.preparation});console.log(JSON.stringify(results.at(-1)));
 }finally{await b.close();}}
 fs.writeFileSync('output/back-nine-chase-drama/startup.json',JSON.stringify({passed:true,results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
