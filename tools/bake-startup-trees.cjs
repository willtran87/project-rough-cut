const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),{gzipSync}=require('node:zlib'),{createHash}=require('node:crypto');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});let jobs;
 try{
  const page=await browser.newPage();
  await page.route('**/pixel-trees.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/pixel-trees.js','utf8').replace('  function tree(x,z,height,radius){','  function tree(x,z,height,radius){\n    if(typeof window!=="undefined")(window.__treeJobs??=[]).push([x,z,height,radius]);')}));
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__bake={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__bake&&JSON.parse(render_game_to_text()).assets.course.ready);
  await page.evaluate(()=>{__bake.resetFirstHole();__bake.state.mode='first_hole';__bake.state.manualTime=true;__bake.render();});
  await page.waitForFunction(()=>RCScene3D.stats().constructionMs>0,null,{timeout:120000});jobs=await page.evaluate(()=>__treeJobs);
 }finally{await browser.close();}
 const T=await import(pathToFileURL(path.resolve('web/vendor/three/three.module.js'))),{createTrees}=await import(pathToFileURL(path.resolve('web/pixel-trees.js')));
 let root;const wood=new T.MeshBasicMaterial(),builder=createTrees({geometryOnly:true,root:()=>root=new T.Group(),mesh:(parent,g)=>{const m=new T.Mesh(g,wood);parent.add(m);return m;}});
 const chunks=[],trees={};let offset=0;
 function pack(a){const bytes=Buffer.from(a.buffer,a.byteOffset,a.byteLength),descriptor={offset,length:a.length,type:a.constructor.name};chunks.push(bytes);offset+=bytes.length;const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}return descriptor;}
 for(const job of jobs){const key=JSON.stringify(job);if(trees[key])continue;builder.tree(...job);await builder.prepareTrees();const parts=[];root.traverse(o=>{if(!o.isMesh)return;const attributes={};for(const [name,a]of Object.entries(o.geometry.attributes))attributes[name]={...pack(a.array),itemSize:a.itemSize};parts.push({attributes,index:o.geometry.index?pack(o.geometry.index.array):null,needle:o.material.userData.needleIndex,position:o.position.toArray(),quaternion:o.quaternion.toArray()});});trees[key]={form:root.userData.treeForm,parts};}
 const dir='web/assets/baked';fs.mkdirSync(dir,{recursive:true});const binary=gzipSync(Buffer.concat(chunks),{level:9});fs.writeFileSync(dir+'/trees.bin.gz',binary);
 fs.writeFileSync(dir+'/trees.json',JSON.stringify({sourceHash:createHash('sha256').update(fs.readFileSync('web/pixel-trees.js')).digest('hex'),bytes:offset,trees}));console.log({trees:Object.keys(trees).length,rawBytes:offset,compressedBytes:binary.length});
})().catch(e=>{console.error(e);process.exitCode=1;});
