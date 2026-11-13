import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {WATERS,waterState,inWater,floorLayout,onFloor,solid,pathTo,GATE,BOUNDS} from '../web/under-green-course.js';
const checks=[],tick=(r,n,input={})=>{for(let k=0;k<n;k++)step(r,input);},water=WATERS.find(w=>w.id==='spillway');
function run(y,time,joeY=null){const r=createRun();r.mode='playing';Object.assign(r.player,{y,grace:0});r.time=time;if(joeY!==null)Object.assign(r.joe,{x:0,y:joeY,phase:'walk',last:{x:0,y}});else{r.joe.phase='enter';r.joe.age=-100;}return r;}
let r=run(59.5,2);tick(r,360,{forward:1,sprint:true});assert(r.player.y<60,'Six seconds of sprinting must not pass an active spillway');assert(r.waterHits>1);checks.push('Sustained sprint cannot exploit knockback immunity to cross red water');
r=run(59.5,1.4);tick(r,72,{forward:1,sprint:true});assert(r.player.recovery,'A late surge starts visible recovery');tick(r,72,{forward:1,sprint:true});assert(r.player.y<60,'A late surge returns a player past the midpoint to their original bank');assert.equal(r.waterHits,1);checks.push('A late commitment loses progress rather than shoving the player to the finish');
r=run(59.5,-3);tick(r,165,{forward:1});assert(r.player.y>68.5);assert.equal(r.waterHits,0);checks.push('An early green crossing succeeds at normal Level 1 walking speed');
r=run(59.5,2,54);tick(r,360,{forward:1,sprint:true});assert.equal(r.mode,'caught');checks.push('Trying to force a closed crossing gives approaching Joe time to catch the player');
// Derive the closed phase from the lesson offset; absolute time 6 is now low.
r=run(30,8-WATERS.find(w=>w.lesson).offset,15);const path=pathTo(r.joe,r.player,r.time,false);assert(path.length>0);assert(path.at(-1).y<21);tick(r,180);assert(r.joe.y>19);assert(r.joe.y<21);checks.push('Joe approaches a closed crossing and waits at its bank, without freezing far away');
// The full-width keeper gate must have no route around its visible ends.
for(const x of [-4.5,-3.5,0,3.5,4.5])assert(solid({x:x+GATE.x,y:GATE.y},.3,true));checks.push('Keeper sluice seals the entire room width');
const {tiles,walls}=floorLayout();
for(let y=BOUNDS.minY+.25;y<BOUNDS.maxY;y+=.5)for(let x=BOUNDS.minX;x<BOUNDS.maxX;x+=.5){const rendered=tiles.some(t=>Math.abs(x-t.x)<t.w/2+1e-8&&Math.abs(y-t.y)<t.d/2+1e-8);assert.equal(rendered,onFloor(x,y),`Floor disagreement at ${x},${y}`);}
for(const wall of walls){const vertical=wall.w===.22;if(vertical)assert.notEqual(onFloor(wall.x-.12,wall.y),onFloor(wall.x+.12,wall.y));else assert.notEqual(onFloor(wall.x,wall.y-.12),onFloor(wall.x,wall.y+.12));}
checks.push('Every rendered floor tile and perimeter wall follows the exact collision footprint');
for(const w of WATERS.filter(w=>!['return','bypass'].includes(w.id))){const low=waterState(w,-w.offset);assert(low.safeFor>(w.depth+1)/3.84);assert.equal(waterState(w,((w.lowSeconds??(w.lesson?5:3))+1.5)-w.offset).danger,true);}
checks.push('Every crossing has a sufficient walking window and a truthful surge boundary');
fs.writeFileSync('output/under-green/encounter-design.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
