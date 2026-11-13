// Device/context boundaries require neutral input before accepting a new action.
// Shared by DOM menus and the original canvas/input profile; no gameplay mapping.
let foreground=true;
if(typeof window!=='undefined'){
 window.addEventListener('blur',()=>{foreground=false;});
 window.addEventListener('focus',()=>{foreground=true;});
}
export function createGamepadSession(){
 let connected=false,identity=null,scope=null,armed=false;
 return {update(pad,context,enabled=foreground&&(typeof document==='undefined'||!document.hidden)){
  if(!pad||pad.connected===false){const disconnected=connected;connected=false;identity=null;scope=null;armed=false;return {connected:false,ready:false,disconnected,buttons:[],boundary:disconnected};}
  const buttons=Array.from(pad.buttons||[],b=>!!b.pressed||(b.value||0)>.5);
  const neutral=!buttons.some(Boolean)&&Array.from(pad.axes||[]).every(axis=>Math.abs(axis)<.35);
  const id=`${pad.index??0}:${pad.id??''}`,boundary=!connected||id!==identity||scope!==context;
  if(!enabled)armed=false;else if(boundary)armed=neutral;else if(!armed&&neutral)armed=true;
  connected=true;identity=id;scope=context;
  return {connected:true,ready:armed,disconnected:false,boundary,buttons};
 },requireNeutral(){armed=false;}};
}
