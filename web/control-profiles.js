// Shared action identities; physical defaults remain specific to the mode.
export const CONTROL_PROFILES=Object.freeze({
 onFoot:{move_up:'KeyW',move_down:'KeyS',move_left:'KeyA',move_right:'KeyD',sprint:'ShiftLeft',crouch:'KeyC',focus:'KeyR',look_back:'KeyQ',interact:'KeyE',chip:'Space',controls:'KeyH'},
 chase:{move_up:'KeyW',move_down:'KeyS',move_left:'KeyA',move_right:'KeyD',brake:'Space',look_back:'KeyQ',interact:'KeyE'}
});
const reserved=new Set(['Escape','KeyF','Tab','CapsLock','MetaLeft','MetaRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
export function bindingCodeAllowed(code){return typeof code==='string'&&code.length>0&&code.length<=32&&!reserved.has(code)&&!/^F\d{1,2}$/.test(code)&&code!=='Unidentified';}
export function actionBindings(profile,overrides={},version=3){
 const defaults=CONTROL_PROFILES[profile];if(!defaults)throw Error('Unknown control profile: '+profile);
 if(!overrides||typeof overrides!=='object')return {...defaults};
 const legacy=profile==='onFoot'&&version<3;
 const base=legacy?{...defaults,focus:'KeyQ',look_back:'KeyR'}:defaults;
 const result=Object.fromEntries(Object.entries(base).map(([id,code])=>[id,bindingCodeAllowed(overrides[id])?overrides[id]:code]));
 // Older saves can contain only changed keys or unrelated custom controls.
 // Retire the old Enter default without discarding those controls or stealing E.
 if(legacy&&version<2&&result.interact==='Enter'&&!Object.entries(result).some(([id,code])=>id!=='interact'&&code==='KeyE'))result.interact='KeyE';
 // Migrate the former default pair together; retain deliberately remapped keys.
 if(legacy&&result.focus==='KeyQ'&&result.look_back==='KeyR')Object.assign(result,{focus:'KeyR',look_back:'KeyQ'});
 return new Set(Object.values(result)).size===Object.keys(result).length?result:{...defaults};
}
export function keyLabel(code,style='compact'){
 if(style==='legacy'){const side={ShiftLeft:"L SHIFT",ShiftRight:"R SHIFT",ControlLeft:"L CTRL",ControlRight:"R CTRL",AltLeft:"L ALT",AltRight:"R ALT"};if(side[code])return side[code];return keyLabel(code).toUpperCase();}
 const labels={Space:'Space',ShiftLeft:'Shift',ShiftRight:'Right Shift',ControlLeft:'Ctrl',ControlRight:'Right Ctrl',AltLeft:'Alt',AltRight:'Right Alt',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',BracketLeft:'[',BracketRight:']',Comma:',',Period:'.',Slash:'/',Semicolon:';',Quote:"'",Minus:'-',Equal:'=',Backquote:'`',Backslash:'\\'};
 return labels[code]||(String(code).startsWith('Numpad')?'NUM '+String(code).slice(6).toUpperCase():String(code).replace(/^Key|^Digit/,'').replace(/([a-z])([A-Z])/g,'$1 $2'));
}

export function movementKeyLabel(bindings,style='compact'){
 const labels=['move_up','move_left','move_down','move_right'].map(id=>keyLabel(bindings[id],style));
 return labels.join('')==='WASD'?'WASD':labels.join(' / ');
}

/** On-foot hold/toggle wording follows the actual input device's comfort mode. */
export function onFootActionVerb(action,device,comfort){
 if(!['crouch','sprint'].includes(action))throw new Error('Hold/toggle wording requires crouch or sprint');
 const toggle=action==='crouch'
  ? device!=='touch'&&comfort.crouchToggle
  : device==='touch'?comfort.touchSprintToggle:comfort.sprintToggle;
 return toggle?'Tap':'Hold';
}
