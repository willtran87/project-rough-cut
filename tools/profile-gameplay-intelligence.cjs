const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const moving=process.argv.includes('--moving');
 const before=process.argv.includes('--before'),software=process.argv.includes('--software'),out='output/gameplay-intelligence',label=(before?'before':'after')+'-'+(software?'software':'hardware')+(moving?'-moving':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],results=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(before&&!fs.existsSync(out+'/before/joe-model.js'))throw Error('The recorded baseline predates Joe LOD. Supply the matching original joe-model.js snapshot before rerunning --before.');
 if(before)for(const file of ['joe-model.js','scene-3d.js','pixel-world-props.js','pixel-trees.js','render-preparation.js'])await p.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/'+file,'utf8')}));
 const source=fs.readFileSync(before?out+'/before/game.js':'web/game.js','utf8');await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.joe.x=100;s.hole.joe.y=690;t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  for(const [name,x,y,yaw]of [['opening',0,65,0],['border',100,340,1.57]]){
   await p.evaluate(v=>{Object.assign(__perf.state.player,v);__perf.render();},{x,y,yaw});await p.waitForTimeout(500);
   const sample=await p.evaluate(moving=>new Promise(resolve=>{const intervals=[],submit=[];let last;function step(now){if(last!==undefined)intervals.push(now-last);last=now;__perf.state.hole.elapsed+=1/60;if(moving){__perf.state.player.y+=.35;__perf.state.player.yaw+=.002;}const start=performance.now();__perf.render();submit.push(performance.now()-start);if(intervals.length>=60)resolve({intervals,submit,stats:RCScene3D.stats()});else requestAnimationFrame(step);}requestAnimationFrame(step);}),moving);
   const a=sample.intervals.sort((a,b)=>a-b),b=sample.submit.sort((a,b)=>a-b),s=sample.stats;results.push({name,medianMs:a[30],p95Ms:a[57],maxMs:Math.max(...a),submitP95:b[Math.floor(b.length*.95)],over50:a.filter(n=>n>50).length,triangles:s.triangles,drawCalls:s.drawCalls,resolution:s.resolution,gpu:s.gpu,quality:s.quality,prepareMs:s.prepareMs});await p.screenshot({path:out+'/'+label+'-'+name+'.png'});
  }
  if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(out+'/'+label+'.json',JSON.stringify({label,results,errors,method:'Isolated 60 real RAF frames per view at 1280x720, full game rendering, deterministic simulation clock; --moving advances camera .35 course units and .002 radians/frame.'},null,2));console.log(JSON.stringify({label,results,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
