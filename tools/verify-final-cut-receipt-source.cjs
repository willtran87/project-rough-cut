// Focused source-chapter integration fixture; not a full ordinary-input route.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/final-cut/announcement';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],checks=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__receiptSource={state,resetFirstHole,render,NIGHT_ORDER_ACTIONS,SHED_EXIT,DRAIN_EXIT,beginEscapeFiling};\n  window.advanceTime = (milliseconds) => {')}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),receipt=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.night-order-receipts.v1')||'null'));
 await p.goto('http://127.0.0.1:4187/');await p.waitForFunction(()=>window.__receiptSource);await p.evaluate(()=>{const t=__receiptSource;t.resetFirstHole();Object.assign(t.state,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});t.state.hole.tutorialVisible=false;t.state.hole.practiceDrill.active=false;t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
 async function fileStations(){
  for(let index=0;index<3;index++){
   await p.evaluate(index=>{const t=__receiptSource,s=t.state,h=s.hole,a=t.NIGHT_ORDER_ACTIONS[index];s.keys.clear();Object.assign(h,{elapsed:100,controlHintTimer:0,zoneBannerTimer:0,detection:0});Object.assign(h.joe,{x:100,y:30,mode:'patrol',patrolPause:9999});h.quietLog=null;h.rebuild.forcedCrouch=false;Object.assign(s.player,{x:a.x,y:a.y-9,yaw:0,pitch:-.15});},index);await tick(17);
   await p.keyboard.press(index===1?'1':'e');await tick(index===1?1650:17);
   assert(await p.evaluate(index=>__receiptSource.state.hole.nightOrderActionsCompleted.includes(__receiptSource.NIGHT_ORDER_ACTIONS[index].id),index));
  }
 }
 await fileStations();assert.equal(await receipt(),null);checks.push('Actual bell Use, completed quiet log and release Use do not publish a completed-chapter receipt prematurely');
 await p.evaluate(()=>{const t=__receiptSource,s=t.state;Object.assign(s.hole,{keyCollected:true});Object.assign(s.hole.joe,{x:0,y:20,mode:'patrol',patrolPause:9999});Object.assign(s.player,{x:t.SHED_EXIT.x,y:t.SHED_EXIT.y,yaw:0});if(!t.beginEscapeFiling('shed'))throw Error('Filing fixture rejected');});
 await p.keyboard.down('w');await tick(100);await p.keyboard.up('w');assert.equal(await receipt(),null);
 await p.evaluate(()=>{const t=__receiptSource;Object.assign(t.state.player,{x:t.SHED_EXIT.x,y:t.SHED_EXIT.y});if(!t.beginEscapeFiling('shed'))throw Error('Retry filing rejected');});await tick(6000);
 let value=await receipt();assert.deepEqual(value.routes.shed.stations,['audit-bell','field-log','release-review']);assert.equal(await p.evaluate(()=>__receiptSource.state.mode),'victory');checks.push('Interrupted filing produces no receipt; actual filing/seal completion writes the three earned station IDs');
 await p.evaluate(()=>{const t=__receiptSource;t.resetFirstHole();Object.assign(t.state,{mode:'first_hole',manualTime:true});Object.assign(t.state.hole,{tutorialVisible:false,rehearsal:true});t.state.hole.practiceDrill.active=false;});await fileStations();
 await p.evaluate(()=>{const t=__receiptSource,s=t.state;s.hole.drainUnlocked=true;Object.assign(s.hole.joe,{x:0,y:20,mode:'patrol',patrolPause:9999});Object.assign(s.player,{x:t.DRAIN_EXIT.x,y:t.DRAIN_EXIT.y,yaw:0});if(!t.beginEscapeFiling('drain'))throw Error('Rehearsal filing rejected');});await tick(6000);assert.deepEqual(await receipt(),value);checks.push('A rehearsal completion cannot publish another branch or overwrite the real receipt');
 await p.goto('http://127.0.0.1:4187/final-cut.html?test&from=garage');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});const finale=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.deepEqual(finale.stationReceipt.stations,value.routes.shed.stations);assert.match(finale.announcement.board,/FIELD LOG · RECEIVED/);checks.push('Real source receipt survives navigation and is consumed by the garage finale without re-seeding storage');
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/source-integration.json`,JSON.stringify({passed:true,checks,receipt:value,errors},null,2));console.log(JSON.stringify({passed:true,checks,receipt:value,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
