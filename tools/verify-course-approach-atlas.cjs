const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
(async()=>{
 const out='output/level-one-approach-wear',b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage(),errors=[],rows=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/approach-guidance-baseline.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-approach-wear/baseline-source/environment-guidance.js','utf8')}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__atlasGame={state,resetFirstHole,render,variants:RUN_VARIANTS};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__atlasScene=()=>({currentData});'}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__atlasGame);
  for(const id of ['standard_review','eastern_exception','closing_shift']){
   await p.evaluate(id=>{const t=__atlasGame;t.resetFirstHole(t.variants.find(v=>v.id===id));t.state.mode='first_hole';t.state.manualTime=true;t.render();},id);
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
   row.guidance=await p.evaluate(async()=>{
    const THREE=await import('./vendor/three/three.module.js'),current=await import('./environment-guidance.js'),baseline=await import('./approach-guidance-baseline.js'),data=__atlasScene().currentData,results=[];
    for(const craftedPaper of [false,true]){
     const roots=[new THREE.Group(),new THREE.Group()],factories=[baseline,current],guides=roots.map((root,i)=>factories[i].createEnvironmentGuidance(root,data,{scale:.16,xScale:.1152,craftedPaper}));
     const frames=[{completed:[],practiceActive:true},{completed:['audit-bell','field-log','release-review'],hasKey:true,practiceDone:true},{completed:['audit-bell','field-log','release-review'],hasKey:true,valveOpen:true,exitRoute:'shed',exitFiling:true,practiceStage:'already_learned'},{completed:['audit-bell','field-log','release-review'],hasKey:true,valveOpen:true,exitRoute:'drain',sealing:true},{completed:[],practiceActive:true}];
     let differences=0;const a=roots[0].getObjectByName('EnvironmentalGuidance').geometry,b=roots[1].getObjectByName('EnvironmentalGuidance').geometry,removed=a.attributes.position.count-b.attributes.position.count;
     for(const frame of frames){for(const g of guides)g.update(frame);for(const key of ['position','color']){const old=a.attributes[key].array,next=b.attributes[key].array;for(let i=0;i<next.length;i++)if(old[i+removed*3]!==next[i])differences++;}}
     const paperBuffersEqual=!craftedPaper||['position','normal','uv'].every(key=>{const a=roots[0].getObjectByName('CourseDroppedPaper').geometry.attributes[key].array,b=roots[1].getObjectByName('CourseDroppedPaper').geometry.attributes[key].array;return a.length===b.length&&a.every((n,i)=>n===b[i]);});
     results.push({craftedPaper,frames:frames.length,removed,differences,paperBuffersEqual});
     for(const root of roots)root.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();});
    }return results;
   });
   for(const g of row.guidance){assert.equal(g.removed,g.craftedPaper?63*21:0);assert.equal(g.differences,0);assert(g.paperBuffersEqual);}
   assert.equal(row.mismatches,0,id+' procedural painter must exactly match baked pixels');assert.equal(row.outside,0,id+' unrelated terrain must be identical');assert(row.changedPixels>0&&row.changedPixels<10000);assert.equal(row.marks,63);assert(row.shedInvalidates&&row.drainInvalidates&&row.legacyShedStable&&row.baked);rows.push(row);console.log(JSON.stringify(row));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/atlas-proof.json',JSON.stringify({passed:true,rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
