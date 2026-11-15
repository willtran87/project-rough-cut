const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/sign-art/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route('**/under-green-scene.js',route=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');s=s.replace(' return {draw,drainJoeFootsteps:',' window.__signAudit={scene,renderer,signArt,signGroups}; return {draw,drainJoeFootsteps:');return route.fulfill({contentType:'application/javascript',body:s});});
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__signAudit&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await page.click('#primary');await page.keyboard.press('Escape');
  async function place(f){await page.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=90;r.bypass=true;r.bypassAt=20;r.lessonCrossed=true;r.joe.phase='absent';Object.assign(r.player,{pitch:0,...f});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
  const fixtures=[{name:'gallery',x:0,y:12,yaw:0},{name:'crossing-close',x:0,y:17,yaw:0,pitch:.15},{name:'crossing-back',x:0,y:29,yaw:Math.PI,pitch:.2},{name:'pump',x:-20,y:40,yaw:-Math.PI/2},{name:'pump-control',x:-21.5,y:40,yaw:-Math.PI/2,pitch:.17},{name:'keeper',x:12,y:23,yaw:Math.PI}];
  for(const f of fixtures){await place(f);await page.screenshot({path:`${out}/${f.name}-2560.png`});views.push({name:f.name,...await page.evaluate(()=>{const g=JSON.parse(render_game_to_text()).graphics;return {resolution:g.resolution,draws:g.draws,textures:g.textures};})});}
  const signs=await page.evaluate(()=>__signAudit.signArt.stats());assert(signs.count>=10);for(const sign of signs.plates)for(const face of sign.faces)assert(face.inkWidth<=face.available,face.label+' text overflow');
  const arrow=signs.plates.find(p=>p.text.includes('→'));assert(arrow);assert(arrow.faces[1].label.includes('←'));
  const clearance=await page.evaluate(async()=>{const {solid,BOUNDS}=await import('./under-green-course.js'),poses=[];for(let y=BOUNDS.minY+1;y<BOUNDS.maxY;y+=2)for(let x=BOUNDS.minX+.5;x<BOUNDS.maxX;x+=1)if(!solid({x,y},.3))for(const height of [1.12,1.65])poses.push({x,y,height,yaw:0,pitch:0,fov:85,aspect:2560/1600});const results=__underGreen.inspectCameraClearance(poses);return {count:poses.length,hits:results.filter(v=>v.hits.length)};});assert.deepEqual(clearance.hits,[]);
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){await page.setViewportSize({width,height});await place(fixtures[1]);await page.screenshot({path:`${out}/crossing-${width}.png`});}
  // Source plates and actual lit material remain available for close review.
  const source=await page.evaluate(()=>{const images=[];__signAudit.scene.traverse(o=>{const map=o.material?.map;if(map?.image?.toDataURL&&o.material.name.includes('drain-sign:LOW FLOW'))images.push(map.image.toDataURL());});return images;});
  assert.equal(source.length,2);source.forEach((url,i)=>fs.writeFileSync(`${out}/crossing-source-${i}.png`,Buffer.from(url.split(',')[1],'base64')));
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,signs,views,clearance,errors},null,2));console.log(JSON.stringify({passed:true,software,signs:signs.count,views:views.length+3,clearance:clearance.count,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
