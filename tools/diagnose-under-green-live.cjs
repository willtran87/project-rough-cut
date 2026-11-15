// Add first-upload identity to the normal production soak. Diagnostic only.
const fs=require('node:fs'),Module=require('node:module'),assert=require('node:assert/strict');
let source=fs.readFileSync('tools/profile-under-green-soak.cjs','utf8');
const marker='const load=Date.now();';assert(source.includes(marker));
source=source.replace(marker,`await p.addInitScript(()=>window.__geometryUploads=[]);
  await p.route(/\\/three\\.module\\.js(?:\\?.*)?$/,route=>{
   let s=fs.readFileSync('web/vendor/three/three.module.js','utf8');
   const mark='info.memory.geometries ++;';assert.equal(s.split(mark).length,2);
   s=s.replace(mark,mark+\`window.__geometryUploads.push({scenario:window.__soak?.scenario,seconds:window.__underGreen?.run.elapsed,id:geometry.id,name:object.name,parent:object.parent?.name,type:geometry.type,vertices:geometry.attributes.position?.count});\`);
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  ${marker}`);
source=source.replace('report.audioVoiceCapacity=audioVoiceCapacity;','report.audioVoiceCapacity=audioVoiceCapacity;report.geometryUploads=await p.evaluate(()=>__geometryUploads);');
const runner=new Module(__filename,module);runner.filename=__filename;runner.paths=module.paths;runner._compile(source,__filename);
