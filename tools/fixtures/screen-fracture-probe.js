// QA only: read pixels from the current static scene to isolate compositor
// changes from water, mist, ghost motion or camera motion between frames.
window.__fractureProbe=async()=>{
  if(!screenFracture)return null;
  const frame={fx:{screen:true,enabled:true,ghostInterference:true},joe:{mode:'patrol'}},gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
  const cue={kind:'rush',progress:.5,strength:.62,side:-1};
  const draw=signal=>{screenFracture.update(frame,signal,sceneTarget.width,sceneTarget.height);renderer.setRenderTarget(null);renderer.render(compositor,screenCamera);};
  const pixels=()=>{const p=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
  draw(null);const before=pixels(),calls=renderer.info.render.calls,textures=renderer.info.memory.textures;
  draw(cue);const after=pixels();let changed=0,center=0,outside=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4;
    if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2]){
      changed++;if(x>w*.44&&x<w*.56&&y>h*.44&&y<h*.56)center++;
      if(Math.abs(y/h-.64)>.05&&Math.abs(y/h-.36)>.02)outside++;
    }
  }
  const activeCalls=renderer.info.render.calls,activeTextures=renderer.info.memory.textures;
  draw(null);const restored=pixels();let residual=0;for(let i=0;i<before.length;i++)if(before[i]!==restored[i])residual++;
  const timings=[];
  for(let i=0;i<24;i++){
    const enabled=i%2===1,start=performance.now();draw(enabled?cue:null);
    const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
    while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,1));
    gl.deleteSync(fence);if(i>=4)timings.push({enabled,ms:performance.now()-start});
  }
  draw(null);
  return {changed,center,outside,residual,fraction:changed/(w*h),calls,activeCalls,textures,activeTextures,timings};
};
