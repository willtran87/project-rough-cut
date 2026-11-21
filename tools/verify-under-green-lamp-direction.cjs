const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),base='output/under-green/visual-upgrade-local',out=`${base}/pass50-direction/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
const fixtures=[['gallery-entry',0,8,0,.1],['gallery-reverse',0,15,Math.PI,.1],['crossing',0,19,0,-.05],['junction',0,33,0,.1],['deep-gallery',0,53,0,.1],['north-turn',0,72,0,.1],['bunker',-29.5,65,Math.PI,.15],['pump',-23.4,42,-1,.05],['pump-return',-15,46,Math.PI/2,.05],['range',12,35,Math.PI,.05],['keeper',12,19,Math.PI,.1],['keeper-desk',12,13.5,-2.4,.05]];
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[],audits=[];
try{for(const before of [true,false]){
 const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const part of ['scene','keeper-workspace','atmosphere','humidity','cast-shadow-scene','practical-lighting'])await p.route(`**/under-green-${part}.js`,route=>{
  const file=before?`${base}/pass50-source/under-green-${part}-before.js`:`web/under-green-${part}.js`;let s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
  if(part==='scene'){const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));s=s.replace(marker,' window.__direction={scene,renderer,camera,lamps};'+marker);}
  if(part==='atmosphere')s=s.replace(' const stats={wallRoots,',' window.__directionLenses={lenses,glows}; const stats={wallRoots,');
  if(part==='practical-lighting')s=s.replace(' return {\n  // Allows',' window.__directionSources=sources; return {\n  // Allows');
  return route.fulfill({contentType:'application/javascript',body:s});
 });
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 async function place(f,time=26.3,elapsed=0){await p.evaluate(async({f,time,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js'),r=createRun();const [name,x,y,yaw,pitch]=f;if(solid({x,y},.3))throw Error('Invalid camera '+name);r.mode='playing';r.time=time;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,time,elapsed});}
 async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:s.graphics});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
 async function audit(reduced=false){const report=await p.evaluate(async({before,reduced})=>{
  const T=await import('./vendor/three/three.module.js'),{dampLampLevel}=await import('./under-green-atmosphere.js'),{DRAIN_LAMP_IDS}=await import('./under-green-lamp-direction.js');
  const colors=new T.Color(),time=__underGreen.run.time,values=__direction.lamps.map((lamp,i)=>{
   const level=dampLampLevel(time,i,reduced),power=before?1:lamp.power,source=__directionSources[i],expected=new T.Color(lamp.color??(i%3===1?0x8ac9c3:0xffc27c)).multiplyScalar((.13+level*.87)*power);__directionLenses.lenses.getColorAt(i,colors);
   return {id:lamp.id,role:lamp.role,power:lamp.power??1,reach:lamp.reach??13,level,lensError:Math.max(...['r','g','b'].map(k=>Math.abs(colors[k]-expected[k]))),glowError:Math.abs(__directionLenses.glows[i].material.opacity-.3*level*power),sourceError:Math.max(...['r','g','b'].map(k=>Math.abs(source.uniform.color[k]-source.base[k]*source.power*level))),hueError:before?0:Math.max(...['r','g','b'].map(k=>Math.abs(__directionLenses.glows[i].material.color[k]-source.base[k])))};
  });return {before,time,reduced,values,ids:DRAIN_LAMP_IDS};
 },{before,reduced});assert.equal(report.values.length,17);if(!before)assert.deepEqual(report.values.map(v=>v.id).sort(),[...report.ids].sort());for(const v of report.values){assert.equal(v.reach,13);for(const k of ['lensError','glowError','sourceError','hueError'])assert(v[k]<1e-6,k);if(reduced)assert.equal(v.level,.72);}audits.push(report);return report;}
 for(const f of fixtures){await place(f);await shot(f[0]);}await audit();
 if(!before){
  for(const time of [0,6.1,8.2,53]){await place(fixtures[0],time);await audit();}
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const i of [2,10]){await place(fixtures[i]);await shot('responsive-'+fixtures[i][0]);}}
  await p.setViewportSize({width:2560,height:1600});await place(fixtures[2],49,49);await shot('flood');
  await place(fixtures[0]);const initial=await p.screenshot({type:'png'});for(let i=0;i<20;i++)await p.evaluate(async()=>{__underGreen.run.player.yaw+=.1;advanceTime(0);await __underGreen.whenPresented();});await place(fixtures[0]);assert(initial.equals(await p.screenshot({type:'png'})),'Lighting swims with camera');
  await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');await p.evaluate(()=>advanceTime(300));
  await p.keyboard.press('Escape');const frozen=await audit();await p.evaluate(()=>advanceTime(1500));assert.deepEqual(await audit(),frozen);
  await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[10]);await shot('reduced');await audit(true);
 }await p.close();
}
for(const a of rows.filter(r=>r.before)){const b=rows.find(r=>!r.before&&r.name===a.name);assert.deepEqual(a.player,b.player);assert.deepEqual(a.graphics.resolution,b.graphics.resolution);for(const k of ['draws','triangles','textures','programs'])assert.equal(a.graphics[k],b.graphics[k],k+' changed');assert.deepEqual(a.graphics.atmosphere.lightLevels,b.graphics.atmosphere.lightLevels);}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,audits,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,audits:audits.length}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
