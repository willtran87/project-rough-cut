const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/startup-throughput-20261107';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/__tree-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await page.goto('http://127.0.0.1:4187/__tree-test');
  const result=await page.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{createPixelWorld}=await import('./pixel-world-props.js'),NativeWorker=window.Worker;
   async function build(mode){
    window.Worker=mode==='worker'?NativeWorker:mode==='unavailable'?undefined:class{postMessage(){}terminate(){}constructor(){queueMicrotask(()=>this.onerror?.({preventDefault(){}}));}};
    const root=new T.Group(),world=createPixelWorld(root,{label:()=>new T.Mesh(),glow:()=>{},economy:true});
    for(const z of [0,2,4])world.tree(0,z,7,1.2);world.cover(5,-5,1,2);world.cart(3,-10,2.7,1.55);
    await world.finish();root.updateMatrixWorld(true);
    const records=[];
    for(const o of root.children){if(!o.isMesh)continue;const attributes={};
     for(const [key,a]of Object.entries(o.geometry.attributes))attributes[key]=await digest(a.array);
     records.push({attributes,index:await digest(o.geometry.index.array),matrix:o.matrixWorld.toArray()});
    }
    const stats=world.stats();world.dispose();root.traverse(o=>o.geometry?.dispose());return {records,objects:stats.objects,trees:stats.treePreparation};
   }
   async function digest(array){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',array))].map(n=>n.toString(16).padStart(2,'0')).join('');}
   const worker=await build('worker'),fallback=await build('unavailable'),failed=await build('failed');
   window.Worker=NativeWorker;
   const root=new T.Group(),world=createPixelWorld(root,{label:()=>new T.Mesh(),glow:()=>{},economy:true});
   for(let i=0;i<20;i++)world.tree(i,0,7,1.2);let cancelled=false;
   const pending=world.finish(()=>cancelled);cancelled=true;world.dispose();await pending;
   return {worker,fallback,failed,cancelled:root.children.every(o=>!o.isMesh)};
  });
  assert.equal(result.worker.trees.workerTrees,3);assert.equal(result.fallback.trees.fallbackTrees,3);assert.equal(result.failed.trees.fallbackTrees,3);
  assert.deepEqual(result.worker.records,result.fallback.records,'Worker must preserve every merged vertex, normal, UV, tint and index');
  assert.deepEqual(result.worker.objects,result.fallback.objects);assert.deepEqual(result.failed.records,result.fallback.records);
  assert(result.cancelled);assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/tree-preparation.json',JSON.stringify({passed:true,...result,errors},null,2));
  console.log('PASS: exact worker/fallback geometry, bounds, worker startup failure and disposal during pending generation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
