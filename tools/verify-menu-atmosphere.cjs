const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
const out=(process.env.MENU_EVIDENCE||'output/menu-speckles-beauty')+'/lifecycle';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__atmosphere={state,enterMenu,render};\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__atmosphere,null,{timeout:120000});
  await page.evaluate(()=>{__atmosphere.state.reducedMotion=false;__atmosphere.enterMenu();__atmosphere.render();window.__counts={gpu:0,copies:0};const p=RCScene3D.present;RCScene3D.present=(...a)=>{__counts.gpu++;return p(...a);};const c=document.querySelector('.course-menu-art').getContext('2d'),d=c.drawImage.bind(c);c.drawImage=(...a)=>{__counts.copies++;return d(...a);};});
  const ready=()=>page.evaluate(()=>Promise.all([...document.querySelectorAll('#course-menu img')].map(i=>i.decode())));
  await ready();await page.waitForTimeout(2000);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
  const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
  const stats=()=>page.evaluate(()=>({...RCCourseMenu.atmosphereStats(),...__counts}));
  async function sample(name,moving){const a=await metrics(),before=await stats();await page.waitForTimeout(3000);const b=await metrics(),after=await stats();const result={name,taskMs:(b.TaskDuration-a.TaskDuration)*1000,layoutMs:(b.LayoutDuration-a.LayoutDuration)*1000,animationMs:after.time-before.time,gpu:after.gpu-before.gpu,copies:after.copies-before.copies,scheduled:after.scheduled};samples.push(result);assert.equal(result.gpu,0);assert.equal(result.copies,0);assert(moving?result.animationMs>2500:result.animationMs===0,JSON.stringify(result));assert.equal(after.scheduled,moving);assert.equal(after.playing,moving?after.particles:0);}
  for(const id of ['night-order','back-nine','under-green','final-cut']){
   await page.locator(`[data-chapter="${id}"]`).click();await ready();await page.waitForTimeout(250);
   assert.equal(await page.locator('.menu-grass,.chapter-atmosphere').count(),0);assert.equal((await stats()).particles,80);assert.equal((await stats()).driver,'webgl-points');
   await sample(id,true);await page.screenshot({path:`${out}/${id}-2560.png`});
  }
  await page.evaluate(()=>{Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>false});window.dispatchEvent(new Event('blur'));});await sample('unfocused-visible',false);assert(await page.locator('.menu-grass-speckles').isVisible());
  await page.evaluate(()=>{delete document.hasFocus;window.dispatchEvent(new Event('focus'));Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await sample('hidden',false);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);await sample('OS-reduced-motion',false);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{__atmosphere.state.reducedMotion=true;__atmosphere.render();});await sample('game-reduced-motion',false);
  await page.evaluate(()=>{__atmosphere.state.reducedMotion=false;__atmosphere.render();const d=document.createElement('dialog');d.id='atmosphere-test-dialog';document.body.append(d);d.showModal();});await page.waitForTimeout(100);assert.equal((await stats()).scheduled,false);
  await page.evaluate(()=>{const d=document.getElementById('atmosphere-test-dialog');d.close();d.remove();});await page.waitForTimeout(150);assert.equal((await stats()).active,true);
  await page.locator('[data-menu-action="1"]').click();assert.equal((await stats()).scheduled,false);await page.keyboard.press('Escape');await page.waitForTimeout(200);assert.equal((await stats()).active,true);
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>RCChapterSelect.select('night-order'));await ready();await page.waitForTimeout(200);
   const button=await page.locator('.course-menu-start').boundingBox();assert(button.y+button.height<=height);assert(await page.locator('#course-menu').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   const quiet=await page.evaluate(()=>{
    const canvas=document.querySelector('.menu-grass-canvas'),g=canvas.getContext('webgl'),program=g.getParameter(g.CURRENT_PROGRAM),location=g.getUniformLocation(program,'u_quietCount'),n=g.getUniform(program,location),w=canvas.width,h=canvas.height,rects=RCMenuGrassLayout.measure(document.querySelector('#course-menu'));
    const read=()=>{const pixels=new Uint8Array(w*h*4);g.clear(g.COLOR_BUFFER_BIT);g.drawArrays(g.POINTS,0,RCCourseMenu.atmosphereStats().particles);g.readPixels(0,0,w,h,g.RGBA,g.UNSIGNED_BYTE,pixels);return pixels;};
    const dim=read();g.uniform1i(location,0);const full=read();g.uniform1i(location,n);read();let inside=0,dimInside=0,outside=0,dimOutside=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=(y*w+x)*4+3,cy=h-1-y;if(rects.some(r=>x>r[0]+10&&x<r[2]-10&&cy>r[1]+10&&cy<r[3]-10)){inside+=full[a];dimInside+=dim[a];}else if(rects.every(r=>x<r[0]-45||x>r[2]+45||cy<r[1]-45||cy>r[3]+45)){outside+=full[a];dimOutside+=dim[a];}}
    return {regions:n,inside,insideRatio:dimInside/inside,outsideRatio:dimOutside/outside};
   });
   assert(quiet.regions>=10);assert(quiet.inside>0&&quiet.insideRatio<.4,JSON.stringify(quiet));assert(Math.abs(quiet.outsideRatio-1)<.01,JSON.stringify(quiet));samples.push({name:'text-protection-'+width,...quiet});
   await page.screenshot({path:`${out}/menu-${width}.png`});
  }
  await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(200);
  // Include intentionally dimmed particles over text; pixel protection is tested separately above.
  const sustained=[];for(let i=0;i<6;i++){const before=await stats();await page.waitForTimeout(5000);const after=await stats();const visible=await page.evaluate(()=>{const c=document.querySelector('.menu-grass-canvas'),g=c.getContext('webgl'),w=c.width,h=c.height,b=new Uint8Array(w*h*4);g.clear(g.COLOR_BUFFER_BIT);g.drawArrays(g.POINTS,0,RCCourseMenu.atmosphereStats().particles);g.readPixels(0,0,w,h,g.RGBA,g.UNSIGNED_BYTE,b);const seen=new Uint8Array(w*h);let count=0;for(let i=0;i<w*h;i++){if(seen[i]||b[i*4+3]<32)continue;count++;const stack=[i];seen[i]=1;while(stack.length){const q=stack.pop();for(const n of [q-1,q+1,q-w,q+w])if(n>=0&&n<w*h&&!seen[n]&&b[n*4+3]>=32){seen[n]=1;stack.push(n);}}}return count;});assert(after.time>before.time&&after.active);assert(visible>=30,'Visible stream thinned to '+visible);sustained.push({second:(i+1)*5,animationMs:after.time-before.time,visible});}await page.screenshot({path:out+'/sustained-1280.png'});
  const motion=await stats();await page.waitForTimeout(500);assert((await stats()).frames>motion.frames+20);
  // Recovery from a released graphics context must resume the same bounded pool.
  await page.evaluate(()=>{const g=document.querySelector('.menu-grass-canvas').getContext('webgl');window.__lose=g.getExtension('WEBGL_lose_context');__lose.loseContext();});await page.waitForTimeout(150);assert.equal((await stats()).active,false);await page.evaluate(()=>__lose.restoreContext());await page.waitForTimeout(500);assert.equal((await stats()).active,true);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({samples,sustained,errors},null,2));console.log(JSON.stringify({samples,sustained,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
