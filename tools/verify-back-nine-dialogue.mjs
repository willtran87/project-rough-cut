import assert from 'node:assert/strict';
import {JOE_LINES,JOE_STORY_CUES,createJoeLinePicker,variedJoeCaption} from '../web/back-nine-dialogue.js';
const all=Object.values(JOE_LINES).flat();
assert.equal(new Set(all).size,100,'Distinct contextual lines, including observed service repairs');
let value=null,writes=0;
const storage={getItem:()=>value,setItem:(_,v)=>{value=v;writes++;}};
for(const [key,lines]of Object.entries(JOE_LINES)){
 value=null;
 let pick=createJoeLinePicker({storage,random:()=>.4}),last;
 for(let cycle=0;cycle<3;cycle++){
  const seen=new Set();
  for(let i=0;i<lines.length;i++){
   const run={},before=JSON.stringify(run),line=pick(run,key),savedWrites=writes;
   assert(!seen.has(line),'No repeats before pool exhaustion');
   assert.notEqual(line,last,'No repeat across deck boundary or reload');
   for(let frame=0;frame<120;frame++)assert.equal(pick(run,key),line,'Stable through repaint/pause');
   assert.equal(writes,savedWrites,'No storage work each frame');
   assert.equal(JSON.stringify(run),before,'Dialogue does not mutate simulation');
   seen.add(line);last=line;
   // A fresh picker mimics reloading the game between attempts.
   pick=createJoeLinePicker({storage,random:()=>.4});
  }
  assert.equal(seen.size,lines.length);
 }
}
for(const corrupt of ['{bad','null','7','[]','{"yard":{"bag":[-1,0,999],"last":999}}']){
 value=corrupt;assert(JOE_LINES.yard.includes(createJoeLinePicker({storage})({},'yard')));
}
// Existing players receive expanded banks without waiting through the old deck.
for(const size of [undefined,9]){
 value=JSON.stringify({yard:{bag:[1,2],last:0,size}});
 const upgraded=createJoeLinePicker({storage,random:()=>.4}),seen=new Set();
 for(let i=0;i<JOE_LINES.yard.length;i++){
  const line=upgraded({},'yard');if(i===0)assert.notEqual(line,JOE_LINES.yard[0]);seen.add(line);
 }
 assert.equal(seen.size,JOE_LINES.yard.length,'Expanded deck includes all new lines');
}
const blocked={getItem(){throw Error('Unavailable');},setItem(){throw Error('Full');}};
const pick=createJoeLinePicker({storage:blocked});assert(JOE_LINES.finale.includes(pick({},'finale')));
assert.equal(variedJoeCaption({},'CART HIT · Drive clear!'),'CART HIT · Drive clear!');
assert.match(variedJoeCaption({},JOE_STORY_CUES[1]),/^JOE: “.+”$/,'Dialogue stays separate from objective guidance');
console.log(JSON.stringify({passed:true,totalLines:all.length,pools:Object.keys(JOE_LINES),checks:['exhaustive cycles','reload continuity','stable frames','no simulation mutation','storage fallback','warning and navigation preservation']}));
