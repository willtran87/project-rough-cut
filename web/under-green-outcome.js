import {WATERS,waterState,waterLocal,keeperInside} from './under-green-course.js';
import {sluiceObstruction,SLUICE_RECOVERY} from './under-green-sluice.js';

// Called only after authoritative blade contact. This describes observed context,
// never guesses intent or changes attack, recovery, checkpoint or pursuit rules.
export function captureFailure(r){
 const cause='Joe’s scythe caught you.';
 if(r.closing)return {kind:'closing',cause:cause+' The sluice had not sealed yet.',advice:'Buy more space before using the release, then stay inside until the barrier is secured.'};
 if(r.sluiceBlocked&&keeperInside(r.player)&&sluiceObstruction(r))return {
  kind:'occupied-sluice',cause:cause+(sluiceObstruction(r)==='room'?' He was inside the unsealed keeper room.':' The sluice threshold was still blocked.'),
  advice:SLUICE_RECOVERY
 };
 const hit=[...r.events].reverse().find(e=>e.type==='water-hit'&&r.time-e.time>=0&&r.time-e.time<=4&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Math.hypot(r.player.x-e.x,r.player.y-e.y)<=6);
 const water=hit&&WATERS.find(w=>w.id===hit.id);
 if(water)return {kind:'after-surge',water:water.id,cause:cause+` A surge at ${water.name.toLowerCase()} pushed you back just before the sweep.`,advice:water.detour?'Wait behind the striped bank for a full crossing window, or take the marked dry route before Joe reaches you.':'Wait behind the striped bank for a full crossing window. If Joe is close, leave the bank and make space first.'};
 const bank=WATERS.find(w=>{
  const p=waterLocal(r.player,w);
  return w.detour&&r.player.speed<.2&&Math.abs(p.x)<w.width/2+1&&Math.abs(p.y)>w.depth/2&&Math.abs(p.y)<w.depth/2+2.5&&waterState(w,r.time,r.bypass,r.bypassAt).danger;
 });
 if(bank)return {kind:'blocked-bank',water:bank.id,cause:cause+` The ${bank.name.toLowerCase()} crossing was still pressurized.`,advice:'Take the marked dry route before Joe reaches the bank. Waiting for water is only safe while you have room to escape.'};
 if(r.player.crouched)return {kind:'crouched',cause:cause+' Crouching left you within the blade’s sweep.',advice:'Move sideways when Joe plants his feet, or put solid cover between you and the blade.'};
 return {kind:'sweep',cause,advice:'Move sideways when Joe plants his feet. His committed sweep leaves a short opening to get past him.'};
}

export function retryProgress(){
 return 'Every attempt starts at the drain entrance. The pump, record and pursuit reset.';
}
