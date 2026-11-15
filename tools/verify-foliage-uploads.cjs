const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/foliage-performance-20261107',reports=[];
 for(const before of [true,false]){
  const b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before)await p.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/pixel-world-props.js','utf8')}));
  await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__gpu=()=>({renderer,world,camera,sceneTarget});'}));
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  try{
   await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
   await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;RCSpatialControls.set('resolution',.5);s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.player,{x:-63,y:187,yaw:0,pitch:-.33});Object.assign(s.hole.joe,{x:100,y:690});t.render();});
   await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
   const rows=[];
   for(const [name,x,y,yaw,pitch]of [['pond',-63,187,0,-.33],['border',100,340,1.57,0],['opening',0,65,0,0]]){
    const row=await p.evaluate(async({name,x,y,yaw,pitch})=>{
     Object.assign(__perf.state.player,{x,y,yaw,pitch});__perf.render();await RCScene3D.whenPresented();
     const {renderer,world}=__gpu(),gl=renderer.getContext(),original=gl.bufferSubData,samples=[],cpu=[];let bytes=0,calls=0;const frameUploads=[];
     gl.bufferSubData=function(target,offset,data,srcOffset=0,length){if(target===gl.ELEMENT_ARRAY_BUFFER){bytes+=(length===undefined?data.length-srcOffset:length)*data.BYTES_PER_ELEMENT;calls++;}return original.apply(this,arguments);};
     try{for(let i=0;i<60;i++){__perf.state.player.y=y+i*.35;__perf.state.player.yaw=yaw+i*.002;const oldBytes=bytes,start=performance.now();__perf.render();cpu.push(performance.now()-start);await RCScene3D.whenPresented();samples.push(performance.now()-start);frameUploads.push(bytes-oldBytes);}}
     finally{gl.bufferSubData=original;}
     let indexBytes=0,wide=0,small=0;world.traverse(o=>{if(o.isMesh&&o.userData.visibilityParts){indexBytes+=o.geometry.index.array.byteLength;if(o.geometry.index.array.BYTES_PER_ELEMENT===2)small++;else wide++;}});
     samples.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);return {name,bytes,calls,frameUploads,indexBytes,small,wide,median:samples[30],p95:samples[57],max:samples[59],cpuP95:cpu[57],triangles:RCScene3D.stats().triangles};
    },{name,x,y,yaw,pitch});rows.push(row);console.log(JSON.stringify({before,...row,frameUploads:undefined}));
   }
   assert.deepEqual(errors,[]);reports.push({before,rows,errors});
  }finally{await b.close();}
 }
 for(let i=0;i<reports[0].rows.length;i++){const a=reports[0].rows[i],b=reports[1].rows[i];assert.equal(a.triangles,b.triangles);assert(b.bytes<a.bytes*.5,'Expected index upload reduction at '+a.name);assert(b.indexBytes<a.indexBytes);}
 fs.writeFileSync(out+'/index-upload-comparison.json',JSON.stringify({passed:true,reports},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
