// Lossless image repack only: vertex, skin, animation and morph buffer views
// remain byte-for-byte identical, and decoded RGBA is checked for every image.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules')]}));
(async()=>{
 const file='web/assets/models/joe-pixel-rig.glb',source=fs.readFileSync(file),jsonLength=source.readUInt32LE(12),gltf=JSON.parse(source.toString('utf8',20,20+jsonLength)),bin=source.subarray(28+jsonLength),replacements=new Map();
 if(gltf.images.every(i=>i.mimeType==='image/webp')){console.log('Joe already losslessly packed');return;}
 const report=[];
 for(const image of gltf.images){const view=gltf.bufferViews[image.bufferView],old=bin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength),encoded=await sharp(old).webp({lossless:true,effort:6}).toBuffer();assert((await sharp(old).ensureAlpha().raw().toBuffer()).equals(await sharp(encoded).ensureAlpha().raw().toBuffer()),image.name+' changed decoded pixels');replacements.set(image.bufferView,encoded);image.mimeType='image/webp';report.push({name:image.name,before:old.length,after:encoded.length});}
 const chunks=[];let offset=0;
 for(let i=0;i<gltf.bufferViews.length;i++){const v=gltf.bufferViews[i],data=replacements.get(i)||bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);chunks.push(data);v.byteOffset=offset;v.byteLength=data.length;offset+=data.length;const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}}
 gltf.buffers[0].byteLength=offset;
 for(const texture of gltf.textures){texture.extensions={...texture.extensions,EXT_texture_webp:{source:texture.source}};delete texture.source;}
 for(const key of ['extensionsUsed','extensionsRequired'])gltf[key]=[...new Set([...(gltf[key]||[]),'EXT_texture_webp'])];
 let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),header=Buffer.alloc(20),binaryHeader=Buffer.alloc(8);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);binaryHeader.writeUInt32LE(binary.length,0);binaryHeader.writeUInt32LE(0x004e4942,4);
 const packed=Buffer.concat([header,json,binaryHeader,binary]),out='output/startup-cooperative-20261107';fs.mkdirSync(out,{recursive:true});if(!fs.existsSync(out+'/joe-original.glb'))fs.writeFileSync(out+'/joe-original.glb',source);fs.writeFileSync(file,packed);fs.writeFileSync(out+'/joe-lossless-pack.json',JSON.stringify({before:source.length,after:packed.length,images:report,decodedPixelsIdentical:true},null,2));console.log({before:source.length,after:packed.length,images:report});
})().catch(e=>{console.error(e);process.exitCode=1;});
