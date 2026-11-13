const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass27-budget/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],results=[];
 try{
  const p=await browser.newPage({viewport:{width:software?960:2560,height:software?600:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/under-green-scene.js',route=>{let source=fs.readFileSync('web/under-green-scene.js','utf8');const marker=' return {draw,inspectCastShadow:';assert(source.includes(marker));source=source.replace(marker,' window.__shadowBudget={renderer,scene,joeCastShadow};'+marker);return route.fulfill({contentType:'application/javascript',body:source});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__shadowBudget&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  for(const bay of ['entrance','spillway-landing','bunker-bank']){
   const result=await p.evaluate(async bay=>{
    const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');const r=createRun();r.mode='playing';r.time=26;r.elapsed=0;r.messageTime=0;r.view={fov:58,aspect:innerWidth/innerHeight};
    const f={entrance:{j:{x:0,y:8},p:{x:0,y:4,yaw:0}},'spillway-landing':{j:{x:0,y:56.8},p:{x:0,y:53.5,yaw:0}},'bunker-bank':{j:{x:-21.1,y:53.6},p:{x:-20.5,y:50.8,yaw:Math.atan2(-.6,2.8)}}}[bay];
    Object.assign(r.player,f.p,{pitch:-.32,grace:100});Object.assign(r.joe,f.j,{yaw:Math.PI,phase:'walk',age:0,speed:1,walk:.4,paceScale:1});settleWeapon(r,1/60);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);for(let i=0;i<6;i++){r.time+=.05;advanceTime(0);}await __underGreen.whenPresented();
    const {renderer,joeCastShadow,scene}=__shadowBudget,gl=renderer.getContext(),samples={off:[],on:[]};
    async function frame(on){joeCastShadow.setEnabled(on);const start=performance.now();advanceTime(0);const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timing timeout');await new Promise(resolve=>setTimeout(resolve,2));}gl.deleteSync(f);return performance.now()-start;}
    for(let i=0;i<6;i++){await frame(false);await frame(true);}
    for(let i=0;i<24;i++)for(const on of i%2?[true,false]:[false,true])samples[on?'on':'off'].push(await frame(on));
    const pixels=async on=>{await frame(on);const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return bytes;};
    const off=await pixels(false),offStats=JSON.parse(render_game_to_text()).graphics,on=await pixels(true),onStats=JSON.parse(render_game_to_text()).graphics;
    // The direct canvas path writes sRGB-encoded shader output into an RGBA8
    // target; fixed-function alpha blending acts on those encoded values.
    // Decoding before estimating alpha incorrectly reports excess opacity.
    let changed=0,brightened=0,maxOpacity=0,opacitySamples=0;
    for(let i=0;i<off.length;i+=4){const delta=Math.max(...[0,1,2].map(k=>Math.abs(off[i+k]-on[i+k])));if(delta>1){changed++;if([0,1,2].some(k=>on[i+k]>off[i+k]+1))brightened++;for(let k=0;k<3;k++)if(off[i+k]>20){opacitySamples++;maxOpacity=Math.max(maxOpacity,1-on[i+k]/off[i+k]);}}}
    // A deliberately disabled stencil is a control: overlapping actual limbs
    // must darken more than the normal union, proving the union does real work.
    const group=scene.getObjectByName('Joe practical-light floor silhouette'),material=group.children[0].material;material.stencilWrite=false;
    const stacked=await pixels(true);material.stencilWrite=true;let unionProtected=0;for(let i=0;i<on.length;i+=4)if(on[i]>stacked[i]+1||on[i+1]>stacked[i+1]+1||on[i+2]>stacked[i+2]+1)unionProtected++;
    await frame(true);
    const summarize=s=>{const a=[...s].sort((a,b)=>a-b);return {median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],samples:s};};
    return {bay,timing:{off:summarize(samples.off),on:summarize(samples.on)},pixels:{changed,brightened,maxOpacity,opacitySamples,unionProtected},offStats,onStats,stencilBits:gl.getParameter(gl.STENCIL_BITS),pose:__underGreen.inspectCastShadow()};
   },bay);
   fs.writeFileSync(out+'/'+bay+'-measurement.json',JSON.stringify(result,null,2));
   assert.equal(result.stencilBits,8);assert(result.pixels.changed>100);assert.equal(result.pixels.brightened,0);assert(result.pixels.unionProtected>0);assert(result.pixels.opacitySamples>0);assert(result.pixels.maxOpacity<result.onStats.joeCastShadow.opacity+.055);assert(result.pose.maxPoseError<1e-7);
   results.push(result);await p.screenshot({path:`${out}/${bay}.png`});fs.writeFileSync(out+'/progress.json',JSON.stringify({completed:results.map(r=>r.bay)}));
  }
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:!errors.length,software,results,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,software,results:results.map(r=>({bay:r.bay,off:r.timing.off.median,on:r.timing.on.median,pixels:r.pixels}))}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
