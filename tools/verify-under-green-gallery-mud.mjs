import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {floorLayout} from '../web/under-green-course.js';
import {mudDepositProfile,mudWallSpans} from '../web/under-green-mud-profile.js';
import {buildDrainOrganicGeometry} from '../web/under-green-organic-geometry.js';
const out='output/under-green/visual-pass83';
const absolute=s=>s.replace(/from '\.\/([^']+)'/g,(_,f)=>`from '${pathToFileURL(process.cwd()+'/web/'+f).href}'`);
const moduleURL=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const oldProfileURL=moduleURL(absolute(fs.readFileSync(out+'/source/under-green-mud-profile-before.js','utf8')));
const oldProfile=await import(oldProfileURL);
const oldGeometrySource=fs.readFileSync(out+'/source/under-green-organic-geometry-before.js','utf8').replaceAll("from './under-green-mud-profile.js'",`from '${oldProfileURL}'`);
const oldGeometry=await import(moduleURL(absolute(oldGeometrySource)));
const layout=floorLayout();
function collect(build){
 const banks=[],roots=[],other=[];
 const stats=build({layout,materials:{},root(...args){roots.push(args);},put(g,type,x,y,z){
  const v={type,x,y,z,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,Array.from(a.array)])),index:Array.from(g.index?.array||[])};
  (type==='mudBank'?banks:other).push(v);
 }});return {banks,roots,other,stats};
}
const before=collect(oldGeometry.buildDrainOrganicGeometry),after=collect(buildDrainOrganicGeometry);
assert.deepEqual(before.roots,after.roots);assert.deepEqual(before.other,after.other);assert.deepEqual(before.stats,after.stats);
let samples=0,changed=0,maxHeight=0,maxFoot=0,quiet=0;
for(const s of mudWallSpans(layout)){
 for(const t of [s.start,s.end])assert.equal(mudDepositProfile(t,s.boundary,s.start,s.end,s.vertical).height,.004);
 for(let t=s.start;t<s.end;t+=.015){
  const a=oldProfile.mudDepositProfile(t,s.boundary,s.start,s.end),b=mudDepositProfile(t,s.boundary,s.start,s.end,s.vertical);
  const site=s.vertical&&((s.boundary===5&&t>=9.17&&t<=13.34)||(s.boundary===-5&&t>=12.87&&t<=16.67));
  if(!site)assert.deepEqual(a,b,'Deposit changed outside authored gallery sites');
  if(a.height!==b.height)changed++;
  assert(b.height>=.004&&b.height<.85);assert(b.foot>=.114&&b.foot<=.19700001);
  maxHeight=Math.max(maxHeight,b.height);maxFoot=Math.max(maxFoot,b.foot);if(b.height<.025)quiet++;samples++;
 }
}
assert(changed>200);assert(maxHeight>.6);assert(quiet/samples>.2);
let changedBanks=0,vertices=0,triangles=0;
for(let i=0;i<after.banks.length;i++){
 const a=before.banks[i],b=after.banks[i];assert.deepEqual(a.index,b.index);assert.equal(a.attributes.position.length,b.attributes.position.length);
 if(JSON.stringify(a)!==JSON.stringify(b))changedBanks++;
 for(const values of Object.values(b.attributes))assert(values.every(Number.isFinite));
 vertices+=b.attributes.position.length/3;triangles+=b.index.length/3;
}
assert(changedBanks>0&&changedBanks<8);
const report={passed:true,samples,changed,maxHeight,maxFoot,quietFraction:quiet/samples,changedBanks,vertices,triangles,unchangedRoots:after.roots.length,stats:after.stats};
fs.writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
