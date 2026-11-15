export const cartDamageStage=health=>health>=100?'intact':health>82?'scuffed':health>65?'dented':health>45?'buckled':health>25?'battered':health>0?'critical':'wrecked';
export function cartCondition(health){
 const stage=cartDamageStage(health);
 return {stage,label:{intact:'CART HEALTH',scuffed:'CART · SCUFFED',dented:'CART · DENTED',buckled:'CART · BUCKLED',battered:'CART · BATTERED',critical:'CART · CRITICAL',wrecked:'CART WRECKED'}[stage]};
}
