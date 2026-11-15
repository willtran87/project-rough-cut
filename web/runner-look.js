// The camera follows steering, as in the cart. Rear glance never changes
// movement direction, and mouse/right-stick deltas cannot rotate the view.
export function updateRunnerLook(foot,input,dt){
 if(!foot)return;
 foot.viewYaw??=foot.yaw;foot.viewPitch??=0;foot.rearBlend??=0;
 foot.viewYaw=foot.yaw;foot.viewPitch=0;
 foot.rearBlend+=(Number(!!input.rear)-foot.rearBlend)*(1-Math.exp(-dt*14));
 if(foot.rearBlend<.001)foot.rearBlend=0;if(foot.rearBlend>.999)foot.rearBlend=1;
}
export function listenerYaw(run){return run.foot?(run.foot.viewYaw??run.foot.yaw??0)+Math.PI*(run.foot.rearBlend||0):run.cart.yaw+(run.lookBack?Math.PI:0);}
