const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/light-branches-study';fs.mkdirSync(out,{recursive:true});
const hook=`
 let fast=false;const branchMaterials=new Set();scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.isMeshLambertMaterial)branchMaterials.add(m);});
 const originalChunk=THREE.ShaderChunk.lights_fragment_begin;
 let fastChunk=originalChunk;
 for(const type of ['Point','Spot']){
  const start='get'+type+'LightInfo( '+type.toLowerCase()+'Light, geometryPosition, directLight );';
  const offset=fastChunk.indexOf(start);if(offset<0)throw Error('Missing light info marker');
  const end=fastChunk.indexOf('RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',offset);
  const after=end+'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );'.length;
  fastChunk=fastChunk.slice(0,after)+'\\n }'+fastChunk.slice(after);
  fastChunk=fastChunk.slice(0,offset+start.length)+'\\n if(directLight.visible){'+fastChunk.slice(offset+start.length);
 }
 for(const m of branchMaterials){const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(shader,renderer){before.call(this,shader,renderer);if(fast)shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',fastChunk);};m.customProgramCacheKey=()=>key+'-light-branch-study-'+fast;}
 const set=value=>{if(fast===value)return;fast=value;branchMaterials.forEach(m=>m.needsUpdate=true);};
 window.__branchStudy=()=>{const reports=[],pixels=new Uint8Array(width*height*4);let reference;
  const draw=()=>{scene.traverse(l=>{if(l.isLight&&l.castShadow&&l.intensity>0)l.shadow.needsUpdate=true;});renderer.render(scene,camera);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);};
  for(const value of [false,true,true,false]){set(value);for(let i=0;i<2;i++)draw();if(!reference)reference=pixels.slice();const times=[];for(let i=0;i<5;i++){const start=performance.now();draw();times.push(performance.now()-start);}times.sort((a,b)=>a-b);let different=0,max=0;for(let i=0;i<pixels.length;i++){const d=Math.abs(pixels[i]-reference[i]);if(d)different++;max=Math.max(max,d);}reports.push({fast:value,median:times[2],different,max,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});}
  return {materials:branchMaterials.size,reports};
 };`;
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:960,height:540}});p.setDefaultTimeout(120000);const errors=[],cases=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');assert(source.includes('await renderer.compileAsync(scene,camera);'));await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__branchStudy&&JSON.parse(render_game_to_text()).ready);
 for(const v of [{name:'wall',x:5,y:55,yaw:Math.atan2(-4,3.1),pitch:.14},{name:'mower',x:0,y:42,yaw:0,pitch:0}]){
  await p.evaluate(async v=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';r.time=.5;Object.assign(r.rig,{x:0,y:49.38,yaw:0,phase:'pass',age:3,deployment:1});Object.assign(r.player,v);__finalCut.run=r;await advanceTime(0);},v);
  const data=await p.evaluate(()=>__branchStudy());cases.push({name:v.name,...data});console.log(JSON.stringify(cases.at(-1)));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({cases,errors},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
