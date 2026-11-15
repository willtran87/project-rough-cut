// Wear follows the service courts, drains and parked equipment. All geometry
// joins existing terrain batches; there are no new collisions or update work.
export function buildCourtWear({THREE,put,court:c}){
 const p=[],uv=[],color=[],indices=[],n=64,w=c.w*.5+1,d=c.d*.5+1;
 // A rounded rectangular gravel shoulder, matching the court's actual outline.
 for(const [offset,alpha]of [[-.08,1],[.12,.72],[.8,0]])for(let i=0;i<=n;i++){
  const a=i/n*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),r=1.5+offset;
  const x=c.x+Math.sign(ca)*(w-1.5)+ca*r,z=-c.y+Math.sign(sa)*(d-1.5)+sa*r;
  p.push(x,.016,z);uv.push(x/.7,z/.7);color.push(1,1,1,alpha);
 }
 for(let row=0;row<2;row++)for(let i=0;i<n;i++){const a=row*(n+1)+i,b=a+n+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(color,4));g.setIndex(indices);g.computeVertexNormals();put(g,'trackMargin',0,0,0);g.dispose();
 let marks=0;
 function mark(x,z,rx,rz,shade,strength){
  const p=[],uv=[],colors=[],indices=[],steps=24;
  for(const [r,alpha]of [[0,strength],[.72,strength*.75],[1,0]])for(let i=0;i<=steps;i++){
   const a=i/steps*Math.PI*2,q=r*(1+.07*Math.sin(a*5+c.y));
   p.push(x+Math.cos(a)*rx*q,.018,z-Math.sin(a)*rz*q);uv.push(i/steps,r);colors.push(...shade,alpha);
  }
  for(let row=0;row<2;row++)for(let i=0;i<steps;i++){const a=row*(steps+1)+i,b=a+steps+1;if(!row)indices.push(a,b,b+1);else indices.push(a,b,a+1,a+1,b,b+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();put(g,'soilMargin',0,0,0);g.dispose();marks++;
 }
 // Two discontinuous tire paths through the working bay; no fake puddles on
 // the intermittent sprinkler turf. Dark grease stays beneath repair bays.
 for(const side of [-1,1])for(let i=0;i<6;i++){
  const z=-c.y-d*.7+i*d*.26,x=c.x+side*.79+.28*Math.sin(i*.43+c.y);
  mark(x,z,.13,1.5,[.35,.32,.26],.38);
 }
 for(const side of [-1,1])mark(c.x+side*(c.w*.5-1),-c.y,.65,2.15,[.33,.31,.23],.25);
 mark(c.x-2.4,-c.y+3.6,1.2,.64,[.12,.14,.12],.30);
 return {marks,feathered:true};
}
