const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/pursuit-build-soak';
fs.mkdirSync(out,{recursive:true});
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files=[];
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=dir+'/'+entry.name;if(entry.isDirectory())visit(f);else files.push(f);}}
visit('web');visit('assets');
files.push('tools/profile-under-green-soak.cjs','tools/analyze-under-green-soak.cjs','tools/probe-under-green-folded.mjs');
const snapshot={at:new Date().toISOString(),files:Object.fromEntries(files.map(f=>[f,hash(f)]))};
if(process.argv.includes('--compare')){
 const before=JSON.parse(fs.readFileSync(out+'/source-before.json'));
 const changed=[...new Set([...Object.keys(before.files),...files])].filter(f=>before.files[f]!==snapshot.files[f]);
 const dependencies=new Set();
 function follow(file){
  if(dependencies.has(file)||!fs.existsSync(file))return;
  dependencies.add(file);
  for(const match of fs.readFileSync(file,'utf8').matchAll(/['"](\.{1,2}\/[^'"]+\.(?:js|css))['"]/g))follow(path.posix.normalize(path.posix.join(path.posix.dirname(file),match[1])));
 }
 follow('web/under-green.html');
 const measuredChanges=changed.filter(f=>dependencies.has(f)||f.startsWith('assets/')||f.startsWith('tools/'));
 fs.writeFileSync(out+'/dependencies.json',JSON.stringify({files:[...dependencies].sort(),measuredChanges,scope:'Conservative local JS/CSS literal graph from under-green.html, plus every asset and profiling harness file in the content snapshot. Navigation links and bare import-map names are excluded; all web files remain in the wider snapshot.'},null,2));
 fs.writeFileSync(out+'/source-after.json',JSON.stringify(snapshot));fs.writeFileSync(out+'/source-changes.json',JSON.stringify({changed},null,2));
 console.log(JSON.stringify({files:files.length,dependencies:dependencies.size,changed,measuredChanges}));
}else{
 if(fs.existsSync(out+'/source-before.json'))throw Error('Choose a fresh output directory; preserve the existing baseline');
 fs.writeFileSync(out+'/source-before.json',JSON.stringify(snapshot));console.log(JSON.stringify({files:files.length,at:snapshot.at}));
}
