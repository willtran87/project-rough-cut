const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/ghost-reveal-20261107/reveal';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await p.route('**/__ghost-reveal',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:#061013}canvas{width:100vw;height:100vh;image-rendering:pixelated}</style>'}));
  await p.goto('http://127.0.0.1:4187/__ghost-reveal');
  await p.evaluate(async()=>{
   const T=await import('/vendor/three/three.module.js'),{createGhostJoe}=await import('/ghost-joe.js'),{createGhostBehavior}=await import('/ghost-motion.js');
   const scene=new T.Scene(),renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(1280,800,false);document.body.append(renderer.domElement);
   const camera=new T.PerspectiveCamera(45,1.6,.1,40);camera.position.set(0,1.15,-4);camera.lookAt(0,.95,0);
   const ghost=createGhostJoe(scene);await ghost.ready;
   const behavior=createGhostBehavior(),anchor={x:0,y:0,z:0,yaw:0},player={x:0,z:-7,yaw:Math.PI};
   window.__reveal={scene,renderer,camera,ghost,behavior,anchor,player};
  });
  const results=[];
  for(const [label,time]of [['waiting',0],['noticed',1],['held',1.6],['rush',2.8]]){
   const result=await p.evaluate(({label,time})=>{
    const t=__reveal,m=t.behavior.sample('ambient:test:2',t.anchor,time,t.player,'rusher');
    // Isolate phase clarity at the same location/opacity so movement cannot inflate pixel counts.
    t.ghost.show(t.anchor,.52,m);t.renderer.render(t.scene,t.camera);
    const gl=t.renderer.getContext(),pixels=new Uint8Array(1280*800*4);gl.readPixels(0,0,1280,800,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    let lit=0,energy=0;for(let i=0;i<pixels.length;i+=4){const v=pixels[i]+pixels[i+1]+pixels[i+2];if(v>0){lit++;energy+=v;}}
    return {label,lit,energy,stats:t.ghost.stats(),calls:t.renderer.info.render.calls};
   },{label,time});results.push(result);await p.screenshot({path:out+'/'+label+'.png'});
  }
  assert(results[2].lit>results[0].lit*1.25,'Notice must resolve more actual silhouette pixels');
  assert(results[3].energy>results[0].energy*1.6,'Rush must materially increase rendered readability');
  assert(results.every(r=>r.calls===1&&r.stats.triangles===5648));assert.deepEqual(errors,[]);
  await p.evaluate(()=>{const t=__reveal;t.camera.position.set(0,1.61,-.65);t.camera.lookAt(0,1.60,.06);t.renderer.render(t.scene,t.camera);});
  await p.screenshot({path:out+'/face.png'});
  const blend=await p.evaluate(()=>{
   const t=__reveal,eps=.00001;let worstDerivative=0;
   const weights=phase=>{t.ghost.show(t.anchor,.52,{phase:(phase+1)%1,walkWeight:1,time:0});return t.ghost.stats().weights;};
   for(let i=0;i<6;i++){
    const a=weights(i/6-eps),b=weights(i/6),c=weights(i/6+eps);
    if(Math.abs(b.reduce((sum,w)=>sum+w,0)-1)>1e-9||b.some(w=>w<0))throw Error('Invalid gait weights');
    for(let j=0;j<b.length;j++)worstDerivative=Math.max(worstDerivative,Math.abs((b[j]-a[j])/eps-(c[j]-b[j])/eps));
   }
   const motion={phase:.3,walkWeight:.7,time:3,resolve:1,headTilt:.14,headYaw:.07,headNod:-.025,sway:.01,shoulderRoll:.018,jawDrop:.008,torsoTurn:.1};
   t.ghost.show(t.anchor,.52,motion);t.renderer.render(t.scene,t.camera);
   const gl=t.renderer.getContext(),a=new Uint8Array(1280*800*4),b=new Uint8Array(a.length);gl.readPixels(0,0,1280,800,gl.RGBA,gl.UNSIGNED_BYTE,a);
   t.ghost.show(t.anchor,.52,{...motion,headTilt:0,headYaw:0,headNod:0,sway:0,shoulderRoll:0,jawDrop:0,torsoTurn:0});t.renderer.render(t.scene,t.camera);gl.readPixels(0,0,1280,800,gl.RGBA,gl.UNSIGNED_BYTE,b);
   let changed=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])changed++;
   return {worstDerivative,changed};
  });assert(blend.worstDerivative<.01,'Gait velocity must stay continuous across all six pose boundaries');assert(blend.changed>100,'Secondary motion must alter rendered pixels');
  await p.evaluate(()=>{const t=__reveal;t.ghost.show(t.anchor,.52,{time:0});});
  const reset=await p.evaluate(()=>__reveal.ghost.stats());assert.equal(reset.resolve,0);assert.equal(reset.headTilt,0);assert.equal(reset.bodyLean,0);
  for(const key of ['headYaw','headNod','sway','shoulderRoll','jawDrop','torsoTurn'])assert.equal(reset[key],0);
  const sequence=[];
  for(const time of [0,.8,1,1.2,1.45,1.6,2.5,3]){
   const sample=await p.evaluate(time=>{
    const t=__reveal,anchor={...t.anchor,yaw:Math.PI/2};
    const m=t.behavior.sample('ambient:sequence:4',anchor,time,t.player,'rusher');
    t.camera.position.set(0,1.4,-7);t.camera.lookAt(0,1,0);
    t.ghost.show(m,.52*m.alpha,m);t.renderer.render(t.scene,t.camera);return t.ghost.stats();
   },time);sequence.push({time,...sample});
   if([1,1.2,1.6,2.5].includes(time))await p.screenshot({path:out+'/sequence-'+time+'.png'});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({passed:true,results,blend,sequence,errors},null,2));console.log(JSON.stringify({passed:true,results:results.map(({label,lit,energy,calls})=>({label,lit,energy,calls})),blend,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
