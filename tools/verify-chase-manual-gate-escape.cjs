const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),tag=software?'software':'hardware',out='output/back-nine-experience/manual-gates',b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');localStorage.setItem('rough-cut.settings.v1','{"soundCaptions":true}');});
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 for(const choice of ['gate','bend']){
  await p.evaluate(async choice=>{const{createRun}=await import('./back-nine-sim.js'),r=createRun(1,0,37161),g=__backNine.COURSE.shortcuts[1];r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.hunt.cooldown=r.tension.cooldown=100;r.tension.phase='stalk';r.tension.zoneMask=7;r.story.seen=7;r.story.choiceSeen=0xffff;
   r.foot={x:g.x-13,y:g.y-8,yaw:Math.atan2(13,5),viewYaw:Math.atan2(13,5),speed:0,onFoot:true,invulnerable:0};Object.assign(r.cart,{x:38,y:20,health:0,failedAt:0});Object.assign(r.joe,{x:g.x-13,y:g.y-37.5,yaw:0,speed:6});__backNine.run=r;
   const route=choice==='gate'?[{x:g.x-Math.sin(g.yaw)*3,y:g.y-Math.cos(g.yaw)*3},g.to]:[...__backNine.COURSE.paths[0].filter(p=>p[1]>g.from.y+1&&p[1]<g.to.y-2).map(([x,y])=>({x,y})),g.to];
   window.gateDrive={choice,route,cursor:0,windup:false,missAt:null,complete:false};window.__pad={connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[__pad];await advanceTime(0);
  },choice);
  const samples=[],captures=new Set();let final;
  for(let n=0;n<400;n++){
   final=await p.evaluate(async()=>{const r=__backNine.run,d=gateDrive,a=r.foot,s=r.courseFX.breaks[10],dist=p=>Math.hypot(a.x-p.x,a.y-p.y),clamp=(x,l,h)=>Math.max(l,Math.min(h,x));d.windup ||=r.joe.ram.phase==='lineup'&&r.joe.ram.age>=1.1;
    if(d.choice==='gate'&&d.cursor===0&&(s.open>.95||s.age>=0))d.cursor++;
    else if(!(d.choice==='gate'&&d.cursor===0)&&dist(d.route[d.cursor])<1.4){if(d.cursor===d.route.length-1)d.complete=true;else d.cursor++;}
    const target=d.route[d.cursor],raw=Math.atan2(target.x-a.x,target.y-a.y)-a.yaw,turn=Math.atan2(Math.sin(raw),Math.cos(raw)),near=d.choice==='gate'&&d.cursor===0&&dist(target)<1,steer=near?0:clamp(turn*2,-1,1),gas=d.windup&&!near&&Math.abs(turn)<1.15,brake=d.windup&&near;
    __pad.axes[0]=!d.windup||Math.abs(steer)<.002?0:Math.sign(steer)*(.22+.78*Math.abs(steer));__pad.buttons[7]={pressed:gas,value:gas?1:0};__pad.buttons[1]={pressed:brake,value:brake?1:0};await advanceTime(50);if(r.joe.ram.phase==='missed')d.missAt??=r.time-20;const state=JSON.parse(render_game_to_text());return {complete:d.complete,windup:d.windup,missAt:d.missAt,state};
   });samples.push({seconds:final.state.seconds,mode:final.state.mode,player:final.state.player,joe:final.state.joe,gate:final.state.courseFX.breaks[10],messages:final.state.messages});
   const gate=final.state.courseFX.breaks[10],frame=gate.open>0&&gate.open<1?'swing':gate.open===1?'open':final.state.joe.ram.phase==='lineup'?'windup':null;
   if(frame&&!captures.has(frame)){captures.add(frame);await p.screenshot({path:`${out}/${tag}-live-${choice}-${frame}.png`});}
   if(final.complete||final.state.mode!=='back_nine_driving')break;
  }
  assert(final.windup&&final.missAt!==null,'Physical windup and miss occur without injected attack states');if(choice==='gate'){assert(final.complete);assert.equal(final.state.mode,'back_nine_driving');assert.equal(final.state.courseFX.breaks[10].open,1);assert(final.state.player.invulnerable===0);}
  await p.screenshot({path:`${out}/${tag}-live-${choice}-end.png`});results.push({choice,final,samples});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${tag}-escape.json`,JSON.stringify({passed:true,results,errors},null,2));console.log(JSON.stringify({passed:true,tag,results:results.map(r=>({choice:r.choice,complete:r.final.complete,mode:r.final.state.mode,missAt:r.final.missAt,time:r.final.state.seconds,open:r.final.state.courseFX.breaks[10].open})),errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
