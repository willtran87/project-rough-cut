const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base='output/level-one-arrival-composition';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const results=[];
for(const renderer of ['native','software']){
 const read=version=>JSON.parse(fs.readFileSync(`${base}/${version}-${renderer}/report.json`));
 const before=read('before'),after=read('after');
 assert(before.passed&&after.passed);
 assert.deepEqual(after.inventory,before.inventory,'World, sources, lanterns, collision and phone geometry unchanged');
 assert.equal(after.views.length,18);assert.equal(before.views.length,18);
 assert.deepEqual(after.errors,[]);assert.deepEqual(before.errors,[]);
 assert.equal(hash(`${base}/before-${renderer}/age-6.21.jpg`),hash(`${base}/after-${renderer}/age-6.21.jpg`),'Stowed scene exactly unchanged');
 const held=report=>report.views.find(v=>v.name==='age-2.6').bounds;
 const area=b=>(b.maxX-b.minX)*(b.maxY-b.minY)/4;
 const oldArea=area(held(before)),newArea=area(held(after));
 assert(newArea<oldArea*.65,'Held phone covers substantially less of the route');
 const end=report=>report.views.find(v=>v.name==='age-6.19').bounds.maxY;
 assert(end(after)<-1&&end(before)>-1,'Stow finishes below viewport before the original expiry');
 assert.equal(after.screen.colors,8);assert(after.screen.opaque);
 assert.deepEqual(after.warm,after.stable);
 results.push({renderer,matchedViews:18,inventoryIdentical:true,stowedSceneIdentical:true,oldArea,newArea,areaReduction:1-newArea/oldArea,endTopBefore:end(before),endTopAfter:end(after),screen:after.screen,errors:after.errors});
}
const oldPaper=fs.readFileSync(`${base}/baseline-source/course-station-paper.js`,'utf8');
const newPaper=fs.readFileSync('web/course-station-paper.js','utf8');
assert.equal(newPaper.replace('// Physical screens and paperwork share the same authored whole-pixel capitals.\nexport {GLYPHS as COURSE_PIXEL_GLYPHS};\n',''),oldPaper,'Paper art changes only by exporting its existing alphabet');
fs.writeFileSync(`${base}/comparison.json`,JSON.stringify({passed:true,results,paperArtUnchanged:true},null,2));
console.log(JSON.stringify({passed:true,results,paperArtUnchanged:true}));
