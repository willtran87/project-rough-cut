const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/visual-pass59/beam-oracle';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.goto('http://127.0.0.1:4187/under-green-lamp-direction.js');
const result=await p.evaluate(async()=>{
 const T=await import('./vendor/three/three.module.js'),{createDrainPracticalLighting}=await import('./under-green-practical-lighting.js'),{dampLampLevel}=await import('./under-green-atmosphere.js');
 const renderer=new T.WebGLRenderer({antialias:false});renderer.setSize(192,128);const target=new T.WebGLRenderTarget(192,128),scene=new T.Scene(),camera=new T.PerspectiveCamera(52,1.5,.1,40);scene.background=new T.Color(0x090b09);
 const material=new T.MeshPhongMaterial({color:0xa3ac8e,specular:0x6b7a66,shininess:42}),staticMeshes=[];
 for(const x of [-3,3]){const mesh=new T.Mesh(new T.BoxGeometry(2.4,2.4,1.6),material);mesh.position.set(x,1.2,0);scene.add(mesh);staticMeshes.push(mesh);}
 const floor=new T.Mesh(new T.PlaneGeometry(16,16),new T.MeshLambertMaterial({color:0x716655}));floor.rotation.x=-Math.PI/2;scene.add(floor);staticMeshes.push(floor);
 const moving=new T.Mesh(new T.SphereGeometry(.6,24,16),material);moving.position.set(0,1,1);scene.add(moving);
 const lamps=[{x:-3,y:0,height:3.4,power:.75,color:0xe4bd8c,reach:4,beam:{direction:[0,-1,0],innerDegrees:48,outerDegrees:78,spill:.12}},
 {x:-2,y:-2,height:2.5,power:.4,color:0x91aaa6,reach:4},{x:4,y:1,height:3,power:.65,color:0xe4bd8c,reach:5}];
 const lighting=createDrainPracticalLighting({scene,renderer,lamps,staticMeshes}),references=[];
 for(const [i,l]of lamps.entries()){
  const point=new T.PointLight(l.color,0,l.reach,1.4);point.position.set(l.x,l.height,-l.y);scene.add(point);references.push({light:point,index:i,weight:l.beam?.spill??1});
  if(l.beam){const spot=new T.SpotLight(l.color,0,l.reach,l.beam.outerDegrees*Math.PI/180,1-l.beam.innerDegrees/l.beam.outerDegrees,1.4);spot.position.copy(point.position);spot.target.position.copy(point.position).add(new T.Vector3(...l.beam.direction));scene.add(spot,spot.target);references.push({light:spot,index:i,weight:1-l.beam.spill});}
 }
 const render=()=>{renderer.setRenderTarget(target);renderer.render(scene,camera);const bytes=new Uint8Array(192*128*4);renderer.readRenderTargetPixels(target,0,0,192,128,bytes);return bytes;},rows=[];
 for(const [x,y,z]of [[0,5,11],[6,4,9],[-6,3,9],[0,7,-10]])for(const reduced of [false,true]){
  camera.position.set(x,y,z);camera.lookAt(0,1,0);camera.updateMatrixWorld(true);const time=26.3;
  lighting.setEnabled(true);for(const r of references)r.light.intensity=0;lighting.update(camera,time,reduced);const actual=render();
  lighting.setEnabled(false);lighting.update(camera,time,reduced);for(const r of references)r.light.intensity=8*lamps[r.index].power*dampLampLevel(time,r.index,reduced)*r.weight;const reference=render();for(const r of references)r.light.intensity=0;const unlit=render();
  let max=0,sum=0,changed=0,lightEnergy=0;for(let i=0;i<actual.length;i++){if(i%4===3)continue;lightEnergy+=Math.max(0,reference[i]-unlit[i]);const d=Math.abs(actual[i]-reference[i]);max=Math.max(max,d);sum+=d;if(d)changed++;}rows.push({camera:[x,y,z],reduced,max,mean:sum/(192*128*3),changed,lightEnergy});
 }
 const stats=lighting.stats();lighting.dispose();target.dispose();renderer.dispose();return {rows,stats};
});assert.deepEqual(errors,[]);for(const r of result.rows){assert(r.max<=2,'Beam differs from stock spot/point oracle '+JSON.stringify(r));assert(r.mean<.05);assert(r.lightEnergy>500,'Oracle has no observable lighting');}fs.writeFileSync(out+'/'+(software?'software':'hardware')+'.json',JSON.stringify({passed:true,software,...result,errors},null,2));console.log(JSON.stringify({passed:true,software,comparisons:result.rows.length,max:Math.max(...result.rows.map(r=>r.max))}));}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
