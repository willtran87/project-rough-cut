// Positive-side rig coordinates: side, height, forward. Shared by the
// constructed mechanism and masonry clearance; no independent render timer.
export const HYDRAULIC={base:{side:1.1,height:1.4,forward:.55},wing:{side:1.65,height:.25,forward:-.45},barrelStart:.08,barrelEnd:1.04,barrelRadius:.085,rodRadius:.034,rodLength:.92,hoseRadius:.018,hoseSegments:8};
export const hydraulicPartId=(side,part)=>`hydraulic-${side}-${part.id}`;
const cache=[];
const mix=(a,b,t)=>({side:a.side+(b.side-a.side)*t,height:a.height+(b.height-a.height)*t,forward:a.forward+(b.forward-a.forward)*t});
function hosePoints(a,b,length){
 // A slack arch bows up and forward, away from the power-unit face, cab
 // pillars and front tyres. Solve its sampled length instead of stretching it.
 const points=bulge=>Array.from({length:HYDRAULIC.hoseSegments+1},(_,i)=>{const t=i/HYDRAULIC.hoseSegments,p=mix(a,b,t),h=4*t*(1-t)*bulge;p.height+=h*.85;p.forward+=h*.55;return p;});
 function measure(bulge){let x=a.side,y=a.height,z=a.forward,total=0;for(let i=1;i<=HYDRAULIC.hoseSegments;i++){const t=i/HYDRAULIC.hoseSegments,h=4*t*(1-t)*bulge,nx=a.side+(b.side-a.side)*t,ny=a.height+(b.height-a.height)*t+h*.85,nz=a.forward+(b.forward-a.forward)*t+h*.55;total+=Math.hypot(nx-x,ny-y,nz-z);x=nx;y=ny;z=nz;}return total;}
 let lo=0,hi=1;for(let k=0;k<16;k++){const mid=(lo+hi)/2;if(measure(mid)<length)lo=mid;else hi=mid;}
 return points((lo+hi)/2);
}
export function hydraulicLayout(angle,bank){
 const hit=cache.find(e=>e.angle===angle&&e.bank===bank);if(hit)return hit.value;
 const c=Math.cos(angle),s=Math.sin(angle),a=HYDRAULIC.base,w=HYDRAULIC.wing,b={side:bank.hinge+w.side*c-w.height*s,height:bank.height+w.side*s+w.height*c,forward:bank.forward+w.forward},length=Math.hypot(b.side-a.side,b.height-a.height,b.forward-a.forward),parts=[];
 const at=t=>mix(a,b,t/length);
 const tube=(id,start,end,radius,material,profile='round')=>parts.push({id,type:'tube',start,end,radius,material,profile});
 const box=(id,side,height,forward,width,tall,depth,rotation,material)=>parts.push({id,type:'box',side,height,forward,width,tall,depth,rotation,material});
 tube('barrel',at(HYDRAULIC.barrelStart),at(HYDRAULIC.barrelEnd),HYDRAULIC.barrelRadius,'green');
 tube('rod',at(length-.06-HYDRAULIC.rodLength),at(length-.06),HYDRAULIC.rodRadius,'metal');
 for(const [name,t]of [['base-cap',.1],['gland',1.02]])tube(name,at(t-.035),at(t+.035),.097,'brass');
 for(const t of [.17,.94])tube('barrel-band-'+t,at(t-.018),at(t+.018),.094,'metal');
 tube('rod-wiper',at(1.048),at(1.068),.056,'dark');
 for(const [name,p]of [['base',a],['wing',b]]){
  tube(name+'-eye',{...p,forward:p.forward-.1},{...p,forward:p.forward+.1},.09,'green');
  tube(name+'-pin',{...p,forward:p.forward-.2},{...p,forward:p.forward+.2},.035,'metal');
  for(const s of [-1,1]){
   tube(name+'-washer-'+s,{...p,forward:p.forward+s*.174},{...p,forward:p.forward+s*.194},.065,'metal');
   tube(name+'-retainer-'+s,{...p,forward:p.forward+s*.194},{...p,forward:p.forward+s*.217},.054,'brass','hex');
  }
 }
 // Chassis clevis seats on the frame; the other clevis rotates with the deck.
 for(const side of [-1,1]){
  box('base-clevis-'+side,a.side,1.29,a.forward+side*.13,.2,.34,.04,0,'green');
  const x=w.side,y=.17;box('wing-clevis-'+side,bank.hinge+x*c-y*s,bank.height+x*s+y*c,bank.forward+w.forward+side*.13,.2,.24,.04,angle,'green');
 }
 const hoses=[];
 // A bolted manifold seats against the side console; both supplies enter it.
 box('manifold',1.25,1.48,.695,.28,.15,.05,0,'green');
 for(const side of [1.13,1.37])tube('manifold-bolt-'+side,{side,height:1.48,forward:.72},{side,height:1.48,forward:.744},.014,'metal','hex');
 for(let i=0;i<2;i++){
  const source={side:1.19+i*.12,height:1.48,forward:.765},port={...at(i?.88:.2),forward:a.forward+.14};
  tube('supply-'+i,{...source,forward:.69},source,.03,'brass');
  tube('port-'+i,{...port,forward:a.forward+.055},port,.028,'brass');
  tube('supply-hex-'+i,{...source,forward:.707},{...source,forward:.742},.042,'metal','hex');
  tube('port-hex-'+i,{...port,forward:a.forward+.075},{...port,forward:a.forward+.113},.040,'metal','hex');
  const points=hosePoints(source,port,i?1.18:.74);hoses.push(points);
  for(let k=0;k<points.length-1;k++)tube(`hose-${i}-${k}`,points[k],points[k+1],HYDRAULIC.hoseRadius,'dark');
  // Fixed-length crimp and strain-relief sleeves follow each hose's local
  // tangent. They never slide along a screen-space or independent animation.
  for(const [end,from,to]of [['supply',points[0],points[1]],['port',points.at(-1),points.at(-2)]]){
   const span=Math.hypot(to.side-from.side,to.height-from.height,to.forward-from.forward),along=d=>mix(from,to,d/span),id=`hose-${i}-${end}`;
   tube(id+'-crimp',along(.003),along(.050),.031,'metal');
   tube(id+'-sleeve',along(.050),along(.112),.026,'dark');
   for(const d of [.058,.074,.090,.106])tube(id+'-rib-'+d,along(d-.003),along(d+.003),.030,'dark');
  }
  // Paired band clamps support the cylinder plumbing without tying the
  // moving slack loop to a stationary point on the body.
  const t=i?.88:.2;
  tube('port-clamp-'+i,at(t-.014),at(t+.014),.093,'metal');
 }
 const envelopes=parts.map(part=>{const e=hydraulicEnvelope(part);e.bottom=Math.min(...e.polygon.map(p=>p.y));e.top=Math.max(...e.polygon.map(p=>p.y));const lo=Math.min(...e.polygon.map(p=>p.x)),hi=Math.max(...e.polygon.map(p=>p.x));e.full=[-1,1].map(sign=>({id:hydraulicPartId(sign,part),kind:'structure',side:sign*(lo+hi)/2,height:e.bottom,forward:e.forward,w:hi-lo,h:0,d:e.depth,angle:0}));return e;});
 const value={parts,envelopes,base:a,wing:b,length,extension:length-1.1,hoses};cache.push({angle,bank,value});if(cache.length>2)cache.shift();return value;
}

