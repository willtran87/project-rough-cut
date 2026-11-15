import * as THREE from './vendor/three/three.module.js';
import {BUNKER_BANK} from './under-green-bunker-layout.js';

// Closed, chipped masonry with a seated back, fractured edge and inset face.
// Local +z faces the room. Broad flat facets catch the existing practical light.
export function rootMasonryFragment(width,height,depth,seed=0){
 const corners=[[-.5,-.32],[-.33,-.5],[.34,-.5],[.5,-.28],[.5,.32],[.29,.5],[-.35,.5],[-.5,.28]],p=[],uv=[],indices=[];
 for(let ring=0;ring<3;ring++)for(let i=0;i<8;i++){
  const [x,y]=corners[i],wear=1-.08*(.5+.5*Math.sin(seed*2.17+i*3.1)),inset=ring===2?.87:1;
  p.push(x*width*wear*inset,y*height*wear*inset,ring===0?0:depth*(ring===1?.68:1));uv.push(x*width/2,y*height/2);
 }
 for(let ring=0;ring<2;ring++)for(let i=0;i<8;i++){const a=ring*8+i,b=ring*8+(i+1)%8;indices.push(a,b,b+8,a,b+8,a+8);}
 for(let i=1;i<7;i++){indices.push(0,i+1,i);indices.push(16,16+i,17+i);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);
 // Separate normals at the fracture edges; rounded shading makes masonry waxy.
 const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();return flat;
}

export function buildRootEntryDamage({c,entryAlong,height,seed,point,put}){
 const vertical=c.axis==='x',yaw=vertical?c.side*Math.PI/2:c.side===1?Math.PI:0;
 const earth=c.id==='bunker-taproot'&&height>BUNKER_BANK.upperBottom;
 const receiver=earth?BUNKER_BANK.upperFaceOffset:.11,ceiling=earth?BUNKER_BANK.upperTop-.004:c.top+.03;
 // Staggered fragments follow broken courses rather than a ring of loose cubes.
 const layout=[[-.47,.17,.35,.18],[-.44,-.10,.29,.19],[-.22,-.34,.39,.14],[.23,-.33,.32,.15],[.46,-.06,.35,.20],[.40,.24,.30,.17],[.02,.34,.38,.13]];
 for(const [i,[u,v,w,h]]of layout.entries()){
  const g=rootMasonryFragment(w,h,.045+(i%3)*.014,seed+i*.63);
  // Upper earth ends below the turf lip. Seat every fragment within that
  // physical face, including its rotated corners, rather than in the air above.
  const at=point(entryAlong+u,Math.min(height+v,ceiling-.012-h/2-w*.06),receiver-.008);
  g.userData.rootEntrySurface={id:c.id,axis:c.axis,boundary:c.boundary,side:c.side,receiver};
  // Rotate only within the wall plane; the back remains embedded in its bed.
  put(g,c.material,at.x,at.y,at.z,1,1,1,0,yaw,(i%2?1:-1)*(.035+seed*.004));g.dispose();
 }
 // Short branching mortar failures grow from the displaced courses, tapering
 // to a hairline. They remain opaque and seated on the actual receiver face.
 for(const side of [-1,1]){
  const points=[[side*.43,.10],[side*.62,.16],[side*.70,.10],[side*.83,.13],[side*.91,.08]],p=[],uv=[],ix=[];
  for(let i=0;i<points.length;i++){
   const [u,v]=points[i],half=.012*(1-i/(points.length+.1));
   for(const sign of [-1,1]){const at=point(entryAlong+u,height+v+sign*half,receiver+.0018);p.push(at.x,at.y,at.z);uv.push(u,v);}
   if(i<points.length-1){const a=i*2;ix.push(a,a+2,a+1,a+1,a+2,a+3);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
  const n=g.attributes.normal,expected=new THREE.Vector3(vertical?c.side:0,0,vertical?0:-c.side);
  if(new THREE.Vector3(n.getX(0),n.getY(0),n.getZ(0)).dot(expected)<0){for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];g.setIndex(ix);g.computeVertexNormals();}
  const anchor=point(entryAlong,height,receiver);g.translate(-anchor.x,-anchor.y,-anchor.z);put(g,'rootCrevice',anchor.x,anchor.y,anchor.z);g.dispose();
 }
 return {fragments:layout.length,cracks:2,receiver,ceiling};
}
