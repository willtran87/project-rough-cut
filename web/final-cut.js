import {VISUAL_KEY,visualTier} from './final-cut-visual-settings.js';
import {createRun,readSave,snapshot,step,objective,threat,nearbyAction,diagnostics} from './final-cut-sim.js';
import {finaleEntry,recordFinaleCompletion,FINAL_CAREER_KEY} from './final-cut-campaign.js';
import {finaleOutcome,evidenceFields,MASTERY,earnedMastery} from './final-cut-outcome.js';
import {SAVE_KEY,clamp} from './final-cut-course.js';
import {createFinalCutScene} from './final-cut-scene.js';
import {createFinalCutAudio} from './final-cut-audio.js';
import {campaignPreferences,readRecord,writeRecord,preferenceWriter} from './preference-store.js';
import {createFinalCutFeedback,feedbackPreferences,FEEDBACK_KEY} from './final-cut-feedback.js';
import {bindCampaignSettings} from './campaign-settings-ui.js';
import {actionBindings,keyLabel,movementKeyLabel,onFootActionVerb} from './control-profiles.js';
import {bindKeyboardSettings} from './keyboard-binding-settings.js';
import {createDOMGamepadMenu} from './dom-gamepad-menu.js';
import {createMouseLook} from './mouse-look.js';
import {createTouchRunControl} from './touch-run-control.js';
import {finalCutMessages} from './final-cut-messages.js';
import {freshAim} from './final-cut-balls.js';
import {CUT_PLANS,cutPlan} from './final-cut-schedule.js';
import {createFinalCutStory,FINAL_CUT_ART} from './final-cut-story.js';
const $=id=>document.getElementById(id),canvas=$('game'),query=new URLSearchParams(location.search),keys=new Set(),touch=new Set();
const preferences=campaignPreferences(matchMedia('(prefers-reduced-motion:reduce)').matches),spatialStore=RCSpatialPreferences.create();let spatial=spatialStore.get();
const feel=RCFoundation.readComfort(),touchRun=createTouchRunControl();let toggleCrouch=false,toggleSprint=false,dirty=true;
const bindings=actionBindings('onFoot',preferences.keyboardBindings,preferences.keyboardBindingsVersion||0),label=id=>keyLabel(bindings[id]);
let raw=null;try{raw=localStorage.getItem(SAVE_KEY);}catch{}
const entry=finaleEntry(query.get('from')),saved=readSave(raw),initial=saved&&(!query.has('from')||saved.route===entry.route)?{...entry,...saved,priorEvidence:Math.max(entry.priorEvidence,saved.priorEvidence),groundskeeper:entry.groundskeeper||saved.groundskeeper,crewLogs:entry.crewLogs|saved.crewLogs}:entry;
let resultView='summary',replayRunId=null,replaySeed=0,story=null,introRunId=null,winStoryRunId=null;
let run=createRun(initial,entry.route),world=null,ready=false,manual=false,last=performance.now(),savedSerial=-1,device=matchMedia('(pointer:coarse)').matches?'touch':'keyboard',usePressed=false,chipPressed=false,chipReleased=false,chipOwner=null,lookX=0,lookY=0,drag=null,padButtons=[],panelMode='';
const feedbackPrefs=feedbackPreferences(readRecord(FEEDBACK_KEY)),saveFeedback=preferenceWriter(FEEDBACK_KEY,feedbackPrefs),feedback=createFinalCutFeedback();let activePad=null;
const audio=createFinalCutAudio(()=>({...preferences,footsteps:feedbackPrefs.footsteps}),run),mouse=createMouseLook(),live=()=>!story?.active&&['playing','aftermath'].includes(run.mode);
const text=(id,value)=>{if($(id).textContent!==value)$(id).textContent=value;};
function clearInput(){feedback.update(run,null,false,0);keys.clear();touch.clear();touchRun.reset();toggleCrouch=toggleSprint=false;usePressed=chipPressed=chipReleased=false;chipOwner=null;run.ballAim=freshAim();lookX=lookY=0;drag=null;mouse.reset();dirty=true;}
function beginChip(source){if(!live())return;if(chipOwner!==source)run.ballAim=freshAim();chipOwner=source;chipPressed=true;chipReleased=false;}
function releaseChip(source){if(chipOwner===source&&live())chipReleased=true;}
function persist(){const saved=writeRecord(SAVE_KEY,snapshot(run));if(run.completed)recordFinaleCompletion(run);text('save-note',saved?(run.completed?'Escape saved on this device.':'Checkpoint saved on this device. Completed preparation is retained.'):'Storage is unavailable. Checkpoints still work during this session.');savedSerial=run.saveSerial;}
function enterRound(){audio.start();if(run.mode==='caught'){const attempt=run.attempt+1;run=createRun(snapshot(run));run.attempt=attempt;savedSerial=-1;}else if(run.mode==='complete'){run=createRun({route:run.route,stationReceipt:run.stationReceipt,...evidenceFields(run),priorEvidence:run.priorEvidence,seed:replaySeed});savedSerial=-1;}run.mode=run.won?'aftermath':'playing';clearInput();canvas.focus();paint();persist();}
function primary(){if(!ready||story?.active)return;if(run.mode==='briefing'&&run.checkpoint===0&&introRunId!==run.runId&&!story.shouldSkip()){introRunId=run.runId;story.open('intro',enterRound);return;}enterRound();}
function pause(){if(live()){run.resumeMode=run.mode;run.mode='paused';clearInput();persist();if(document.pointerLockElement)document.exitPointerLock();}else if(run.mode==='paused'){run.mode=run.resumeMode||'playing';canvas.focus();}paint();audio.update(run);}
function showResultView(view){if(run.mode!=='complete')return;resultView=view;panelMode='';clearInput();paint();$('panel').scrollTop=0;$(view==='credits'?'credits-back':view==='notice'?'notice-back':'show-credits').focus({preventScroll:true});}
const menu=createDOMGamepadMenu({root:$('panel'),onStart:()=>{if(run.mode==='complete'&&resultView!=='summary')showResultView('summary');else pause();},onBack:()=>{if(run.mode==='complete'&&resultView!=='summary')showResultView('summary');else if(run.mode==='paused')pause();},onDisconnect:()=>{if(device==='gamepad'&&live())pause();}});
story=createFinalCutStory({root:$('shell'),reduced:()=>preferences.reducedMotion,onGesture:()=>audio.start(),fullscreen:()=>{if(document.fullscreenElement)document.exitFullscreen();else $('shell').requestFullscreen().catch(()=>{});},onOpen:()=>{clearInput();if(document.pointerLockElement)document.exitPointerLock();},onClose:()=>{clearInput();dirty=true;paint();$('primary').focus({preventScroll:true});}});
if(run.completed)winStoryRunId=run.runId;
$('splash-image').src=FINAL_CUT_ART.splash;$('defeat-image').src=FINAL_CUT_ART.loss;
$('story-replay').onclick=()=>story.open(run.completed?'win':'intro');
$('show-credits').onclick=()=>showResultView('credits');$('credits-back').onclick=()=>showResultView('summary');$('show-notice').onclick=()=>showResultView('notice');$('notice-back').onclick=$('notice-skip').onclick=()=>showResultView('summary');
for(const plan of CUT_PLANS){const option=document.createElement('option');option.value=String(plan.seed);option.textContent=plan.name;$('replay-plan').append(option);}
$('replay-plan').onchange=()=>{replaySeed=Number($('replay-plan').value);text('replay-description',CUT_PLANS[replaySeed].description+' The bell and golf balls can still call his next pass away.');};
$('primary').onclick=primary;$('pause').onclick=pause;$('restart').onclick=()=>{run=createRun({route:run.route,stationReceipt:run.stationReceipt,...evidenceFields(run),priorEvidence:run.priorEvidence,seed:run.seed});savedSerial=-1;primary();};$('use').onclick=()=>usePressed=true;
const campaignUI=bindCampaignSettings($('comfort'),preferences,()=>{dirty=true;audio.update(run);});$('sound').onclick=()=>campaignUI.set('muted',!preferences.muted);
const keyboard=bindKeyboardSettings($('keyboard'),{profile:'onFoot',stored:bindings,storageField:'keyboardBindings',labels:{move_up:'Forward',move_down:'Backward',move_left:'Left',move_right:'Right',sprint:'Run',crouch:'Crouch',focus:'Listen',look_back:'Rear glance',interact:'Use',chip:'Chip ball',controls:'Map / guide'},onChange:b=>{Object.assign(bindings,b);clearInput();paint();}});
let selectedVisualTier=visualTier(readRecord(VISUAL_KEY).tier);
$('visual-tier').value=selectedVisualTier;
$('visual-tier').addEventListener('change',()=>{selectedVisualTier=visualTier($('visual-tier').value);dirty=true;text('visual-settings-status',writeRecord(VISUAL_KEY,{tier:selectedVisualTier})?'':'Settings apply for this session. Browser storage is unavailable.');});
function syncSpatial(){for(const el of document.querySelectorAll('[data-spatial]')){if(el.type==='checkbox')el.checked=spatial[el.dataset.spatial];else el.value=spatial[el.dataset.spatial];}}
spatialStore.subscribe((v,name,saved)=>{spatial=v;dirty=true;syncSpatial();text('spatial-settings-status',saved?'':'Settings apply for this session. Browser storage is unavailable.');});syncSpatial();for(const el of document.querySelectorAll('[data-spatial]'))el.addEventListener('input',()=>spatialStore.set(el.dataset.spatial,el.type==='checkbox'?el.checked:Number(el.value)));
for(const el of document.querySelectorAll('[data-feedback]')){const name=el.dataset.feedback;el.value=feedbackPrefs[name];text('feedback-'+name,Math.round(feedbackPrefs[name]*100)+'%');el.addEventListener('input',()=>{feedbackPrefs[name]=feedbackPreferences({...feedbackPrefs,[name]:Number(el.value)})[name];feedback.stop();audio.update(run);text('feedback-'+name,Math.round(feedbackPrefs[name]*100)+'%');text('feedback-settings-status',saveFeedback(feedbackPrefs)?'':'Settings apply for this session. Browser storage is unavailable.');});}
document.addEventListener('keydown',e=>{
 if(e.target.matches('input,select,summary')&&e.code!=='Escape')return;
 if(e.code==='Escape'){e.preventDefault();if(run.mode==='complete'&&resultView!=='summary')showResultView('summary');else pause();return;}
 if(e.code==='KeyF'){e.preventDefault();if(document.fullscreenElement)document.exitFullscreen();else $('shell').requestFullscreen().catch(()=>{});return;}
 if(!live()){if(e.code==='Enter'&&!e.target.matches('button,a')&&resultView==='summary'){e.preventDefault();primary();}return;}
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
 if(device==='touch')clearInput();device='keyboard';keys.add(e.code);
 if(!e.repeat&&e.code===bindings.interact)usePressed=true;
 if(!e.repeat&&e.code===bindings.chip)beginChip('keyboard');
 if(!e.repeat&&e.code===bindings.crouch&&feel.crouchToggle)toggleCrouch=!toggleCrouch;
 if(!e.repeat&&e.code===bindings.sprint&&feel.sprintToggle)toggleSprint=!toggleSprint;
 if(!e.repeat&&e.code===bindings.controls)pause();
});
document.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code===bindings.chip)releaseChip('keyboard');});window.addEventListener('blur',()=>{feedback.stop();if(live())pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){feedback.stop();if(live())pause();}audio.update(run);});window.addEventListener('pagehide',()=>{feedback.stop();persist();});
canvas.addEventListener('click',()=>{if(live()&&device!=='touch'){audio.start();canvas.requestPointerLock?.()?.catch?.(()=>{});}});
canvas.addEventListener('pointerdown',e=>{if(!live()||drag)return;device=e.pointerType==='touch'?'touch':'keyboard';audio.start();drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!live())return;const locked=document.pointerLockElement===canvas;if(!locked&&drag?.id!==e.pointerId)return;const dx=locked?e.movementX:e.clientX-drag.x,dy=locked?e.movementY:e.clientY-drag.y;
 if(e.pointerType==='touch'){const gain=.004*spatial.touch*1280/Math.max(1,canvas.clientWidth);lookX+=dx*gain*(preferences.invertLook?-1:1);lookY+=dy*gain;}else mouse.push(dx*.0025*spatial.mouse**2*(preferences.invertLook?-1:1),dy*.0025*spatial.mouse**2);
 if(drag){drag.x=e.clientX;drag.y=e.clientY;}
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(drag?.id===e.pointerId){if(name==='pointerup')drag=null;else clearInput();}});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&live()&&device!=='touch'&&!manual)pause();});
for(const el of document.querySelectorAll('[data-key]')){
 el.addEventListener('pointerdown',e=>{e.preventDefault();if(!live())return;device='touch';audio.start();el.setPointerCapture(e.pointerId);touch.add(el.dataset.key);if(el.dataset.key==='sprint')touchRun.press(e.pointerId,feel.touchSprintToggle);if(el.dataset.key==='use')usePressed=true;if(el.dataset.key==='chip')beginChip('touch');});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(name,e=>{if(name==='pointercancel'||name==='lostpointercapture'&&touch.has(el.dataset.key)){clearInput();return;}if(el.dataset.key==='chip'&&name==='pointerup')releaseChip('touch');touch.delete(el.dataset.key);if(el.dataset.key==='sprint'&&name==='pointerup')touchRun.release(e.pointerId);});
}
function input(dt){
 const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected),pressed=pad?.buttons.map(b=>b.pressed)||[];
 if(story.active){story.updatePad(pad,dt);padButtons=pressed;activePad=pad;return {};}
 const wasMenu=!live(),consumed=menu.update(pad,wasMenu,dt);
 activePad=pad;
 const deadzone=clamp(Number(preferences.stickDeadzone)||.22,.1,.3);
 const stick=RCFoundation.stick(pad?.axes[0]||0,-(pad?.axes[1]||0),deadzone);
 if(pad&&(Math.hypot(stick.x,stick.y)>0||pad.axes.slice(2).some(v=>Math.abs(v)>deadzone)||pressed.some(Boolean))){if(device==='touch')clearInput();device='gamepad';}
 if(!wasMenu&&!consumed){if(pressed[0]&&!padButtons[0])usePressed=true;if(pressed[2]&&!padButtons[2])beginChip('gamepad');if(!pressed[2]&&padButtons[2])releaseChip('gamepad');if(pressed[4]&&!padButtons[4]&&feel.crouchToggle)toggleCrouch=!toggleCrouch;if(pressed[7]&&!padButtons[7]&&feel.sprintToggle)toggleSprint=!toggleSprint;}padButtons=pressed;
 if(wasMenu||consumed)return {};
 const down=id=>keys.has(bindings[id]),axis=v=>Math.sign(v||0)*Math.pow(clamp((Math.abs(v||0)-deadzone)/(1-deadzone),0,1),1.35),rear=down('look_back')||touch.has('rear')||pressed[11];
 if(rear||device!=='keyboard')mouse.reset();const m=mouse.sample(dt),i={
 forward:(down('move_up')||keys.has('ArrowUp')||touch.has('forward')?1:0)-(down('move_down')||keys.has('ArrowDown')||touch.has('back')?1:0)+stick.y,
 strafe:(down('move_right')||keys.has('ArrowRight')||touch.has('right')?1:0)-(down('move_left')||keys.has('ArrowLeft')||touch.has('left')?1:0)+stick.x,
 lookX:m.x+lookX+axis(pad?.axes[2])*2.2*dt*spatial.controller*(preferences.invertLook?-1:1),lookY:m.y+lookY+axis(pad?.axes[3])*1.6*dt*spatial.controller,rear,acceleration:!!spatial.acceleration,
 crouch:toggleCrouch||down('crouch')||touch.has('crouch')||pressed[4],sprint:toggleSprint||down('sprint')||touchRun.active||pressed[7]||pressed[5],focus:down('focus')||touch.has('focus')||pressed[6],use:usePressed,chipStart:chipPressed,chipRelease:chipReleased,chipHeld:chipOwner==='keyboard'?down('chip'):chipOwner==='touch'?touch.has('chip'):chipOwner==='gamepad'?!!pressed[2]:false};
 if(chipReleased)chipOwner=null;usePressed=chipPressed=chipReleased=false;lookX=lookY=0;return i;
}
function paint(){
 const active=live(),action=nearbyAction(run);document.body.classList.toggle('touch',device==='touch');$('hud').hidden=!active;$('touch').hidden=!active||device!=='touch';$('panel').hidden=active;$('loading').hidden=ready&&run.mode!=='briefing';
 text('objective',objective(run));text('checkpoint',`${['ARRIVAL','PUMP PREPARED','MACHINE DISABLED'][run.checkpoint]}${run.evidence?' · RECORD SECURED':''}`);
 const messages=finalCutMessages(run,preferences);
 const aim=run.ballAim,chipKey=device==='gamepad'?'X':device==='touch'?'Chip':label('chip'),useKey=device==='gamepad'?'A':device==='touch'?'Use':label('interact');
 $('ball-status').hidden=!active||run.won||messages.urgent;const target=aim.plan?.target;
 text('ball-status',aim.active?`${aim.plan?.blocked?'BLOCKED · Adjust aim':`${Math.round(aim.power*100)}% · ${Math.round(Math.hypot(target.x-run.player.x,target.y-run.player.y))} m · Release ${chipKey} to chip`} · ${useKey} cancels`:run.ballCount?`${run.ballCount}/3 balls · Hold ${chipKey} to aim`:'0/3 balls · Recover one or use a practice basket');$('ball-status').dataset.blocked=String(!!aim.plan?.blocked);
 $('reticle').hidden=aim.active;
 text('threat',!messages.urgent&&(preferences.threatCaptions||run.player.focus)?threat(run):'');text('caption',messages.caption);$('caption').dataset.kind=messages.kind;text('dialogue',messages.dialogue);
 $('use').hidden=!action;text('use',`${device==='gamepad'?'A':device==='touch'?'USE':label('interact')} · ${action?.label||''}`);
 text('hint',device==='gamepad'?'Left stick move · RT run · R3 rear · A use':device==='touch'?'Pad move · Drag look · Rear glance · Use':`${movementKeyLabel(bindings)} move · ${label('sprint')} run · ${label('look_back')} rear · ${label('interact')} use`);$('hint').hidden=messages.urgent||run.elapsed>18;
 text('sound',preferences.muted?'Sound off':'Sound on');$('journal').hidden=!(run.loadLimit||run.groundskeeper)||run.mode==='complete';
 text('control-guide',`${movementKeyLabel(bindings)} / arrows move; mouse or drag looks. ${onFootActionVerb('sprint','keyboard',feel)} ${label('sprint')} to run; ${onFootActionVerb('crouch','keyboard',feel)} ${label('crouch')} to crouch; ${label('focus')} listens; ${label('look_back')} glances behind; ${label('interact')} uses. Hold ${label('chip')} to charge a ball, look to aim, then release to chip; Use cancels. The dotted arc shows its path. Blocked shots keep the ball. Recover landed balls with Use or refill at a practice-ball basket. ${label('controls')} opens the guide. Controller: left stick move, right stick look, ${onFootActionVerb('sprint','gamepad',feel)} RT to run, ${onFootActionVerb('crouch','gamepad',feel)} LB to crouch, LT listen, R3 rear, A use/cancel, hold/release X chip, Start pause. Touch: ${onFootActionVerb('sprint','touch',feel)} Run to sprint, hold Crouch to crouch. Hold Chip and drag the scene to aim, then release.`);
 if(panelMode!==run.mode){dirty=true;panelMode=run.mode;const caught=run.mode==='caught',complete=run.mode==='complete',paused=run.mode==='paused';
  if(!complete)resultView='summary';$('panel').classList.toggle('completed',complete);$('panel').classList.toggle('caught',caught);$('panel').dataset.contact=caught?run.failure?.kind||'chassis':'';const outcome=complete?finaleOutcome(run):null,extra=complete&&resultView!=='summary';
  $('panel').classList.toggle('briefing',run.mode==='briefing');$('chapter-splash').hidden=run.mode!=='briefing';$('defeat-backdrop').hidden=!caught;$('loss-quote').hidden=!caught;$('loss-story').hidden=!caught;
  $('story-replay').hidden=caught||extra;text('story-replay',complete?'Replay ending scene':'Watch opening story');
  text('loss-quote','“There. That’s the part we needed to correct.”');text('loss-story','Joe’s smile returns before the engine settles. To him, this is still a routine review.');
  if(caught){clearInput();$('panel').scrollTop=0;if(document.pointerLockElement)document.exitPointerLock();}
  text('title',caught?run.failure?.title||'A cut too close':complete?(resultView==='credits'?'Credits':resultView==='notice'?'One last notice':outcome.title):paused?'Round suspended':'The Final Cut');
  $('round-plan').hidden=!paused||run.seed===0;text('round-plan',cutPlan(run).name+' · '+cutPlan(run).description);
  $('tagline').hidden=caught||complete||paused;$('guide').hidden=caught||complete;$('arrival').hidden=caught||complete||paused;
  text('arrival',run.route==='garage'?'The garage shutter holds. A pedestrian service walk leads to the championship overlook.':run.route==='drain'?'The keeper’s sluice holds. Follow the wet passage to the championship overlook; applause rises beyond the clubhouse.':'The public road lies beyond the championship hole. The overlook is safe. Use the final-round control below it when you are ready.');
  $('ending-art').hidden=!complete||extra;$('result').hidden=(!caught&&!complete)||extra;$('advice').hidden=!caught;$('retained').hidden=!caught;
  $('completion-details').hidden=!complete||extra;$('final-credits').hidden=!complete||resultView!=='credits';$('post-credits').hidden=!complete||resultView!=='notice';$('primary').hidden=extra;$('comfort').hidden=extra;
  text('result',caught?run.failure?.cause||'The machine reached you.':complete?outcome.survival+' '+outcome.aftermath:'');
  if(complete){text('aftermath-report',outcome.report);text('outcome-route',outcome.route);text('outcome-record-count',outcome.records.length?`${outcome.records.length} recovered record group${outcome.records.length===1?'':'s'}`:'Your statement. No documents were recovered.');
   text('outcome-plan',cutPlan(run).name);
   if(replayRunId!==run.runId){replayRunId=run.runId;replaySeed=(run.seed+1)%CUT_PLANS.length;}
   $('replay-plan').value=String(replaySeed);$('replay-plan').onchange();
   const img=$('ending-image');if(img.getAttribute('src')!==outcome.art)img.src=outcome.art;img.alt=outcome.alt;
   $('outcome-records').replaceChildren(...outcome.records.map(r=>{const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=r.title;li.append(strong,document.createTextNode(r.meaning));return li;}));
   const storedMastery=readRecord(FINAL_CAREER_KEY).mastery,earned=new Set([...(Array.isArray(storedMastery)?storedMastery:[]),...earnedMastery(run)]);$('mastery-list').replaceChildren(...MASTERY.map(m=>{const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=`${earned.has(m.id)?'Earned · ':''}${m.title}`;li.append(strong,document.createTextNode(m.description));return li;}));
  }
  text('advice',run.failure?.advice||'');text('retained',`Retry from ${['the protected overlook','the pump shelter; the bypass stays open','the secured pavilion'][run.checkpoint]}.`);
  text('primary',caught?'Retry checkpoint':complete?'Replay the Final Cut':paused?'Resume':run.checkpoint?'Continue chapter':'Enter the final round');$('restart').hidden=!paused;
  if(!active&&ready&&!story.active)$('primary').focus({preventScroll:true});
  if(complete&&ready&&winStoryRunId!==run.runId){winStoryRunId=run.runId;queueMicrotask(()=>{if(run.mode==='complete'&&!story.active)story.open('win');});}
 }
}
function update(dt){const controls=input(dt);controls.viewHalfFov=Math.atan(Math.tan(spatial.fov*Math.PI/360)*canvas.clientWidth/Math.max(1,canvas.clientHeight));controls.reducedMotion=preferences.reducedMotion;if(!story.active)step(run,controls,dt);if(run.saveSerial!==savedSerial)persist();audio.update(run);feedback.update(run,activePad,!story.active&&device==='gamepad'&&!document.hidden,feedbackPrefs.vibration);paint();}
function draw(){world?.render(run,{...spatial,visualTier:selectedVisualTier,reduced:preferences.reducedMotion});}
function frame(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(ready&&!manual&&!document.hidden){update(dt);if(live()||dirty){draw();dirty=false;}}requestAnimationFrame(frame);}
new ResizeObserver(()=>{dirty=true;if(manual)draw();}).observe(canvas);
window.render_game_to_text=()=>JSON.stringify({...diagnostics(run),ready,story:story.snapshot(),inputMethod:device,bindings,resultView,outcome:run.completed?finaleOutcome(run):null,mastery:earnedMastery(run),graphics:world?.stats(),audio:audio.stats(),feedback:feedback.stats(),preferences:{reduced:preferences.reducedMotion,muted:preferences.muted,...feedbackPrefs}});
window.advanceTime=async ms=>{manual=true;const n=Math.ceil(Math.max(0,ms)/(1000/60));for(let k=0;k<n;k++)update(Math.min(1/60,ms/1000-k/60));paint();draw();await new Promise(resolve=>requestAnimationFrame(resolve));};
if(query.has('test'))window.__finalCut={get run(){return run;},set run(v){story.close('fixture-reset',false);run=v;savedSerial=-1;clearInput();panelMode='';},rigGeometry:()=>world?.rigGeometry(),draw,preferences,spatialStore};
paint();world=await createFinalCutScene(canvas,message=>text('loading',message));ready=true;$('primary').disabled=false;text('loading',run.checkpoint?'Ready. Your checkpoint is kept.':'Ready. The overlook is safe.');panelMode='';paint();draw();requestAnimationFrame(frame);
