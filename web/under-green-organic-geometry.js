import * as THREE from './vendor/three/three.module.js';
import {onFloor} from './under-green-course.js';
import {roofAt} from './under-green-layout.js';
import {buildDrainRootCompositions,reservedRootWall} from './under-green-root-compositions.js';

import {mudDepositProfile,mudWallSpans} from './under-green-mud-profile.js';
export {mudDepositProfile} from './under-green-mud-profile.js';

export function buildDrainOrganicGeometry({layout,root,put,materials,lowDetail=false,growth=null}){
 let wallRoots=0,hangingRoots=0,mudBanks=0,ceilingHairs=0;
 // Rounded banks share normals across the original layout partitions.
 for(const {vertical,boundary,side,start,end} of mudWallSpans(layout)){
  const length=end-start;
  const point=(t,h,n)=>new THREE.Vector3(vertical?boundary+side*n:t,h,-(vertical?t:boundary+side*n));
  // Round slumps taper into thin films, with a low wet toe, a compacted
  // middle layer and a lighter drying margin. No extra walking obstruction.
  const steps=Math.max(5,Math.ceil(length/.18)),positions=[],uv=[],colors=[],indices=[];
  for(let k=0;k<=steps;k++){
   const t=start+length*k/steps,{height:h,foot,accumulation,shelf}=mudDepositProfile(t,boundary,start,end,vertical);
   const rows=[point(t,-.025,foot),point(t,h*.08,foot),point(t,h*(.36+shelf*.12),.113+(foot-.113)*.79),point(t,h*.81,.113+(foot-.113)*.37),point(t,h,.1115)];
   const tones=[[.49,.53,.45],[.62,.64,.52],[.82,.78,.61],[.96,.88,.69],[.79,.76,.59]];
   for(let row=0;row<rows.length;row++){const v=rows[row];positions.push(v.x,v.y,v.z);uv.push(t/2,v.y/2);const tone=tones[row],variation=.9+accumulation*.1;colors.push(...tone.map(c=>c*variation));}
   if(k<steps)for(let row=0;row<4;row++){const a=k*5+row,b=a+5;indices.push(a,b,a+1,b,b+1,a+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
  // Orient the deposit front into the actual corridor, irrespective of axis.
  const expected=new THREE.Vector3(vertical?side:0,0,vertical?0:-side),n=g.attributes.normal;
  if(new THREE.Vector3(n.getX(1),0,n.getZ(1)).dot(expected)<0){for(let j=0;j<indices.length;j+=3)[indices[j+1],indices[j+2]]=[indices[j+2],indices[j+1]];g.setIndex(indices);g.computeVertexNormals();}
  // Keep lighting/culling local, but copy the continuous bank's normals so
  // renderer chunk boundaries cannot become visible seams in the sediment.
  for(let first=0;first<steps;first+=32){
   const last=Math.min(steps,first+32),part=new THREE.BufferGeometry();
   for(const name of ['position','normal','uv','color']){
    const a=g.attributes[name];part.setAttribute(name,new THREE.Float32BufferAttribute(a.array.slice(first*5*a.itemSize,(last+1)*5*a.itemSize),a.itemSize));
   }
   part.setIndex(indices.slice(first*24,last*24).map(i=>i-first*5));
   const anchor=point(start+length*(first+last)/2/steps,0,0);
   part.translate(-anchor.x,0,-anchor.z);put(part,'mudBank',anchor.x,0,anchor.z);part.dispose();mudBanks++;
  }
  g.dispose();
 }
 const noise=n=>{const v=Math.sin(n*127.1+19.73)*43758.5453;return v-Math.floor(v);};
 for(let i=0;i<layout.walls.length;i++){
  const w=layout.walls[i],vertical=w.w<w.d,length=vertical?w.d:w.w;
  if(length<.55)continue;
  const side=vertical?(onFloor(w.x+.3,w.y)?1:-1):(onFloor(w.x,w.y+.3)?1:-1);
  const boundary=vertical?w.x:w.y,center=vertical?w.y:w.x,face=boundary+side*.125;
  const point=(t,h,n=.125)=>new THREE.Vector3(vertical?boundary+side*n:t,h,-(vertical?t:boundary+side*n));
  // Leave quiet stretches between dense, asymmetrical tangles.
  if(reservedRootWall(w)||noise(i+7)<.67)continue;
  const top=w.covered?4.14:1.76,spread=Math.min(length*.34,1.05),count=1+Math.floor(noise(i*3)*2);
  for(let branch=0;branch<count;branch++){
   const phase=noise(i*13+branch)*6.28,points=[];
   for(let k=0;k<8;k++){
    const t=k/7,offset=Math.sin(t*5.2+phase)*spread*.7+Math.sin(t*11+phase)*spread*.23;
    points.push(point(center+offset,top*(1-t)+.06*t));
   }
   root(points,.18+noise(i*7+branch)*.15,{vertical,face,side,boundary});wallRoots++;
   for(const k of [2,4,5]){
    const start=points[k],end=points[Math.min(7,k+2)].clone(),mid=start.clone().lerp(end,.5);
    const bow=(branch%2?1:-1)*spread*.34;
    if(vertical)mid.z+=bow;else mid.x+=bow;
    root([start,mid,end],.07+noise(i+branch+k)*.045,{vertical,face,side,boundary});wallRoots++;
   }
  }
 }
 // Distinct ceiling knots: broad intertwined roots with dangling feeder roots.
 // Select clusters in world space, not once per floor partition, which made
 // the previous scene read as identical bundles on a regular grid.
 const authoredRoots=buildDrainRootCompositions({root,put,materials,lowDetail,growth});
 // The first knot grips the east rim of the maintenance shaft, framing the
 // teaching plate instead of trailing through its lettering in perspective.
 const clusters=[[2.1,18.7,.85],[-.5,29,2.05],[1.1,47,1.2],[-.8,57,1.4],[-19.2,46,1.2]];
 for(let j=0;j<clusters.length;j++){
  const [cx,cy,span]=clusters[j];if(!roofAt(cx,cy))continue;
  for(let branch=0;branch<3;branch++){
   const phase=noise(j*29+branch)*6.28,points=[];
   for(let k=0;k<9;k++){
    const t=k/8,x=cx+(t*2-1)*span,y=cy+Math.sin(t*7+phase)*.5+Math.cos(phase)*.55;
    points.push(new THREE.Vector3(x,4.21-Math.sin(t*Math.PI)*(.35+noise(j+branch)*.4),-y));
   }
   root(points,.13+noise(branch+j*9)*.15);hangingRoots++;
   const start=points[3+branch%3],tip=start.clone().add(new THREE.Vector3(Math.sin(phase)*.4,-.4-noise(branch*8+j)*.35,Math.cos(phase)*.3));
   tip.y=Math.max(2.7,tip.y);
   root([start,start.clone().lerp(tip,.5).add(new THREE.Vector3(.12,0,-.09)),tip],.045+noise(branch+j)*.04);hangingRoots++;
   // Fine feeders descend from actual limbs only at selected knots. Keep
   // their tips above head/scythe clearance and leave the other knots quiet.
   if(branch===1&&j%2===0)for(let hair=0;hair<(lowDetail?3:5);hair++){
    const attachment=points[2+hair%4].clone(),end=attachment.clone().add(new THREE.Vector3((noise(j*41+hair)-.5)*.25,-.22-noise(j*19+hair)*.35,(noise(j*31+hair)-.5)*.2));
    end.y=Math.max(2.7,end.y);
    root([attachment,attachment.clone().lerp(end,.52).add(new THREE.Vector3(.035,0,-.025)),end],.009+noise(hair+j)*.005,null,{taper:.94});ceilingHairs++;
   }
  }
 }
 return {wallRoots,hangingRoots,mudBanks,ceilingHairs,authoredRoots};
}
