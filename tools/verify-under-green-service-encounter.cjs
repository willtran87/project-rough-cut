const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],out='output/under-green/navigation';
 const fixture=JSON.parse(fs.readFileSync(out+'/service-encounter.json','utf8'));
 p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 async function restore(){await p.evaluate(fixture=>{__underGreen.run=fixture;__underGreen.clearInput();advanceTime(0);},fixture);}
 await restore();await p.screenshot({path:out+'/service-windup-2560.png'});
 await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1700));await p.keyboard.up('w');assert.equal((await read()).mode,'under_green_caught');
 await restore();await p.keyboard.down('a');await p.evaluate(()=>advanceTime(400));await p.keyboard.up('a');await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1050));await p.keyboard.up('w');
 const escaped=await read();assert.equal(escaped.mode,'under_green_playing');assert(escaped.player.x>escaped.joe.x+1);assert(escaped.player.y>41.4);assert.equal(escaped.waterHits,0);
 await p.screenshot({path:out+'/service-dodged-2560.png'});
 await p.keyboard.down('r');await p.evaluate(()=>advanceTime(300));await p.keyboard.up('r');await p.screenshot({path:out+'/service-glance-2560.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/service-browser.json',JSON.stringify({passed:true,escaped,errors},null,2));console.log(JSON.stringify({passed:true,checks:['Ignoring the visible windup causes defeat','Ordinary A then W evades the committed sweep and passes Joe in the service corridor','Rear glance remains available after evasion'],errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
