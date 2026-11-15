const clamp=v=>Math.max(0,Math.min(1,v));
// Material-specific collapse keeps a recognizable low remnant in the opened
// corridor. Impact direction comes from Joe's actual contact, never the camera.
export function featureBreakPose(feature,index,age,state,reduced=false){
 const t=reduced?1:clamp(age/.85),e=t*t*(3-2*t),side=index-1,power=state.power||0;
 const cart=feature.kind==='parked-cart',planter=feature.kind==='fallen-tree'&&feature.id!=='clubhouse-fall',fence=feature.kind==='service-fence';
 const spread=cart?.24:planter?.58:fence?.42:.38,travel=cart?2.6:planter?.9:fence?1.6:1.8;
 const turn=cart?.11:planter?.28:fence?.37:.22;
 return {x:e*((state.dx||0)*power*travel+side*spread),z:e*(-(state.dy||0)*power*travel+side*.14),
  scaleX:1+e*(cart?.13:planter?.02:.06),scaleY:1-e*(cart?.78:planter?.69:fence?.86:.75),scaleZ:1+e*(cart?.1:planter?.04:.08),
  pitch:e*(cart?side*.035:fence?-.08:side*.04),yaw:side*e*turn,roll:side*e*(cart?.06:planter?.05:.07),
  bounce:reduced?0:Math.sin(t*Math.PI)*(cart?.08:planter?.13:.2)*power,settled:t===1};
}
