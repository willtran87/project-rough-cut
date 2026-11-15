const fs=require('node:fs'),path=require('node:path');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'C:/Users/Will/.codex/skills/develop-web-game/node_modules']}));
(async()=>{const source='assets/cutscenes/final-cut-story',target='web/assets/optimized/final-cut-story',assets=[];fs.mkdirSync(target,{recursive:true});
 for(const name of fs.readdirSync(source).filter(n=>n.endsWith('.png'))){const input=path.join(source,name),output=path.join(target,name.replace('.png','.webp')),meta=await sharp(input).metadata();await sharp(input).webp({lossless:true,effort:6}).toFile(output);assets.push({source:input,runtime:output,width:meta.width,height:meta.height,bytes:fs.statSync(output).size});}
 fs.writeFileSync(source+'/manifest.json',JSON.stringify({generator:'Built-in image_gen',processing:'Native generated pixels, lossless WebP compression; source PNGs preserved',assets},null,2));console.log(JSON.stringify(assets));
})().catch(e=>{console.error(e);process.exitCode=1;});
