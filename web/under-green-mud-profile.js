import {onFloor} from './under-green-course.js';

const hash=n=>{const v=Math.sin(n*127.1+19.73)*43758.5453;return v-Math.floor(v);};
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};

// Compact, overlapping sediment lobes: no global sine-wave rhythm and no
// per-vertex noise. Both the bank and its floor apron sample this field.
export function mudDepositProfile(along,boundary,start=-Infinity,end=Infinity,vertical=false){
 const cell=Math.floor(along/3.4);let accumulation=0,shoulder=0;
 for(let i=cell-1;i<=cell+1;i++){
  const seed=i*17+boundary*31,center=(i+.18+hash(seed)*.64)*3.4;
  const width=.65+hash(seed+2)*1.3,d=Math.abs(along-center)/width;
  if(d>=1)continue;
  const lobe=(1-d*d)**3*(.28+hash(seed+5)*.72);
  accumulation+=lobe;shoulder+=lobe*hash(seed+9);
 }
 accumulation=Math.min(1,accumulation);
 const taper=smooth((along-start)/.45)*smooth((end-along)/.45);
 accumulation*=taper;shoulder=Math.min(1,shoulder)*taper;
 // Adhered mud beneath the gallery's actual root fissure and west seep.
 // Unequal overlapping lobes give these sites a history of washed-down soil;
 // the rest of the route retains its quieter, low sediment. Axis is explicit
 // so an unrelated transverse wall at the same coordinate cannot inherit it.
 let mantle=0;
 if(vertical&&(boundary===5||boundary===-5)){
  const lobes=boundary===5
   ? [[10.35,1.18,.55],[11.36,.79,.33],[12.25,1.09,.21]]
   : [[14.65,1.32,.60],[13.52,.65,.27],[15.76,.91,.34]];
  for(const [center,width,weight]of lobes){
   const d=Math.abs(along-center)/width;
   if(d<1)mantle+=weight*(1-d*d)**2;
  }
  // Two washed-out cuts divide each broad shoulder. They continue into the
  // apron through this shared profile rather than becoming decorative stripes.
  for(const [center,width,depth]of boundary===5
   ? [[10.82,.31,.36],[11.94,.24,.24]]
   : [[14.12,.29,.31],[15.18,.35,.42]]){
   const d=Math.abs(along-center)/width;
   if(d<1)mantle*=1-depth*(1-d*d)**2;
  }
 }
 mantle*=taper;
 const body=Math.max(accumulation,Math.min(1,mantle*1.55));
 return {height:.004+accumulation*(.18+shoulder*.12)+mantle,
  foot:.114+body*.083,accumulation:body,shelf:shoulder,
  apron:.025+accumulation*(.28+shoulder*.16)+mantle*.72};
}

// Partition boundaries are a renderer detail, not separate piles of mud.
// Join only touching collinear walls on the same corridor side. Real gaps
// retain separate tapered ends; root placement keeps the original wall list.
export function mudWallSpans(layout){
 const groups=new Map();
 for(const w of layout.walls){
  const vertical=w.w<w.d,length=vertical?w.d:w.w;
  const boundary=vertical?w.x:w.y,center=vertical?w.y:w.x;
  const side=vertical?(onFloor(w.x+.3,w.y)?1:-1):(onFloor(w.x,w.y+.3)?1:-1);
  const key=[vertical,boundary,side].join(':'),list=groups.get(key)||[];
  list.push({vertical,boundary,side,start:center-length/2,end:center+length/2});groups.set(key,list);
 }
 const spans=[];
 for(const list of groups.values()){
  list.sort((a,b)=>a.start-b.start);let last;
  for(const span of list){if(last&&span.start<=last.end+.00001)last.end=Math.max(last.end,span.end);
   else{last={...span};spans.push(last);}}
 }
 return spans.filter(s=>s.end-s.start>=.55);
}
