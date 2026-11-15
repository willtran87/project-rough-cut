const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),root='output/final-cut/paving-finish';
const source={before:{},current:{}};
for(const file of ['final-cut-scene.js','final-cut-surfaces.js']){source.before[file]=fs.readFileSync(`${root}/source/before-${file}`,'utf8');source.current[file]=fs.readFileSync(`web/${file}`,'utf8');}
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}),reports=[];try{
 for(const variant of ['before','current','current','before']){
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const [file,body]of Object.entries(source[variant]))await p.route('**/'+file,r=>r.fulfill({contentType:'text/javascript',body}));
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  for(const [name,x,y,yaw,pitch]of [['deck',-2,0,.2,.85],['pump',12,38,-Math.PI/2,.65]]){
   const result=await p.evaluate(async([name,x,y,yaw,pitch])=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,openingSeen:true,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:39,y:50,phase:'disabled'});Object.assign(r.player,{x,y,yaw,pitch});__finalCut.run=r;await advanceTime(0);
    const gl=document.querySelector('canvas').getContext('webgl2'),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),samples=[];
    for(let i=0;i<10;i++){const start=performance.now();__finalCut.draw();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(i>=3)samples.push(performance.now()-start);}
    samples.sort((a,b)=>a-b);const g=JSON.parse(render_game_to_text()).graphics;return {name,median:samples[3],max:samples[6],samples,render:[g.width,g.height],draws:g.draws,triangles:g.triangles,geometries:g.geometries,textures:g.textures};
   },[name,x,y,yaw,pitch]);reports.push({variant,...result});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({variant,software,views:reports.slice(-2)}));await p.close();
 }
 fs.writeFileSync(`${root}/profile-${software?'software':'hardware'}.json`,JSON.stringify({method:'Sequential ABBA fresh pages, saved pre-paving scene/surface modules versus current, identical current turf. Three warmup and seven frozen render/full RGBA readPixels samples per view. Includes readback; not sustained gameplay FPS or complete-device qualification.',software,reports},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
