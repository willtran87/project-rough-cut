// Presentation only: the gameplay clock pauses with the run, so repeated
// renders cannot advance an interaction or restart its animation.
export function practiceStatus(frame){
 return frame.practiceDone||frame.practiceStage==='already_learned'?'complete':frame.practiceActive?'ready':'closed';
}
export function stationImpulse(frame,id){
 const beat=frame.stationFeedback;
 if(frame.reducedMotion||!beat||beat.id!==id)return 0;
 const t=(frame.time-beat.startedAt)/beat.duration;
 return t>=0&&t<1?Math.sin(t*Math.PI*5)*(1-t):0;
}

const clamp01=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp01(n);return n*n*(3-2*n);};
// Read only presentation from authoritative completion/hold clocks. An action
// never waits for its animation, and rendering cannot complete or repeat it.
export function stationMechanismPose(frame,id,kind){
 const done=frame.completed?.includes(id)||false;
 const activation=frame.activation?.id===id?frame.activation:null;
 const age=activation?Math.max(0,activation.duration-activation.timer):Infinity;
 const quiet=kind==='log'&&!done?clamp01(frame.quietProgress||0):0;
 const quietCompleted=frame.stationChoice?.id===id&&frame.stationChoice.signalSeconds===0;
 const reply=done?frame.stationResponses?.find(r=>r.id===id):null;
 const replyAge=reply?Math.max(0,frame.time-reply.startedAt):Infinity;
 const repeat=reply&&kind==='log'&&!reply.quiet&&replyAge<.8?Math.sin(Math.PI*clamp01(replyAge/.8))**2:0;
 const stamp=frame.reducedMotion?0:Math.max(repeat,quiet?ease(quiet):done&&activation?1-ease(age/(quietCompleted?.72:.48)):0);
 const pageTurn=reply&&kind==='log'&&reply.quiet?(frame.reducedMotion?1:ease(replyAge/1.2)):0;
 const hoodClose=reply&&kind==='release'?(frame.reducedMotion?1:ease(replyAge/1.1)):0;
 const release=done?(frame.reducedMotion?1:ease(age/.48)):0;
 const receipt=done?(frame.reducedMotion?1:ease((age-.16)/.48)):0;
 return {done,stamp,release,receipt,pageTurn,hoodClose,ink:done,phase:reply&&replyAge<1.2?'answering':quiet?'pressing':done?(activation?'settling':'filed'):'ready'};
}
