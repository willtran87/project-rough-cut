const fs=require('node:fs'),assert=require('node:assert/strict'),base='output/level-one-hedge-surface',reports=[];
for(const renderer of ['native','software']){
 const a=JSON.parse(fs.readFileSync(`${base}/before-${renderer}/report.json`)),b=JSON.parse(fs.readFileSync(`${base}/after-${renderer}/report.json`));
 assert(a.passed&&b.passed);assert.equal(a.views.length,45);assert.equal(b.views.length,45);assert.equal(b.inventory.hedgeCores.length,23);
 assert.deepEqual(b.inventory,a.inventory,'World, cores, lighting, cover and growth are unchanged');
 const deltas=[];a.views.forEach((v,i)=>{const n=b.views[i];for(const key of ['name','pose','resolution'])assert.deepEqual(n[key],v[key]);if(renderer==='software'){assert.equal(v.culling.changedChannels,0);assert.equal(n.culling.changedChannels,0);assert.equal(n.culling.restoredChangedChannels,0);}deltas.push({name:v.name,draws:n.draws-v.draws,triangles:n.triangles-v.triangles});});
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);reports.push({renderer,matchedViews:45,inventoryExact:true,deltas,beforeWarm:a.warm,afterWarm:b.warm});
}
fs.writeFileSync(base+'/comparison.json',JSON.stringify({passed:true,reports},null,2));console.log(JSON.stringify({passed:true,reports:reports.map(r=>({...r,deltas:undefined,drawRange:[Math.min(...r.deltas.map(d=>d.draws)),Math.max(...r.deltas.map(d=>d.draws))],triangleRange:[Math.min(...r.deltas.map(d=>d.triangles)),Math.max(...r.deltas.map(d=>d.triangles))]}))}));
