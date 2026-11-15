import {BREAKABLE_PROPS} from './chase-destruction.js';
import {COURSE,noise,pathDistance,runnerSurfaceAt,blocked} from './back-nine-course.js';
import {COURSE_GREENS,COURSE_FAIRWAYS,routeDistanceXY} from './back-nine-landscape.js';

// Illustrations: flowering grass, reeds, fern/hosta, meadow flowers,
// evergreen groundcover, dry grasses. Habitat selection avoids reed borders
// around every dry fairway and gives the three districts different silhouettes.
export function plantingHabitat(x,y){
 if(COURSE.wet.some(w=>Math.hypot(x-w.x,y-w.y)<w.r+4))return 'wetland';
 return y<305?'nursery':y<590?'range':'clubhouse';
}
const palettes={nursery:[2,2,4,4,0,3],wetland:[1,1,1,2,5,4],range:[5,5,0,3,4,5],clubhouse:[4,4,2,3,3,0]};
const tints={nursery:[.84,1,.88],wetland:[.77,.94,.88],range:[1,.94,.78],clubhouse:[.91,.98,.88]};

// Long, layered drifts connect isolated pockets into recognisable landscapes.
// Axes follow rough ground beside the maintained surfaces. Every individual
// footprint still passes the same route/fixture/green clearance rules below.
export const PLANTING_SWEEPS=[
 {id:'nursery-fern-edge',axis:[[8,50],[11,68],[8,86]],width:3.2,islands:[[5,4.5,1,.85],[17,5,1.15,1],[30,5,.9,.75]]},
 {id:'glasshouse-border',axis:[[37,78],[34,91],[37,105]],width:1.8},
 {id:'nursery-windbreak-edge',axis:[[-8,111],[-6,133],[-9,154]],width:2.1,islands:[[5,4,1.15,.8],[18,5,1.3,.9],[34,5,1,.7]]},
 {id:'west-garden',axis:[[-31,169],[-30,186],[-33,206]],width:1.8},
 {id:'irrigation-bank',axis:[[-5,222],[-1,236],[-4,250]],width:2.8},
 {id:'range-meadow',axis:[[15,345],[17,363],[25,383],[26,400]],width:3.5},
 {id:'range-rise',axis:[[-4,393],[1,411],[8,420]],width:2.2},
 {id:'reservoir-reeds',axis:[[4,455],[0,468],[5,483]],width:3.2},
 {id:'last-range-rough',axis:[[6,529],[2,545],[7,563]],width:2.5},
 {id:'members-approach',axis:[[10,600],[8,620],[13,637]],width:2.3},
 // Frame the approach before the maintained green. The old longitudinal
 // axis ran through protected turf, discarding most of its intended plants.
 {id:'formal-border',axis:[[-2,648],[6,653],[15,661]],width:2.5,islands:[[5,4,1,.8],[16,5,1.1,.9]]},
 {id:'abandoned-flower-walk',axis:[[15,709],[10,727],[4,743]],width:2.6},
 {id:'clubhouse-frontage',axis:[[-6,740],[1,750],[8,762]],width:2.2}
];

// Authored herbaceous islands leave visible grass between mature groups.
// Height feathers down at both ends, so a whole strip never becomes a tall
// curtain beside the runner. Other wetland/meadow drifts keep their own form.
export function plantingGroupProfile(sweep,distance){
 if(!sweep.islands)return {coverage:1,width:1,height:1};
 for(const [center,radius,width,height]of sweep.islands){
  const t=Math.abs(distance-center)/radius;if(t>=1)continue;
  const crown=Math.cos(t*Math.PI/2);
  return {coverage:crown,width:width*(.45+.55*crown),height:height*(.35+.65*crown)};
 }
 return {coverage:0,width:0,height:0};
}

export function plantingClear(x,y,h=.5){
 const radius=h*.4,p={x,y};
 if(y<27||y>780||Math.abs(x)+radius>39.7||blocked(p,radius+.15)||pathDistance(p)<3.4+radius)return false;
 if(routeDistanceXY(x,y,COURSE.footPaths)<.8+radius||runnerSurfaceAt(p)==='path')return false;
 // Maintained sand stays bare; include the plant's spread so cards cannot
 // lean through the sandy shoulder from an otherwise valid grass position.
 if(COURSE.sand.some(s=>((x-s.x)/(s.rx+radius))**2+((y-s.y)/(s.ry+radius))**2<1.04**2))return false;
 if(BREAKABLE_PROPS.some(f=>Math.abs(x-f.x)<f.rx+.5+radius&&Math.abs(y-f.y)<f.ry+.5+radius))return false;
 if(COURSE.features.some(f=>Math.abs(x-f.x)<f.rx+.7+radius&&Math.abs(y-f.y)<f.ry+.7+radius))return false;
 if(COURSE.checkpoints.some(c=>Math.hypot(x-c.x,y-c.y)<11+radius))return false;
 if(COURSE_GREENS.some(g=>((x-g.x)/(g.rx+1+radius))**2+((y-g.y)/(g.ry+1+radius))**2<1))return false;
 // The middle of maintained fairways stays cut. Small peripheral volunteers
 // can survive along the edge, while taller plants belong to rough ground.
 if(h>.65&&COURSE_FAIRWAYS.some(f=>routeDistanceXY(x,y,[f.spine])<Math.min(...f.widths)+radius))return false;
 return true;
}

