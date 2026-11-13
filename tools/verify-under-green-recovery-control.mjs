import fs from 'node:fs';
import assert from 'node:assert/strict';
import {recoveryAttempt} from './probe-under-green-recovery-control.mjs';
import {WATERS} from '../web/under-green-course.js';
const out='output/under-green/recovery-control';fs.mkdirSync(out,{recursive:true});
const rows=[],failures=[],examples=[];
const waters=WATERS.filter(w=>w.id!=='bypass');
for(const w of waters){
 const cases=[];
 for(const side of [-1,1])for(const stance of ['walk','sprint','crouch'])for(const steer of ['none','left','right','return','commit','switch'])cases.push({side,stance,steer});
 for(const side of [-1,1])for(const lane of [-2.2,2.2])for(const steer of ['left','right','switch'])cases.push({side,lane,steer});
 for(const side of [-1,1])for(const steer of ['right','return','switch'])cases.push({side,steer,reduced:true});
 for(const options of cases){
  const attempt=recoveryAttempt(w,options),r=attempt.row;rows.push(r);
  const errors=[];
  if(r.bodyOverlap||r.protectedCapture)errors.push('Body overlap or capture during protected displacement');
  if(r.maxStep>(8+6.08)/60+.00001)errors.push('Unbounded movement');
  if(r.hits!==1||!r.clearedAfterShove||!r.clearedAfterRetreat)errors.push('Repeated hit or recovery did not clear to a usable bank');
  if(!r.entryBankAfterShove||!r.entryBankAfterRetreat)errors.push('Recovery escaped through the active outlet instead of reaching its entry bank');
  if(r.lateralCommandError>1e-7)errors.push('Recovery cancels or adds lateral steering');
  if(r.steer==='switch'&&r.reverseFrames===0)errors.push('Steering reversal did not change lateral movement');
  if(errors.length)failures.push({row:r,errors});
  if(!options.lane&&!options.reduced&&options.stance==='walk'&&options.side===-1&&['right','switch'].includes(options.steer)&&['lesson','range-b','return'].includes(w.id))examples.push(attempt);
 }
 fs.writeFileSync(out+'/partial.json',JSON.stringify({rows,failures},null,2));
 console.log(JSON.stringify({channel:w.id,cases:rows.filter(r=>r.channel===w.id).length,failures:failures.length}));
}
const report={passed:failures.length===0,rows,failures,scope:'Real ordinary-input late entries on both banks of six periodic outlets plus the event-driven return; three stances, opposite steering, reversals, held forward/backward, wall-adjacent lanes and reduced motion.',limits:['Starts are explicit valid dry-bank fixtures with live Joe in the pump room, not continuous chapter paths.','Does not certify near-Joe landing fairness, first-time cue comprehension or physical-device comfort.','The always-blocked pre-pump outflow cannot produce a legitimate late-entry recovery and is covered by existing barrier/progression checks.']};
fs.writeFileSync(out+'/verified.json',JSON.stringify(report,null,2));fs.writeFileSync(out+'/examples.json',JSON.stringify(examples));
assert.deepEqual(failures,[]);console.log(JSON.stringify({passed:true,cases:rows.length,examples:examples.length}));
