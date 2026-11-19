// Records every contourGround result of a real Back Nine load (with no bake, so
// the live tessellator runs) and writes web/assets/baked/course-contours.bin.gz.
// Verify with tools/verify-course-contours.cjs. Needs the static server on :4187.
const fs=require('node:fs'),{gzipSync}=require('node:zlib');
const {chromium}=require('playwright');
const fixture=require('./lib/campaign-fixture.cjs');
const OUTPUT='web/assets/baked/course-contours.bin.gz';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});let capture;
 try{
  const page=await browser.newPage();await fixture.unlockChapters(page);await fixture.skipStories(page);
  await page.route('**/assets/baked/course-contours.bin.gz*',r=>r.fulfill({status:404,body:''}));
  const source=fs.readFileSync('web/course-terrain.js','utf8');
  if(!source.includes('export function contourGround('))throw Error('contourGround capture point changed');
  await page.route('**/course-terrain.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('export function contourGround(','function contourGroundLive(')+
   // Snapshot at return: callers go on to add colours and project uvs in place.
   '\nexport function contourGround(THREE,g,options){const key=contourBakeKey(g,options),out=contourGroundLive(THREE,g,options),a=out.attributes;'+
   'if(key)(globalThis.__contourBake??=[]).push([key,a.position.count,out.index.count,a.color?a.color.itemSize:0,out.index.array instanceof Uint32Array?1:0,'+
   '[a.position.array.slice(),a.uv.array.slice(),a.color?a.color.array.slice():new Float32Array(0),Uint32Array.from(out.index.array)]]);return out;}\n'}));
  await page.goto('http://127.0.0.1:4187/back-nine.html');
  await page.waitForSelector('#primary:not([disabled])',{timeout:180000});
  capture=await page.evaluate(async()=>{
   const terrain=await import('./course-terrain.js'),seen=new Map(),entries=[],chunks=[];let bytes=0,repeats=0;
   const same=(a,b)=>a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
   for(const [key,vertices,indices,colors,wide,arrays] of __contourBake){
    if(seen.has(key)){if(!seen.get(key).every((x,i)=>same(x,arrays[i])))throw Error('Same contour key, different output: '+key);repeats++;continue;}
    seen.set(key,arrays);entries.push([key,vertices,indices,colors,wide]);
    for(const x of arrays){chunks.push(new Uint8Array(x.buffer,x.byteOffset,x.byteLength));bytes+=x.byteLength;}
   }
   const all=new Uint8Array(bytes);let o=0;for(const c of chunks){all.set(c,o);o+=c.length;}
   let text='';for(let i=0;i<all.length;i+=32768)text+=String.fromCharCode.apply(null,all.subarray(i,i+32768));
   return {version:terrain.CONTOUR_BAKE_VERSION,fingerprint:terrain.contourFingerprint(),calls:__contourBake.length,repeats,entries,data:btoa(text)};
  });
 }finally{await browser.close();}
 const raw=Buffer.from(capture.data,'base64');let at=0;
 const take=length=>{const words=new Uint32Array(raw.buffer.slice(raw.byteOffset+at,raw.byteOffset+at+length*4));at+=length*4;return words;};
 // Four sections (positions, uvs, colours, indices), each holding every entry
 // in order. Within an entry each component is its own run of zigzag deltas,
 // and each section is split into four byte planes; both help gzip on floats.
 const table=new Uint32Array(capture.entries.length*5),sections=[[],[],[],[]];
 for(const [i,[key,vertices,indices,colors,wide]] of capture.entries.entries()){
  const [ka,kb]=key.split(':').map(Number);table.set([ka,kb,vertices,indices,colors|wide<<8],i*5);
  for(const [s,length,width] of [[0,vertices*3,3],[1,vertices*2,2],[2,vertices*colors,colors],[3,indices,1]]){
   const values=take(length);for(let k=0;k<width;k++){let previous=0;for(let j=k;j<length;j+=width){const d=(values[j]-previous)|0;sections[s].push((d<<1^d>>31)>>>0);previous=values[j];}}
  }
 }
 if(at!==raw.length)throw Error('Contour capture size mismatch');
 const planes=words=>{const n=words.length,b=Buffer.alloc(n*4);for(let j=0;j<n;j++){const v=words[j];b[j]=v&255;b[n+j]=v>>>8&255;b[2*n+j]=v>>>16&255;b[3*n+j]=v>>>24;}return b;};
 const header=Buffer.from(JSON.stringify({version:capture.version,fingerprint:capture.fingerprint,entries:capture.entries.length,words:sections.map(s=>s.length)}));
 const prefix=Buffer.alloc((4+header.length+3)&~3);prefix.writeUInt32LE(header.length,0);header.copy(prefix,4);
 const body=Buffer.concat([prefix,Buffer.from(table.buffer),...sections.map(planes)]),compressed=gzipSync(body,{level:9});
 fs.writeFileSync(OUTPUT,compressed);
 console.log({calls:capture.calls,repeats:capture.repeats,entries:capture.entries.length,rawBytes:body.length,compressedBytes:compressed.length});
})().catch(e=>{console.error(e);process.exitCode=1;});
