const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/under-green-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-scene.js','utf8').replace(' return {draw,inspectCastShadow:',' window.__bankRay={scene,camera,materials,renderer}; return {draw,inspectCastShadow:')}));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 const points=JSON.parse(fs.readFileSync('output/under-green/visual-pass104/hardware/gallery-difference-points.json'));
 const result=await p.evaluate(async points=>{
  const {createRun}=await import('./under-green-sim.js'),T=await import('./vendor/three/three.module.js'),r=createRun();r.mode='playing';r.time=26.3;r.elapsed=0;r.joe.phase='absent';Object.assign(r.player,{x:0,y:19,yaw:0,pitch:.1,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();
  const ray=new T.Raycaster(),probe=__bankRay;
  return points.map(point=>{ray.setFromCamera(new T.Vector2((point.x+.5)/2560*2-1,1-(point.y+.5)/1600*2),probe.camera);const hits=ray.intersectObjects(probe.scene.children,true).filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return h.object.isMesh;}).slice(0,4);return {...point,hits:hits.map(h=>({name:h.object.name,material:Object.entries(probe.materials).find(([,m])=>m===h.object.material)?.[0],point:h.point.toArray(),distance:h.distance}))};});
 },points);
 assert.deepEqual(errors,[]);fs.writeFileSync('output/under-green/visual-pass104/gallery-control-inspection.json',JSON.stringify({result,errors},null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
