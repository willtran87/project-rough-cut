import {ramDamageScale} from './ram-damage.js';
export const RAM_WINDUP_SECONDS=1.8;
const clamp=n=>Math.max(0,Math.min(1,n));
// Simulation-time choreography shared by engine, rider, decks, lamps and HUD.
export function ramWindup(run){
 const r=run.joe.ram,active=r?.phase==='lineup',age=active?r.age:0;
 const charge=active?clamp((age-.3)/1.5):0,load=active?clamp((age-.75)/1.05):clamp((r?.release||0)/.35);
 const pulse=active?Math.sin(charge*Math.PI*4):0;
 const weight=1+(ramDamageScale(run)-1)*.12;
 return {active,stage:active?(age<.3?'hush':age<1.4?'rev':'commit'):'none',charge,load,pulse,weight,deckLift:active?(r.fromBackoff?1:clamp(age/.25))*(1-clamp((age-1.25)/.4)):0,motor:(active?(age<.3?.18:.45+charge*.9+Math.max(0,pulse)*.18):1)*weight};
}
