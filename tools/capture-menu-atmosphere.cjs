const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const out=path.resolve(process.env.MENU_EVIDENCE||'output/menu-speckles-beauty');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:out,size:{width:1280,height:720}}}),page=await context.newPage();
  await page.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__preview={state,enterMenu,render};\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__preview,null,{timeout:120000});
  await page.evaluate(()=>{__preview.state.reducedMotion=false;__preview.enterMenu();__preview.render();document.activeElement.blur();});
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('#course-menu img')].map(i=>i.decode())));
  if(process.argv.includes('--cycle-chapters')){await page.waitForTimeout(1200);for(const id of ['back-nine','under-green','final-cut','night-order']){await page.evaluate(id=>RCChapterSelect.select(id),id);await page.waitForTimeout(1800);}}else await page.waitForTimeout(8500);await page.screenshot({path:path.join(out,'preview-1280.png')});
  const video=page.video();await context.close();const source=await video.path();
  execFileSync('ffmpeg',['-y','-sseof','-7','-i',source,'-t','6','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'grass-breeze.mp4')],{stdio:'pipe',windowsHide:true});
  console.log(path.join(out,'grass-breeze.mp4'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
