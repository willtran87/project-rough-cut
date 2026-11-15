import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='output/back-nine-visual-upgrade/camera-clearance',read=p=>JSON.parse(fs.readFileSync(root+'/'+p,'utf8'));
const before=read('before-native/report.json'),native=read('verified-native/report.json'),software=read('verified-software/report.json');
const fields=['mode','player','cart','joe','seconds','objective','checkpoint','service','utility','navigation','destruction','wreck','failure','death'];
const comparisons=[];
for(let i=0;i<native.samples.length;i++){
 const a=before.samples[i],b=native.samples[i],c=software.samples[i];assert.equal(a.name,b.name);assert.equal(c.name,b.name);
 for(const k of fields){assert.deepEqual(a.state[k],b.state[k],b.name+' physics '+k);assert.deepEqual(c.state[k],b.state[k],b.name+' renderer '+k);}
 assert.equal(a.state.graphics.textures,b.state.graphics.textures);
 if(['shelter-2560','low-basin-2560','hill-2560'].includes(b.name))for(const key of ['position','quaternion'])for(let j=0;j<b.camera[key].length;j++)assert(Math.abs(a.camera[key][j]-b.camera[key][j])<1e-8,b.name+' original open-view composition');
 if(['club-west-2560','club-front-2560','garage-wall-2560'].includes(b.name)){
  assert.notDeepEqual(a.camera.position,b.camera.position);const p=b.state.player;assert(Math.hypot(b.camera.position[0]-p.x,b.camera.position[2]+p.y)>6,'Preserve vehicle viewing distance');
 }
 comparisons.push({name:b.name,beforeCamera:a.camera,afterCamera:b.camera,resources:Object.fromEntries(['draws','triangles','programs','textures'].map(k=>[k,[a.state.graphics[k],b.state.graphics[k]]]))});
}
for(const r of [native,software]){assert(r.passed);assert.equal(r.samples.length,9);assert.deepEqual(r.errors,[]);}
assert(read('rules.json').passed);
const motion=['motion-accepted-native','motion-accepted-software'].map(p=>read(p+'/motion.json'));
for(const report of motion){assert(report.passed);assert.equal(report.motion.length,4);assert.deepEqual(report.errors,[]);for(const m of report.motion){assert.equal(m.violations,0);assert(m.maxStep<1);assert(m.settledOffset<.05);if(!m.foot){assert(m.minBoom>6);assert(m.maxStep<.3);}}}
const originalMotion=read('motion-before/motion.json');assert(originalMotion.motion.filter(m=>!m.foot).every(m=>m.violations>100));
const clients=['native','software'].map(t=>[0,1].map(i=>read('verified-client-'+t+'/state-'+i+'.json')));
for(let i=0;i<2;i++)for(const k of fields)assert.deepEqual(clients[0][i][k],clients[1][i][k],'input '+i+' '+k);
for(const states of clients){assert(states.every(s=>s.ready&&s.graphics.frames>0));assert(states[1].player.x<states[0].player.x,'Drive away from wall');}
const foot=[0,1].map(i=>read('verified-foot-native/state-'+i+'.json'));
for(let i=0;i<2;i++){
 const old=JSON.parse(fs.readFileSync('output/back-nine-visual-upgrade/shelter-craft/accepted-client-native/state-'+i+'.json','utf8'));
 for(const k of fields)assert.deepEqual(foot[i][k],old[k],'foot traversal '+k);
}
assert.equal(foot[1].checkpoint,1);
for(const dir of ['verified-client-native','verified-client-software','verified-foot-native'])for(const file of fs.readdirSync(root+'/'+dir).filter(f=>f.startsWith('errors-')))assert.deepEqual(read(dir+'/'+file),[]);
const html=fs.readFileSync('web/back-nine.html','utf8'),mapText=html.match(/<script type="importmap">([\s\S]+?)<\/script>/)[1],imports=JSON.parse(mapText).imports,keys=[...mapText.matchAll(/"([^"\n]+\.js)":/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
const served=['back-nine-scene.js','runner-camera.js','chase-camera.js'];
for(const file of served){assert(imports['./'+file].endsWith('?v=20261114-camera-clearance-7'));const r=await fetch('http://127.0.0.1:4187/'+imports['./'+file]);assert(r.ok);assert(Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync('web/'+file)));}
const summarize=s=>({player:s.player,resolution:s.graphics.resolution,average:s.graphics.completionAverage,p95:s.graphics.completionP95});
const result={passed:true,comparisons,fields,motion,originalMotion,clients:clients.map(states=>states.map(summarize)),foot:foot.map(summarize),served};fs.writeFileSync(root+'/comparison.json',JSON.stringify(result,null,2));
for(const dir of ['accepted-source','accepted-tools'])fs.mkdirSync(root+'/'+dir,{recursive:true});
for(const file of [...served,'back-nine.html'])fs.copyFileSync('web/'+file,root+'/accepted-source/'+file);
for(const file of ['verify-chase-clearance.mjs','verify-chase-clearance.cjs','verify-camera-motion.cjs','verify-presented-client.mjs','audit-chase-clearance.mjs'])fs.copyFileSync('tools/'+file,root+'/accepted-tools/'+file);
const manifest=[];function collect(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=dir+'/'+e.name;if(e.isDirectory())collect(f);else if(e.name!=='manifest.json'){const data=fs.readFileSync(f);manifest.push({file:f,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}}}collect(root);fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({passed:true,comparisons:comparisons.length,clients:result.clients,foot:result.foot}));
