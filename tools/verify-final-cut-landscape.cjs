const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const label=process.argv[2]||'current',out=`output/final-cut/landscape/${label}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:process.argv.includes('--software')?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 if(process.argv.includes('--baseline'))await p.route('**/final-cut-scene.js',async route=>{
  let source=fs.readFileSync('web/final-cut-scene.js','utf8');
  source=source.replace('const surfaceScales=finishCourseSurfaces(materials);','const surfaceScales={};');
  source=source.replace('const landscape=createFinalCutLandscape(scene);',`const landscape={stats:()=>({baseline:true}),dispose(){}};
   for(let i=0;i<42;i++){
    const x=(i%2?1:-1)*(39+(i%7)*2),y=(i*11)%125,h=6+(i%5)*1.4;cyl('wood',x,h/2,-y,.22,h);
    for(let k=0;k<3;k++)mesh('green',sphere,x+Math.sin(i+k)*1.5,h-k*.8,-y+Math.cos(i+k),2.4,2.8,2.4);
   }`);
  await route.fulfill({status:200,contentType:'text/javascript',body:source});
 });
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
 const positions=[['overlook',{x:-2.8,y:-2,yaw:.16,pitch:.04}],['shelter',{x:-3.8,y:13,yaw:-1.05,pitch:.08}],['east',{x:23,y:42,yaw:1.25,pitch:-.08}],['west',{x:-23,y:58,yaw:-1.55,pitch:-.12}],['road',{x:0,y:102,yaw:Math.PI,pitch:0}]];
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});
  for(const [name,pose]of positions){await p.evaluate(async pose=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun();r.mode='playing';Object.assign(r.player,pose);__finalCut.run=r;await advanceTime(0);},pose);
   await p.screenshot({path:`${out}/${name}-${width}.png`});const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));views.push({name,width,height,graphics:state.graphics});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
 }
 await p.setViewportSize({width:1280,height:720});
 const timing=[];
 for(const [name,pose]of positions.slice(0,4)){
  await p.evaluate(async pose=>{Object.assign(__finalCut.run.player,pose);await advanceTime(0);},pose);
  const samples=await p.evaluate(async()=>{const gl=document.querySelector('canvas').getContext('webgl2'),values=[];for(let i=0;i<35;i++){const start=performance.now();await advanceTime(0);gl.finish();if(i>=5)values.push(performance.now()-start);}return values;});samples.sort((a,b)=>a-b);timing.push({name,median:samples[15],p95:samples[28],samples});
 }
 const before=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);
 for(let i=0;i<24;i++)await p.evaluate(async i=>{__finalCut.run.player.yaw=i*Math.PI/12;await advanceTime(0);},i);
 const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(after.geometries,before.geometries);assert.equal(after.textures,before.textures);assert.deepEqual(errors,[]);
 if(!process.argv.includes('--baseline')){assert.equal(after.landscape.trees,42);assert.equal(after.landscape.batches,12);assert(after.landscape.nearestGeometryX>25.7);assert(after.landscape.triangles<22000);assert.equal(after.surfaceScales.stone,2);}
 fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,errors,views,timing,stable:{before,after},method:'Explicit visual-position fixtures, four viewports; 30 frozen forced-sync samples per view after five warmup frames. Includes RAF wait; not sustained gameplay FPS.'},null,2));console.log(JSON.stringify({passed:true,label,views:views.length,errors,timing:timing.map(({name,median,p95})=>({name,median,p95}))}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
