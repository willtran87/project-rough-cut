// Fresh opening through real UI, keyboard and pointer input; read-only observations.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv[2]||'output/opening-walk';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],events=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
 const marker='  window.advanceTime = (milliseconds) => {';const source=fs.readFileSync('web/game.js','utf8');assert(source.includes(marker));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace(marker,`  window.__openingRead=()=>{const h=state.hole;return {mode:state.mode,time:h.elapsed,p:{...state.player},joe:{x:h.joe.x,y:h.joe.y,mode:h.joe.mode},cover:h.environment?.hardCover,rough:h.environment?.effectiveRough,learned:{...state.learnedControls},lesson:practicalLessonPresentation(),owner:h.interactionPromptOwner,message:h.message,messageTimer:h.messageTimer,notes:[...h.engagement.notes],checks:[...h.nightOrderActionsCompleted],blocked:h.blockedTimer,detection:h.detection,seen:h.hasLineOfSight};};\n`+marker)}));
 const read=()=>p.evaluate(()=>__openingRead());
 const tick=async ms=>{await p.evaluate(ms=>advanceTime(ms),ms);const s=await read();events.push(s);return s;};
 const shot=async name=>{await p.evaluate(async()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/'+name+'.png'});};
 async function turn(angle){for(let i=0;i<100;i++){const s=await read(),d=Math.atan2(Math.sin(angle-s.p.yaw),Math.cos(angle-s.p.yaw));if(Math.abs(d)<.025)return;await p.dispatchEvent('#game','pointermove',{pointerType:'mouse',buttons:1,movementX:Math.max(-.08,Math.min(.08,d))/.0025,movementY:0});await tick(50);}throw Error('Mouse turn failed');}
 async function walk(x,y){for(let i=0;i<180;i++){const s=await read(),dx=(x-s.p.x)*.72,dy=y-s.p.y,d=Math.hypot(dx,dy);assert.equal(s.mode,'first_hole','Still alive on opening route');if(d<1.4)return;await turn(Math.atan2(dx,dy));await p.keyboard.down('w');await tick(Math.min(100,d/24*1000));await p.keyboard.up('w');}throw Error('Route blocked at '+x+','+y);}
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__openingRead);await p.locator('#game').click();
  for(let i=0;i<5;i++){if((await read()).mode==='first_hole')break;await p.keyboard.press('Space');await tick(400);}
  await p.waitForFunction(()=>{advanceTime(16);return RCScene3D.stats().ready&&!document.querySelector('[data-brief-start]')?.disabled;},null,{timeout:120000});await p.locator('[data-brief-start]').click();await tick(17);await shot('departure');
  await walk(-60,20);await walk(-78,23);await turn(0);for(let i=0;i<60&&(await read()).lesson?.id!=='cover';i++)await tick(100);assert.equal((await read()).lesson?.id,'cover');await shot('opening-cover');
  await p.keyboard.down('c');await tick(800);await p.keyboard.up('c');
  assert((await read()).learned.cover,'Cover can be learned through the opening route');assert.equal((await read()).joe.mode,'patrol','Cover lesson before threat escalation');await shot('opening-cover-learned');
  await walk(-40,20);await walk(-40,44);await turn(Math.atan2((-54-(await read()).p.x)*.72,48-(await read()).p.y));await tick(17);await shot('welcome-prompt');
  assert.equal((await read()).owner?.targetId,'course-sign');await p.keyboard.press('e');await tick(17);assert((await read()).notes.includes('course-sign'));await shot('welcome-read');
  await walk(12,44);await walk(12,74);await walk(0,96);await walk(20,100);await tick(3500);await shot('first-cover');
  await p.keyboard.down('c');await tick(800);await p.keyboard.up('c');await shot('cover-used');
  await walk(0,100);await walk(0,128);await walk(52,128);await walk(86,138);await turn(0);await tick(17);assert.equal((await read()).owner?.targetId,'audit-bell');await p.keyboard.press('e');await tick(17);assert((await read()).checks.includes('audit-bell'));await shot('audit-bell-filed');
  const end=await read();assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,end,events,errors},null,2));console.log(JSON.stringify({passed:true,end,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,end:await read(),events,errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
