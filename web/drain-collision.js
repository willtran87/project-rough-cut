export const DRAIN_LAYOUT=Object.freeze({archOffset:-.6,gateOffset:.36,
 stone:Object.freeze({x:1.37,y:.49,z:-.30,w:.62,h:.98,d:1.15}),
 foot:Object.freeze({x:1.16,y:.18,z:.04,w:.30,h:.25,d:.34}),
 gateFootprint:Object.freeze({minX:-1.19,maxX:1.19,minZ:-.025,maxZ:.21})});
export function drainCollisionObstacles(anchor,scale=.16,xScale=.1152){
 const result=[],add=(id,x,z,w,d)=>result.push({id,kind:'drain-solid',x:anchor.x+x/xScale,y:anchor.y-z/scale,
  radius:Math.max(w,d)/(2*scale),radiusX:w/(2*scale),radiusY:d/(2*scale),shape:'box',blocks:true,sight:false,draw:false,landmark:'drain release structure'});
 const l=DRAIN_LAYOUT;
 for(const s of [-1,1]){
  add('drain-stone-'+(s<0?'west':'east'),s*l.stone.x,l.archOffset+l.stone.z,l.stone.w,l.stone.d);
  add('drain-foot-'+(s<0?'west':'east'),s*l.foot.x,l.archOffset+l.gateOffset+l.foot.z,l.foot.w,l.foot.d);
 }
 const g=l.gateFootprint;add('drain-grate',0,l.archOffset+l.gateOffset+(g.minZ+g.maxZ)/2,g.maxX-g.minX,g.maxZ-g.minZ);
 return result;
}
export function auditDrainCollisionArt(obstacles,art,scale){
 return obstacles.filter(o=>o.kind==='drain-solid'&&o.blocks).map(o=>{
  const matches=(art||[]).filter(a=>a.id===o.id),a=matches[0],x=o.x*scale.x*scale.meters,z=-o.y*scale.meters;
  const expected=[x-o.radiusX*scale.meters,x+o.radiusX*scale.meters,z-o.radiusY*scale.meters,z+o.radiusY*scale.meters];
  const actual=a?[a.min[0],a.max[0],a.min[2],a.max[2]]:null;
  const maxError=actual?Math.max(...actual.map((v,i)=>Math.abs(v-expected[i]))):null;
  return {id:o.id,owner:a?.owner||null,visible:!!a?.visible,expected,actual,maxError,
   passed:matches.length===1&&a.visible&&Number.isFinite(maxError)&&maxError<=.025&&a.max[1]-a.min[1]>.20};
 });
}
