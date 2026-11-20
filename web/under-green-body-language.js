// Joe's readable intent on top of the baked walk and the weapon-driven attack
// acting: searching, spotting the player, committing to the chase, losing
// them, and guarding an opening. Presentation only: it reads the simulation's
// phase and sight flag and returns small extra chest/head rotations (radians).
// During windup, sweep and recover it adds only a wind-back that is released
// before the cut, so the collision-authoritative swing acting is unchanged.
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const KEYS=['chestPitch','chestRoll','chestYaw','headYaw','headPitch'];
// The pose Joe is trying to hold. `since` is seconds since sight changed.
export function bodyLanguageTarget(joe,{seen=false,since=9,lost=false,time=0,reduced=false}={}){
 const t={chestPitch:0,chestRoll:0,chestYaw:0,headYaw:0,headPitch:0,intent:'idle'},wave=reduced?0:1;
 const phase=joe.phase;
 if(phase==='absent'||phase==='enter'||phase==='blocked'||phase==='water-recovery')return t;
 if(phase==='windup'){
  // Rears back while the blade rises, then drops forward into the cut.
  const a=joe.age,back=smooth(a/.45)*(1-smooth((a-.72)/.2));
  t.chestPitch=-.09*back;t.headPitch=.06*back;t.intent='windup';return t;
 }
 if(phase==='sweep'||phase==='recover'){t.intent=phase;return t;}
 if(phase==='guard'){
  // Weight shifting from foot to foot, head cocked, watching the gap.
  t.chestPitch=.05;t.chestRoll=.045*Math.sin(time*1.7)*wave;t.headYaw=.07*Math.sin(time*1.7+.6)*wave;t.headPitch=-.05;t.intent='guard';return t;
 }
 if(seen){
  // Spot: a start upright, head up. Commit: shoulders down, leaning in.
  const spot=1-smooth(since/.55),commit=smooth((since-.3)/.6);
  t.chestPitch=-.14*spot+.115*commit;t.headPitch=.13*spot-.09*commit;t.chestRoll=.012*Math.sin(time*4.1)*commit*wave;
  t.intent=spot>.4?'spot':'commit';return t;
 }
 if(lost&&since<2.4){
  // Lose: pulls up short, shoulders sag, quick looks left and right.
  const fade=1-smooth((since-1.7)/.7);
  t.chestPitch=.085*fade;t.headYaw=.6*Math.sin(since*4.4)*fade*wave;t.chestYaw=.13*Math.sin(since*4.4-.5)*fade*wave;t.headPitch=-.03*fade;t.intent='lose';return t;
 }
 if(phase==='search'||phase==='water-wait'){
  // Search: stooped, sweeping the passage with head and shoulders, with a
  // hold at each end of the sweep rather than a metronome.
  const s=Math.sin(joe.age*1.25),held=Math.sign(s)*smooth(Math.abs(s)*1.6);
  t.chestPitch=.1;t.headYaw=.44*held*wave;t.chestYaw=.16*held*wave;t.headPitch=-.04;t.intent='search';return t;
 }
 return t;
}
export function createBodyLanguage(){
 const now=Object.fromEntries(KEYS.map(k=>[k,0]));let wasSeen=false,changedAt=-9,lost=false,fresh=true;now.intent='idle';
 return {
  reset(){fresh=true;wasSeen=false;changedAt=-9;lost=false;},
  update(joe,time,dt,reduced=false){
   const seen=joe.seen===true&&!['absent','enter','blocked'].includes(joe.phase);
   if(fresh){wasSeen=seen;changedAt=-9;lost=false;}
   if(seen!==wasSeen){wasSeen=seen;changedAt=time;lost=!seen;}
   const target=bodyLanguageTarget(joe,{seen,since:time-changedAt,lost,time,reduced}),ease=fresh?1:1-Math.exp(-dt*(target.intent==='spot'?16:7));fresh=false;
   for(const k of KEYS)now[k]+=(target[k]-now[k])*ease;
   now.intent=target.intent;now.active=KEYS.some(k=>Math.abs(now[k])>.0005);
   return now;
  }
 };
}
