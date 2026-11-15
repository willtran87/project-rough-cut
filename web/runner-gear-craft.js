// The atlas contains leather / suede above rubber / canvas. UVs stay inside
// padded quadrants, including the icosahedron's wrapped seam coordinates.
export function createRunnerGearCraft(T){
 const owned=[],cache=new Map(),clamp=x=>Math.max(0,Math.min(1,x));
 function mapped(g,slot){
  const key=g.uuid+':'+slot;if(cache.has(key))return cache.get(key);
  const copy=g.clone(),uv=copy.attributes.uv,col=slot%2,row=slot<2?1:0;
  for(let i=0;i<uv.count;i++)uv.setXY(i,col*.5+.015+clamp(uv.getX(i))*.47,row*.5+.015+clamp(uv.getY(i))*.47);
  copy.userData={...g.userData,gearSlot:slot};owned.push(copy);cache.set(key,copy);return copy;
 }
 function shape(g,slot,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){return ['gear',mapped(g,slot),x,y,z,sx,sy,sz,rx,ry,rz];}
 function line(points,slot=3,r=.0016){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),g=new T.TubeGeometry(curve,Math.max(4,points.length*2),r,4,false),result=shape(g,slot);g.dispose();return result;
 }
 const eye=new T.TorusGeometry(.004,.0012,4,8);owned.push(eye);
 // Continuous last: a low rounded toe flows into the instep and ankle shaft.
 // Each ring is [height above ankle, half width, half length, centre Z].
 const rings=[[-.039,.079,.148,-.055],[-.020,.080,.149,-.055],[.010,.078,.139,-.052],[.040,.074,.113,-.035],[.073,.069,.082,-.012],[.105,.068,.067,0],[.135,.071,.069,0],[.145,.070,.068,0]];
 function loft(profile,notches=false){
  const p=[],uv=[],index=[],n=32;
  for(let j=0;j<profile.length;j++)for(let i=0;i<=n;i++){
   const [y,rx,rz,z]=profile[j],angle=i/n*Math.PI*2,inset=notches&&j>0&&j<profile.length-1&&i%2?.96:1;
   p.push(Math.sin(angle)*rx*inset,y-.37,z+Math.cos(angle)*rz*inset);uv.push(i/n,j/(profile.length-1));
  }
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;index.push(a,b,c,b,d,c);}
  // Close the sole and collar inside their adjoining geometry.
  for(const [j,flip]of [[0,true],[profile.length-1,false]]){
   const start=p.length/3,[y,,,z]=profile[j];p.push(0,y-.37,z);uv.push(.5,.5);
   for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1;index.push(...(flip?[start,b,a]:[start,a,b]));}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();owned.push(g);return g;
 }
 const upper=loft(rings),sole=loft([[-.075,.080,.150,-.055],[-.069,.083,.155,-.055],[-.048,.083,.155,-.055],[-.039,.081,.153,-.055]],true);
 upper.name='BootUpper';sole.name='BootSole';
 const bootTop=(x,z)=>{
  const q=r=> (x/r[1])**2+((z-r[3])/r[2])**2;
  for(let i=1;i<rings.length;i++)if(q(rings[i])>=1){
   const a=rings[i-1],b=rings[i];let low=0,high=1;
   for(let n=0;n<12;n++){const t=(low+high)/2,r=a.map((v,k)=>v+(b[k]-v)*t);if(q(r)>1)high=t;else low=t;}
   return -.37+a[0]+(b[0]-a[0])*(low+high)/2;
  }
  return -.37+rings.at(-1)[0];
 };
 const gloveBack=(x,y)=>-.008+.043*Math.sqrt(Math.max(.01,1-(x/.045)**2-((y+.295)/.064)**2));
 function glovePanel(){
  const p=[],uv=[],normals=[],indices=[],rows=8,cols=8;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
   const y=-.32+j/rows*.056,x=(i/cols-.5)*.053*(.82+.18*Math.sin(j/rows*Math.PI)),z=gloveBack(x,y)+.0014;
   p.push(x,y,z);uv.push(i/cols,j/rows);const e=.0001,n=new T.Vector3(-(gloveBack(x+e,y)-gloveBack(x-e,y))/(2*e),-(gloveBack(x,y+e)-gloveBack(x,y-e))/(2*e),1).normalize();normals.push(n.x,n.y,n.z);
  }
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;indices.push(a,b,d,a,d,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);const result=shape(g,3);g.dispose();return result;
 }
 function finger(x,index){
  const shorter=index===0?.006:index===3?.003:0,radius=index===0?.0085:.0098;
  const curve=new T.CatmullRomCurve3([[x,-.303,-.041],[x,-.320,-.050],[x,-.343+shorter,-.043],[x,-.346+shorter,-.030],[x,-.333+shorter,-.018]].map(p=>new T.Vector3(...p)));
  const segments=12,sides=8,g=new T.TubeGeometry(curve,segments,1,sides,false),p=g.attributes.position,v=new T.Vector3();
  for(let j=0;j<=segments;j++){
   const t=j/segments,c=curve.getPointAt(t),r=radius*(1-.25*Math.max(0,(t-.65)/.35));
   for(let k=0;k<=sides;k++){const i=j*(sides+1)+k;v.fromBufferAttribute(p,i).sub(c).multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z);}
  }
  g.computeVertexNormals();const result=shape(g,1);g.dispose();return result;
 }
 return {
  boot(round,box){
   const result=[shape(upper,0),shape(sole,2)];
   // Curved toe-cap stitches sit on the upper leather, not buried inside it.
   for(const z of [-.14,-.145])result.push(line(Array.from({length:13},(_,i)=>{const x=-.057+i/12*.114;return [x,bootTop(x,z)+.0015,z];}),3,.0012));
   // Welt follows the upper edge; tread stays inside the shared support envelope.
   result.push(line(Array.from({length:33},(_,i)=>{const a=i/32*Math.PI*2;return[Math.sin(a)*.080,-.407,-.055+Math.cos(a)*.150];}),0,.0015));
   for(let n=0;n<4;n++){
    const z=-.062-n*.019;
    for(const sign of [-1,1]){
     result.push(['iron',eye,sign*.031,bootTop(sign*.031,z)+.003,z,1,1,1,Math.PI/2,0,0]);
     result.push(line([[sign*.03,bootTop(sign*.03,z)+.004,z],[0,bootTop(0,z-.008)+.004,z-.008],[-sign*.03,bootTop(-sign*.03,z-.015)+.004,z-.015]],3,.0022));
    }
   }
   // Rear pull tab is visible from the chase camera above the heel counter.
   result.push(shape(box,3,0,-.235,.067,.024,.045,.009),line([[-.045,-.29,.049],[0,-.26,.068],[.045,-.29,.049]],0,.0018));
   for(const x of [-.006,.006])result.push(line(rings.map(([y,rx,rz,z])=>[x,y-.37,z+rz*Math.sqrt(1-(x/rx)**2)+.001]),3,.0009));
   return result;
  },
  glove(round,fine,box,side){
   const result=[shape(round,1,0,-.295,-.008,.045,.064,.043),shape(round,1,-side*.043,-.285,-.025,.022,.039,.025,0,0,-side*.3),glovePanel()];
   for(let f=0;f<4;f++){
    const x=-.028+f*.018;result.push(finger(x,side<0?f:3-f));
    result.push(line([[x-.005,-.321,-.0585],[x,-.322,-.0595],[x+.005,-.321,-.0585]],3,.0007));
   }
   for(const side of [-1,1])result.push(line([-.317,-.295,-.267].map(y=>{const x=side*.025;return[x,y,gloveBack(x,y)+.002];}),1,.001));
   result.push(shape(round,3,0,-.259,.012,.047,.013,.031),shape(box,2,0,-.258,.043,.012,.009,.003));
   return result;
  },
  dispose(){for(const g of owned)g.dispose();}
 };
}
