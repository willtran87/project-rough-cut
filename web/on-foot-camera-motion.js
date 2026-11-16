// First-person walking motion shared by the on-foot chapters (Night Order,
// Under the Green, the Final Cut). It began as Under the Green's panic motion.
//
// player: {x, y, speed (m/s), walk (metres travelled), sprinting}
// threat: {x, y, phase?} in the same metre coordinates, or null. A nearby
//         pursuer adds up to 22% more movement; phase 'absent' adds none.
// amount: the player's Movement bob setting, 0 to 0.6. Zero or Reduced motion
//         returns a steady camera.
// Returns offsets to add to the camera: height in metres, pitch and roll in
// radians. Height never exceeds 4 cm either way.
export function onFootCameraMotion(player,threat,amount=0,reduced=false){
 if(reduced||amount<=0||player.speed<.01)return {height:0,pitch:0,roll:0};
 const gap=threat?Math.hypot(player.x-threat.x,player.y-threat.y):Infinity,pressure=!threat||threat.phase==='absent'?0:Math.max(0,1-gap/12);
 const intensity=Math.min(.6,amount)*Math.min(1,player.speed/2)*(player.sprinting?1.2:1)*(1+pressure*.22),phase=player.walk*7;
 return {height:Math.max(-.04,Math.min(.04,(Math.sin(phase)+Math.sin(phase*1.7)*.12)*intensity*.085)),pitch:Math.sin(phase*.5)*intensity*.008,roll:Math.sin(phase*.5+.3)*intensity*.012};
}
// The default Movement bob for a player who has never changed the setting.
export const DEFAULT_CAMERA_BOB=.25;
