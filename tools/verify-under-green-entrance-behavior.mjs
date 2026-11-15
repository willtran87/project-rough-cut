import fs from 'node:fs';
import assert from 'node:assert/strict';
fs.mkdirSync('output/under-green/entrance-fix',{recursive:true});
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {createRun,step} from '../web/under-green-sim.js';
import {traverse} from './probe-under-green-folded.mjs';
const absolute=s=>s.replaceAll(/from '(\.\/[^']+)'/g,(_,p)=>`from '${pathToFileURL(resolve('web',p)).href}'`);
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const nav=data(absolute(fs.readFileSync('tools/fixtures/under-green-navigation-before-entrance-fix.txt','utf8')));
const source=absolute(fs.readFileSync('web/under-green-sim.js','utf8')).replace(pathToFileURL(resolve('web/under-green-navigation.js')).href,nav);
const baseline=await import(data(source)),rows=[];
for(const options of [{dodge:true},{wet:true,dodge:true},{sprint:true,dodge:true},{wet:true,sprint:true,dodge:true}]){
 const tape=[];traverse({...options,inputTape:tape,view:{fov:85,aspect:1.6}});
 const a=createRun(),b=baseline.createRun();a.mode=b.mode='playing';
 for(const row of tape){const input={...row.input,lookX:Math.atan2(Math.sin(row.yaw-a.player.yaw),Math.cos(row.yaw-a.player.yaw))};step(a,input);baseline.step(b,input);assert.deepEqual(a.joe,b.joe);}
 assert.deepEqual(a,b);assert.equal(a.mode,'complete');rows.push({options,frames:tape.length,seconds:a.elapsed,mode:a.mode});
}
fs.writeFileSync('output/under-green/entrance-fix/behavior.json',JSON.stringify({passed:true,rows},null,2));console.log({passed:true,rows});
