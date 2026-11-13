const clamp=v=>Math.max(0,Math.min(1,v));

// Prepare once with the model. Damage changes reuse these coefficients and
// packed arrays instead of rebuilding temporary vectors or scanning bounds
// repeatedly during an impact frame. Float64 retains the original arithmetic.
export function prepareDamageGeometry(g){
 const base=g.attributes.position.array.slice(),normals=g.attributes.normal.array.slice(),weights=new Float64Array(base.length/3*8);
 for(let i=0,j=0;i<base.length;i+=3,j+=8){const x=base[i],y=base[i+1],z=base[i+2],upper=clamp((y-1.4)/1.05),front=clamp((-z-.55)/.95),rear=clamp((z-.45)/.95),side=clamp((x+.2)/1.1),low=clamp((1.1-y)/.7);
  weights[j]=(.13+.12*rear)*side*low+.08*upper;weights[j+1]=upper*(.035+.30*side)+front*low*.18+rear*side*low*.2;
  weights[j+2]=front*low*(.12+.12*side);weights[j+3]=upper*Math.max(0,1-Math.abs(z-.1)*1.5)*side;
  weights[j+4]=rear;weights[j+5]=low;weights[j+6]=front;weights[j+7]=side;
 }
 // A fresh, undamaged cart may never deform. Empty placeholder bounds would
 // make Three cull its body until the first hit; compute the initial bounds
 // once here, then keep reusing them during deformation.
 if(!g.boundingBox)g.computeBoundingBox();
 if(!g.boundingSphere)g.computeBoundingSphere();
 return {g,base,normals,weights};
}
export function deformDamageGeometry({g,base,normals,weights:w},d,dent,buckle,crush){
 const p=g.attributes.position.array,n=g.attributes.normal.array,index=g.index.array,b=g.boundingBox;
 b.makeEmpty();const min=b.min,max=b.max;
 for(let i=0,j=0;i<p.length;i+=3,j+=8){
  p[i]=base[i]-d*w[j];p[i+1]=base[i+1]-d*w[j+1]-buckle*w[j+3]*.18-crush*w[j+4]*w[j+5]*.08;p[i+2]=base[i+2]+d*w[j+2]+dent*w[j+6]*w[j+7]*.045;
  const x=p[i],y=p[i+1],z=p[i+2];min.x=Math.min(min.x,x);min.y=Math.min(min.y,y);min.z=Math.min(min.z,z);max.x=Math.max(max.x,x);max.y=Math.max(max.y,y);max.z=Math.max(max.z,z);
 }
 if(!d)n.set(normals);
 else{
  n.fill(0);
  for(let i=0;i<index.length;i+=3){const a=index[i]*3,b=index[i+1]*3,c=index[i+2]*3;
   const cx=p[c]-p[b],cy=p[c+1]-p[b+1],cz=p[c+2]-p[b+2],ax=p[a]-p[b],ay=p[a+1]-p[b+1],az=p[a+2]-p[b+2];
   const x=cy*az-cz*ay,y=cz*ax-cx*az,z=cx*ay-cy*ax;
   // Read all three sums before writing, matching Three even for degenerate
   // triangles that repeat a vertex index.
   const a0=n[a]+x,a1=n[a+1]+y,a2=n[a+2]+z,b0=n[b]+x,b1=n[b+1]+y,b2=n[b+2]+z,c0=n[c]+x,c1=n[c+1]+y,c2=n[c+2]+z;
   n[a]=a0;n[a+1]=a1;n[a+2]=a2;n[b]=b0;n[b+1]=b1;n[b+2]=b2;n[c]=c0;n[c+1]=c1;n[c+2]=c2;
  }
 }
 const center=g.boundingSphere.center;b.getCenter(center);let radius2=0;
 for(let i=0;i<p.length;i+=3){
  if(d){const x=n[i],y=n[i+1],z=n[i+2],inv=1/(Math.sqrt(x*x+y*y+z*z)||1);n[i]=x*inv;n[i+1]=y*inv;n[i+2]=z*inv;}
  const dx=center.x-p[i],dy=center.y-p[i+1],dz=center.z-p[i+2];radius2=Math.max(radius2,dx*dx+dy*dy+dz*dz);
 }
 g.boundingSphere.radius=Math.sqrt(radius2);g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;
}
