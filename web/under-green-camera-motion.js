export function panicCameraMotion(player,joe,amount=0,reduced=false){
 if(reduced||amount<=0||player.speed<.01)return {height:0,pitch:0,roll:0};
 const gap=Math.hypot(player.x-joe.x,player.y-joe.y),pressure=joe.phase==='absent'?0:Math.max(0,1-gap/12);
 const intensity=Math.min(.6,amount)*Math.min(1,player.speed/2)*(player.sprinting?1.2:1)*(1+pressure*.22),phase=player.walk*7;
 return {height:Math.max(-.04,Math.min(.04,(Math.sin(phase)+Math.sin(phase*1.7)*.12)*intensity*.085)),pitch:Math.sin(phase*.5)*intensity*.008,roll:Math.sin(phase*.5+.3)*intensity*.012};
}
