const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass83/probe-${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});const errors=[];try{
const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
await p.route('**/under-green-ground-finish.js',r=>{const s=fs.readFileSync('web/under-green-ground-finish.js','utf8');return r.fulfill({contentType:'application/javascript',body:s.replace(' return {texture,wallDeposits,',' window.__depositTexture=texture; return {texture,wallDeposits,')});});
await p.route('**/under-green-scene.js',r=>{const s=fs.readFileSync('web/under-green-scene.js','utf8');return r.fulfill({contentType:'application/javascript',body:s.replace(' return {draw,inspectCastShadow:',' window.__groundRenderer=renderer; return {draw,inspectCastShadow:')});});
await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
const result=await p.evaluate(async()=>{
 const T=await import('./vendor/three/three.module.js'),tex=__depositTexture,renderer=__groundRenderer,rows=[],target=new T.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false});
 const m=new T.ShaderMaterial({uniforms:{source:{value:tex},uvPoint:{value:new T.Vector2()}},vertexShader:'void main(){gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D source;uniform vec2 uvPoint;void main(){gl_FragColor=texture2D(source,uvPoint);}',blending:T.NoBlending,depthTest:false,depthWrite:false});
 const scene=new T.Scene(),g=new T.PlaneGeometry(2,2);scene.add(new T.Mesh(g,m));const camera=new T.Camera(),data=tex.image.data,size=tex.image.width,bytes=new Uint8Array(4);
 for(const [name,x,y]of [['pillar',-1.8,15],['east-root',4.2,11.8],['canopy-pool',.35,13.2],['west-seep',-3.75,14.72],['dry-gallery',3,5],['pump-foot',-25.36,43.91],['bunker-seep',-31,60.7],['keeper-pool',8.2,12.3],['range-wear',12,28]]){
  const col=Math.floor((x+36)/64*size),row=Math.floor((80-y)/84*size),expected=Array.from(data.slice((row*size+col)*4,(row*size+col)*4+4));
  // Pixel centres eliminate filtering/rounding ambiguity. The shader's UV
  // formula uses positive course y; Canvas painting stores top-down rows.
  m.uniforms.uvPoint.value.set((col+.5)/size,1-(row+.5)/size);
  renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,1,1,bytes);
  rows.push({name,x,y,expected,gpu:Array.from(bytes),flippedData:Array.from(data.slice(((size-1-row)*size+col)*4,((size-1-row)*size+col)*4+4))});
 }
 renderer.setRenderTarget(null);target.dispose();g.dispose();m.dispose();advanceTime(0);await __underGreen.whenPresented();return {flipY:tex.flipY,rows};
});for(const row of result.rows)assert.deepEqual(row.gpu,row.expected,'World deposit registration: '+row.name);
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,...result,errors},null,2));console.log(JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
