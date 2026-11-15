// Paired fresh-page opening measurements. Candidate enabled through routing
// until a production decision is made; ordinary fixed-step inputs are retained.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/startup-candidate';fs.mkdirSync(out,{recursive:true});
const replace=(s,a,b)=>{assert(s.includes(a),a);return s.replace(a,b);};
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs'),{createRun,step}=await import('../web/under-green-sim.js');
 const tape=[];assert.equal(traverse({dodge:true,inputTape:tape}).mode,'complete');const runs=[];
 for(const [index,enabled]of [false,true,true,false].entries()){
  const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
   const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:1})));
   await p.route('**/software-frame-budget.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('tools/fixtures/software-frame-budget-startup-candidate.js','utf8')}));
   await p.route('**/under-green.js',route=>{
    let s=fs.readFileSync('web/under-green.js','utf8');s=replace(s,'function input(dt=1/60){','function input(dt=1/60){if(window.__openingInput)return window.__openingInput(run);');s=replace(s,'if(test)window.__underGreen={','if(true)window.__underGreen={');return route.fulfill({contentType:'application/javascript',body:s});
   });
   await p.route('**/under-green-scene.js',route=>{
    let s=fs.readFileSync('web/under-green-scene.js','utf8');s=replace(s,'scales:[.75,.625,.5,.375]}',`scales:[.75,.625,.5,.375],startupCalibration:${enabled}}`);
    s=replace(s,' return {draw,drainJoeFootsteps:',' window.__openingScene=()=>({frames,resolution:[canvas.width,canvas.height],budget:budget.stats(),captureBuffer});return {draw,drainJoeFootsteps:');return route.fulfill({contentType:'application/javascript',body:s});
   });
   const load=Date.now();await p.goto('http://127.0.0.1:4187/under-green.html');await p.waitForFunction(()=>window.__openingScene&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});const readyMs=Date.now()-load;await p.click('#primary');
   await p.evaluate(async tape=>{
    const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun();__underGreen.run.mode='playing';__underGreen.clearInput();
    const s=window.__opening={start:performance.now(),cursor:0,done:false,rows:[],resizes:[],lastScale:null};
    window.__openingInput=r=>{if(s.done||!['playing','aftermath'].includes(r.mode))return {};const row=tape[s.cursor++];if(!row)throw Error('Opening tape exhausted');return {...row.input,lookX:Math.atan2(Math.sin(row.yaw-r.player.yaw),Math.cos(row.yaw-r.player.yaw))};};
    const sample=()=>s.rows.push({wall:(performance.now()-s.start)/1000,seconds:__underGreen.run.elapsed,...__openingScene()});sample();s.sampler=setInterval(sample,1000);
    s.monitor=setInterval(()=>{const g=__openingScene(),r=__underGreen.run;if(g.budget.scale!==s.lastScale){s.resizes.push({wall:(performance.now()-s.start)/1000,seconds:r.elapsed,scale:g.budget.scale,frames:g.frames});s.lastScale=g.budget.scale;}
     if(r.elapsed>=12){sample();s.done=true;clearInterval(s.sampler);clearInterval(s.monitor);r.mode='paused';}
    },25);
   },tape);
   await p.waitForFunction(()=>__opening.done,null,{timeout:30000});
   const result=await p.evaluate(()=>({rows:__opening.rows,resizes:__opening.resizes,cursor:__opening.cursor,run:__underGreen.run}));
   const expected=createRun();expected.mode='playing';for(const row of tape.slice(0,result.cursor))step(expected,{...row.input,lookX:Math.atan2(Math.sin(row.yaw-expected.player.yaw),Math.cos(row.yaw-expected.player.yaw))});
   assert(Math.hypot(expected.player.x-result.run.player.x,expected.player.y-result.run.player.y)<.001);assert.equal(expected.elapsed,result.run.elapsed);assert.equal(expected.waterHits,result.run.waterHits);assert.deepEqual(errors,[]);assert(result.rows.every(r=>r.captureBuffer===false));
   await p.evaluate(()=>{__underGreen.run.mode='playing';advanceTime(0);});await p.screenshot({path:`${out}/opening-${index}.png`});
   const first=result.rows[0],last=result.rows.at(-1),six=result.rows.find(r=>r.wall>=6)||last;
   const row={index,enabled,readyMs,fps:(last.frames-first.frames)/(last.wall-first.wall),firstSixSecondsFps:(six.frames-first.frames)/(six.wall-first.wall),floorAt:result.resizes.find(r=>r.scale===.375)?.wall??null,rows:result.rows,resizes:result.resizes,cursor:result.cursor,positionError:Math.hypot(expected.player.x-result.run.player.x,expected.player.y-result.run.player.y),errors};runs.push(row);
   fs.writeFileSync(`${out}/report.json`,JSON.stringify({method:'ABBA fresh Chromium instances; production context; same ordinary walking tape prefix. Timing includes real scheduling, not deterministic stepping. Host variability remains; not full-route qualification.',runs},null,2));console.log(JSON.stringify({...row,rows:undefined,resizes:undefined}));
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
