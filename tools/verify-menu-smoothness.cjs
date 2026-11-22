const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const root=process.env.MENU_EVIDENCE||'output/menu-speckles-beauty';
const baseline=false,out=root+'/'+(baseline?'before':'after');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__smooth={state,enterMenu,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__smooth,null,{timeout:120000});
 await page.evaluate(()=>{__smooth.state.reducedMotion=false;__smooth.enterMenu();__smooth.render();window.__copies=0;const c=document.querySelector('.course-menu-art').getContext('2d'),d=c.drawImage.bind(c);c.drawImage=(...a)=>{__copies++;return d(...a);};});
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('#course-menu img')].map(e=>e.decode())));await page.waitForTimeout(1500);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 let paints=0,layers=[];cdp.on('LayerTree.layerPainted',()=>paints++);cdp.on('LayerTree.layerTreeDidChange',e=>layers=e.layers||[]);
 const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
 const samples=[];
 for(let i=0;i<3;i++){const a=await metrics(),p=paints,c=await page.evaluate(()=>__copies);await page.waitForTimeout(3000);const b=await metrics();samples.push({taskMs:(b.TaskDuration-a.TaskDuration)*1000,layoutMs:(b.LayoutDuration-a.LayoutDuration)*1000,styleMs:(b.RecalcStyleDuration-a.RecalcStyleDuration)*1000,paints:paints-p,copies:(await page.evaluate(()=>__copies))-c});}
 await cdp.send('LayerTree.enable');await page.waitForTimeout(500);const paintStart=paints;await page.waitForTimeout(1000);const observedPaints=paints-paintStart;
 const smooth=await page.evaluate(()=>new Promise(resolve=>{const el=document.querySelector('.menu-grass-speckles i'),xs=[];let previous;function frame(t){const x=el?new DOMMatrixReadOnly(getComputedStyle(el).transform).m41:RCCourseMenu.atmosphereStats().time;if(previous!==undefined)xs.push({dt:t-previous,x});previous=t;if(xs.length<60)requestAnimationFrame(frame);else resolve(xs);}requestAnimationFrame(frame);}));
 const changed=smooth.slice(1).filter((v,i)=>Math.abs(v.x-smooth[i].x)>.001).length;
 const reasons=[];{for(const l of layers.filter(l=>l.width<=20&&l.height<=10).slice(0,5)){reasons.push(await cdp.send('LayerTree.compositingReasons',{layerId:l.layerId}));}assert(changed>45,'Too few interpolated frames: '+changed);assert(samples.every(s=>s.copies===0&&s.paints===0&&s.layoutMs===0),JSON.stringify(samples));}
 await page.evaluate(()=>{Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>false});window.dispatchEvent(new Event('blur'));});await page.waitForTimeout(200);
 const getPosition=()=>page.evaluate(()=>{const e=document.querySelector('.menu-grass-speckles i');return e?getComputedStyle(e).transform:RCCourseMenu.atmosphereStats().time;});const before=await getPosition(),p=paints;await page.waitForTimeout(500);assert.equal(await getPosition(),before);const pausedPaints=paints-p;
 assert.deepEqual(errors,[]);const report={baseline,samples,changedFrames:changed,totalFrames:59,pausedPaints,observedPaints,reasons,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
