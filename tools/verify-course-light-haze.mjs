import assert from 'node:assert/strict';
import {lightHazeAlpha,lightHazeFade} from '../web/course-light-haze.js';
let visible=0,total=0,max=0;
for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const a=lightHazeAlpha(x,y);assert(a>=0&&a<=1);assert.equal(a,lightHazeAlpha(x,y));
  visible+=a>0;total+=a;max=Math.max(max,a);
}
assert(visible>3000&&visible<9000);assert(max>.5&&max<1);
assert(total/(128*128)<.2,'Haze should leave mostly clear space');
assert.equal(lightHazeFade(0,1),0);assert.equal(lightHazeFade(4,1),1);assert.equal(lightHazeFade(12,1),0);
for(const power of [0,.12,.2])assert.equal(lightHazeFade(4,power),0);
for(let d=8.5;d<12;d+=.01){const a=lightHazeFade(d,1),b=lightHazeFade(d+.01,1);assert(a>=b);assert(Math.abs(a-b)<.005);}
for(let p=.2;p<.5;p+=.001){const a=lightHazeFade(4,p),b=lightHazeFade(4,p+.001);assert(a<=b);assert(Math.abs(a-b)<.006);}
console.log(JSON.stringify({passed:true,visible,total,mean:total/16384,max}));
