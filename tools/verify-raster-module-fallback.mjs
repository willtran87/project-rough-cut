import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const originalFetch=globalThis.fetch,originalCompile=WebAssembly.compile;
try{
 for(const scenario of ['simd','scalar-fallback','javascript-fallback']){
  const fetched=[];let compiling=0;
  globalThis.fetch=async url=>{fetched.push(String(url));if(scenario==='javascript-fallback')throw new Error('Unavailable module');const bytes=readFileSync(url);return {ok:true,arrayBuffer:async()=>bytes};};
  WebAssembly.compile=async bytes=>{if(scenario==='scalar-fallback'&&compiling++===0)throw new WebAssembly.CompileError('SIMD unavailable');return originalCompile(bytes);};
  const {prepareRasterVisibility}=await import('../web/raster-visibility-wasm.js?'+scenario);
  const first=prepareRasterVisibility();assert.equal(first,prepareRasterVisibility(),'Concurrent preparation must reuse its promise');
  assert.equal(await first,scenario!=='javascript-fallback');
  assert.equal(fetched.length,scenario==='simd'?1:2);assert.match(fetched[0],/raster-visibility-simd\.wasm$/);
  if(fetched.length===2)assert.match(fetched[1],/\/raster-visibility\.wasm$/);
 }
 console.log('PASS: SIMD module, scalar compatibility fallback, JavaScript fallback and shared loading promise.');
}finally{globalThis.fetch=originalFetch;WebAssembly.compile=originalCompile;}
