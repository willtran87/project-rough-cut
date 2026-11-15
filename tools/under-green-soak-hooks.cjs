const assert=require('node:assert/strict');

// Match the module pathname, including cache-busted imports from the boot file.
const gameModule=/\/under-green\.js(?:\?[^#]*)?$/;
const sceneModule=/\/under-green-scene\.js(?:\?[^#]*)?$/;
function replaceHook(source,marker,replacement,label){
 assert.equal(source.split(marker).length,2,`${label} hook changed: expected exactly one marker`);
 return source.replace(marker,replacement);
}
function instrumentGame(source){
 source=replaceHook(source,'function input(dt=1/60){','function input(dt=1/60){if(window.__soakInput)return window.__soakInput(run);','Production input');
 return replaceHook(source,'if(test)window.__underGreen={','if(true)window.__underGreen={','Production game export');
}
function instrumentScene(source){
 return replaceHook(source,' return {draw,',' window.__soakRenderer=renderer; return {draw,','Production renderer export');
}
module.exports={gameModule,sceneModule,instrumentGame,instrumentScene};
