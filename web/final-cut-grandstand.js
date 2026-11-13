import * as THREE from './vendor/three/three.module.js';
import {GRANDSTAND as s,STAND_COLUMNS,standHasSeat,standSeat,standSteps,standRoofHeight} from './final-cut-irrigation-layout.js';

// Authored geometry feeds the scene's existing static material batches. The
// shared layout also owns irrigation landing heights and the open aisles.
export function buildFinalCutGrandstand({mesh,box,cyl,sign,unit}){
 const rounded=(w,h,b)=>new THREE.Shape([
  new THREE.Vector2(-w/2+b,0),new THREE.Vector2(w/2-b,0),new THREE.Vector2(w/2,b),new THREE.Vector2(w/2,h-b),
  new THREE.Vector2(w/2-b,h),new THREE.Vector2(-w/2+b,h),new THREE.Vector2(-w/2,h-b),new THREE.Vector2(-w/2,b)
 ]);
 const pan=new THREE.ExtrudeGeometry(rounded(s.seatWidth,s.seatDepth,s.seatBevel),{depth:s.seatThickness,bevelEnabled:false,steps:1});
 pan.translate(0,-s.seatDepth/2,0);pan.rotateX(Math.PI/2);pan.translate(0,s.seatHeight+s.seatThickness/2,0);
 const back=new THREE.ExtrudeGeometry(rounded(s.seatDepth,.65,.08),{depth:.1,bevelEnabled:false,steps:1});
 back.rotateY(Math.PI/2);back.translate(.27,s.seatHeight+s.seatThickness/2,0);
 const vertices=back.attributes.position;for(let i=0;i<vertices.count;i++)vertices.setX(i,vertices.getX(i)+(vertices.getY(i)-.56)*.15);
 const positions=[...pan.attributes.position.array,...back.attributes.position.array],chair=new THREE.BufferGeometry();
 chair.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));chair.computeVertexNormals();chair.computeBoundingSphere();pan.dispose();back.dispose();

 const spans=[],low=s.centerY-s.stepDepth/2,high=s.centerY+s.stepDepth/2;let start=low;
 for(const y of s.aisles){spans.push([start,y-s.aisleWidth/2]);start=y+s.aisleWidth/2;}spans.push([start,high]);
 let seats=0;
 for(let row=0;row<s.rows;row++){
  const x=s.x+row*s.rowSpacing,h=s.baseHeight+row*s.stepHeight;
  for(const [a,b]of spans)box('stone',x,h/2,-(a+b)/2,s.rowSpacing,h,b-a);
  for(let index=0;index<s.seats;index++)if(standHasSeat(index)){
   const seat=standSeat(row,index);mesh('seat',chair,x,h,-seat.y,1,1,1);
   box('metal',x+.15,h+.22,-seat.y,.09,.44,.12);box('metal',x+.1,h+.035,-seat.y,.5,.07,.5);seats++;
  }
 }
 const stairs=standSteps();for(const p of stairs){box('stone',p.x,p.height/2,-p.y,p.w,p.height,p.d);box('cream',p.x-p.w/2+.035,p.height+.006,-p.y,.07,.012,p.d);}
 function beam(a,b,width=.07,mat='metal'){
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],length=Math.hypot(dx,dy,dz),direction=new THREE.Vector3(dx,dy,dz).normalize();
  const rotation=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction));
  mesh(mat,unit,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,length,width,null,rotation.x,rotation.y,rotation.z);
 }
 // Continuous handrails rise with both stair flights, with posts on real treads.
 for(const y of s.aisles)for(const edge of [-1,1]){
  const z=-y+edge*(s.aisleWidth/2-.1),flight=stairs.filter(p=>p.y===y);
  for(const i of [0,3,6,9,12,14]){const p=flight[i];cyl('metal',p.x,p.height+.5,z,.035,1);}
  for(let i=1;i<flight.length;i++){const a=flight[i-1],b=flight[i];beam([a.x,a.height+1,z],[b.x,b.height+1,z]);}
 }
 const roof=s.roof,angle=Math.atan(roof.slope),length=roof.width*Math.sqrt(1+roof.slope**2);
 mesh('green',unit,roof.x,roof.height,-roof.y,length,roof.thickness,roof.depth,null,0,0,angle);
 // Rafters, edge fascia and roof seams establish a supported pitched canopy.
 for(let y=30;y<=68;y+=4.75)mesh('metal',unit,roof.x,roof.height-.24,-y,length,.14,.1,null,0,0,angle);
 for(let x=roof.x-roof.width/2;x<=roof.x+roof.width/2;x+=1){box('green',x,standRoofHeight(x)+.16,-roof.y,.025,.035,roof.depth);}
 for(const x of [roof.x-roof.width/2,roof.x+roof.width/2])box('cream',x,standRoofHeight(x)-.12,-roof.y,.12,.34,roof.depth);
 for(const {x,y}of STAND_COLUMNS){
  const h=standRoofHeight(x)-.2;box('stone',x,.1,-y,.45,.2,.45);cyl('metal',x,h/2,-y,.1,h);
  beam([x,h-1,-y],[x+(x<roof.x?.85:-.85),standRoofHeight(x+(x<roof.x?.85:-.85))-.25,-y],.09);
 }
 // Rear and end rails frame the empty tiers, without closing the stair mouths.
 for(const y of [low,high]){beam([s.x-.75,.95,-y],[s.x+6.75,3.95,-y]);for(let row=0;row<s.rows;row++){const x=s.x+row*s.rowSpacing,h=s.baseHeight+row*s.stepHeight;cyl('metal',x,h+.5,-y,.035,1);}}
 for(const y of [32,40,48,56,64,66])cyl('metal',s.x+6.85,3.45,-y,.035,1);
 for(const h of [3.3,3.95])beam([s.x+6.85,h,-low],[s.x+6.85,h,-high]);
 for(const [a,b]of [[31.5,49],[49,66.5]]){beam([roof.x+4.5,.3,-a],[roof.x+4.5,5.55,-b],.08);beam([roof.x+4.5,5.55,-a],[roof.x+4.5,.3,-b],.08);}
 const title=sign('NIGHT ORDER INVITATIONAL',s.x-1.32,4,-s.centerY,14,.8);title.rotation.y=-Math.PI/2;
 for(let i=0;i<s.aisles.length;i++){const label=sign('AISLE '+String(i+1).padStart(2,'0'),s.x-1.15,1,-s.aisles[i],1.25,.3);label.rotation.y=-Math.PI/2;}
 return {seats,rows:s.rows,aisles:s.aisles.length,steps:stairs.length,chairTriangles:positions.length/9,roofSlope:roof.slope};
}