// These rough-ground pockets frame bends, the nursery, irrigation hollows,
// range margins and the formal clubhouse approach. They add no solid barriers.
export const PLANTING_POCKETS=[
 [9,51,3.4,6],[-23,61,5,8],[10,84,3.8,5],[5,124,4,7],[7,155,3,6],[-8,178,4,8],
 [22,189,3,5],[4,225,4,8],[-21,246,3,6],[-5,256,4,7],[17,275,4,5],
 [-12,320,4,6],[-3,351,4,6],[24,363,3,7],[6,406,4,6],[-8,451,3,6],
 [-35,449,2,5],[3,475,3,6],[5,481,3,7],[-7,514,4,8],[18,556,4,6],
 [-16,602,4,6],[7,632,3,7],[13,672,4,8],[-7,699,3,7],[8,730,4,6],[17,761,3,5]
];
export const DETAIL_PLANTS=[];
const occupancy=new Map();
function admit(x,y,h,seed,group,cluster,style=null){
 if(!plantingClear(x,y,h))return;
 // Keep large clumps distinct rather than piling opaque cards together.
 const key=Math.floor(x*2)+','+Math.floor(y*2);if(occupancy.has(key))return;occupancy.set(key,1);
 const habitat=plantingHabitat(x,y),types=palettes[habitat],type=style?.type??types[Math.floor(noise(seed+40)*types.length)];
 DETAIL_PLANTS.push({x,y,h,type,turn:style?.turn??noise(seed+11)*Math.PI,seed,habitat,group,cluster,tint:style?.tint??tints[habitat],flex:type===1||type===5?1:type===4?.38:.65});
}
function pocket(cx,cy,rx,ry,seed,count,height,group){
 // Uneven lobes create a dense centre and feathered edge with visible gaps.
 for(let n=0;n<count;n++){
  const s=seed+n*23,a=noise(s)*Math.PI*2,r=Math.sqrt(noise(s+1));
  const lobe=.72+.28*Math.sin(a*3+seed*.1),x=cx+Math.cos(a)*rx*r*lobe,y=cy+Math.sin(a)*ry*r;
  const h=height*(.68+.5*noise(s+5))*(1-(group==='pocket'?.58:.23)*r);
  admit(x,y,h,s,group,seed);
 }
}
for(const [id,sweep]of PLANTING_SWEEPS.entries()){
 let distance=0;
 for(let segment=1;segment<sweep.axis.length;segment++){
  const a=sweep.axis[segment-1],b=sweep.axis[segment],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  for(let d=.35;d<length;d+=.85)for(let tier=0;tier<3;tier++){
   const seed=900000+id*5303+segment*701+Math.round(d*100)+tier*31;
   const profile=plantingGroupProfile(sweep,distance+d);
   if(profile.coverage===0||noise(seed+8)>Math.sqrt(profile.coverage))continue;
   // Scalloped lobes and shared gaps form patches, not three parallel rows.
   if(noise(seed+7)<.10||Math.sin((distance+d)*.32+id)>.92)continue;
   const t=d/length,across=(noise(seed+2)*2-1)*sweep.width*profile.width*(.68+.32*Math.sin((distance+d)*.43+id)),along=(noise(seed+3)-.5)*1.3;
   const previous=sweep.axis[Math.max(0,segment-2)],next=sweep.axis[Math.min(sweep.axis.length-1,segment+1)];
   const curve=k=>.5*((2*a[k])+(-previous[k]+b[k])*t+(2*previous[k]-5*a[k]+4*b[k]-next[k])*t*t+(-previous[k]+3*a[k]-3*b[k]+next[k])*t*t*t);
   const x=curve(0)+dy/length*across+dx/length*along,y=curve(1)-dx/length*across+dy/length*along,habitat=plantingHabitat(x,y);
   const layer=Math.abs(across)<sweep.width*.38?1:noise(seed+9)<.55?0:2;
   const type=habitat==='wetland'?(layer===1?1:layer===0?4:5):habitat==='range'?(layer===1?5:layer===0?4:0):habitat==='clubhouse'?(layer===2?3:4):(layer===1?2:4);
   const heights=habitat==='wetland'?[.55,1.9,1.1]:habitat==='range'?[.45,1.35,.75]:habitat==='clubhouse'?[.5,1.25,.8]:[.48,1.45,.78];
   const h=heights[layer]*(.8+noise(seed+5)*.4)*profile.height,turn=Math.atan2(dy,dx)+(noise(seed+11)-.5)*2.4;
   const tint=habitat==='range'?[.96,.88,.69]:habitat==='wetland'?[.71,.87,.72]:habitat==='clubhouse'?[.82,.92,.75]:[.73,.92,.72];
   admit(x,y,h,seed,'sweep',sweep.id,{type,turn,tint});
  }
  distance+=length;
 }
}
for(let y=34;y<779;y+=7)for(const side of [-1,1]){
 const seed=Math.round(y*97+side*31),cx=side*(37.2+noise(seed)*.8);
 pocket(cx,y+(noise(seed+2)-.5)*3,1.7,3.7,seed,13,.85,'boundary');
}
for(const [ri,route]of COURSE.paths.entries())for(let i=1;i<route.length;i++){
 const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
 for(let d=4;d<length;d+=9)for(const side of [-1,1]){
  const seed=Math.round(ri*731+a[1]*91+d*43+side*97),t=d/length,off=5.3+noise(seed)*1.5;
  pocket(a[0]+dx*t+dy/length*side*off,a[1]+dy*t-dx/length*side*off,1.5,2.7,seed,5,.48,'verge');
 }
}
for(const [i,[x,y,rx,ry]]of PLANTING_POCKETS.entries())pocket(x,y,rx,ry,700000+i*131,65,1.45,'pocket');
export const PLANTING_COUNTS=DETAIL_PLANTS.reduce((o,p)=>(o[p.habitat]=(o[p.habitat]||0)+1,o),{});
