// Injected only by QA into the game closure, never shipped to players.
window.__sampleEncounterAudio = async ({yaw=0,kind='timer',x=40,y=20}) => {
  const saved={audioContext,effectsBusGain,ambienceBusGain,sharedNoiseBuffer,
    x:state.player.x,y:state.player.y,yaw:state.player.yaw};
  const context=new OfflineAudioContext(2,48000,48000);
  try {
    audioContext=context;effectsBusGain=ambienceBusGain=context.destination;
    sharedNoiseBuffer=context.createBuffer(1,96000,48000);
    const noise=sharedNoiseBuffer.getChannelData(0);
    for(let i=0;i<noise.length;i++)noise[i]=((i*73)%251)/125-1;
    Object.assign(state.player,{x:0,y:0,yaw});
    playEncounterMechanism(kind,{x,y});
  } finally {
    audioContext=saved.audioContext;effectsBusGain=saved.effectsBusGain;
    ambienceBusGain=saved.ambienceBusGain;sharedNoiseBuffer=saved.sharedNoiseBuffer;
    Object.assign(state.player,{x:saved.x,y:saved.y,yaw:saved.yaw});
  }
  const rendered=await context.startRendering();
  return Array.from({length:2},(_,channel)=>{
    const values=rendered.getChannelData(channel);let energy=0,peak=0,tail=0;
    for(let i=0;i<values.length;i++){
      energy+=values[i]**2;peak=Math.max(peak,Math.abs(values[i]));
      if(i>43200)tail=Math.max(tail,Math.abs(values[i]));
    }
    return {rms:Math.sqrt(energy/values.length),peak,tail};
  });
};
