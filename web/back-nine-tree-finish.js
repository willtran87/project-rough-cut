import {noise} from './back-nine-course.js';

export const ENCOUNTER_VISTAS=[
 {id:'nursery-gap',y:155,halfWidth:15,player:{x:-25,y:171,yaw:Math.PI},joe:{x:-25,y:151}},
 {id:'range-ridge',y:410,halfWidth:19,player:{x:-8,y:399,yaw:0},joe:{x:-7,y:424}},
 {id:'garage-approach',y:771,halfWidth:16,player:{x:-23,y:790,yaw:Math.PI},joe:{x:-23,y:771}}
];

export function composeEncounterTrees(placements){
 let framed=0;
 for(const tree of placements){
  // Only the decorative outer belt moves. Collision-bearing island trunks
  // and every route, escape gap and existing cover volume remain in place.
  if(Math.abs(tree.x)<41)continue;
  for(const v of ENCOUNTER_VISTAS){
   const d=Math.abs(-tree.z-v.y);if(d>v.halfWidth)continue;
   const gap=Math.max(0,1-d/(v.halfWidth*.6));
   tree.x+=Math.sign(tree.x)*gap*5;tree.h*=1+.12*(1-gap)-.2*gap;tree.w*=1+.08*(1-gap)-.12*gap;framed++;break;
  }
 }
 return {vistas:ENCOUNTER_VISTAS.map(v=>v.id),framed};
}

// Small climbing stems and lobed leaves belong to the existing planted tree
// trunks. Their entire footprint stays inside the solid tree islands.
export function buildTreeIvy({THREE,bed,put}){
 let leaves=0;
 const height=bed.y<305?2.9:bed.y<590?1.65:2.4;
 for(let stem=0;stem<2;stem++){
  const points=[];
  for(let n=0;n<10;n++){const t=n/9,a=stem*Math.PI+t*3.2+bed.y;points.push(new THREE.Vector3(Math.sin(a)*(.25-t*.06),.15+t*height,Math.cos(a)*(.25-t*.06)));}
  const vine=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),12,.018,5,false);put(vine,'wood',bed.x,0,-bed.y);vine.dispose();
  for(let n=1;n<10;n++)for(const side of [-1,1]){
   if(bed.y>=305&&bed.y<590&&n%3===0)continue;
   const t=n/9,a=stem*Math.PI+t*3.2+bed.y,origin=points[n],size=.10+noise(bed.y+n*13+side)*.08;
   const outline=[[0,0],[-.45,.2],[-1,.04],[-.7,.65],[-.9,.94],[-.25,.84],[0,1.3],[.3,.84],[.9,.94],[.7,.62],[1,.04],[.45,.2]],p=[0,0,.025],uv=[.5,.4],indices=[];
   for(const [x,y]of outline){p.push(x*size,y*size,(1-Math.abs(x))*.025);uv.push(.5+x*.25,.3+y*.3);}
   for(let i=1;i<=outline.length;i++){const j=i===outline.length?1:i+1;indices.push(0,i,j,0,j,i);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);const flat=g.toNonIndexed();flat.rotateZ(side*.6);flat.rotateX(-.3);flat.computeVertexNormals();
   put(flat,'leaf',bed.x+origin.x+Math.cos(a)*side*.08,origin.y,-bed.y+origin.z-Math.sin(a)*side*.08,1,1,1,a);flat.dispose();g.dispose();leaves++;
  }
 }
 return {stems:2,leaves,height};
}
