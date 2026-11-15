// Opt-in, in-memory only. No network, persistent identifier or background upload.
export function createLocalTelemetry(limit=256){return {enabled:true,limit:Math.max(1,Math.min(2048,limit|0)),events:[],totals:{},metrics:{},dropped:0};}
export function recordLocal(t,type,time,values={}){
 if(!t?.enabled)return;
 t.totals[type]=(t.totals[type]||0)+1;
 if(t.events.length===t.limit){t.events.shift();t.dropped++;}
 t.events.push({type,time,...values});
}
export function telemetrySnapshot(t){return t?.enabled?{events:t.events.map(e=>({...e})),totals:{...t.totals},metrics:{...t.metrics},dropped:t.dropped}:null;}
