const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true});try{
 const p=await b.newPage();await p.route('**/__mechanics-audio',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__mechanics-audio');
 const result=await p.evaluate(async()=>{
  const{createRun}=await import('./back-nine-sim.js'),{createChaseAudio}=await import('./back-nine-audio.js'),{cartMechanics}=await import('./cart-mechanics.js');const cases=[];
  for(const fps of [60,30,15])for(const speed of [4,8,14]){
   const a=createChaseAudio(),r=createRun();r.mode='driving';r.grace=999;r.time=10;r.joe.y=-100;Object.assign(r.cart,{health:15,speed,y:40});a.start();a.update(r,true);const events=[];let previous=0;
   for(let i=1;i<fps*4;i++){r.time=10+i/fps;r.distance=i*speed/fps;a.update(r,true);const count=a.stats().cartDamage.rattles;if(count!==previous){const m=cartMechanics(r);events.push({time:r.time,travel:r.distance,cycle:m.rattleCycle,phase:r.distance/3.2-m.rattleCycle});previous=count;}a.update(r,true);if(a.stats().cartDamage.rattles!==previous)throw Error('Duplicate update rattles twice');}
   const moving=previous;
   for(let i=0;i<fps;i++){r.time+=1/fps;a.update(r,true);}const blocked=a.stats().cartDamage.rattles;
   a.toggle();for(let i=0;i<fps;i++){r.time+=1/fps;r.distance+=speed/fps;a.update(r,true);}const muted=a.stats().cartDamage.rattles;a.toggle();a.update(r,true);const resumed=a.stats().cartDamage.rattles;
   r.cart.health=100;for(let i=0;i<fps;i++){r.time+=1/fps;r.distance+=speed/fps;a.update(r,true);}const repaired=a.stats().cartDamage.rattles;
   cases.push({fps,speed,moving,blocked,muted,resumed,repaired,events,voices:a.stats().voices});a.stop();
  }return cases;
 });
 for(const r of result){assert(r.moving>0);assert.equal(r.moving,r.blocked,'No travel against a wall: no panel contact');assert.equal(r.moving,r.muted);assert.equal(r.moving,r.resumed,'Unmute cannot replay a missed contact');assert.equal(r.moving,r.repaired);assert.equal(r.voices,12);for(const e of r.events){assert(e.phase<=r.speed/r.fps/3.2+.0001);assert.notEqual(e.cycle%5,2);}}
 for(const speed of [4,8,14]){const c=result.filter(r=>r.speed===speed);assert(c.every(r=>r.moving===c[0].moving),'Rattle count depends on travel, not update rate');}
 const out='output/back-nine-experience/mechanics';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/audio-contacts.json',JSON.stringify({passed:true,cases:result},null,2));console.log(JSON.stringify({passed:true,cases:result.map(({events,...r})=>r)}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
