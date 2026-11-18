const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const ground=process.argv.includes('--ground'),software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/level-one-practical-lighting/field-reference-'+(software?'software':'native')+(ground?'-ground':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:512,height:512}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/__field_reference',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:black"></body>'}));
 if(process.argv.includes('--packed'))await page.route('**/course-lantern-light-field.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/course-lantern-light-field-packed.js','utf8')}));
 try{
  await page.goto('http://127.0.0.1:4187/__field_reference');
  const results=await page.evaluate(async ground=>{
   const T=await import('/vendor/three/three.module.js'),{createCourseLanternLightField}=await import('/course-lantern-light-field.js'),{createCourseGroundLighting}=await import('/course-ground-lighting.js');
   const r=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});r.setSize(512,512);document.body.append(r.domElement);r.setClearColor(0x000000);
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(55,1,.05,100),anchors=[[-1,.3,-80],[1,.3,-80],[2,1.5,-84],[-3,.5,-85]].map((p,i)=>({position:new T.Vector3(...p),intensity:.7+i*.1})),field=createCourseLanternLightField(anchors);
   const extraLights=[new T.PointLight(0xffbb69,3,7,2),new T.PointLight(0xffedbb,18,11,2)];extraLights[0].position.set(-5,2,-84);extraLights[1].position.set(5,3,-87);scene.add(...extraLights);let groundLighting=null;
   const lamps=anchors.map(a=>{const l=new T.PointLight(0xffcb82,2.8*a.intensity,3.25,2);l.position.copy(a.position);return l;}),objects=[];
   function mesh(g,m,x,y,z,floor=false){const o=new T.Mesh(g,m);o.position.set(x,y,z);if(floor)o.rotation.x=-Math.PI/2;scene.add(o);const candidate=m.clone(),referenceGeometry=g.clone();if(ground&&floor){o.material=candidate;groundLighting=createCourseGroundLighting(o,anchors,extraLights,{maxVaryings:r.capabilities.maxVaryings});if(!groundLighting)throw Error("Ground specialization rejected reference plane");o.material=m;}else field.apply(candidate);objects.push({o,reference:m,candidate,referenceGeometry:ground&&floor?o.geometry:referenceGeometry,candidateGeometry:o.geometry});return o;}
   mesh(new T.PlaneGeometry(16,16),new T.MeshLambertMaterial({color:0x77805a}),0,0,-82,true);
   mesh(new T.BoxGeometry(.7,1.2,.5),new T.MeshPhongMaterial({color:0x69838c,shininess:25}),1.5,.6,-80.5).rotation.y=.4;
   mesh(new T.BoxGeometry(6,3,.2),new T.MeshLambertMaterial({color:0xa09d84}),0,1.5,-85.5);
   const gl=r.getContext(),a=new Uint8Array(512*512*4),b=a.slice(),results=[];
   for(const [name,x,y,z,tx,tz]of [['front',0,2,-75,0,-82],['left',-4,1.5,-79,0,-82],['right',4,2,-80,0,-83],['cell-boundary',.01,1.7,-78.01,0,-82],['outage',0,2,-75,0,-82]]){
    if(name==='outage'){extraLights.forEach(l=>l.intensity=0);anchors.forEach(a=>a.intensity=.4);lamps.forEach((l,i)=>l.intensity=2.8*anchors[i].intensity);field.update();groundLighting?.update();}
    camera.position.set(x,y,z);camera.lookAt(tx,.6,tz);scene.add(...lamps);objects.forEach(e=>{e.o.material=e.reference;e.o.geometry=e.referenceGeometry;});r.render(scene,camera);gl.readPixels(0,0,512,512,gl.RGBA,gl.UNSIGNED_BYTE,a);
    const referenceImage=ground&&name==='left'?r.domElement.toDataURL():null;
    lamps.forEach(l=>l.removeFromParent());objects.forEach(e=>{e.o.material=e.candidate;e.o.geometry=e.candidateGeometry;});r.render(scene,camera);gl.readPixels(0,0,512,512,gl.RGBA,gl.UNSIGNED_BYTE,b);
    let changed=0,maxDelta=0,lit=0;for(let i=0;i<a.length;i+=4){if(a[i]+a[i+1]+a[i+2]>30)lit++;for(let j=0;j<3;j++){const d=Math.abs(a[i+j]-b[i+j]);if(d)changed++;maxDelta=Math.max(maxDelta,d);}}
    results.push({name,lit,changed,maxDelta,error:gl.getError(),...(referenceImage?{referenceImage,candidateImage:r.domElement.toDataURL()}: {})});
   }
   return results;
  },ground);
  await page.screenshot({path:out+'/reference.jpg',type:'jpeg',quality:93});
  for(const v of results)for(const key of ['referenceImage','candidateImage'])if(v[key]){fs.writeFileSync(out+'/'+v.name+'-'+key+'.png',Buffer.from(v[key].split(',')[1],'base64'));delete v[key];}
  fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));assert.deepEqual(errors,[]);for(const v of results){assert(v.lit>1000);assert(v.maxDelta<=2,'Fixed field must reproduce physical point-light shading: '+JSON.stringify(v));assert.equal(v.error,0);}
  console.log(JSON.stringify({passed:true,software,results}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
