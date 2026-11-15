const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=`output/under-green/visual-pass87/sampling/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];
try{
 const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
 await p.route('**/shadow-probe.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Shadow sampling probe</title>'}));
 await p.goto('http://127.0.0.1:4187/shadow-probe.html');
 // A separate renderer and controlled six-axis construction exercise the real
 // depth atlas and shader on the GPU, independently of level art and lighting.
 const result=await p.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),{createDrainPracticalShadows,drainShadowGLSL}=await import('./under-green-practical-shadows.js');
  const renderer=new T.WebGLRenderer();renderer.setSize(1,1);const scene=new T.Scene(),meshes=[],geometry=new T.BoxGeometry(1.2,1.2,1.2),material=new T.MeshBasicMaterial();
  const directions=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],lamps=[{x:0,y:0,height:0,reach:13},{x:30,y:-20,height:10,reach:13}],origins=[[0,0,0],[30,10,20]];
  for(const origin of origins)for(const direction of directions){const mesh=new T.Mesh(geometry,material);mesh.name='stone';mesh.position.set(...origin).addScaledVector(new T.Vector3(...direction),3);scene.add(mesh);meshes.push(mesh);}
  // Intentionally don't update matrixWorld here; the baker must honor source
  // transforms even when invoked before the first ordinary render.
  const shadow=await createDrainPracticalShadows({renderer,meshes,lamps});
  const target=new T.WebGLRenderTarget(1,1),point={value:new T.Vector3()},origin={value:new T.Vector4()};
  const sampleMaterial=new T.ShaderMaterial({uniforms:{drainShadowDepth:{value:shadow.depth},drainShadowAtlas:shadow.atlas,drainShadowStrength:shadow.strength,probePoint:point,probeOrigin:origin},vertexShader:'varying vec3 vDrainShadowWorld;void main(){vDrainShadowWorld=vec3(0.);gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:drainShadowGLSL+'\nuniform vec3 probePoint;uniform vec4 probeOrigin;void main(){float v=drainStaticShadow(probePoint,probeOrigin,13.);gl_FragColor=vec4(vec3(v),1.);}'});
  const sampleScene=new T.Scene();sampleScene.add(new T.Mesh(new T.PlaneGeometry(2,2),sampleMaterial));const camera=new T.Camera(),pixel=new Uint8Array(4),samples=[];
  function read(label,row,position,expected){origin.value.set(...origins[row],row);point.value.set(...position).add(new T.Vector3(...origins[row]));renderer.setRenderTarget(target);renderer.render(sampleScene,camera);renderer.readRenderTargetPixels(target,0,0,1,1,pixel);samples.push({label,row,position,expected,actual:pixel[0]});}
  for(let row=0;row<2;row++)for(let axis=0;axis<6;axis++){
   const d=directions[axis];read('blocked-axis-'+axis,row,d.map(v=>v*5),0);read('near-axis-'+axis,row,d,255);
   const offset=d.map(v=>v*5);offset[(Math.floor(axis/2)+1)%3]=2;read('open-side-'+axis,row,offset,255);
  }
  for(let row=0;row<2;row++)for(const d of [[5,5,0],[5,-5,0],[-5,0,5],[0,-5,-5],[5,5,5]])read('open-seam',row,d,255);
  shadow.setEnabled(false);read('disabled',0,[5,0,0],255);
  const stats=shadow.stats();shadow.dispose();target.dispose();geometry.dispose();material.dispose();sampleMaterial.dispose();sampleScene.children[0].geometry.dispose();renderer.dispose();return {stats,samples};
 });
 fs.writeFileSync(out+'/report.json',JSON.stringify({software,result,errors},null,2));assert.deepEqual(errors,[]);for(const s of result.samples)assert(Math.abs(s.actual-s.expected)<=2,JSON.stringify(s));console.log(JSON.stringify({passed:true,software,samples:result.samples.length,stats:result.stats}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
