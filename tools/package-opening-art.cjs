// Preserve native generated pixels; compression only, no enlargement or filtering.
const fs=require('node:fs'),path=require('node:path');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'C:/Users/Will/.codex/skills/develop-web-game/node_modules']}));
(async()=>{
  const folder=process.argv.includes('--back-nine')?'back-nine-opening':'level-one-opening';
  const source='assets/cutscenes/'+folder,target='web/assets/optimized/'+folder,assets=[];
  fs.mkdirSync(target,{recursive:true});
  for(const name of fs.readdirSync(source).filter(n=>n.endsWith('.png'))){
    const input=path.join(source,name),output=path.join(target,name.replace('.png','.webp'));
    const meta=await sharp(input).metadata();
    await sharp(input).webp({quality:90,effort:6,smartSubsample:true}).toFile(output);
    assets.push({source:input,runtime:output,width:meta.width,height:meta.height,bytes:fs.statSync(output).size});
  }
  fs.writeFileSync(path.join(source,'manifest.json'),JSON.stringify({generator:'Built-in image_gen',processing:'Native resolution, WebP quality 90; original PNGs retained',assets},null,2)+'\n');
  console.log(JSON.stringify(assets,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
