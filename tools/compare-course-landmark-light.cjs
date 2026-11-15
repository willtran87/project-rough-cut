const fs=require('node:fs'),assert=require('node:assert/strict'),base='output/level-one-landmark-light',reports=[];
for(const renderer of ['native','software']){
 const a=JSON.parse(fs.readFileSync(`${base}/before-${renderer}/report.json`)),b=JSON.parse(fs.readFileSync(`${base}/after-${renderer}/report.json`));
 for(const key of ['objects','obstacles','lanterns'])assert.deepEqual(a.inventory[key],b.inventory[key],key);
 const changed=[];assert.equal(a.inventory.lights.length,b.inventory.lights.length);
 a.inventory.lights.forEach((l,i)=>{const n=b.inventory.lights[i];assert.deepEqual({...l,position:[]},{...n,position:[]});if(JSON.stringify(l.position)!==JSON.stringify(n.position))changed.push({before:l,after:n});});
 assert.equal(changed.length,1);assert.deepEqual(changed[0].before.position,[14.4,2.4,-50.4]);assert.deepEqual(changed[0].after.position,[13.88,2.42,-51.5]);
 assert.equal(a.inventory.rooms.length,b.inventory.rooms.length);a.inventory.rooms.forEach((r,i)=>assert.deepEqual({...r,strength:null},{...b.inventory.rooms[i],strength:null}));
 a.views.forEach((v,i)=>{const n=b.views[i];for(const key of ['name','pose','camera','resolution','draws','triangles'])assert.deepEqual(v[key],n[key],renderer+' '+v.name+' '+key);});
 const rooms=b.inventory.rooms.find(r=>r.kind==='clubhouse'),levels={};for(let i=0;i<rooms.strength.length;i+=4){const v=rooms.strength[i].toFixed(3);levels[v]=(levels[v]||0)+1;}
 reports.push({renderer,matchedViews:a.views.length,changedLights:changed,roomLevels:levels,draws:b.views.map(v=>({name:v.name,draws:v.draws,triangles:v.triangles}))});
}
fs.writeFileSync(base+'/comparison.json',JSON.stringify({passed:true,reports},null,2));console.log(JSON.stringify({passed:true,reports:reports.map(({draws,...r})=>r)}));
