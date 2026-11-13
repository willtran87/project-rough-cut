import * as THREE from './vendor/three/three.module.js';

// These shallow masonry vaults remain above all actor/tool clearance. The
// maintenance shaft and junction mouths retain their existing open footprint.
export function buildDrainVaults({materials,put,box}){
 materials.vaultStone=materials.rootStone.clone();materials.vaultStone.color.setHex(0xbcbda9);
 const spans=[[19.8,32],[46.5,52.8],[61.2,67.8]],segments=24;
 for(const [near,far]of spans){
  const positions=[],uv=[],indices=[];
  for(let i=0;i<=segments;i++){
   const a=i/segments*Math.PI,x=3*Math.cos(a),h=2.98+1.16*Math.sin(a);
   for(const y of [near,far]){positions.push(x,h,-y);uv.push(a*3/2,y/2);}
   if(i<segments){const n=i*2;indices.push(n,n+2,n+1,n+2,n+3,n+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.userData.preserveDrainUV=true;
  // Batch by the actual span center; translate the vertices back to local.
  const mid=(near+far)/2;g.translate(0,0,mid);put(g,'vaultStone',0,0,-mid);g.dispose();
  for(const y of [near+.12,far-.12])for(let i=0;i<16;i++){
   const a=(i+.5)/16*Math.PI,x=2.96*Math.cos(a),h=2.98+1.13*Math.sin(a);
   const stone=new THREE.BoxGeometry(.57,.16,.28);put(stone,'rootStone',x,h,-y,1,1,1,0,0,Math.atan2(1.13*Math.cos(a),-2.96*Math.sin(a)));stone.dispose();
  }
  for(const side of [-1,1])box('rootStone',side*2.98,2.98,-mid,.12,.18,far-near);
 }
 return {spans:spans.map(([near,far])=>({near,far})),minimumHeight:2.86};
}
