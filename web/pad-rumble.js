// Shared controller rumble. Supplementary only: every call is safe with no pad,
// no actuator, a rejected promise or reduced motion. Strength comes from the
// shared `rumble` setting (0 turns it off).
export function createRumble({strength=()=>.5,enabled=()=>true,clock=()=>performance.now()}={}){
 const failed=new WeakSet();let actuator=null,until=0,level=0;
 const stats={played:0,failures:0,last:null};
 const usable=pad=>{
  const a=pad?.connected?pad.vibrationActuator:null;
  return a&&typeof a.playEffect==='function'&&(!a.effects||Array.from(a.effects).includes('dual-rumble'))&&!failed.has(a)?a:null;
 };
 function stop(){if(actuator&&until>clock()){try{Promise.resolve(actuator.reset?.()).catch(()=>{});}catch{}}until=level=0;}
 // strong: low-frequency motor (impacts, engine). weak: high-frequency motor
 // (texture, footsteps). A weaker effect never cuts off a stronger one that is
 // still playing.
 function pulse(pad,{duration=120,strong=0,weak=0,kind='pulse'}={}){
  const scale=Math.max(0,Math.min(1,strength()));if(!enabled()||scale<=0)return false;
  const a=usable(pad);if(!a)return false;
  const now=clock(),power=Math.max(strong,weak)*scale;
  if(a===actuator&&now<until&&power<level)return false;
  actuator=a;until=now+duration;level=power;
  try{
   Promise.resolve(a.playEffect('dual-rumble',{startDelay:0,duration:Math.max(10,Math.min(1000,duration)),strongMagnitude:Math.max(0,Math.min(1,strong*scale)),weakMagnitude:Math.max(0,Math.min(1,weak*scale))})).catch(()=>{failed.add(a);stats.failures++;});
  }catch{failed.add(a);stats.failures++;return false;}
  stats.played++;stats.last=kind;return true;
 }
 // Continuous texture (engine, rough ground): call every frame with 0..1; it is
 // re-issued about eight times a second.
 let nextHum=0;
 function hum(pad,amount,{strong=.25,weak=.5}={}){
  const now=clock();if(amount<=.02||now<nextHum)return false;nextHum=now+120;
  return pulse(pad,{duration:150,strong:strong*amount,weak:weak*amount,kind:'hum'});
 }
 return {pulse,hum,stop,stats};
}
export const firstPad=()=>{try{return [...navigator.getGamepads()].find(p=>p?.connected)||null;}catch{return null;}};
