// Bound accumulated input as well as each rendered turn. A burst of high-DPI
// events cannot bank seconds of unwanted rotation after the hand stops.
export function createMouseLook(){
  let x=0,y=0,age=0;
  const clamp=(v,limit)=>Math.max(-limit,Math.min(limit,v));
  return {
    push(dx,dy){
      if(!Number.isFinite(dx)||!Number.isFinite(dy))return;
      if(dx*x<0)x=0;if(dy*y<0)y=0;
      x=clamp(x+dx,.10);y=clamp(y+dy,.07);age=0;
    },
    sample(dt){
      if(!Number.isFinite(dt)||dt<=0)return {x:0,y:0};
      age+=dt;if(age>.1){x=y=0;return {x:0,y:0};}
      const blend=1-Math.exp(-Math.min(dt,.05)/.022);
      const dx=clamp(x*blend,Math.min(2.1*dt,.055)),dy=clamp(y*blend,Math.min(1.4*dt,.035));
      x-=dx;y-=dy;return {x:dx,y:dy};
    },
    reset(){x=y=age=0;}
  };
}
