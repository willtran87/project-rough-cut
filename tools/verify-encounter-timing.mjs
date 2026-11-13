import assert from 'node:assert/strict';
import {advanceCartTimer,courseSoundMix} from '../web/encounter-timing.js';
const fresh=()=>({phase:'winding',remaining:4,ringRemaining:6});
for(const hz of [20,60,144]){
  const timer=fresh();let rings=0,ringTime=0,expiry=0;
  for(let i=1;i<=hz*11;i++){
    const result=advanceCartTimer(timer,1/hz);
    if(result.rang){rings++;ringTime=i/hz;}
    if(result.expired){expiry=i/hz;break;}
  }
  assert.equal(rings,1);assert(Math.abs(ringTime-4)<1e-6);assert(Math.abs(expiry-10)<1e-6);
}
const timer=fresh();assert(!advanceCartTimer(timer,3.9).rang);assert(advanceCartTimer(timer,.3).rang);assert(Math.abs(timer.ringRemaining-5.8)<1e-8);
assert.deepEqual(advanceCartTimer(timer,0),{rang:false,expired:false});
assert(advanceCartTimer(timer,20).expired);assert.equal(timer.ringRemaining,0);
const player={x:0,y:0},source={x:40,y:20};
const front=courseSoundMix(source,player,0),back=courseSoundMix(source,player,Math.PI);
assert(front.pan>0&&back.pan<0);assert(Math.abs(front.pan+back.pan)<1e-8);
assert.equal(courseSoundMix({x:0,y:40},player,0).pan,0);
assert(courseSoundMix({x:0,y:200},player,0).gain<courseSoundMix({x:0,y:20},player,0).gain);
assert(Number.isFinite(courseSoundMix(player,player,0).pan));
console.log(JSON.stringify({passed:true,checks:['Four-second fuse and six-second ring at 20/60/144 Hz','Frame overshoot, pause and expiry','Listener-relative stereo and bounded distance attenuation']}));
