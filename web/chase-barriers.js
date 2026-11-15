// Loose timber becomes passable after Joe smashes it; gate posts and masonry
// remain in the course's permanent collision/navigation data.
export const BARRIER_PUSH_SECONDS=.7;
export const barrierHalfWidth=gate=>gate.shortcut===undefined?1.4:1.75;
export const gateSwing=state=>(state?.open||0)*(state?.swingDirection||-1)*Math.PI*.56;
export function barrierFootprint(gate,state=null,out={}){
 const half=barrierHalfWidth(gate),yaw=gate.yaw||0,angle=gate.shortcut===undefined?0:gateSwing(state);
 const x=-half+half*Math.cos(angle),z=half*Math.sin(angle);
 Object.assign(out,{x:gate.x+Math.cos(yaw)*x-Math.sin(yaw)*z,y:gate.y-Math.sin(yaw)*x-Math.cos(yaw)*z,yaw:yaw+angle,rx:half+.05,ry:.08});return out;
}
export function barrierBreakDirection(gate,vehicle){
 const forward=Math.cos((vehicle.yaw||0)-(gate.yaw||0))*Math.sign(vehicle.speed||1);
 return forward>=0?1:-1;
}

// Six reusable pieces per barrier. Narrow, sagging split rails distinguish
// portable timber from stone/hedge cover. Gate posts are permanent iron;
// their two slots here are short loose hinge ends, not duplicate wooden posts.
export function barrierPiecePose(gate,state,part,reduced=false,out={}){
 const half=barrierHalfWidth(gate),side=part%2?-1:1,post=part<2,gateEnd=post&&gate.shortcut!==undefined;
 const broken=state?.age>=0,t=broken?(reduced?1.2:Math.min(1.2,state.age)):0,direction=state?.direction||1;
 const yaw=gate.yaw||0;
 let x=side*(post?half-.05:half*.5)+(broken?side*t*.38:0);
 let z=broken?-direction*t*(.62+part*.12):0;
 const swing=gate.shortcut===undefined?0:gateSwing(state),hingeX=x+half;
 x=-half+hingeX*Math.cos(swing)-z*Math.sin(swing);z=hingeX*Math.sin(swing)+z*Math.cos(swing);
 out.x=gate.x+Math.cos(yaw)*x-Math.sin(yaw)*z;
 out.z=-gate.y+Math.sin(yaw)*x+Math.cos(yaw)*z;
 out.y=post?(gateEnd?.77:.56):part<4?.53:.97;
 if(broken)out.y+=Math.sin(Math.min(1,t)*Math.PI)*.26-t*.9;
 out.rx=broken?direction*Math.min(Math.PI/2,t*1.6):0;
 out.ry=-yaw-swing+(broken?side*t*.32:0);
 const rest=broken?t/1.2:0;
 out.rz=(post?side*.045:side*(part<4?.035:-.04))*(1-rest)+(broken?side*Math.sin(rest*Math.PI)*.4:0);
 out.sx=post?(gateEnd?.075:.085):half;
 out.sy=post?(gateEnd?.24:1.12):.085;
 out.sz=.065;
 return out;
}
