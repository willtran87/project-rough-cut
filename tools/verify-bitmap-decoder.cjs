const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const b=await chromium.launch({headless:true}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.route('**/__bitmap-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__bitmap-test');
  const result=await p.evaluate(async()=>{
   const assert=(v,m)=>{if(!v)throw Error(m);},sleep=ms=>new Promise(r=>setTimeout(r,ms));
   const {decodeBitmapOffThread,bitmapDecodeStats}=await import('./bitmap-decoder.js');
   const canvas=document.createElement('canvas');canvas.width=8;canvas.height=4;const ctx=canvas.getContext('2d',{willReadFrequently:true});
   ctx.fillStyle='#f01843';ctx.fillRect(0,0,8,2);ctx.fillStyle='#18c782';ctx.fillRect(0,2,8,2);ctx.clearRect(0,0,1,1);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve)),url=URL.createObjectURL(blob);
   const pixels=image=>{ctx.clearRect(0,0,8,4);ctx.drawImage(image,0,0);return [...ctx.getImageData(0,0,8,4).data];};
   for(const orientation of ['none','flipY']){const options={imageOrientation:orientation,premultiplyAlpha:'none',colorSpaceConversion:'none'},reference=await createImageBitmap(blob,options),worker=await decodeBitmapOffThread(url,options);assert(JSON.stringify(pixels(reference))===JSON.stringify(pixels(worker)),'Worker changed RGBA/orientation');reference.close();worker.close();}
   let cancelled=true;await decodeBitmapOffThread(url,{},()=>cancelled).then(()=>{throw Error('Cancelled request completed');},()=>{});assert(bitmapDecodeStats().pending===0,'Cancelled request leaked');
   let hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});const before=bitmapDecodeStats().decoded;const queued=decodeBitmapOffThread(url,{});await sleep(80);assert(bitmapDecodeStats().decoded===before&&bitmapDecodeStats().pending===0,'Hidden decode was submitted');hidden=false;(await queued).close();delete document.hidden;
   const NativeWorker=window.Worker;
   window.Worker=class{constructor(){queueMicrotask(()=>this.onerror?.({preventDefault(){}}));}postMessage(){}terminate(){}};
   const broken=await import('./bitmap-decoder.js?worker-failure');
   await broken.decodeBitmapOffThread(url,{}).then(()=>{throw Error('Failed worker resolved');},()=>{});
   assert(broken.bitmapDecodeStats().pending===0&&broken.bitmapDecodeStats().failures===1,'Failed worker left pending promises');
   window.Worker=NativeWorker;URL.revokeObjectURL(url);
   // Deliberately unavailable worker: real GLB loading must retain native decode.
   window.Worker=undefined;
   const T=await import('./vendor/three/three.module.js'),{createJoeModel}=await import('./joe-model.js'),actor=createJoeModel(new T.Group());
   const end=performance.now()+30000;while(!actor.stats().ready&&!actor.stats().error&&performance.now()<end)await sleep(20);
   const model=actor.stats();assert(model.ready&&!model.error,'Native Joe decoder fallback failed');
   let mapped=0;actor.root.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(m.map?.image?.width)mapped++;});assert(mapped>=8,'Native fallback lost texture maps');actor.dispose();window.Worker=NativeWorker;
   return {checks:['Worker RGBA and vertical orientation equal native decode','Cancelled decode leaves no job','Hidden decoding waits until visible','Failed worker rejects and clears pending jobs','Unavailable worker retains textured original Joe'],modelTriangles:model.triangles,mapped,decoder:bitmapDecodeStats()};
  });assert.deepEqual(errors,[]);fs.mkdirSync('output/startup-decode-20261107',{recursive:true});fs.writeFileSync('output/startup-decode-20261107/decoder-contracts.json',JSON.stringify({passed:true,...result,errors},null,2));console.log(result);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
