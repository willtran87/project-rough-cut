// Clothing construction follows the existing articulated rigid parts. All
// pieces merge into their parent's material batch and share its animation.
export function createRunnerGarmentCraft(THREE){
 const owned=[];
 const shape=(type,g)=>{owned.push(g);return [type,g,0,0,0,1,1,1];};
 function seam(type,points,r=.0025){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return shape(type,new THREE.TubeGeometry(curve,Math.max(4,points.length*2),r,4,false));
 }
 function surface(profile,depth,x,y){
  let radius=profile[1][0];
  for(let i=1;i<profile.length;i++)if(y>=profile[i-1][1]&&y<=profile[i][1]){
   const a=profile[i-1],b=profile[i],t=(y-a[1])/Math.max(.0001,b[1]-a[1]);radius=a[0]+(b[0]-a[0])*t;break;
  }
  return depth*Math.sqrt(Math.max(.0001,radius*radius-x*x));
 }
 function panel(type,outline,zAt){
  const x=outline.reduce((v,p)=>v+p[0],0)/outline.length,y=outline.reduce((v,p)=>v+p[1],0)/outline.length;
  const p=[],uv=[],normals=[],steps=6;
  const vertex=([x,y])=>{
   p.push(x,y,zAt(x,y));uv.push(.5+x*2,.5+y*1.5);
   const e=.0002,nx=-(zAt(x+e,y)-zAt(x-e,y))/(2*e),ny=-(zAt(x,y+e)-zAt(x,y-e))/(2*e),length=Math.hypot(nx,ny,1);
   normals.push(nx/length,ny/length,1/length);
  };
  // Subdivide before projecting onto the curved garment. A single triangle
  // fan cuts through the shirt volume between its centre and shoulder edges.
  for(let edge=0;edge<outline.length;edge++){
   const a=outline[(edge+1)%outline.length],b=outline[edge];
   const at=(i,j)=>[x+(a[0]-x)*i/steps+(b[0]-x)*j/steps,y+(a[1]-y)*i/steps+(b[1]-y)*j/steps];
   for(let i=0;i<steps;i++)for(let j=0;j<steps-i;j++){
    vertex(at(i,j));vertex(at(i+1,j));vertex(at(i,j+1));
    if(i+j<steps-1){vertex(at(i+1,j));vertex(at(i+1,j+1));vertex(at(i,j+1));}
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));return shape(type,g);
 }
 return {
  torso(profile){
   const z=(x,y)=>surface(profile,.69,x,y)*1.05+.004,shapes=[];
   // Curved back yoke and the little centre box pleat are visible from the
   // normal chase camera, unlike details confined to the shirt front.
   const outline=[[-.155,.27],[.155,.27],[.174,.17],[.09,.145],[0,.13],[-.09,.145],[-.174,.17]];
   shapes.push(panel('cloth',outline,z));
   const lower=[[-.174,.17],[-.09,.145],[0,.13],[.09,.145],[.174,.17]];
   for(const offset of [0,.008])shapes.push(seam('cloth',lower.map(([x,y])=>[x,y+offset,z(x,y)+.002]),.002));
   for(const side of [-1,1]){
    shapes.push(seam('cloth',[[side*.013,.13],[side*.014,.04],[side*.010,-.07]].map(([x,y])=>[x,y,z(x,y)+.003]),.0035));
    shapes.push(seam('cloth',[[side*.14,.09],[side*.145,-.03],[side*.135,-.14]].map(([x,y])=>[x,y,z(x,y)]),.002));
   }
   shapes.push(seam('cloth',[[-.085,.32,.055],[-.045,.35,.077],[0,.355,.082],[.045,.35,.077],[.085,.32,.055]],.008));
   return shapes;
  },
  cuff(){
   const shapes=[];
   for(const y of [-.221,-.25]){
    const points=Array.from({length:13},(_,i)=>{const a=i/12*Math.PI*2;return [Math.sin(a)*.064,y,Math.cos(a)*.066];});
    shapes.push(seam('cloth',points,.0025));
   }
   return shapes;
  },
  trousers(){
   const profile=[[.108,.025],[.1,-.13],[.086,-.3],[.077,-.415]].reverse(),z=(x,y)=>surface(profile,1.1,x,y)+.004;
   const outline=[[-.052,-.065],[.052,-.065],[.052,-.16],[0,-.188],[-.052,-.16]];
   return [panel('trousers',outline,z),seam('trousers',[...outline,outline[0]].map(([x,y])=>[x,y,z(x,y)+.002]),.0025),seam('trousers',[[-.045,-.075],[0,-.075],[.045,-.075]].map(([x,y])=>[x,y,z(x,y)+.003]),.002)];
  },
  dispose(){for(const g of owned)g.dispose();}
 };
}
