// Exact contourGround output for the authored Back Nine layout, made by
// tools/bake-course-contours.cjs. Inputs it does not hold (an edited layout,
// a changed caller) and a stale or missing bake keep the live tessellator.
import {installContourBake,contourFingerprint,CONTOUR_BAKE_VERSION} from './course-terrain.js';
const stats={entries:0,hits:0,misses:0};
export const contourBakeStats=()=>({...stats});
// Sections hold positions, uvs, colours and indices for every entry in order,
// as 32-bit words split into four byte planes. Each component of an entry is a
// run of zigzag differences from the previous value of that component.
function stream(section,start,count,target,width,component){
 const {bytes,words}=section,b1=words,b2=words*2,b3=words*3;
 for(let i=0,j=start,value=0;i<count;i++,j++){const z=(bytes[j]|bytes[b1+j]<<8|bytes[b2+j]<<16|bytes[b3+j]<<24)>>>0;value=value+((z>>>1)^-(z&1))|0;target[i*width+component]=value;}
}
export async function loadBakedContours(){
 try{
  const response=await fetch(new URL('./assets/baked/course-contours.bin.gz',import.meta.url));
  if(!response.ok||!response.body)return false;
  const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const headerBytes=new DataView(buffer).getUint32(0,true),header=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,headerBytes)));
  if(header.version!==CONTOUR_BAKE_VERSION||header.fingerprint!==contourFingerprint())return false;
  let offset=(4+headerBytes+3)&~3;
  const table=new Uint32Array(buffer,offset,header.entries*5),entries=new Map(),sections=[];offset+=table.byteLength;
  for(const words of header.words){sections.push({bytes:new Uint8Array(buffer,offset,words*4),words});offset+=words*4;}
  if(offset!==buffer.byteLength)return false;
  const start=[0,0,0,0];
  for(let i=0;i<header.entries;i++){
   const t=i*5,vertices=table[t+2],indices=table[t+3],colors=table[t+4]&255;
   entries.set(table[t]+':'+table[t+1],{start:[...start],vertices,indices,colors,wide:(table[t+4]>>8&1)===1});
   start[0]+=vertices*3;start[1]+=vertices*2;start[2]+=vertices*colors;start[3]+=indices;
  }
  if(start.some((words,i)=>words!==header.words[i]))return false;
  installContourBake((THREE,key)=>{
   const e=entries.get(key);if(!e){stats.misses++;return null;}stats.hits++;
   const n=e.vertices,position=new Float32Array(n*3),uv=new Float32Array(n*2),color=e.colors?new Float32Array(n*e.colors):null,index=new Uint32Array(e.indices);
   const p=new Uint32Array(position.buffer),u=new Uint32Array(uv.buffer),c=color&&new Uint32Array(color.buffer);
   for(let k=0;k<3;k++)stream(sections[0],e.start[0]+k*n,n,p,3,k);
   for(let k=0;k<2;k++)stream(sections[1],e.start[1]+k*n,n,u,2,k);
   for(let k=0;k<e.colors;k++)stream(sections[2],e.start[2]+k*n,n,c,e.colors,k);
   stream(sections[3],e.start[3],e.indices,index,1,0);
   // Same attribute classes, index width and normals as the tessellator's output.
   const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(position,3));out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
   if(color)out.setAttribute('color',new THREE.Float32BufferAttribute(color,e.colors));
   out.setIndex(new (e.wide?THREE.Uint32BufferAttribute:THREE.Uint16BufferAttribute)(index,1));out.computeVertexNormals();return out;
  });
  stats.entries=entries.size;return true;
 }catch{return false;}
}
// Construction is over: later geometry is computed and the bake can be freed.
export function releaseBakedContours(){installContourBake(null);}
