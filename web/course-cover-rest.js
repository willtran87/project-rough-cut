// Presentation-only relief earned by stopping behind real, nearby cover.
// This state never moves Joe, grants immunity or changes perception/navigation.
export const freshCoverRest=()=>({coverId:null,settle:0,active:false,amount:0,entries:0});
export function advanceCoverRest(s,dt,{paused=false,coverId=null,eligible=false,clear=true}={}){
  if(paused)return null;
  dt=Math.max(0,dt);
  const wasActive=s.active,changed=coverId!==s.coverId;
  if(!eligible||!coverId||changed){s.settle=0;s.active=false;}
  s.coverId=eligible?coverId:null;
  if(eligible&&coverId&&(s.active||clear)){
    s.settle+=dt;
    if(s.settle>=2)s.active=true;
  }else if(!s.active)s.settle=0;
  s.amount+=(Number(s.active)-s.amount)*(1-Math.exp(-dt/(s.active?.8:.22)));
  if(!wasActive&&s.active){s.entries++;return 'entered';}
  if(wasActive&&!s.active)return 'left';
  return null;
}
export function coverRestMix(s,allowed=true){
  const amount=allowed?Math.max(0,Math.min(1,s?.amount||0)):0;
  return {amount,bed:1-.45*amount,score:1-.55*amount,drone:1-.35*amount};
}
