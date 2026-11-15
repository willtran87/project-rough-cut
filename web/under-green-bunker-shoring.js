import * as THREE from './vendor/three/three.module.js';

// Variation follows specific repairs, not per-frame randomness. Height remains
// above the established clearance envelope; every end bears on real masonry.
const frames={
 52.5:{height:4.58,fall:.025,left:.70,right:.82,foot:3.61},
 55.2:{height:4.52,fall:-.04,left:.94,right:.63,foot:3.53},
 58.5:{height:4.60,fall:.02,left:.65,right:.88,foot:3.65},
 64:{height:4.49,fall:-.045,left:.93,right:.70,foot:3.50,repair:true},
 67.8:{height:4.57,fall:.035,left:.72,right:.95,foot:3.59},
 71.7:{height:4.53,fall:-.025,left:.89,right:.64,foot:3.56},
 74.8:{height:4.60,fall:.015,left:.67,right:.84,foot:3.64}
};

// A narrow bevel breaks the squared silhouette while retaining flat timber
// faces. Local V follows grain along the member, including rotated knees.
export function shoringTimberGeometry(width,length,depth,span=4,grainU=0,grainV=0){
 const w=width/2,d=depth/2,b=Math.min(.012,width*.09,depth*.09),corners=[[-w+b,-d],[w-b,-d],[w,-d+b],[w,d-b],[w-b,d],[-w+b,d],[-w,d-b],[-w,-d+b]],p=[],uv=[],idx=[];
 for(const y of [-length/2,length/2])for(const [x,z]of corners){p.push(x,y,z);uv.push(0,0);}
 for(let i=0;i<8;i++){const j=(i+1)%8;idx.push(i,i+8,j+8,i,j+8,j);}
 for(let i=1;i<7;i++){idx.push(0,i,i+1,8,9+i,8+i);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();const a=flat.attributes.position,n=flat.attributes.normal,t=flat.attributes.uv;
 for(let i=0;i<a.count;i++){const cap=Math.abs(n.getY(i))>.9,side=Math.abs(n.getX(i))>Math.abs(n.getZ(i));t.setXY(i,grainU+(side?a.getZ(i):a.getX(i))/span,grainV+(cap?a.getZ(i):a.getY(i))/span);}
 flat.userData.preserveDrainUV=true;return flat;
}

export function buildBunkerShoring({left,right,y,materials,box,put,onFloor}){
 const profile=frames[y],width=right-left,centre=(left+right)/2,records=[];
 if(!profile)throw Error('Unplanned bunker frame '+y);
 const level=x=>profile.height+profile.fall*(x-centre)/width;
 function timber(a,b,w,d,kind){
  const grainU=[.15,.37,.63,.86][(Math.round(y*10)+records.length)%4],grainV=(y*.03+.17*(records.length%5))%1;
  const g=shoringTimberGeometry(w,a.distanceTo(b),d,materials.shoringWood.userData.drainUVMetres||4,grainU,grainV);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()));
  const c=a.clone().add(b).multiplyScalar(.5);put(g,'shoringWood',c.x,c.y,c.z);g.dispose();records.push({kind,a:a.toArray(),b:b.toArray(),width:w,depth:d,grainU,grainV});
 }
 const point=(x,h,dy=0)=>new THREE.Vector3(x,h,-y+dy);
 timber(point(left,level(left)),point(right,level(right)),.26,.22,'crossbeam');
 let knees=0;
 for(const side of [-1,1]){
  const end=side<0?left:right,inward=-side,anchor=end+inward*.06,h=level(anchor),foot=profile.foot+(side>0?.045:0);
  box('rust',end,h-.30,-y,.25,.32,.28);box('machineSteel',end,h-.20,-y,.29,.04,.34);
  if(onFloor(end+side*.2,y))continue;
  const reach=Math.min(side<0?profile.left:profile.right,width*.24),joint=end+inward*reach;
  timber(point(anchor,foot),point(joint,level(joint)-.10),.19,.22,'knee');
  timber(point(anchor,foot-.08),point(anchor,h+.08),.20,.23,'bearing');
  box('rust',anchor,foot+.04,-y,.27,.26,.28);
  for(const face of [-1,1]){
   box('machineSteel',anchor,foot+.04,-y+face*.15,.18,.25,.028);
   for(const dy of [-.065,.065])box('machineIron',anchor,foot+.04+dy,-y+face*.174,.035,.035,.025);
  }
  // Packing closes the old gap to the roof underside at4.8m. Two fitted
  // layers read as a repaired bearing, without lowering the walking space.
  const top=h+.13,packing=4.80-top;
  for(let i=0;i<2;i++)box('shoringWood',end+inward*.21,top+packing*(i+.5)/2,-y+(i?-.018:.018),.48,packing/2+.003,.25);
  knees++;
 }
 const repaired=!!profile.repair&&width<5;
 if(repaired){
  const joint=centre-.27;
  // A short sister timber bridges the damaged span on both travel faces.
  for(const face of [-1,1]){
   timber(point(joint-.88,level(joint-.88)-.025,face*.155),point(joint+.75,level(joint+.75)-.025,face*.155),.20,.10,'sister');
   for(const x of [joint-.62,joint+.47]){
    box('machineIron',x,level(x)-.02,-y+face*.219,.10,.29,.035);
    for(const dy of [-.075,.075])box('machineSteel',x,level(x)+dy-.02,-y+face*.245,.035,.035,.022);
   }
  }
 }
 return {y,left,right,knees,repaired,members:records};
}

// Interrupted laminae replace the ruler-straight soil stripe. Thickness and
// elevation vary independently, with tapered ends where the seam washes out.
export function bunkerSoilBands(edge){
 const length=edge.end-edge.start,count=Math.max(2,Math.ceil(length/.48)),step=length/count,seed=edge.line*.71+edge.start*.23,bands=[];
 for(let i=0;i<count;i++){
  const drift=Math.sin(seed+i*.47),gap=Math.sin(seed*.7+i*.73);if(gap>.79)continue;
  const taper=Math.min(1,(.79-gap)*3),thickness=(.065+.055*(.5+.5*Math.sin(i*1.7+seed)))*taper;
  if(thickness<.008)continue;
  bands.push({at:edge.start+(i+.5)*step,length:step+.004,height:Math.max(3.31+thickness/2,3.42+drift*.075+Math.sin(seed+i*.19)*.045),tall:thickness});
 }
 return bands;
}
