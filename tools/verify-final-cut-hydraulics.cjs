const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),software=process.argv.includes('--software'),out=`output/final-cut/hydraulics/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],poses=[],states=[];if(software)p.setDefaultTimeout(120000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),shot=async name=>{await tick(0);await p.screenshot({path:`${out}/${name}.png`});states.push({name,state:await read()});};
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');
 for(let k=0;k<=8;k++)for(const yaw of [-Math.PI/2,.73,Math.PI/2]){
  const result=await p.evaluate(async({deployment,yaw})=>{
   const THREE=await import('./vendor/three/three.module.js'),{createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js'),{wingClearanceParts,worldPart,RIG_BANK}=await import('./final-cut-rig.js'),{HYDRAULIC}=await import('./final-cut-hydraulic-layout.js');
   const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:0,y:50,yaw,phase:'turn',deployment,distance:.7,reelAngle:-.9});Object.assign(r.player,{x:5,y:56,yaw:Math.atan2(-5,-6),pitch:.1});__finalCut.run=r;await advanceTime(0);
   const geometry=__finalCut.rigGeometry().filter(g=>g.id.startsWith('hydraulic-'));let excess=0,samples=0;
   for(const height of [.95,1.1,1.25,1.4,1.7,2.1,2.35,5]){
    const parts=wingClearanceParts(r.rig,height);
    for(const g of geometry){const points=g.points.filter(v=>v[1]<=height);
     for(let i=0;i<g.triangles.length;i+=3)for(let n=0;n<3;n++){const a=g.points[g.triangles[i+n]],b=g.points[g.triangles[i+(n+1)%3]];if((a[1]<height)!==(b[1]<height)){const t=(height-a[1])/(b[1]-a[1]);points.push(a.map((x,j)=>x+(b[j]-x)*t));}}
     if(!points.length)continue;const part=parts.find(p=>p.id===g.id);if(!part)throw Error(`Missing structure ${g.id} at ${height}`);const center=worldPart(r.rig,part),s=Math.sin(center.yaw),c=Math.cos(center.yaw);
     for(const [x,h,y]of points){const dx=x-center.x,dy=y-center.y;excess=Math.max(excess,Math.abs(dx*c-dy*s)-part.w/2,Math.abs(dx*s+dy*c)-part.d/2);samples++;}
    }
   }
   // Read actual instanced pin-cap centres and compare them to the chassis
   // and rotated deck mounts, independently of the hydraulic layout solver.
   const unit=new THREE.CylinderGeometry(1,1,1,12),points=unit.attributes.position;let top=-1,bottom=-1;
   for(let i=0;i<points.count;i++)if(Math.abs(points.getX(i))<1e-8&&Math.abs(points.getZ(i))<1e-8){if(points.getY(i)>.49)top=i;else if(points.getY(i)<-.49)bottom=i;}
   const mount=(sign,wing)=>{const angle=(1-deployment)*1.15,c=Math.cos(angle),s=Math.sin(angle),w=HYDRAULIC.wing,a=wing?{side:RIG_BANK.hinge+w.side*c-w.height*s,height:RIG_BANK.height+w.side*s+w.height*c,forward:RIG_BANK.forward+w.forward}:HYDRAULIC.base;return [Math.cos(yaw)*sign*a.side+Math.sin(yaw)*a.forward,a.height,50-Math.sin(yaw)*sign*a.side+Math.cos(yaw)*a.forward];};
   let jointError=0;for(const sign of [-1,1])for(const name of ['base','wing']){const g=geometry.find(g=>g.id===`hydraulic-${sign}-${name}-pin`),actual=g.points[top].map((v,i)=>(v+g.points[bottom][i])/2),expected=mount(sign,name==='wing');jointError=Math.max(jointError,Math.hypot(...actual.map((v,i)=>v-expected[i])));}
   unit.dispose();return {deployment,yaw,excess,samples,jointError,meshes:geometry.length,stats:JSON.parse(render_game_to_text()).graphics.hydraulics};
  },{deployment:k/8,yaw});
  assert.equal(result.meshes,152);assert.equal(result.stats.batches,7);assert(result.excess<1e-5,JSON.stringify(result));assert(result.jointError<1e-6,JSON.stringify(result));poses.push(result);
 }
 checks.push('27 actual instanced-geometry poses at eight masonry heights: all cylinder, rod, mount and hose triangles remain contained; pin centres stay attached to chassis/deck mounts');
 await p.evaluate(()=>{Object.assign(__finalCut.run.rig,{yaw:0,deployment:1,phase:'announce',age:2.5});Object.assign(__finalCut.run.player,{x:3.6,y:55.2,yaw:Math.atan2(-.7,-4.2),pitch:.12});});
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot(`extended-${width}`);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.setViewportSize({width:2560,height:1600});for(const deployment of [.5,0]){await p.evaluate(d=>{__finalCut.run.rig.deployment=d;__finalCut.run.rig.age=d*2.5;Object.assign(__finalCut.run.player,{x:2.7,y:55,yaw:Math.atan2(-1,-4),pitch:-.05});},deployment);await shot(`fold-${deployment}`);}
 // The real announce clock drives the same mount geometry, including pause.
 await p.evaluate(()=>{Object.assign(__finalCut.run.rig,{x:30,y:50,yaw:-Math.PI/2,phase:'announce',age:0,deployment:0});Object.assign(__finalCut.run.player,{x:10,y:38,yaw:0,pitch:0});});await tick(0);const initial=(await read()).graphics.hydraulics.sides[0].extension;await tick(1000);const partial=(await read()).graphics.hydraulics.sides[0].extension;assert(partial>initial);
 await p.keyboard.press('Escape');await tick(0);const frozen=await p.evaluate(()=>JSON.stringify(__finalCut.rigGeometry()));await tick(1200);assert.equal(await p.evaluate(()=>JSON.stringify(__finalCut.rigGeometry())),frozen);await p.click('#primary');await tick(1600);assert.equal((await read()).rig.deployment,1);
 checks.push('Actual announce/deployment extends the mechanism; actual pause freezes every rendered part and resume finishes deployment');
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.rig,{x:12.7,y:74,yaw:-Math.PI/2,direction:-1,phase:'pass',deployment:1});Object.assign(r.player,{x:16,y:81,yaw:Math.atan2(-4,-7),pitch:.12});__finalCut.run=r;});await tick(100);assert((await read()).won);await tick(3500);await shot('collapse');
 const geometry=await p.evaluate(()=>__finalCut.rigGeometry().filter(g=>g.id.startsWith('hydraulic-'))),state=await read();assert.notEqual(state.graphics.hydraulics.sides[0].length,state.graphics.hydraulics.sides[1].length);
 await p.keyboard.press('Escape');await tick(0);await p.reload({waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');await tick(0);
 const restored=await p.evaluate(()=>__finalCut.rigGeometry().filter(g=>g.id.startsWith('hydraulic-')));let maxRestore=0;for(let i=0;i<geometry.length;i++)for(let k=0;k<geometry[i].points.length;k++)for(let a=0;a<3;a++)maxRestore=Math.max(maxRestore,Math.abs(geometry[i].points[k][a]-restored[i].points[k][a]));assert(maxRestore<1e-6);
 await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.locator('[data-campaign=reducedMotion]').check();await p.click('#primary');await p.evaluate(()=>Object.assign(__finalCut.run.player,{x:16,y:81,yaw:Math.atan2(-4,-7),pitch:.12}));await tick(0);await shot('collapse-reduced');
 const stable=(await read()).graphics;for(let k=0;k<16;k++){await p.evaluate(k=>__finalCut.run.player.yaw=k*Math.PI/8,k);await tick(100);}const warm=(await read()).graphics;for(let k=0;k<16;k++){await p.evaluate(k=>__finalCut.run.player.yaw=k*Math.PI/8,k);await tick(100);}const end=(await read()).graphics;assert.equal(warm.geometries,end.geometries);assert.equal(warm.textures,end.textures);assert.equal(stable.hydraulics.batches,end.hydraulics.batches);
 checks.push(`Live asymmetric collapse, actual reload and reduced-motion setting retain attached mechanisms; maximum geometry restoration error ${maxRestore} m; repeated warmed rotations keep resources stable`);
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,checks,poses,maxRestore,states,errors},null,2));console.log(JSON.stringify({passed:true,checks,poses:poses.length,shots:states.length,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
