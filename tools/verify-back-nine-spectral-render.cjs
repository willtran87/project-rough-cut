const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software');
 const base='output/back-nine-visual-upgrade/ghosts',out=base+'/'+(before?'before-':'after-')+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/__spectral-fixture',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:#030b0f}canvas{display:block;width:100vw;height:100vh}</style>'}));
 
 try{
  await p.goto('http://127.0.0.1:4187/__spectral-fixture');
  await p.evaluate(async before=>{
   const T=await import('./vendor/three/three.module.js'),{createGhostJoe}=await import('./ghost-joe.js');
   const renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(2560,1600);renderer.setClearColor(0x030b0f,1);document.body.appendChild(renderer.domElement);
   const scene=new T.Scene(),ghost=createGhostJoe(scene,{muted:true,softFade:!before}),hard=createGhostJoe(scene,{muted:true});await Promise.all([ghost.ready,hard.ready]);
   const camera=new T.OrthographicCamera(-1.92,1.92,2.2,-.2,.1,20);camera.position.set(0,0,-5);camera.lookAt(0,0,0);camera.updateMatrixWorld();
   const anchor={x:0,y:0,z:0,yaw:.3},motion={time:2.1,phase:.2,walkWeight:.7,distance:.6,resolve:.35,headYaw:.08,sway:.01};
   window.fixture={T,renderer,scene,ghost,hard,camera,anchor,motion,draw(alpha=.52){hard.show(null,0);ghost.show(anchor,alpha,motion);renderer.setRenderTarget(null);renderer.render(scene,camera);}};
  },before);
  for(const alpha of [.15,.30,.52,.68]){await p.evaluate(a=>fixture.draw(a),alpha);await p.screenshot({path:out+'/surface-'+Math.round(alpha*100)+'.jpg',type:'jpeg',quality:94});}
  const result=await p.evaluate(async()=>{
   const f=fixture,{T,renderer:r,scene,camera,ghost,hard,anchor,motion}=f,rt=new T.WebGLRenderTarget(512,512),bytes=()=>new Uint8Array(512*512*4);
   camera.left=-1.2;camera.right=1.2;camera.updateProjectionMatrix();r.setRenderTarget(rt);
   const read=()=>{r.clear();r.render(scene,camera);const b=bytes();r.readRenderTargetPixels(rt,0,0,512,512,b);return b;};
   const hash=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(v=>v.toString(16).padStart(2,'0')).join('');
   ghost.show(anchor,.30,motion);const a=read(),repeat=read();
   // Move the same surface exactly one raster pixel. The camera and geometry
   // are unchanged; a screen-attached grain cannot follow this translation.
   ghost.root.position.x+=2.4/512;const b=read();ghost.root.position.x=anchor.x;
   let error=0,changed=0,max=0,samples=0;for(let y=1;y<511;y++)for(let x=1;x<511;x++)for(let c=0;c<3;c++){
    const i=(y*512+x)*4+c,j=(y*512+x-1)*4+c,d=Math.abs(a[i]-b[j]);error+=d;max=Math.max(max,d);samples++;if(d>1)changed++;
   }
   const fades=[];for(const alpha of [0,.08,.15,.22,.30,.4,.52,.68,.75]){ghost.show(anchor,alpha,motion);const pixels=read();let energy=0;for(let i=0;i<pixels.length;i+=4)energy+=pixels[i]+pixels[i+1]+pixels[i+2];fades.push({alpha,energy});}
   // Opaque foreground geometry must completely hide the apparition.
   const cover=new T.Mesh(new T.PlaneGeometry(4,4),new T.MeshBasicMaterial({color:0x18302c,side:T.DoubleSide}));cover.position.set(0,1,-2);scene.add(cover);
   ghost.show(anchor,.68,motion);const covered=await hash(read());ghost.show(null,0);const empty=await hash(read());scene.remove(cover);cover.geometry.dispose();cover.material.dispose();
   hard.show(anchor,.52,motion);const hardHash=await hash(read());hard.show(null,0);
   ghost.show(anchor,.52,motion);read();const memory={...r.info.memory};for(let i=0;i<24;i++){ghost.show(anchor,.52,{...motion,phase:i/24,time:i/6,distance:i/30});read();}const endMemory={...r.info.memory};
   r.setRenderTarget(null);rt.dispose();camera.left=-1.92;camera.right=1.92;camera.updateProjectionMatrix();f.draw();
   return {translation:{mean:error/samples,changed,max,samples},repeat:[await hash(a),await hash(repeat)],fades,occlusion:[covered,empty],hardHash,memory,endMemory,stats:ghost.stats(),resolution:[r.domElement.width,r.domElement.height]};
  });
  assert.equal(result.repeat[0],result.repeat[1]);assert.equal(result.occlusion[0],result.occlusion[1]);assert.deepEqual(result.memory,result.endMemory);assert(result.fades.every((v,i)=>!i||v.energy>=result.fades[i-1].energy));assert.equal(result.stats.drawCalls,1);
  if(!before){assert.equal(result.translation.max,0,'Body-attached surface must survive an exact one-pixel translation');const prior=base+'/before-'+(software?'software':'hardware')+'/render-report.json';if(fs.existsSync(prior))assert.equal(result.hardHash,JSON.parse(fs.readFileSync(prior)).hardHash,'Other chapters keep identical opaque-dither rendering');}
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(({width,height})=>{const f=fixture;f.renderer.setSize(width,height);const halfHeight=1.2,halfWidth=halfHeight*width/height;f.camera.left=-halfWidth;f.camera.right=halfWidth;f.camera.top=2.2;f.camera.bottom=-.2;f.camera.updateProjectionMatrix();f.draw(.30);},{width,height});await p.screenshot({path:out+'/surface-'+width+'.jpg',type:'jpeg',quality:94});}
  assert.deepEqual(errors,[]);const report={passed:true,before,software,...result,errors};fs.writeFileSync(out+'/render-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
