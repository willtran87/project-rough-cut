import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='output/back-nine-visual-upgrade/player-gear',read=p=>JSON.parse(fs.readFileSync(root+'/'+p,'utf8'));
const original=read('before-native/report.json'),lightBefore=read('lights-before/report.json'),native=read('accepted-native/report.json'),software=read('accepted-software/report.json');
// The initial headlight fixture put the boots outside the actual lamp cone.
// These captures align the real vehicle instead of changing its beam.
for(const [report,folder]of [[native,'headlight-native'],[software,'headlight-software']]){
 const replacement=read(folder+'/report.json');assert(replacement.passed);assert.deepEqual(replacement.errors,[]);
 report.views[report.views.findIndex(s=>s.name==='boots-headlight')]=replacement.views[0];
}
const fields=['mode','player','cart','joe','seconds','objective','checkpoint','service','utility','navigation','destruction','wreck','failure','death'];
const comparisons=[];
for(const b of native.views){
 const corrected=['boots-red','boots-headlight','glove-red'].includes(b.name);
 const a=(corrected?lightBefore:original).views.find(s=>s.name===b.name),c=software.views.find(s=>s.name===b.name);
 assert(a&&c,b.name+' matching captures');
 for(const field of fields){assert.deepEqual(b.state[field],a.state[field],b.name+' physical '+field);assert.deepEqual(b.state[field],c.state[field],b.name+' renderer '+field);}
 const resources=Object.fromEntries(['draws','triangles','programs','textures'].map(k=>[k,[a.state.graphics[k],b.state.graphics[k]]]));
 assert.equal(resources.programs[0],resources.programs[1],b.name+' shader reuse');
 assert.equal(resources.textures[1]-resources.textures[0],1,b.name+' one shared gear atlas');
 assert.equal(resources.draws[1],resources.draws[0],b.name+' same draw batches');
 comparisons.push({name:b.name,resources});
}
for(const r of [native,software]){assert(r.passed);assert.deepEqual(r.errors,[]);assert.equal(r.geometry.meshes,27);assert.equal(r.geometry.gearMeshes,4);}
const html=fs.readFileSync('web/back-nine.html','utf8'),mapText=html.match(/<script type="importmap">([\s\S]+?)<\/script>/)[1],imports=JSON.parse(mapText).imports;
const keys=[...mapText.matchAll(/"([^"\n]+\.js)":/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
const served=[];
for(const file of ['runner-gear-craft.js','runner-sole.js','runner-gait.js','runner-materials.js','chase-runner.js','back-nine-scene.js']){
 assert(imports['./'+file].endsWith('?v=20261114-player-gear-6'));
 const r=await fetch('http://127.0.0.1:4187/'+imports['./'+file]);assert(r.ok);assert(Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync('web/'+file)));served.push(file);
}
const asset='assets/optimized/back-nine-work-gear-v1.png',bytes=fs.readFileSync('web/'+asset),source=fs.readFileSync('assets/characters/player/back-nine-work-gear-v1.png');assert(bytes.equals(source));
const servedAsset=await fetch('http://127.0.0.1:4187/'+asset);assert(servedAsset.ok);assert(Buffer.from(await servedAsset.arrayBuffer()).equals(bytes));
const clients=[read('client-native/state-0.json'),read('client-software/state-0.json')];
for(const field of fields)assert.deepEqual(clients[0][field],clients[1][field],'client '+field);
const previous=JSON.parse(fs.readFileSync('output/back-nine-visual-upgrade/player-motion/client-native/state-0.json','utf8'));
for(const field of fields)assert.deepEqual(clients[0][field],previous[field],'prior input outcome '+field);
for(const s of clients){assert.equal(s.player.speed,0);assert.equal(s.checkpoint,0);assert(s.graphics.ejection.footing.every(f=>f.planted));}
const motion=read('grounded-motion/report.json');assert(motion.passed);assert.deepEqual(motion.errors,[]);
const terrain=read('grounded-routes/hardware-verification.json');assert(terrain.passed);
const result={passed:true,fields,comparisons,geometry:[original.geometry,native.geometry],served,uniqueImportKeys:keys.length,asset:{bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)},motion:motion.contract,terrain,clients:clients.map(s=>({player:s.player,resolution:s.graphics.resolution,average:s.graphics.completionAverage,p95:s.graphics.completionP95}))};
fs.writeFileSync(root+'/comparison.json',JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,cases:comparisons.length,asset:result.asset,clients:result.clients}));
const archive=root+'/accepted-source';fs.mkdirSync(archive,{recursive:true});
for(const file of [...served,'back-nine.html','runner-balance.js','runner-garment-craft.js','runner-head-craft.js','back-nine-headlights.js'])fs.copyFileSync('web/'+file,archive+'/'+file);
const manifest=[];
function collect(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())collect(file);else if(entry.name!=='manifest.json'){const data=fs.readFileSync(file);manifest.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}}}
collect(root);for(const file of ['web/'+asset,'assets/characters/player/back-nine-work-gear-v1.png','assets/characters/player/back-nine-work-gear-v1.prompt.txt']){const data=fs.readFileSync(file);manifest.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2));
