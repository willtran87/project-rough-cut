// Experimental full opaque depth pass. This file does not change runtime code.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=!process.argv.includes('--hardware'),out=`output/under-green/visual-pass85/depth-${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[];
try{const p=await b.newPage({viewport:{width:software?960:2560,height:software?600:1600}});p.on('pageerror',e=>errors.push(e.stack));
await p.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('output/under-green/visual-pass85/source/under-green-scene-before.js','utf8');s=s.replace(' return {draw,inspectCastShadow:',' window.__depth={renderer,scene,camera}; return {draw,inspectCastShadow:');s=s.replace('try{renderer.render(scene,camera);}','try{window.__depthPrepare?.();renderer.render(scene,camera);}');return r.fulfill({contentType:'application/javascript',body:s});});
await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__depth&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
await p.evaluate(()=>{const a=__depth,original=a.renderer.renderBufferDirect.bind(a.renderer),cache=new Map();a.enabled=false;a.depth=false;a.draws=0;
 a.renderer.renderBufferDirect=function(camera,scene,g,m,o,group){if(!a.depth)return original(camera,scene,g,m,o,group);
  if(m.transparent||m.opacity!==1||!m.depthWrite||!m.depthTest||m.alphaTest||m.alphaHash||m.alphaMap||m.clippingPlanes?.length||m.wireframe||m.side===2||m.blending!==1)return;
  let depth=cache.get(m);if(!depth){depth=m.clone();depth.colorWrite=false;depth.onBeforeCompile=(s,r)=>{m.onBeforeCompile(s,r);s.fragmentShader='void main(){gl_FragColor=vec4(0.);}';};depth.customProgramCacheKey=()=>m.customProgramCacheKey()+'-depth-experiment';cache.set(m,depth);}
  a.draws++;return original(camera,scene,g,depth,o,group);
 };
 window.__depthPrepare=()=>{a.draws=0;if(!a.enabled)return;a.depth=true;try{a.renderer.render(a.scene,a.camera);}finally{a.depth=false;}};
});
for(const [name,x,y,yaw,pitch,elapsed]of [['gallery',0,8,0,.1,0],['crossing',0,19,0,-.05,0],['keeper',12,13.5,-2.4,.05,0],['flood',0,8,0,-.18,49]]){
 await p.evaluate(async({x,y,yaw,pitch,elapsed})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw,pitch,elapsed});
 async function frame(enabled){return p.evaluate(async enabled=>{const a=__depth;a.enabled=enabled;const gl=a.renderer.getContext(),start=performance.now();advanceTime(0);const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;do{status=gl.clientWaitSync(f,0,0);if(status===gl.WAIT_FAILED)throw Error('fence failed');if(status===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));if(performance.now()-start>10000)throw Error('timeout');}while(status===gl.TIMEOUT_EXPIRED);gl.deleteSync(f);return {ms:performance.now()-start,draws:a.draws};},enabled);}
 for(let i=0;i<4;i++){await frame(false);await frame(true);}
 const samples=[[],[]];for(let n=0;n<16;n++)for(const i of n%2?[1,0]:[0,1])samples[i].push(await frame(!!i));
 const images=[];for(const enabled of [false,true]){await frame(enabled);images.push(await p.locator('canvas').screenshot({path:`${out}/${name}-${enabled?'on':'off'}.png`}));}
 const summarize=s=>{const v=s.map(x=>x.ms).sort((a,b)=>a-b);return {median:v[8],p95:v[15],samples:s};};const row={name,off:summarize(samples[0]),on:summarize(samples[1]),same:images[0].equals(images[1])};rows.push(row);console.log(JSON.stringify({name,off:row.off.median,on:row.on.median,same:row.same}));fs.writeFileSync(out+'/progress.json',JSON.stringify({rows,errors},null,2));
}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({experimental:true,software,rows,errors},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
