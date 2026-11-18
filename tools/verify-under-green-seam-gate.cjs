const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 const rows=await p.evaluate(()=>{const rows=[];for(let i=0;i<=20;i++){__underGreen.run.gate=i/20;advanceTime(0);rows.push({fraction:i/20,...__underGreen.inspectGateTravel()});}return rows;});
 for(const r of rows){assert.deepEqual(r.hits,[]);assert.deepEqual(r.boxHits,[]);}assert.deepEqual(errors,[]);
 fs.writeFileSync('output/under-green/visual-upgrade/pass32-source/gate-audit.json',JSON.stringify({passed:true,rows,errors},null,2));console.log(JSON.stringify({passed:true,fractions:rows.length}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
