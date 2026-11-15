const fs=require('node:fs'),assert=require('node:assert/strict');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/first-use';
const report=JSON.parse(fs.readFileSync(`${out}/report.json`,'utf8'));
assert.deepEqual(report.errors,[]);assert.equal(report.outcomes.length,2);assert(report.outcomes.every(o=>o.matched));
const laps=[];
for(const lap of [0,1]){
 const rows=report.rows.filter(r=>r.lap===lap),bins=new Map();assert(rows.length>2);
 for(let i=1;i<rows.length;i++){
  const r=rows[i],p=rows[i-1],duration=r.wall-p.wall,frames=r.frames-p.frames;if(duration<=0)continue;
  // Assign an observed interval to its start's five-second simulation bin.
  // Keep actual end times; this is a diagnostic grouping, not exact phase cost.
  const key=Math.floor(p.seconds/5)*5;
  if(!bins.has(key))bins.set(key,{start:p.seconds,end:r.seconds,duration:0,frames:0,cpu:0,draws:0,triangles:0,intervals:0,uploads:{},districts:new Set(),resolutions:new Set(),firstPlayer:p.player,lastPlayer:r.player});
  const b=bins.get(key);b.end=r.seconds;b.duration+=duration;b.frames+=frames;b.cpu+=(r.cpuAverage||0)*frames;b.draws+=r.draws;b.triangles+=r.triangles;b.intervals++;b.districts.add(r.district);b.resolutions.add(p.resolution.join('x'));b.resolutions.add(r.resolution.join('x'));b.lastPlayer=r.player;
  for(const [name,value]of Object.entries(r.uploadDelta||{}))b.uploads[name]=(b.uploads[name]||0)+value;
 }
 const windows=[...bins.values()].map(b=>({...b,fps:b.frames/b.duration,cpuAverage:b.cpu/Math.max(1,b.frames),drawsAverage:b.draws/b.intervals,trianglesAverage:b.triangles/b.intervals,districts:[...b.districts],resolutions:[...b.resolutions],cpu:undefined,draws:undefined,triangles:undefined}));
 const first=rows[0],last=rows.at(-1);
 laps.push({lap,seconds:last.seconds,wallSeconds:last.wall-first.wall,fps:(last.frames-first.frames)/(last.wall-first.wall),resourcesFirst:first.resources,resourcesLast:last.resources,windows});
}
const result={method:report.method,readyMs:report.readyMs,laps,changed:report.source.changed,limitations:['One-second upload counters and sampled geometry counts do not identify precise GPU stalls.','Five-second windows may extend slightly beyond their nominal boundary.','First/repeated laps share the host and cache; no cold-cache, device or performance-budget qualification.']};
fs.writeFileSync(`${out}/analysis.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,laps:result.laps.map(({windows,...lap})=>({...lap,slowest:windows.filter(w=>w.duration>=2).sort((a,b)=>a.fps-b.fps).slice(0,5)}))},null,2));
