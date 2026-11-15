const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/back-nine-experience/mechanics';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__mechanicalWorld={scene,camera,cart,update,draw()')}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const before=await p.evaluate(()=>({g:JSON.parse(render_game_to_text()).graphics,buffers:__buffers}));
  const cases=await p.evaluate(async()=>{
   const{createRun}=await import('./back-nine-sim.js'),T=await import('./vendor/three/three.module.js'),w=__mechanicalWorld,r=createRun();r.mode='driving';r.grace=999;r.time=10;Object.assign(r.cart,{x:0,y:40,speed:14});r.joe.y=-100;const v=new T.Vector3(),bad=[],worst={x:0,z:0},reducedFailures=[];let count=0;
   for(const health of [100,90,75,55,35,15,1])for(const surface of ['path','rough','wet','sand'])for(const steer of [-1,0,1])for(const hit of [[0,0],[0,-1],[0,1],[-1,0],[1,0],[.707,-.707],[-.707,-.707],[.707,.707],[-.707,.707]])for(const age of [0,.04,.12,.25,.8]){
    r.cart.health=health;r.cart.surface=surface;r.cart.steer=steer;r.time=10+age;r.distance=11.8+age*14;r.impact={serial:1,age,strength:1,damaged:hit[0]!==0||hit[1]!==0,side:hit[0],front:hit[1],yaw:0};w.update(r);w.scene.updateMatrixWorld(true);const inv=new T.Matrix4().copy(w.cart.root.matrixWorld).invert();let x=0,z=0,part='';
    w.cart.root.traverseVisible(o=>{if(o.isMesh)for(let i=0;i<o.geometry.attributes.position.count;i++){o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);x=Math.max(x,Math.abs(v.x));if(Math.abs(v.z)>z){z=Math.abs(v.z);part=[o.name,o.parent.name,o.parent.parent?.name,o.parent.parent?.parent?.name].join('/');}}});
    if(x>worst.x){worst.x=x;worst.xCase={health,surface,steer,hit,age,part};}if(z>worst.z){worst.z=z;worst.zCase={health,surface,steer,hit,age,part};}count++;if((x>1.16||z>1.6)&&bad.length<30)bad.push({health,surface,steer,hit,age,x,z,part});
   }return {count,worst,bad};
  });
  fs.writeFileSync(`${out}/${label}-envelope.json`,JSON.stringify(cases,null,2));console.log(JSON.stringify({...cases,bad:cases.bad.slice(0,2)}));assert.deepEqual(cases.bad,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
