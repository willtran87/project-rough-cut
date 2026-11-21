// Older Under the Green checks reach into createUnderGreenScene's closure (renderer, scene, camera, ...).
// window.__underGreen does not expose those, so serve today's web/under-green-scene.js with them copied onto window[name].
// Names the current module no longer declares come through as undefined instead of breaking the module.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const web=path.join(__dirname,'..','..','web'),marker=' return {draw,';
function patchScene(s,name,expose='renderer,scene,camera'){assert(s.includes(marker),'under-green-scene.js return anchor missing');const fields=(Array.isArray(expose)?expose:expose.split(',')).map(n=>n.trim()).filter(Boolean).map(n=>`${n}:typeof ${n}==='undefined'?undefined:${n}`).join(',');return s.replace(marker,` window.${name}={${fields}};`+marker);}
function exposeScene(page,name,expose,edit){return page.route('**/under-green-scene.js',r=>{let s=patchScene(fs.readFileSync(path.join(web,'under-green-scene.js'),'utf8'),name,expose);if(edit)s=edit(s);return r.fulfill({contentType:'application/javascript',body:s});});}
module.exports={marker,patchScene,exposeScene};
