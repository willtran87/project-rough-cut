// Course coordinates. Open-backed benches stop walking bodies, but do not
// pretend to be full-height concealment. Their visual bounds match these hulls.
export const DEAD_GREEN_BENCHES=[-1,1].map(side=>Object.freeze({
 id:`dead-green-bench-${side<0?'west':'east'}`,kind:'rest-bench',x:side*45,y:525,
 radius:5.5,radiusX:5.5,radiusY:1.9,shape:'box',blocks:true,sight:false,draw:false,
 landmark:'old finish waiting bench',
}));
export const REFUGE=Object.freeze({x:0,z:-81.6,rx:8.8,rz:4.9});
export function onDeadGreen(x,z){
 return ((x-REFUGE.x)/REFUGE.rx)**2+((z-REFUGE.z)/REFUGE.rz)**2<.94**2;
}

// Compare authored body blockers against bounds measured from the actual
// rendered bench vertices, not an ID allowlist or a second copied width.
export function auditBenchCollisionArt(obstacles,art,scale){
 return obstacles.filter(o=>o.kind==='rest-bench'&&o.blocks).map(o=>{
  const matches=(art||[]).filter(a=>a.id===o.id),a=matches[0];
  const x=o.x*scale.x*scale.meters,z=-o.y*scale.meters;
  const expected=[x-o.radiusX*scale.meters,x+o.radiusX*scale.meters,z-o.radiusY*scale.meters,z+o.radiusY*scale.meters];
  const actual=a?[a.min[0],a.max[0],a.min[2],a.max[2]]:null;
  const maxError=actual?Math.max(...actual.map((v,i)=>Math.abs(v-expected[i]))):null;
  return {id:o.id,owner:a?.owner||null,visible:!!a?.visible,expected,actual,maxError,
   passed:matches.length===1&&a.visible&&Number.isFinite(maxError)&&maxError<=.035&&a.max[1]>.4&&a.min[1]<.12};
 });
}
