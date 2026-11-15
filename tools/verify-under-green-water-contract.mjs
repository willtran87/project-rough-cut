import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WATERS} from '../web/under-green-layout.js';
import {waterState,validateWaterDefinitions,recurringSafeWindow} from '../web/under-green-water-state.js';
import {crossingWait} from '../web/under-green-navigation.js';
import {crossingAdvice} from '../web/under-green-guidance.js';
import {waterState as before,crossingWait as waitBefore} from './fixtures/under-green-water-before.js';

const out='output/under-green/water-contract';fs.mkdirSync(out,{recursive:true});
let parity=0,waitParity=0,rejections=0;
assert.equal(validateWaterDefinitions(WATERS),WATERS);
for(const water of WATERS){
  const times=new Set(Array.from({length:3601},(_,i)=>(i-720)/60));
  const boundaries=water.control==='cycle'?[0,water.lowSeconds,water.lowSeconds+1.5,10,12].map(t=>t-water.offset):[0,2,20,22];
  for(const t of boundaries)for(const epsilon of [-1e-7,0,1e-7])times.add(t+epsilon);
  for(const time of times)for(const bypass of [false,true])for(const bypassAt of [-99,0,20]){
    const state=waterState(water,time,bypass,bypassAt);
    assert.deepEqual(state,before(water,time,bypass,bypassAt));parity++;
    assert.deepEqual(JSON.parse(JSON.stringify(state)),state,'State must remain JSON-safe');
    assert.equal(state.danger,['surge','receding'].includes(state.phase));
    if(state.danger)assert.equal(state.safeFor,0);
    if(state.timing.kind==='timed')assert(state.remaining>=0&&state.safeFor>=0);
  }
  for(let time=-12;time<=24;time+=.125)for(const seconds of [.2,2,4.25,5.5,8])for(const bypass of [false,true]){
    assert.equal(crossingWait(water,time,seconds,bypass,0),waitBefore(water,time,seconds,bypass,0));waitParity++;
  }
}

const cycle=WATERS.find(w=>w.id==='spillway'),pump=WATERS.find(w=>w.control==='pump-return');
const invalid=[
  null, [], [{...cycle,id:''}], [{...cycle,name:''}], [cycle,{...cycle}],
  [{...cycle,control:undefined}], [{...cycle,control:'cycling'}],
  [{...cycle,lowSeconds:undefined}], [{...cycle,lowSeconds:NaN}],
  [{...cycle,lowSeconds:0}], [{...cycle,lowSeconds:8.5}],
  [{...cycle,offset:Infinity}], [{...cycle,x:NaN}], [{...cycle,depth:-1}],
  [{...cycle,width:0}], [{...cycle,axis:'z'}], [{...cycle,forward:0}],
  [{...cycle,lesson:'yes'}], [{...cycle,detour:''}],
  [{...pump,offset:0}], [{...pump,lowSeconds:3}], [{...pump,lesson:true}],
  [{...cycle,lesson:true},{...cycle,id:'other',lesson:true}],
];
for(const definitions of invalid){assert.throws(()=>validateWaterDefinitions(definitions));rejections++;}
assert.throws(()=>waterState({...cycle,control:'bad'},0),/unknown control/);

// Identity cannot secretly select a different timing or coaching rule.
for(const water of WATERS)for(const bypass of [false,true]){
  const renamed={...water,id:'renamed-outlet'};validateWaterDefinitions([renamed]);
  for(const time of [0,1,2,11,23]){
    assert.deepEqual(waterState(renamed,time,bypass,0),waterState(water,time,bypass,0));
    assert.equal(crossingWait(renamed,time,3,bypass,0),crossingWait(water,time,3,bypass,0));
    const player={x:water.x,y:water.y-water.depth/2-1};
    assert.deepEqual(crossingAdvice(player,renamed,waterState(renamed,time,bypass,0)),crossingAdvice(player,water,waterState(water,time,bypass,0)));
  }
}

// A legitimate new duration reaches every pure consumer without another edit.
const changed={...cycle,id:'new-crossing',lowSeconds:6};validateWaterDefinitions([changed]);
assert.equal(recurringSafeWindow(changed),7.5);
assert.equal(waterState(changed,-changed.offset).safeFor,7.5);
assert.equal(crossingWait(changed,-changed.offset,6.75,false,0),0);
assert.equal(waterState(changed,7.5-changed.offset).danger,true);
assert.equal(waterState({...changed,lesson:true},-changed.offset).safeFor,7.5,'Lesson flag must not silently alter timing');

const report={passed:true,parity,waitParity,rejections,checks:['All existing state fields match frozen original at dense samples and exact transitions','Joe waiting decisions match frozen original','Malformed authoring rejected','Renamed identities preserve timing, planning and coaching','Changed duration shared by simulation and navigation']};
fs.writeFileSync(out+'/rules.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
