const fs=require('node:fs'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
function inspect(file){
 const b=fs.readFileSync(file);assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(16),0x4e4f534a);
 const len=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+len).toString()),base=20+len+8;
 const materials=g.materials.slice(0,9).map(m=>{
  const t=g.textures[m.pbrMetallicRoughness?.baseColorTexture?.index],im=t&&g.images[t.extensions?.EXT_texture_webp?.source??t.source],v=im&&g.bufferViews[im.bufferView];
  return {name:m.name,sha256:v?createHash('sha256').update(b.subarray(base+(v.byteOffset||0),base+(v.byteOffset||0)+v.byteLength)).digest('hex'):null,color:m.pbrMetallicRoughness?.baseColorFactor||null};
 });
 const primitive=g.meshes.flatMap(m=>m.primitives).find(p=>g.materials[p.material].name==='Face'),a=g.accessors[primitive.attributes.COLOR_0],v=g.bufferViews[a.bufferView],off=base+(v.byteOffset||0)+(a.byteOffset||0),bytes={5121:1,5123:2,5126:4}[a.componentType],stride=v.byteStride||bytes*(a.type==='VEC4'?4:3),values=[];
 for(let i=0;i<a.count;i++){let n=bytes===1?b.readUInt8(off+i*stride):bytes===2?b.readUInt16LE(off+i*stride):b.readFloatLE(off+i*stride);if(a.normalized)n/=bytes===1?255:65535;values.push(n);}
 assert(values.every(n=>Number.isFinite(n)&&n>=0&&n<=1));assert(values.some(n=>n>0&&n<1));assert.equal(Math.min(...values),0);assert.equal(Math.max(...values),1);
 const p=g.accessors[primitive.attributes.POSITION];return {file,materials,face:{vertices:a.count,min:p.min,max:p.max,blendVertices:values.filter(n=>n>0&&n<1).length}};
}
const current=inspect('web/assets/models/joe-riding-pixel.glb'),reference=inspect('web/assets/models/joe-pixel-rig.glb');assert.deepEqual(current.materials,reference.materials,'Body map bytes and source color identity must match Level 1');
for(const key of ['min','max'])for(let i=0;i<3;i++)assert(Math.abs(current.face[key][i]-reference.face[key][i])<.001,'Face blend projection requires the same local coordinate basis');
fs.mkdirSync('output/final-cut/joe-finish',{recursive:true});fs.writeFileSync('output/final-cut/joe-finish/reference.json',JSON.stringify({passed:true,current,reference,scope:'Embedded map/color identity and compatible face-mask/local-position basis, not facial geometry or whole-level art acceptance.'},null,2));console.log(JSON.stringify({passed:true,materials:current.materials.length,mapped:current.materials.filter(m=>m.sha256).length,face:current.face}));
