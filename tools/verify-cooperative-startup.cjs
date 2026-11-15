const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const b=await chromium.launch({headless:true}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.route('**/__startup-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__startup-test');
  const result=await p.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{prepareRendering}=await import('./render-preparation.js');
   const assert=(value,message)=>{if(!value)throw Error(message);},sleep=ms=>new Promise(r=>setTimeout(r,ms));
   let hidden=true,cancel=false,release=false,uploads=0,fences=0,deleted=0;
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});
   const gl={SYNC_GPU_COMMANDS_COMPLETE:1,ALREADY_SIGNALED:2,CONDITION_SATISFIED:3,WAIT_FAILED:4,fenceSync:()=>{fences++;return {};},flush(){},clientWaitSync:()=>release?2:0,deleteSync(){deleted++;}};
   const renderer={getContext:()=>gl,getRenderTarget:()=>null,setRenderTarget(){},shadowMap:{enabled:false},info:{programs:[]},compileAsync:async()=>{},initTexture(){uploads++;}};
   const root=new T.Group();for(let i=0;i<5;i++){const texture=new T.DataTexture(new Uint8Array(4),1024,1024);texture.generateMipmaps=false;root.add(new T.Mesh(new T.PlaneGeometry(),new T.MeshBasicMaterial({map:texture})));}
   const job=prepareRendering(renderer,root,new T.PerspectiveCamera(),new T.Scene(),null,()=>cancel);
   await sleep(90);assert(uploads===0,'Hidden startup submitted textures');hidden=false;await sleep(90);assert(uploads===4&&fences===1,'Uploads crossed byte budget before GPU completion');release=true;await job;assert(uploads===5&&fences===deleted,'Missing upload or leaked GPU fence');
   hidden=true;cancel=false;const cancelled=prepareRendering(renderer,root,new T.PerspectiveCamera(),new T.Scene(),null,()=>cancel);await sleep(20);cancel=true;await cancelled;assert(uploads===5,'Cancelled hidden load resumed work');hidden=false;
   delete document.hidden;
   // Compare actual baked course trees with the original procedural constructor.
   const manifest=await fetch('./assets/baked/trees.json').then(r=>r.json()),jobs=Object.keys(manifest.trees).slice(0,3).map(JSON.parse),{createPixelWorld}=await import('./pixel-world-props.js'),NativeWorker=window.Worker;
   async function digest(array){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',array))].map(n=>n.toString(16).padStart(2,'0')).join('');}
   async function build(useWorker){window.Worker=useWorker?NativeWorker:undefined;const root=new T.Group(),world=createPixelWorld(root,{label:()=>new T.Mesh(),glow:()=>{},economy:true});for(const job of jobs)world.tree(...job);await world.finish();const records=[];for(const o of root.children){if(!o.isMesh)continue;const attributes={};for(const [name,a]of Object.entries(o.geometry.attributes))attributes[name]=await digest(a.array);records.push({attributes,index:await digest(o.geometry.index.array)});}const stats=world.stats();world.dispose();return {records,objects:stats.objects,trees:stats.treePreparation};}
   const baked=await build(true),procedural=await build(false);window.Worker=NativeWorker;assert(baked.trees.bakedTrees===3,'Archive was not used');assert(JSON.stringify(baked.records)===JSON.stringify(procedural.records),'Bake changed vertex/index data');for(let i=0;i<baked.objects.length;i++){const a=baked.objects[i],b=procedural.objects[i];assert(a.kind===b.kind&&a.form===b.form,'Bake changed tree identity');assert(a.bounds.flat().every((v,j)=>Math.abs(v-b.bounds.flat()[j])<1e-9),'Bake changed bounds beyond floating-point rounding');}
   return {checks:['Hidden loading submits no texture work','GPU completion bounds outstanding upload bytes','Cancellation releases hidden jobs','Every GPU fence deleted','Baked trees exactly match procedural geometry and bounds'],bakedTrees:baked.trees.bakedTrees};
  });assert.deepEqual(errors,[]);fs.writeFileSync('output/startup-cooperative-20261107/contracts.json',JSON.stringify({passed:true,...result,errors},null,2));console.log(result);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
