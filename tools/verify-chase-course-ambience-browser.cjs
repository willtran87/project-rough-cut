const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/back-nine-experience/course-ambience',b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{
   localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');localStorage.setItem('rough-cut.settings.v1','{"soundCaptions":true}');window.__nodeCounts={};window.__uploads=0;
   for(const name of ['createOscillator','createBufferSource','createBuffer','createGain','createBiquadFilter','createStereoPanner']){const f=BaseAudioContext.prototype[name];BaseAudioContext.prototype[name]=function(...args){__nodeCounts[name]=(__nodeCounts[name]||0)+1;return f.apply(this,args);};}
   const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__uploads++;return f.apply(this,args);};
  });
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await tick(0);await p.click('#primary');await tick(0);
  const resources=()=>p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return{counts:__nodeCounts,uploads:__uploads,programs:s.graphics.programs,textures:s.graphics.textures,voices:s.audio.voices};});const initial=await resources();
  async function fixture(kind){await p.evaluate(async kind=>{
   const{createRun}=await import('./back-nine-sim.js');const r=createRun(kind==='garage'?2:0,0,37161);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=100;r.tension.zoneMask=7;r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;
   const point=kind==='pump'?{x:28,y:190}:kind==='charger'?{x:-2.3,y:303.84}:{x:-22.43,y:794};Object.assign(r.cart,{...point,speed:0});Object.assign(r.joe,{x:point.x,y:point.y-85,speed:3,yaw:0});
   if(kind==='charger'){r.foot={...r.cart,onFoot:true,viewYaw:0,rearBlend:0,invulnerable:0};r.cart.health=0;r.cart.y-=20;r.cart.failedAt=0;}
   __backNine.run=r;await advanceTime(17);
  },kind);}
  for(const[width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});for(const kind of ['pump','charger','garage']){
    await fixture(kind);const s=await read();assert.equal(s.audio.courseAmbience.kind,kind);assert(s.audio.courseAmbience.mix>.22);assert(s.messages.sound.includes(kind==='pump'?'Irrigation':kind==='charger'?'Shelter':'Garage'),JSON.stringify({kind,messages:s.messages,settings:s.campaign,ambience:s.audio.courseAmbience}));assert(!s.messages.banner.includes('hum'));
    const layout=await p.locator('#sound-caption').evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,sw:e.scrollWidth,cw:e.clientWidth,sh:e.scrollHeight,ch:e.clientHeight};});assert(layout.x>=0&&layout.y>=0&&layout.x+layout.width<=width+1&&layout.y+layout.height<=height+1);assert(layout.sw<=layout.cw+1&&layout.sh<=layout.ch+1);
    await p.screenshot({path:`${out}/${label}-${kind}-${width}.png`});views.push({kind,width,height,ambience:s.audio.courseAmbience,sound:s.messages.sound,layout});
   }
  }
  await p.setViewportSize({width:1280,height:720});await fixture('charger');const front=await read();await p.keyboard.down('KeyQ');await tick(350);const rear=await read();assert(front.audio.courseAmbience.pan>0&&rear.audio.courseAmbience.pan<0);assert.equal(rear.player.yaw,front.player.yaw);await p.keyboard.up('KeyQ');
  await p.keyboard.down('KeyW');await tick(400);await p.keyboard.up('KeyW');assert((await read()).player.y>rear.player.y+.5);
  await p.keyboard.press('Escape');const paused=await p.evaluate(()=>JSON.stringify(__backNine.run));await tick(500);assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),paused);
  await p.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));});
  await p.locator('[data-campaign="ambienceVolume"]').evaluate(e=>{e.value='0.4';e.dispatchEvent(new Event('input',{bubbles:true}));});await p.keyboard.press('Escape');await fixture('pump');assert.equal((await read()).campaign.ambienceVolume,.4);assert((await read()).campaign.reducedMotion);
  await p.click('#sound');await tick(300);assert((await read()).audio.muted);await p.click('#sound');await tick(300);assert(!(await read()).audio.muted);
  await p.evaluate(async()=>{const r=__backNine.run;Object.assign(r.joe,{x:r.cart.x,y:r.cart.y-15,speed:8});r.joe.ram.phase='lineup';r.joe.ram.age=.9;r.joe.ram.aim={x:r.cart.x,y:r.cart.y};await advanceTime(17);});const warning=await read();assert.equal(warning.audio.courseAmbience.mix,0);assert(warning.messages.sound.includes('Mower'));
  await p.keyboard.press('Escape');await p.locator('#chase-sound-captions').evaluate(e=>{e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}));});await p.keyboard.press('Escape');await fixture('pump');assert.equal((await read()).messages.sound,'');
  const final=await resources();assert.deepEqual(final,initial);assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${label}-browser.json`,JSON.stringify({passed:true,views,front,rear,warning,initial,final,errors},null,2));console.log(JSON.stringify({passed:true,label,views:views.length,resources:final,checks:['world captions','real on-foot movement/Q','pause','live mix/mute','reduced motion','attack priority','optional descriptions'],errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
