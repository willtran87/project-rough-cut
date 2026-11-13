import fs from 'node:fs';import {gzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
import * as T from '../web/vendor/three/three.module.js';import {mergeGeometries} from '../web/vendor/three/addons/utils/BufferGeometryUtils.js';import {createTrees} from '../web/pixel-trees.js';
let root;const wood=new T.MeshBasicMaterial(),builder=createTrees({geometryOnly:true,root:()=>root=new T.Group(),mesh:(parent,g)=>{const m=new T.Mesh(g,wood);parent.add(m);return m;}}),templates=[],chunks=[];let offset=0;
function pack(a){const data=Buffer.from(a.buffer,a.byteOffset,a.byteLength),out={offset,length:a.length};chunks.push(data);offset+=data.length;return out;}
// Offline exact-bit deduplication. Verify every expanded attribute against the
// authored stream before packing; normals/UV seams and triangle order survive.
function indexExact(g){const attributes=Object.entries(g.attributes),bits=attributes.map(([,a])=>new Uint32Array(a.array.buffer,a.array.byteOffset,a.array.length)),seen=new Map(),unique=[],indices=[];
 for(let v=0;v<g.attributes.position.count;v++){const key=attributes.map(([,a],j)=>Array.from(bits[j].subarray(v*a.itemSize,(v+1)*a.itemSize)).join(',')).join('/');let id=seen.get(key);if(id===undefined){id=unique.length;seen.set(key,id);unique.push(v);}indices.push(id);}
 for(const [j,[name,a]]of attributes.entries()){const compact=new Uint32Array(unique.length*a.itemSize);unique.forEach((v,i)=>compact.set(bits[j].subarray(v*a.itemSize,(v+1)*a.itemSize),i*a.itemSize));for(let v=0;v<indices.length;v++)for(let k=0;k<a.itemSize;k++)if(compact[indices[v]*a.itemSize+k]!==bits[j][v*a.itemSize+k])throw Error('Pine attribute changed');g.setAttribute(name,new T.BufferAttribute(new Float32Array(compact.buffer),a.itemSize));}
 g.setIndex(indices);
}
for(const x of [1,4,9,11]){builder.tree(x,0,8,2.8);await builder.prepareTrees();root.updateMatrixWorld(true);const groups=new Map();let spray=0;
 root.traverse(o=>{if(!o.isMesh)return;const index=o.material.userData.needleIndex,key=index===undefined?'wood':'needles';
 // Keep every authored limb. One of each branch's three sprays provides a
 // bounded distant-course crown; its shape and atlas UVs remain original.
 if(index!==undefined&&spray++%3!==0)return;
 const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);g.applyMatrix4(o.matrixWorld);
 if(index!==undefined){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(4+uv.getX(i)*600+(index%2)*608)/1216,(4+uv.getY(i)*390+(1-Math.floor(index/2))*398)/796);}
 if(!groups.has(key))groups.set(key,[]);groups.get(key).push(g);});
 const parts=[];for(const[key,geos]of groups){const g=mergeGeometries(geos,false);indexExact(g);parts.push({kind:key,attributes:Object.fromEntries(Object.entries(g.attributes).map(([name,a])=>[name,{...pack(a.array),itemSize:a.itemSize}])),index:{...pack(g.index.array),type:g.index.array instanceof Uint16Array?'uint16':'uint32'}});geos.forEach(g=>g.dispose());g.dispose();}templates.push({form:root.userData.treeForm,parts});root.traverse(o=>o.geometry?.dispose());}
fs.writeFileSync('web/assets/baked/course-pines.bin.gz',gzipSync(Buffer.concat(chunks),{level:9}));fs.writeFileSync('web/assets/baked/course-pines.json',JSON.stringify({sourceHash:createHash('sha256').update(fs.readFileSync('web/pixel-trees.js')).digest('hex'),bytes:offset,templates}));console.log({forms:templates.map(t=>t.form),rawBytes:offset,compressed:fs.statSync('web/assets/baked/course-pines.bin.gz').size});
