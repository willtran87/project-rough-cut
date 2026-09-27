const {chromium}=require(require('node:path').join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{const b=await chromium.launch({headless:true});try{for(const mode of ['canvas','readback','bitmap','direct-bitmap','decoded-source','software']){const p=await b.newPage();await p.goto('http://127.0.0.1:4187');console.log(mode,await p.evaluate(async mode=>{
 const img=new Image();img.src='./assets/optimized/rough-cut-stone-cover-v2.webp';await img.decode();
 const buffer=document.createElement('canvas');buffer.width=384;buffer.height=176;const c=buffer.getContext('2d',{willReadFrequently:mode==='software'});
 const started=performance.now();const decoded=mode==='decoded-source'?await createImageBitmap(img):img;c.drawImage(decoded,36,204,1464,672,0,0,384,176);
 if(mode==='readback')c.getImageData(0,0,384,176);
 const texture=mode==='direct-bitmap'?await createImageBitmap(img,36,204,1464,672,{resizeWidth:384,resizeHeight:176,resizeQuality:'pixelated'}):mode==='bitmap'?await createImageBitmap(buffer):buffer;
 const preparation=performance.now()-started;
 const target=document.createElement('canvas');target.width=1280;target.height=720;document.body.appendChild(target);const ctx=target.getContext('2d');
 const t=performance.now();ctx.drawImage(texture,60,60,700,300);const first=performance.now()-t;
 const t2=performance.now();ctx.drawImage(texture,70,70,700,300);return {preparation,first,second:performance.now()-t2};
 },mode));await p.close();}}finally{await b.close();}})();
