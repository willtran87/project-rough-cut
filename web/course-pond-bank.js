import * as THREE from './vendor/three/three.module.js';

// The wet edge lies inside the existing obstacle ellipse. Broad coves and small
// cuts share exactly the same profile in the bank mesh and the water shader.
export const pondBankGLSL=`
float pondEdge(float a,float seed){
  return .87+.055*sin(a*3.0+seed)+.025*sin(a*7.0-seed*.7)+.012*sin(a*13.0+seed*1.3);
}`;
export const pondBankSeed=(x,z)=>x*.13+z*.071;
export function pondEdge(a,seed){return .87+.055*Math.sin(a*3+seed)+.025*Math.sin(a*7-seed*.7)+.012*Math.sin(a*13+seed*1.3);}

export function createPondBankGeometry(rx,rz,seed){
  const segments=128,positions=[],uv=[],indices=[];
  for(let row=0;row<3;row++)for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2,edge=pondEdge(a,seed);
    const radius=row===0?edge-.012:row===1?edge+.035:1.015;
    const height=row===0?.084:row===1?.105+.025*Math.sin(a*5+seed)**2:.005;
    positions.push(Math.cos(a)*rx*radius,height,-Math.sin(a)*rz*radius);uv.push(i/segments,row/2);
  }
  for(let row=0;row<2;row++)for(let i=0;i<segments;i++){
    const a=row*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
