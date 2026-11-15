import * as THREE from './vendor/three/three.module.js';
import {roundedCourseRoute,COURSE_SERVICE_COURTS,courseServiceSpurs} from './back-nine-landscape.js';

const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const color=hex=>new THREE.Color(hex).toArray().map(v=>v**.65);
const shoulderTint=color(0x4e6046),soilTint=color(0x767664);

// Border-only decoration follows the same rounded route as the playable
// paving. It neither adds routes nor changes the six-metre movement corridor.
export function createRouteMargins(COURSE){
 const routes=COURSE.paths.map((points,i)=>({points:roundedCourseRoute(points,i===0?4.2:2.3),half:i===0?2.05:[4,5,6].includes(i)?1.7:0}));
 const roadSegments=routes.flatMap((r,id)=>r.half?r.points.slice(1).map((b,i)=>({a:r.points[i],b,half:r.half,id})):[]);
 const counts={shoulderPieces:0,soilPieces:0,courts:0,footpaths:0,shortcuts:0,serviceSpurs:0,apertures:0,source:'sediment-field-v1',soilTexelsPerMeter:313.5};
 function clearance(x,y,own){
  if(own===-2)return 1;
  let alpha=1;
  for(const s of roadSegments){if(s.id===own)continue;const dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],t=Math.max(0,Math.min(1,((x-s.a[0])*dx+(y-s.a[1])*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(x-s.a[0]-dx*t,y-s.a[1]-dy*t);alpha=Math.min(alpha,smooth(s.half+.08,s.half+.55,d));if(!alpha)break;}
  return alpha;
 }
 function* strip(route,{kind,width=6,offset=0,own=-1,closed=false,treadScale=1,role=null}){
  const soil=kind!=='turf',wheel=kind==='wheel',walk=kind==='walk',rows=walk?[-.5,-.28,.28,.5]:wheel?[-.62,-.25,.25,.65]:soil?[-.26,-.03,.24,.67]:[-1,-.87,.87,1],total=route.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-route[i][0],p[1]-route[i][1]),0);
  const normal=i=>{const a=route[i===0?(closed?route.length-2:0):i-1],b=route[i===route.length-1?(closed?1:i):i+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return [(b[1]-a[1])/d,-(b[0]-a[0])/d];};
  let traveled=0;
  for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.00001)continue;
   const na=normal(i-1),nb=normal(i),parts=Math.ceil(length/2.4);
   for(let n=0;n<parts;n++){
    const positions=[],colors=[],uv=[],indices=[];
    for(const t of [n/parts,(n+1)/parts]){
     const cx=a[0]+(b[0]-a[0])*t,cy=a[1]+(b[1]-a[1])*t,nx=na[0]+(nb[0]-na[0])*t,ny=na[1]+(nb[1]-na[1])*t,d=Math.hypot(nx,ny),arc=traveled+length*t;
     const wave=.09*Math.sin(cx*1.7+cy*.83)+.045*Math.sin(cy*2.13-cx*.79),envelope=closed?1:smooth(0,.9,arc)*smooth(0,.9,total-arc);
     for(let row=0;row<rows.length;row++){
      const sign=offset<0?-1:1,across=walk?rows[row]*width+((row===0||row===3)?0:wave*width*.18):soil?offset+sign*(rows[row]+wave)*treadScale:rows[row]*(width*.5+wave*Math.min(1,width/3.5)),x=cx+nx/d*across,y=cy+ny/d*across;
      let alpha=soil?(walk?[0,.72,.72,0]:wheel?[0,.94,.94,0]:[0,.48,.62,0])[row]*(.65+.35*Math.sin(cx*.61+cy*1.07)**2):[0,.9,.9,0][row];
      alpha*=envelope*clearance(x,y,own);
      positions.push(x,walk?.036:soil?.041:.03,-y);uv.push(x/(soil?4:4.4),-y/(soil?4:4.4));colors.push(...(soil?soilTint:shoulderTint),alpha);
     }
    }
    for(let row=0;row<rows.length-1;row++)indices.push(row,row+1,row+rows.length,row+1,row+rows.length+1,row+rows.length);
    if(soil&&offset<0)for(let j=0;j<indices.length;j+=3)[indices[j+1],indices[j+2]]=[indices[j+2],indices[j+1]];
    // Tight inside bends can fold the outer decorative apron back onto
    // a neighbouring piece. Drop those backwards slivers; the opaque road
    // and its navigation footprint remain intact beneath the trim.
    for(let j=indices.length-3;j>=0;j-=3){const [a,b,c]=indices.slice(j,j+3).map(v=>v*3),area=(positions[b+2]-positions[a+2])*(positions[c]-positions[a])-(positions[b]-positions[a])*(positions[c+2]-positions[a+2]);if(area<=.000001)indices.splice(j,3);}
    if(!indices.length||!colors.some((v,i)=>i%4===3&&v>.001))continue;
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();
    counts[soil?'soilPieces':'shoulderPieces']++;yield {geometry:g,type:soil?'soilMargin':'turfMargin',role};
   }
   traveled+=length;
  }
 }
 function* route(index,width){
  const r=routes[index];yield* strip(r.points,{kind:'turf',width,own:index});
  if(r.half)for(const side of [-1,1])yield* strip(r.points,{kind:'soil',offset:side*r.half,own:index});
  else for(const side of [-1,1])yield* strip(r.points,{kind:'wheel',offset:side*.78,own:index});
 }
 function* courts(){
  for(const c of COURSE_SERVICE_COURTS){
   const w=c.w*.5+1,d=c.d*.5+1,r=1.5,points=[];
   // Counterclockwise perimeter: its right-hand normal points outwards.
   for(const [cx,cy,start]of [[w-r,d-r,0],[-w+r,d-r,Math.PI/2],[-w+r,-d+r,Math.PI],[w-r,-d+r,Math.PI*1.5]])for(let i=0;i<=6;i++){const a=start+i/6*Math.PI/2;points.push([c.x+cx+Math.cos(a)*r,c.y+cy+Math.sin(a)*r]);}
   points.push(points[0]);yield* strip(points,{kind:'soil',closed:true});counts.courts++;
  }
 }

 function* minorRoutes(){
  for(const footway of COURSE.footways){
   yield* strip(footway.route,{kind:'turf',width:1.1,role:'footpath'});
   yield* strip(footway.route,{kind:'walk',width:1.1,role:'footpath'});counts.footpaths++;
  }
  for(const cut of COURSE.shortcuts){
   const points=[[cut.from.x,cut.from.y],[cut.to.x,cut.to.y]];
   yield* strip(points,{kind:'turf',width:3.5,role:'shortcut'});
   for(const side of [-1,1])yield* strip(points,{kind:'wheel',offset:side*.65,treadScale:.6,role:'shortcut'});counts.shortcuts++;
  }
  for(const spur of courseServiceSpurs(COURSE)){
   yield* strip(spur.route,{kind:'turf',width:2.8,role:'service'});
   for(const side of [-1,1])yield* strip(spur.route,{kind:'wheel',offset:side*.65,treadScale:.42,role:'service'});counts.serviceSpurs++;
  }
  for(const d of COURSE.decisions){
   const points=[[d.gate.x,d.gate.y-6],[d.gate.x,d.gate.y+6]];
   // These are old tyre scuffs on the existing paved aperture. Allow them
   // onto that paving while ordinary spur ends fade out at road junctions.
   for(const side of [-1,1])yield* strip(points,{kind:'wheel',offset:side*.72,treadScale:.42,own:-2,role:'aperture'});counts.apertures++;
  }
 }
 async function build(steps,put,yieldPreparation){let deadline=performance.now()+8;for(const {geometry,type}of steps){put(geometry,type,0,0,0);geometry.dispose();if(performance.now()>=deadline){await yieldPreparation();deadline=performance.now()+8;}}}
 return {route,courts,minorRoutes,stats:()=>({...counts}),build};
}
