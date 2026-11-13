import {CONTROL_PROFILES,keyLabel} from './control-profiles.js';

export const BACK_NINE_SLIDES=[
 {src:'./assets/optimized/back-nine-opening/01-other-side.webp',title:'The other side',kicker:'BEYOND THE MAINTENANCE SHED',
  lines:['The shed door closes behind you. For a moment, you think the shift is over.','Then the lanterns reveal another nine holes. Every staff cart is here. None of the staff are.'],
  alt:'The closed shed opens onto an abandoned cart yard and a wet lane disappearing into the open course.',sound:'Wind under the awning. Loose metal taps against timber.'},
 {src:'./assets/optimized/back-nine-opening/02-one-cart-side-profile.webp',title:'One cart still starts',kicker:'THE SERVICE YARD',
  lines:['A key waits in the ignition. The dashboard gives a weak green flicker.','The service garage is on the far side of the course. This cart might get you there.'],
  alt:'A pale grey cart with cracked olive seats, exposed wiring and a key in its ignition sits beneath an amber maintenance lamp.',sound:'A starter clicks. The little engine catches.'},
 {src:'./assets/optimized/back-nine-opening/03-offline.webp',title:'The route is offline',kicker:'TWO RELAYS · ONE SHUTTER',
  lines:['The garage shutter has no power. Two relay shelters stand between here and the clubhouse.','Follow the maintenance lane through both. The shutter still closes from inside—if you can reach it.'],
  alt:'Two dark indicator lamps sit beside a worn map linking two relay shelters to a shuttered service garage.',sound:'The cart idles. Beyond the trees, a deeper engine turns over.'},
 {src:'./assets/optimized/back-nine-opening/04-larger-engine.webp',title:'Something larger wakes',kicker:'THE INDUSTRIAL MOWER',
  lines:['Joe sits behind cutting decks wider than your cart, still wearing his office clothes.','“The sprint isn’t over.” He says it as though you have left a meeting early.'],
  alt:'Joe sits inside the rusted cage of a heavy olive industrial mower, its wide cutting decks and headlights emerging from the mist.',sound:'Diesel catches. Belts chatter beneath a heavy mechanical growl.'},
 {src:'./assets/optimized/back-nine-opening/05-seen-you.webp',title:'He has seen you',kicker:'THE BACK NINE',
  lines:['The headlights turn. His engine climbs, and the cart’s loose panels begin to rattle.','Two relays. One shutter. Do not let him reach you.'],
  alt:'From inside the cart, the player sees Joe turn his industrial mower toward the lane, headlights cutting through the rain and mist.',sound:'The mower revs. The cart shudders under your hands.'},
];

export function backNineControls(method='keyboard',foot=false,bindings=CONTROL_PROFILES.chase){
 if(foot)return backNineHint(method,true,bindings)+'. The camera follows your heading.';
 if(method==='touch')return 'Drive: Drive / Reverse · steer: ◀ ▶ · hold Brake to stop or service · Rear looks back.';
 if(method==='gamepad')return 'Left stick steers · RT accelerates · LT reverses · hold B to brake or service · R3 looks back · Menu pauses.';
 const label=id=>keyLabel(bindings[id]);
 return `${label('move_up')} / ↑ accelerate · ${label('move_left')} ${label('move_right')} / ← → steer · ${label('move_down')} / ↓ brake, then reverse · hold ${label('brake')} / ${label('interact')} to brake or service · ${label('look_back')} looks back · Esc pauses.`;
}

export function backNineHint(method='keyboard',foot=false,bindings=CONTROL_PROFILES.chase){
 if(method==='gamepad')return foot?'Left stick turn / run · R3 glance · Hold B to use':'RT drive · Left stick steer · LT reverse · Hold B to brake · R3 glance';
 if(method==='touch')return foot?'Arrows turn · Run / Back · Rear glance · Hold Use':'Drive / Reverse · Arrows steer · Hold Brake · Rear glance';
 const label=id=>keyLabel(bindings[id]);
 return foot?`${label('move_up')}/${label('move_down')} run / back · ${label('move_left')}/${label('move_right')} turn · ${label('look_back')} glance · ${label('interact')} / ${label('brake')} use`:`${label('move_up')} / ↑ drive · ${label('move_left')} ${label('move_right')} / ← → steer · ${label('move_down')} / ↓ reverse · ${label('interact')} / ${label('brake')} brake · ${label('look_back')} glance`;
}

