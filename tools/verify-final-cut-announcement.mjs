import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FILED_STATIONS,STATION_RECEIPT_KEY,recordNightOrderReceipt,readStationReceipt,normalizeStationReceipt} from '../web/night-order-receipt.js';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {championshipBoard,announcementClip,advanceAnnouncement} from '../web/final-cut-announcement.js';
import {finaleEntry} from '../web/final-cut-campaign.js';
const records=new Map(),checks=[];globalThis.localStorage={getItem:k=>records.get(k)??null,setItem:(k,v)=>records.set(k,String(v))};
const tick=(r,t,input={})=>{for(let k=0;k<t*120;k++)step(r,input,1/120);};
for(let mask=0;mask<8;mask++)for(const [route,entry]of [['shed','garage'],['drain','drain']]){
 const stations=FILED_STATIONS.filter((_,i)=>mask&(1<<i));recordNightOrderReceipt(route,[...stations,'invented-user-name',...stations]);
 const r=createRun(finaleEntry(entry));assert.equal(announcementClip(r).mask,mask);const board=championshipBoard(r);
 for(const [i,phrase]of ['AUDIT BELL','FIELD LOG','RELEASE REVIEW'].entries())assert.equal(board.includes(phrase),!!(mask&(1<<i)));
 assert(!board.includes('invented'));assert.deepEqual(createRun(readSave(JSON.stringify(snapshot(r)))).stationReceipt,r.stationReceipt);
}
assert.equal(readStationReceipt('direct'),null);assert.equal(normalizeStationReceipt({version:1,route:'shed',completed:true,stations:FILED_STATIONS},'drain'),null);
checks.push('All eight receipt subsets on both branches produce only their filed stations in board/audio and survive finale save/reload; direct and cross-branch entries invent nothing');
const before=records.get(STATION_RECEIPT_KEY);assert.equal(recordNightOrderReceipt('shed',[],{rehearsal:true}),false);assert.equal(records.get(STATION_RECEIPT_KEY),before);
recordNightOrderReceipt('shed',['audit-bell']);assert.deepEqual(readStationReceipt('drain').stations,FILED_STATIONS);assert.deepEqual(readStationReceipt('garage').stations,['audit-bell']);
checks.push('Rehearsal cannot replace a receipt; a later escape replaces only its own route and preserves the other branch');
let r=createRun();r.mode='playing';tick(r,7.7);assert.equal(r.announcement.active,null);step(r,{lookX:-2-r.player.yaw},1/120);tick(r,.7);assert.equal(r.announcement.active.id,'pa-0');assert.equal(r.rig.phase,'waiting');assert(!r.arrival.requested);
const start=r.announcement.active.started;r.mode='paused';tick(r,4);assert.equal(r.announcement.active.started,start);r.mode='playing';tick(r,1);assert(r.announcement.active);
const saved=snapshot(r);r=createRun(saved);assert(r.announcement.heard);assert.equal(r.announcement.active,null);r.mode='playing';tick(r,20);assert.equal(r.announcement.active,null);
checks.push('Neutral announcement yields to the nearby start control, then starts after looking away in unlimited real safety; pause freezes it and reload never replays it');
for(const block of [r=>r.messageTime=4,r=>r.ballAim.active=true,r=>r.player.focus=true,r=>r.arrival.requested=true,r=>r.player.y=12]){
 r=createRun();r.mode='playing';r.player.yaw=-2;tick(r,7.7);block(r);advanceAnnouncement(r,.01);assert.equal(r.announcement.active,null);
}
checks.push('New interaction guidance, aiming, listening, starting the round and leaving the overlook cancel the optional PA');
r=createRun();r.mode='playing';Object.assign(r.arrival,{requested:true});advanceAnnouncement(r,.01);assert(r.announcement.heard);assert.equal(r.announcement.active,null);
assert(createRun({checkpoint:1}).announcement.heard);assert(createRun({checkpoint:2}).announcement.heard);
checks.push('Fast starts and later checkpoints skip optional exposition without delaying gameplay');
records.set(STATION_RECEIPT_KEY,JSON.stringify({version:99,routes:{shed:{version:1,route:'shed',completed:true,stations:FILED_STATIONS}}}));assert.equal(readStationReceipt('garage'),null);
globalThis.localStorage={getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');}};assert.equal(recordNightOrderReceipt('shed',FILED_STATIONS),false);assert.equal(readStationReceipt('garage'),null);
checks.push('Unknown receipt formats and denied storage fall back to the neutral announcement without breaking play');
fs.mkdirSync('output/final-cut/announcement',{recursive:true});fs.writeFileSync('output/final-cut/announcement/rules.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
