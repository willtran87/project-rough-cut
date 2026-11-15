// A controlled second graphics client, not a claim about a particular user app.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
const out='output/startup-decode-20261107',args=['--use-angle=d3d11','--ignore-gpu-blocklist'];
(async()=>{
 const peer=await chromium.launch({headless:true,args}),probe=await peer.newPage({viewport:{width:640,height:360}});let game;
 try{
  await probe.setContent('<canvas width="640" height="360"></canvas>');
  await probe.evaluate(()=>{
   const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl2'),program=gl.createProgram();
   const shader=(type,text)=>{const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);gl.attachShader(program,s);};
   shader(gl.VERTEX_SHADER,'#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}');
   shader(gl.FRAGMENT_SHADER,'#version 300 es\nprecision highp float;uniform float phase;out vec4 color;void main(){color=vec4(fract(gl_FragCoord.xy/128.+phase),.3,1.);}');
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Companion shader failed');gl.useProgram(program);const phase=gl.getUniformLocation(program,'phase');
   window.__probe={frames:[],completed:[],running:true};let last,fence,start;
   function frame(now){if(!__probe.running)return;if(last)__probe.frames.push(now-last);last=now;
    if(fence){const status=gl.clientWaitSync(fence,0,0);if(status===gl.TIMEOUT_EXPIRED){requestAnimationFrame(frame);return;}__probe.completed.push(performance.now()-start);gl.deleteSync(fence);fence=null;}
    gl.uniform1f(phase,now/10000);for(let i=0;i<8;i++)gl.drawArrays(gl.TRIANGLES,0,3);start=performance.now();fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();requestAnimationFrame(frame);
   }requestAnimationFrame(frame);
  });
  const reports=[];
  for(const before of [true,false]){
   game=await chromium.launch({headless:true,args});const p=await game.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   if(before)for(const file of fs.readdirSync(out+'/before').filter(f=>f.endsWith('.js')))await p.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/'+file,'utf8')}));
   const source=fs.readFileSync((before?out+'/before':'web')+'/game.js','utf8');await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__load={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
   await probe.evaluate(()=>{__probe.frames=[];__probe.completed=[];});const start=Date.now();
   await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__load&&JSON.parse(render_game_to_text()).assets.course.ready);
   await p.evaluate(()=>{const t=__load,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;t.render();});
   await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
   const stats=await probe.evaluate(()=>{const summarize=a=>{const sorted=[...a].sort((a,b)=>a-b);return {samples:a.length,median:sorted[Math.floor(a.length*.5)],p95:sorted[Math.floor(a.length*.95)],max:Math.max(...a),over50:a.filter(t=>t>50).length};};return {raf:summarize(__probe.frames),gpuCompletion:summarize(__probe.completed)};});
   reports.push({label:before?'before':'after',pageThroughReadyMs:Date.now()-start,companion:stats,errors});await game.close();game=null;
  }
  fs.writeFileSync(out+'/companion.json',JSON.stringify({method:'Separate Chromium GPU client, 640x360 WebGL2, eight fullscreen draws per submitted frame; includes page load through course readiness',reports},null,2));console.log(JSON.stringify(reports,null,2));
 }finally{await game?.close();await peer.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
