// Difficulty for the final round: explicit multipliers on four tuning values.
// Standard is every factor at exactly 1, so a standard run (and every stored
// replay) computes the same numbers it did before this file existed. A run
// only carries a `difficulty` field when it is not standard.
//
// warning: seconds of reed-shake before an ambush charge commits.
// announce: seconds the wings take to align before an ordinary cutting pass.
// hold: how long a full hollow (and the swale) keeps its water.
// charge: how fast an ambush charge travels.
export const DIFFICULTY=Object.freeze({
 standard:Object.freeze({warning:1,announce:1,hold:1,charge:1}),
 relaxed:Object.freeze({warning:1.35,announce:1.25,hold:1.45,charge:.92}),
 hard:Object.freeze({warning:.86,announce:.8,hold:.8,charge:1.08}),
});
export const difficultyOf=value=>Object.hasOwn(DIFFICULTY,value)?value:'standard';
export const tuning=r=>DIFFICULTY[r?.difficulty]||DIFFICULTY.standard;
// Sets or clears the field on a live run. Returns true when it changed.
export function applyDifficulty(r,value){
 const next=difficultyOf(value),before=r.difficulty||'standard';
 if(next==='standard')delete r.difficulty;else r.difficulty=next;
 return next!==before;
}
