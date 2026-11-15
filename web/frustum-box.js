// A batch proves which frustum planes contain all of its parts. Test only
// the remaining planes for each child; the geometry and clip planes stay exact.
export function frustumBoxMask(frustum,box){
  let mask=0;
  for(let i=0;i<6;i++){
    const p=frustum.planes[i],n=p.normal;
    const maximum=n.x*(n.x>0?box.max.x:box.min.x)+n.y*(n.y>0?box.max.y:box.min.y)+n.z*(n.z>0?box.max.z:box.min.z)+p.constant;
    if(maximum<0)return -1;
    const minimum=n.x*(n.x>0?box.min.x:box.max.x)+n.y*(n.y>0?box.min.y:box.max.y)+n.z*(n.z>0?box.min.z:box.max.z)+p.constant;
    if(minimum<=1e-7)mask|=1<<i;
  }
  return mask;
}

export function intersectsFrustumMask(frustum,box,mask){
  for(let i=0;i<6;i++){
    if(!(mask&(1<<i)))continue;
    const p=frustum.planes[i],n=p.normal;
    if(n.x*(n.x>0?box.max.x:box.min.x)+n.y*(n.y>0?box.max.y:box.min.y)+n.z*(n.z>0?box.max.z:box.min.z)+p.constant<0)return false;
  }
  return true;
}
