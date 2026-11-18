const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const out=(process.env.INTRO_EVIDENCE||'output/intro-dread')+'/reveal-checks';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__dread={state,render,updateAudio,audio:()=>({filter:motorOcclusionFilter?.frequency.value,gain:motorGain?.gain.value})};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__dread&&RCIntroPresentation.stats().ready);await page.screenshot({path:out+'/gate.png'});await page.keyboard.press('Enter');await page.evaluate(()=>__dread.state.manualTime=true);
 const visual=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=1280;c.height=720;const g=c.getContext('2d',{willReadFrequently:true});
  const draw=t=>{RCIntroPresentation.draw(g,t,{reducedMotion:false});return g.getImageData(500,50,280,290).data;};const hidden=draw(.1);
  const counts=[1.52,2.48,4.4,5.55].map(t=>{const data=draw(t);let changed=0;for(let i=0;i<data.length;i+=4)if(Math.abs(data[i]-hidden[i])+Math.abs(data[i+1]-hidden[i+1])+Math.abs(data[i+2]-hidden[i+2])>15)changed++;return {time:t,changed};});
  const eye=t=>{draw(t);const a=g.getImageData(600,157,35,25).data;let light=0;for(let i=0;i<a.length;i+=4)light+=a[i]+a[i+1]+a[i+2];return light/(a.length/4);};
  const before=eye(2.48),withdrawn=eye(3.05);
  draw(8.32);const a=g.getImageData(0,0,1280,720).data;draw(8.7);const b=g.getImageData(0,0,1280,720).data;
  draw(5.9);const neutral=RCIntroPresentation.stats().pose;draw(6.4);const grin=RCIntroPresentation.stats().pose;
  return {counts,before,withdrawn,stillHold:a.every((v,i)=>v===b[i]),neutral,grin};
 });
 assert.equal(visual.counts[0].changed,0);assert(visual.counts[1].changed>100&&visual.counts[1].changed<8000);assert(visual.counts[2].changed>visual.counts[1].changed*2);assert(visual.counts[3].changed>visual.counts[2].changed*1.5);assert(visual.withdrawn<visual.before*.8,'Retreat should darken the eye glimpse');assert(visual.stillHold);assert.equal(visual.neutral,1);assert.equal(visual.grin,2);
 for(const t of [.9,1.8,2.48,3.05,3.88,4.4,5.55,5.78,6.16,6.75,8.55,9.4]){await page.evaluate(t=>{__dread.state.mode='intro';__dread.state.time=t;__dread.state.transitionAlpha=0;__dread.state.subtitles=true;__dread.render();},t);await page.screenshot({path:out+'/beat-'+t+'.png'});}
 const motor=await page.evaluate(()=>[.5,2.5,3.88,4.1,5.25,5.8,8.55].map(t=>({t,...RCIntroPresentation.motor(t)})));assert(motor[0].cutoff<motor[1].cutoff);assert(motor[2].hz<motor[3].hz);assert.equal(motor[5].level,0);assert.equal(motor[6].level,0);
 const endBeat=await page.evaluate(async()=>{__dread.state.stingerPlayed=false;__dread.state.mode='intro';__dread.state.time=8.55;await advanceTime(17);const silent=!__dread.state.stingerPlayed&&__dread.state.mode==='intro';__dread.state.time=8.91;await advanceTime(17);return {silent,stingerAtHandoff:__dread.state.stingerPlayed};});assert(endBeat.silent&&endBeat.stingerAtHandoff);
 const audio=[];for(const t of [.5,5.55]){await page.evaluate(t=>{__dread.state.mode='intro';__dread.state.time=t;__dread.updateAudio();},t);await page.waitForTimeout(400);audio.push(await page.evaluate(()=>__dread.audio()));}assert(audio[0].filter<700,'Grass must muffle actual audio filter');assert(audio[1].filter>5500);assert(audio[1].gain<.0001);
 await page.route('**/intro-joe-*-cutout.webp',r=>r.abort());await page.reload();await page.waitForFunction(()=>window.__dread&&window.RCIntroPresentation);await page.waitForTimeout(500);
 const safeLoading=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1280;c.height=720;const g=c.getContext('2d',{willReadFrequently:true});RCIntroPresentation.draw(g,.6);const a=g.getImageData(0,0,1280,720).data;RCIntroPresentation.draw(g,6.75);const b=g.getImageData(0,0,1280,720).data;return !RCIntroPresentation.stats().ready&&a.every((v,i)=>v===b[i]);});assert(safeLoading);assert.deepEqual(errors,[]);
 const report={visual,motor,audio,endBeat,safeLoading,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
