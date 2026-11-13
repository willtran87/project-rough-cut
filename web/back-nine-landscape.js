// Course-scale composition: planting belongs to islands and boundaries,
// greens to fairways, and service bays connect to the cart-path network.
export const LANDSCAPE_BEDS=[
 // Border planting keeps the mown interiors open. The course builder still
 // rejects any bed that crowds a driving lane, foot gap or required relay.
 [-34,54,4.2],[35,68,3.5],[36,116,3.2],[-34,183,3.4],[-36,261,3],[36,292,3.3],
 [-35,315,3.6],[36,354,3.3],[36,410,3],[-35,397,3],[36,560,3],[-35,588,3.3],
 [36,610,3.4],[-12,638,3.7],[36,747,3.3],[28,764,3.4]
];
export const COURSE_GREENS=[{x:28,y:145,rx:7,ry:10,hole:10},{x:-24,y:274,rx:7,ry:9,hole:12},{x:26,y:335,rx:8,ry:9,hole:13},{x:30,y:539,rx:5.5,ry:8,hole:15},{x:33,y:644,rx:5,ry:7,hole:17},{x:-29,y:739,rx:4.8,ry:5.7,hole:18}];
export const COURSE_RESERVOIRS=[[59,232,10,31],[59,474,10,36]];
// Authored hole axes and mowing widths. Service roads remain the chase's
// connected network; each playing surface now has its own landing area,
// narrowing approach and green instead of repeating a constant-width strip.
export const COURSE_FAIRWAYS=[
 {hole:10,spine:[[24,38],[25,62],[20,96],[25,124],[28,145]],widths:[4.3,9.4,8,9.8,5]},
 {hole:12,spine:[[-31,166],[-27,187],[-21,218],[-25,250],[-24,274]],widths:[4,8.5,10.2,8.1,5.1]},
 {hole:13,spine:[[25,285],[27,302],[23,319],[26,335]],widths:[4.3,8.8,9,5.5]},
 {hole:15,spine:[[25,418],[23,441],[27,477],[26,508],[30,539]],widths:[4.1,9.2,8,9.1,4.3]},
 {hole:17,spine:[[24,584],[17,604],[16,619],[25,636],[33,644]],widths:[4,8.2,9.1,7.4,3.8]},
 {hole:18,spine:[[-28,624],[-23,650],[-17,681],[-21,714],[-29,739]],widths:[4,7.5,6.8,8.2,4.5]}
];
export function routeDistanceXY(x,y,paths){
 let best=Infinity;for(const route of paths)for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
  best=Math.min(best,Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t));
 }return best;
}
// Shallow scalloping softens manufactured ellipses without disguising the
// existing surface boundary. Geometry is baked once, not animated per frame.
export function coursePatch(THREE,seed=0,variation=1){
 const p=[0,0,0],uv=[.5,.5],indices=[],n=48;
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=1+variation*(.025*Math.sin(a*3+seed)+.014*Math.sin(a*5-seed));p.push(Math.cos(a)*r,0,-Math.sin(a)*r);uv.push(.5+Math.cos(a)*.5,.5+Math.sin(a)*.5);}
 for(let i=0;i<n;i++)indices.push(0,i+1,(i+1)%n+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function bunkerLip(THREE,s,paths=[]){
 const p=[],uv=[],indices=[],n=48,radii=[.985,1.035,1.09],heights=[.027,.14,.018];
 const nearby=[];for(const path of paths)for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i];
  if(Math.min(a[0],b[0])>s.x+s.rx*1.1+3.35||Math.max(a[0],b[0])<s.x-s.rx*1.1-3.35||Math.min(a[1],b[1])>s.y+s.ry*1.1+3.35||Math.max(a[1],b[1])<s.y-s.ry*1.1-3.35)continue;
  nearby.push([a,b]);
 }
 for(let ring=0;ring<3;ring++)for(let i=0;i<=n;i++){
  const a=i/n*Math.PI*2,r=(1+.025*Math.sin(a*3+s.y)+.014*Math.sin(a*5-s.y))*radii[ring];
  p.push(Math.cos(a)*r*s.rx,heights[ring],-Math.sin(a)*r*s.ry);uv.push(i/n,ring/2);
 }
 for(let ring=0;ring<2;ring++)for(let i=0;i<n;i++){
  const a=ring*(n+1)+i,b=a+n+1;
  // A maintained lane cuts through the edge of the west bunker. Its bank
  // must not rise across that opening while physics calls the surface path.
  if(nearby.length&&[a,b,a+1,b+1].some(v=>routeDistanceXY(s.x+p[v*3],s.y-p[v*3+2],nearby)<3.35))continue;
  indices.push(a,b,a+1,a+1,b,b+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
// A low retaining edge explains the maintained lane beside a bunker. This is
// a flush timber kerb, not a collision barrier or another row of loose props.
export function buildBunkerRouteEdges({COURSE,box}){
 let count=0;
 for(const [ri,points]of COURSE.paths.entries()){
  const route=roundedCourseRoute(points,ri===0?4.2:2.3);
  for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),steps=Math.ceil(length/1.8);
   for(let n=0;n<steps;n++)for(const side of [-1,1]){
    const t=(n+.5)/steps,x=a[0]+dx*t+dy/length*3.12*side,y=a[1]+dy*t-dx/length*3.12*side;
    if(!COURSE.sand.some(s=>((x-s.x)/s.rx)**2+((y-s.y)/s.ry)**2<1.02)||COURSE.wet.some(w=>Math.hypot(x-w.x,y-w.y)<w.r+.3))continue;
    if([-1,0,1].some(end=>routeDistanceXY(x+dx/steps*.5*end,y+dy/steps*.5*end,COURSE.paths)<3.02))continue;
    box('wood',x,.046,-y,.1,.045,Math.max(.05,length/steps-.025),-Math.atan2(dx,dy));count++;
   }
  }
 }return count;
}
export function roundedCourseRoute(route,maxCut=2.3){
 const out=[route[0]];
 for(let i=1;i<route.length-1;i++){
  const a=route[i-1],b=route[i],c=route[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),r=Math.hypot(c[0]-b[0],c[1]-b[1]),cut=Math.min(maxCut,l*.13,r*.13);
  const p=[b[0]+(a[0]-b[0])*cut/l,b[1]+(a[1]-b[1])*cut/l],q=[b[0]+(c[0]-b[0])*cut/r,b[1]+(c[1]-b[1])*cut/r];out.push(p);
  for(let k=1;k<=4;k++){const t=k/4;out.push([(1-t)**2*p[0]+2*t*(1-t)*b[0]+t*t*q[0],(1-t)**2*p[1]+2*t*(1-t)*b[1]+t*t*q[1]]);}
 }out.push(route.at(-1));return out;
}
// One continuous ribbon instead of overlapping rectangular slabs. Quads are
// short enough for existing spatial/point-light culling to remain effective.
function* courseRibbonSteps(THREE,put,type,route,width,height,banded=false,offset=0){
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),parts=Math.max(1,Math.ceil(length/(banded?5:12)));
  const normal=j=>{const p=route[Math.max(0,j-1)],q=route[Math.min(route.length-1,j+1)],d=Math.hypot(q[0]-p[0],q[1]-p[1]);return [(q[1]-p[1])/d,-(q[0]-p[0])/d];},na=normal(i-1),nb=normal(i);
  for(let n=0;n<parts;n++){
   const p=[],uv=[];for(const t of [n/parts,(n+1)/parts])for(const side of [-1,1]){const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,nx=na[0]+(nb[0]-na[0])*t,ny=na[1]+(nb[1]-na[1])*t,d=Math.hypot(nx,ny),across=width*.5*side+offset;p.push(x+nx/d*across,height,-y-ny/d*across);uv.push(side===1?1:0,t);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();put(g,banded&&n%2?'fairwayCut':type,0,0,0);g.dispose();yield;
  }
 }
}
function* estateGroundSteps({THREE,put,box,cylinder,circle,COURSE,turfColors}){
 // Equipment and gates sit within a small number of working courtyards.
 // These flush surfaces connect existing props without adding solid barriers.
 const courts=[{x:-11,y:211,w:25,d:22},{x:-25,y:350,w:20,d:30},{x:29,y:199,w:18,d:22},{x:-24,y:771,w:17,d:28}];
 for(const c of courts){
  // Compacted gravel belongs to a work court. Rounded rectangular corners
  // replace the unconnected-looking dark turf ellipses beneath equipment.
  const outline=new THREE.Shape(),w=c.w*.5+1,d=c.d*.5+1,r=1.5;
  outline.moveTo(-w+r,-d);outline.lineTo(w-r,-d);outline.quadraticCurveTo(w,-d,w,-d+r);outline.lineTo(w,d-r);outline.quadraticCurveTo(w,d,w-r,d);outline.lineTo(-w+r,d);outline.quadraticCurveTo(-w,d,-w,d-r);outline.lineTo(-w,-d+r);outline.quadraticCurveTo(-w,-d,-w+r,-d);
  const patch=new THREE.ShapeGeometry(outline,4);patch.rotateX(-Math.PI/2);put(patch,'track',c.x,.014,-c.y);patch.dispose();
  for(const side of [-1,1])for(const end of [-1,1]){
   // Low, flush stone corner courses indicate maintenance grounds, not walls.
   box('stone',c.x+side*(c.w*.5-1),.021,-c.y+end*c.d*.5,2,.012,.12);
   box('stone',c.x+side*c.w*.5,.021,-c.y+end*(c.d*.5-1),.12,.012,2);
  }
  // Flush drain channels belong to paved service courts, not random fairways.
  for(const side of [-1,1]){
   box('iron',c.x+side*(c.w*.5-1),.026,-c.y,.4,.012,3.2);
   for(let i=0;i<8;i++)box('rubber',c.x+side*(c.w*.5-1),.035,-c.y-1.35+i*.38,.28,.008,.12);
  }
  yield;
 }
 const fairways=COURSE_FAIRWAYS;
 // Rounded mown turf and thin alternating cuts carry the fairway's direction.
 let teeConnections=0;
 for(const {spine,widths}of fairways){
  // A tapered, curved fairway with cross-course mower passes. Short static
  // strips retain spatial culling; the existing grass is the rough apron.
  const curve=new THREE.CatmullRomCurve3(spine.map(([x,y])=>new THREE.Vector3(x,0,-y))),length=curve.getLength(),steps=Math.ceil(length/4);
  const edge=(t,side)=>{const p=curve.getPointAt(t),d=curve.getTangentAt(t),v=t*(widths.length-1),i=Math.min(widths.length-2,Math.floor(v)),f=v-i,e=f*f*(3-2*f),width=widths[i]+(widths[i+1]-widths[i])*e;return [p.x+d.z*width*side,.005,p.z-d.x*width*side];};
  for(let i=0;i<steps;i++){
   // Blend the mown core into a soft collar rather than outlining each hole
   // with another hard-edged slab. One cullable strip and one shared material.
   const p=[],uv=[],colors=[],indices=[],sides=[-1.16,-1,-.94,.94,1,1.16],cut=turfColors[i%2?'fairwayCut':'fairway'];
   for(const t of [i/steps,(i+1)/steps])for(let n=0;n<sides.length;n++){
    p.push(...edge(t,sides[n]));uv.push(n/5,t);const c=n===0||n===5?turfColors.grass:n===1||n===4?turfColors.fairway:cut;colors.push(c.r**.65,c.g**.65,c.b**.65);
   }
   for(let n=0;n<5;n++)indices.push(n,n+6,n+1,n+1,n+6,n+7);
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();put(g,'fairway',0,0,0);g.dispose();yield;
  }
  // Tee markers belong at the start of a hole, not beside the putting cup.
  const tee=spine[0],next=spine[1],heading=Math.atan2(next[0]-tee[0],next[1]-tee[1]);
  box('fairwayCut',tee[0],.004,-tee[1],7,.012,4.5,-heading);
  for(const side of [-1,1]){
   const x=tee[0]+Math.cos(heading)*side*2.4,z=-tee[1]+Math.sin(heading)*side*2.4;
   box('paint',x,.075,z,.3,.15,.35,-heading);box('iron',x,.155,z,.18,.018,.21,-heading);
  }
  // A narrow mown walk connects each tee to its real nearest cart route.
  // It is turf, not an extra fast lane or a new fenced shortcut.
  let join=null,best=Infinity;for(const route of COURSE.paths)for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((tee[0]-a[0])*dx+(tee[1]-a[1])*dy)/(dx*dx+dy*dy))),p=[a[0]+dx*t,a[1]+dy*t],distance=Math.hypot(p[0]-tee[0],p[1]-tee[1]);if(distance<best){best=distance;join=p;}
  }
  if(best>4&&best<28){yield* courseRibbonSteps(THREE,put,'fairway',roundedCourseRoute([join,[(join[0]+tee[0])*.5,tee[1]-2],tee],1),1.25,.007);teeConnections++;}
 }
 for(const g of COURSE_GREENS){
  const green=coursePatch(THREE,g.hole,2.5);put(green,'fairwayCut',g.x,.006,-g.y,g.rx+1.2,1,g.ry+1.2);put(green,'green',g.x,.009,-g.y,g.rx,1,g.ry);green.dispose();
  // The flag and a flush cup make each clearing read as a putting green.
  put(circle,'rubber',g.x,.014,-g.y,.11,1,.11);put(cylinder,'paint',g.x,1.1,-g.y,.018,2.2,.018);box('flag',g.x+.27,2.01,-g.y,.53,.3,.015);
  // Recessed irrigation heads mark maintained green edges without new obstacles.
  for(const side of [-1,1]){
   put(cylinder,'iron',g.x+side*(g.rx+.6),.018,-g.y,.12,.028,.12);
   box('brass',g.x+side*(g.rx+.6),.035,-g.y,.14,.01,.025);
  }
  yield;
 }
 // Proper aprons tie the shelters to the path rather than leaving floating huts.
 for(const c of COURSE.checkpoints){box('road',c.x,.018,-c.y,7,.022,11);for(const side of [-1,1]){box('stone',c.x+side*3.4,.032,-c.y,.12,.018,10);for(let n=0;n<6;n++)box('iron',c.x+side*3.15,.038,-c.y-2+n*.8,.32,.012,.055);}}
 // Service spurs explain how equipment reached each bay. Keep them flat and
 // visually subordinate to the main cart path; they introduce no solid props.
 for(const f of COURSE.features.filter(f=>['trailer','parked-cart','cistern'].includes(f.kind))){
  let nearest=null,best=Infinity;for(const route of COURSE.paths)for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((f.x-a[0])*dx+(f.y-a[1])*dy)/(dx*dx+dy*dy))),p=[a[0]+dx*t,a[1]+dy*t],d=Math.hypot(p[0]-f.x,p[1]-f.y);if(d<best){best=d;nearest=p;}}
  if(best>1&&best<22)yield* courseRibbonSteps(THREE,put,'pathEdge',[[f.x,f.y],nearest],2.8,.018);
 }
 // Reservoirs sit beyond the existing boundary fence. The driveable wet
 // lanes stay shallow turf, while these larger water bodies explain irrigation.
 for(const [x,y,rx,ry]of COURSE_RESERVOIRS){
  // Boundary turf tops out at .115 m; keep the shoreline above that surface.
  put(circle,'rough',x,.12,-y,rx+1.5,1,ry+1.5);put(circle,'wet',x,.125,-y,rx,1,ry);
  for(let i=0;i<18;i++){const a=i*2.399,r=.25+(i%5)*.13;box('sheen',x+Math.sin(a)*rx*r,.133,-y+Math.cos(a)*ry*r,.6+(i%4)*.5,.004,.035);}
  yield;
 }
 return {greens:COURSE_GREENS.length,fairways:fairways.length,reservoirs:2,courts:courts.length,teeConnections};
}

function finishSteps(steps){let next;do{next=steps.next();}while(!next.done);return next.value;}
async function prepareSteps(steps,yieldPreparation){
 let deadline=performance.now()+8,next;
 while(!(next=steps.next()).done)if(performance.now()>=deadline){await yieldPreparation();deadline=performance.now()+8;}
 return next.value;
}
// Same geometry, order and return values for synchronous tooling and the
// cooperatively prepared game scene. No per-frame or gameplay work is added.
export function courseRibbon(...args){return finishSteps(courseRibbonSteps(...args));}
export function courseRibbonAsync(yieldPreparation,...args){return prepareSteps(courseRibbonSteps(...args),yieldPreparation);}
export function buildEstateGround(args){return finishSteps(estateGroundSteps(args));}
export function buildEstateGroundAsync(args,yieldPreparation){return prepareSteps(estateGroundSteps(args),yieldPreparation);}
