// ANGLE/SwiftShader can defer costly work when a skinned actor joins a large
// world render pass. Explicit command boundaries keep those draws separate.
// These fences are never waited on: simulation/input stay on the normal RAF
// loop, and the scene's existing completion fence still gates presentation.
// No extra render, clear, material swap, geometry change or pixel readback.
export function separateSoftwareActorDraws(renderer,root){
 const gl=renderer.getContext(),hooks=[];
 const boundary=()=>{
  const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);
  gl.flush();
  if(sync)gl.deleteSync(sync);
 };
 root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const before=mesh.onBeforeRender,after=mesh.onAfterRender;
  const begin=function(...args){boundary();before.apply(this,args);};
  const end=function(...args){after.apply(this,args);boundary();};
  mesh.onBeforeRender=begin;mesh.onAfterRender=end;
  hooks.push({mesh,before,after,begin,end});
 });
 return {dispose(){
  for(const {mesh,before,after,begin,end}of hooks){
   if(mesh.onBeforeRender===begin)mesh.onBeforeRender=before;
   if(mesh.onAfterRender===end)mesh.onAfterRender=after;
  }
  hooks.length=0;
 }};
}
