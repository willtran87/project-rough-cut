const fs=require('node:fs'),{chromium}=require('playwright');
const out='output/under-green/visual-pass93/preview';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 for(const version of ['before','masked','stone-film']){
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/under-green-ground-finish.js',r=>{let s=fs.readFileSync('output/under-green/visual-pass93/source/under-green-ground-finish-before.js','utf8');if(version!=='before')s=s.replace(/    \/\/ Thin saturated films[\s\S]*?specularStrength=max\(specularStrength,galleryFilm\*deposit.b\*\.42\*\(\.4\+\.6\*mudCover\)\);/,'');if(version==='stone-film')s=s.replace('mix(.18,1.,groundReflectWet)','mix(.18,.65,groundReflectWet)').replace('mix(18.,76.,groundReflectWet)','mix(18.,110.,groundReflectWet)');return r.fulfill({contentType:'application/javascript',body:s});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  for(const [name,x,y,yaw,pitch,elapsed]of [['floor',0,10,0,-.48,0],['flood',0,10,0,-.48,66],['entry',0,8,0,.1,0],['side',-3,14,-.6,-.35,0]]){
   await p.evaluate(async({x,y,yaw,pitch,elapsed})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();Object.assign(r,{mode:'playing',time:26.3,elapsed});r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw,pitch,elapsed});
   await p.screenshot({path:`${out}/${version}-${name}.jpg`,quality:87});
  }await p.close();
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify({errors},null,2));if(errors.length)throw Error(errors.join('\n'));console.log('PASS: three wet-floor finishes, four views each');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
