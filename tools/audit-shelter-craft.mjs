import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='output/back-nine-visual-upgrade/shelter-craft',read=f=>JSON.parse(fs.readFileSync(root+'/'+f,'utf8'));
const before=read('before-native/report.json'),native=read('after-native/report.json'),software=read('after-software/report.json');
const fields=['mode','player','cart','joe','seconds','objective','checkpoint','service','utility','navigation','destruction','wreck','failure','death'];
const comparisons=[];
for(let i=0;i<native.samples.length;i++){
 const a=before.samples[i],b=native.samples[i],c=software.samples[i];assert.equal(a.name,b.name);assert.equal(c.name,b.name);
 for(const k of fields){assert.deepEqual(a.state[k],b.state[k],b.name+' physical '+k);assert.deepEqual(c.state[k],b.state[k],b.name+' renderer '+k);}
 const resources=Object.fromEntries(['draws','triangles','programs','textures'].map(k=>[k,[a.state.graphics[k],b.state.graphics[k]]]));
 for(const k of ['programs','textures'])assert.equal(resources[k][0],resources[k][1],b.name+' '+k);assert(resources.draws[1]-resources.draws[0]<=2,'Reuse existing material batches');assert(resources.triangles[1]-resources.triangles[0]<4000,'Bounded architectural geometry');assert.equal(b.state.graphics.architecture.shelterBoards,56);assert.equal(b.state.graphics.architecture.shelterRafters,24);
 comparisons.push({name:b.name,resources});
}
for(const r of [native,software]){assert(r.passed);assert.deepEqual(r.errors,[]);assert.equal(r.samples.length,9);}
const html=fs.readFileSync('web/back-nine.html','utf8'),mapText=html.match(/<script type="importmap">([\s\S]+?)<\/script>/)[1],imports=JSON.parse(mapText).imports;
const keys=[...mapText.matchAll(/"([^"\n]+\.js)":/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
const served=[];
for(const file of ['back-nine-architecture.js']){assert(imports['./'+file].endsWith('?v=20261114-shelter-craft-1'));const r=await fetch('http://127.0.0.1:4187/'+imports['./'+file]);assert(r.ok);assert(Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync('web/'+file)));served.push(file);}
const clients=['native','software'].map(type=>[0,1].map(i=>read('accepted-client-'+type+'/state-'+i+'.json')));
for(let i=0;i<2;i++)for(const k of fields)assert.deepEqual(clients[0][i][k],clients[1][i][k],'actual input '+i+' '+k);
for(const [index,states] of clients.entries()){
 assert(states.every(s=>s.ready&&s.graphics.frames>0),'Completed rendered gameplay required');assert(states[1].player.y>states[0].player.y);assert.equal(states[1].checkpoint,1,'walking through shelter powers first relay');
 const dir='accepted-client-'+['native','software'][index];
 for(const file of fs.readdirSync(root+'/'+dir).filter(f=>f.startsWith('errors-')))assert.deepEqual(read(dir+'/'+file),[]);
}
assert(read('geometry.json').passed);
const result={passed:true,fields,comparisons,geometry:read('geometry.json'),served,uniqueImportKeys:keys.length,clients:clients.map(states=>states.map(s=>({mode:s.mode,player:s.player,joe:s.joe,mowing:s.graphics.courseDetail.mowing,resolution:s.graphics.resolution,average:s.graphics.completionAverage,p95:s.graphics.completionP95})))};
fs.writeFileSync(root+'/comparison.json',JSON.stringify(result,null,2));
const archive=root+'/accepted-source';fs.mkdirSync(archive,{recursive:true});for(const file of [...served,'back-nine.html'])fs.copyFileSync('web/'+file,archive+'/'+file);
const checks=root+'/accepted-tools';fs.mkdirSync(checks,{recursive:true});for(const file of ['verify-shelter-geometry.mjs','verify-shelter-craft.cjs','verify-presented-client.mjs','audit-shelter-craft.mjs'])fs.copyFileSync('tools/'+file,checks+'/'+file);
const manifest=[];function collect(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())collect(file);else if(entry.name!=='manifest.json'){const data=fs.readFileSync(file);manifest.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}}}collect(root);fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({passed:true,cases:comparisons.length,clients:result.clients.map(c=>c.map(s=>({player:s.player,resolution:s.resolution,average:s.average,p95:s.p95})))}));