function hull(points){
 const p=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y),cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x),lo=[],hi=[];
 for(const v of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),v)<=0)lo.pop();lo.push(v);}
 for(const v of p.reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),v)<=0)hi.pop();hi.push(v);}
 return lo.slice(0,-1).concat(hi.slice(0,-1));
}
export function hydraulicEnvelope(part){
 if(part.type==='box'){
  const c=Math.cos(part.rotation),s=Math.sin(part.rotation);
  return {polygon:[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>({x:part.side+u*part.width/2*c-v*part.tall/2*s,y:part.height+u*part.width/2*s+v*part.tall/2*c})),forward:part.forward,depth:part.depth};
 }
 const a=part.start,b=part.end,length=Math.hypot(b.side-a.side,b.height-a.height,b.forward-a.forward),rx=part.radius*Math.sqrt(Math.max(0,1-((b.side-a.side)/length)**2)),ry=part.radius*Math.sqrt(Math.max(0,1-((b.height-a.height)/length)**2)),rf=part.radius*Math.sqrt(Math.max(0,1-((b.forward-a.forward)/length)**2));
 return {polygon:hull([a,b].flatMap(p=>[-1,1].flatMap(u=>[-1,1].map(v=>({x:p.side+u*rx,y:p.height+v*ry}))))),forward:(a.forward+b.forward)/2,depth:Math.abs(a.forward-b.forward)+rf*2};
}
