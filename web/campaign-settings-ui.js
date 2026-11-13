import {patchRecord,CAMPAIGN_KEY} from './preference-store.js';

// DOM adapter for campaign settings. Chapter-specific controls remain owned by
// their chapter; Level 1's canvas settings use the same preference store.
const sliders={volume:[0,1],musicVolume:[0,1],ambienceVolume:[0,1],mowerVolume:[0,1],effectsVolume:[0,1],dangerVolume:[0,1],subtitleSize:[.8,1.4],captionBackground:[0,1],stickDeadzone:[.1,.3]};
const toggles=new Set(['muted','reducedMotion','subtitles','soundCaptions','threatCaptions']);
export function bindCampaignSettings(root,preferences,onChange=()=>{}){
 const controls=[...root.querySelectorAll('[data-campaign]')];
 // Failed writes still apply for this session. Retain only those user edits so
 // a later successful save retries them without overwriting other tabs' fields.
 const pending={};
 function sync(){
  for(const el of controls){const value=preferences[el.dataset.campaign];if(el.type==='checkbox')el.checked=!!value;else el.value=value;}
  document.documentElement.style.setProperty('--caption-scale',preferences.subtitleSize);
  document.documentElement.style.setProperty('--caption-opacity',preferences.captionBackground);
 }
 function set(key,value){
  if(toggles.has(key)){if(typeof value!=='boolean')return false;}
  else if(sliders[key]){if(!Number.isFinite(value))return false;const [min,max]=sliders[key];value=Math.max(min,Math.min(max,value));}
  else return false;
  preferences[key]=value;
  pending[key]=value;
  const saved=patchRecord(CAMPAIGN_KEY,pending);
  if(saved)for(const name of Object.keys(pending))delete pending[name];
  const status=root.querySelector('[data-settings-status]');
  if(status)status.textContent=saved?'':'Settings apply for this session. Browser storage is unavailable.';
  sync();onChange(key,value);return saved;
 }
 for(const el of controls)el.addEventListener(el.type==='checkbox'?'change':'input',()=>set(el.dataset.campaign,el.type==='checkbox'?el.checked:Number(el.value)));
 sync();return {set,sync};
}
