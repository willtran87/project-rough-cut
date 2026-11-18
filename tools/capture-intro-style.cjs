const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{const out=path.resolve((process.env.INTRO_EVIDENCE||'output/intro-style')+'/preview');fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:out,size:{width:1280,height:720}}}),page=await context.newPage();
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__introCapture={state};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__introCapture&&RCIntroPresentation.stats().ready);await page.keyboard.press('Enter');
 await page.waitForFunction(()=>__introCapture.state.mode==='menu');await page.waitForTimeout(1500);await page.screenshot({path:out+'/menu.png'});
 const video=page.video();await context.close();execFileSync('ffmpeg',['-y','-sseof','-12','-i',await video.path(),'-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out+'/intro-to-menu.mp4'],{stdio:'pipe',windowsHide:true});console.log(out+'/intro-to-menu.mp4');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
