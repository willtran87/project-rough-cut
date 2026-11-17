// Body-local metres: lateral, height, forward. Shared art/clearance shaft.
export const SCYTHE_SHAFT=[[-.25,2,.12],[-.08,1.4,.22],[.1,1.02,.38],[.5,.67,.55]];
export const SCYTHE_GRIPS=[[[-.225,1.19,.24],[.02,1.19,.31]],[[.225,1.08,.18],[.07,1.08,.35]]];
// What is drawn and held. The two constants above stay as the swept volume
// that scenery clearance and strike contact are solved against, so changing
// the carry never changes where Joe can turn or what his cut reaches. The
// drawn snath is shorter and lower than that volume above the socket and its
// holds lie well inside Joe's own navigation radius.
// A curved snath from the upper hand down to the blade socket.
export const SCYTHE_SNATH=[[-.33,1.165,.215],[.13,.99,.33],[.34,.80,.46],[.5,.67,.55]];
// Upper hand closes on the snath itself; the lower hand takes a side handle.
// `hand` is the centre of the fist, `axis` the bar it closes around (x>0).
export const SCYTHE_HOLDS=[
 {hand:[-.27,1.142,.23],axis:[.911,-.347,.228]},
 {hand:[.3035,.9585,.30],axis:[.774,.319,-.615],handle:[[.21,.92,.375],[.38,.99,.24]]}
];
// A broad crescent cuts across the carrier, rather than pointing like a saw.
export const SCYTHE_BLADE_HEIGHT=.67;
export const SCYTHE_BLADE=[[.50,.55],[.52,.76],[.22,1.05],[-.05,1.30],[-.55,1.48],[-.28,1.18],[0,.94],[.22,.68],[.32,.55]];
export const SCYTHE_EDGE=[4,5,6,7,8];
export const SCYTHE_CONTACT={near:[.42,.60],far:[-.55,1.48],radius:.21};

// Shared forged perimeter: the renderer and physical scenery sweep must use
// the same inward-rounded corners, including the sharp cutting tip.
export function scytheOutline(){
 const outline=[],edgeIndices=new Set(),tipIndices=new Set();
 SCYTHE_BLADE.forEach((p,index)=>{
  const previous=SCYTHE_BLADE[(index+SCYTHE_BLADE.length-1)%SCYTHE_BLADE.length],next=SCYTHE_BLADE[(index+1)%SCYTHE_BLADE.length];
  const append=q=>{if(SCYTHE_EDGE.includes(index))edgeIndices.add(outline.length);if(index===4)tipIndices.add(outline.length);outline.push(q);};
  if(index===4){append([...p]);return;}
  const fraction=index===0||index===8?.12:.36;
  const a=p.map((v,i)=>v+(previous[i]-v)*fraction),b=p.map((v,i)=>v+(next[i]-v)*fraction);
  for(let step=0;step<=5;step++){const t=step/5;append(p.map((v,i)=>(1-t)*(1-t)*a[i]+2*(1-t)*t*v+t*t*b[i]));}
 });
 return {outline,edgeIndices,tipIndices};
}
