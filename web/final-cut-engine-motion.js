const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function engineTarget(r){return !r.arrival.ready?0:r.won?14*clamp((7-r.ending.age)/3.8,0,1):14;}
export function createEngineMotion(saved,r){return {angle:Number.isFinite(saved?.angle)?(saved.angle>=0?saved.angle%TAU:(saved.angle%TAU+TAU)%TAU):0,speed:Number.isFinite(saved?.speed)?clamp(saved.speed,0,14):engineTarget(r)};}
export function advanceEngineMotion(r,dt){
 const e=r.engine,before=e.speed,target=engineTarget(r);
 e.speed=target<before?target:Math.min(target,before+12*dt);
 e.angle=(e.angle+(before+e.speed)*.5*dt)%TAU;
}
