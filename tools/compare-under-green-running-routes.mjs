import fs from 'node:fs';
import assert from 'node:assert/strict';
import {traverse} from './probe-under-green-folded.mjs';
const out='output/under-green/running-option',report=JSON.parse(fs.readFileSync(out+'/adaptive.json'));
const comparisons=[];
for(const adaptive of report.rows.filter(r=>r.runChoices.length)){
 const {timeOffset,policy}=adaptive;
 const walking=traverse({cp:2,timeOffset,wet:policy==='wet',rangeRoute:policy==='wet'?null:policy,timedKeeper:true,dodge:true});
 comparisons.push({timeOffset,policy,adaptive:{seconds:adaptive.seconds,gap:adaptive.gap,hits:adaptive.hits,mode:adaptive.mode,choices:adaptive.runChoices},walking:{seconds:walking.elapsed,gap:walking.gap,hits:walking.waterHits,mode:walking.mode},secondsSaved:walking.elapsed-adaptive.seconds});
}
const useful=comparisons.filter(r=>r.adaptive.mode==='complete'&&r.walking.mode==='complete'&&r.secondsSaved>.5);
fs.writeFileSync(out+'/comparisons.json',JSON.stringify({passed:useful.length>0,comparisons,useful:useful.length,limits:['Same starting phase, route policy and live Joe; the adaptive pilot changes pace only when bank guidance offers it.','Times are perfect-knowledge scripted outcomes, not player preference or human completion times.','A locally useful run can lose its time advantage downstream; all comparisons are retained.']},null,2));
assert(useful.length>0);console.log(JSON.stringify({passed:true,pairs:comparisons.length,useful:useful.length,bestSecondsSaved:Math.max(...comparisons.map(r=>r.secondsSaved))}));
