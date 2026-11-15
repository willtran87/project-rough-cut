const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
const software=process.argv.includes('--software'),baseline=process.argv.includes('--baseline'),ablate=process.argv.includes('--ablate');
const out=`output/final-cut/runtime-performance/${software?'software':'native'}-${baseline?'before':'after'}`;fs.mkdirSync(out,{recursive:true});
const hook=`window.__renderProbe={renderer,scene,gl,camera,moonlight,headlights,rig};`;
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
try{const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let source=fs.readFileSync((baseline?'output/final-cut/runtime-performance/baseline/':'web/')+'final-cut-scene.js','utf8');
 source=source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);');
 await page.route('**/final-cut-scene.js*',r=>r.fulfill({contentType:'text/javascript',body:source}));
 if(baseline)await page.route('**/final-cut.js?*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('output/final-cut/runtime-performance/baseline/final-cut.js','utf8')}));
 await page.goto('http://127.0.0.1:4187/final-cut.html?test');await page.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await page.evaluate(()=>advanceTime(0));const reports=[];
 for(const pose of ['overlook','shelter','machine','collapse']){
 await page.evaluate(async pose=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun(pose==='overlook'?{}:pose==='collapse'?{checkpoint:2,ending:{age:4}}:{checkpoint:1});r.mode=pose==='collapse'?'aftermath':'playing';
 if(pose!=='overlook'&&pose!=='collapse')Object.assign(r.rig,{x:-12,y:50,yaw:Math.PI/2,direction:1,phase:'pass',deployment:1});
 const positions={shelter:{x:10,y:40,yaw:Math.PI,pitch:.35},machine:{x:-2,y:45,yaw:Math.atan2(-10,5),pitch:.08},collapse:{x:16,y:81,yaw:Math.atan2(-4,-7),pitch:.12}};if(positions[pose])Object.assign(r.player,positions[pose]);__finalCut.run=r;await advanceTime(0);},pose);
 const data=await page.evaluate(async ablate=>{const {renderer,gl,moonlight,headlights}=__renderProbe,reports=[];const pixel=new Uint8Array(4);const modes=ablate?['normal','no-moon-shadow','no-shadows','normal']:['normal'];
 for(const mode of modes){const times=[],cpu=[];for(let i=0;i<22;i++){const r=__finalCut.run;r.time+=1/60;r.rig.distance+=.02;r.rig.reelAngle+=.1;
 const original=renderer.render.bind(renderer);renderer.render=(scene,camera)=>{if(mode==='no-moon-shadow')moonlight.shadow.needsUpdate=false;if(mode==='no-shadows')renderer.shadowMap.enabled=false;return original(scene,camera);};const start=performance.now();__finalCut.draw();const submitted=performance.now();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);const end=performance.now();renderer.render=original;renderer.shadowMap.enabled=true;
 if(i>=6){times.push(end-start);cpu.push(submitted-start);}await new Promise(requestAnimationFrame);}
 times.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const g=JSON.parse(render_game_to_text()).graphics;reports.push({mode,median:times[8],p95:times[15],cpuMedian:cpu[8],draws:g.draws,triangles:g.triangles,width:g.width,height:g.height});}return reports;},ablate);
 await page.evaluate(()=>__finalCut.draw());await page.screenshot({path:`${out}/${pose}.png`});reports.push({pose,data});console.log(JSON.stringify(reports.at(-1)));
 }assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({reports,errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
