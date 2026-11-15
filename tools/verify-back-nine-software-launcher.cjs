const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=path.resolve(process.argv[2]||'output/back-nine-software-launcher');
fs.mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const started=Date.now(),launcher=spawn(process.execPath,['tools/play-back-nine-software.mjs','--headless','--port','0','--profile',path.join(out,'profile')],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 let browser,info,launcherError='',exitCode;
 const exited=new Promise(resolve=>launcher.once('exit',code=>{exitCode=code;resolve(code);}));
 launcher.stderr.on('data',d=>launcherError+=d);
 try{
  info=await new Promise((resolve,reject)=>{
   let text='';const timeout=setTimeout(()=>reject(new Error('Launcher did not start: '+launcherError)),20000);
   launcher.once('error',reject);
   launcher.stdout.on('data',chunk=>{text+=chunk;if(text.includes('\n')){clearTimeout(timeout);try{resolve(JSON.parse(text.split('\n')[0]));}catch(e){reject(e);}}});
  });
  const active=path.join(info.profile,'DevToolsActivePort');
  for(let i=0;i<200&&(!fs.existsSync(active)||fs.statSync(active).mtimeMs<started);i++)await delay(100);
  const port=Number(fs.readFileSync(active,'utf8').split('\n')[0]);assert(port>0);
  const cdp='http://127.0.0.1:'+port;browser=await chromium.connectOverCDP(cdp);
  // One tested page only; the launcher's real opening page must not compete
  // with the chase benchmark in another tab.
  for(const context of browser.contexts())for(const page of context.pages())await page.goto('about:blank');
  const origin=new URL(info.url).origin;
  const checks=[];
  for(const [url,expected,type]of [
   ['/back-nine.html',200,'text/html'],['/back-nine.js',200,'application/javascript'],
   ['/raster-visibility.wasm',200,'application/wasm'],['/assets/models/joe-riding-pixel.glb',200,'model/gltf-binary'],
   ['/..%5cREADME.md',403,null],['/missing-file',404,null]
  ]){
   const response=await fetch(origin+url,{method:'HEAD'});assert.equal(response.status,expected,url);
   if(type)assert(response.headers.get('content-type').startsWith(type));
   assert.equal((await response.arrayBuffer()).byteLength,0);checks.push({url,status:response.status});
  }
  const run=spawn(process.execPath,['tools/verify-back-nine-final-polish.cjs',path.join(out,'gameplay'),'--warp','--settle-budget','--require-budget','--cdp',cdp,'--url',info.url+'?test'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  let log='';for(const stream of [run.stdout,run.stderr])stream.on('data',d=>{log+=d;process.stdout.write(d);});
  const code=await new Promise((resolve,reject)=>{run.on('error',reject);run.on('exit',resolve);});
  fs.writeFileSync(path.join(out,'gameplay.log'),log);
  fs.writeFileSync(path.join(out,'launcher.json'),JSON.stringify({info,checks,gameplayExit:code,launcherError},null,2));
  assert.equal(code,0,'The actual isolated software launcher must meet the full gameplay/budget suite');
 }finally{
  if(browser){try{const session=await browser.newBrowserCDPSession();await session.send('Browser.close');}catch{}await browser.close().catch(()=>{});}
  await Promise.race([exited,delay(10000)]);
  if(exitCode===undefined){if(info?.pid)try{process.kill(info.pid);}catch{}launcher.kill();}
 }
 assert.equal(launcherError,'');
 console.log('PASS: isolated launcher, local server, software renderer, gameplay, frame budget and shutdown');
})().catch(error=>{console.error(error);process.exitCode=1;});
