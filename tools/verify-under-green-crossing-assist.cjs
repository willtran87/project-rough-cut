const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass63/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[],checks=[];
try{
 for(const before of [true,false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before)await p.route('**/under-green.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-pass63/source/under-green-before.js','utf8')}));
  async function ready(){await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));}
  const tick=ms=>p.evaluate(async ms=>{advanceTime(ms);await __underGreen.whenPresented();},ms);
  async function fixture(cycle=5.5,name='water'){
   await p.evaluate(async({cycle,name})=>{const {createRun}=await import('./under-green-sim.js'),{LEVER,WATERS}=await import('./under-green-course.js'),w=WATERS.find(w=>w.lesson),r=createRun();r.mode='playing';r.time=24+cycle-w.offset;r.elapsed=18;r.joe.phase='absent';Object.assign(r.player,{x:0,y:20.1,yaw:0,pitch:-.08});if(name==='pump')Object.assign(r.player,{x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2,pitch:-.27});if(name==='start'){r.time=0;r.elapsed=0;Object.assign(r.player,{x:0,y:5,pitch:0});}__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{cycle,name});
  }
  async function shot(name,assist){
   // Element screenshots include DOM painted over the canvas. Read its own
   // preserved buffer for the scene-only parity check instead.
   const state=await p.evaluate(()=>JSON.parse(render_game_to_text())),canvas=Buffer.from(await p.locator('#game').evaluate(e=>e.toDataURL('image/png').split(',')[1]),'base64');
   const colors=await p.locator('#game').evaluate(e=>{const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d');ctx.drawImage(e,0,0,32,32);const a=ctx.getImageData(0,0,32,32).data,colors=new Set();for(let i=0;i<a.length;i+=4)colors.add(a[i]+','+a[i+1]+','+a[i+2]);return colors.size;});assert(colors>16,'Scene parity must not compare empty buffers');
   if(name==='warning')fs.writeFileSync(`${out}/${before?'before':'after'}-raw-scene.png`,canvas);
   const boxes=await p.evaluate(()=>['#objective-card','.hud-tools','#water-read','#caption','#use','#hint'].map(id=>{const e=document.querySelector(id),r=e.getBoundingClientRect();return {id,visible:!!e.getClientRects().length,x:r.x,y:r.y,w:r.width,h:r.height,scroll:e.scrollWidth>e.clientWidth+1};}).filter(v=>v.visible&&v.w&&v.h));
   const viewport=p.viewportSize();for(const v of boxes)assert(v.x>=-.1&&v.y>=-.1&&v.x+v.w<=viewport.width+.5&&v.y+v.h<=viewport.height+.5&&!v.scroll,JSON.stringify(v));
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],c=boxes[j];assert(!(a.x<c.x+c.w-1&&a.x+a.w>c.x+1&&a.y<c.y+c.h-1&&a.y+a.h>c.y+1),'Overlapping HUD '+a.id+' '+c.id);}
   rows.push({before,name,assist,viewport,state:{player:state.player,waters:state.waters,flood:state.flood},graphics:{resolution:state.graphics.resolution,draws:state.graphics.draws,triangles:state.graphics.triangles,textures:state.graphics.textures,programs:state.graphics.programs},canvas:crypto.createHash('sha256').update(canvas).digest('hex'),boxes});
   await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${assist?'assist':'quiet'}-${viewport.width}.jpg`,quality:90});
  }
  async function assist(value){await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#crossing-assist').setChecked(value);await p.click('#primary');await tick(0);}
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await ready();await p.click('#primary');if(await p.evaluate(()=>__underGreen.run.mode==='intro'))await p.keyboard.press('Escape');
  for(const [name,cycle]of [['low',.5],['warning',5.5],['surge',8],['receding',11]]){await fixture(cycle);assert.equal(await p.locator('#water-read').isVisible(),before);assert.equal(await p.locator('#caption').textContent(),'');await shot(name,before);}
  if(!before){
   assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).comfort.crossingAssist),false);
   for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
    await p.setViewportSize({width,height});await fixture();await assist(false);await fixture();await shot('responsive',false);
    await assist(true);await fixture();assert(await p.locator('#water-read').isVisible());await shot('responsive',true);
   }
   for(const quiet of rows.filter(v=>!v.before&&v.name==='responsive'&&!v.assist)){const active=rows.find(v=>!v.before&&v.name==='responsive'&&v.assist&&v.viewport.width===quiet.viewport.width);assert.equal(quiet.canvas,active.canvas);assert.deepEqual(quiet.state,active.state);assert.deepEqual(quiet.graphics,active.graphics);}
   checks.push('Assistance changes only the DOM: identical canvas pixels, gameplay state and resources at four viewport sizes. HUD panels fit without overlaps.');
   await p.setViewportSize({width:1280,height:720});await assist(false);await fixture(0,'start');
   await p.keyboard.down('w');await tick(3800);await p.keyboard.up('w');assert.equal(await p.locator('#water-read').isVisible(),false);await shot('first-bank',false);
   await p.keyboard.down('w');await tick(1600);await p.keyboard.up('w');const crossed=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(crossed.lessonCrossed);assert.equal(crossed.waterHits,0);assert.equal(crossed.checkpoint,0);await shot('first-crossed',false);
   checks.push('Ordinary W input reaches and clears the first crossing without coaching, water hit or checkpoint.');
   await fixture(5.5);await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);const time=await p.evaluate(()=>__underGreen.run.time);await p.locator('#crossing-assist').focus();await p.keyboard.press('Space');await tick(500);assert.equal(await p.evaluate(()=>__underGreen.run.time),time);assert(await p.locator('#crossing-assist').isChecked());await p.click('#primary');await tick(0);assert(await p.locator('#water-read').isVisible());
   await p.reload();await ready();assert(await p.locator('#crossing-assist').isChecked());await fixture();assert(await p.locator('#water-read').isVisible());
   await p.evaluate(()=>{Object.assign(__underGreen.run,{mode:'caught',bypass:true,evidence:true});advanceTime(0);});await p.click('#primary');await tick(0);const retry=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(retry.player.y,5);assert.equal(retry.bypass,false);assert.equal(retry.checkpoint,0);assert(retry.comfort.crossingAssist);
   checks.push('Keyboard Space toggles assistance while paused; time stays frozen. Choice persists across reload and entrance-only retry.');
   await assist(false);await fixture(5.5);await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#campaign-sound-captions').check();await p.click('#primary');await fixture(5.5);assert.match(await p.locator('#caption').textContent(),/Irrigation pipes knock/);assert(!(await p.locator('#water-read').isVisible()));await shot('sound-descriptions',false);
   await p.keyboard.press('Escape');await p.locator('#campaign-sound-captions').uncheck();await p.click('#primary');await fixture(8,'pump');assert.match(await p.locator('#use').textContent(),/^E/);await p.keyboard.press('e');await tick(17);assert(await p.evaluate(()=>__underGreen.run.bypass));assert.equal(await p.locator('#caption').textContent(),'');await p.keyboard.down('q');await tick(300);assert(await p.evaluate(()=>__underGreen.run.player.rearAmount>.8));await p.keyboard.up('q');await tick(500);assert(await p.evaluate(()=>__underGreen.run.player.rearAmount<.01));await shot('pump-used',false);
   checks.push('Sound descriptions work independently; E pump interaction and Q rear glance work without action narration.');
   await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='rough-cut.under-green-comfort.v1')throw Error('test storage unavailable');return original.call(this,k,v);};});await p.locator('#crossing-assist').check();assert.match(await p.locator('#spatial-settings-status').textContent(),/unavailable/);await p.click('#primary');await fixture();assert(await p.locator('#water-read').isVisible());
   await p.reload();await ready();assert(!(await p.locator('#crossing-assist').isChecked()));checks.push('Storage failure keeps assistance usable for the session and reports that it was not saved.');
  }
  await p.close();
 }
 for(const old of rows.filter(v=>v.before)){const now=rows.find(v=>!v.before&&v.name===old.name);assert.deepEqual(now.state,old.state);assert.deepEqual(now.graphics,old.graphics);assert.equal(now.canvas,old.canvas,'Presentation edit changed the actual scene');}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views:rows.length,checks,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,checks}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
