const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/render-followup-20261107/visibility';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/pixel-world-props.js','utf8').replace('if(cullValid&&lastCullProjection.equals(cullProjection))return;','if(false)return;').replace('let visible=cullFrustum.intersectsBox(part.bounds);','let visible=window.__allParts||cullFrustum.intersectsBox(part.bounds);').replace('if(visible&&solidOcclusion.hidden(part.bounds))','if(!window.__allParts&&visible&&solidOcclusion.hidden(part.bounds))')}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__visibility={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__visibility&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{RCSpatialControls.set('resolution',.5);const t=__visibility,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.hole.elapsed=1;s.time=1;Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  for(const [name,x,y,yaw,pitch] of [['opening',0,65,0,0],['entrance',0,12,0,0],['hedge-edge',-28,110,.6,-.1],['hedge-rear',-28,150,2.4,-.2],['look-down',0,100,0,-.4],['border',100,340,1.57,0],['shed',-18,684,0,0],['rear',0,65,Math.PI,0]]){
   await p.evaluate(v=>Object.assign(__visibility.state.player,v),{x,y,yaw,pitch});
   let full,reduced,difference;
   for(const all of [true,false]){
    const capture=await p.evaluate(async all=>{__allParts=all;__visibility.render();await RCScene3D.whenPresented();const c=document.getElementById('game'),gl=c.getContext('webgl2'),pixels=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let changed=0,maxDelta=0,total=0;if(all)window.__fullPixels=pixels;else for(let i=0;i<pixels.length;i++){const d=Math.abs(pixels[i]-__fullPixels[i]);if(d)changed++;maxDelta=Math.max(maxDelta,d);total+=d;}return {changed,maxDelta,mean:total/pixels.length,triangles:RCScene3D.stats().triangles};},all);
    if(all)full=capture.triangles;else {reduced=capture.triangles;difference=capture;}
    await p.screenshot({path:out+'/'+name+(all?'-full':'-culled')+'.png'});
   }
   const {changed,maxDelta,mean}=difference;views.push({name,full,reduced,changed,maxDelta,mean});
   assert.equal(changed,0,`${name}: culling changed visible pixels (${mean})`);
   if(process.argv.includes('--timing')&&['opening','border'].includes(name)){
    const timing=[];
    // Alternate both orders in one warmed process to limit driver/load bias.
    for(const all of [true,false,false,true])timing.push(await p.evaluate(async ({all,moving})=>{
     const player=__visibility.state.player,origin={...player};
     __allParts=all;__visibility.render();await RCScene3D.whenPresented();const samples=[];
     for(let i=0;i<20;i++){if(moving){player.y=origin.y+i*.35;player.yaw=origin.yaw+i*.002;}const start=performance.now();__visibility.render();await RCScene3D.whenPresented();samples.push(performance.now()-start);}
     Object.assign(player,origin);samples.sort((a,b)=>a-b);return {all,moving,median:samples[10],p95:samples[19]};
    },{all,moving:process.argv.includes('--moving')}));
    views.at(-1).timing=timing;
   }
  }
  assert.deepEqual(errors,[]);const result={passed:true,checks:['Eight views compare full and compacted geometry in the same scene'],views,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
