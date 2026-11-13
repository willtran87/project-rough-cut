// Offline-only build dependency: npm install --prefix output/back-nine-experience/geometry-tooling --ignore-scripts meshoptimizer@1.3.0
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MeshoptEncoder,MeshoptSimplifier} from '../output/back-nine-experience/geometry-tooling/node_modules/meshoptimizer/index.js';
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const path='web/assets/models/joe-riding-pixel.glb',bytes=fs.readFileSync(path),jsonSize=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonSize).toString()),offset=20+jsonSize+8,bin=bytes.subarray(offset),view=new DataView(bin.buffer,bin.byteOffset,bin.byteLength);
const types={5121:['getUint8',1,255],5123:['getUint16',2,65535],5125:['getUint32',4,4294967295],5126:['getFloat32',4,1]},widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function accessor(id){const a=gltf.accessors[id],b=gltf.bufferViews[a.bufferView],[get,size,max]=types[a.componentType],width=widths[a.type],start=(b.byteOffset||0)+(a.byteOffset||0),stride=b.byteStride||width*size,data=new Float32Array(a.count*width);for(let i=0;i<a.count;i++)for(let k=0;k<width;k++)data[i*width+k]=view[get](start+i*stride+k*size,true)/(a.normalized?max:1);return {data,count:a.count,width};}
function reorder(source){const indices=new Uint32Array(source),[remap]=MeshoptEncoder.reorderMesh(indices,true,false),inverse=new Uint32Array(remap.length);for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff)inverse[remap[i]]=i;return Uint16Array.from(indices,i=>inverse[i]);}
const cacheBytes=Buffer.from(bytes);
const error=Number(process.argv.find(v=>v.startsWith('--error='))?.split('=')[1]||.0015),parts=[],chunks=[];let length=0;
function pack(data){const result={offset:length,count:data.length};const b=Buffer.from(data.buffer,data.byteOffset,data.byteLength);chunks.push(b);length+=b.length;return result;}
for(const p of gltf.meshes[0].primitives){
 const name=gltf.materials[p.material].name,attrs=Object.fromEntries(Object.entries(p.attributes).map(([k,id])=>[k,accessor(id)])),original=new Uint32Array(accessor(p.indices).data),position=attrs.POSITION.data,bones=gltf.skins[0].joints.length;
 const layout=['NORMAL','TEXCOORD_0','COLOR_0'].filter(k=>attrs[k]),stride=layout.reduce((n,k)=>n+attrs[k].width,0)+bones,attributes=new Float32Array(attrs.POSITION.count*stride),weights=[];
 for(const key of layout)for(let c=0;c<attrs[key].width;c++)weights.push(key==='TEXCOORD_0'?2:1);for(let c=0;c<bones;c++)weights.push(4);
 for(let i=0;i<attrs.POSITION.count;i++){let at=i*stride;for(const key of layout)for(let c=0;c<attrs[key].width;c++)attributes[at++]=attrs[key].data[i*attrs[key].width+c];for(let c=0;c<4;c++)attributes[at+attrs.JOINTS_0.data[i*4+c]]+=attrs.WEIGHTS_0.data[i*4+c];}
 // Face/hair/skin remain authored at every distance. Do not prune components,
 // cross texture seams, move vertices, or discard skin/normal/color attributes.
 const simplify=['Sweater','Trousers','Collar','Leather','Rubber'].includes(name);
 const [reduced,appearanceError]=simplify?MeshoptSimplifier.simplifyWithAttributes(original,position,3,attributes,stride,weights,null,Math.floor(original.length*.4/3)*3,error,['LockBorder','RegularizeLight']):[original,0];
 const reordered=simplify?reorder(original):Uint16Array.from(original),indexAccessor=gltf.accessors[p.indices],indexView=gltf.bufferViews[indexAccessor.bufferView];if(indexAccessor.componentType!==5123||indexView.byteStride)throw Error('Unexpected index layout');for(let k=0;k<reordered.length;k++)cacheBytes.writeUInt16LE(reordered[k],offset+(indexView.byteOffset||0)+(indexAccessor.byteOffset||0)+k*2);
 parts.push({name,vertices:attrs.POSITION.count,triangles:original.length/3,reducedTriangles:reduced.length/3,appearanceError,scale:MeshoptSimplifier.getScale(position,3),full:pack(reordered),distant:pack(simplify?reorder(reduced):Uint16Array.from(original))});
}
const out='output/back-nine-experience/actor-geometry';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/joe-riding-pixel-cache.glb',cacheBytes);fs.writeFileSync(out+'/indices.bin',Buffer.concat(chunks));const report={sourceHash:createHash('sha256').update(bytes).digest('hex'),source:path,dependency:'meshoptimizer@1.3.0',error,bytes:length,parts};fs.writeFileSync(out+'/indices.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
