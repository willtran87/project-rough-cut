// Controlled viewpoints validate fixed model orientation; objective completion
// is exercised separately by verify-win-objectives.cjs using real E inputs.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/runner-route-refinement/stations';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__faces={state,resetFirstHole,render,obstacleAtPosition,variants:RUN_VARIANTS,actions:NIGHT_ORDER_ACTIONS,key:activeKeyPoint,valve:activeSprinklerPoint,reviews:activeSprintReviews};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');
  await p.waitForFunction(()=>window.__faces&&JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:90000});
  for(let variant=0;variant<3;variant++){
   await p.evaluate(i=>{const t=__faces,s=t.state;t.resetFirstHole(t.variants[i]);Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});s.hole.tutorialVisible=false;t.render();},variant);
   await p.waitForFunction(()=>RCScene3D.stats().ready&&!RCScene3D.isPreparing(),null,{timeout:90000});
   const targets=await p.evaluate(()=>[...__faces.actions,{...__faces.key(),id:'key'},{...__faces.valve(),id:'valve'},...__faces.reviews()]);
   const facing=await p.evaluate(()=>[...RCScene3D.stats().stationVisuals,...RCScene3D.stats().accessVisuals].map(({id,facing})=>({id,facing})));
   for(const target of targets){
    const angle=facing.find(x=>x.id===target.id)?.facing;assert(Number.isFinite(angle),target.id+' has a fixed facing');assert(Math.abs(angle-Math.atan2(-target.x*.72,target.y))<1e-10,target.id+' faces the starting position');
    const views=['front','side','reach'];
    for(const view of views){
     // Look directly at the fixture from the entrance-facing side, alternate side,
     // and close interaction position. No camera-facing orientation updates.
     const position=await p.evaluate(({target,angle,view})=>{
      // Boundary fixtures have no walkable 90-degree side. Use a reachable
      // three-quarter view there instead of teleporting into scenery.
      const offsets=view==='side'?[Math.PI/2,-Math.PI/2,Math.PI/3,-Math.PI/3,Math.PI/4,-Math.PI/4]:[0,Math.PI/12,-Math.PI/12,Math.PI/6,-Math.PI/6,Math.PI/4,-Math.PI/4];
      for(const d of view==='reach'?[8]:[28,22,16,12])for(const offset of offsets){
       const a=angle+offset,x=target.x+Math.sin(a)*d/.72,y=target.y-Math.cos(a)*d;
       if(x<-110||x>110||y<2||y>706||__faces.obstacleAtPosition(x,y,2.4))continue;
       let clear=true;for(let step=0;step<8;step++){const t=step/10;if(__faces.obstacleAtPosition(x+(target.x-x)*t,y+(target.y-y)*t,.3)){clear=false;break;}}
       if(clear)return {x,y,d,offset};
      }
      return null;
     },{target,angle,view});assert(position,`${variant} ${target.id} ${view}: clear camera/interaction access`);
     const {x,y}=position;
     await p.evaluate(({x,y,target})=>{const t=__faces,s=t.state,h=s.hole;Object.assign(s.player,{x,y,yaw:Math.atan2((target.x-x)*.72,target.y-y),pitch:-.12});Object.assign(h.joe,{x:target.x>0?-110:110,y:target.y>360?20:700,mode:'patrol',patrolPause:9999});h.detection=0;h.hasLineOfSight=false;h.statusRequest.active=false;h.messageTimer=h.zoneBannerTimer=0;s.keys.clear();t.render();},{x,y,target});
     await p.evaluate(async()=>{await RCScene3D.whenPresented();__faces.render();await RCScene3D.whenPresented();});await p.waitForTimeout(80);
     const unchanged=await p.evaluate(()=>[...RCScene3D.stats().stationVisuals,...RCScene3D.stats().accessVisuals].map(({id,facing})=>({id,facing})));
     assert.deepEqual(unchanged,facing,'Models must not turn with the camera');
     await p.screenshot({path:`${out}/${variant}-${target.id}-${view}.png`});
    }
    results.push({variant,id:target.id,x:target.x,y:target.y,facingDegrees:Math.round(angle*180/Math.PI),views});
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:true,fixtures:results.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
