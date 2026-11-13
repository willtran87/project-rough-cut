// Optional on-foot start response. Only the initial speed is eased; releasing
// movement never adds drift. State belongs to the current player/attempt.
export function movementStartScale(state,x,y,dt,enabled){
 if(!enabled||Math.hypot(x,y)<.01){
  state.startSeconds=0;
  state.lastMotionInput=null;
  return enabled?0:1;
 }
 const previous=state.lastMotionInput;
 if(previous&&previous.x*x+previous.y*y<0)state.startSeconds=0;
 state.lastMotionInput={x,y};
 state.startSeconds=Math.min(.08,(state.startSeconds||0)+dt);
 return .4+.6*state.startSeconds/.08;
}
