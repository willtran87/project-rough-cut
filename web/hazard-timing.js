// Event-controlled states never invent a countdown. All values are JSON-safe.
export function timedHazard(seconds,safeFor=0){
 return {timing:{kind:'timed',seconds:Math.max(0,seconds)},remaining:Math.max(0,seconds),safeFor:Math.max(0,safeFor)};
}
export function eventHazard(safe,event){
 return {timing:{kind:safe?'safe-until-event':'blocked-until-event',event},remaining:null,safeFor:safe?null:0};
}