export function backNineInstruction(text,method='keyboard',bindings=CONTROL_PROFILES.chase){
 const use=method==='gamepad'?'B':method==='touch'?'Use':`${keyLabel(bindings.interact)} / ${keyLabel(bindings.brake)}`;
 return text.replace(/\b(hold|release) Use\b/gi,(_,action)=>action+' '+use);
}

export function backNineMovement(method='keyboard',bindings=CONTROL_PROFILES.chase){
 if(method==='gamepad')return 'Left stick turns and runs.';
 if(method==='touch')return 'Arrows turn; Run moves.';
 return `${keyLabel(bindings.move_up)}/${keyLabel(bindings.move_down)} run/back; ${keyLabel(bindings.move_left)}/${keyLabel(bindings.move_right)} turn.`;
}

export function paintBackNineBrief(run,method,review=false,bindings=CONTROL_PROFILES.chase){
 const root=document.getElementById('back-nine-guide'),checkpoint=run.checkpoint;
 root.hidden=run.mode!=='briefing'&&!(run.mode==='paused'&&review);document.getElementById('guide-controls').hidden=root.hidden;if(root.hidden)return;
 document.getElementById('guide-situation').textContent=checkpoint===0?'Behind the shed, a battered cart still runs. Joe has a bigger mower. Restore power at two relay shelters, then reach the clubhouse garage before he catches you.':checkpoint===1?'You made it to the maintenance shelter. One relay is online, and the service charger can repair your cart. Joe is still on the course.':'Both relays are online. The night-range shelter has a service charger. The garage has power; you still need to reach it.';
 document.getElementById('guide-goal').textContent=checkpoint===0?'YOUR GOAL: 2 RELAYS → SERVICE GARAGE':checkpoint===1?'NEXT: NIGHT-RANGE RELAY → GARAGE':'NEXT: PARK INSIDE THE POWERED GARAGE';
 if(run.mode==='paused')document.getElementById('guide-situation').textContent=run.foot?'Your cart is wrecked. You are on foot, but the escape is still possible. Keep restoring the relays, then get inside the service garage.':'Your escape is paused. The relays you have restored remain online. Choose your next route before returning to the chase.';
 if(run.foot&&checkpoint===2)document.getElementById('guide-goal').textContent='NEXT: RUN INSIDE THE GARAGE · HOLD USE';
 document.getElementById('guide-foot').hidden=!run.foot;
 document.getElementById('guide-garage').textContent=run.foot?'With both relays online, stop at the garage and hold Use to free the jammed shutter. Run fully inside and hold Use again to lock it.':'With both relays online, stop at the garage release and hold the brake to free the jammed shutter. Park fully inside and hold again to lock it.';
 document.getElementById('guide-foot-look').textContent=method==='gamepad'?'The camera follows your heading; hold R3 to glance behind.':method==='touch'?'Arrows turn; the camera follows. Hold Rear to glance behind.':`${keyLabel(bindings.move_left)}/${keyLabel(bindings.move_right)} or left/right turn you, just like the cart. The camera follows; hold ${keyLabel(bindings.look_back)} to glance behind.`;
 for(const [i,li]of [...root.querySelectorAll('li[data-relay]')].entries()){
   li.dataset.complete=String(i<checkpoint);li.querySelector('span').textContent=i<checkpoint?'ONLINE · power restored':'Pass through the amber-lit shelter. The relay reconnects automatically.';
 }
 document.getElementById('guide-controls').textContent=backNineControls(method,!!run.foot,bindings);
}
