const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||`output/final-cut/visual-hero/${software?'software':'accepted'}`;
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');
 const probe=`window.__heroTires=()=>wheels.map((wheel,k)=>{const mesh=wheel.children.find(m=>m.name==='FinaleMoldedTire'),p=mesh.geometry.attributes.position;let maxWidth=0,maxRadius=0;for(let i=0;i<p.count;i++){maxWidth=Math.max(maxWidth,Math.abs(p.getX(i)));maxRadius=Math.max(maxRadius,Math.hypot(p.getY(i),p.getZ(i)));}return {id:RIG_WHEELS[k].id,vertices:p.count,maxWidth,maxRadius,widthLimit:(RIG_WHEELS[k].width+.04)/2,radiusLimit:RIG_WHEELS[k].treadRadius,geometry:mesh.geometry.uuid,material:mesh.material.uuid,registered:contactMeshes.some(c=>c.mesh===mesh&&c.id===RIG_WHEELS[k].id)};});`;
 assert(source.includes('await renderer.compileAsync(scene,camera);'));
 await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',probe+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:0,y:50,yaw:0,phase:'pass',age:2,deployment:1,speed:0});__finalCut.run=r;await advanceTime(0);});
 for(const [name,x,y,tx,ty,pitch]of [['front',0,55.5,0,50,-.05],['quarter',5.5,55.5,0,50,-.05],['rear',0,44,0,50,-.03],['hood',3.3,47.6,0,48.25,-.18],['wheel',3.9,51.55,1.83,51.55,.3],['joe',0,54,0,50,-.25]]){
  await p.evaluate(async({x,y,tx,ty,pitch})=>{Object.assign(__finalCut.run.player,{x,y,yaw:Math.atan2(tx-x,ty-y),pitch});await advanceTime(0);},{x,y,tx,ty,pitch});await p.screenshot({path:`${out}/${name}.png`});views.push({name,state:await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {player:s.player,graphics:s.graphics};})});
 }
 // View a real change in chassis/wheel pose without placing the player in its path.
 await p.evaluate(async()=>{Object.assign(__finalCut.run.player,{x:6.5,y:55,yaw:Math.atan2(-6.5,-5),pitch:0});await advanceTime(0);});
 await p.keyboard.down('a');await p.evaluate(()=>advanceTime(350));await p.keyboard.up('a');await p.screenshot({path:`${out}/motion.png`});
 const sizes=[];for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(0));sizes.push(await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {viewport:[innerWidth,innerHeight],render:[s.graphics.width,s.graphics.height],overflow:document.documentElement.scrollWidth>innerWidth};}));if(width===390)await p.screenshot({path:`${out}/portrait.png`});}
 const tires=await p.evaluate(()=>__heroTires());assert.equal(tires.length,4);assert.equal(new Set(tires.map(t=>t.geometry)).size,1);assert.equal(new Set(tires.map(t=>t.material)).size,4);
 for(const t of tires){assert(t.registered&&t.vertices>3000);assert(t.maxWidth<=t.widthLimit+1e-7);assert(t.maxRadius<=t.radiusLimit+1e-7);}
 for(let k=0;k<8;k++)await p.evaluate(async k=>{__finalCut.run.player.yaw=k*Math.PI/4;await advanceTime(0);},k);
 const before=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);
 for(let k=0;k<8;k++)await p.evaluate(async k=>{__finalCut.run.player.yaw=k*Math.PI/4;await advanceTime(0);},k);
 const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(before.geometries,after.geometries);assert.equal(before.textures,after.textures);
 assert.deepEqual(errors,[]);assert(sizes.every(s=>!s.overflow));fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,errors,views,sizes,tires,resources:{geometries:after.geometries,textures:after.textures,tires:after.tires}},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,errors,sizes,tires:after.tires}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

