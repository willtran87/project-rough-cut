const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=`output/under-green/visual-pass87/ghosts/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],rows=[];
try{const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=26.3;r.elapsed=10;r.joe.phase='absent';Object.assign(r.player,{x:0,y:19,yaw:0,pitch:-.08,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();});
for(const age of [0,1,2.2,4.5,7.5,8.5,9.2]){await p.evaluate(async age=>{__underGreen.run.elapsed=10+age;__underGreen.run.time=26.3+age;advanceTime(0);await __underGreen.whenPresented();},age);const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({age,ghost:s.graphics.ghost,resolution:s.graphics.resolution});await p.screenshot({path:`${out}/ghost-${age}.jpg`,quality:91});}
assert.equal(rows[0].ghost.alpha,0);assert(rows[2].ghost.visible&&rows[3].ghost.visible);assert(rows[5].ghost.visible&&rows[5].ghost.alpha<rows[3].ghost.alpha);assert.notDeepEqual(rows[2].ghost.site,rows[5].ghost.site);assert.equal(rows[6].ghost.visible,false);assert(rows.every(r=>r.ghost.error===null));assert.deepEqual(errors,[]);
fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
