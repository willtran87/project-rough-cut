// Proves the contour bake changes nothing: loads Back Nine with the bake
// blocked (live tessellation) and with it, SHA-256s every contourGround output
// (positions, uvs, colours, normals, index, attribute classes) at the moment it
// is returned, and requires identical sequences and a hit for every call.
// Needs the static server on :4187. Pass --software for SwiftShader.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fixture=require('./lib/campaign-fixture.cjs');
const software=process.argv.includes('--software');
async function load(baked){
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await fixture.unlockChapters(page);await fixture.skipStories(page);
  if(!baked)await page.route('**/assets/baked/course-contours.bin.gz*',r=>r.fulfill({status:404,body:''}));
  const source=fs.readFileSync('web/course-terrain.js','utf8');
  if(!source.includes('export function contourGround('))throw Error('contourGround capture point changed');
  // Copy each result before its caller can project uvs or dispose it.
  await page.route('**/course-terrain.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('export function contourGround(','function contourGroundChecked(')+
   `\nexport function contourGround(THREE,g,options){const out=contourGroundChecked(THREE,g,options),a=out.attributes,parts=[];
    for(const name of Object.keys(a).sort())parts.push(name+':'+a[name].constructor.name+':'+a[name].itemSize+':'+a[name].normalized,a[name].array.slice());
    parts.push('index:'+out.index.constructor.name+':'+out.index.array.constructor.name,out.index.array.slice(),JSON.stringify([out.groups,out.drawRange,out.morphAttributes,out.userData,out.boundingBox,out.boundingSphere]));
    (globalThis.__contourChecks??=[]).push(parts);return out;}\n`}));
  const start=Date.now();await page.goto('http://127.0.0.1:4187/back-nine.html');
  await page.waitForSelector('#primary:not([disabled])',{timeout:180000});const readyMs=Date.now()-start;
  return await page.evaluate(async([readyMs,errors])=>{
   const encoder=new TextEncoder(),digests=[];let bytes=0,first=null;
   for(const parts of __contourChecks){
    const chunks=parts.map(x=>typeof x==='string'?encoder.encode(x+'\n'):new Uint8Array(x.buffer,x.byteOffset,x.byteLength)),all=new Uint8Array(chunks.reduce((s,c)=>s+c.length,0));
    let o=0;for(const c of chunks){all.set(c,o);o+=c.length;}bytes+=all.length;
    const hex=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(n=>n.toString(16).padStart(2,'0')).join('');
    digests.push(await hex(all));if(digests.length===1)first=await Promise.all(chunks.map(async(c,i)=>typeof parts[i]==='string'?parts[i]:(await hex(c)).slice(0,12)));
   }
   const {contourBakeStats}=await import('./baked-contours.js');
   return {readyMs,errors,digests,bytes,first,stats:contourBakeStats()};
  },[readyMs,errors]);
 }finally{await browser.close();}
}
(async()=>{
 const live=await load(false),baked=await load(true);
 assert.deepEqual(live.errors,[]);assert.deepEqual(baked.errors,[]);
 assert.equal(live.stats.entries,0,'Blocked bake must not be installed');
 assert(live.digests.length>1000,'Expected the full course to be contoured');
 assert.equal(baked.digests.length,live.digests.length,'Same number of contourGround calls');
 const differing=live.digests.findIndex((d,i)=>d!==baked.digests[i]);
 if(differing>=0)console.error({live:live.first,baked:baked.first});
 assert.equal(differing,-1,'contourGround output differs at call '+differing);
 assert.equal(baked.stats.hits,live.digests.length,'Every call should be served by the bake');
 assert.equal(baked.stats.misses,0);
 console.log(JSON.stringify({passed:true,software,calls:live.digests.length,hashedBytes:live.bytes,bake:baked.stats,readyMs:{live:live.readyMs,baked:baked.readyMs},
  bakeBytes:fs.statSync('web/assets/baked/course-contours.bin.gz').size,
  checks:['Every contourGround output byte-identical with and without the bake (SHA-256 per call)','Every call served by the bake; none fell back']}));
})().catch(e=>{console.error(e);process.exitCode=1;});
