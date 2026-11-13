const clamp=v=>Math.max(0,Math.min(1,v));
const ramp=(wear,start,end)=>{const t=clamp((wear-start)/(end-start));return t*t*(3-2*t);};

// Shared presentation signals. Travel comes from actual collision-resolved
// movement; changing the speed cannot jump a panel/wheel into a new phase.
// Nothing here changes throttle, steering, health or the physical hull.
export function cartMechanics(run,out={}){
 const c=run.cart,time=run.time||0,travel=run.distance||0;
 const live=!run.foot&&c.health>0&&['driving','paused'].includes(run.mode);
 const rolling=live?clamp(Math.abs(c.speed)/6):0,wear=clamp(1-(c.health??100)/100);
 const road={path:.75,rough:1.1,wet:.9,sand:1.35}[c.surface]??1;
 const roof=ramp(wear,.35,.65),panels=ramp(wear,.5,.72),wheel=ramp(wear,.65,.9),critical=ramp(wear,.75,.95);
 const axle=travel/.36,phase=travel*Math.PI*2/3.2,panel=Math.sin(phase);
 const bump=Math.sin(travel*1.3)*.023+Math.sin(travel*2.7+.6)*.008;
 out.rolling=rolling;out.road=road;out.wear=wear;out.roof=roof;out.panels=panels;out.wheel=wheel;out.critical=critical;
 out.heave=rolling*road*(1+wear*.5)*bump;
 out.pitch=rolling*road*(1+wear*.35)*Math.sin(travel*1.3-.8)*.010;
 out.roll=rolling*road*(Math.sin(travel*1.7+.3)*.012+wheel*Math.sin(axle)*.005);
 out.panel=rolling*panels*panel;out.roofFlex=rolling*roof*panel;
 out.wheelWobble=rolling*wheel*Math.sin(axle);out.rattleCycle=Math.floor(travel/3.2);
 out.rattleGain=rolling*panels*road;
 // An irregular mechanical flutter is audible only; never steal acceleration
 // or force a breakdown to show the on-foot sequence.
 const flutter=Math.max(0,Math.sin(time*18.5)*Math.sin(time*7.3))**4;
 out.engineGain=live?1-critical*(.12+.25*flutter)*rolling:1;
 out.engineDetune=live?-critical*(2+flutter*7)*rolling:0;
 return out;
}
