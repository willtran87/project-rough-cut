import {actionBindings,bindingCodeAllowed,keyLabel} from './control-profiles.js';
import {readRecord,patchRecord,CAMPAIGN_KEY} from './preference-store.js';

// DOM keyboard editor. Profiles own action meanings; the existing resolver owns
// validation/defaults. Writes own this profile and its migration marker only.
export function bindKeyboardSettings(root,{profile,stored,storageField,labels,onChange=()=>{}}){
 const bindings=actionBindings(profile,stored),selects=new Map();
 let pending={};
 const codes=[...Array.from({length:26},(_,i)=>'Key'+String.fromCharCode(65+i)),
  ...Array.from({length:10},(_,i)=>'Digit'+i),...Array.from({length:10},(_,i)=>'Numpad'+i),
  'Space','Enter','ShiftLeft','ShiftRight','ControlLeft','ControlRight','AltLeft','AltRight',
  'Backspace','Delete','Insert','Home','End','PageUp','PageDown','BracketLeft','BracketRight',
  'Comma','Period','Slash','Semicolon','Quote','Minus','Equal','Backquote','Backslash',
  'NumpadAdd','NumpadSubtract','NumpadMultiply','NumpadDivide','NumpadDecimal'];
 for(const code of Object.values(bindings))if(!codes.includes(code))codes.push(code);
 const fields=root.querySelector('[data-keyboard-fields]'),status=root.querySelector('[data-keyboard-status]');
 function sync(){
  for(const [action,select]of selects){
   select.value=bindings[action];
   for(const option of select.options)option.disabled=Object.entries(bindings).some(([id,code])=>id!==action&&code===option.value);
  }
 }
 function save(changes){
  // Merge only locally edited actions into the latest stored profile. Retain
  // failed writes so a later successful edit also persists those changes.
  const record=readRecord(CAMPAIGN_KEY,{[storageField]:bindings});
  const version=profile==='onFoot'&&storageField==='keyboardBindings'?(record.keyboardBindingsVersion||0):2;
  const edits={...pending,...changes},next={...actionBindings(profile,record[storageField],version),...edits};
  if(new Set(Object.values(next)).size!==Object.keys(next).length){
   status.textContent='That key was assigned elsewhere. Choose another key; your saved controls are unchanged.';sync();return;
  }
  // The version belongs to the binding transaction. Saving it separately can
  // leave an intentional Enter mapping looking like the old default profile.
  const changesToStore={[storageField]:next};
  if(profile==='onFoot'&&storageField==='keyboardBindings')changesToStore.keyboardBindingsVersion=3;
  const saved=patchRecord(CAMPAIGN_KEY,changesToStore);
  pending=saved?{}:edits;Object.assign(bindings,next);
  status.textContent=saved?(profile==='onFoot'?'On-foot keyboard controls saved.':'Keyboard controls saved for this chapter.'):'Keyboard controls apply for this session. Browser storage is unavailable.';
  sync();onChange(bindings);
 }
 for(const [action,title]of Object.entries(labels)){
  if(!(action in bindings))continue;
  const label=document.createElement('label'),name=document.createElement('span'),select=document.createElement('select');
  name.textContent=title;select.dataset.binding=action;select.setAttribute('aria-label',title);
  for(const code of codes.filter(bindingCodeAllowed)){const option=document.createElement('option');option.value=code;option.textContent=keyLabel(code);select.append(option);}
  select.addEventListener('change',()=>{
   const code=select.value;
   if(!bindingCodeAllowed(code)||Object.entries(bindings).some(([id,key])=>id!==action&&key===code)){
    status.textContent='That key is already assigned or reserved. Choose another key.';sync();return;
   }
   save({[action]:code});
  });
  label.append(name,select);fields.append(label);selects.set(action,select);
 }
 root.querySelector('[data-keyboard-reset]').addEventListener('click',()=>save(actionBindings(profile)));
 sync();return {bindings,sync};
}
