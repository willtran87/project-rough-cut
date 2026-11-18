const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=`output/under-green/visual-pass92/probe-${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/shadow-probe.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Floor shadow probe</title>'}));
 await p.route('**/under-green-shadow-baseline.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-pass92/source/under-green-practical-shadows-before.js','utf8')}));
 await p.goto('http://127.0.0.1:4187/shadow-probe.html');
 const result=await p.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),current=await import('./under-green-practical-shadows.js'),before=await import('./under-green-shadow-baseline.js');
  const renderer=new T.WebGLRenderer(),scene=new T.Scene(),material=new T.MeshBasicMaterial({side:T.DoubleSide}),meshes=[];
  const box=(name,position,size)=>{const o=new T.Mesh(new T.BoxGeometry(...size),material);o.name=name;o.position.set(...position);scene.add(o);meshes.push(o);return o;};
  const floor=box('floor',[0,-.14,0],[24,.28,24]),root=box('root',[0,1.5,0],[.8,3,.8]),wall=box('stone',[3,2,0],[.4,4,6]),platform=box('walkway',[-3,.25,2],[2,.5,2]);
  const lamp={x:-2,y:4,height:2.5,reach:13},light=new T.Vector3(-2,2.5,-4),eligibility=[];
  function test(name,o,expected,minHeight=0){const actual=current.isDrainPracticalCaster(o,undefined,minHeight);if(actual!==expected)throw Error(name);eligibility.push({name,actual});}
  test('ground-floor',floor,false);test('raised-walkway',platform,true);test('root',root,true);test('wall',wall,true);test('lamp-below-grade',floor,true,-1);
  const parent=new T.Group(),child=new T.Mesh(new T.BoxGeometry(1,.28,1),material);child.name='floor';child.position.y=-.14;parent.position.y=.3;parent.add(child);scene.add(parent);test('parent-raised-floor',child,true);parent.position.y=-.3;test('parent-buried-floor',child,false);child.geometry.dispose();scene.remove(parent);
  const size=48,target=new T.WebGLRenderTarget(size,size),camera=new T.Camera(),sampleScene=new T.Scene(),quad=new T.Mesh(new T.PlaneGeometry(2,2));sampleScene.add(quad);
  const targetPixels=new Uint8Array(size*size*4),runs=[];
  for(const obstacles of [false,true])for(const [name,api]of [['before',before],['after',current]]){
   const shadow=await api.createDrainPracticalShadows({renderer,meshes:obstacles?meshes:[floor],lamps:[lamp]});
   const sampleMaterial=new T.ShaderMaterial({uniforms:{drainShadowDepth:{value:shadow.depth},drainShadowAtlas:shadow.atlas,drainShadowStrength:shadow.strength},vertexShader:'varying vec2 probeUV;varying vec3 vDrainShadowWorld;void main(){probeUV=uv;vDrainShadowWorld=vec3(0.);gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:api.drainShadowGLSL+'\nvarying vec2 probeUV;void main(){vec3 point=vec3(probeUV.x*18.-9.,0.,probeUV.y*18.-9.);float v=drainStaticShadow(point,vec4(-2.,2.5,-4.,0.),13.);gl_FragColor=vec4(vec3(v),1.);}'});
   quad.material=sampleMaterial;renderer.setRenderTarget(target);renderer.render(sampleScene,camera);renderer.readRenderTargetPixels(target,0,0,size,size,targetPixels);
   const values=Array.from({length:size*size},(_,i)=>targetPixels[i*4]);runs.push({name,obstacles,stats:shadow.stats(),values});shadow.dispose();sampleMaterial.dispose();
  }
  scene.updateMatrixWorld(true);const ray=new T.Raycaster(),blockers=[root,wall,platform],checks=[];
  function blocked(x,z){const point=new T.Vector3(x,0,z),direction=point.clone().sub(light),distance=direction.length();ray.set(light,direction.normalize());ray.near=.001;ray.far=distance-.01;return ray.intersectObjects(blockers,false)[0]?.object.name??null;}
  const values=runs.find(r=>r.name==='after'&&r.obstacles).values;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const wx=(x+.5)/size*18-9,wz=(y+.5)/size*18-9;
   if(Math.max(Math.abs(wx-light.x),2.5,Math.abs(wz-light.z))>12)continue;
   // Leave a margin around projected PCF edges, including diagonals.
   const states=[-.8,0,.8].flatMap(dx=>[-.8,0,.8].map(dz=>blocked(wx+dx,wz+dz)));
   if(states.some(s=>s!==states[0]))continue;
   checks.push({x:wx,z:wz,blocked:Boolean(states[0]),caster:states[0],actual:values[y*size+x]});
  }
  const summary=runs.map(r=>({name:r.name,obstacles:r.obstacles,blockerBatches:r.stats.blockerBatches,samples:r.values.length,shadowed:r.values.filter(v=>v<250).length,minimum:Math.min(...r.values)}));
  target.dispose();quad.geometry.dispose();meshes.forEach(m=>m.geometry.dispose());material.dispose();renderer.dispose();return {eligibility,summary,checks};
 });
 fs.writeFileSync(out+'/report.json',JSON.stringify({software,result,errors},null,2));assert.deepEqual(errors,[]);
 const empty=result.summary.filter(r=>!r.obstacles);assert(empty[0].shadowed>100,'Baseline must reproduce ground acne');assert.equal(empty[1].shadowed,0,'An unobstructed floor must receive its lamp');
 const blocked=result.checks.filter(r=>r.blocked),clear=result.checks.filter(r=>!r.blocked);assert(blocked.length>50&&clear.length>500);assert(blocked.every(r=>r.actual<8),'Root/wall/raised floor shadow lost');assert(clear.every(r=>r.actual>247),'Spurious shadow remains away from edges');
 console.log(JSON.stringify({passed:true,software,summary:result.summary,blocked:blocked.length,clear:clear.length}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
