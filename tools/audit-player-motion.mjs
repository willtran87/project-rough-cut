import fs from 'node:fs';
import assert from 'node:assert/strict';
const root='output/back-nine-visual-upgrade/player-motion',read=p=>JSON.parse(fs.readFileSync(root+'/'+p,'utf8'));
const before=read('before-native/report.json'),current=read('accepted-native/report.json'),software=read('accepted-software/report.json');
const fields=['mode','player','cart','joe','seconds','objective','checkpoint','service','utility','navigation','destruction','wreck','failure','death'];
const comparisons=[];
for(let i=0;i<current.samples.length;i++){
 const a=before.samples[i],b=current.samples[i],c=software.samples[i];assert.equal(a.name,b.name);assert.equal(c.name,b.name);
 for(const field of fields){assert.deepEqual(b.state[field],a.state[field],b.name+' gameplay '+field);assert.deepEqual(c.state[field],b.state[field],b.name+' renderer '+field);}
 const resources={};for(const key of ['draws','triangles','programs','textures'])resources[key]=[a.state.graphics[key],b.state.graphics[key]];
 for(const key of ['programs','textures'])assert.equal(resources[key][0],resources[key][1],b.name+' adds no '+key);
 // Breathing now moves the physical lamp and refreshes its existing shadow
 // pass at rest. Different sole positions change the terrain contact patches.
 const idle=['idle-inhale','idle-exhale','breath-detail'].includes(b.name);
 assert.equal(resources.draws[1]-resources.draws[0],idle?1:0,b.name+' accounted shadow draw');
 assert.equal(resources.triangles[1]-resources.triangles[0],b.state.graphics.contactShadows.triangles-a.state.graphics.contactShadows.triangles,b.name+' accounted contact triangles');
 assert(b.lightSourceError<1e-8);assert(c.lightSourceError<1e-8);comparisons.push({name:b.name,resources});
}
for(const report of [current,software]){
 assert(report.passed);assert.deepEqual(report.errors,[]);
 const reduced=report.samples.find(s=>s.name==='reduced').state.graphics.ejection.balance;
 for(const key of ['breath','pitch','roll','shoulderLift','armBrace'])assert.equal(reduced[key],0,'reduced '+key);
}
const html=fs.readFileSync('web/back-nine.html','utf8'),mapText=html.match(/<script type="importmap">([\s\S]+?)<\/script>/)[1],imports=JSON.parse(mapText).imports;
const keys=[...mapText.matchAll(/"([^"\n]+\.js)":/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
const served=[];
for(const file of ['chase-runner.js','runner-gait.js','runner-balance.js','back-nine-headlights.js']){
 assert(imports['./'+file].endsWith('?v=20261114-player-motion-3'));
 const response=await fetch('http://127.0.0.1:4187/'+imports['./'+file]);assert(response.ok);
 assert(Buffer.from(await response.arrayBuffer()).equals(fs.readFileSync('web/'+file)),file+' served source');served.push(file);
}
const clients=[read('client-native/state-0.json'),read('client-software/state-0.json')],chase=read('chase-native/state-0.json'),previousChase=JSON.parse(fs.readFileSync('output/back-nine-visual-upgrade/rider-motion/client-native/state-0.json','utf8'));
for(const field of fields){assert.deepEqual(clients[0][field],clients[1][field],'actual input renderers '+field);assert.deepEqual(chase[field],previousChase[field],'prior chase '+field);}
assert.deepEqual(clients[0].graphics.ejection,clients[1].graphics.ejection);
for(const s of clients){assert.equal(s.player.speed,0);assert(s.graphics.ejection.footing.every(f=>f.planted&&Math.abs(f.z)<1e-8));assert(s.graphics.ejection.balance.effort>.4,'effort persists at rest');assert.equal(s.checkpoint,0);}
const clientSummary=clients.map(s=>({resolution:s.graphics.resolution,average:s.graphics.completionAverage,p95:s.graphics.completionP95,player:s.player,steps:s.graphics.ejection.footsteps.serial}));
fs.writeFileSync(root+'/comparison.json',JSON.stringify({passed:true,fields,comparisons,served,uniqueImportKeys:keys.length,clients:clientSummary,priorChaseUnchanged:true},null,2));console.log(JSON.stringify({passed:true,cases:comparisons.length,served,clientSummary}));
