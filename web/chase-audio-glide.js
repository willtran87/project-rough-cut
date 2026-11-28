// One cache of the last setTargetAtTime target per AudioParam, shared by the
// Back Nine audio modules. Re-issuing the same target and time constant only
// continues the same exponential curve, so a repeat (within 1e-6) is skipped.
// `settle` (used only for a fade) also skips smaller steps; a zero target is
// always exact. Code that schedules anything else on a cached parameter
// (cancelScheduledValues, setValueAtTime, ramps) must call forgetGlide first.
const targets=new WeakMap();
export function glide(param,value,now,constant,settle=0){
 const prior=targets.get(param);
 if(prior&&prior.constant===constant&&Math.abs(prior.value-value)<=(value!==0&&settle>1e-6?settle:1e-6))return;
 param.setTargetAtTime(value,now,constant);
 if(prior){prior.value=value;prior.constant=constant;}else targets.set(param,{value,constant});
}
export function forgetGlide(param){targets.delete(param);}
