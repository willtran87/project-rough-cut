const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),preview=process.argv.includes('--preview'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass58/${software?'software':'hardware'}`;
const fixtures=process.argv.includes('--joinery')?[['west-entry',-3.5,12.6,-Math.PI/2,.8],['east-entry',3.5,14.7,Math.PI/2,.75],['under',0,13,0,.65]]:[['approach',0,8,0,.1],['near',0,11,0,.3],['under',0,13,0,.65],['reverse',0,18,Math.PI,.25],['east',3.3,13,Math.PI/2,.6],['west',-3.5,11,-Math.PI/2,.55],['pillar',.1,16,-2.1,.45],['crossing',0,19,0,-.05],['pump-control',-23.4,42,-1,.05],['bunker-control',-29.5,65,Math.PI,.15]];
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],audits=[],errors=[];try{
{const before=false;
 const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await require('./lib/legacy-under-green-probe.cjs').exposeScene(p,'__canopyProbe','scene,renderer,structureMeshes,batchCulling');
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 async function place(f){await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');const assertClear=!solid({x:f[1],y:f[2]},.3);if(!assertClear)throw Error('Solid fixture '+f[0]);const r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
 async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await p.evaluate(()=>JSON.parse(render_game_to_text())),g=s.graphics;rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:{resolution:g.resolution,draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,lights:g.lights}});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
 for(const f of fixtures){await place(f);await shot(f[0]);}
 const audit=await p.evaluate(()=>{__canopyProbe.batchCulling?.restore();const outside=[],missingColors=[];const hash=a=>{let h=2166136261;for(const v of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^v,16777619);return h>>>0;};
  for(const m of __canopyProbe.structureMeshes){const p=m.geometry.attributes.position,idx=m.geometry.index;if(m.material.vertexColors&&!m.geometry.attributes.color)missingColors.push(m.name);
   for(let i=0;i<(idx?.count||p.count);i+=3){const coords=[];let inside=['root','rootStone','rootCrevice'].includes(m.name);for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j,x=p.getX(k),y=p.getY(k),z=p.getZ(k);coords.push(x,y,z);if(x< -5.3||x>5.3||y<2.65||y>4.5||z< -17.4||z> -10.4)inside=false;}if(!inside)outside.push(m.name+':'+hash(new Float32Array(coords)));}
  }outside.sort();return {outsideCount:outside.length,outsideHash:hash(new TextEncoder().encode(outside.join('|'))),missingColors,canopy:JSON.parse(render_game_to_text()).graphics.atmosphere.authoredRoots.galleryCanopy};
 });audits.push(audit);assert.deepEqual(audit.missingColors,[]);
 if(!before&&!preview){
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const f of [fixtures[0],fixtures[3]]){await place(f);await shot(f[0]);}}
  await p.setViewportSize({width:2560,height:1600});await place(fixtures[0]);await p.keyboard.down('c');await p.evaluate(()=>advanceTime(250));await shot('crouch');await p.keyboard.up('c');await p.evaluate(()=>advanceTime(300));await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');
  await place(fixtures[1]);const original=await p.screenshot({type:'png'});await place(fixtures[3]);await place(fixtures[1]);assert(original.equals(await p.screenshot({type:'png'})),'Unstable bark after camera return');
  audit.clearance=await p.evaluate(async()=>{const {solid}=await import('./under-green-course.js'),poses=[];for(const x of [-4.6,-2.5,0,2.5,4.6])for(const y of [9,11,13,15,17]){if(solid({x,y},.3))continue;for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [390/844,844/390])for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5])poses.push({x,y,height,pitch,fov,aspect,yaw});}return {samples:poses.length,hits:__underGreen.inspectCameraClearance(poses).filter(r=>r.hits.length)};});assert.deepEqual(audit.clearance.hits,[]);
  await place(fixtures[0]);await p.keyboard.press('Escape');const elapsed=await p.evaluate(()=>__underGreen.run.elapsed);await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>__underGreen.run.elapsed),elapsed);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#comfort .rc-settings-tabs button',{hasText:'Camera'}).click();await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[0]);await shot('reduced');
 }
 await p.close();
}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,preview,rows,audits,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,outside:audits[0].outsideCount,cameras:audits[0].clearance?.samples}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

