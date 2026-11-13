// Controlled camera fixtures inspect art and the actual existing boundary clamp.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const software=process.argv.includes('--software'),out='output/darker-boundary-20261108/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__boundary={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 const shot=async(name,x,y,yaw=0)=>{
  await p.evaluate(({x,y,yaw})=>{const t=__boundary,s=t.state;Object.assign(s.player,{x,y,yaw,pitch:0});s.hole.elapsed+=.2;t.render();},{x,y,yaw});
  await p.evaluate(async()=>{__boundary.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/'+name+'.png'});
  samples.push(await p.evaluate(name=>{const s=RCScene3D.stats();return {name,drawCalls:s.drawCalls,triangles:s.triangles,effects:s.effects?.counts,error:s.error};},name));
 };
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__boundary&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__boundary,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:-100,y:350,mode:'patrol',patrolPause:9999});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  await shot('cart',28,13);await shot('pond',0,230);await shot('rear-east',45,700);await shot('shed',-18,660);await shot('drain',-78,665);
  const fences=await p.evaluate(()=>RCScene3D.stats().pixelWorld.objects.filter(o=>o.kind==='rear-fence'));
  assert.equal(fences.length,14);assert(Math.min(...fences.map(f=>f.bounds[0][0]))< -112*.1152);assert(Math.max(...fences.map(f=>f.bounds[1][0]))>112*.1152);
  for(const f of fences){assert(f.bounds[1][2]<-720*.16,'Fence must stay beyond playable limit');assert(f.bounds[1][1]>1.7);}
  await shot('boundary-approach',90,715);
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1000));await p.keyboard.up('w');
  const blocked=await p.evaluate(()=>({x:__boundary.state.player.x,y:__boundary.state.player.y}));assert(blocked.y>719&&blocked.y<=720);
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1000));await p.keyboard.up('w');assert(await p.evaluate(y=>Math.abs(__boundary.state.player.y-y)<.05,blocked.y),'Boundary stops continued forward input');
  await p.keyboard.down('s');await p.evaluate(()=>advanceTime(500));await p.keyboard.up('s');assert(await p.evaluate(()=>__boundary.state.player.y<715),'Player can retreat from the fence');
  for(const [w,h]of [[1280,720],[844,390]]){await p.setViewportSize({width:w,height:h});await shot('rear-'+w,45,700);}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,blocked,fences,samples,errors},null,2));console.log(JSON.stringify({passed:true,software,fences:fences.length,samples,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
