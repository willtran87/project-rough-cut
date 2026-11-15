const assert=require('node:assert/strict'),fs=require('node:fs');
const vm=require('node:vm');
const {gameModule,sceneModule,instrumentGame,instrumentScene}=require('./under-green-soak-hooks.cjs');
for(const [pattern,name]of [[gameModule,'under-green.js'],[sceneModule,'under-green-scene.js']]){
 for(const suffix of ['', '?v=20261114-idle-screens','?v=next&cache=1'])assert(pattern.test('http://127.0.0.1:4187/'+name+suffix));
 for(const suffix of ['.map','-backup','/child'])assert(!pattern.test('http://127.0.0.1:4187/'+name+suffix));
 assert(!pattern.test('http://127.0.0.1:4187/other.js?module='+name));
}
const game=fs.readFileSync('web/under-green.js','utf8'),scene=fs.readFileSync('web/under-green-scene.js','utf8');
assert(instrumentGame(game).includes('if(window.__soakInput)return window.__soakInput(run);'));
assert(instrumentGame(game).includes('if(true)window.__underGreen={'));
assert(instrumentScene(scene).includes('window.__soakRenderer=renderer;'));
assert.throws(()=>instrumentGame(game.replace('function input(dt=1/60){','function changedInput(){')),/Production input hook changed/);
assert.throws(()=>instrumentGame(game.replace('if(test)window.__underGreen={','if(test)window.__changed={')),/Production game export hook changed/);
assert.throws(()=>instrumentScene(scene.replace(' return {draw,',' return {changedDraw,')),/Production renderer export hook changed/);
assert.throws(()=>instrumentScene(scene+' return {draw,'),/Production renderer export hook changed/);
// Exercise the callback actually serialized into the browser, including the
// queued timestamp that may arrive before a post-GC clock reset.
const runner=fs.readFileSync('tools/profile-under-green-soak.cjs','utf8');
const callback=runner.match(/function sample\(now\)\{if\(s\.done\).*?\}requestAnimationFrame\(sample\);/);
assert(callback,'RAF sampling callback changed');
const s={done:false,gc:false,last:100,raf:[]},context=vm.createContext({s,requestAnimationFrame:()=>{}});
vm.runInContext(callback[0],context);
for(const now of [90,90,106,1106,1122])vm.runInContext(`sample(${now})`,context);
assert.deepEqual(s.raf,[16,16]);
s.gc=true;vm.runInContext('sample(1138)',context);assert.deepEqual(s.raf,[16,16]);
s.gc=false;s.done=true;vm.runInContext('sample(1154)',context);assert.deepEqual(s.raf,[16,16]);
console.log('Passed module route matching, source instrumentation, missing/duplicate-hook rejection and RAF timing discontinuities.');
