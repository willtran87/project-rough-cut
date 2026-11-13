import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {chaseMessages} from '../web/back-nine-messages.js';
import {createChatterGate,levelOneMessage} from '../web/message-presentation.js';
import {createDefeatPicker,DEFEAT_LINES,defeatContext} from '../web/defeat-dialogue.js';

const run=()=>{const r=createRun();r.mode='driving';r.time=20;r.grace=0;return r;};
const r=run();r.grace=2;
// Test an audible engine, not the distant working-mower opening spawn.
Object.assign(r.joe,{x:10,y:40});
assert.deepEqual(chaseMessages(r),{banner:'',sound:'',dialogue:'',soundUrgent:false});
assert.match(chaseMessages(r,{soundCaptions:true}).sound,/Diesel/);
r.grace=0;r.joe.ram.phase='lineup';r.joe.ram.age=.8;
assert.equal(chaseMessages(r).banner,'');
assert.equal(chaseMessages(r).sound,'');
assert.match(chaseMessages(r,{soundCaptions:true}).sound,/engine rises/);
r.joe.ram.phase='none';r.message='Both relays online · garage shutter powered. Checkpoint saved.';r.messageTime=4;
assert.match(chaseMessages(r).banner,/Both relays online/);
r.story.cue='JOE: You are late.';r.story.cueTime=3;
assert.match(chaseMessages(r).banner,/Both relays online/,'An objective wins over dialogue');
r.foot={...r.cart,invulnerable:3};assert.match(chaseMessages(r).banner,/CART WRECKED/);
r.mode='dying';assert.equal(chaseMessages(r).banner,'Run down by Joe.');
r.mode='sealing';r.foot.invulnerable=0;assert.match(chaseMessages(r).banner,/shutter closing/);
r.mode='driving';r.message='He saw you. The engine turns back.';
assert.match(chaseMessages(r).banner,/Distraction lost/);
r.message='He overshot. Cut across his tracks and find cover!';
assert.match(chaseMessages(r).banner,/CHARGE MISSED/);
for(const text of ['THE ENGINE STUTTERS','Joe is changing his patrol route.','MOWER COUGHS // ENGINE LOSING POWER','STATUS: ROUTINE WALKTHROUGH','SOUTH GATE // SOMETHING KNOCKS BACK','A SECOND BELL ANSWERS FROM THE STATION','THE APPARITION DRAWS A SHARP BREATH'])assert.equal(levelOneMessage(text),'');
for(const text of ['KEY ACQUIRED','JOE HAS EYES ON YOU // REACH SOLID COVER','MOWER DECK LOWERS','CHECK 2/3 COMPLETE'])assert.equal(levelOneMessage(text),text);

const gate=createChatterGate(),g=run();g.time=0;
assert.equal(gate(g,'JOE: One'),'');g.time=12;assert.equal(gate(g,'JOE: One'),'JOE: One');
g.time=15.6;assert.equal(gate(g,'JOE: One'),'');g.time=46;assert.equal(gate(g,'JOE: Two'),'');
g.time=47;assert.equal(gate(g,'JOE: Two'),'JOE: Two');
assert.equal(gate(g,'JOE: Two',{blocked:true}),'');
assert.equal(gate(g,'JOE: Two'),'','Urgent interruption never resumes stale dialogue');
g.time=90;assert.equal(gate(g,'JOE: One'),'','No repeated line within a run');
assert.equal(gate(g,'JOE: Three',{enabled:false}),'');
assert.equal(gate(g,'JOE: Three'),'JOE: Three');g.mode='paused';assert.equal(gate(g,'JOE: Three'),'');
g.mode='driving';assert.equal(gate(g,'JOE: Three'),'');

const lines=Object.values(DEFEAT_LINES).flat();assert.equal(lines.length,38);assert.equal(new Set(lines.map(x=>x.join('\n'))).size,38);
const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
let pick=createDefeatPicker({storage}),last='';
for(const [context,evidence]of [['general',{}],['objectives',{objectives:true}],['damage',{damage:true}],['shortcut',{shortcut:true}],['foot',{onFoot:true}],['near_exit',{nearExit:true,onFoot:true}]]){
 assert.equal(defeatContext(evidence),context);const cycle=new Set(),count=context==='general'?8:14;
 // New storage for each complete-deck check; reload halfway through.
 const values=new Map(),st={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};let deck=createDefeatPicker({storage:st});
 for(let i=0;i<count;i++){if(i===4)deck=createDefeatPicker({storage:st});const token={},v=deck(token,evidence);assert.deepEqual(deck(token,evidence),v);assert(!cycle.has(v.id),'No repeat before eligible deck is exhausted');cycle.add(v.id);}
 assert.equal(cycle.size,count);
 for(let i=0;i<40;i++){if(i%5===0)pick=createDefeatPicker({storage});const result=pick({},evidence);assert.notEqual(result.id,last);assert.equal(result.context,context);last=result.id;}
}
for(const raw of ['null','[]','5','{bad','{"bags":{"general":["unknown"]}}','{"bags":{"general":["general-0","general-0"]}}']){
 const broken={getItem:()=>raw,setItem(){}};assert(createDefeatPicker({storage:broken})({}).lines.length===2);
}
assert(createDefeatPicker({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}})({}).lines.length===2);
console.log(JSON.stringify({passed:true,defeatLines:lines.length,persistedSelections:240,checks:['quiet defaults','separate sound captions','charge/escape/objective priority','death priority','35-second dialogue cooldown','interruption and pause','context pools','persistent shuffled decks','stable redraw','unavailable storage']}));
