import {floodPace,floodCrossingScale} from './under-green-flood.js';
import {createOpeningStory} from './opening-story.js';
import {UNDER_GREEN_SLIDES} from './under-green-opening.js';
import {observeJoe} from './under-green-senses.js';
import {mountFinalCutLink} from './final-cut-campaign.js';
import {bindCampaignSettings} from './campaign-settings-ui.js';
import {bindKeyboardSettings} from './keyboard-binding-settings.js';
import {soundDescription} from './under-green-observation.js';
import {hudObjective} from './under-green-hud.js';
import {createDOMGamepadMenu} from './dom-gamepad-menu.js';
import {createTouchRunControl} from './touch-run-control.js';
import {createLocalTelemetry} from './local-telemetry.js';
import {campaignPreferences,readRecord,writeRecord,patchRecord,CAMPAIGN_KEY} from './preference-store.js';
import {actionBindings,keyLabel,movementKeyLabel,onFootActionVerb} from './control-profiles.js';
import {crossingAdvice,runningCrossingOption,walkingCrossingOption} from './under-green-guidance.js';
import {SAVE_KEY,WATERS,waterState,inWater,distance,clamp,district,lineClear} from './under-green-course.js';
import {createRun,readSave,snapshot,step,nearbyAction,objective,diagnostics,MOVEMENT,movementPace} from './under-green-sim.js';
import {createUnderGreenScene} from './under-green-scene.js';
import {createUnderGreenAudio} from './under-green-audio.js';
import {createGratingCue} from './under-green-grating.js';
import {createMouseLook} from './mouse-look.js';
import {createFrameWake} from './frame-wake.js';
import {retryProgress} from './under-green-outcome.js';
import {mountUnderGreenPlaytest} from './under-green-playtest.js';
const $=id=>document.getElementById(id),canvas=$('game'),keys=new Set(),touch=new Set(),audio=createUnderGreenAudio(()=>shared),test=new URLSearchParams(location.search).has('test');
const finalCutLink=mountFinalCutLink(document.querySelector('#panel .actions'),'drain');
const gratingCue=createGratingCue();
function stored(key){try{return localStorage.getItem(key);}catch{return null;}}
const settings=readRecord;
const shared=campaignPreferences(matchMedia('(prefers-reduced-motion:reduce)').matches),spatialStore=RCSpatialPreferences.create(),feel=RCFoundation.readComfort(),mouseLook=createMouseLook();
let spatial=spatialStore.get();
const bindings=actionBindings('onFoot',shared.keyboardBindings,shared.keyboardBindingsVersion||0),label=id=>keyLabel(bindings[id]);
// Honor the requested E action key even when an old/custom Enter binding remains.
if(bindings.interact==='Enter'){
 const conflict=Object.keys(bindings).find(id=>id!=='interact'&&bindings[id]==='KeyE');
 if(conflict)bindings[conflict]='Enter';
 bindings.interact='KeyE';shared.keyboardBindings={...bindings};shared.keyboardBindingsVersion=3;
 patchRecord(CAMPAIGN_KEY,{keyboardBindings:{...bindings},keyboardBindingsVersion:3});
}
const down=id=>keys.has(bindings[id]),deviceGain=device=>clamp(Number(spatial[device])||1,.25,2),deadzone=clamp(Number(shared.stickDeadzone)||.22,.1,.3),horizontalSign=shared.invertLook?-1:1;
const legacyComfort=settings('rough-cut.under-green-comfort.v1');
// A prior chapter-only mute stays local until the player chooses campaign mute.
// An explicit campaign choice (including unmute in another chapter) takes precedence.
let legacyMuted=typeof settings(CAMPAIGN_KEY).muted!=='boolean'&&legacyComfort.muted===true;
let legacyReduced=typeof settings(CAMPAIGN_KEY).reducedMotion!=='boolean'&&legacyComfort.reduced===true;
let prefs={...legacyComfort,reduced:shared.reducedMotion||legacyReduced,muted:shared.muted||legacyMuted};
// Use Level 1's mouse response and device preference; vertical look stays normal.
prefs.sensitivity=.0025*deviceGain('mouse')**2;prefs.fov=clamp(Number(spatial.fov)||58,45,85);
// This chapter's panic motion has its own default; don't change Level 1 comfort.
prefs.cameraBob=legacyComfort.panicBobVersion===1&&Number.isFinite(legacyComfort.cameraBob)?clamp(legacyComfort.cameraBob,0,.6):.25;
prefs.panicBobVersion=1;
prefs.resolution=Number.isFinite(spatial.resolution)?clamp(spatial.resolution,.5,1):1;
let toggleCrouch=false,toggleSprint=false;
const touchRun=createTouchRunControl(),touchPointers=new Map();
const saved=readSave(stored(SAVE_KEY));let run=createRun(0,false,saved?.difficulty),world=null,ready=false,manual=false,last=performance.now(),accumulator=0,usePressed=false,lookX=0,lookY=0,uiMode='',lastSave=-1,dirty=true,padButtons=[],drag=null,inputMethod=matchMedia('(pointer:coarse)').matches?'touch':'keyboard';
if(new URLSearchParams(location.search).has('telemetry'))run.telemetry=createLocalTelemetry();
const playtest=new URLSearchParams(location.search).has('playtest')?mountUnderGreenPlaytest(document.querySelector('#panel .panel-body'),()=>({viewport:{width:innerWidth,height:innerHeight},inputMethod,settings:{muted:prefs.muted,reducedMotion:prefs.reduced,fov:prefs.fov,resolution:prefs.resolution,threatCaptions:shared.threatCaptions,soundCaptions:shared.soundCaptions},bindings:{...bindings}})):null;
function persist(){
 const record=snapshot(run),previous=readSave(stored(SAVE_KEY));
 // Completed chapter credit survives replay, but never restores live progress.
 record.completed=record.completed||previous?.completed===true;
 record.evidence=record.evidence||previous?.evidence===true;
 const storedSuccessfully=writeRecord(SAVE_KEY,record);
 $('save-note').textContent='No checkpoints. Every new attempt starts at the drain entrance.'+(storedSuccessfully?'':' Browser storage is unavailable; completion and settings may not be kept.');
}
function savePrefs(){try{localStorage.setItem('rough-cut.under-green-comfort.v1',JSON.stringify({...prefs,muted:legacyMuted,reduced:legacyReduced}));}catch{}dirty=true;}
function clearInput(){keys.clear();touch.clear();touchPointers.clear();touchRun.reset();lookX=lookY=0;mouseLook.reset();toggleCrouch=toggleSprint=false;usePressed=false;drag=null;}
function release(){if(document.pointerLockElement===canvas)document.exitPointerLock();}
const live=()=>['playing','aftermath'].includes(run.mode);
const presentationWake=createFrameWake(()=>draw(),()=>ready&&!manual&&!document.hidden&&live());
function beginEscape(){audio.start();const telemetryEnabled=run.telemetry?.enabled;if(run.mode==='caught'||run.mode==='complete')run=createRun(0,false,run.difficulty);if(telemetryEnabled&&!run.telemetry)run.telemetry=createLocalTelemetry();run.mode=run.finished?'aftermath':'playing';clearInput();dirty=true;persist();canvas.focus();}
let storyStartsRun=false,storyReturnMode='briefing';
const opening=createOpeningStory({slides:UNDER_GREEN_SLIDES,mount:$('shell'),storageKey:'rough-cut.under-green-opening.v1',header:'UNDER THE GREEN',replayHint:'Replay from Controls & comfort. E continues; Esc skips.',advanceKeys:['KeyE','Enter','Space'],finalLabel:'Enter the drain →',
 reducedMotion:()=>prefs.reduced,captions:()=>shared.soundCaptions,toggleFullscreen:()=>{if(document.fullscreenElement)document.exitFullscreen();else $('shell').requestFullscreen().catch(()=>{});},
 onGesture:()=>audio.start(),onSlide:(_,index)=>audio.setStory(index,run),
 finish:()=>{run.mode=storyReturnMode;audio.setStory(-1,run);clearInput();if(storyStartsRun)beginEscape();else{dirty=true;paint();$('replay-intro').focus();}}
});
const storyMenu=createDOMGamepadMenu({root:$('opening-story'),onBack:()=>opening.action('skip'),onStart:()=>opening.action('skip')});
function showIntro(start=false){storyStartsRun=start;storyReturnMode=run.mode;run.mode='intro';clearInput();release();opening.open();dirty=true;}
function primary(){if(!ready||opening.snapshot().active)return;if(run.mode==='briefing'&&!opening.shouldSkip())showIntro(true);else beginEscape();}
$('replay-intro').onclick=()=>showIntro(false);
document.addEventListener('visibilitychange',()=>{if(opening.snapshot().active)audio.update(run);});
function pause(){if(live()){run.resumeMode=run.mode;run.mode='paused';clearInput();release();}else if(run.mode==='paused'){run.mode=run.resumeMode||'playing';canvas.focus();}dirty=true;paint();audio.update(run);}
const gamepadMenu=createDOMGamepadMenu({root:$('panel'),onStart:pause,onBack:()=>{if(run.mode==='paused')pause();},onDisconnect:()=>{if(inputMethod==='gamepad'&&live())pause();}});
$('primary').onclick=primary;$('pause').onclick=pause;$('restart').onclick=()=>{const telemetryEnabled=run.telemetry?.enabled;run=createRun(0,false,run.difficulty);if(telemetryEnabled)run.telemetry=createLocalTelemetry();run.mode='playing';clearInput();persist();dirty=true;canvas.focus();};$('use').onclick=()=>{usePressed=true;audio.start();};
function applyCampaignSettings(key){if(key==='muted')legacyMuted=false;if(key==='reducedMotion')legacyReduced=false;prefs.muted=shared.muted||legacyMuted;prefs.reduced=shared.reducedMotion||legacyReduced;audio.setMuted(prefs.muted);audio.update(run);$('legacy-comfort').hidden=!legacyMuted&&!legacyReduced;savePrefs();}
const campaignUI=bindCampaignSettings($('comfort'),shared,applyCampaignSettings);
bindKeyboardSettings($('keyboard'),{
 profile:'onFoot',stored:bindings,storageField:'keyboardBindings',
 labels:{move_up:'Forward',move_down:'Backward',move_left:'Left',move_right:'Right',sprint:'Run',crouch:'Crouch',focus:'Listen',look_back:'Rear glance',interact:'Use'},
 onChange(value){Object.assign(bindings,value);clearInput();dirty=true;paint();}
});
$('legacy-comfort').hidden=!legacyMuted&&!legacyReduced;
$('use-campaign-settings').onclick=()=>{legacyMuted=legacyReduced=false;applyCampaignSettings();};
const preferenceSaveFailures=new Set();
function preferenceStatus(group,saved){
 if(saved)preferenceSaveFailures.delete(group);else preferenceSaveFailures.add(group);
 $('spatial-settings-status').textContent=preferenceSaveFailures.size?'Settings apply for this session. Browser storage is unavailable.':'';
}
function syncSpatialSettings(values){
 spatial=values;
 prefs.sensitivity=.0025*deviceGain('mouse')**2;
 prefs.fov=spatial.fov;prefs.resolution=spatial.resolution;
 for(const input of document.querySelectorAll('[data-spatial]')){
  const name=input.dataset.spatial;
  if(input.type==='checkbox')input.checked=spatial[name];else input.value=spatial[name];
 }
 for(const output of document.querySelectorAll('[data-spatial-output]')){
  const name=output.dataset.spatialOutput;output.textContent=RCSpatialPreferences.format(name,spatial[name]);
 }
 mouseLook.reset();lookX=lookY=0;dirty=true;
}
spatialStore.subscribe((values,name,saved)=>{syncSpatialSettings(values);preferenceStatus('spatial',saved);});
syncSpatialSettings(spatial);
for(const input of document.querySelectorAll('[data-spatial]'))input.addEventListener('input',()=>{
 spatialStore.set(input.dataset.spatial,input.type==='checkbox'?input.checked:Number(input.value));
});
function saveFeel(){clearInput();preferenceStatus('feel',RCFoundation.saveComfort(feel));dirty=true;}
for(const input of document.querySelectorAll('[data-feel]')){
 const name=input.dataset.feel;
 if(input.type==='checkbox')input.checked=feel[name];else input.value=feel[name];
 input.addEventListener(input.type==='checkbox'?'change':'input',()=>{
  feel[name]=input.type==='checkbox'?input.checked:clamp(Number(input.value),0,.6);
  saveFeel();
 });
}
$('camera-bob').value=prefs.cameraBob;
$('camera-bob-value').textContent=Math.round(prefs.cameraBob*100)+'%';
$('camera-bob').addEventListener('input',e=>{clearInput();prefs.cameraBob=clamp(Number(e.target.value),0,.6);$('camera-bob-value').textContent=Math.round(prefs.cameraBob*100)+'%';savePrefs();});
$('touch-run-toggle').checked=feel.touchSprintToggle;$('touch-run-toggle').onchange=e=>{feel.touchSprintToggle=e.target.checked;saveFeel();};
$('sound').onclick=()=>campaignUI.set('muted',!prefs.muted);$('sound').setAttribute('aria-label','Toggle sound for all chapters');audio.setMuted(prefs.muted);
$('pressure').value=run.difficulty;$('pressure').onchange=e=>{run.difficulty=e.target.value;persist();};
document.addEventListener('keydown',e=>{if(!live()&&e.code==='Tab'){const list=[...$('panel').querySelectorAll('button:not(:disabled),a,summary,input,select,textarea')].filter(el=>el.getClientRects().length&&!el.closest('[hidden]')),index=list.indexOf(document.activeElement);if((e.shiftKey&&index<=0)||(!e.shiftKey&&index===list.length-1)){e.preventDefault();list[e.shiftKey?list.length-1:0]?.focus();}return;}if(e.target.matches('input,select,textarea,summary')&&e.code!=='Escape')return;if(!live()&&e.target.matches('button,a')&&!['Escape','KeyF','KeyE'].includes(e.code))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(inputMethod==='touch')clearInput();inputMethod='keyboard';if(e.code==='Escape'){e.preventDefault();pause();return;}if(e.code==='KeyF'){if(document.fullscreenElement)document.exitFullscreen();else $('shell').requestFullscreen().catch(()=>{});return;}if(['Enter','KeyE'].includes(e.code)&&!live()){e.preventDefault();primary();return;}if(!e.repeat&&e.code===bindings.interact)usePressed=true;if(!e.repeat&&e.code===bindings.crouch&&feel.crouchToggle)toggleCrouch=!toggleCrouch;if(!e.repeat&&e.code===bindings.sprint&&feel.sprintToggle)toggleSprint=!toggleSprint;keys.add(e.code);});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{if(live())pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&live())pause();});
canvas.addEventListener('click',()=>{if(live()&&inputMethod!=='touch'){audio.start();canvas.requestPointerLock?.()?.catch?.(()=>{});}});
canvas.addEventListener('pointerdown',e=>{if(!live()||drag)return;inputMethod=e.pointerType==='touch'?'touch':'keyboard';audio.start();drag={id:e.pointerId,x:e.clientX,y:e.clientY};try{canvas.setPointerCapture(e.pointerId);}catch{}});
canvas.addEventListener('pointermove',e=>{if(!live())return;
 const locked=document.pointerLockElement===canvas;if(!locked&&drag?.id!==e.pointerId)return;
 const dx=locked?e.movementX:e.clientX-drag.x,dy=locked?e.movementY:e.clientY-drag.y;
 if(e.pointerType==='touch'){const gain=.004*deviceGain('touch')*1280/Math.max(1,canvas.clientWidth);lookX+=dx*gain*horizontalSign;lookY+=dy*gain;}
 else mouseLook.push(dx*prefs.sensitivity*horizontalSign,dy*prefs.sensitivity);
 if(drag){drag.x=e.clientX;drag.y=e.clientY;}
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(drag?.id!==e.pointerId)return;if(event==='pointerup')drag=null;else clearInput();});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&live()&&inputMethod!=='touch'&&!manual)pause();});
for(const b of document.querySelectorAll('[data-key]')){
 const action=b.dataset.key;
 b.onpointerdown=e=>{
  e.preventDefault();if(!live()||touchPointers.has(action))return;
  inputMethod='touch';audio.start();touchPointers.set(action,e.pointerId);touch.add(action);
  if(action==='sprint')touchRun.press(e.pointerId,feel.touchSprintToggle);
  try{b.setPointerCapture(e.pointerId);}catch{}if(action==='use')usePressed=true;
 };
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{
  if(touchPointers.get(action)!==e.pointerId)return;
  if(event!=='pointerup'){clearInput();return;}
  touchPointers.delete(action);touch.delete(action);if(action==='sprint')touchRun.release(e.pointerId);
 });
}
function input(dt=1/60){
 const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected),pressed=pad?pad.buttons.map(b=>b.pressed):[];
 const storyActive=opening.snapshot().active;storyMenu.update(pad,storyActive,dt);if(storyActive)return {};
 const stick=RCFoundation.stick(pad?.axes[0]||0,-(pad?.axes[1]||0),deadzone);
 const wasMenu=!live();
 if(pad){
  if(Math.hypot(stick.x,stick.y)>0||pad.axes.slice(2).some(n=>Math.abs(n)>deadzone)||pressed.some(Boolean)){if(inputMethod==='touch')clearInput();inputMethod='gamepad';}
 }
 const menuConsumed=gamepadMenu.update(pad,!live(),dt);
 if(pad&&!wasMenu&&!menuConsumed){
  if(pressed[0]&&!padButtons[0])usePressed=true;
  if(pressed[4]&&!padButtons[4]&&feel.crouchToggle)toggleCrouch=!toggleCrouch;
  if(pressed[7]&&!padButtons[7]&&feel.sprintToggle)toggleSprint=!toggleSprint;
 }
 padButtons=pressed;
 if(wasMenu||menuConsumed)return {};
 const axis=n=>Math.sign(n||0)*Math.pow(clamp((Math.abs(n||0)-deadzone)/(1-deadzone),0,1),1.35);
 const rear=down('look_back')||touch.has('rear')||pressed[11];
 if(rear||!live()||inputMethod!=='keyboard')mouseLook.reset();
 const mouse=mouseLook.sample(dt),i={
  forward:(down('move_up')||keys.has('ArrowUp')||touch.has('forward')?1:0)-(down('move_down')||keys.has('ArrowDown')||touch.has('back')?1:0)+(pressed[12]?1:pressed[13]?-1:stick.y),
  strafe:(down('move_right')||keys.has('ArrowRight')||touch.has('right')?1:0)-(down('move_left')||keys.has('ArrowLeft')||touch.has('left')?1:0)+(pressed[14]?-1:pressed[15]?1:stick.x),
  lookX:mouse.x+lookX+axis(pad?.axes[2])*2.2*dt*deviceGain('controller')*horizontalSign,
  lookY:mouse.y+lookY+axis(pad?.axes[3])*1.6*dt*deviceGain('controller'),rear,
  crouch:toggleCrouch||down('crouch')||touch.has('crouch')||pressed[4],
  sprint:toggleSprint||down('sprint')||(bindings.sprint==='ShiftLeft'&&keys.has('ShiftRight'))||touchRun.active||pressed[7]||pressed[5],
  focus:down('focus')||touch.has('focus')||pressed[6],use:usePressed,acceleration:!!spatial.acceleration,reduced:prefs.reduced
 };
 lookX=lookY=0;usePressed=false;return i;
}
const text=(id,value)=>{if($(id).textContent!==value)$(id).textContent=value;};
function paint(){playtest?.observe(run,inputMethod);playtest?.refresh();const mode=run.mode,playing=live();finalCutLink.update(mode==='complete');document.body.dataset.mode=mode;document.body.classList.toggle('touch',inputMethod==='touch');$('hud').hidden=!playing;$('touch').hidden=!playing||inputMethod!=='touch';$('panel').hidden=playing;
 const runButton=document.querySelector('[data-key=sprint]');runButton.textContent=touchRun.active?'Run on':feel.touchSprintToggle?'Tap Run':'Run';runButton.setAttribute('aria-pressed',String(touchRun.active));
 const listening=playing&&run.player.focus===true;$('focus-state').hidden=!listening;document.querySelector('[data-key=focus]').setAttribute('aria-pressed',String(listening));
 text('control-guide',`${movementKeyLabel(bindings)} or arrows move relative to your view. Mouse or drag to look. ${onFootActionVerb('sprint','keyboard',feel)} ${label('sprint')} to run; ${onFootActionVerb('crouch','keyboard',feel)} ${label('crouch')} to crouch; ${label('focus')} listens; ${label('look_back')} glances behind; ${label('interact')} uses. F fullscreen. Controller: left stick move, right stick look, ${onFootActionVerb('sprint','gamepad',feel)} RT to run (RB also runs while held), ${onFootActionVerb('crouch','gamepad',feel)} LB to crouch, LT listen, A use, R3 rear, Start pause. Touch: movement pad and drag to look; ${onFootActionVerb('sprint','touch',feel)} Run to sprint, hold Crouch to crouch and Listen to focus. Listening Focus slows your movement, quiets water and brings Joe’s breathing and steps forward. It does not hide you from sight.`);
 text('sound',prefs.muted?'Sound off':'Sound on');text('district',district(run.player));text('objective',hudObjective(run));text('record-status',run.evidence?'RECORD KEPT':'');$('record-status').hidden=!run.evidence;
 text('hint',inputMethod==='gamepad'?'Left stick move · RT run · LB crouch · R3 rear · A use':inputMethod==='touch'?'Pad move · Drag look · Rear glance · Use':`${movementKeyLabel(bindings)} / arrows move · ${label('sprint')} run · ${label('crouch')} crouch · ${label('look_back')} rear · ${label('interact')} use`);
 const action=nearbyAction(run);document.body.classList.toggle('at-release',playing&&(action?.id==='gate'||run.closing));document.body.classList.toggle('closing',playing&&run.closing&&!run.finished);$('use').hidden=!action;text('use',(inputMethod==='gamepad'?'A':inputMethod==='touch'?'USE':label('interact'))+' · '+(action?.label||''));
 const observedJoe=observeJoe(run,{fov:prefs.fov,aspect:canvas.clientWidth/Math.max(1,canvas.clientHeight)}),imminent=observedJoe.imminent;
 // The world presents actions. This slot is only for explicitly enabled
 // accessibility sound descriptions, never action narration or coaching.
 const caption=shared.soundCaptions?(gratingCue.caption(run)||soundDescription(run,observedJoe)):'';
 text('caption',caption);$('caption').dataset.kind=caption?'sound':'';text('pursuit','');
 $('hint').hidden=run.elapsed>12||imminent;document.body.classList.toggle('imminent',imminent);
 const viewYaw=run.player.yaw+(run.player.rearAngle||0),viewCos=Math.cos(Math.atan(Math.tan(prefs.fov*Math.PI/360)*canvas.clientWidth/Math.max(1,canvas.clientHeight))+.04),water=run.closing?null:WATERS.filter(w=>{const dx=w.x-run.player.x,dy=w.y-run.player.y,forward=dx*Math.sin(viewYaw)+dy*Math.cos(viewYaw);return Math.hypot(dx,dy)<18&&lineClear(run.player,w,.02)&&(inWater(run.player,w,.5)||forward/Math.max(.01,Math.hypot(dx,dy))>viewCos);}).sort((a,b)=>distance(a,run.player)-distance(b,run.player))[0];$('water-read').hidden=!water||run.finished;
 if(water){const state=waterState(water,run.time,run.bypass,run.bypassAt),floodScale=floodCrossingScale(run.elapsed),speed=(run.player.crossingSpeed||movementPace(run.player))*floodScale/floodPace(run.player.floodDepth),advice=crossingAdvice(run.player,water,state,speed);
  const runOption=runningCrossingOption(run.player,water,state,speed,MOVEMENT.sprint*floodScale);
  const walkOption=walkingCrossingOption(run.player,water,state,speed,MOVEMENT.walk*floodScale);
  const stanceActions=[];
  if(run.player.crouched)stanceActions.push({verb:inputMethod!=='touch'&&feel.crouchToggle?'Tap':'Release',key:inputMethod==='gamepad'?'LB':inputMethod==='touch'?'Crouch':label('crouch')});
  if(run.player.focus)stanceActions.push({verb:'Release',key:inputMethod==='gamepad'?'LT':inputMethod==='touch'?'Listen':label('focus')});
  const walkControl=stanceActions.map((action,index)=>`${index&&action.verb===stanceActions[index-1].verb?'':action.verb+' '}${action.key}`).join(' + ');
  const runControl=inputMethod==='gamepad'?(feel.sprintToggle?'Tap RT':'Hold RT'):inputMethod==='touch'?(feel.touchSprintToggle?'Tap Run':'Hold Run'):`${feel.sprintToggle?'Tap':'Hold'} ${label('sprint')}`;
  $('water-read').dataset.lesson=water.lesson===true&&!run.lessonCrossed;
  $('water-read').dataset.danger=state.danger;$('water-read').dataset.action=advice.action;text('water-name',water.name);text('water-phase',walkOption?`WALK (${walkControl}) · ${state.safeFor.toFixed(1)}s TO SURGE`:runOption?`RUN (${runControl}) · ${state.safeFor.toFixed(1)}s TO SURGE`:advice.title);$('water-meter').value=state.level;
  $('water-read').dataset.runOption=String(!!runOption);
  $('water-read').dataset.walkOption=String(!!walkOption);
  document.body.classList.toggle('walking-option',!!walkOption);
  text('water-advice',walkOption?`This pace will not clear. ${walkControl}, then walk across now, or ${water.detour?'take the dry route.':'wait for the next opening.'}`:runOption?`Walking will not clear. ${runControl} to run across now, or ${water.detour?'take the dry route.':'wait for the next opening.'}`:advice.advice+(water.detour?' '+water.detour:''));
 }else document.body.classList.remove('walking-option');
 document.body.classList.toggle('crossing',!!water&&!run.finished);
 text('paused-objective',objective(run));$('paused-objective').hidden=mode!=='paused';
 document.body.classList.toggle('water-hit',!prefs.reduced&&run.waterLock>1.3);
 if(mode!==uiMode){uiMode=mode;if(!playing&&mode!=='intro'){release();clearInput();$('primary').focus({preventScroll:true});}if(mode==='caught'){$('comfort').open=false;$('journal').open=false;}dirty=true;}
 $('journal').hidden=!run.evidence;$('restart').hidden=mode==='briefing';$('guide').hidden=mode==='caught'||mode==='complete';$('result').hidden=mode!=='caught'&&mode!=='complete';
 $('defeat-art').hidden=mode!=='caught';if(mode==='caught')$('restart').hidden=true;
 text('title',mode==='caught'?'Caught below the green':mode==='complete'?'Beyond his reach':mode==='paused'?'Take a breath.':'Under the Green');
 text('tagline',mode==='caught'?'The scythe found its mark. Start again at the drain entrance.':mode==='complete'?'The sluice holds. The course continues above.':mode==='paused'?'Water, Joe and the clock are paused.':'You escaped the mower. He brought something smaller.');
 text('result',mode==='caught'?run.reason:'You sealed Joe out. Applause drifts down from the empty championship grounds.'+(run.evidence?' The groundskeeper’s record is with you: the 18th’s saturated turf cannot support heavy machinery.':' The maintenance record remains below. You can return for it on another escape.'));
 $('retry-advice').hidden=mode!=='caught';$('retry-progress').hidden=mode!=='caught';
 text('retry-advice',run.failure?'Next try: '+run.failure.advice:'Next try: move sideways when Joe plants his feet, or get behind solid cover.');
 text('retry-progress',retryProgress(run));
 text('primary',!ready?'Preparing…':mode==='caught'?'Retry from the start':mode==='complete'?'Replay Under the Green':mode==='paused'?'Resume escape':'Enter the drain');
 if(run.saveSerial!==lastSave&&ready){lastSave=run.saveSerial;persist();}
}
function update(dt){playtest?.observe(run,inputMethod);const i=input(dt);i.view={fov:prefs.fov,aspect:canvas.clientWidth/Math.max(1,canvas.clientHeight)};step(run,i,dt);playtest?.observe(run,inputMethod);audio.update(run);if(run.events.length>50)run.events.splice(0,run.events.length-50);}
function draw(){if(world){dirty=!world.draw(run,prefs,manual);if(!dirty){const contacts=world.drainJoeFootsteps();gratingCue.update(run,contacts);audio.footContacts(run,contacts);}if(dirty&&!manual)presentationWake.request(Math.max(4,world.presentationDelay()));else presentationWake.cancel();}paint();}
window.render_game_to_text=()=>JSON.stringify({...diagnostics(run),ready,opening:opening.snapshot(),inputMethod,touchRun:{toggle:feel.touchSprintToggle,active:touchRun.active},comfort:prefs,spatial:{...spatial,invertVertical:false},movementPreferences:{crouchToggle:feel.crouchToggle,sprintToggle:feel.sprintToggle},campaign:{...shared},graphics:world?.stats(),audio:audio.stats()});
window.advanceTime=ms=>{manual=true;presentationWake.cancel();const n=Math.max(0,Math.ceil(ms/(1000/60)));for(let i=0;i<n;i++)update(1/60);draw();};
if(test)window.__underGreen={get run(){return run;},set run(v){run=v;uiMode='';dirty=true;},render:draw,async whenPresented(){await world.whenPresented();},setInput(v){for(const k of v)keys.add(k);},inspectClearance:points=>world.inspectClearance(points),inspectCameraClearance:poses=>world.inspectCameraClearance(poses),inspectGateTravel:()=>world.inspectGateTravel(),inspectJoeGeometry:()=>world.inspectJoeGeometry(),inspectCastShadow:()=>world.inspectCastShadow(),inspectJoeFooting:()=>world.inspectJoeFooting(),inspectView:points=>world.inspectView(points),inspectOverhead:points=>world.inspectOverhead(points),enableTelemetry(){run.telemetry=createLocalTelemetry();return run.telemetry;},clearInput};
new ResizeObserver(()=>{dirty=true;}).observe(canvas);
function frame(t){const dt=Math.min(.1,(t-last)/1000);last=t;if(ready&&!manual){world.poll(live());if(live()){accumulator+=dt;while(accumulator>=1/60){update(1/60);accumulator-=1/60;}draw();}else{input();if(dirty)draw();}}requestAnimationFrame(frame);}
requestAnimationFrame(frame);world=await createUnderGreenScene(canvas,m=>text('loading',m),{captureBuffer:test});ready=true;opening.preloadFirst();$('primary').disabled=false;text('loading','');paint();draw();
