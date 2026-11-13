const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const {createSoftwareFrameBudget}=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('web/software-frame-budget.js')).toString('base64'));
 const b=createSoftwareFrameBudget(),feed=(n,ms)=>{for(let i=0;i<n;i++)b.observe(ms);};
 feed(6,200);assert.equal(b.scale(),.75,'Cold samples are ignored');
 feed(7,65);assert.equal(b.scale(),.75);feed(1,65);assert.equal(b.scale(),.625);
 feed(24,120);assert.equal(b.scale(),.625,'Cooldown prevents repeated reallocations');
 feed(8,120);assert.equal(b.scale(),.5);feed(100,120);assert.equal(b.scale(),.5);
 feed(59,30);assert.equal(b.scale(),.5);feed(1,30);assert.equal(b.scale(),.625);
 feed(60,30);assert.equal(b.scale(),.625);feed(60,30);assert.equal(b.scale(),.75);
 for(let i=0;i<100;i++){b.observe(140);b.observe(55);}assert.equal(b.scale(),.75,'Isolated spikes do not lower quality');
 for(const n of [NaN,Infinity,-1,0])b.observe(n);assert.equal(b.scale(),.75);
 const mixed=createSoftwareFrameBudget();for(let i=0;i<6;i++)mixed.observe(20);
 for(let i=0;i<12;i++)mixed.observe(i%3===2?55:68);
 assert.equal(mixed.scale(),.75,'Mixed load needs eight net slow frames');
 for(let i=0;i<8;i++)mixed.observe(i%3===2?55:68);
 assert.equal(mixed.scale(),.625,'An occasional faster frame no longer masks sustained overload');
 // Deterministic pixel-bound workload: 90 ms at 960x540, 62.5 ms at
 // 800x450 and 40 ms at 640x360. Models sustained software contention;
 // these are synthetic costs, not reported browser benchmark results.
 function trace(create,cost){const budget=create(),scales=[],ms=[];for(let i=0;i<900;i++){const scale=budget.scale(),time=cost*(scale/.75)**2;scales.push(scale);ms.push(time);budget.observe(time);}return {budget,changes:budget.stats().changes,slowFrames:ms.filter(t=>t>60).length,finalScale:budget.scale()};}
 const after=trace(createSoftwareFrameBudget,90);
 assert.equal(after.changes,2);assert.equal(after.slowFrames,46);assert.equal(after.finalScale,.5);
 for(let i=0;i<240;i++)after.budget.observe(20*(after.budget.scale()/.75)**2);
 assert.equal(after.budget.scale(),.75,'Recovered headroom restores full software quality');
 assert.equal(trace(createSoftwareFrameBudget,38).changes,0,'Affordable scenes retain maximum software quality');
 const tunnel=trace(()=>createSoftwareFrameBudget({slowMs:38,recoverMs:26}),48);
 assert.equal(tunnel.finalScale,.625,'The tunnel target settles at the affordable middle buffer');
 assert.equal(tunnel.changes,1,'The lower target does not oscillate');
 for(let i=0;i<240;i++)tunnel.budget.observe(16*(tunnel.budget.scale()/.75)**2);
 assert.equal(tunnel.budget.scale(),.75,'The configured target still recovers full detail');
 assert.throws(()=>createSoftwareFrameBudget({slowMs:30,recoverMs:40}));
 assert.throws(()=>createSoftwareFrameBudget({slowMs:NaN}));
 const steps=[.75,.625,.5,.375],wide=createSoftwareFrameBudget({slowMs:38,recoverMs:26,scales:steps});
 steps[3]=.01; // Caller mutation must not silently change the quality policy.
 for(let i=0;i<180;i++)wide.observe(80);
 assert.equal(wide.scale(),.375);assert.equal(wide.stats().minScale,.375);assert.equal(wide.stats().changes,3);
 for(let i=0;i<360;i++)wide.observe(10);
 assert.equal(wide.scale(),.75,'Sustained headroom restores all custom quality steps');
 for(const scales of [[],[.5,.75],[.75,.75],[0],[-1],[NaN],[Infinity],[1.1],null])assert.throws(()=>createSoftwareFrameBudget({scales}));
 const report={passed:true,after:{changes:after.changes,slowFrames:after.slowFrames},recoveredScale:after.budget.scale()};

 console.log('PASS: cold samples, sustained/mixed load, isolated spikes, floor, cooldown, recovery and no resolution pumping',JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1;});
