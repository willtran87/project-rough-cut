const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base='output/level-one-hand-finish',read=dir=>JSON.parse(fs.readFileSync(`${base}/${dir}/report.json`));
const before=read('phone-before-native'),after=read('phone-native'),software=read('phone-software');
for(const r of [before,after,software]){assert(r.passed);assert.deepEqual(r.errors,[]);}
const {phone:oldPhone,...oldWorld}=before.inventory,{phone:newPhone,...newWorld}=after.inventory;
assert.deepEqual(newWorld,oldWorld,'World, lanterns, lights and collisions unchanged');
assert.equal(newPhone.length,oldPhone.length);
for(const i of [0,1,2,newPhone.length-1])assert.deepEqual(newPhone[i],oldPhone[i],'Phone shell, speaker and screen unchanged');
assert.deepEqual(after.screen,before.screen);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(hash(`${base}/phone-before-native/age-6.21.jpg`),hash(`${base}/phone-native/age-6.21.jpg`),'World image unchanged with hand stowed');
for(const r of [after,software]){
 assert.equal(r.grip.blocked,0);assert(r.grip.backContactGaps.every(g=>g<.004));assert.equal(r.grip.handDraws,before.grip.handDraws);
 for(const v of r.views){const old=before.views.find(o=>o.name===v.name);assert(old);assert.equal(v.visible,old.visible);assert.deepEqual(v.arrival,old.arrival);}
}
const oldClub=read('club-before-native'),newClub=read('club-lit-native'),softClub=read('club-software');
for(const r of [newClub,softClub]){assert(r.passed);assert.deepEqual(r.errors,[]);assert.equal(r.views.length,oldClub.views.length);for(let i=0;i<r.views.length;i++)for(const field of ['name','craft','flight','roll','aim'])assert.deepEqual(r.views[i][field],oldClub.views[i][field],`Unchanged club/ball state: ${field}`);}
const result={passed:true,phoneViewsPerRenderer:18,clubViewsPerRenderer:newClub.views.length,worldUnchanged:true,stowedPixelsIdentical:true,clubAndBallStatesIdentical:true,phoneGrip:{before:before.grip,after:after.grip},addedPhoneTriangles:after.grip.handTriangles-before.grip.handTriangles,errors:[]};
fs.writeFileSync(`${base}/comparison.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
