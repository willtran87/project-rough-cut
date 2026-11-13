// Expressions are derived from the authoritative encounter clock. Restoring,
// pausing, scrubbing and reduced motion therefore keep the same facial pose.
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const pose=(from,to=from,blend=1)=>({from,to,blend});
export function joeExpression(r){
 if(r.failure)return pose('scrutiny');
 if(r.won){
  const age=r.ending.age;
  if(age<.7)return pose('attack','panic',smooth(.12,.7,age));
  if(age<6)return pose('panic');
  return pose('panic','frustrated',smooth(6,7,age));
 }
 const j=r.rig;
 if(j.phase==='announce')return pose('search','attack',smooth(0,.28,j.age));
 if(j.phase==='pass')return pose('attack');
 if(j.phase==='disengage'&&(j.attack||j.evidence==='observed player'))return pose('attack','frustrated',smooth(0,.18,j.age));
 return pose('search');
}
