// Mutation checks against a real completed production-loop report. Modified
// reports are test fixtures only, never performance or gameplay evidence.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const source=process.argv.find(a=>a.startsWith('--source='))?.slice(9)||'output/under-green/current-build-soak/verified-contract/hardware.json';
const original=JSON.parse(fs.readFileSync(source,'utf8'));
assert(original.result.completed.length>=4&&original.result.completed.every(r=>r.expected));
const out='output/under-green/current-build-soak/analyzer-regressions';fs.mkdirSync(out,{recursive:true});
const cases=[
 ['unchanged',()=>{},true,true],
 ['extra-water-hit',r=>r.result.completed[0].waterHits++,false,true],
 ['lost-water-hit',r=>{const c=r.result.completed.find(s=>s.expected.waterHits>0);assert(c);c.waterHits--;},false,true],
 ['different-time',r=>r.result.completed[0].seconds+=.1,false,true],
 ['different-position',r=>r.result.completed[0].error=.01,false,true],
 ['caught',r=>r.result.completed[0].mode='caught',false,true],
 ['invalid-expected-time',r=>delete r.result.completed[0].expected.seconds,false,true],
 ['slow-rendering',r=>{for(const s of r.samples)s.graphics.frames=Math.round(s.wall*10);},true,false],
];
const rows=[];
for(const [name,mutate,routeOutcomes,budgetMet]of cases){
 const r=structuredClone(original);mutate(r);const dir=path.join(out,name);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'hardware.json'),JSON.stringify(r));
 const run=spawnSync(process.execPath,['tools/analyze-under-green-soak.cjs',`--output=${dir}`],{encoding:'utf8'});
 const report=JSON.parse(fs.readFileSync(path.join(dir,'hardware-analysis.json'),'utf8'));
 assert.equal(report.checks.routeOutcomes,routeOutcomes,name);assert.equal(report.performance.budgetMet,budgetMet,name);
 assert.equal(run.status,routeOutcomes&&budgetMet?0:1,name);
 rows.push({name,routeOutcomes:report.checks.routeOutcomes,budgetMet:report.performance.budgetMet,exitCode:run.status});
}
fs.writeFileSync(path.join(out,'verified.json'),JSON.stringify({passed:true,source,method:'Deliberately mutated reports test rejection; fixture numbers are not measured outcomes.',rows},null,2));
console.log(JSON.stringify({passed:true,cases:rows.length,rows}));
