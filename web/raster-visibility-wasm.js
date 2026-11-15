// Optional acceleration of the identical JavaScript coverage algorithm.
// Failure to fetch/compile keeps the reference implementation available.
let compiled=null,pending=null;
export function prepareRasterVisibility(bytes=null){
 if(!pending)pending=(async()=>{
  if(bytes){try{compiled=await WebAssembly.compile(bytes);return true;}catch{return false;}}
  // SIMD retains the exact double-precision coverage test. Older engines or
  // incomplete deployments keep the scalar module, then the JS reference.
  for(const name of ['./raster-visibility-simd.wasm','./raster-visibility.wasm']){
   try{const response=await fetch(new URL(name,import.meta.url));if(!response.ok)continue;compiled=await WebAssembly.compile(await response.arrayBuffer());return true;}catch{}
  }
  return false;
 })();return pending;
}
export function createWasmRasterVisibility(geometry,source,side,partCapacity){
 if(!compiled)return null;
 const instance=new WebAssembly.Instance(compiled),{memory,update}=instance.exports;
 let offset=Number(instance.exports.__heap_base.value);
 const reserve=(count,size)=>{offset=Math.ceil(offset/size)*size;const start=offset;offset+=count*size;return start;};
 const positions=geometry.attributes.position.array,vertexCount=positions.length/3;
 const posAt=reserve(positions.length,4),sourceAt=reserve(source.length,4),indexAt=reserve(source.length,4),projectedAt=reserve(positions.length,8),stampsAt=reserve(vertexCount,4),matrixAt=reserve(16,8),partsAt=reserve(partCapacity*2,4),resultAt=reserve(5,4);
 if(offset>memory.buffer.byteLength)memory.grow(Math.ceil((offset-memory.buffer.byteLength)/65536));
 const index=new Uint32Array(memory.buffer,indexAt,source.length),stamps=new Uint32Array(memory.buffer,stampsAt,vertexCount),matrix=new Float64Array(memory.buffer,matrixAt,16),ranges=new Uint32Array(memory.buffer,partsAt,partCapacity*2),result=new Uint32Array(memory.buffer,resultAt,5);
 new Float32Array(memory.buffer,posAt,positions.length).set(positions);new Uint32Array(memory.buffer,sourceAt,source.length).set(source);index.set(geometry.index.array);
 let stamp=0,version=geometry.index.version;
 return {update(projection,width,height,parts){
  // Full-geometry QA/restoration may have replaced the current index prefix.
  if(version!==geometry.index.version)index.set(geometry.index.array);
  matrix.set(projection.elements);let count=0;
  for(const p of parts){p.drawOffset=-1;if(p.visible){ranges[count*2]=p.offset;ranges[count*2+1]=p.count;count++;}}
  stamp=(stamp+1)>>>0;if(!stamp){stamps.fill(0);stamp=1;}
  const kept=update(posAt,sourceAt,indexAt,projectedAt,stampsAt,matrixAt,partsAt,count,width,height,side,stamp,resultAt),first=result[0],last=result[1];
  geometry.setDrawRange(0,kept);
  if(last>first){geometry.index.array.set(index.subarray(first,last),first);geometry.index.addUpdateRange(first,last-first);geometry.index.needsUpdate=true;}
  version=geometry.index.version;return last>first?last-first:0;
 },stats:()=>({tested:result[2],kept:result[3],transformed:result[4],backend:'wasm',bytes:memory.buffer.byteLength})};
}
