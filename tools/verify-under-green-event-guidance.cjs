const fs = require('node:fs');
const assert = require('node:assert/strict');
const {chromium} = require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');

(async () => {
  const out = 'output/under-green/event-guidance';
  fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({headless:true, args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  const errors = [], views = [], checks = [];
  try {
    const p = await browser.newPage({viewport:{width:2560,height:1600}});
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://127.0.0.1:4187/under-green.html?test');
    await p.waitForFunction(() => window.__underGreen && JSON.parse(render_game_to_text()).ready, null, {timeout:90000});
    await p.evaluate(() => advanceTime(0));
    await p.click('#primary');
    const tick = ms => p.evaluate(ms => advanceTime(ms), ms);
    async function fixture() {
      await p.evaluate(async () => {
        const {createRun} = await import('./under-green-sim.js');
        const {LEVER} = await import('./under-green-course.js');
        const r = createRun(1);
        Object.assign(r, {mode:'playing',time:30,elapsed:30,messageTime:0});
        Object.assign(r.player, {x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2});
        // Keep real Joe live, but far away so optional threat text does not own this fixture.
        Object.assign(r.joe, {x:0,y:5,phase:'search',last:{x:0,y:5},route:[]});
        __underGreen.run = r; __underGreen.clearInput(); advanceTime(0);
      });
    }
    async function faceReturn() {
      await p.evaluate(() => {
        const r = __underGreen.run;
        r.player.yaw = Math.atan2(-20-r.player.x,49-r.player.y);
        advanceTime(0);
      });
    }
    async function capture(name, width, height) {
      if(width<900) {
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:width*.6,y:height*.4}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await tick(0);
        assert(await p.locator('#touch').isVisible());
      }
      assert(await p.locator('#water-read').isVisible());
      const view = await p.evaluate(() => {
        const ids = ['water-read','water-phase','water-advice'];
        return {name:document.getElementById('water-name').textContent,
          title:document.getElementById('water-phase').textContent,
          advice:document.getElementById('water-advice').textContent,
          boxes:ids.map(id => {const e=document.getElementById(id),r=e.getBoundingClientRect();return {id,x:r.x,y:r.y,w:r.width,h:r.height,visible:getComputedStyle(e).display!=='none'};})};
      });
      assert(!/side walkway|99\.0/.test(view.advice+' '+view.title));
      for(const box of view.boxes.filter(b=>b.visible)) assert(box.x>=0 && box.y>=0 && box.x+box.w<=width+1 && box.y+box.h<=height+1, JSON.stringify(box));
      await p.evaluate(() => __underGreen.whenPresented());
      await p.screenshot({path:`${out}/${name}-${width}.png`});
      views.push({scenario:name,width,height,...view});
      return view;
    }
    const cdp = await p.context().newCDPSession(p);
    for(const [width,height] of [[2560,1600],[1280,720],[844,390],[390,844]]) {
      await p.setViewportSize({width,height});
      await fixture();
      if(width<900) {
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:width*.6,y:height*.4}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await tick(0);
      }
      await faceReturn();
      let view = await capture('before-pump',width,height);
      assert.match(view.title,/SAFE UNTIL BYPASS/);
      assert.match(view.advice,/stays low until the bypass is operated/);
      // Operate the visible lever through the actual binding, then freely look back.
      await p.evaluate(() => {__underGreen.run.player.yaw=Math.PI/2;advanceTime(0);});
      await p.keyboard.press('e'); await tick(200); await faceReturn();
      view = await capture('return-warning',width,height);
      assert.equal(view.name,'BYPASS RETURN');
      assert.match(view.title,/1\.8s TO SURGE/);
      assert.match(view.advice,/Leave through the drained pump outflow/);
      await p.keyboard.press('Escape');
      const paused = await p.evaluate(() => __underGreen.run.time);
      await tick(1000);
      assert.equal(await p.evaluate(() => __underGreen.run.time),paused);
      await p.click('#primary'); await tick(1900);
      view = await capture('return-latched',width,height);
      assert.match(view.title,/HIGH PRESSURE/);
      assert.match(view.advice,/Leave through the drained pump outflow/);

      // Explicit opposite-bank inspection fixture, not a claimed campaign route.
      await p.evaluate(() => {const r=__underGreen.run;Object.assign(r.player,{x:-20,y:52,yaw:Math.PI});advanceTime(0);});
      view = await capture('return-outside',width,height);
      assert.match(view.advice,/Backtrack via the bunker and spillway to the junction/);
      await p.evaluate(() => {const r=__underGreen.run;Object.assign(r.player,{x:2.8,y:38,yaw:Math.PI/2});advanceTime(0);});
      view = await capture('drained-outflow',width,height);
      assert.match(view.title,/DRAINED/);
      assert.match(view.advice,/channel is drained/);
      assert(!/surge/i.test(view.advice));
    }
    checks.push('Real pump Use changes before-pump guidance to a truthful two-second warning and latched flow; pause freezes the transition');
    checks.push('Both return banks name actual routes; drained outflow never invents a future surge; four viewport sizes remain bounded');
    const topology = await p.evaluate(async () => {
      const {WATERS,pathTo,inWater,solid,distance} = await import('./under-green-course.js');
      const back=WATERS.find(w=>w.id==='return'),destination={x:2,y:38};
      const routes=[{x:-20,y:46},{x:-20,y:52}].map(start=>{
        const path=pathTo(start,destination,33,true,false,30,.3);
        return {start,points:path.length,end:path.at(-1),complete:distance(path.at(-1),destination)<.1,
          avoidsReturn:path.every(point=>!inWater(point,back,.3)),bodyClear:path.every(point=>!solid(point,.3)),
          viaBunker:path.some(point=>point.x<-16&&point.y>60),viaSpillway:path.some(point=>point.x>=0&&point.y>60)};
      });
      return {routes,noAdjacentWalkway:[-23.5,-16.5].every(x=>solid({x,y:49},.3))};
    });
    assert(topology.noAdjacentWalkway);
    assert(topology.routes.every(r=>r.complete&&r.avoidsReturn&&r.bodyClear));
    assert(topology.routes[1].viaBunker&&topology.routes[1].viaSpillway);
    checks.push('Collision navigation confirms the pump-side onward route and the outside full loop; no local passage exists beside the return');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,topology,errors,limits:['Player/remote-Joe placement fixtures; only the pump operation and pause are actual UI actions.','Opposite-bank path proves static connectivity at the tested phases, not safety under pursuit.','Portrait layout may intentionally hide explanatory copy; its compact warning remains visible.']},null,2));
    console.log(JSON.stringify({passed:true,checks,errors}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
