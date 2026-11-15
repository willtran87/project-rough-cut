const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'C:/Users/Will/.codex/skills/develop-web-game/node_modules']}));
(async()=>{
 const source='assets/enemies/joe/final-cut-expressions-v1',target='web/assets/optimized/joe-expressions-v1',assets=[];
 fs.mkdirSync(target,{recursive:true});
 for(const name of ['search','attack','frustrated','panic']){
  const input=path.join(source,name+'.png'),output=path.join(target,name+'.webp'),meta=await sharp(input).metadata();
  await sharp(input).webp({lossless:true,effort:6}).toFile(output);
  const original=await sharp(input).ensureAlpha().raw().toBuffer(),packed=await sharp(output).ensureAlpha().raw().toBuffer();
  if(!original.equals(packed))throw Error('Pixel mismatch: '+name);
  assets.push({name,source:input,runtime:output,width:meta.width,height:meta.height,bytes:fs.statSync(output).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex')});
 }
 fs.writeFileSync(source+'/manifest.json',JSON.stringify({generator:'Built-in image_gen',processing:'Native pixels preserved, lossless WebP packaging; no resize or artwork alteration',assets},null,2));
 console.log(JSON.stringify(assets));
})().catch(e=>{console.error(e);process.exitCode=1;});
