import {COURSE,noise} from './back-nine-course.js';
import {terrainHeight} from './course-terrain.js';

export const PLANTED_BEDS=COURSE.obstacles.filter(o=>o.kind==='hedge');
// Low opaque cores ground the leaves without exposing broad smooth surfaces.
// The existing tree and irregular ground bed remain visible beyond leaf range.
export const BED_CROWNS=PLANTED_BEDS.flatMap((bed,id)=>Array.from({length:9},(_,n)=>{
 const a=n*Math.PI*2/9+noise(id+19)*.4,r=bed.r*(.60+.075*Math.sin(n*3+id));
 return {bed:id,x:bed.x+Math.sin(a)*r,y:bed.y+Math.cos(a)*r,a,
  width:bed.r*(.23+noise(id*13+n)*.05),height:.65+noise(id*31+n)*.42};
}));
export const BED_FOLIAGE=BED_CROWNS.flatMap((c,i)=>Array.from({length:5},(_,n)=>{
 const a=c.a+n*2.4,h=c.height*(1.15+noise(i*37+n)*.42),offset=n===0?0:c.width*.5;
 return {x:c.x+Math.cos(a)*offset,y:c.y-Math.sin(a)*offset,h,width:c.width*1.65,type:n===0?4:2,
  turn:a+noise(i+n)*.4,tint:n===0?[.74,.92,.80]:[.81,.94,.84],flex:n===0?.35:.55,
  base:.04,bed:c.bed};
}));

export function bedRootPath(bed,index){
 const angle=index*Math.PI*2/5+noise(bed.y)*.8,length=bed.r*(.61+noise(index+bed.y)*.15),turn=(noise(index*17+bed.y)-.5)*.4;
 return Array.from({length:7},(_,n)=>{
  const t=n/6,a=angle+turn*Math.sin(t*Math.PI),x=bed.x+Math.sin(a)*length*t,y=bed.y+Math.cos(a)*length*t;
  return {x,y,height:terrainHeight(x,y)+.32*(1-t)**2-.03*t,radius:.025+.18*(1-t)**1.6};
 });
}

function rootGeometry(THREE,bed,root){
 const positions=[],uv=[],indices=[],up=new THREE.Vector3(0,1,0),side=new THREE.Vector3(),normal=new THREE.Vector3(),tangent=new THREE.Vector3(),rings=7;
 for(let n=0;n<root.length;n++){
  const p=root[n],a=root[Math.max(0,n-1)],b=root[Math.min(root.length-1,n+1)];
  tangent.set(b.x-a.x,b.height-a.height,a.y-b.y).normalize();side.crossVectors(tangent,up).normalize();normal.crossVectors(side,tangent).normalize();
  for(let j=0;j<rings;j++){
   const angle=j/rings*Math.PI*2,r=p.radius*(1+.13*Math.sin(j*3+n)),dx=Math.cos(angle)*r,dy=Math.sin(angle)*r;
   positions.push(p.x-bed.x+side.x*dx+normal.x*dy,p.height-terrainHeight(bed.x,bed.y)+side.y*dx+normal.y*dy,-p.y+bed.y+side.z*dx+normal.z*dy);uv.push(j/rings,n/3);
   if(n<root.length-1){const k=n*rings+j,next=n*rings+(j+1)%rings;indices.push(k,k+rings,next,next,k+rings,next+rings);}
  }
 }
 // Ends disappear into trunk/soil, so the tube needs no flat end-cap disks.
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function buildBedCraft({THREE,bed,put,sphere,circle}){
 const id=PLANTED_BEDS.indexOf(bed);
 // Soil disappears gradually into the turf rather than leaving a hard
 // polygon beneath the outer leaves. Reuse the existing soil margin batch.
 const positions=[],uv=[],colors=[],indices=[],steps=48;
 for(const [radius,alpha]of [[0,.72],[.55,.66],[.78,.30],[1,0]])for(let n=0;n<=steps;n++){
  const a=n/steps*Math.PI*2,r=radius*(.91+.055*Math.sin(a*5+id)+.025*Math.sin(a*9-id));
  positions.push(Math.cos(a)*r,0,Math.sin(a)*r);uv.push(.5+Math.cos(a)*r*.5,.5+Math.sin(a)*r*.5);colors.push(.32,.36,.24,alpha);
 }
 for(let row=0;row<3;row++)for(let n=0;n<steps;n++){const a=row*(steps+1)+n,b=a+steps+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const soil=new THREE.BufferGeometry();soil.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));soil.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));soil.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));soil.setIndex(indices);soil.computeVertexNormals();
 put(soil,'soilMargin',bed.x,.032,-bed.y,bed.r+.25,1,bed.r+.25);soil.dispose();
 // Individually rounded crowns reveal the trunk/root centre instead of a
 // single broad flattened sphere spanning the entire bed.
 for(const c of BED_CROWNS.filter(c=>c.bed===id))put(sphere,'leaf',c.x,.13,-c.y,c.width*.56,.20,c.width*.48,c.a);
 for(let n=0;n<5;n++){
  const g=rootGeometry(THREE,bed,bedRootPath(bed,n));put(g,'wood',bed.x,0,-bed.y);g.dispose();
 }
 // Small half-buried stones nestle beside root tips, inside the original bed.
 for(let n=0;n<4;n++){
  const a=n*2.4+bed.y,r=bed.r*(.44+noise(n+bed.y)*.2);
  put(sphere,'stone',bed.x+Math.sin(a)*r,.045,-bed.y+Math.cos(a)*r,.16+noise(n)*.12,.10,.19,a);
 }
 return {roots:5,crowns:9,stones:4};
}
