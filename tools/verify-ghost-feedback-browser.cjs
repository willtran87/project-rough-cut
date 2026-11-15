const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/ghost-feedback-20261107';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.route('**/__cue-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__cue-test');
  const audio=await p.evaluate(async()=>{
   const {createAtmosphericAudio}=await import('/atmospheric-audio.js'),c=new OfflineAudioContext(2,48000*3,48000),noise=c.createBuffer(1,96000,48000);
   const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.sin(i*1.729)*Math.cos(i*.713);
   const a=createAtmosphericAudio(c,c.destination,noise),frame={time:0,active:true,volume:1,apparitions:true,player:{x:0,z:0,yaw:0},ghost:{key:'g',x:3,z:-6,phase:'notice'}};
   a.update(frame);a.update(frame);const notice=a.stats();
   const during=c.suspend(.8).then(()=>{const rush={...frame,time:1,ghost:{...frame.ghost,phase:'rush'}};a.update(rush);a.update(rush);return c.resume();});
   const protectedCheck=c.suspend(1.8).then(()=>{
    for(const guard of [{priority:true},{focus:true},{suspensePhase:'recovery'},{active:false},{volume:0}])a.update({...frame,...guard,time:2,ghost:{...frame.ghost,key:'blocked',phase:'rush'}});
    return c.resume();
   });
   const buffer=await c.startRendering();await Promise.all([during,protectedCheck]);const stats=a.stats();let peak=0,energy=0;for(const v of buffer.getChannelData(0)){peak=Math.max(peak,Math.abs(v));energy+=v*v;}a.dispose();return {notice,stats,peak,energy};
  });
  assert.equal(audio.notice.counts.ghost_notice,1);assert.equal(audio.stats.counts.ghost_notice,1);assert.equal(audio.stats.counts.ghost_rush,1);assert.equal(audio.stats.events,2);assert(audio.stats.maxVoices<=6&&audio.stats.voices===0);assert(audio.peak>.001&&audio.peak<.15&&audio.energy>0);assert(audio.stats.history.every(e=>e.pan>0));
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__feel={state,resetFirstHole,render,update,mouseLook};\n  window.advanceTime = (milliseconds) => {')}));
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__feel&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__feel,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.freeLook=true;s.lookSensitivity=1.8;s.inputMethod='keyboard';s.keys.clear();Object.assign(s.hole.joe,{x:100,y:690,patrolPause:9999});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const mouse=await p.evaluate(()=>{
   const t=__feel,s=t.state,canvas=document.querySelector('#game'),move=(x,y=0)=>canvas.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',buttons:1,movementX:x,movementY:y,bubbles:true}));
   s.player.yaw=0;s.player.pitch=0;const xy={x:s.player.x,y:s.player.y};move(5000,5000);const immediate=s.player.yaw;t.update(1/60);const first={yaw:s.player.yaw,pitch:s.player.pitch};
   t.mouseLook.reset();s.player.yaw=0;for(let i=0;i<60;i++){for(let j=0;j<10;j++)move(5000);t.update(1/60);}const sustained=s.player.yaw;
   for(let i=0;i<20;i++)t.update(1/60);const stopped=s.player.yaw;t.update(.05);const noDrift=s.player.yaw;
   move(1000);s.hole.mapOpen=true;t.update(1/60);s.hole.mapOpen=false;t.update(1/60);const afterMap=s.player.yaw;
   move(1000);window.dispatchEvent(new PointerEvent('pointerup',{pointerType:'mouse'}));t.update(1/60);const afterRelease=s.player.yaw;
   s.invertLook=true;move(100);t.update(1/60);const inverted=s.player.yaw;
   return {immediate,first,sustained,stopped,noDrift,afterMap,afterRelease,inverted,xy,afterXY:{x:s.player.x,y:s.player.y},ghostInterference:s.ghostInterference};
  });
  assert.equal(mouse.immediate,0);assert(mouse.first.yaw>0&&mouse.first.yaw<=2.1/60+1e-9);assert(Math.abs(mouse.first.pitch)<=1.4/60+1e-9);assert(mouse.sustained<=2.1+1e-8);assert.equal(mouse.stopped,mouse.noDrift);assert.equal(mouse.afterMap,mouse.noDrift);assert.equal(mouse.afterRelease,mouse.noDrift);assert(mouse.inverted<mouse.afterRelease);assert.deepEqual(mouse.xy,mouse.afterXY);assert(mouse.ghostInterference);
  await p.keyboard.press('Escape');await p.evaluate(()=>__feel.render());await p.locator('#controls-launch').click();const toggle=p.locator('[data-feel=ghostInterference]');assert(await toggle.isVisible());await toggle.uncheck();assert.equal(await p.evaluate(()=>RCFoundation.readComfort().ghostInterference),false);await toggle.check();
  await p.screenshot({path:out+'/comfort-2560.png'});await p.setViewportSize({width:844,height:390});await p.screenshot({path:out+'/comfort-844.png'});
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser-verification.json',JSON.stringify({passed:true,audio,mouse,errors},null,2));console.log(JSON.stringify({passed:true,peak:audio.peak,maxVoices:audio.stats.maxVoices,mouse,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
