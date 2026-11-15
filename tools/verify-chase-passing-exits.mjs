import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {tryCommitment,updateCommitment} from '../web/chase-commitments.js';
import {updateHunt} from '../web/back-nine-hunt.js';
import {blocked,lineClear} from '../web/back-nine-course.js';
const out='output/back-nine-experience/opening-pacing';
const snapshot=JSON.parse(fs.readFileSync(out+'/flared-pass.json'));
function fresh(){const r=structuredClone(snapshot);r.hunt.phase='follow';r.hunt.cooldown=0;r.hunt.commit.probe=0;r.hunt.commit.count--;r.variation.choices--;r.hunt.districtMask&=~4;r.hunt.lastDistrict=null;r.encounter.owner='cruise';r.pressure.phase='pressure';return r;}
const source=fs.readFileSync(out+'/baseline-source/chase-commitments.js','utf8').replace(/from '(\.\/[^']+)'/g,(_,name)=>`from '${pathToFileURL(process.cwd()+'/web/'+name.slice(2)).href}'`);
const before=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal(before.tryCommitment(fresh(),true,'pass'),false,'The former straight corridor rejects this natural approach');
const r=fresh();assert(tryCommitment(r,true,'pass'));assert.equal(r.hunt.phase,'commit_warning');
const points=structuredClone(r.hunt.waypoints),origin=r.hunt.commit.origin,heading=r.hunt.commit.heading;
const side=p=>(p.x-origin.x)*Math.cos(heading)-(p.y-origin.y)*Math.sin(heading);
assert(Math.abs(side(points[0]))===6.2||Math.abs(Math.abs(side(points[0]))-6.2)<1e-9);assert(Math.abs(Math.abs(side(points[1]))-12.4)<1e-9);
assert(side(points[0])*side(points[1])>0,'Exit continues away from the announced player lane');
assert(!blocked(points[0],2.7)&&!blocked(points[1],2.7));assert(lineClear(r.joe,points[0],2.7)&&lineClear(points[0],points[1],2.7));
r.cart.x-=12;r.hunt.age=1.79;updateCommitment(r,0,false);assert.equal(r.hunt.phase,'commit_warning');assert.deepEqual(r.hunt.waypoints,points);r.hunt.age=1.8;updateCommitment(r,0,false);assert.equal(r.hunt.phase,'close_pass');assert.deepEqual(r.hunt.waypoints,points);
for(const protection of ['invulnerable','grace','relief']){const p=fresh();if(protection==='invulnerable')p.cart.invulnerable=.8;if(protection==='grace')p.grace=.8;if(protection==='relief')p.encounter.owner='relief';updateHunt(p,1/60,true);assert.equal(p.hunt.phase,'follow',protection+' must exclude a new pass');}
fs.writeFileSync(out+'/passing-exits.json',JSON.stringify({passed:true,points,checks:['Old straight corridor rejected; outward fallback clears both full-width segments','Full warning and hidden frozen prediction retained','Post-hit, checkpoint and earned relief prohibit a new commitment']},null,2));console.log('PASS: physical outward passing exit, full warning, fixed hidden prediction and protected windows');
