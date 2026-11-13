import fs from 'node:fs';
import {FLOORS,WATERS,LEVER,NOTE,SLUICE,GATE,MAIN_ROUTE,CHECKPOINT_LAYOUT} from '../web/under-green-layout.js';
const x=n=>70+(n+34)*11,y=n=>80+(78-n)*11,rect=(r,fill,stroke='none')=>`<rect x="${x(r.x-r.w/2)}" y="${y(r.y+r.d/2)}" width="${r.w*11}" height="${r.d*11}" fill="${fill}" stroke="${stroke}"/>`;
const text=(label,px,py,color='#fff',size=12)=>`<text x="${x(px)}" y="${y(py)}" fill="${color}" font-size="${size}">${label}</text>`;
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="880" height="1080" viewBox="0 0 880 1080"><rect width="880" height="1080" fill="#132322"/><g font-family="Arial,sans-serif"><text x="45" y="35" fill="#f3dfaf" font-size="23">UNDER THE GREEN · PHYSICAL ROUTE</text><text x="45" y="58" fill="#a8c6bd" font-size="13">North is up. All corridors and the service shortcut are shared by player and Joe.</text>`;
for(const f of FLOORS)svg+=rect(f,'#46564d');
svg+=`<polyline points="${MAIN_ROUTE.map(p=>`${x(p.x)},${y(p.y)}`).join(' ')}" fill="none" stroke="#d7b561" stroke-width="2" stroke-dasharray="5 4"/>`;
for(const w of WATERS){svg+=rect({x:w.x,y:w.y,w:w.axis==='x'?w.depth:w.width,d:w.axis==='x'?w.width:w.depth},w.id==='bypass'?'#cc7159':'#478f9c','#9ec9ce');svg+=text(w.id,w.x-w.width/2,w.y+.5,'#fff',10);}
for(const [label,p]of [['PUMP',LEVER],['RECORD',NOTE],['RELEASE',SLUICE]])svg+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="5" fill="#f4ca74"/>`+text(label,p.x+1,p.y,'#f4ca74',11);
svg+=rect({x:GATE.x,y:GATE.y,w:GATE.width,d:.4},'#e1e8d9');
CHECKPOINT_LAYOUT.forEach((p,i)=>{svg+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="8" fill="#203b30" stroke="#9ae2aa"/>`+text(String(i),p.x-.3,p.y-.4,'#9ae2aa',12);});
svg+=text('SERVICE JUNCTION',-12,41,'#f3dfaf',10)+text('ROOT GALLERY',-4,10,'#f3dfaf',10)+text('BUNKER LOOP',-30,76,'#f3dfaf',11)+text('RANGE',18,44,'#f3dfaf',12);
svg+='<text x="45" y="1035" fill="#a8c6bd" font-size="13">Gold dash: tested dry loop · Blue: timed pressure · Red: pump-controlled outflow · Circles: checkpoints</text></g></svg>';
fs.mkdirSync('output/under-green/folded',{recursive:true});fs.writeFileSync('output/under-green/folded/physical-plan.svg',svg);
