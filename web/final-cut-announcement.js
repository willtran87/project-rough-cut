import {PA_LINES} from './final-cut-pa-lines.js';
import {FILED_STATIONS} from './night-order-receipt.js';
import {groundHeight} from './final-cut-arrival-layout.js';

export const PA_POSITION={x:-7.5,y:5};
export function receiptMask(r){return FILED_STATIONS.reduce((mask,id,i)=>mask|(r.stationReceipt?.stations.includes(id)?1<<i:0),0);}
export const announcementClip=r=>PA_LINES[receiptMask(r)];
export function championshipBoard(r){
 const lines=['FINAL ROUND','ASSOCIATE ANALYST'],mask=receiptMask(r);
 if(mask&1)lines.push('AUDIT BELL · FILED');
 if(mask&2)lines.push('FIELD LOG · RECEIVED');
 if(mask&4)lines.push('RELEASE REVIEW · SIGNED');
 if(!mask)lines.push('18 · THE FINAL CUT');
 return lines.join('\n');
}
export const createAnnouncement=(saved,skip=false)=>({heard:skip||saved?.heard===true,settled:0,active:null});
export const announcementSnapshot=r=>({heard:r.announcement.heard});
export function advanceAnnouncement(r,dt,interaction=false){
 const a=r.announcement,p=r.player;
 const available=r.mode==='playing'&&!r.won&&r.arrival.reached&&!r.arrival.requested&&groundHeight(p)>=3&&p.y<5.2&&
  !interaction&&!r.ballAim.active&&!p.focus&&r.messageTime<=0&&!r.drama.active&&!r.drama.pending;
 if(a.active){if(!available||r.time-a.active.started>=a.active.duration)a.active=null;return;}
 if(a.heard)return;
 // Starting the round immediately gives priority to the playable reveal.
 if(r.arrival.requested){a.heard=true;a.settled=0;r.saveSerial++;return;}
 a.settled=available&&p.speed<.15?a.settled+dt:0;
 if(a.settled<.65)return;
 const clip=announcementClip(r);a.heard=true;a.active={id:clip.id,started:r.time,duration:clip.duration+.15};r.saveSerial++;
}
export const announcementCaption=r=>r.announcement.active?`PA: “${announcementClip(r).text}”`:'';
