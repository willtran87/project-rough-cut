const fs=require('node:fs'),assert=require('node:assert/strict');
const label=process.argv.includes('--software')?'software':'hardware',root=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/soak';
const r=JSON.parse(fs.readFileSync(`${root}/${label}.json`,'utf8')),samples=r.samples;
const audioVoiceCapacity=r.audioVoiceCapacity??9; // Preserve historical single-water-source reports.
assert([9,16].includes(audioVoiceCapacity),'Unknown audio graph budget');
const warmed=samples.filter(s=>s.completed>0);assert(warmed.length>=2,'Need repeated samples after a complete route');
const first=warmed[0],last=samples.at(-1),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const percentile=(a,q)=>{const s=a.slice().sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(s.length*q))]||0;};
const raf=warmed.flatMap(s=>s.raf),heapGrowth=last.heap.usedSize-first.heap.usedSize;
const produced=warmed.slice(1).map((s,i)=>({start:warmed[i].wall,end:s.wall,frames:s.graphics.frames-warmed[i].graphics.frames,fps:(s.graphics.frames-warmed[i].graphics.frames)/(s.wall-warmed[i].wall)}));
const requestedView=r.viewport&&r.preferences?{viewport:r.viewport,preferences:r.preferences}:null;
const ceiling=requestedView?(()=>{const v=r.viewport,scale=Math.min(1,(label==='software'?960:1600)/v.width)*r.preferences.resolution;return [Math.round(v.width*scale),Math.round(v.height*scale)];})():null;
const checks={
 allRoutes:new Set(r.result.completed.map(s=>s.scenario)).size===4,
 routeOutcomes:r.result.completed.every(s=>s.mode==='complete'&&s.error<.001&&(s.expected
  ? s.expected.mode==='complete'&&s.waterHits===s.expected.waterHits&&Number.isFinite(s.expected.seconds)&&Math.abs(s.seconds-s.expected.seconds)<1/60
  : s.waterHits===0)), // Historical reports lack independently verified outcome contracts.
 productionContext:samples.every(s=>s.graphics.captureBuffer===false),
 resourcesStable:warmed.every(s=>same(s.resources,first.resources)),
 heapBounded:heapGrowth<5*1048576,
 audioStable:samples.every(s=>s.audio.voices===audioVoiceCapacity&&(audioVoiceCapacity===9||(s.audio.voiceCapacity===16&&s.audio.waterVoices===8))),
 eventsBounded:samples.every(s=>s.events<=50&&s.telemetry<=256),
 contextIntact:samples.every(s=>!s.contextLost),
 queueBounded:label!=='software'||samples.every(s=>s.fences.max<=1),
 noErrors:r.errors.length===0&&r.result.errors.length===0,
 requestedView:!requestedView||samples.every(s=>same(s.viewport,r.viewport)&&same(s.preferences,r.preferences)&&s.graphics.camera?.fov===r.preferences.fov&&s.graphics.resolutionScale===r.preferences.resolution),
 resolutionPolicy:!ceiling||samples.every(s=>label==='hardware'?same(s.graphics.resolution,ceiling):s.graphics.resolution.every((n,i)=>n>0&&n<=ceiling[i])),
};
// Targets are deliberately separated from stability. A stable slow renderer
// still needs optimization; resource counts are not GPU memory byte totals.
const performance={targetRenderFps:label==='software'?30:60,minimumWindowFps:label==='software'?24:55,maximumRafP95:label==='software'?33.4:17.5,
 renderedFps:(last.graphics.frames-first.graphics.frames)/(last.wall-first.wall),rafP95:percentile(raf,.95),rafP99:percentile(raf,.99),windows:produced};
performance.budgetMet=produced.every(s=>s.fps>=performance.minimumWindowFps)&&performance.rafP95<=performance.maximumRafP95;
// Retain the first-use cost rather than hiding it behind the warmed average.
// A fresh browser run does not establish cold OS/driver caches or slow storage.
const initialWindows=samples.slice(1).map((s,i)=>({start:samples[i].wall,end:s.wall,frames:s.graphics.frames-samples[i].graphics.frames,fps:(s.graphics.frames-samples[i].graphics.frames)/(s.wall-samples[i].wall)})).filter(w=>w.start<first.wall);
const startup={readyMs:r.readyMs,firstWarmedSampleSeconds:first.wall,initialWindows,
 minimumInitialWindowFps:initialWindows.length?Math.min(...initialWindows.map(w=>w.fps)):null,
 initialWindowsMeetWarmedFloor:initialWindows.length>0&&initialWindows.every(w=>w.fps>=performance.minimumWindowFps),
 meaning:'Windows before the first post-traversal sample, retained separately from the established warmed acceptance. Local first-use observation; not a cold-cache or throttled-network qualification.'};
const report={label,durationSeconds:last.wall,readyMs:r.readyMs,originalRunnerPassed:r.passed,method:'Post-GC samples after the first full district traversal; first-use resource uploads are warmup. Inputs replay the verified map-aware simulation pilot through the normal real-time update/render/audio/HUD loop.',
 checks,stabilityPassed:Object.values(checks).every(Boolean),performance,startup,requestedView,sceneResolutionCeiling:ceiling,browserVersion:r.browserVersion??null,
 firstWarmedSeconds:first.wall,heapGrowth,heapRangeMiB:[Math.min(...warmed.map(s=>s.heap.usedSize))/1048576,Math.max(...warmed.map(s=>s.heap.usedSize))/1048576],resources:first.resources,completed:r.result.completed,drainMs:r.drainMs??null,
 limitations:['Local RTX/SwiftShader only; not phone or integrated-GPU qualification.','RAF/render submission rates are not display latency or per-frame GPU timing.','Post-GC JavaScript heap and renderer resource counts do not measure VRAM bytes or thermal throttling.','Five-minute sampled stability does not prove absence of longer-session leaks.','No human performance, fairness, fun or listening inference.']};
fs.writeFileSync(`${root}/${label}-analysis.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,completed:report.completed.length,performance:{...performance,windows:undefined}},null,2));
assert(report.stabilityPassed,'Sustained stability acceptance failed; inspect analysis');
assert(performance.budgetMet,'Sustained frame-rate budget failed; inspect measured windows');
