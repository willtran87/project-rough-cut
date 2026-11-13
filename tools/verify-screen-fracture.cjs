const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
const baseline=process.argv.includes('--baseline'),software=process.argv.includes('--software'),copy=process.argv.includes('--copy');
const out='output/screen-fracture-20261108/'+(baseline?'before':copy?'copy':software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__fractureGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
await p.route('**/pixel-effects.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/pixel-effects.js','utf8').replace('function draw(frame){','function draw(frame){if(window.__fractureSignal!==undefined)ghostTear=window.__fractureSignal;')}));
await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__fracturePrograms=()=>renderer.info.programs.length;'+fs.readFileSync('tools/fixtures/screen-fracture-probe.js','utf8')}));
try{
await p.goto('http://127.0.0.1:4187/'+(copy?'?presentation=copy':''));await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__fractureGame&&JSON.parse(render_game_to_text()).assets.course.ready);
await p.evaluate(()=>{const t=__fractureGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});const h=s.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.elapsed=100;h.controlHintTimer=h.zoneBannerTimer=h.messageTimer=0;Object.assign(h.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});Object.assign(s.player,{x:0,y:210,yaw:0,pitch:-.08});h.tensionDirector.reliefSeconds=0;h.tensionDirector.pendingIntercept=h.tensionDirector.silentStalk=h.tensionDirector.coverAudit=null;h.tensionDirector.encounterActive=false;window.__fractureSignal=null;t.render();});
await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});await p.evaluate(async()=>RCScene3D.whenPresented());
async function sample(label,signal,options={}){
 const stats=await p.evaluate(({signal,options})=>{const t=__fractureGame,s=t.state,h=s.hole;window.__fractureSignal=signal;h.elapsed+=.12;s.reducedMotion=!!options.reduced;s.ghostInterference=!options.off;h.mapOpen=!!options.map;h.joe.mode=options.chase?'chase':'patrol';h.tensionDirector.reliefSeconds=options.relief?4:0;h.horrorDirector.visualFlash=options.flash?{type:'course_tear',side:-1,seconds:.3,duration:.6,strength:.6}:null;t.render();return RCScene3D.stats();},{signal,options});
 await p.evaluate(async()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/'+label+'.png'});return stats;
}
const clean=await sample('clean',null),programs=await p.evaluate(()=>__fracturePrograms()),frames=[];
for(const [label,kind,progress,strength]of [['notice','notice',.3,.35],['rush','rush',.5,.62],['retreat','feint',.65,.5],['stare','stare',.4,.3],['lookaway','lookaway',.4,.26]])frames.push({label,stats:await sample(label,{kind,progress,strength,side:-1,variant:0,slice:Math.floor(progress*6)})});
await sample('course',null,{flash:true});
for(const name of ['reduced','off','map','chase','relief'])frames.push({label:name,stats:await sample(name,{kind:'rush',progress:.5,strength:.62,side:1,slice:3},{[name]:true})});
await sample('clear-after',null);
for(const [w,h]of [[1280,720],[844,390]]){await p.setViewportSize({width:w,height:h});await sample('rush-'+w,{kind:'rush',progress:.5,strength:.62,side:1,slice:3});}
if(!baseline){
 assert.equal(await p.evaluate(()=>__fracturePrograms()),programs,'No first-use shader compilation');
 for(const frame of frames){const s=frame.stats.screenFracture;assert(s,'Fracture diagnostics');if(['reduced','off','map','chase','relief'].includes(frame.label))assert.equal(s.shiftPixels,0);else assert(s.shiftPixels>0&&s.shiftPixels<=7);}
 assert.equal(clean.screenFracture.shiftPixels,0);
}
const probe=baseline?null:await p.evaluate(()=>__fractureProbe());
if(probe){assert(probe.changed>0&&probe.fraction<.13,'Localized visible displacement');for(const key of ['center','outside','residual'])assert.equal(probe[key],0,key);assert.equal(probe.calls,probe.activeCalls);assert.equal(probe.textures,probe.activeTextures);}
if(process.argv.includes('--motion')){
 await p.setViewportSize({width:1280,height:720});fs.mkdirSync(out+'/motion',{recursive:true});
 for(let i=0;i<28;i++){const progress=Math.max(0,Math.min(1,(i-3)/21));await sample('motion/'+String(i).padStart(3,'0'),{kind:'feint',progress,strength:Math.sin(progress*Math.PI)*.62,side:-1,slice:Math.floor(progress*6),focusY:.56});}
}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,baseline,software,copy,programs,clean,frames,probe,errors},null,2));console.log(JSON.stringify({passed:true,baseline,software,copy,programs,probe,errors}));
}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
