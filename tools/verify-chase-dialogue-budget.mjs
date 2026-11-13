import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {createJoeReactions} from '../web/back-nine-reactions.js';
import {createChatterGate} from '../web/message-presentation.js';
import {updateService} from '../web/chase-service.js';
import {COURSE} from '../web/back-nine-course.js';
import {encounterAllows} from '../web/chase-encounter.js';
const checks=[];
{
 const r=createRun();r.encounter.updated=true;r.encounter.owner='cruise';
 for(const age of [0,.3,.79,.8,1,3]){r.encounter.age=age;assert.equal(encounterAllows(r,'dialogue'),age>=.8);assert(encounterAllows(r,'ram'),'Dialogue settling does not delay pursuit');}
 r.joe.ram.choiceUntil=r.time+2;assert(!encounterAllows(r,'dialogue'),'Tactical selection is preparation, not a dialogue slot');r.joe.ram.choiceUntil=0;
 r.encounter.owner='attack';r.encounter.age=9;assert(!encounterAllows(r,'dialogue'));
 checks.push('brief cruise transitions cannot flash dialogue; stable calm opens a slot without delaying attacks');
}
{
 const r=createRun();r.mode='driving';r.time=20;Object.assign(r.encounter,{updated:true,owner:'cruise',age:1,wasHidden:true});
 const gate=createChatterGate();let selected=0;const choose=()=>{selected++;return 'JOE: The grass keeps your delivery receipt.';};
 assert(encounterAllows(r,'dialogue'));assert(!encounterAllows(r,'dialogue-start'));
 assert.equal(gate(r,choose,{canStart:encounterAllows(r,'dialogue-start')}),'');assert.equal(selected,0);
 r.encounter.wasHidden=false;const line=gate(r,choose,{canStart:encounterAllows(r,'dialogue-start')});assert(line);assert.equal(selected,1);
 r.time+=.2;r.encounter.wasHidden=true;assert.equal(gate(r,choose,{canStart:false}),line,'Brief uncertain sight does not erase an active line');
 r.encounter.owner='search';assert.equal(gate(r,choose,{blocked:!encounterAllows(r,'dialogue'),canStart:false}),'','Actual search silence takes priority');
 assert.equal(selected,1);checks.push('pending sight-loss transition cannot start a flashing taunt; admission is separate from interruption');
}
const make=()=>{const r=createRun();r.mode='driving';r.grace=0;r.time=20;return r;};
{
 const r=make(),gate=createChatterGate();let selections=0;
 const reactions=createJoeReactions((token,kind)=>{selections++;return kind;});reactions.observe(r);
 assert.equal(gate(r,()=> 'JOE: The grass keeps its records.'),'JOE: The grass keeps its records.');
 r.time=25;r.events.push({type:'contact',damage:10,time:25});reactions.observe(r);
 assert.equal(gate(r,()=>reactions.caption(r)),'');assert.equal(selections,0,'A closed global slot must not consume a reaction');
 r.time=55;r.events.push({type:'shortcut',time:55});reactions.observe(r);
 const before=JSON.stringify(r),line=gate(r,()=>reactions.caption(r));assert.match(line,/shortcut/);assert.equal(selections,1,'A fresh reaction gets the next available slot, without a second cooldown');
 for(let i=0;i<120;i++)assert.equal(gate(r,()=>{throw Error('Must not select while a line is displayed');}),line);
 assert.equal(JSON.stringify(r),before);assert.equal(gate(r,()=>reactions.caption(r),{blocked:true}),'');
 assert.equal(gate(r,()=>reactions.caption(r)),'','Interrupted line never resumes');
 checks.push('shared budget selects only displayed lines; fresh event at 35 seconds; stable repaint; urgent interruption');
}
{
 const r=make(),gate=createChatterGate({duration:t=>Math.max(3.5,Math.min(6,t.length/24))});let calls=0;
 const choose=()=>{calls++;return 'JOE: '+ 'The lawn keeps your records. '.repeat(4);};
 for(const opts of [{blocked:true},{enabled:false}])assert.equal(gate(r,choose,opts),'');
 r.mode='paused';assert.equal(gate(r,choose),'');assert.equal(calls,0);
 r.mode='driving';const text=gate(r,choose);assert(text);r.time=24;assert.equal(gate(r,choose),text,'Long line gets readable time');
 r.time=26.1;assert.equal(gate(r,choose),'');assert.equal(calls,1);checks.push('no selection while disabled/paused; bounded text-length reading time');
}
for(const visible of [true,false]){
 const r=make(),reactions=createJoeReactions((_,kind)=>kind);Object.assign(r.cart,{...COURSE.checkpoints[0],health:50,speed:0});
 r.hunt.occluded=!visible;r.joe.seenAge=visible?0:5;reactions.observe(r);
 for(let i=0;i<60;i++){r.time+=1/60;updateService(r,{brake:true},1/60);reactions.observe(r);assert.equal(reactions.caption(r),'','Service interaction keeps its space');}
 assert.equal(r.cart.health,55);assert.equal(r.service.applied[0],5);
 r.cart.y+=6;updateService(r,{brake:false},0);reactions.observe(r);
 const line=reactions.caption(r);if(visible)assert.match(line,/repair/);else assert.equal(line,'','Hidden repairs do not grant Joe knowledge');
 r.time+=9;reactions.observe(r);assert.equal(reactions.caption(r),'');
 checks.push(visible?'actual witnessed partial service reacts after departure':'actual concealed service stays silent');
}
{
 const r=make(),c=createJoeReactions((_,kind)=>kind);c.observe(r);r.cart.health+=20;c.observe(r);assert.equal(c.caption(r),'','Checkpoint health gift is not a service repair');
 for(const owner of ['attack','search','relief','recovery','checkpoint','intercept','diversion','tension','opening','gather','finale']){r.encounter.updated=true;r.encounter.owner=owner;assert(!encounterAllows(r,'dialogue'));}
 checks.push('no fabricated service from checkpoint gifts; all encounter priorities remain quiet');
}
console.log(JSON.stringify({passed:true,checks}));
