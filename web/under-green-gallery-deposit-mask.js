const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const cluster=(x,y)=>{const n=Math.sin(Math.floor(x*9)*127.1+Math.floor(y*9)*311.7+41.3)*43758.5453;return n-Math.floor(n);};

// Shape the existing mud coverage, not pigment or relief. Thick clay buries
// paving; its thin rim breaks into small connected deposits instead of an
// evenly transparent brown wash. Bake once into the existing world mask:
// there are no extra shader samples, decals or moving noise fields.
export function finishGalleryDepositMask(data,size,domain){
 const width=domain.maxX-domain.minX,height=domain.maxY-domain.minY;
 const x0=Math.max(0,Math.floor((-5.1-domain.minX)/width*size)),x1=Math.min(size,Math.ceil((5.1-domain.minX)/width*size));
 const y0=Math.max(0,Math.floor((domain.maxY-28)/height*size)),y1=Math.min(size,Math.ceil((domain.maxY-4.64)/height*size));
 let changedTexels=0,buriedTexels=0,thinnedTexels=0;
 for(let row=y0;row<y1;row++)for(let col=x0;col<x1;col++){
  const x=domain.minX+(col+.5)*width/size,y=domain.maxY-(row+.5)*height/size;
  const influence=(1-smooth(4.8,5.1,Math.abs(x)))*smooth(4.64,5.5,y)*(1-smooth(27,28,y));
  const i=(row*size+col)*4,before=data[i],coverage=before/255;
  if(influence===0||before===0||before===255)continue;
  const noise=cluster(x,y),shaped=smooth(.16+noise*.16,.65+noise*.12,coverage);
  const after=Math.round(before+(shaped*255-before)*influence);
  if(after===before)continue;
  data[i]=after;changedTexels++;
  if(after>before)buriedTexels++;else thinnedTexels++;
 }
 return {changedTexels,buriedTexels,thinnedTexels,clusterMetres:1/9,domain:[-5.1,5.1,4.64,28],wetnessUnchanged:true,geometryAdded:0};
}
