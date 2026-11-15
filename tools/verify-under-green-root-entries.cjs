const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade-local/pass49-entries/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[];try{
 for(const before of process.argv.includes('--before-only')?[true]:process.argv.includes('--after-only')?[false]:[true,false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before)await p.route('**/under-green-root-compositions.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade-local/pass49-source/under-green-root-compositions-before.js','utf8')}));
  await p.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));return r.fulfill({contentType:'application/javascript',body:s.replace(marker,' window.__entry49={scene,structureMeshes};'+marker)});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=await p.evaluate(async()=>{
   const {ROOT_COMPOSITIONS}=await import('./under-green-root-compositions.js'),{solid}=await import('./under-green-course.js'),views=[];
   for(const c of ROOT_COMPOSITIONS)for(const [suffix,distance,offset]of [['close',1.5,0],['middle',2.5,-.4],['oblique',1.7,.8]]){
    const along=c.along-c.lean*.2,x=c.axis==='x'?c.boundary+c.side*distance:along+offset,y=c.axis==='x'?along+offset:c.boundary+c.side*distance;
    if(solid({x,y},.3))throw Error('Invalid root camera '+c.id+suffix);
    const tx=c.axis==='x'?c.boundary+c.side*.125:along,ty=c.axis==='x'?along:c.boundary+c.side*.125;
    views.push({name:c.id+'-'+suffix,x,y,yaw:Math.atan2(tx-x,ty-y),pitch:Math.min(.85,Math.atan2(c.top*.84-1.65,Math.hypot(tx-x,ty-y)))});
   }return views;
  });
  async function place(f,elapsed=0){await p.evaluate(async({f,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f.x,y:f.y,yaw:f.yaw,pitch:f.pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,elapsed});}
  async function shot(name){const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:s.graphics});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
  if(!process.argv.includes('--audit-only'))for(const f of fixtures){await place(f);await shot(f.name);}
  if(!before){
   const supports=await p.evaluate(async()=>{
    const T=await import('./vendor/three/three.module.js'),{buildDrainRootCompositions}=await import('./under-green-root-compositions.js'),samples=[],materials={};
    buildDrainRootCompositions({materials,root(){},put(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
     const wall=g.userData.rootEntrySurface;if(!wall)return;const m=new T.Object3D();m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);m.updateMatrix();
     const p=g.attributes.position,seen=new Set();for(let i=0;i<p.count;i++){if(Math.abs(p.getZ(i))>1e-7)continue;const at=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrix),key=at.toArray().join(',');if(seen.has(key))continue;seen.add(key);samples.push({wall,at});}
    }});for(const m of Object.values(materials))m.dispose();
    __underGreen.inspectCameraClearance([]);__entry49.scene.updateMatrixWorld(true);const ray=new T.Raycaster(),misses=[],receivers={};
    const masonry=__entry49.structureMeshes.filter(m=>['stone','rootStone','bunkerStone','pumpStone','rangeStone','keeperStone','sand','bankEarth'].includes(m.name));
    for(const {wall,at}of samples){const vertical=wall.axis==='x',origin=at.clone();if(vertical)origin.x=wall.boundary+wall.side*(wall.receiver+.0005);else origin.z=-(wall.boundary+wall.side*(wall.receiver+.0005));ray.set(origin,new T.Vector3(vertical?-wall.side:0,0,vertical?0:wall.side));ray.far=.025;
     const hit=ray.intersectObjects(masonry,false)[0];if(!hit)misses.push({id:wall.id,origin:origin.toArray()});else receivers[hit.object.name]=(receivers[hit.object.name]||0)+1;
    }return {samples:samples.length,misses,receivers};
   });fs.writeFileSync(out+'/supports.json',JSON.stringify(supports,null,2));assert.deepEqual(supports.misses,[],'Fractured masonry has no physical bed');
   if(process.argv.includes('--audit-only')){await p.close();continue;}
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures[1]);await shot('responsive-entrance');await place(fixtures[16]);await shot('responsive-keeper');}
   await p.setViewportSize({width:2560,height:1600});await place(fixtures[4],49);await shot('flood');await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');
   await place(fixtures[1]);const original=await p.screenshot({type:'png'});for(let i=0;i<20;i++)await p.evaluate(async i=>{__underGreen.run.player.yaw+=.1;advanceTime(0);await __underGreen.whenPresented();},i);await place(fixtures[1]);assert(original.equals(await p.screenshot({type:'png'})),'Unstable material during turn');
   await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()).seconds);await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).seconds),frozen);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[1]);await shot('reduced');
   const clearance=await p.evaluate(async()=>{const {ROOT_COMPOSITIONS}=await import('./under-green-root-compositions.js'),{solid}=await import('./under-green-course.js'),poses=[];for(const c of ROOT_COMPOSITIONS)for(const d of [.4,.65,1.1,1.8])for(const off of [-.8,0,.8]){
    const x=c.axis==='x'?c.boundary+c.side*d:c.along+off,y=c.axis==='x'?c.along+off:c.boundary+c.side*d;if(solid({x,y},.3))continue;
    for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5])for(const fov of [45,85])for(const aspect of [390/844,844/390])poses.push({x,y,height,pitch,yaw,fov,aspect});
   }return {poses:poses.length,hits:__underGreen.inspectCameraClearance(poses).filter(p=>p.hits.length)};});fs.writeFileSync(out+'/clearance.json',JSON.stringify(clearance,null,2));assert.deepEqual(clearance.hits,[]);
  }await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
