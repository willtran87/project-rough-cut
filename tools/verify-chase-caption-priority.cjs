const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const baseline=process.argv.includes('--baseline'),software=process.argv.includes('--software'),tag=baseline?'before':software?'software':'hardware',out=process.env.CHASE_QA_OUT||'output/back-nine-experience/caption-priority';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],rows=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(baseline?out+'/baseline-source/back-nine.js':'web/back-nine.js','utf8').replace('simulate,render,whenPresented,COURSE};','simulate,render,whenPresented,COURSE,observeDialogue:()=>joeReactions.observe(run)};')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 await p.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js'),{JOE_STORY_CUES,JOE_LINES}=await import('./back-nine-dialogue.js');
  window.captionSetting=(key,value)=>{const el=document.querySelector(`[data-campaign="${key}"]`);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event(el.type==='checkbox'?'change':'input',{bubbles:true}));};
  window.captionStage=async(kind='story')=>{const r=createRun(0,0,37161);r.departure.phase='finished';r.mode='driving';r.time=20;r.grace=0;r.story.seen=7;r.story.choiceSeen=0xffff;r.tension.phase='stalk';r.encounter.updated=true;r.encounter.owner='cruise';r.encounter.age=2;Object.assign(r.cart,{x:0,y:90});Object.assign(r.joe,{x:16,y:55,speed:7,seenAge:0});
   if(kind==='story'){r.story.cue=JOE_STORY_CUES[0];r.story.cueTime=6;}
   if(kind==='long'){r.story.cue='JOE: “'+Object.values(JOE_LINES).flat().reduce((a,b)=>a.length>b.length?a:b)+'”';r.story.cueTime=6;}
   if(kind==='reaction')r.events.push({type:'shortcut',time:r.time});
   __backNine.run=r;__backNine.observeDialogue();__backNine.render();await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();return r;
  };
  window.captionRead=()=>({banner:document.querySelector('#caption').textContent,sound:document.querySelector('#sound-caption').textContent});
 });
 for(const subtitles of [true,false])for(const soundCaptions of [false,true])for(const kind of ['story','reaction'])rows.push(await p.evaluate(async o=>{captionSetting('subtitles',o.subtitles);captionSetting('soundCaptions',o.soundCaptions);await captionStage(o.kind);return {...o,...captionRead()};},{subtitles,soundCaptions,kind}));
 if(baseline){fs.writeFileSync(out+'/before.json',JSON.stringify({rows,errors},null,2));assert(rows.some(r=>r.subtitles&&r.soundCaptions&&!r.banner));console.log(JSON.stringify({regressionObserved:true,rows}));return;}
 for(const row of rows){assert.equal(/^JOE:/.test(row.banner),row.subtitles,JSON.stringify(row));assert.equal(!!row.sound,row.soundCaptions);}
 const priorities=[];
 for(const captions of [false,true])for(const kind of ['windup','timber','impact','objective','search','relief','intercept','recovery','paused']){
  const row=await p.evaluate(async({kind,captions})=>{captionSetting('subtitles',true);captionSetting('soundCaptions',captions);const r=await captionStage();const initial=captionRead();
   if(kind==='windup'){r.joe.ram.phase='lineup';r.joe.ram.age=.8;r.encounter.owner='attack';}
   else if(kind==='timber'){r.courseFX.cue={...r.courseFX.cue,kind:'timber',age:.1,x:0,y:94};}
   else if(kind==='impact'){r.impact.age=.1;r.impact.damaged=true;}
   else if(kind==='objective'){r.message='Maintenance relay online · checkpoint saved.';r.messageTime=3;}
   else if(kind==='paused')r.mode='paused';
   else r.encounter.owner=kind;
   __backNine.render();await __backNine.whenPresented();const interrupted=captionRead();r.joe.ram.phase='none';r.encounter.owner='cruise';r.impact.age=99;r.courseFX.cue.age=99;r.messageTime=0;r.mode='driving';__backNine.render();await __backNine.whenPresented();return {kind,captions,initial,interrupted,after:captionRead()};
  },{kind,captions});assert.match(row.initial.banner,/^JOE:/);assert(!row.interrupted.banner.startsWith('JOE:'),kind);assert.equal(row.after.banner,'','Interrupted line cannot resume');priorities.push(row);
 }
 const layouts=[];
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]])for(const scale of [1,1.4]){
  await p.setViewportSize({width,height});await p.evaluate(async scale=>{captionSetting('subtitleSize',scale);await captionStage('long');},scale);
  const layout=await p.evaluate(()=>{const rect=id=>{const r=document.querySelector(id).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};return {caption:rect('#caption'),sound:rect('#sound-caption'),shell:rect('#game-shell'),objective:rect('.objective'),dashboard:rect('.dashboard')};});layouts.push({width,height,scale,...layout});await p.screenshot({path:`${out}/${tag}-${width}-${scale}.png`});
 }
 const graphics=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);const report={rows,priorities,layouts,graphics:{programs:graphics.programs,textures:graphics.textures},errors};fs.writeFileSync(`${out}/${tag}.json`,JSON.stringify(report,null,2));
 for(const l of layouts){assert(l.caption.y>=l.shell.y&&l.caption.bottom<=l.sound.y,'Caption/sound overlap '+JSON.stringify(l));assert(l.sound.bottom<l.dashboard.y,'Messages/dashboard overlap '+JSON.stringify(l));assert(l.caption.y>=l.objective.bottom,'Messages/objective overlap '+JSON.stringify(l));}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,tag,settings:rows.length,priorities:priorities.length,layouts:layouts.length,graphics:report.graphics,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
