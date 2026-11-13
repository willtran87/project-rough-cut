const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules')]}));
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage();
  let scene=fs.readFileSync('web/scene-3d.js','utf8');
  // Bake through the actual painter, including path grit and source-art multiply.
  scene=scene.replace('const baked=pixelStyle&&!calibration?', 'const baked=false?');
  if(!scene.includes('  addTerrain(t,calibration,data);'))throw Error('Terrain painter capture point changed');
  scene=scene.replace('  addTerrain(t,calibration,data);','  window.__terrainBake={data,scale:SCALE,xScale:X_SCALE,png:c.toDataURL("image/png")};\n  addTerrain(t,calibration,data);');
  await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:scene}));
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__bake={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__bake&&JSON.parse(render_game_to_text()).assets.course.ready);
  await page.evaluate(()=>{__bake.resetFirstHole();__bake.state.mode='first_hole';__bake.state.manualTime=true;__bake.render();});
  await page.waitForFunction(()=>window.__terrainBake,null,{timeout:120000});
  const bake=await page.evaluate(async()=>{const b=__terrainBake,{terrainBakeKey}=await import('./baked-terrain.js');return {key:await terrainBakeKey(b.data,b.scale,b.xScale),png:b.png};});
  const dir='web/assets/baked';fs.mkdirSync(dir,{recursive:true});const file='terrain-'+bake.key.slice(0,16)+'.webp',png=Buffer.from(bake.png.split(',')[1],'base64');
  const encoded=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  if(!(await sharp(png).ensureAlpha().raw().toBuffer()).equals(await sharp(encoded).ensureAlpha().raw().toBuffer()))throw Error('Terrain bake changed pixels');
  fs.writeFileSync(dir+'/'+file,encoded);
  const manifest=fs.existsSync(dir+'/terrain.json')?JSON.parse(fs.readFileSync(dir+'/terrain.json','utf8')):{};manifest[bake.key]=file;fs.writeFileSync(dir+'/terrain.json',JSON.stringify(manifest,null,2)+'\n');console.log({file,bytes:fs.statSync(dir+'/'+file).size});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
