import assert from 'node:assert/strict';
import {courseMistHabitat as habitat,mistDistanceFade as fade} from '../web/course-mist-field.js';
const ponds=[{x:-7,z:-34,rx:4,rz:1.8}],drain={x:-9,z:-112};
assert.equal(habitat(0,-65,ponds,drain),0);
assert.equal(habitat(-7,-34,ponds,drain),1);
assert.equal(habitat(-9,-112,ponds,drain),1);
assert(habitat(17,-60,ponds,drain)>.95);
assert.equal(habitat(35,-60,ponds,drain),0);
assert.equal(habitat(17,-130,ponds,drain),0);
for(let x=-30;x<30;x+=.1)for(const z of [-112,-60,-34,0]){const w=habitat(x,z,ponds,drain);assert(w>=0&&w<=1);assert(Math.abs(w-habitat(x+.001,z,ponds,drain))<.005);}
for(const d of [0,.5,19,20])assert.equal(fade(d,.8,2,14,19),0);
assert.equal(fade(6,.8,2,14,19),1);
assert(fade(1,.8,2,14,19)>0&&fade(1,.8,2,14,19)<1);
assert(fade(17,.8,2,14,19)>0&&fade(17,.8,2,14,19)<1);
assert.equal(fade(4,4,6,11,15),0);assert.equal(fade(6,4,6,11,15),1);
console.log('PASS: wet/woodland habitat, clear fairway, bounded continuous region and camera fades');
