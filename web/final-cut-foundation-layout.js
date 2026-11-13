import {REFUGES,WALLS,SECTORS,inside} from './final-cut-course.js';
import {GROUND_SLABS,actorGroundHeight} from './final-cut-ground-layout.js';

const random=n=>{const x=Math.sin(n*127.1+19.7)*43758.5453;return x-Math.floor(x);};
const paths=GROUND_SLABS.filter(s=>['path','gravel'].includes(s.material));
function pathDistance(x,y,s){
 const c=Math.cos(s.yaw||0),sn=Math.sin(s.yaw||0),dx=x-s.x,dy=y-s.y;
 const a=Math.abs(dx*c-dy*sn)-s.w/2,b=Math.abs(dx*sn+dy*c)-s.d/2;
 return Math.hypot(Math.max(a,0),Math.max(b,0))+Math.min(Math.max(a,b),0);
}
export const FOUNDATION_BEDS=REFUGES.flatMap(s=>{
 const beds=[],add=(id,x,y,rx,ry)=>beds.push({id:s.id+'-'+id,refuge:s.id,x:s.x+x,y:s.y+y,rx,ry,seed:s.y*29+beds.length*37});
 // Irregular islands leave masonry exposed between groups. Roots stand
 // outside the 0.7m wall thickness, rather than disappearing inside it.
 for(const side of [-1,1]){
  add('end-'+side+'-a',-s.w*.27,side*(s.d/2+.78),1.22,.39);
  add('end-'+side+'-b',s.w*.24,side*(s.d/2+.72),.95,.34);
  add('west-'+side,-s.w/2-.73,side*s.d*.24,.34,1.18);
 }
 return beds;
});
// Purposeful crown clusters: a dominant plant, a younger companion and a
// skirt of smaller growth, with asymmetric bare pockets between each group.
const offsets=[[0,0,1],[-.36,.16,.82],[.30,-.22,.77],[-.64,-.12,.50],[.62,.08,.52],[-.18,-.56,.56],[.13,.55,.48],[-.52,.52,.36],[.54,-.48,.39],[-.80,.20,.26],[.78,.34,.29],[.02,-.82,.30]];
export function foundationPlantLayout(){
 const plants=[];
 for(const bed of FOUNDATION_BEDS)for(let n=0;n<offsets.length;n++){
  const [a,b,size]=offsets[n],seed=bed.seed+n*13,x=bed.x+(a+(random(seed)-.5)*.08)*bed.rx,y=bed.y+(b+(random(seed+9)-.5)*.08)*bed.ry;
  if(WALLS.some(w=>inside({x,y},w,.055))||SECTORS.some(s=>inside({x,y},s,.3)))continue;
  const clearance=Math.min(...paths.map(s=>pathDistance(x,y,s)));
  const maximum=bed.refuge==='pump'?.66:bed.refuge==='pavilion'?.58:.48;
  // The narrow west pavilion margin cannot support a full fern without
  // obscuring the service path. Fit its crown to the actual available soil.
  const h=Math.min(maximum*(.33+size*.67),(clearance-.04)/.48);
  if(h<.15)continue;
  const type=n<3?(bed.refuge==='pump'?1:bed.refuge==='pavilion'?3:2):n%4===0?5:2;
  plants.push({x,y,h,type,seed,base:actorGroundHeight(x,y)+.002,bed:bed.id,refuge:bed.refuge});
 }
 return plants;
}
export function foundationBedWeight(x,y){
 if(paths.some(s=>pathDistance(x,y,s)<.02))return 0;
 let weight=0;
 for(const bed of FOUNDATION_BEDS){
  const dx=(x-bed.x)/(bed.rx+.13),dy=(y-bed.y)/(bed.ry+.15),r=Math.hypot(dx,dy);
  if(r>1.2)continue;
  const edge=.035*Math.sin(x*9+y*4)+.025*Math.sin(y*13-x*3),t=Math.max(0,Math.min(1,(1.12-r+edge)/.5));
  weight=Math.max(weight,t*t*(3-2*t)*.84);
 }
 return weight;
}
