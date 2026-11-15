const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/level-one-visual-pass/'+(software?'detail-software':'detail');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__v={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__vScene=()=>({world,currentData,courseVisualDetail});'}));
 const draw=()=>p.evaluate(async()=>{__v.render();await RCScene3D.whenPresented();return RCScene3D.stats().visualDetail;});
 try{
  await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__v);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__v,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol'});Object.assign(s.player,{x:0,y:185,yaw:0,pitch:-.12});});await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:150000});
  const lightReport=await p.evaluate(()=>{const list=[];__vScene().world.traverse(o=>{if(o.isLight)list.push({name:o.name,type:o.type,color:o.color.getHex(),intensity:o.intensity});});return list;});assert.equal(lightReport.filter(l=>l.name==='CourseWarmWindowSpill').length,2);assert.equal(lightReport.find(l=>l.type==='AmbientLight').intensity,.005);
  let active=null;
  for(const [startX,y]of [[15,190],[-65,190],[-55,60],[25,280],[25,540]]){
   for(let i=0;i<45;i++){
    await p.evaluate(({x,y})=>{const s=__v.state,j=s.hole.joe;j.x=x;j.y=y;j.effectHeading=0;j.effectSpeed=7;j.walkMeters=(j.walkMeters||0)+.45;s.hole.elapsed+=.06;Object.assign(s.player,{x:x-16,y:y-16,yaw:Math.atan2(16*.1152,16*.16),pitch:-.15});},{x:startX+i*.45,y});
    const stats=await draw();if(i>20&&stats.clippings>0&&stats.cutStrips>4){active=stats;break;}
   }if(active)break;
  }
  assert(active,'Mower must emit clippings and leave cut grass on real course turf');await p.screenshot({path:out+'/mowing-2560.png'});
  const snapshot=await p.evaluate(()=>{const root=__vScene().world.getObjectByName('CourseMowerClippings');return Array.from(root.instanceMatrix.array);});await draw();assert.deepEqual(await p.evaluate(()=>Array.from(__vScene().world.getObjectByName('CourseMowerClippings').instanceMatrix.array)),snapshot,'Repeated render cannot advance particles');
  await p.evaluate(()=>{__v.state.mode='paused';__v.state.hole.elapsed+=1;});const pause=await draw();assert.equal(pause.clock,active.clock);await p.evaluate(()=>__v.state.mode='first_hole');
  await p.evaluate(()=>__v.state.reducedMotion=true);const reduced=await draw();assert.equal(reduced.clippings,0);assert.equal(reduced.clock,0);await p.evaluate(()=>__v.state.reducedMotion=false);
  for(let i=0;i<130;i++){await p.evaluate(()=>{__v.state.hole.joe.effectSpeed=0;__v.state.hole.elapsed+=.1;});await draw();}const expired=await draw();assert.equal(expired.clippings,0);assert.equal(expired.cutStrips,0);
  const views=[['cold-floodlight',0,200,0,-.13],['warm-service',-80,210,-1.3,0],['pond-oak',80,194,1.1,.18],['range-pennant',80,530,.9,.15],['shed-frame',-65,650,-.65,.10]];
  for(const [name,x,y,yaw,pitch]of views){await p.evaluate(v=>Object.assign(__v.state.player,v),{x,y,yaw,pitch});await draw();await p.screenshot({path:out+'/'+name+'-2560.png'});}
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(()=>Object.assign(__v.state.player,{x:0,y:200,yaw:0,pitch:-.13}));await draw();await p.screenshot({path:out+'/cold-floodlight-'+width+'.png'});}
  const state=await p.evaluate(()=>RCScene3D.stats());assert.equal(state.pathLanterns.pairs.length*2,28);assert(state.joeModel.handError<.005);assert.deepEqual(errors,[]);
  const report={passed:true,software,active,expired,lights:lightReport,lanterns:28,handError:state.joeModel.handError,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,software,active,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
