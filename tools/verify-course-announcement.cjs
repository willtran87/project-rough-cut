const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/first-impression';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true}),p=await browser.newPage();
 try{
  await p.goto('http://127.0.0.1:4187');
  const samples=await p.evaluate(async()=>{
   const {createCourseAnnouncement}=await import('./course-announcement.js');const bytes=await(await fetch('./assets/audio/course-secured.ogg')).arrayBuffer();const results=[];
   for(const side of [-.7,.7]){
    const c=new OfflineAudioContext(2,48000*4,48000),buffer=await c.decodeAudioData(bytes.slice(0));
    const pa=createCourseAnnouncement(c,c.destination,{load:async()=>buffer});await pa.ready;
    pa.update({arrival:{age:.73,lockAt:.55,phase:'latched'},active:true,clear:true,pan:side});
    const audio=await c.startRendering();results.push({side,duration:buffer.duration,channels:[0,1].map(i=>{const data=audio.getChannelData(i);let sum=0,peak=0,tail=0;for(let n=0;n<data.length;n++){sum+=data[n]*data[n];peak=Math.max(peak,Math.abs(data[n]));if(n>48000*3)tail=Math.max(tail,Math.abs(data[n]));}return {rms:Math.sqrt(sum/data.length),peak,tail};})});pa.dispose();
   }return results;
  });
  assert(samples[0].channels[0].rms>samples[0].channels[1].rms*2);assert(samples[1].channels[1].rms>samples[1].channels[0].rms*2);
  for(const s of samples){assert(s.duration>2&&s.duration<3);for(const c of s.channels){assert(c.peak<.35);assert(c.rms>.002);assert.equal(c.tail,0);}}
  await p.locator('#game').click();
  const realtime=await p.evaluate(async()=>{
    const {createCourseAnnouncement}=await import('./course-announcement.js');const c=new AudioContext();await c.resume();
    const pa=createCourseAnnouncement(c,c.destination);await pa.ready;const arrival={age:.73,lockAt:.55,phase:'latched'},start=c.currentTime;
    await new Promise(resolve=>{const step=()=>{arrival.age=.73+c.currentTime-start;pa.update({arrival,active:true,clear:true,pan:0});if(c.currentTime-start<3.1)requestAnimationFrame(step);else resolve();};step();});
    const result=pa.stats();pa.dispose();await c.close();return result;
  });assert.equal(realtime.starts,1);assert.equal(realtime.resumes,0);assert.equal(realtime.playing,false);
  fs.writeFileSync(out+'/announcement-audio.json',JSON.stringify({passed:true,samples,realtime},null,2));console.log(JSON.stringify({passed:true,samples,realtime}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
