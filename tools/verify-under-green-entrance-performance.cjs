const fs=require('node:fs'),assert=require('node:assert/strict');
const root=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/entrance-fix/hardware-final';
const r=JSON.parse(fs.readFileSync(root+'/report.json','utf8'));
const entrance=r.rows.filter(x=>x.seconds>=6&&x.seconds<=10);
const coldCalls=['bufferData','texImage2D','texStorage2D','linkProgram','getProgramInfoLog','getActiveUniform','getUniformLocation'];
const firstRoutes=[0,1].map(lap=>r.rows.find(x=>x.lap===lap&&x.cost.navigationGraph!==undefined));
const entranceGap=Math.max(0,...r.submissions.map((s,i)=>s.seconds>=6&&s.seconds<=10?s.wall-(r.submissions[i-1]?.wall||0):0));
const summaries=[0,1].map(lap=>{const rows=entrance.filter(x=>x.lap===lap);return {lap,maxCpuMs:Math.max(...rows.map(x=>x.frameCpu)),maxRafGapMs:Math.max(...rows.map(x=>x.rafGap)),firstRouteCpuMs:firstRoutes[lap]?.frameCpu??null};});
const checks={productionPath:!['hideJoe','flatJoe','warmJoe','prewarm','traceGPU','fenceGPU','splitJoe'].some(key=>r[key]),bothEntrances:firstRoutes.every(Boolean),noErrors:r.errors.length===0,
 noColdRendering:entrance.length>0&&entrance.every(x=>!coldCalls.some(name=>x.calls[name]>0)),
 graphPrepared:entrance.every(x=>(x.cost.navigationGraph||0)<1),
 sustainedRendering:r.presentation?.count>100,
 promptFirstSubmission:r.presentation?.firstSubmissionMs<1000,
 noPresentationStall:r.presentation?.maxGapMs<(r.software?1000:250),
 noEntranceSpike:entranceGap<(r.software?500:250),
 nativeCpuBudget:r.software||summaries.every(s=>s.maxCpuMs<33.4)&&summaries[0].firstRouteCpuMs<25};
const report={passed:Object.values(checks).every(Boolean),software:r.software,checks,summaries,presentation:r.presentation,entranceGapMs:entranceGap,notes:'Render submissions and RAF CPU timing; not display latency. Cold allocation/reflection checked throughout the 6–10 second entrance window. Diagnostic render overrides cannot qualify.'};
fs.writeFileSync(root+'/acceptance.json',JSON.stringify(report,null,2));console.log(report);assert(report.passed,'Entrance performance acceptance failed');
