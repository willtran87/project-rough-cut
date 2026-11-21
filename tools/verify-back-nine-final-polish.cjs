const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2],warp=process.argv.includes('--warp'),software=warp||process.argv.includes('--software'),softwareBrowser=process.argv.includes('--software-browser')?process.argv[process.argv.indexOf('--software-browser')+1]:undefined;fs.mkdirSync(out,{recursive:true});
const option=name=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:undefined;
(async()=>{const b=option('--cdp')?await chromium.connectOverCDP(option('--cdp')):await chromium.launch({headless:true,executablePath:softwareBrowser,args:warp?['--use-angle=d3d11-warp','--ignore-gpu-blocklist']:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' ['+m.location().url+']');});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));const loadStarted=Date.now();await p.goto(option('--url')||'http://127.0.0.1:4187/back-nine.html?test');await p.bringToFront();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});const loadingMs=Date.now()-loadStarted;await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const render=()=>p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
 // Optional steady-state qualification: retain the maximum debris pool and
 // frozen simulation while shader pipelines and the existing budget settle.
 // Keep every warmup cost in the report; do not count these as measured passes.
 const warmupFrames=process.argv.includes('--settle-budget')?60:0,warmup={cart:[],foot:[]};
 const settle=async name=>{for(let i=0;i<warmupFrames;i++)warmup[name].push(await p.evaluate(async()=>{await __backNine.whenPresented();const t=performance.now();__backNine.render();await __backNine.whenPresented();return performance.now()-t;}));};
 const shot=async name=>{await render();samples.push({name,state:await read()});await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:94});};
 const stage=async({x=0,y=298,health=55,cp=0,foot=false,yaw=0}={})=>p.evaluate(async a=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.checkpoint=a.cp;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=65535;r.panic.armed=false;Object.assign(r.cart,{x:a.x,y:a.y,yaw:a.yaw,health:a.health});Object.assign(r.joe,{x:35,y:50,speed:0});if(a.foot){r.cart.health=0;r.cart.x=35;r.cart.y=10;r.foot={x:a.x,y:a.y,yaw:a.yaw,viewYaw:a.yaw,viewPitch:.15,speed:0,onFoot:true,invulnerable:0};}__backNine.run=r;await advanceTime(0);},{x,y,health,cp,foot,yaw});
 // Real input drives the new analog meter through the existing finite charger.
 await stage();await p.keyboard.down('Space');await p.evaluate(()=>advanceTime(1700));await p.keyboard.up('Space');let s=await read();assert(s.cart.health>55&&s.service.remaining[0]<25);assert.equal(s.graphics.serviceMeters.controls[0].remaining,s.service.remaining[0]);await shot('charger-partial');
 await p.keyboard.down('Space');await p.evaluate(()=>advanceTime(2300));await p.keyboard.up('Space');s=await read();assert.equal(s.service.remaining[0],0);assert.equal(s.graphics.serviceMeters.controls[0].remaining,0);await shot('charger-empty');
 await stage({x:4.5,y:299,foot:true,yaw:-.25});await shot('charger-in-context');
 // Simultaneous destruction is an intentional maximum-pool stress fixture.
 // Normal route/strikes are verified separately with authoritative collisions.
 await stage({x:-29,y:443,health:100});await p.evaluate(()=>{const r=__backNine.run;Object.assign(r.joe,{x:-27,y:433,yaw:0,speed:14});r.tactics.floodUntil[1]=100;r.tactics.floodUntil[2]=100;for(const state of [...r.destruction.props,...Object.values(r.destruction.features)])Object.assign(state,{brokenAt:r.time,dx:.2,dy:1,power:1});r.destruction.serial=35;r.cart.speed=14;});
 await shot('combined-burst');s=await read();const warm={textures:s.graphics.textures,programs:s.graphics.programs};
 await settle('cart');const timings=[];for(let i=0;i<60;i++){
  const ms=await p.evaluate(async()=>{await __backNine.whenPresented();const t=performance.now();const r=__backNine.run;r.time+=1/60;r.cart.y+=.035;r.joe.y+=.035;__backNine.render();await __backNine.whenPresented();return performance.now()-t;});timings.push(ms);
 }
 await shot('combined-settling');s=await read();assert.equal(s.graphics.textures,warm.textures);assert.equal(s.graphics.programs,warm.programs);assert(s.graphics.breakFragments.wood+s.graphics.breakFragments.metal+s.graphics.breakFragments.leaves<=420);
 await p.evaluate(()=>__backNine.run.time+=2);await shot('combined-aftermath');assert.equal((await read()).graphics.breakFragments.dust,0);
 // Facing the pursuer includes Joe's complete model, the mouth/drive motion,
 // wet ground, wrecked cart and fresh debris in the same presented frame.
 await stage({x:-29,y:459,foot:true,yaw:Math.PI});await p.evaluate(()=>{const r=__backNine.run;Object.assign(r.cart,{x:-32,y:454,health:0});Object.assign(r.joe,{x:-27,y:449,yaw:0,speed:14});r.tactics.floodUntil[1]=r.tactics.floodUntil[2]=100;for(const state of [...r.destruction.props,...Object.values(r.destruction.features)])Object.assign(state,{brokenAt:r.time,dx:.2,dy:1,power:1});r.destruction.serial=35;});await shot('combined-foot-burst');
 await settle('foot');const footTimings=[];for(let i=0;i<60;i++){footTimings.push(await p.evaluate(async()=>{await __backNine.whenPresented();const t=performance.now(),r=__backNine.run;r.time+=1/60;r.foot.y+=.035;r.joe.y+=.035;__backNine.render();await __backNine.whenPresented();return performance.now()-t;}));}
 await shot('combined-foot-settling');s=await read();assert.equal(s.graphics.textures,warm.textures);assert.equal(s.graphics.programs,warm.programs);
 await p.keyboard.press('Escape');const frozen=JSON.stringify((await read()).graphics.mowerMouth);await p.evaluate(()=>advanceTime(500));assert.equal(JSON.stringify((await read()).graphics.mowerMouth),frozen);await p.click('#primary');
 for(const[width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('combined-'+width);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(17));s=await read();assert.equal(s.checkpoint,0);assert.equal(s.graphics.breakFragments.wood+s.graphics.breakFragments.metal+s.graphics.breakFragments.leaves,0);assert.equal(s.graphics.serviceMeters.controls[0].remaining,25);
 const ordered=timings.slice(10).sort((a,b)=>a-b),performance={median:ordered[Math.floor(ordered.length*.5)],p95:ordered[Math.floor(ordered.length*.95)],resolution:samples.find(s=>s.name==='combined-settling').state.graphics.resolution};
 const footSorted=footTimings.slice(10).sort((a,b)=>a-b),footPerformance={median:footSorted[Math.floor(footSorted.length*.5)],p95:footSorted[Math.floor(footSorted.length*.95)],resolution:samples.find(s=>s.name==='combined-foot-settling').state.graphics.resolution};
 const graphics=samples.find(s=>s.name==='combined-settling').state.graphics;
 assert.equal(graphics.software,software,'Requested renderer must actually be in use');
 if(warp)assert.match(graphics.gpu,/Microsoft Basic Render/i,'WARP test must not silently use hardware');
 else if(software)assert.match(graphics.gpu,/SwiftShader/i,'SwiftShader test must use the requested software driver');
 const performanceAcceptance={targetMs:60,passed:performance.median<60&&performance.p95<60&&footPerformance.median<60&&footPerformance.p95<60};
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:errors.length===0,software,warp,gpu:graphics.gpu,softwareBrowser:softwareBrowser||null,loadingMs,warmupFrames,warmup,performanceAcceptance,performance,footPerformance,timings,footTimings,samples,errors},null,2));console.log(JSON.stringify({passed:errors.length===0,software,warp,gpu:graphics.gpu,loadingMs,warmupFrames,performanceAcceptance,performance,footPerformance,errors}));
 assert.deepEqual(errors,[]);
 if(process.argv.includes('--require-budget'))assert(performanceAcceptance.passed,'Software frame budget failed (functional checks passed)');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
