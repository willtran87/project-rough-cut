import {RIG,lineClear,SECTORS} from './final-cut-course.js';

const middle=SECTORS.find(s=>s.id==='rough-1-2');
export function middleCoverWarning(r){
 const j=r.rig,p=r.player;
 return r.mode==='playing'&&!r.won&&p.y>41.5&&p.y<55.8&&p.x>9&&
  !r.cut.includes(middle.id)&&j.lane===1&&j.phase==='announce'&&j.attack?.axis!=='y';
}
export function restoreCrossings(value={}){
 return {middleAnnounced:value?.middleAnnounced===true,middleCut:value?.middleCut===true,forkReached:value?.forkReached===true};
}
export function advanceCrossings(r,event){
 if(r.won)return;
 const c=r.crossings;
 if(!c.middleAnnounced&&middleCoverWarning(r)){c.middleAnnounced=true;r.saveSerial++;event(r,'middle-warning');}
 if(!c.middleCut&&r.cut.includes(middle.id)){c.middleCut=true;r.saveSerial++;event(r,'middle-cover-cut');}
 if(!c.forkReached&&r.player.y>=55.8){c.forkReached=true;r.saveSerial++;event(r,'route-fork');}
}
export function crossingObjective(r){
 if(r.rig.trapApproach)return 'His next pass crosses the swale. Move toward the pavilion and keep clear.';
 if(r.player.y<55.8)return 'Cross the middle strip behind his pass. Rough will not stop the reels.';
 if(r.player.y<73)return 'Reach the pavilion: take the bank walk or the open crossing. Balls can call his next pass away.';
 return 'Call Joe across the flooded swale: let him see you from its west bank, or use the pavilion bell.';
}
// The bank shelters the approach, not the final crossing. Expose this fact in
// diagnostics without ever labeling the whole path safe from a moving mower.
export function crossingState(r){
 return {...r.crossings,middleWarning:middleCoverWarning(r),
  atFork:r.player.y>=55.8&&r.player.y<61&&r.player.x>10,
  behindBank:r.player.y>55.7&&r.player.y<58&&r.player.x>-6&&r.player.x<10&&
   Math.abs(r.rig.y-66)<RIG.halfWidth&&!lineClear(r.player,r.rig)};
}
