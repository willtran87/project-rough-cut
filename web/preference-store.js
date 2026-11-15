// Existing storage keys are retained. Storage failure never prevents play.
export const CAMPAIGN_KEY='rough-cut.settings.v1';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function readRecord(key,fallback={}){
 try{const value=JSON.parse(localStorage.getItem(key));return object(value)?value:{...fallback};}catch{return {...fallback};}
}
export function writeRecord(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function patchRecord(key,changes){return writeRecord(key,{...readRecord(key),...changes});}
const ranges={musicVolume:[0,1,.7],volume:[0,1,.72],ambienceVolume:[0,1,.9],mowerVolume:[0,1,1],effectsVolume:[0,1,1],dangerVolume:[0,1,.9],subtitleSize:[.8,1.4,1],captionBackground:[0,1,.78],stickDeadzone:[.1,.3,.22]};
export function campaignPreferences(systemReduced=false){
 const value=readRecord(CAMPAIGN_KEY),result={...value};
 for(const [key,[lo,hi,fallback]]of Object.entries(ranges))result[key]=Number.isFinite(value[key])?Math.max(lo,Math.min(hi,value[key])):fallback;
 for(const [key,fallback]of Object.entries({muted:false,subtitles:true,soundCaptions:false,threatCaptions:true,reducedMotion:systemReduced,invertLook:false}))result[key]=typeof value[key]==='boolean'?value[key]:fallback;
 return result;
}
// A settings screen writes only values the player changed since its last save.
// This preserves edits made by another chapter/tab and unrelated extension data.
export function preferenceWriter(key,initial){
 let previous=JSON.parse(JSON.stringify(initial));
 return values=>{
  const changes={};for(const [name,value]of Object.entries(values))if(JSON.stringify(value)!==JSON.stringify(previous[name]))changes[name]=value;
  if(!Object.keys(changes).length)return true;
  if(!patchRecord(key,changes))return false;
  previous=JSON.parse(JSON.stringify({...previous,...values}));return true;
 };
}
