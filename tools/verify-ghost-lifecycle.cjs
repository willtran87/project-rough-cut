const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage();
 try{
  await page.route('**/__ghost-lifecycle',r=>r.fulfill({contentType:'text/html',body:'<div><canvas id="game" width="1280" height="720"></canvas></div>'}));
  await page.route('**/ghost-joe.glb*',r=>r.abort());
  await page.goto('http://127.0.0.1:4187/__ghost-lifecycle');
  const fallback=await page.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{createPixelEffects}=await import('./pixel-effects.js'),Art=await import('./pixel-art.js');
   const world=new T.Scene();world.fog=new T.Fog(0x203a40,18,34);const moon=new T.DirectionalLight(0xffffff,2),camera=new T.PerspectiveCamera(58,16/9,.055,36);camera.position.y=1.65;camera.updateMatrixWorld();world.add(moon);
   const fx=createPixelEffects(world,{software:true,scale:.16,xScale:.1152,moon});await fx.ready;
   while(Art.stats().pending)await new Promise(r=>setTimeout(r,10));
   fx.update({time:1,player:{x:0,y:0},joe:{x:1000,y:1000,mode:'patrol'},yaw:0,fx:{density:0,apparitions:true,flashes:false,horror:{manifestation:{type:'peripheral_groundskeeper',seed:1,side:1,seconds:1,duration:2}}}},camera);
   const stats=fx.stats();fx.dispose();window.__lifecycle={T,world,moon,createPixelEffects};return {stats,detached:fx.root.parent===null};
  });
  assert(fallback.stats.ghost.error);assert(!fallback.stats.ghost.ready);assert.equal(fallback.stats.counts.figures,1);assert(fallback.detached);
  await page.unroute('**/ghost-joe.glb*');
  const cancellation=await page.evaluate(async()=>{const t=__lifecycle,fx=t.createPixelEffects(t.world,{software:true,scale:.16,xScale:.1152,moon:t.moon});fx.dispose();await fx.ready;return {detached:fx.root.parent===null,ready:fx.stats().ghost.ready,overlays:document.querySelectorAll('#pixel-feedback').length};});
  assert(cancellation.detached);assert(!cancellation.ready);assert.equal(cancellation.overlays,0);
  fs.writeFileSync('output/atmosphere-return-20261107/lifecycle.json',JSON.stringify({passed:true,fallback,cancellation},null,2));
  console.log('PASS: missing ghost model retains the original apparition; disposal during load leaves no actor or overlay');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
