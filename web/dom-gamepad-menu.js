import {createGamepadSession} from './gamepad-session.js';
// Shared DOM adapter. Gameplay and canvas menus retain their own input profiles.
// Call every input tick, including while the menu is hidden, to consume held
// buttons across transitions and require neutral input after reconnection.
export function createDOMGamepadMenu({root,onBack=()=>{},onStart=()=>{},onDisconnect=()=>{}}){
 const session=createGamepadSession();let previous=[],heldDirection='',repeatAt=0,clock=0;
 const visible=element=>{
  if(element.disabled||element.closest('[hidden],[inert]')||!element.getClientRects().length)return false;
  for(let parent=element.parentElement;parent&&parent!==root;parent=parent.parentElement){
   if(parent.tagName==='DETAILS'&&!parent.open&&element!==parent.querySelector(':scope > summary'))return false;
  }
  return getComputedStyle(element).visibility!=='hidden';
 };
 const items=()=>[...root.querySelectorAll('button,a[href],summary,input:not([type=hidden]),select,textarea,[tabindex="0"]')].filter(visible);
 function focus(element){element?.focus({preventScroll:true});element?.scrollIntoView({block:'center',behavior:'instant'});}
 function adjust(element,direction){
  if(element?.matches('input[type=range]')){
   const min=Number(element.min)||0,max=Number(element.max)||100;
   const increment=element.step==='any'?(max-min)/20:Number(element.step)||1;
   element.value=String(Math.max(min,Math.min(max,Number(element.value)+direction*increment)));
  }else if(element?.matches('select')){
   const options=[...element.options].filter(option=>!option.disabled),index=options.indexOf(element.selectedOptions[0]);
   element.value=options[Math.max(0,Math.min(options.length-1,index+direction))]?.value??element.value;
  }else return false;
  element.dispatchEvent(new Event('input',{bubbles:true}));element.dispatchEvent(new Event('change',{bubbles:true}));return true;
 }
 return {update(pad,active,dt=1/60){
  clock+=Math.max(0,Math.min(.1,dt));
  const frame=session.update(pad,active);
  if(!frame.connected){if(frame.disconnected)onDisconnect();previous=[];heldDirection='';root.removeAttribute('data-gamepad');return false;}
  const buttons=frame.buttons,axes=pad.axes||[];
  if(frame.boundary){previous=buttons;heldDirection='';}
  if(!frame.ready){previous=buttons;return true;}
  const edge=index=>buttons[index]&&!previous[index];
  if(edge(9)){previous=buttons;heldDirection='';onStart();return true;}
  if(active){
   root.dataset.gamepad='true';const list=items();let current=document.activeElement;
   if(!list.includes(current)){focus(list[0]);current=document.activeElement;}
   const bounds=current?.getBoundingClientRect();
   if(bounds&&(bounds.top<0||bounds.bottom>innerHeight))current.scrollIntoView({block:'center',behavior:'instant'});
   const vertical=buttons[12]?-1:buttons[13]?1:Math.abs(axes[1]||0)>.55?Math.sign(axes[1]):0;
   const horizontal=buttons[14]?-1:buttons[15]?1:Math.abs(axes[0]||0)>.55?Math.sign(axes[0]):0;
   const direction=vertical?'v'+vertical:horizontal?'h'+horizontal:'';
   if(direction&&(direction!==heldDirection||clock>=repeatAt)){
    if(!vertical&&!adjust(current,horizontal))focus(list[(list.indexOf(current)+horizontal+list.length)%list.length]);
    if(vertical)focus(list[(list.indexOf(current)+vertical+list.length)%list.length]);
    repeatAt=clock+(direction===heldDirection ? .16 : .38);
   }
   heldDirection=direction;
   if(edge(0)&&!document.activeElement?.matches('input[type=range],select'))document.activeElement?.click();
   if(edge(1)){
    const details=document.activeElement?.closest('details[open]');
    if(details){details.open=false;focus(details.querySelector('summary'));}else onBack();
   }
  }else{heldDirection='';root.removeAttribute('data-gamepad');}
  previous=buttons;return active;
 }};
}
