// Package generated drawings without inventing motion or retouching their pixels.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules')]}));
const {execFileSync}=require('node:child_process');
const root=path.resolve('assets/enemies/joe-hd');
const natural=process.argv.includes('--natural'),cols=natural?3:4,rows=natural?4:2,count=cols*rows,fps=natural?10:8;
const action=natural?'push-walk-natural':'push-walk',prefix='joe-hd_'+action+'_SE_',preview='joe-hd-'+action;
const frameDir=natural?'previews/natural-frames':'previews/frames';
(async()=>{
  const input=path.join(root,natural?'source_sheets/joe-hd-natural-walk-v3.png':'source_sheets/joe-hd-push-walk-v2.png');
  const meta=await sharp(input).metadata(),w=meta.width/cols,h=meta.height/rows;
  if(!Number.isInteger(w)||!Number.isInteger(h))throw Error('Sheet does not divide into equal cells');
  for(const d of [frameDir,'exploration','sprite_sheets','metadata'])fs.mkdirSync(path.join(root,d),{recursive:true});
  const frames=[],checks=[];
  for(let i=0;i<count;i++){
    const name=`${prefix}${String(i).padStart(2,'0')}.png`;
    const out=path.join(root,frameDir,name);
    await sharp(input).extract({left:(i%cols)*w,top:Math.floor(i/cols)*h,width:w,height:h}).png().toFile(out);
    const {data,info}=await sharp(out).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let occupied=0,transparent=0,border=0,minX=w,minY=h,maxX=0,maxY=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const a=data[(y*w+x)*4+3];if(a===0)transparent++;
      if(a>=128){occupied++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);if(x===0||y===0||x===w-1||y===h-1)border++;}
    }
    if(!transparent||!occupied||border)throw Error(`Frame ${i}: transparency/edge check failed`);
    checks.push({index:i,size:[w,h],alphaBounds:[minX,minY,maxX,maxY],transparentFraction:transparent/(w*h),opaqueBorderPixels:border,sha256:crypto.createHash('sha256').update(data).digest('hex')});
    // Optional native-game-size readability proof, not a finished runtime replacement.
    await sharp(out).resize(192,192,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(root,'exploration',name));
    frames.push({index:i,path:'exploration/'+name,durationMs:1000/fps,pivot:{x:96,y:180}});
  }
  if(new Set(checks.map(c=>c.sha256)).size!==count)throw Error('Duplicate generated frame');
  const sheet='sprite_sheets/'+prefix+'sheet.png',gif=path.join(root,'previews',preview+'.gif');
  await sharp({create:{width:192*count,height:192,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(frames.map((f,i)=>({input:path.join(root,f.path),left:i*192,top:0}))).png().toFile(path.join(root,sheet));
  execFileSync('ffmpeg',['-y','-v','error','-framerate',String(fps),'-i',path.join(root,frameDir,prefix+'%02d.png'),'-filter_complex','split[a][b];[a]palettegen=reserve_transparent=1:stats_mode=full[p];[b][p]paletteuse=dither=none:alpha_threshold=128','-loop','0',gif],{stdio:'inherit'});
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=width,height,nb_read_frames,duration','-of','json',gif],{encoding:'utf8'}));
  if(Number(probe.streams[0].nb_read_frames)!==count)throw Error('GIF frame count mismatch');
  const gifMeta=await sharp(gif).metadata();
  const gifPixels=await sharp(gif).ensureAlpha().raw().toBuffer();
  if(!gifMeta.hasAlpha||gifMeta.pages!==count||gifMeta.loop!==0||gifPixels[3]!==0)throw Error('GIF transparency/loop validation failed');
  fs.writeFileSync(path.join(root,natural?'metadata/natural-preview-validation.json':'metadata/preview-validation.json'),JSON.stringify({passed:true,source:[meta.width,meta.height],frames:checks,gif:probe.streams[0],scope:'Packaging checks only. Does not certify gait, pixel cleanup, or full gameplay coverage.'},null,2));
  fs.writeFileSync(path.join(root,natural?'metadata/joe-hd.natural-animations.json':'metadata/joe-hd.animations.json'),JSON.stringify({unitId:'joe-hd',unitType:'enemy',layoutStandardVersion:'1.0.0',frameSize:{w:192,h:192},directions:['SE'],animations:[{action,direction:'SE',fps,loop:true,frameCount:count,frames,spriteSheet:sheet,loopStart:0,loopEnd:count-1,hitFrames:[],eventFrames:[]}]},null,2));
  console.log(JSON.stringify({passed:true,nativeFrame:[w,h],distinctFrames:count,gif:probe.streams[0],out:root},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
