const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/signal-finish/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],results=[];
 try{
  for(const baseline of [true,false]){
   const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.route('**/under-green-fixture-finish.js',route=>{
    let s=fs.readFileSync(`${baseline?'output/under-green/visual-upgrade/pass13-baseline':'web'}/under-green-fixture-finish.js`,'utf8').replace(/\r\n/g,'\n');
    const at=s.indexOf('\n}\n\n//',s.indexOf('export function finishSignalHousing'));assert(at>0);
    s=s.slice(0,at)+"\n signal.updateMatrixWorld(true);(window.__housingBounds??=[]).push(new THREE.Box3().setFromObject(signal).toJSON?.()||(()=>{const b=new THREE.Box3().setFromObject(signal);return {min:b.min.toArray(),max:b.max.toArray()};})());"+s.slice(at);
    return route.fulfill({contentType:'application/javascript',body:s});
   });
   await p.route('**/under-green-scene.js',route=>{let s=fs.readFileSync(`${baseline?'output/under-green/visual-upgrade/pass13-baseline':'web'}/under-green-scene.js`,'utf8');s=s.replace(' return {draw,drainJoeFootsteps:',' window.__signalFinish={scene,camera,renderer,waterObjects,materials}; return {draw,drainJoeFootsteps:');return route.fulfill({contentType:'application/javascript',body:s});});
   await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__signalFinish&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.keyboard.press('Escape');
   const views=[];
   async function place(f){return p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),{WATERS}=await import('./under-green-course.js'),r=createRun(),w=WATERS.find(w=>w.id==='lesson');r.mode='playing';r.time=24+f.cycle-w.offset;r.joe.phase='absent';Object.assign(r.player,{x:0,y:18.1,yaw:0,pitch:.43,...f});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();return JSON.parse(render_game_to_text());},f);}
   for(const f of [{name:'low',cycle:.5},{name:'warning',cycle:5.5},{name:'surge',cycle:8},{name:'oblique',cycle:.5,x:1.3,y:18.7,yaw:-Math.PI/4,pitch:.43},{name:'rear',cycle:.5,y:21.9,yaw:Math.PI,pitch:.43}]){const state=await place(f);views.push({name:f.name,resolution:state.graphics.resolution});await p.screenshot({path:`${out}/${baseline?'before':'after'}-${f.name}-2560.png`});}
   const audit=await p.evaluate(()=>{const a=__signalFinish,rows=[];for(const w of a.waterObjects)for(const bank of w.signals)for(const m of bank){const pos=m.geometry.attributes.position,uv=m.geometry.attributes.uv;let maxError=0,minDepth=Infinity,maxDepth=-Infinity;for(let i=0;i<pos.count;i++){maxError=Math.max(maxError,Math.abs(uv.getX(i)-(.5+pos.getX(i)/.29)),Math.abs(uv.getY(i)-(.5+pos.getY(i)/.29)));minDepth=Math.min(minDepth,pos.getZ(i));maxDepth=Math.max(maxDepth,pos.getZ(i));}rows.push({maxError,minDepth,maxDepth});}return {lenses:rows,bounds:__housingBounds,texture:[a.materials.greenSignal.map.image.width,a.materials.greenSignal.map.image.height],graphics:JSON.parse(render_game_to_text()).graphics};});
   if(!baseline){assert(audit.lenses.length===96);assert(audit.lenses.every(v=>v.maxError<1e-6&&v.minDepth>=0&&v.maxDepth<=.012001));assert.deepEqual(audit.texture,[128,128]);
    for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place({name:'approach',cycle:.5,y:17,pitch:.12});await p.screenshot({path:`${out}/approach-${width}.png`});}
   }
   results.push({baseline,views,audit});await p.close();
  }
  const before=results[0].audit.bounds,after=results[1].audit.bounds;assert.equal(after.length,16);assert.equal(before.length,after.length);
  for(let i=0;i<before.length;i++)for(let a=0;a<3;a++){assert(after[i].min[a]>=before[i].min[a]-1e-6,'Housing extends old lower bound');assert(after[i].max[a]<=before[i].max[a]+1e-6,'Housing extends old upper bound');}
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,results,errors},null,2));console.log(JSON.stringify({passed:true,software,housings:after.length,lenses:results[1].audit.lenses.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
