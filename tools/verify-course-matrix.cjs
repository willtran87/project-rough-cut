/* Full ordinary-input completion matrix; no state cheats. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const out=path.resolve(process.argv[2]||'output/a-grade-closure/matrix');fs.mkdirSync(out,{recursive:true});
const sourceHash=crypto.createHash('sha256').update(fs.readFileSync('web/game.js')).digest('hex');
const cases=[];
for(const [variant,flag] of [['standard',''],['east','--east'],['closing','--west']])
 for(const route of ['shed','drain'])for(const [pressure,pflag] of [['steady','--steady'],['standard',''],['relentless','--relentless']])
  {
   const tactics = variant==='closing'&&route==='drain' || variant==='standard'&&route==='drain'&&pressure==='steady'
    ? ['--side-lure','--skip-bonus']
    : variant==='east'&&route==='shed'&&pressure==='steady' ? ['--side-lure','--pre-access']
    : variant==='east'&&route==='shed'&&pressure==='standard' ? ['--late-access','--side-lure','--skip-bonus','--cautious']
    : variant==='east'&&route==='drain'&&pressure==='relentless' ? ['--side-lure','--cautious'] : [];
   cases.push({id:`${variant}-${route}-${pressure}`,args:[flag,`--${route}`,pflag,...tactics].filter(Boolean)});
  }
const results=[];
async function worker(){while(cases.length){const test=cases.shift(),folder=path.join(out,test.id);fs.mkdirSync(folder,{recursive:true});
 const log=fs.createWriteStream(path.join(folder,'run.log'));
 const code=await new Promise(resolve=>{const child=spawn(process.execPath,['tools/play-complete-route.cjs',folder,...test.args],{windowsHide:true});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});child.on('error',()=>resolve(-1));child.on('close',resolve);});log.end();
 let final=null;try{const data=JSON.parse(fs.readFileSync(path.join(folder,'route.json'),'utf8'));final={sourceHash:data.sourceHash,mode:data.final.mode,route:data.evidence?.outcome,checks:data.final.checks.completed,evidence:data.evidence?.evidence?.seconds};}catch{}
 results.push({id:test.id,tactics:test.args,passed:code===0&&final?.sourceHash===sourceHash,exitCode:code,...final});
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({sourceHash,completed:results.length,total:18,passed:results.length===18&&results.every(r=>r.passed),results},null,2));
 console.log(`${results.length}/18 ${test.id}: ${code===0?'PASS':'FAIL'}`);
}}
const workerCount=process.argv.includes('--four-workers')?4:2;
Promise.all(Array.from({length:workerCount},()=>worker())).then(()=>{if(results.some(r=>!r.passed))process.exitCode=1;}).catch(e=>{console.error(e);process.exitCode=1;});
