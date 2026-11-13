const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
(async()=>{
 const out='output/back-nine-art';fs.mkdirSync(out,{recursive:true});
 const manifest=JSON.parse(fs.readFileSync('web/assets/baked/course-pines.json'));
 assert.equal(manifest.sourceHash,createHash('sha256').update(fs.readFileSync('web/pixel-trees.js')).digest('hex'),'Rebake course trees after changing original geometry');
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/__art-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await page.goto('http://127.0.0.1:4187/__art-test');
  const result=await page.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{createParallax}=await import('./parallax-scene.js'),{createCourseSurfaces}=await import('./course-surfaces.js'),{createPixelWorld}=await import('./pixel-world-props.js'),{createCoursePines}=await import('./course-pines.js'),Art=await import('./pixel-art.js');
   const checks=[];function check(ok,name){if(!ok)throw Error(name);checks.push(name);}
   const first=createParallax(),second=createParallax({travelScale:.08,showEstate:false}),camera=new T.PerspectiveCamera(64,16/9,.1,145);
   check(first.scene.children[4].children.length===2&&second.scene.children[4].children.length===0,'Original estate retained only in Level 1');
   for(let i=0;i<4;i++)check(first.scene.children[i].children.every((m,j)=>m.material.map===second.scene.children[i].children[j].material.map),'Shared original sky layer '+i);
   camera.position.set(12,4.2,-30);camera.lookAt(12,2.3,-43.5);first.update(camera,0,false,false);
   check(first.stats().layers.every(l=>Math.abs(l.origin[0]-12*(1-l.influence))<1e-9&&Math.abs(l.origin[1]+30*(1-l.influence))<1e-9),'Level 1 default parallax motion unchanged');
   for(const y of [14,300,580,807]){
    camera.position.set(0,4.2,-y+6.5);camera.lookAt(0,2.3,-y-7);second.update(camera,y,false,false);
    const moon=second.scene.children[0].children[1],p=moon.getWorldPosition(new T.Vector3()).project(second.camera),trees=second.stats().layers[3];
    check(Math.abs(p.x)<.9&&p.y<.96&&p.y>-.96,'Painted moon inside forward view at '+y);
    check(Math.abs(second.camera.position.z-trees.origin[1])<180*.2,'Distant tree ring contains route at '+y);
   }
   const before=second.stats().motionTime;second.update(camera,808,true,false);second.update(camera,809,false,true);check(second.stats().motionTime===before,'Clouds respect pause and reduced motion');
   const surfaces=createCourseSurfaces(),root=new T.Group(),world=createPixelWorld(root,{label:()=>new T.Mesh(),glow:()=>{},economy:true});world.cart(0,-4,2.7,1.55);await world.finish();
   const hash=t=>{const c=t.image;return c.getContext('2d').getImageData(0,0,c.width,c.height).data.reduce((h,v)=>(Math.imul(h,31)+v)|0,0);},paint=hash(surfaces.texture('cart-enamel'));let matches=0;
   root.traverse(o=>{if(o.material?.map?.image?.getContext&&hash(o.material.map)===paint)matches++;});check(matches>0,'Actual Level 1 cart uses the shared enamel pixel palette');
   const scene=new T.Scene(),placements=Array.from({length:140},(_,i)=>({x:i%2?45:-45,z:-i*6,h:8,w:1,variant:i%4,turn:i})),pines=await createCoursePines(scene,new T.MeshLambertMaterial(),placements);
   const meshes=scene.children.slice();for(const y of [14,300,580,807]){camera.position.set(0,4.2,-y);camera.lookAt(0,2.3,-y-13.5);pines.update(camera);check(scene.children.length===8&&scene.children.every((m,i)=>m===meshes[i]&&m.count<=24),'Fixed instanced foliage pool at '+y);}
   check(Art.stats().errors.length===0,'Original art sources loaded');const stats=pines.stats();pines.dispose();world.dispose();surfaces.dispose();first.dispose();second.dispose();return {checks,pines:stats};
  });
  // Enter Level 1 through the normal menu after exercising the shared modules.
  await page.setViewportSize({width:2560,height:1600});await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).mode==='menu');await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.RCScene3D?.stats().ready&&!document.querySelector('[data-brief-start]')?.disabled,null,{timeout:90000});await page.locator('[data-brief-start]').click();
  for(const[width,height]of [[2560,1600],[1280,720],[844,390]]){await page.setViewportSize({width,height});await page.evaluate(async()=>{advanceTime(17);await RCScene3D.whenPresented();});await page.screenshot({path:`${out}/level-one-${width}.png`});}
  assert.equal(await page.evaluate(()=>JSON.parse(render_game_to_text()).mode),'first_hole');result.checks.push('Actual Level 1 menu, preparation and gameplay render after shared module extraction');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/shared-art.json`,JSON.stringify({passed:true,...result,errors},null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
