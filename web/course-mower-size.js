// Enlarge the machine below the grip; Joe's hands keep their authored targets.
export const COURSE_MOWER_SIZE=Object.freeze({width:1.4,height:1.25,length:1.3,pivotZ:-.1});
export function mowerBodyPoint(x,y,z){
  const t=Math.max(0,Math.min(1,(y-.55)/.4)),weight=1-t*t*(3-2*t);
  const s=COURSE_MOWER_SIZE;
  return [x*(1+(s.width-1)*weight),y*(1+(s.height-1)*weight),s.pivotZ+(z-s.pivotZ)*(1+(s.length-1)*weight)];
}
export function enlargeMowerBody(geometry){
  const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++)p.setXYZ(i,...mowerBodyPoint(p.getX(i),p.getY(i),p.getZ(i)));
  p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
}
