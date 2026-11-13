// A single decoded PA line. Playback is tied to the opening's simulation clock,
// with pause/resume offsets and no delayed speech after a threat or failed load.
export function createCourseAnnouncement(context,destination,{load=async()=>{
 const response=await fetch('./assets/audio/course-secured.ogg');
 if(!response.ok)throw Error('Announcement unavailable');
 return context.decodeAudioData(await response.arrayBuffer());
}}={}){
 const gain=context.createGain(),pan=context.createStereoPanner();gain.gain.value=0;gain.connect(pan);pan.connect(destination);
 let buffer=null,source=null,owner=null,done=false,started=false,disposed=false,startOffset=0,startAt=0;
 const report={ready:false,error:null,starts:0,resumes:0,playing:false,offset:0};
 const ready=Promise.resolve().then(load).then(value=>{if(!disposed){buffer=value;report.ready=true;report.duration=value.duration;}},error=>{report.error=String(error.message||error);});
 function stop(){if(source){const old=source;source=null;old.onended=null;old.stop();old.disconnect();}report.playing=false;}
 function update(frame){
  if(disposed)return;
  if(owner!==frame.arrival){stop();owner=frame.arrival;done=false;started=false;}
  if(!owner||owner.lockAt===null||owner.phase==='skipped'){stop();return;}
  const rawElapsed=owner.age-owner.lockAt-.18,elapsed=Math.max(0,rawElapsed);report.offset=elapsed;
  if(!frame.active){stop();return;}
  if(!frame.clear){stop();done=true;return;}
  if(done||rawElapsed< -1e-7)return;
  if(!started&&elapsed>.45){stop();done=true;return;}
  if(!buffer)return;
  if(elapsed>=buffer.duration){stop();done=true;return;}
  gain.gain.setTargetAtTime(.34*(frame.level??1),context.currentTime,.035);
  pan.pan.setTargetAtTime(frame.pan||0,context.currentTime,.035);
  // Manual-time playtests and a stalled frame can outrun Web Audio; seek to the
  // same point once instead of replaying the beginning or queueing extra voices.
  if(source&&Math.abs(startOffset+context.currentTime-startAt-elapsed)>.3)stop();
  if(!source){
   source=context.createBufferSource();source.buffer=buffer;source.connect(gain);
   const node=source;node.onended=()=>{node.disconnect();if(source===node){source=null;done=true;report.playing=false;}};
   if(started)report.resumes++;else report.starts++;
   started=true;startOffset=elapsed;startAt=context.currentTime;source.start(0,elapsed);report.playing=true;
  }
 }
 return {ready,update,stats:()=>({...report}),dispose(){disposed=true;stop();gain.disconnect();pan.disconnect();}};
}
