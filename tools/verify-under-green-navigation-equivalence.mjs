import fs from 'node:fs';
import assert from 'node:assert/strict';
fs.mkdirSync('output/under-green/entrance-fix',{recursive:true});
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {planJoeRoute,prepareJoeNavigation} from '../web/under-green-navigation.js';
import {navigationPoints} from '../web/under-green-course.js';
const original=fs.readFileSync('tools/fixtures/under-green-navigation-before-entrance-fix.txt','utf8').replaceAll(/from '(\.\/[^']+)'/g,(_,p)=>`from '${pathToFileURL(resolve('web',p)).href}'`);
const baseline=await import('data:text/javascript;base64,'+Buffer.from(original).toString('base64'));
const cells=navigationPoints(.8);prepareJoeNavigation();let seed=132457,checks=0;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const samples=Array.from({length:800},(_,i)=>({from:{...cells[Math.floor(random()*cells.length)],yaw:random()*Math.PI*2},to:cells[Math.floor(random()*cells.length)],time:random()*180,options:{speed:[1.65,2.1,3.5,5.7][i%4],gate:i%3===0,bypass:i%2===0,bypassAt:random()*60-10}}));
const before=performance.now(),expected=samples.map(s=>baseline.planJoeRoute(s.from,s.to,s.time,s.options)),baselineMs=performance.now()-before;
const after=performance.now();for(const [i,s]of samples.entries()){assert.deepEqual(planJoeRoute(s.from,s.to,s.time,s.options),expected[i]);checks++;}
const optimizedMs=performance.now()-after;
const report={passed:true,checks,baselineMs,optimizedMs};fs.writeFileSync('output/under-green/entrance-fix/navigation.json',JSON.stringify(report,null,2));console.log(report);
