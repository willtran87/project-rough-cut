const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs');
const source=fs.readFileSync('web/final-cut-scene.js','utf8');
const oldTrees=`const landscape={stats:()=>({baseline:true}),dispose(){}};
 for(let i=0;i<42;i++){const x=(i%2?1:-1)*(39+(i%7)*2),y=(i*11)%125,h=6+(i%5)*1.4;cyl('wood',x,h/2,-y,.22,h);
 for(let k=0;k<3;k++)mesh('green',sphere,x+Math.sin(i+k)*1.5,h-k*.8,-y+Math.cos(i+k),2.4,2.8,2.4);}`;
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const reports=[];try{
 for(const variant of process.argv.includes('--brief')?['baseline','current','current','baseline']:['baseline','current','surfaces','trees','current','baseline']){
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/final-cut-scene.js',async route=>{
   let code=source;if(['baseline','trees'].includes(variant))code=code.replace('const surfaceScales=finishCourseSurfaces(materials);','const surfaceScales={};');
   if(['baseline','surfaces'].includes(variant))code=code.replace('const landscape=createFinalCutLandscape(scene);',oldTrees);
   await route.fulfill({status:200,contentType:'text/javascript',body:code});
  });
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const [name,pose]of [['overlook',{x:-2.8,y:-2,yaw:.16,pitch:.04}],['shelter',{x:-3.8,y:13,yaw:-1.05,pitch:.08}],['east',{x:23,y:42,yaw:1.25,pitch:-.08}],['west',{x:-23,y:58,yaw:-1.55,pitch:-.12}]]){
   const report=await p.evaluate(({pose})=>{Object.assign(__finalCut.run.player,pose);const gl=document.querySelector('canvas').getContext('webgl2'),samples=[],pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);for(let i=0;i<16;i++){const start=performance.now();__finalCut.draw();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(i>=4)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {median:samples[6],p95:samples[11],samples,graphics:JSON.parse(render_game_to_text()).graphics};},{pose});
   reports.push({variant,name,...report});
  }
  console.log(JSON.stringify({variant,errors,views:reports.slice(-4).map(({name,median,p95})=>({name,median,p95}))}));await p.close();
 }
 const output=process.argv[2]||'output/final-cut/landscape/profile.json';fs.mkdirSync(require('node:path').dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({method:'Same browser, sequential variants in report order (ABBA with --brief). Four warmup and 12 direct frozen draws with full RGBA readPixels, no RAF wait. 960x540 SwiftShader. Includes synchronous readback cost; not sustained gameplay FPS. Earlier gl.finish-only values did not block pending rasterization and are not GPU timing evidence.',reports},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
