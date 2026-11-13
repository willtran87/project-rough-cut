const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/staff-story',runs=[];
 for(const baseline of [true,false,false,true]){
  const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
   const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
   await p.route('**/back-nine-scene.js*',r=>{let body=fs.readFileSync((baseline?out+'/baseline-source/':'web/')+'back-nine-scene.js','utf8');body=body.replace('onProgress=()=>{}){','onProgress=()=>{}){const buildStarted=performance.now();').replace('return {scene,camera,update,draw()','window.__staffBuildMs=performance.now()-buildStarted;return {scene,camera,update,draw()');return r.fulfill({contentType:'application/javascript',body});});
   const started=Date.now();await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});const readyMs=Date.now()-started,record=await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return{buildMs:__staffBuildMs,programs:s.graphics.programs,textures:s.graphics.textures,preparation:s.graphics.preparation};});assert.deepEqual(errors,[]);runs.push({baseline,readyMs,...record,errors});console.log(JSON.stringify(runs.at(-1)));
  }finally{await b.close();}
 }
 fs.writeFileSync(out+'/startup.json',JSON.stringify({passed:true,runs},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
