// Capture facts once. Presentation never advances or repositions the encounter.
export function capturePresentation(r,contact){
 const j=r.rig,p=r.player,s=Math.sin(j.yaw),c=Math.cos(j.yaw);
 const side=(p.x-j.x)*c-(p.y-j.y)*s;
 const kind=contact?.kind||'chassis',cutting=kind==='cutting-bank';
 return {kind,part:contact?.id,title:cutting?'Caught in the cut':kind==='wheel'?'Caught under the wheel':'Caught by the rig',
  cause:cutting?'The deployed cutting bank reached you.':kind==='wheel'?'A wheel reached you beside the central vehicle.':'The rig’s central chassis reached you.',
  advice:cutting?(p.crouch?'Crouching hides you in standing rough; it cannot stop the reels. Cross behind the committed pass.':'Let the cutting bank pass, then cross through its wake toward stone shelter.'):'The chassis remains solid between cutting passes. Give the central vehicle room and cross after it moves clear.',
  phase:j.phase,side:side<0?-1:1,rig:{x:j.x,y:j.y,yaw:j.yaw},player:{x:p.x,y:p.y,crouch:!!p.crouch}};
}

export function defeatView(f){
 const j=f.rig,s=Math.sin(j.yaw),c=Math.cos(j.yaw),side=f.side;
 const point=(forward,lateral,height)=>({x:j.x+s*forward+c*lateral,y:height,z:-j.y-c*forward+s*lateral});
 return {eye:point(8,side*(f.kind==='cutting-bank'?8:6),4.5),target:point(0,side*(f.kind==='cutting-bank'?1.8:.5),1)};
}
