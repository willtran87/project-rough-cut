const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/loading',b=await chromium.launch({headless:true});try{
 const rows=[];for(const failure of ['none','worker','missing','corrupt']){const fallback=failure!=='none',p=await b.newPage();if(failure==='worker')await p.addInitScript(()=>window.Worker=undefined);
 if(failure==='missing'||failure==='corrupt')await p.context().route('**/course-*.bin',r=>r.fulfill({status:failure==='missing'?404:200,contentType:'application/octet-stream',body:'invalid archive'}));
 await p.route('**/__surface-proof',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__surface-proof');
 const result=await p.evaluate(async()=>{
  const {createCourseSurfaces}=await import('./course-surfaces.js'),{loadBakedCourseSurfaces}=await import('./baked-course-surfaces.js'),{courseSurfaceBakes,sourceHash}=await import('./assets/baked/course-surfaces.js');
  const expected=createCourseSurfaces(),actual=await loadBakedCourseSurfaces(),rows=[];
  for(const type of Object.keys(courseSurfaceBakes)){
   const old=expected.texture(type),map=actual.texture(type),canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(map.image instanceof ImageBitmap){ctx.translate(0,128);ctx.scale(1,-1);}ctx.drawImage(map.image,0,0);
   const a=old.image.getContext('2d').getImageData(0,0,128,128).data,z=ctx.getImageData(0,0,128,128).data;let changed=0;for(let i=0;i<a.length;i++)if(a[i]!==z[i])changed++;
   const settings=['colorSpace','wrapS','wrapT','magFilter','minFilter','generateMipmaps','premultiplyAlpha','format','type'].map(key=>({key,before:old[key],after:map[key]}));rows.push({type,changed,bitmap:map.image instanceof ImageBitmap,settings});
  }
  const stats=actual.stats(),bitmaps=Object.keys(courseSurfaceBakes).map(type=>actual.texture(type).image).filter(i=>i instanceof ImageBitmap);actual.dispose();const closed=bitmaps.every(i=>i.width===0&&i.height===0);expected.dispose();return {sourceHash,rows,stats,closed};
 });assert.equal(result.sourceHash,crypto.createHash('sha256').update(fs.readFileSync('web/course-surfaces.js')).digest('hex'),'Bake must follow the current painter');for(const r of result.rows){assert.equal(r.changed,0,r.type);assert.equal(r.bitmap,!fallback);for(const v of r.settings)assert.equal(v.before,v.after,JSON.stringify({type:r.type,...v}));}assert.equal(result.stats.baked,fallback?0:10);assert.equal(result.stats.fallback,fallback?10:0);assert(result.closed);rows.push({failure,...result});await p.close();}
 fs.writeFileSync(out+'/surface-pixel-proof.json',JSON.stringify({passed:true,rows},null,2));console.log(JSON.stringify({passed:true,textures:10,comparedChannels:10*128*128*4,changed:0,workerFallback:true,disposedBitmaps:true}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
