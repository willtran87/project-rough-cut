const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
export function courseExitRelease(frame){
 const checks=['audit-bell','field-log','release-review'].every(id=>(frame.completed||[]).includes(id));
 const progress=frame.sealing?Math.max(0,Math.min(1,frame.exitProgress||0)):frame.exitComplete?1:0;
 const shed=checks&&frame.hasKey&&frame.exitRoute==='shed'?progress:0;
 const drain=checks&&frame.valveOpen&&frame.exitRoute==='drain'?progress:0;
 return {shedBolt:smooth(0,.22,shed),shedDoor:smooth(.18,.90,shed)*1.3,
   drainUnlocked:!!frame.valveOpen,drainLift:smooth(.16,.94,drain)*1.3,
   drainDrum:smooth(.16,.94,drain)*1.3/.12};
}
