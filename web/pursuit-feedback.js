const clamp=v=>Math.max(0,Math.min(1,v));
// Presentation only. Each consumer owns one reusable envelope; simulation time
// freezes it on pause. Distance/relative velocity come from the real actors.
export function createPursuitFeedback(){
 let lastRun=null,lastTime=0,level=0;
 const out={level:0,closing:0,gap:0,side:0,roll:0,heave:0,fov:0};
 return {update(run,reduced=false){
  const c=run.foot||run.cart,j=run.joe,dx=c.x-j.x,dy=c.y-j.y,gap=Math.hypot(dx,dy),time=run.time;
  const closing=gap>.001?((Math.sin(j.yaw)*j.speed-Math.sin(c.yaw)*c.speed)*dx+(Math.cos(j.yaw)*j.speed-Math.cos(c.yaw)*c.speed)*dy)/gap:0;
  const protectedMoment=run.grace>0||c.invulnerable>0||run.decoys?.active>=0||run.tension?.phase==='breather'||['backoff','lineup'].includes(j.ram?.phase)||['opening','gather'].includes(run.pressure?.phase)||run.panic?.phase==='reveal'||run.hunt?.phase==='commit_warning';
  const active=(run.mode==='driving'||run.mode==='paused')&&!run.death&&!protectedMoment;
  const visible=!run.hunt?.occluded&&j.seenAge<.5;
  const target=active&&visible?clamp((42-gap)/34)*(.25+.75*clamp(closing/10)):0;
  if(lastRun!==run){lastRun=run;lastTime=time;level=0;}
  const dt=Math.max(0,Math.min(.1,time-lastTime));lastTime=time;
  if(!active)level=0;else level+=(target-level)*(1-Math.exp(-dt*(target>level?6:9)));
  const side=Math.sin(Math.atan2(-dx,-dy)-(c.viewYaw??c.yaw)),motion=reduced?0:level*(run.foot?.55:1);
  out.level=level;out.closing=closing;out.gap=gap;out.side=side;
  out.roll=motion*(Math.sin(time*17.3)*.004+Math.sin(time*29.1)*.002+side*.004)||0;
  out.heave=motion*(Math.sin(time*23)*.024+Math.sin(time*37)*.009)||0;
  out.fov=motion*3.2;
  return out;
 },stats:()=>out};
}
