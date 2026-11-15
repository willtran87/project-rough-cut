import fs from 'node:fs';
import {planRollingTravel,travelKey} from '../web/final-cut-travel.js';
const exits=[...[26,50,66].flatMap(y=>[-1,1].map(side=>({x:side*30,y,yaw:side*Math.PI/2}))),{x:22.8,y:31,yaw:Math.PI},{x:22.8,y:85,yaw:0}];
const entries=[...exits.map(p=>({...p,yaw:p.yaw+Math.PI})),{x:30,y:74,yaw:-Math.PI/2}],catalog={};
for(const start of exits){for(const end of entries){const route=planRollingTravel(start,end,true);if(!route)throw Error('No rolling route: '+travelKey(start,end));catalog[travelKey(start,end)]=route.raw;}console.log('Planned exit',start.x,start.y);}
fs.writeFileSync('web/final-cut-travel-routes.js','// Authored, clearance-checked forward routes. Regenerate with tools/build-final-cut-travel-routes.mjs.\nexport const TRAVEL_ROUTES='+JSON.stringify(catalog)+';\n');
console.log('Baked',Object.keys(catalog).length,'routes.');
