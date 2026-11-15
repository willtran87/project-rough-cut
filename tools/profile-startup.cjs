const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:1280,height:720}});
 try{
  await p.goto('http://127.0.0.1:4187');const c=await p.context().newCDPSession(p);await c.send('Profiler.enable');await c.send('Profiler.start');
  await p.locator('canvas').click();await p.keyboard.press('Space');await p.keyboard.press('Enter');
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
  const {profile}=await c.send('Profiler.stop');fs.writeFileSync('output/gameplay-intelligence/startup.cpuprofile',JSON.stringify(profile));
  const totals=new Map(),nodes=new Map(profile.nodes.map(n=>[n.id,n]));for(let i=0;i<profile.samples.length;i++){const n=nodes.get(profile.samples[i]),f=n.callFrame,key=f.functionName+' '+f.url.split('/').pop()+':'+(f.lineNumber+1);totals.set(key,(totals.get(key)||0)+profile.timeDeltas[i]/1000);}
  const top=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,25);console.log(JSON.stringify(top,null,2));fs.writeFileSync('output/gameplay-intelligence/startup-cpu.json',JSON.stringify(top,null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
