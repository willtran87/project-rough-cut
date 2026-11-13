// Completed GPU frames drive this budget; fast JavaScript submissions must not
// disguise slow software rasterization. Discrete, sustained changes avoid
// resolution pumping when an effect or a newly visited area costs one frame.
export function createSoftwareFrameBudget({slowMs=60,recoverMs=48,scales:requestedScales=[.75,.625,.5]}={}){
  if(!Number.isFinite(slowMs)||!Number.isFinite(recoverMs)||recoverMs<=0||recoverMs>=slowMs)throw new Error('Invalid software frame budget thresholds');
  if(!Array.isArray(requestedScales)||!requestedScales.length||requestedScales.some((s,i)=>!Number.isFinite(s)||s<=0||s>1||i>0&&s>=requestedScales[i-1]))throw new Error('Invalid software resolution steps');
  const scales=[...requestedScales];
  let level=0,samples=0,slow=0,fast=0,cooldown=0,changes=0;
  return {
    observe(ms){
      if(!Number.isFinite(ms)||ms<=0)return;
      if(++samples<=6)return;
      if(cooldown>0){cooldown--;return;}
      // One lighter frame should not erase a sustained overload. Isolated
      // stalls still cancel out against normal frames instead of lowering art
      // quality. Keep the same eight-frame evidence requirement; the chapter
      // owns its tested resolution steps while existing consumers keep defaults.
      slow=ms>slowMs?slow+1:Math.max(0,slow-1);
      // A fast frame at a smaller buffer does not imply the next buffer is
      // affordable. Estimate its pixel cost before upgrading, leaving the
      // configured reserve for visible foliage, impacts and Joe (12ms by default).
      // The old fixed 42 ms threshold could promote 640x360 -> 800x450
      // at ~40 ms, producing ~62.5 ms frames and repeated down/up resizes.
      const nextCost=level>0?ms*(scales[level-1]/scales[level])**2:ms;
      fast=nextCost<recoverMs?fast+1:0;
      if(slow>=8&&level<scales.length-1){level++;changes++;cooldown=24;slow=fast=0;}
      else if(fast>=60&&level>0){level--;changes++;cooldown=60;slow=fast=0;}
    },
    scale:()=>scales[level],
    stats:()=>({scale:scales[level],changes,samples,minScale:scales.at(-1),maxScale:scales[0],slowMs,recoverMs})
  };
}
