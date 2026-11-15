import {createWasmRasterVisibility} from './raster-visibility-wasm.js';
export {prepareRasterVisibility} from './raster-visibility-wasm.js';
// Conservative sample coverage for static world-space triangles. No geometry
// simplification: surviving indices retain their original order and attributes.
// The margin covers float projection and subpixel rasterizer rounding. Near
// plane crossings and large projected coordinates deliberately fail open.
const MARGIN=.125;
export function triangleHasSamples(ax,ay,bx,by,cx,cy,side=0){
 const abx=bx-ax,aby=by-ay,acx=cx-ax,acy=cy-ay,area=abx*acy-aby*acx;
 const error=(Math.abs(abx)+Math.abs(aby)+Math.abs(acx)+Math.abs(acy))*MARGIN*2+MARGIN*MARGIN*8;
 if(side===0&&area< -error||side===1&&area>error)return false;
 const left=Math.ceil(Math.min(ax,bx,cx)-.5-MARGIN),right=Math.floor(Math.max(ax,bx,cx)-.5+MARGIN);
 const bottom=Math.ceil(Math.min(ay,by,cy)-.5-MARGIN),top=Math.floor(Math.max(ay,by,cy)-.5+MARGIN);
 if(left>right||bottom>top)return false;
 // A narrow triangle may straddle a pixel box without covering its centre.
 // Examine only tiny boxes; larger ones stay on the original GPU path.
 if((right-left+1)*(top-bottom+1)>4||Math.abs(area)<=error)return true;
 const sign=area>0?1:-1;
 const bcx=cx-bx,bcy=cy-by,cax=ax-cx,cay=ay-cy;
 const abError=-(Math.abs(abx)+Math.abs(aby))*MARGIN*2,bcError=-(Math.abs(bcx)+Math.abs(bcy))*MARGIN*2,caError=-(Math.abs(cax)+Math.abs(cay))*MARGIN*2;
 for(let x=left;x<=right;x++)for(let y=bottom;y<=top;y++){
  const px=x+.5,py=y+.5;
  if(sign*(abx*(py-ay)-aby*(px-ax))>=abError&&sign*(bcx*(py-by)-bcy*(px-bx))>=bcError&&sign*(cax*(py-cy)-cay*(px-cx))>=caError)return true;
 }
 return false;
}

export function createRasterVisibility(geometry,source=geometry.index.array.slice(),side=0,partCapacity=Math.ceil(source.length/3),accelerate=true){
 // Only static world-space positions, a fixed material side, a full viewport
 // and single-sample rendering are supported. Wind/skinning stay on the GPU.
 try{const accelerated=accelerate&&createWasmRasterVisibility(geometry,source,side,partCapacity);if(accelerated)return accelerated;}catch{/* Keep the reference path if module memory cannot be allocated. */}
 const positions=geometry.attributes.position.array,projected=new Float64Array(positions.length),stamps=new Uint32Array(positions.length/3);
 let stamp=0,kept=0,tested=0,transformed=0;
 function update(matrix,width,height,parts){
  const e=matrix.elements,index=geometry.index.array;let count=0,first=Infinity,last=0;stamp=(stamp+1)>>>0;if(!stamp){stamps.fill(0);stamp=1;}kept=tested=transformed=0;
  const project=id=>{
   if(stamps[id]===stamp)return;stamps[id]=stamp;transformed++;
   const k=id*3,x=positions[k],y=positions[k+1],z=positions[k+2],w=e[3]*x+e[7]*y+e[11]*z+e[15];
   projected[k]=(1+(e[0]*x+e[4]*y+e[8]*z+e[12])/w)*width*.5;
   projected[k+1]=(1+(e[1]*x+e[5]*y+e[9]*z+e[13])/w)*height*.5;projected[k+2]=w;
  };
  for(const p of parts){
   p.drawOffset=-1;if(!p.visible)continue;
   for(let i=p.offset;i<p.offset+p.count;i+=3){
    const a=source[i],b=source[i+1],c=source[i+2];project(a);project(b);project(c);tested++;
    const aa=a*3,bb=b*3,cc=c*3;
    const safe=projected[aa+2]>.5&&projected[bb+2]>.5&&projected[cc+2]>.5&&
     Math.max(Math.abs(projected[aa]),Math.abs(projected[bb]),Math.abs(projected[cc]))<width*8&&
     Math.max(Math.abs(projected[aa+1]),Math.abs(projected[bb+1]),Math.abs(projected[cc+1]))<height*8;
    if(safe&&!triangleHasSamples(projected[aa],projected[aa+1],projected[bb],projected[bb+1],projected[cc],projected[cc+1],side))continue;
    if(index[count]!==a||index[count+1]!==b||index[count+2]!==c){index[count]=a;index[count+1]=b;index[count+2]=c;first=Math.min(first,count);last=count+3;}
    count+=3;kept++;
   }
  }
  geometry.setDrawRange(0,count);
  if(last>first){geometry.index.addUpdateRange(first,last-first);geometry.index.needsUpdate=true;}
  return last>first?last-first:0;
 }
 return {update,stats:()=>({tested,kept,transformed})};
}
