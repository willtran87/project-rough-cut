const fs=require('node:fs'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const out='output/back-nine-experience/loading',rows=[];
for(const [i,baseline] of [true,false,false,true,true,false,false,true].entries()){
 const r=spawnSync(process.execPath,['tools/profile-back-nine-loading.cjs',...(baseline?['--baseline']:[])],{encoding:'utf8',timeout:180000});if(r.status!==0)throw Error(r.stderr||r.stdout||String(r.error));
 const label=baseline?'software-before':'software-candidate',file=`${out}/${label}-profile.json`,p=JSON.parse(fs.readFileSync(file));fs.copyFileSync(file,`${out}/repeat-${i}-${label}.json`);
 const paint=p.topCPU.filter(([key])=>key.startsWith('pixelSurface ')).reduce((n,[,ms])=>n+ms,0),stage=name=>p.stages.find(s=>s.name===name).at;
 assert.deepEqual(p.errors,[]);if(!baseline)assert.equal(p.graphics.preparation.surfaces.baked,10);
 const row={i,baseline,ready:p.readyAt,construction:stage('static-construction-done')-stage('source-art-ready'),paintCPU:paint,longTasks:p.longTasks,preparation:p.graphics.preparation};rows.push(row);console.log(JSON.stringify({i,baseline,ready:row.ready,construction:row.construction,paintCPU:paint}));
}
const median=a=>{a.sort((x,y)=>x-y);return(a[1]+a[2])/2;},summary=[true,false].map(baseline=>{const group=rows.filter(r=>r.baseline===baseline);return {baseline,readyMedian:median(group.map(r=>r.ready)),constructionMedian:median(group.map(r=>r.construction)),paintCPUMedian:median(group.map(r=>r.paintCPU)),maxLongTask:Math.max(...group.flatMap(r=>r.longTasks.map(t=>t.duration)))};});
fs.writeFileSync(out+'/repeated-startup.json',JSON.stringify({passed:true,rows,summary},null,2));console.log(JSON.stringify({summary}));
