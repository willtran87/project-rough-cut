import * as THREE from './vendor/three/three.module.js';

// Shallow dressed earth overlaps the original closed bank. Real stratum
// boundaries undulate through the face; posts retain their bearing pockets.
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const shoringRows=[52.5,55.2,58.5,64,67.8,71.7,74.8];
export function bunkerBankProfile(edge,u,h){
 const length=edge.end-edge.start,t=(u-edge.start)/length,seed=edge.line*.37+edge.side*.61;
 const ends=smooth(Math.min(t,1-t)*length/.48),height=smooth((h-1.88)/.28)*smooth((4.90-h)/.26);
 const postCount=Math.max(1,Math.ceil(length/3)),postStep=length/postCount;
 let postDistance=Math.abs((u-edge.start)/postStep-Math.round((u-edge.start)/postStep))*postStep;
 if(edge.axis==='x')for(const row of shoringRows)postDistance=Math.min(postDistance,Math.abs(u-row));
 const support=smooth((postDistance-.16)/.28);
 const swell=.5+.5*Math.sin(u*1.17+Math.sin(h*1.4+seed)*.6+seed);
 const hollow=.5+.5*Math.sin(u*.53+h*2.2+seed*2);
 const base=edge.axis==='x'&&edge.line===-32?.009:.113;
 return base+ends*height*support*(.025+.075*swell+.018*hollow);
}
export function bunkerBankSeams(edge,u){
 // Sand lenses narrow between unequal pockets instead of tracing a constant
 // ribbon along every wall. Shared samples keep all three closed skins joined.
 const seed=edge.line*.37+edge.side*.61;
 const low=2.19+.20*Math.sin(u*.39+seed)+.075*Math.sin(u*.91-seed);
 const lens=.5+.5*Math.sin(u*.51+Math.sin(u*.17+seed)*1.3+seed);
 return [1.88,low,low+.04+.64*lens*lens,4.90];
}
export function bunkerBankFaceGeometry(edge,layer){
 const cols=Math.max(2,Math.ceil((edge.end-edge.start)/.45)),rows=[3,6,7][layer],positions=[],uv=[],indices=[],sandEdges=[];
 const inward=-edge.side,back=edge.axis==='x'&&edge.line===-32?-.025:.08;
 // A closed volume with identical front/back boundary samples; the back sits
 // inside the opaque foundation. Every seam is shared by adjacent layers.
 for(const side of [0,1])for(let i=0;i<=cols;i++){
  const u=edge.start+(edge.end-edge.start)*i/cols,seams=bunkerBankSeams(edge,u);
  for(let j=0;j<=rows;j++){
   const h=seams[layer]+(seams[layer+1]-seams[layer])*j/rows,d=side?back:bunkerBankProfile(edge,u,h);
   const x=edge.axis==='x'?edge.line+inward*d:u,z=-(edge.axis==='x'?u:edge.line+inward*d);
   positions.push(x,h,z);uv.push((edge.axis==='x'?z:x)/2,h/2);
   if(layer===1)sandEdges.push(Math.min(h-seams[1],seams[2]-h));
  }
 }
 const stride=rows+1,face=(cols+1)*stride;
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
  const a=i*stride+j,b=a+stride;indices.push(a,b,a+1,b,b+1,a+1,face+a,face+a+1,face+b,face+b,face+a+1,face+b+1);
 }
 const boundary=[];
 for(let i=0;i<=cols;i++)boundary.push(i*stride);
 for(let j=1;j<=rows;j++)boundary.push(cols*stride+j);
 for(let i=cols-1;i>=0;i--)boundary.push(i*stride+rows);
 for(let j=rows-1;j>0;j--)boundary.push(j);
 for(let i=0;i<boundary.length;i++){const a=boundary[i],b=boundary[(i+1)%boundary.length];indices.push(a,face+a,b,b,face+a,face+b);}
 // Local front (along x height) points toward the corridor on each orientation.
 if((edge.axis==='x'?inward:-inward)<0)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.userData.preserveDrainUV=true;
 // All strata share one earth face. Averaging the hidden closure caps into
 // its boundary normals created a dark outline at each material seam.
 const normal=g.attributes.normal,delta=.001;
 for(let i=0;i<=cols;i++){
  const u=edge.start+(edge.end-edge.start)*i/cols;
  for(let j=0;j<=rows;j++){
   const k=i*stride+j,h=positions[k*3+1];
   const du=(bunkerBankProfile(edge,u+delta,h)-bunkerBankProfile(edge,u-delta,h))/(2*delta);
   const dh=(bunkerBankProfile(edge,u,h+delta)-bunkerBankProfile(edge,u,h-delta))/(2*delta);
   const n=edge.axis==='x'?new THREE.Vector3(inward,-dh,du):new THREE.Vector3(-du,-dh,-inward);
   n.normalize();normal.setXYZ(k,n.x,n.y,n.z);
  }
 }
 if(layer===1)g.setAttribute('drainBankEdge',new THREE.Float32BufferAttribute(sandEdges,1));
 // The back is planar: only its perimeter and the uneven seam samples need
 // triangles. Keep the original normals so cap/front shading is bit-identical.
 // End-column fans retain every boundary vertex, leaving a closed manifold.
 const compact=[];
 for(let i=0;i<indices.length;i+=3)if(indices[i]<face||indices[i+1]<face||indices[i+2]<face)compact.push(indices[i],indices[i+1],indices[i+2]);
 const backs=[];
 for(let i=0;i<cols;i++){
  const a=face+i*stride,b=a+stride;
  if(i===0){for(let j=0;j<rows;j++)backs.push(a+j,a+j+1,b);backs.push(b,a+rows,b+rows);}
  else if(i===cols-1){for(let j=0;j<rows;j++)backs.push(a,b+j+1,b+j);backs.push(a,a+rows,b+rows);}
  else backs.push(a,a+rows,b,b,a+rows,b+rows);
 }
 if((edge.axis==='x'?inward:-inward)<0)for(let i=0;i<backs.length;i+=3)[backs[i+1],backs[i+2]]=[backs[i+2],backs[i+1]];
 g.setIndex(compact.concat(backs));
 return g;
}
export function buildBunkerBankFaces({edges,put}){
 const parts=[];
 for(const edge of edges)for(let layer=0;layer<3;layer++){
  const g=bunkerBankFaceGeometry(edge,layer),type=layer===1?'sand':'soil',bounds=g.boundingBox.clone(),anchor=bounds.getCenter(new THREE.Vector3());
  parts.push({axis:edge.axis,line:edge.line,start:edge.start,end:edge.end,side:edge.side,layer,type,vertices:g.attributes.position.count,triangles:g.index.count/3,min:bounds.min.toArray(),max:bounds.max.toArray()});
  g.translate(-anchor.x,-anchor.y,-anchor.z);put(g,type,anchor.x,anchor.y,anchor.z);g.dispose();
 }
 return {parts,maximumIntrusion:.231,minimumHeight:1.88,maximumHeight:4.90,opaqueBacking:true,newTextures:0,newColliders:0};
}
