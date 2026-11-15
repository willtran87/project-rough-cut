import * as THREE from './vendor/three/three.module.js';
import {waterPoint,onFloor} from './under-green-course.js';

const random=n=>{const v=Math.sin(n*91.73+19.1)*18731.3;return v-Math.floor(v);};
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};

// Only true retaining sides collect raised deposits. Open bypass/detour edges
// keep their existing flat walking surface. Local x spans the channel, y
// follows the crossing; course/world orientation is shared with the water.
export function channelRetainingSpans(w){
 const spans=[],step=.1,lo=-w.depth/2+.3,hi=w.depth/2-.3;
 for(const side of [-1,1]){
  let start=null;
  for(let y=lo;y<=hi+step*.5;y+=step){
   const edge=Math.min(y,hi),outside=waterPoint(w,side*(w.width/2+.08),edge),inside=waterPoint(w,side*(w.width/2-.08),edge);
   const backed=y<hi&& !onFloor(outside.x,outside.y)&&onFloor(inside.x,inside.y);
   if(backed&&start===null)start=edge;
   if(!backed&&start!==null){if(edge-start>.65)spans.push({side,start:start+.08,end:edge-.08});start=null;}
  }
 }
 return spans;
}

export function channelSiltProfile(t,seed){
 const a=.24+random(seed)*.13,b=.68+random(seed+7)*.13;
 const lobe=(center,width)=>Math.max(0,1-((t-center)/width)**2)**3;
 const shape=Math.min(1,lobe(a,.23)+lobe(b,.18)*.66);
 const taper=smooth(t/.08)*smooth((1-t)/.08);
 // The inner masonry face is 11cm inside the floor boundary. Keep the
 // shoulders in front of it; starting at the boundary buries the whole bank.
 return {height:(.012+shape*(.24+random(seed+3)*.10))*taper,foot:.112+(.018+shape*.16)*taper};
}

export function buildDrainChannelEdges({waters,put}){
 const deposits=[],grates=[];
 const world=(w,x,h,y)=>{const p=waterPoint(w,x,y);return new THREE.Vector3(p.x,h,-p.y);};
 const grateFace=new THREE.PlaneGeometry(1,1);grateFace.rotateX(-Math.PI/2);
 function grateQuad(w,type,x,y,width,depth,height=.0014,thickness=.0008){
  // Millimetre-high grate faces sit on the existing opaque floor. Their
  // buried underside/edges cannot be seen, so do not spend ten triangles
  // per rung on them. Separate elevations retain frame/rung layering.
  const p=waterPoint(w,x,y);put(grateFace,type,p.x,height+thickness/2,-p.y,w.axis==='x'?depth:width,1,w.axis==='x'?width:depth);
 }
 for(const [index,w]of waters.entries()){
  // Six removable cast grates per catch bank. Dark inset seats, narrow
  // unpolished frames and worn steel rungs stay below the sole tolerance.
  // Faces join the ordinary static material/cell batches.
  for(const end of [-1,1]){
   const y=end*(w.depth/2-.1),count=Math.ceil(w.width),panel=w.width/count;
   grateQuad(w,'rubber',0,y,w.width,.20,.00045,.0007);
   for(let i=0;i<count;i++){
    const x=-w.width/2+(i+.5)*panel,width=panel-.018;
    for(const side of [-1,1]){
     grateQuad(w,'iron',x+side*(width/2-.012),y,.024,.19);
     grateQuad(w,'iron',x,y+side*.086,width,.018);
    }
    for(let j=1;j<9;j++)grateQuad(w,'steel',x-width/2+j*width/9,y,.027,.15,.00145,.0007);
    // A reinforcing cross-strip sits flush with the rungs, never above shoes.
    grateQuad(w,'iron',x,y,width-.035,.013,.0016,.0004);
   }
   grates.push({id:w.id,end,panels:count,width:w.width,depth:.2,maximumHeight:.0018});
  }
  for(const [si,span]of channelRetainingSpans(w).entries()){
   const seed=index*53+si*19,length=span.end-span.start,segments=Math.max(12,Math.ceil(length/.12)),positions=[],uv=[],colors=[],indices=[];
   // Closed five-sided cross-sections: buried back, two curved shoulders,
   // submerged toe and underside. Silhouettes taper between unequal lobes.
   for(let i=0;i<=segments;i++){
    const t=i/segments,along=span.start+t*length,{height,foot}=channelSiltProfile(t,seed);
    const cross=[[.105,-.008],[.105,height*.94],[.112+(foot-.112)*.16,height],[.112+(foot-.112)*.61,height*.48],[foot,-.004]];
    for(const [depth,h]of cross){
     const p=world(w,span.side*(w.width/2-depth),h,along);positions.push(p.x,p.y,p.z);
     uv.push(along/2,(depth+h)/2);
     const tone=.63+.25*smooth(h/.25);colors.push(tone,tone*.95,tone*.77);
    }
   }
   for(let i=0;i<segments;i++)for(let k=0;k<5;k++){
    const a=i*5+k,b=i*5+(k+1)%5,c=(i+1)*5+(k+1)%5,d=(i+1)*5+k;indices.push(a,b,c,a,c,d);
   }
   for(let k=1;k<4;k++){indices.push(0,k+1,k);const a=segments*5;indices.push(a,a+k,a+k+1);}
   // The cross-section above is clockwise viewed along +course y for side+.
   if(span.side===1)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.userData.preserveDrainUV=true;
   const anchor=g.boundingBox.getCenter(new THREE.Vector3()),bounds={min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()};g.translate(-anchor.x,-anchor.y,-anchor.z);put(g,'mudBank',anchor.x,anchor.y,anchor.z);g.dispose();
   deposits.push({id:w.id,...span,seed,segments,...bounds,maximumIntrusion:.29});
  }
 }
 grateFace.dispose();
 return {grates,deposits,newTextures:0,newLights:0,newColliders:0};
}

