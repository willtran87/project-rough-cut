const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const stats=values=>{const a=values.slice().sort((x,y)=>x-y);return{samples:a.length,median:a[Math.floor(a.length/2)],p95:a[Math.floor(a.length*.95)],max:a.at(-1),over100:a.filter(x=>x>100).length};};
(async()=>{
 const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/back-nine-experience/construction-yield',results=[];
 for(const baseline of [true,false,false,true]){
  const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  try{
   const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(()=>{
    localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__responsiveness={input:[],frames:[],timers:[],running:true};
    addEventListener('mousemove',e=>{if(__responsiveness.running)__responsiveness.input.push(performance.now()-e.timeStamp);});
    let frameAt=performance.now(),timerAt=frameAt;const frame=()=>{if(!__responsiveness.running)return;const now=performance.now();__responsiveness.frames.push(now-frameAt);frameAt=now;requestAnimationFrame(frame);};requestAnimationFrame(frame);
    window.__responseTimer=setInterval(()=>{const now=performance.now();__responsiveness.timers.push(now-timerAt);timerAt=now;},16);
   });
   if(baseline)for(const name of ['back-nine-scene.js','course-render-preparation.js'])await p.route('**/'+name+'*',r=>r.fulfill({path:out+'/baseline-source/'+name}));
   const started=Date.now();await p.goto('http://127.0.0.1:4187/back-nine.html?test',{waitUntil:'domcontentloaded'});let stop=false;
   const input=(async()=>{let n=0;while(!stop){await p.mouse.move(100+n%100,100+(n++%20));await new Promise(r=>setTimeout(r,25));}})();
   try{await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});}finally{stop=true;await input;}
   const elapsed=Date.now()-started,metrics=await p.evaluate(()=>{__responsiveness.running=false;clearInterval(__responseTimer);return __responsiveness;});
   assert.deepEqual(errors,[]);assert(metrics.input.length>10);const row={baseline,elapsed,input:stats(metrics.input),frames:stats(metrics.frames),timers:stats(metrics.timers),errors};results.push(row);console.log(JSON.stringify({label,...row}));
   fs.writeFileSync(`${out}/${label}-responsiveness.json`,JSON.stringify({method:'Fresh Chromium processes in ABBA order; real mouse events every25ms after DOMContentLoaded; browser event dispatch delay, RAF gaps and16ms timer gaps throughout loading. No claim of OS/driver cold cache.',results},null,2));
  }finally{await b.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
