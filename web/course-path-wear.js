// Static marks follow the authored path centreline in world metres. They do
// not alter path width, collision, footing zones, or navigation data.
export function* pathWearPatches(data,xScale,scale){
  let seed=7919;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const hazards=[...(data.sand||[]),...(data.footing||[])].map(z=>({x:z.x*xScale,z:-z.y*scale,rx:(z.radiusX||16)*xScale,rz:(z.radiusY||16)*scale}));
  const patch=(x,z,dx,dz,along,across,kind)=>{
    const nx=dz,nz=-dx;
    const contour=kind==='grass'?[[-.5,-.2],[-.35,-.47],[-.12,-.3],[.03,-.5],[.27,-.32],[.46,-.39],[.5,.12],[.3,.43],[.12,.28],[-.08,.5],[-.28,.31],[-.48,.37]]:[[-.5,-.28],[-.32,-.5],[.27,-.5],[.5,-.24],[.5,.28],[.28,.5],[-.27,.5],[-.5,.22]];
    const points=contour.map(([a,b])=>{const edge=.78+random()*.22;return {x:x+(dx*a*along+nx*b*across)*edge,z:z+(dz*a*along+nz*b*across)*edge};});
    // Conservative clearance for the whole mark, not only its centre. Sand
    // and muddy footing must retain their existing readable silhouettes.
    const radius=Math.hypot(along,across)*.5;
    if(hazards.some(h=>Math.hypot((x-h.x)/h.rx,(z-h.z)/h.rz)<=1+(radius+.06)/Math.min(h.rx,h.rz)))return null;
    return {x,z,along,across,kind,points};
  };
  for(const path of data.paths||[]){
    let walked=0,next=0;
    for(let i=1;i<path.length;i++){
      const a={x:path[i-1].x*xScale,z:-path[i-1].y*scale},b={x:path[i].x*xScale,z:-path[i].y*scale},length=Math.hypot(b.x-a.x,b.z-a.z);
      if(length<.00001)continue;
      const dx=(b.x-a.x)/length,dz=(b.z-a.z)/length,nx=dz,nz=-dx;
      for(;next<walked+length;next+=.18){
        const d=next-walked,x=a.x+dx*d,z=a.z+dz*d;
        const marks=[];
        // Broad shoulder incursions create irregular edges, with clear gaps.
        for(const side of [-1,1])if(random()<.57){
          const lateral=side*(.84+random()*.22);
          marks.push(patch(x+nx*lateral,z+nz*lateral,dx,dz,.18+random()*.45,.16+random()*.30,random()<.72?'grass':'dry-edge'));
        }
        // Broken paired wheel wear stays within the existing compacted path.
        for(const side of [-1,1])if(random()<.64){
          const lateral=side*(.27+.025*Math.sin(next*.9));
          marks.push(patch(x+nx*lateral,z+nz*lateral,dx,dz,.15+random()*.20,.035+random()*.045,'rut'));
        }
        if(random()<.28)marks.push(patch(x+nx*(random()-.5)*.45,z+nz*(random()-.5)*.45,dx,dz,.25+random()*.60,.18+random()*.42,'compacted'));
        for(let j=0;j<2;j++){
          const lateral=(random()-.5)*1.4;
          marks.push(patch(x+nx*lateral,z+nz*lateral,dx,dz,.025+random()*.055,.025+random()*.05,random()<.6?'grit':'pit'));
        }
        for(const mark of marks)if(mark)yield mark;
      }
      walked+=length;
    }
  }
}

export const PATH_WEAR_COLORS={
  grass:'rgba(39,56,38,.48)',
  'dry-edge':'rgba(85,84,52,.30)',
  rut:'rgba(45,42,30,.18)',
  compacted:'rgba(149,136,103,.13)',
  grit:'rgba(199,181,136,.28)',
  pit:'rgba(42,40,30,.24)'
};
