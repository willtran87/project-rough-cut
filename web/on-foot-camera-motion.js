// First-person walking motion shared by the on-foot chapters (Night Order,
// Under the Green, the Final Cut). It began as Under the Green's panic motion.
//
// player: {x, y, speed (m/s), walk (metres travelled), sprinting}
// threat: {x, y, phase?} in the same metre coordinates, or null. A nearby
//         pursuer adds up to 22% more movement; phase 'absent' adds none.
// amount: the player's Movement bob setting, 0 to 0.6. Zero returns a steady
//         camera. The wobble is on by default and is governed by this setting
//         alone: Reduced motion no longer switches it off (the fourth
//         argument is accepted for older callers and ignored).
// Returns offsets to add to the camera: height in metres, pitch and roll in
// radians. Running is a clearly stronger, swaying wobble than walking: about
// twice the rise and pitch and more than twice the roll. Height never exceeds
// 4 cm walking or 7 cm running.
export function onFootCameraMotion(player,threat,amount=0,reduced=false){
 if(amount<=0||player.speed<.01)return {height:0,pitch:0,roll:0};
 const gap=threat?Math.hypot(player.x-threat.x,player.y-threat.y):Infinity,pressure=!threat||threat.phase==='absent'?0:Math.max(0,1-gap/12);
 const run=!!player.sprinting,base=Math.min(.6,amount)*Math.min(1,player.speed/2)*(1+pressure*.22),intensity=base*(run?1.9:1),limit=run?.07:.04,phase=player.walk*7;
 return {height:Math.max(-limit,Math.min(limit,(Math.sin(phase)+Math.sin(phase*1.7)*.12)*intensity*.085)),pitch:Math.sin(phase*.5)*intensity*.008,roll:Math.sin(phase*.5+.3)*base*(run?2.4:1)*.012};
}
// The default Movement bob for a player who has never changed the setting.
export const DEFAULT_CAMERA_BOB=.25;
