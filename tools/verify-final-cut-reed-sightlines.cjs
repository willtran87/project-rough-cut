const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/final-cut/visual-reeds/sightlines';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],cases=[];p.on('pageerror',e=>errors.push(e.message));
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',route=>route.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);','window.__reedSight={hide:v=>{rig.visible=!v;scene.traverse(o=>{if(o.isLight&&o.castShadow)o.shadow.needsUpdate=true;});}};await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__reedSight&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 for(const entry of ['west','east','north','south'])for(const near of [false,true])for(const offset of [-1,0,1])for(const crouch of [false,true]){
  const name=`${entry}-${near?'near':'far'}-${offset+1}-${crouch?'low':'standing'}`;
  const state=await p.evaluate(async({entry,near,offset,crouch})=>{
   const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js'),{AMBUSH_CORRIDOR_X}=await import('./final-cut-route-layout.js');const vertical=['north','south'].includes(entry),r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';r.time=.5;
   const from=vertical?{x:AMBUSH_CORRIDOR_X,y:entry==='north'?85:31}:{x:entry==='west'?-30:30,y:50},to=vertical?{x:AMBUSH_CORRIDOR_X,y:entry==='north'?31:85}:{x:-from.x,y:50};
   const x=vertical?AMBUSH_CORRIDOR_X+(offset<0?-4.2:offset*1.8):(entry==='west'?-1:1)*(near?24:10),y=vertical?(entry==='north'?(near?78:65):(near?38:48)):50+offset*7;
   Object.assign(r.player,{x,y,yaw:Math.atan2(from.x-x,from.y-y),pitch:0,crouch});Object.assign(r.rig,{...from,yaw:Math.atan2(to.x-from.x,to.y-from.y),phase:'announce',age:.5,deployment:0,attack:{entry,from,to,axis:vertical?'y':'x'}});__finalCut.run=r;__reedSight.hide(false);await advanceTime(0);return {entry,near,offset,crouch,player:r.player,rig:{x:r.rig.x,y:r.rig.y,yaw:r.rig.yaw}};
  },{entry,near,offset,crouch});
  const rig=await p.screenshot();await p.evaluate(()=>{__reedSight.hide(true);__finalCut.draw();});const empty=await p.screenshot(),identical=rig.equals(empty),hash=b=>createHash('sha256').update(b).digest('hex');
  if(!identical||near&&offset===0&&!crouch){fs.writeFileSync(`${out}/${name}-rig.png`,rig);if(!identical)fs.writeFileSync(`${out}/${name}-empty.png`,empty);}
  cases.push({name,...state,identical,rigHash:hash(rig),emptyHash:hash(empty)});
 }
 assert.deepEqual(errors,[]);const passed=cases.every(c=>c.identical);fs.writeFileSync(out+'/report.json',JSON.stringify({passed,errors,cases,method:'48 fixed announce-state sightlines from shared course coordinates. All casting-light shadow maps are invalidated after the rig visibility toggle so cached shadows cannot mask an indirect silhouette. Exact PNG bytes and SHA256 are compared in memory; identical bytes prove identical pixels. Only four representative views and any failed pairs are retained.'},null,2));console.log(JSON.stringify({passed,errors,cases:cases.length,failures:cases.filter(c=>!c.identical).map(c=>c.name),out}));if(!passed)process.exitCode=1;
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
