import * as THREE from './vendor/three/three.module.js';

// A closed wall casts a convex cone from a fixed lamp. If the entire receiver
// box lies beyond a wall face and all eight corners are within that cone,
// every point of the box is blocked. Expand receivers to cover the depth
// comparison bias and neighboring PCF texels; uncertain edges fail open.
export function createDrainLightOcclusion(occluders,{tileSize=128}={}){
 const receiver=new THREE.Box3(),point=new THREE.Vector3(),direction=new THREE.Vector3(),hit=new THREE.Vector3(),ray=new THREE.Ray();
 let checks=0,blocked=0;
 function hidden(origin,bounds,reach){
  checks++;
  const margin=3*reach/tileSize+.035+reach*.003+.02;
  receiver.copy(bounds).expandByScalar(margin);
  for(const wall of occluders){
   // A separating far-face plane keeps the receiver wholly beyond the wall,
   // not merely inside it or on opposite sides of different silhouette edges.
   const beyond=['x','y','z'].some(a=>origin[a]<wall.min[a]&&receiver.min[a]>wall.max[a]||origin[a]>wall.max[a]&&receiver.max[a]<wall.min[a]);
   if(!beyond)continue;
   let covered=true;
   for(let corner=0;corner<8;corner++){
    point.set(corner&1?receiver.max.x:receiver.min.x,corner&2?receiver.max.y:receiver.min.y,corner&4?receiver.max.z:receiver.min.z);
    direction.copy(point).sub(origin);const length=direction.length();direction.multiplyScalar(1/length);ray.set(origin,direction);
    if(!ray.intersectBox(wall,hit)||hit.distanceTo(origin)>=length-.00001){covered=false;break;}
   }
   if(covered){blocked++;return true;}
  }
  return false;
 }
 return {hidden,stats:()=>({walls:occluders.length,checks,blocked,tileSize})};
}
