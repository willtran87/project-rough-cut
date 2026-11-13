const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs');
const out='output/final-cut/composition';fs.mkdirSync(out,{recursive:true});
const lateral=process.argv.includes('--lateral');
const hook=`window.__compositionProbe=()=>{
 scene.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(),targets=[];
 for(let x=3;x<=13;x+=2)for(let y=69;y<=79;y+=2)targets.push({name:'swale',x,y,h:.12});
 targets.push({name:'road',x:0,y:93.9,h:6.5},{name:'pump',x:10,y:33.6,h:2.8},{name:'bunker-mouth',x:-5.1,y:15,h:1.2});
 const views=[];
 for(const h of ${JSON.stringify(lateral?[6.52]:[6.52,8.52,10.32,11.52])})for(const x of ${JSON.stringify(lateral?[-2,4,8,12,16,20,22]:[-6,-2,2])}){
  const eye=new THREE.Vector3(x,h,-2.5),points=[];
  for(const t of targets){const target=new THREE.Vector3(t.x,t.h,-t.y),delta=target.clone().sub(eye);ray.set(eye,delta.clone().normalize());ray.far=delta.length()-.15;
   const hits=ray.intersectObjects(scene.children,true).filter(hit=>{for(let o=hit.object;o;o=o.parent)if(!o.visible)return false;return true;});
   points.push({...t,blocked:!!hits.length,first:hits[0]?{point:hits[0].point.toArray(),material:hits[0].object.material.color?.getHexString(),instance:hits[0].instanceId}:null});
  }
  views.push({x,h,visibleSwale:points.filter(p=>p.name==='swale'&&!p.blocked).length,points});
 }
 return views;
};window.__compositionView=({x,h})=>{camera.position.set(x,h,-2.5);camera.lookAt(8,.12,-74);renderer.render(scene,camera);};`;
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const views=await p.evaluate(()=>__compositionProbe());fs.writeFileSync(out+'/'+(lateral?'sightline':'height')+'-study.json',JSON.stringify({views,errors},null,2));
 for(const v of lateral?[-2,12,20].map(x=>({x,h:6.52})):[8.52,10.32,11.52].map(h=>({x:-2,h}))){await p.evaluate(v=>__compositionView(v),v);await p.screenshot({path:out+'/candidate-'+(lateral?'x'+v.x:'height'+v.h)+'.png'});}
 console.log(JSON.stringify({views:views.map(v=>({x:v.x,h:v.h,visibleSwale:v.visibleSwale,landmarks:v.points.filter(p=>p.name!=='swale')})),errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
