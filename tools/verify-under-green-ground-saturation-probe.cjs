const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass90/probe-${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 const p=await browser.newPage({viewport:{width:1280,height:720}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/under-green-scene.js',r=>{const s=fs.readFileSync('web/under-green-scene.js','utf8');return r.fulfill({contentType:'application/javascript',body:s.replace(' return {draw,setQuality,',' window.__groundProbe={renderer,scene,flood}; return {draw,setQuality,')});});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__groundProbe&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 const result=await p.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),{renderer,scene}=__groundProbe;
  let original;scene.traverse(o=>{if(!original&&o.name==='floor'&&o.material?.isMeshPhongMaterial&&o.material.customProgramCacheKey().includes('flood-receiver'))original=o.material;});
  if(!original)throw Error('No final flood-bound paving material');
  const material=original.clone(),mode={value:0};let compiled=false;
  material.onBeforeCompile=function(s,r){
   original.onBeforeCompile.call(this,s,r);
   if(!s.defines.DRAIN_GROUND_FINISH||!s.defines.DRAIN_FLOOD_RECEIVER)throw Error('Missing final floor/flood integration');
   s.uniforms.groundProbeMode=mode;s.fragmentShader='uniform float groundProbeMode;\n'+s.fragmentShader;
   // Read values produced by the real final material after all flood hooks.
   // Replace only output conversion; no duplicated material implementation.
   s.fragmentShader=s.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
    gl_FragColor=groundProbeMode<.5?vec4(groundWet,groundReflectWet,material.specularShininess/160.,1.):vec4(diffuseColor.rgb*4.,1.);
   `);compiled=true;
  };
  material.customProgramCacheKey=()=>original.customProgramCacheKey()+'-saturation-probe';
  const probeScene=new T.Scene(),geometry=new T.PlaneGeometry(.04,.04);geometry.rotateX(-Math.PI/2);
  // The game's fixed-light hook uses Three's PointLight declaration. Keep
  // its zero-power type anchor in this isolated diagnostic scene as well.
  probeScene.add(new T.PointLight(0xffffff,0));
  const mesh=new T.Mesh(geometry,material);probeScene.add(mesh);
  const camera=new T.OrthographicCamera(-.01,.01,.01,-.01,.01,2),target=new T.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false}),bytes=new Uint8Array(4),rows=[];
  const points=[['dry-gallery',3,5],['root-deposit',-1.8,15],['canopy-pool',.35,13.2],['west-seep',-3.75,14.72],['pump-foot',-25.36,43.91],['range',12,28]];
  for(const elapsed of [0,42,49,60,65,75,90]){
   __underGreen.run.elapsed=elapsed;__underGreen.run.joe.phase='absent';advanceTime(0);await __underGreen.whenPresented();
   const flood=__groundProbe.flood.stats();
   for(const [name,x,y]of points){
    mesh.position.set(x,0,-y);camera.position.set(x,1,-y);camera.up.set(0,0,-1);camera.lookAt(x,0,-y);camera.updateMatrixWorld();
    const row={elapsed,name,flood,values:[]};
    for(const value of [0,1]){mode.value=value;renderer.setRenderTarget(target);renderer.render(probeScene,camera);renderer.readRenderTargetPixels(target,0,0,1,1,bytes);row.values.push(Array.from(bytes));}
    rows.push(row);renderer.setRenderTarget(null);
   }
  }
  renderer.setRenderTarget(null);target.dispose();geometry.dispose();material.dispose();advanceTime(0);await __underGreen.whenPresented();return {compiled,rows};
 });
 fs.writeFileSync(out+'/partial.json',JSON.stringify({software,...result,errors},null,2));
 assert.deepEqual(errors,[]);
 assert(result.compiled);let dry=0,wet=0;
 for(const row of result.rows){
  const [base,actual,shine]=row.values[0].map(v=>v/255),expected=Math.max(base,row.flood.wallFilm.fade);
  assert(Math.abs(actual-expected)<.012,'Wet response mismatch: '+row.name+' '+row.elapsed);
  assert(Math.abs(shine-(18+92*actual)/160)<.012,'Shininess mismatch: '+row.name+' '+row.elapsed);
  const initial=result.rows.find(r=>r.name===row.name&&r.elapsed===0);
  if(row.elapsed===0){if(base<.01)dry++;if(base>.99)wet++;}
  if(row.elapsed===90)assert.deepEqual(row.values,initial.values,'Drying must restore existing runoff exactly');
  if(row.elapsed===65)assert.deepEqual(row.values,result.rows.find(r=>r.name===row.name&&r.elapsed===49).values,'Residual saturation must not double-darken');
 }
 assert(dry>0&&wet>0,'Need both dry paving and saturated runoff');assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,...result,dryPoints:dry,wetPoints:wet,errors},null,2));console.log(JSON.stringify({passed:true,software,points:result.rows.length,outputs:result.rows.length*2,dryPoints:dry,wetPoints:wet}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
