import * as THREE from './vendor/three/three.module.js';

export const VAULT_SPANS=Object.freeze([[19.8,32],[46.5,52.8],[61.2,67.8]].map(Object.freeze));

// Closed elliptical masonry. The soffit, outer bed, radial ends and both
// reveals have real thickness; no double-sided sheet or intersecting boxes.
// Arc distance follows the actual faceted ellipse, keeping 313.5 texels/metre
// with the shared masonry map's half-repeat and two-metre UV convention.
export function vaultShellGeometry({near,far,start=0,end=Math.PI,segments=32,inner=[3,1.16],outer=[3.15,1.32],base=2.98}){
 const positions=[],uv=[],indices=[],point=(r,a,z)=>new THREE.Vector3(r[0]*Math.cos(a),base+r[1]*Math.sin(a),z);
 function quad(points,texels,normal){
  const cross=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
  if(cross.dot(normal)<0){points=[points[0],points[3],points[2],points[1]];texels=[texels[0],texels[3],texels[2],texels[1]];}
  const n=positions.length/3;for(let i=0;i<4;i++){positions.push(...points[i].toArray());uv.push(...texels[i]);}indices.push(n,n+1,n+2,n,n+2,n+3);
 }
 for(const [r,isInner]of [[inner,true],[outer,false]]){
  let arc=0;
  for(let i=0;i<segments;i++){
   const a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments,mid=(a+b)/2;
   const p=point(r,a,-near),q=point(r,b,-near),next=arc+p.distanceTo(q),sign=isInner?-1:1;
   quad([p,q,point(r,b,-far),point(r,a,-far)],[[arc/2,near/2],[next/2,near/2],[next/2,far/2],[arc/2,far/2]],new THREE.Vector3(sign*Math.cos(mid)/r[0],sign*Math.sin(mid)/r[1],0));arc=next;
  }
 }
 for(const y of [near,far])for(let i=0;i<segments;i++){
  const a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments,points=[point(inner,a,-y),point(inner,b,-y),point(outer,b,-y),point(outer,a,-y)];
  quad(points,points.map(p=>[p.x/2,p.y/2]),new THREE.Vector3(0,0,y===near?1:-1));
 }
 for(const a of [start,end]){
  const points=[point(inner,a,-near),point(outer,a,-near),point(outer,a,-far),point(inner,a,-far)],sign=a===start?-1:1;
  quad(points,points.map(p=>[-p.z/2,(p.y+p.x)/2]),new THREE.Vector3(-Math.sin(a)*sign,Math.cos(a)*sign,0));
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.userData.preserveDrainUV=true;return g;
}

export function buildGalleryMasonryRibs(put){
 let stones=0;
 for(const [y,radius]of [[10,5],[22,3],[30,3]]){
  const count=radius===5?26:18;
  for(let i=0;i<count;i++){
   const seam=.0015,bed=i%3===1?.008:0;
   const g=vaultShellGeometry({near:y-.18,far:y+.18,start:i/count*Math.PI+seam,end:(i+1)/count*Math.PI-seam,segments:2,base:3.05,inner:[radius-.1-bed,1.04-bed],outer:[radius+.12,1.2]});
   g.translate(0,0,y);put(g,'rootStone',0,0,-y);g.dispose();stones++;
  }
 }
 return {ribs:3,stones,minimumHeight:3.05};
}

export function buildDrainVaults({materials,put,box}){
 const source=materials.rootStone;materials.vaultStone=source.clone();materials.vaultStone.color.setHex(0xbcbda9);
 // Three's Material.clone does not preserve custom shader hooks.
 materials.vaultStone.onBeforeCompile=source.onBeforeCompile;materials.vaultStone.customProgramCacheKey=source.customProgramCacheKey;
 let stones=0,triangles=0,minimumHeight=Infinity;
 const place=(g,type,mid)=>{const p=g.attributes.position;for(let i=0;i<p.count;i++)minimumHeight=Math.min(minimumHeight,p.getY(i));triangles+=g.index.count/3;g.translate(0,0,mid);put(g,type,0,0,-mid);g.dispose();};
 for(const [near,far]of VAULT_SPANS){
  const mid=(near+far)/2;place(vaultShellGeometry({near,far}),'vaultStone',mid);
  for(const y of [near+.12,far-.12])for(let i=0;i<18;i++){
   // Narrow mortar joints reveal the continuous masonry behind each fitted
   // voussoir. Alternating beds avoid a mechanically uniform rib silhouette.
   const seam=.0015,start=i/18*Math.PI+seam,end=(i+1)/18*Math.PI-seam;
   const bed=i%3===1?.008:0,depth=.27+(i%4===0?.012:0);
   place(vaultShellGeometry({near:y-depth/2,far:y+depth/2,start,end,segments:2,inner:[2.91-bed,1.08-bed],outer:[3.07,1.24]}),'rootStone',y);stones++;
  }
  for(const side of [-1,1])box('rootStone',side*2.98,2.98,-mid,.12,.18,far-near);
 }
 return {spans:VAULT_SPANS.map(([near,far])=>({near,far})),minimumHeight:Math.min(2.89,minimumHeight),fittedStones:stones,closedShells:3,triangles,physicalUV:true};
}
