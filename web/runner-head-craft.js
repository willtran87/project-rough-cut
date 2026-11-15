// A continuous head surface keeps the portrait attached through the jaw and
// temples. The feature-free perimeter of the portrait supplies the side skin.
export function createRunnerHead(THREE){
 const profile=new THREE.CatmullRomCurve3([
  [0,-.165,.0],[.065,-.153,.065],[.093,-.125,.098],
  [.116,-.08,.119],[.138,-.025,.132],[.140,.025,.133],
  [.133,.080,.126],[.112,.132,.107],[.066,.172,.065],[0,.189,0],
 ].map(p=>new THREE.Vector3(...p)));
 const positions=[],uvs=[],indices=[],rows=40,columns=48;
 for(let j=0;j<=rows;j++){
  const p=profile.getPoint(j/rows),y=p.y,center=.012+.022*Math.max(0,y/.189);
  for(let i=0;i<=columns;i++){
   const angle=i/columns*Math.PI*2,x=p.x*Math.sin(angle),front=Math.max(0,Math.cos(angle));
   const nose=(.023*Math.exp(-((x/.020)**2)-((y+.05)/.024)**2)
    +.009*Math.exp(-((x/.012)**2)-((y+.012)/.042)**2))*front**12;
   positions.push(x,y,center-p.z*Math.cos(angle)-nose);
   const u=front>0?Math.max(.012,Math.min(.988,.5-x/.205)):.012;
   const v=Math.max(.012,Math.min(.988,(y+.1525)/.235));
   uvs.push(u,v);
   if(j<rows&&i<columns){const a=j*(columns+1)+i,b=a+columns+1;indices.push(a,b,a+1,b,b+1,a+1);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
 // Share the seam normals without changing the front/side UV registration.
 const normals=g.attributes.normal;
 for(let j=0;j<=rows;j++){const a=j*(columns+1),b=a+columns,n=new THREE.Vector3().fromBufferAttribute(normals,a).add(new THREE.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);}
 return g;
}

export function createRunnerHair(THREE){
 const positions=[],uvs=[],indices=[],rows=24,columns=64;
 for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
  const angle=i/columns*Math.PI*2,front=Math.cos(angle),side=Math.sin(angle);
  // Short at the temples, longer at the nape, with a slightly swept fringe.
  const edge=.008+.070*Math.max(0,front)-.095*Math.max(0,-front)
   +.004*Math.sin(angle*13)+.003*Math.sin(angle*23)+.009*side*Math.max(0,front);
  const phi=j/rows*Math.acos((edge-.014)/.198),weight=Math.sin(phi);
  const ridge=(.0022*Math.cos(angle*17+phi*3)+.0011*Math.sin(angle*31-phi*2))*weight;
  const sweep=.008*Math.sin(phi*2)*Math.max(0,front);
  positions.push((.149+ridge)*weight*side+sweep,.014+.198*Math.cos(phi)+.003*Math.sin(angle*5)*weight,(.149+ridge)*weight*-front+.030);
  uvs.push(i/columns*2,1-j/rows);
  if(j<rows&&i<columns){const a=j*(columns+1)+i,b=a+columns+1;indices.push(a,a+1,b,b,a+1,b+1);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
 const normals=g.attributes.normal;
 for(let j=0;j<=rows;j++){const a=j*(columns+1),b=a+columns,n=new THREE.Vector3().fromBufferAttribute(normals,a).add(new THREE.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);}
 return g;
}
