import assert from 'node:assert/strict';
import {COURSE_LOOKS} from '../web/course-atmosphere.js';
import {courseSoundscape} from '../web/course-soundscape.js';
for(const [i,z]of COURSE_LOOKS.entries()){
 const middle=i===7?680:(z.start+COURSE_LOOKS[i+1].start)/2,p=courseSoundscape(middle);
 assert.equal(p.zone,z.id);for(const [k,v]of Object.entries(p))if(k!=='zone')assert(v>=0&&v<=1);
}
for(const z of COURSE_LOOKS.slice(1))for(const edge of [z.start-12,z.start+12]){
 const a=courseSoundscape(edge-.001),b=courseSoundscape(edge+.001);
 for(const k of ['nature','pond','shed','radio','fence','bed'])assert(Math.abs(a[k]-b[k])<.001);
}
const dead=courseSoundscape(500);assert.equal(dead.nature,0);assert.equal(dead.pond,0);assert.equal(dead.bed,.42);
assert.equal(courseSoundscape(405).shed,1);assert.equal(courseSoundscape(320).radio,1);
assert.deepEqual(courseSoundscape(NaN),courseSoundscape(0));
console.log('Eight spatial soundscapes, smooth shared boundaries and silent Dead Green wildlife pass');
