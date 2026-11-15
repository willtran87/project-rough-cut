import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CAMPAIGN_KEY,readRecord,writeRecord,patchRecord,campaignPreferences,preferenceWriter} from '../web/preference-store.js';
const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
writeRecord(CAMPAIGN_KEY,{volume:4,reducedMotion:true,subtitles:'bad',extension:{keep:1}});
let p=campaignPreferences();assert.equal(p.volume,1);assert.equal(p.subtitles,true);assert(p.reducedMotion);assert.equal(p.muted,false);
for(const value of [true,false,'true',null,1]){patchRecord(CAMPAIGN_KEY,{muted:value});assert.equal(campaignPreferences().muted,value===true);}
const saveA=preferenceWriter(CAMPAIGN_KEY,p);
patchRecord(CAMPAIGN_KEY,{volume:.15,newExtension:'retained'});
assert(saveA({...p,reducedMotion:false}));
assert.equal(readRecord(CAMPAIGN_KEY).volume,.15);assert.equal(readRecord(CAMPAIGN_KEY).newExtension,'retained');assert.deepEqual(readRecord(CAMPAIGN_KEY).extension,{keep:1});
const before=data.get(CAMPAIGN_KEY);assert(saveA({...p,reducedMotion:false}));assert.equal(data.get(CAMPAIGN_KEY),before);
writeRecord('rough-cut.back-nine.v1',{checkpoint:2});writeRecord('rough-cut.under-green.v1',{checkpoint:1,bypass:true});
patchRecord(CAMPAIGN_KEY,{volume:.4});assert.equal(readRecord('rough-cut.back-nine.v1').checkpoint,2);assert(readRecord('rough-cut.under-green.v1').bypass);
for(const raw of ['null','[]','5','{bad']){data.set(CAMPAIGN_KEY,raw);assert.equal(campaignPreferences().volume,.72);}
globalThis.localStorage={getItem(){throw Error('Unavailable');},setItem(){throw Error('Unavailable');}};
assert.equal(campaignPreferences(true).reducedMotion,true);assert.equal(patchRecord(CAMPAIGN_KEY,{volume:.2}),false);
fs.mkdirSync('output/under-green/build',{recursive:true});
const result={passed:true,checks:['Validated shared settings and malformed/unavailable storage','Changed-field saves preserve cross-tab edits and unknown data','Repeated writes are idempotent','Chapter saves remain independent']};
fs.writeFileSync('output/under-green/build/preferences.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
