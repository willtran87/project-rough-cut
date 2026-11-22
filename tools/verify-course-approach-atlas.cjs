const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const out='output/level-one-approach-wear',b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage(),errors=[],rows=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__atlasGame={state,resetFirstHole,render,variants:RUN_VARIANTS};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__atlasScene=()=>({currentData});'}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__atlasGame);
  for(const id of ['standard_review','eastern_exception','closing_shift']){
   await p.evaluate(id=>{const t=__atlasGame;t.resetFirstHole(t.variants.find(v=>v.id===id));t.state.mode='first_hole';t.state.manualTime=true;Object.assign(t.state,{transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true});Object.assign(t.state.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});t.state.hole.practiceDrill.active=false;t.state.hole.engagement.experience.arrival.phase='skipped';t.render();advanceTime(17);},id);
   await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
   const row=await p.evaluate(async id=>{
    const data=__atlasScene().currentData,{terrainBakeKey}=await import('./baked-terrain.js'),{paintApproachWear,approachWearMarks}=await import('./course-approach-wear.js');
    const manifest=await fetch('./assets/baked/terrain.json').then(r=>r.json()),oldKey=await terrainBakeKey(data,.16,.1152,false),newKey=await terrainBakeKey(data,.16,.1152,true);
    const load=async file=>{if(!file)throw Error('Missing terrain bake '+id);const img=new Image();img.src='./assets/baked/'+file;await img.decode();const c=document.createElement('canvas');c.width=1536;c.height=4096;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);return {c,g};};
    const old=await load(manifest[oldKey]),next=await load(manifest[newKey]),before=old.g.getImageData(0,0,1536,4096).data;
    const tx=x=>(x+24)/48*1536,ty=z=>(z+120)/130*4096;
    paintApproachWear(old.g,data,tx,ty,.1152,.16);
    const expected=old.g.getImageData(0,0,1536,4096).data,actual=next.g.getImageData(0,0,1536,4096).data;
    let mismatches=0,changedPixels=0,outside=0;const marks=[...approachWearMarks(data,.1152,.16)];
    for(let i=0;i<actual.length;i+=4){let changed=false;for(let c=0;c<4;c++){if(expected[i+c]!==actual[i+c])mismatches++;if(before[i+c]!==actual[i+c])changed=true;}
     if(changed){changedPixels++;const x=(i/4)%1536,z=Math.floor(i/4/1536);if(!marks.some(m=>{const r=Math.hypot(m.w,m.d)*1.26;return x>=Math.floor(tx(m.x-r))&&x<Math.ceil(tx(m.x+r))&&z>=Math.floor(ty(m.z-r))&&z<Math.ceil(ty(m.z+r));}))outside++;}
    }
    // Each exit belongs to the paint cache contract. Moving either must miss
    // the old bake, while the legacy art mode retains its original key.
    const move=(key)=>({...data,[key]:{...data[key],x:data[key].x+1}});
    return {id,oldKey,newKey,oldFile:manifest[oldKey],newFile:manifest[newKey],marks:marks.length,changedPixels,mismatches,outside,
     shedInvalidates:await terrainBakeKey(move('shed'),.16,.1152,true)!==newKey,drainInvalidates:await terrainBakeKey(move('drain'),.16,.1152,true)!==newKey,
     legacyShedStable:await terrainBakeKey(move('shed'),.16,.1152,false)===oldKey,baked:RCScene3D.stats().terrainBaked};
   },id);
   assert.equal(row.mismatches,0,id+' procedural painter must exactly match baked pixels');assert.equal(row.outside,0,id+' unrelated terrain must be identical');assert(row.changedPixels>0&&row.changedPixels<10000);assert.equal(row.marks,63);assert(row.shedInvalidates&&row.drainInvalidates&&row.legacyShedStable&&row.baked);rows.push(row);console.log(JSON.stringify(row));
  }
  assert.deepEqual(errors,[]);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/atlas-proof.json',JSON.stringify({passed:true,rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
