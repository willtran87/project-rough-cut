import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='output/back-nine-visual-upgrade/windbreak-growth',read=f=>JSON.parse(fs.readFileSync(root+'/'+f,'utf8'));
const before=read('before-native/report.json'),native=read('final-native/report.json'),software=read('final-software/report.json');
const fields=['mode','player','cart','joe','seconds','objective','checkpoint','service','utility','navigation','destruction','wreck','failure','death'];
const comparisons=[];
for(const r of [before,native,software]){assert(r.passed);assert.equal(r.samples.length,13);assert.deepEqual(r.errors,[]);}
for(let i=0;i<native.samples.length;i++){
 const a=before.samples[i],b=native.samples[i],c=software.samples[i];assert.equal(a.name,b.name);assert.equal(c.name,b.name);
 for(const k of fields){assert.deepEqual(a.state[k],b.state[k],b.name+' physical '+k);assert.deepEqual(c.state[k],b.state[k],b.name+' renderer '+k);}
 const resources=Object.fromEntries(['draws','triangles','programs','textures'].map(k=>[k,[a.state.graphics[k],b.state.graphics[k]]]));
 assert.equal(resources.textures[0],resources.textures[1]);assert.equal(resources.programs[1]-resources.programs[0],1);
 assert.equal(resources.draws[1]-resources.draws[0],b.name==='border-2560'?0:1);
 const delta=resources.triangles[1]-resources.triangles[0];assert(delta>=0&&delta<=7500);
 for(const sample of [b,c]){
  assert.equal(sample.state.graphics.windbreakArt.projection,'triplanar');
  assert.equal(sample.state.graphics.windbreakArt.wind,i>=10?0:1,'actual reduced-motion setting');
 }
 comparisons.push({name:b.name,resources});
}
const html=fs.readFileSync('web/back-nine.html','utf8'),mapText=html.match(/<script type="importmap">([\s\S]+?)<\/script>/)[1],imports=JSON.parse(mapText).imports;
const keys=[...mapText.matchAll(/"([^"\n]+\.js)":/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
const served=[];
for(const file of ['back-nine-scene.js','back-nine-shrub-craft.js','back-nine-windbreak-growth.js']){
 assert(imports['./'+file].endsWith('?v=20261114-windbreak-growth-3'));
 const r=await fetch('http://127.0.0.1:4187/'+imports['./'+file]);assert(r.ok);
 assert(Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync('web/'+file)));served.push(file);
}
const clients=['native','software'].map(type=>[0,1].map(i=>read('client-'+type+'/state-'+i+'.json')));
for(let i=0;i<2;i++)for(const k of fields)assert.deepEqual(clients[0][i][k],clients[1][i][k],'actual input '+i+' '+k);
for(const [index,states] of clients.entries()){
 assert.equal(states[1].checkpoint,0);assert.equal(states[1].graphics.windbreakArt.wind,1);
 assert(states[1].player.y>states[0].player.y,'second movement burst advances');
 for(const file of fs.readdirSync(root+'/client-'+['native','software'][index]).filter(f=>f.startsWith('errors-')))assert.deepEqual(read('client-'+['native','software'][index]+'/'+file),[]);
}
const geometry=read('geometry.json'),contracts=read('contracts.json');assert(geometry.passed&&contracts.passed);
const profiles=['native','software'].map(t=>read('profile-'+t+'/report.json'));for(const r of profiles){assert(r.passed);assert.deepEqual(r.errors,[]);}
const result={passed:true,fields,comparisons,geometry,contracts,served,uniqueImportKeys:keys.length,profiles,clients:clients.map(states=>states.map(s=>({mode:s.mode,player:s.player,joe:s.joe,windbreak:s.graphics.windbreakArt,resolution:s.graphics.resolution,average:s.graphics.completionAverage,p95:s.graphics.completionP95})))};
fs.writeFileSync(root+'/comparison.json',JSON.stringify(result,null,2));
const archive=root+'/accepted-source';fs.mkdirSync(archive,{recursive:true});for(const file of [...served,'back-nine.html'])fs.copyFileSync('web/'+file,archive+'/'+file);
const checks=root+'/accepted-tools';fs.mkdirSync(checks,{recursive:true});for(const file of ['verify-windbreak-growth.mjs','verify-windbreak-growth.cjs','verify-back-nine-shrub-craft.mjs','profile-windbreak-growth.cjs','verify-presented-client.mjs','audit-windbreak-growth.mjs'])fs.copyFileSync('tools/'+file,checks+'/'+file);
fs.copyFileSync('tools/fixtures/back-nine-windbreak.json',checks+'/back-nine-windbreak.json');
const manifest=[];function collect(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())collect(file);else if(entry.name!=='manifest.json'){const data=fs.readFileSync(file);manifest.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}}}collect(root);fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({passed:true,cases:comparisons.length,files:manifest.length,clients:result.clients}));
