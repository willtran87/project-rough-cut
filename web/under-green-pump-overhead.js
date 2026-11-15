// Pump-room steelwork is sized to its real outer walls. All parts remain
// overhead; no new posts, colliders or route obstacles are introduced.
export const PUMP_BEAM_BAYS=Object.freeze([34.1,37.1,44.9,47.5]);
export function buildPumpOverhead({layout,box}){
 const parts=[],beams=[];
 const add=(type,x,height,y,w,h,d)=>{parts.push({type,x,y,height,w,h,d});box(type,x,height,-y,w,h,d);};
 function spanAt(y){
  const spans=layout.tiles.filter(t=>t.covered&&t.x<-12&&Math.abs(t.y-y)<t.d/2).map(t=>[t.x-t.w/2,t.x+t.w/2]).sort((a,b)=>a[0]-b[0]),merged=[];
  for(const span of spans){const last=merged.at(-1);if(last&&span[0]<=last[1]+1e-6)last[1]=Math.max(last[1],span[1]);else merged.push([...span]);}
  return merged.find(([a,b])=>a<=-20&&b>=-20);
 }
 for(const y of PUMP_BEAM_BAYS){
  const span=spanAt(y);if(!span)continue;const [left,right]=span,width=right-left,x=(left+right)/2;
  // Separate web/flanges give the underside a recognisable I-section. The
  // top flange beds into the slab; the lower edge clears the existing pipe.
  add('machineIron',x,4.005,y,width,.25,.075);
  add('machineSteel',x,4.135,y,width,.04,.34);
  add('machineIron',x,3.875,y,width,.035,.34);
  for(const side of [-1,1]){
   const wall=side<0?left:right,inside=wall-side*.09;
   add('machineIron',wall,3.93,y,.12,.44,.56);
   add('machineRust',inside,3.845,y,.30,.05,.52);
   // Two vertical stiffeners transfer the flange load into each wall seat.
   for(const dz of [-.15,.15]){
    add('machineSteel',inside,4.005,y+dz,.24,.23,.028);
    for(const h of [3.79,4.08])add('machineSteel',wall-side*.075,h,y+dz,.045,.045,.045);
   }
  }
  // Sparse stiffener pairs and rivets give long webs scale without a
  // repetitive strip of bright ornament across the whole room.
  for(const at of [left+width*.28,left+width*.72])for(const side of [-1,1]){
   add('machineIron',at,4.005,y+side*.064,.055,.23,.055);
   for(const h of [3.925,4.08])add('machineSteel',at,h,y+side*.098,.032,.032,.016);
  }
  beams.push({y,left,right,bottom:3.71});
 }
 // The service rack follows the eastern wall, framing the exit without
 // crossing the control's sign or the central overhead irrigation line.
 const rackX=-14.5,near=34.1,far=47.5,middle=(near+far)/2,length=far-near;
 for(const side of [-1,1])add('machineIron',rackX+side*.22,3.755,middle,.035,.13,length);
 for(let y=near;y<=far+.001;y+=.67)add('machineRust',rackX,3.7075,y,.46,.025,.07);
 for(const x of [rackX-.12,rackX,rackX+.12])add('rubber',x,3.745,middle,.048,.048,length);
 for(const y of PUMP_BEAM_BAYS){
  for(const side of [-1,1])add('machineSteel',rackX+side*.27,3.92,y,.026,.44,.026);
  add('machineIron',rackX,3.69,y,.64,.04,.10);
 }
 return {kind:'riveted-pump-steelwork',beams,rack:{x:rackX,near,far},parts:parts.length,triangles:parts.length*12,minimumHeight:Math.min(...parts.map(p=>p.height-p.h/2))};
}
