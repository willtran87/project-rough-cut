// Keep one real interaction visible under a general threat warning. Immediate
// mower evasion and committed actions retain exclusive instruction priority.
export function courseDangerAction(owner,{instruction,closePhase,closeRemaining=0}={}) {
  if(instruction!=='danger'||closeRemaining>0||['warning','push','recovery'].includes(closePhase)||
    owner?.binding!=='interact'||owner.availability!=='ready'||!owner.prompt)return {action:'',consequence:''};
  const c=owner.consequence;
  let consequence=typeof c==='string'?c:'';
  if(c?.kind==='loud_field_check_commitment'){
    consequence=`${Number(c.noiseSeconds).toFixed(1)}s signal · Joe checks here`+(c.coverLabel?` · Reach ${c.coverLabel}`:'');
  }else if(c?.kind==='quiet_field_check_commitment'){
    consequence=c.tactic?.holdSeconds?`Quiet · Stay crouched and still for ${c.tactic.holdSeconds}s`:'Quiet · No signal';
  }else if(c?.text)consequence=c.text;
  return {action:owner.prompt,consequence};
}
