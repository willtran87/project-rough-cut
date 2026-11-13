import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,objective} from '../web/back-nine-sim.js';
import {chaseMessages} from '../web/back-nine-messages.js';
import {actionBindings} from '../web/control-profiles.js';
import {backNineInstruction,backNineControls,backNineHint} from '../web/back-nine-opening.js';

const bindings=actionBindings('chase',{move_up:'KeyI',move_down:'KeyK',move_left:'KeyJ',move_right:'KeyL',interact:'KeyO',brake:'KeyB',look_back:'KeyU'});
const scenarios={
 garage:r=>{},
 closing:r=>r.finishHold=.3,
 record:r=>{r.story.near=0;},
 alarm:r=>{r.decoys.near=0;},
 ejection:r=>{r.foot.invulnerable=2;}
};
let checked=0;
for(const method of ['keyboard','gamepad','touch'])for(const [name,prepare]of Object.entries(scenarios)){
 const r=createRun(2);r.mode='driving';r.time=10;r.grace=0;r.messageTime=0;
 r.foot={x:0,y:740,invulnerable:0};Object.assign(r.joe,{x:0,y:700});r.story.near=-1;r.decoys.near=-1;prepare(r);
 const banner=chaseMessages(r,{method,bindings}).banner;
 assert.match(banner,method==='keyboard'?/hold O \/ B/i:method==='gamepad'?/hold B/i:/hold Use/i,`${name}/${method}: ${banner}`);
 assert.doesNotMatch(banner,/E \/ Space|W\/S|A\/D/);
 if(name==='ejection')assert.match(banner,method==='keyboard'?/I\/K.*J\/L/:method==='gamepad'?/Left stick/:/Arrows turn/);
 assert.match(backNineInstruction(objective(r),method,bindings),method==='keyboard'?/O \/ B/:method==='gamepad'?/hold B/:/hold Use/);
 checked++;
}
assert.match(backNineControls('keyboard',false,bindings),/I.*J L.*K.*B \/ O.*U/);
assert.match(backNineHint('keyboard',true,bindings),/I\/K.*J\/L.*U.*O \/ B/);
assert.match(backNineHint(),/W.*A D.*S.*E \/ Space.*Q/);
assert.equal(actionBindings('onFoot',{interact:'KeyT'}).interact,'KeyT');
assert.equal(actionBindings('chase',{move_up:'KeyQ',look_back:'KeyQ'}).move_up,'KeyW');
const result={passed:true,scenarios:checked,checks:['keyboard/gamepad/touch labels for garage, closure, record, alarm and ejection','default chase controls preserved','on-foot profile independent','conflicting stored keys rejected']};
fs.mkdirSync('output/chase-bindings',{recursive:true});fs.writeFileSync('output/chase-bindings/labels.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
