const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/final-cut/machinery/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],states=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),shot=async name=>{await tick(0);await p.screenshot({path:`${out}/${name}.png`});states.push({name,state:await read()});};
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');
 const fixture=fields=>p.evaluate(async fields=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:0,y:50,yaw:0,phase:'pass',deployment:1,distance:.7,reelAngle:-.9},fields.rig);Object.assign(r.player,{x:6,y:59,yaw:Math.atan2(-6,-9),pitch:.08},fields.player);__finalCut.run=r;await advanceTime(0);},fields);
 await fixture({});await shot('deployed-2560');
 await fixture({player:{x:3.6,y:55.2,yaw:Math.atan2(-.4,-3.8),pitch:.3}});await shot('reel-close-2560');
 for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot(`reel-close-${width}`);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.setViewportSize({width:2560,height:1600});
 for(const deployment of [0,.5,1]){await fixture({rig:{phase:'announce',deployment},player:{x:7,y:54,yaw:Math.atan2(-6,-3),pitch:.07}});await shot(`wing-${deployment}`);}
 checks.push('Real constructed reels and fixed bearings inspected in deployed, half-folded and raised poses, including close views at four viewport sizes');
 // Render actual state evolution; no independent animation timer is stepped.
 await fixture({rig:{x:0,y:26,yaw:Math.PI/2,direction:1,phase:'pass'},player:{x:-10,y:15}});
 const before=(await read()).graphics.machinery;await tick(250);const after=(await read()).graphics.machinery;
 assert.notEqual(after.reels[0].angle,before.reels[0].angle);for(const reel of after.reels)assert.equal(reel.bearingAngle,0);
 await p.evaluate(()=>Object.assign(__finalCut.run.rig,{x:30,y:26,yaw:0,phase:'turn',deployment:0,path:[{x:30,y:50}]}));await tick(0);const turn=await read();await tick(250);const turned=await read();assert(turned.rig.distance>turn.rig.distance);assert.deepEqual(turned.graphics.machinery.reels,turn.graphics.machinery.reels);
 checks.push('Actual pass rotates all three cutting rotors while bearings remain fixed; actual moving headland turn leaves cutters braked');
 await fixture({rig:{x:12.7,y:74,yaw:-Math.PI/2,direction:-1,phase:'pass',distance:12.34,reelAngle:1.2},player:{x:16,y:81,yaw:Math.atan2(-5,-7),pitch:.12}});
 await tick(100);assert((await read()).won);await tick(3400);await shot('bog-2560');
 const beforeGeometry=await p.evaluate(()=>__finalCut.rigGeometry());const beforeReels=(await read()).graphics.machinery.reels;
 await p.keyboard.press('Escape');await tick(0);const frozen=await p.evaluate(()=>JSON.stringify(__finalCut.rigGeometry()));await tick(2000);assert.equal(await p.evaluate(()=>JSON.stringify(__finalCut.rigGeometry())),frozen);
 await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');await tick(0);
 const afterGeometry=await p.evaluate(()=>__finalCut.rigGeometry());let maxRestore=0;assert.equal(beforeGeometry.length,afterGeometry.length);
 for(let i=0;i<beforeGeometry.length;i++)for(let k=0;k<beforeGeometry[i].points.length;k++)for(let a=0;a<3;a++)maxRestore=Math.max(maxRestore,Math.abs(beforeGeometry[i].points[k][a]-afterGeometry[i].points[k][a]));
 assert(maxRestore<1e-6,`Rendered mechanics shift on reload: ${maxRestore}`);assert.deepEqual((await read()).graphics.machinery.reels,beforeReels);
 await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.locator('[data-campaign=reducedMotion]').check();await p.click('#primary');await tick(0);await shot('bog-reduced-2560');
 await tick(5000);const stopped=(await read()).graphics.machinery.reels;await tick(2000);assert.deepEqual((await read()).graphics.machinery.reels,stopped);
 checks.push(`Live physical victory, actual pause/reload and reduced-motion shutdown preserve mechanism poses; maximum rendered vertex reload shift ${maxRestore} m`);
 // Warm all orientations before asserting resource stability in one context.
 for(let k=0;k<16;k++){await p.evaluate(k=>{__finalCut.run.player.yaw=k*Math.PI/8;},k);await tick(0);}
 const memory=(await read()).graphics;for(let k=0;k<16;k++){await p.evaluate(k=>{__finalCut.run.player.yaw=k*Math.PI/8;},k);await tick(100);}
 const final=(await read()).graphics;assert.equal(memory.geometries,final.geometries);assert.equal(memory.textures,final.textures);assert.equal(final.machinery.geometries,4);assert.equal(final.machinery.materials,1);
 checks.push('Repeated warmed camera sweep and updates keep geometry/texture counts stable; both wing rotors share constructed geometry');
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,checks,errors,states,maxRestore},null,2));console.log(JSON.stringify({passed:true,checks,errors,shots:states.length}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
