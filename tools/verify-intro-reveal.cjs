const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const out=(process.env.INTRO_EVIDENCE||'output/intro-reveal')+'/reveal-checks';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__reveal={state,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__reveal&&RCIntroPresentation.stats().ready);
 await page.screenshot({path:out+'/gate.png'});
 const counts=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=1280;c.height=720;const g=c.getContext('2d',{willReadFrequently:true});
  const face=t=>{RCIntroPresentation.draw(g,t,{reducedMotion:false});return g.getImageData(500,50,280,290).data;};
  const hidden=face(.6);return [1.65,2.75,3.7,4.9].map(t=>{const pixels=face(t);let changed=0;for(let i=0;i<pixels.length;i+=4)if(Math.abs(pixels[i]-hidden[i])+Math.abs(pixels[i+1]-hidden[i+1])+Math.abs(pixels[i+2]-hidden[i+2])>15)changed++;return {time:t,changedFacePixels:changed};});
 });
 assert.equal(counts[0].changedFacePixels,0,'First machine cut must not reveal any of the face');
 assert(counts[1].changedFacePixels>100&&counts[1].changedFacePixels<7000,'Second cut must expose only a narrow eye glimpse');
 assert(counts[2].changedFacePixels>counts[1].changedFacePixels*2,'Third cut must enlarge the partial face reveal');
 assert(counts[3].changedFacePixels>counts[2].changedFacePixels*1.5,'Final breach must expose the face');
 for(const time of [1.65,2.36,2.75,3.36,3.7,4.42,4.9]){await page.evaluate(t=>{__reveal.state.manualTime=true;__reveal.state.mode='intro';__reveal.state.time=t;__reveal.state.transitionAlpha=0;__reveal.render();},time);await page.screenshot({path:out+'/beat-'+time+'.png'});}
 const motor=await page.evaluate(()=>[.6,1.26,1.8,2.32,2.9,3.32,3.9,4.36,4.9].map(t=>({time:t,...RCIntroPresentation.motor(t)})));
 for(const i of [1,3,5,7])assert(motor[i].level>motor[i-1].level*5,'Cut should have a distinct engine surge');assert.equal(motor[8].level,0,'Silence before the line');
 await page.route('**/intro-joe-*-cutout.webp',r=>r.abort());await page.reload();await page.waitForFunction(()=>window.__reveal&&window.RCIntroPresentation);await page.waitForTimeout(500);
 const safeLoading=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1280;c.height=720;const g=c.getContext('2d',{willReadFrequently:true});const first=RCIntroPresentation.draw(g,.6),a=g.getImageData(0,0,1280,720).data;const second=RCIntroPresentation.draw(g,5.8),b=g.getImageData(0,0,1280,720).data;return first&&second&&!RCIntroPresentation.stats().ready&&RCIntroPresentation.stats().phase==='concealed'&&a.every((v,i)=>v===b[i]);});
 assert(safeLoading,'Missing/loading portraits must remain concealed, never fall through to the old reveal');
 assert.deepEqual(errors,[]);const report={counts,motor,safeLoading,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
