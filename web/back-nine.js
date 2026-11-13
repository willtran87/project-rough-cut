import {validVariationSeed,nextVariationSeed} from './chase-variation.js';
import {mountFinalCutLink} from './final-cut-campaign.js';
import {restoreEscape,escapeCopy,captureFailure} from './chase-outcome.js';
import {encounterAllows} from './chase-encounter.js';
import {bindCampaignSettings} from './campaign-settings-ui.js';
import {bindKeyboardSettings} from './keyboard-binding-settings.js';
import {chaseMessages} from './back-nine-messages.js';
import {createDOMGamepadMenu} from './dom-gamepad-menu.js';
import {createChatterGate} from './message-presentation.js';
import {createDefeatPicker} from './defeat-dialogue.js';
import {cartCondition} from './cart-condition.js';
import {campaignPreferences,readRecord,writeRecord} from './preference-store.js';
import {chaseActor} from './chase-player.js';
import {variedJoeCaption} from './back-nine-dialogue.js';
import {createJoeReactions,dialogueApproachClear} from './back-nine-reactions.js';
import {createChaseControls,chaseDeadzone,chaseStickAxis} from './back-nine-controls.js';
import {ramDamageScale} from './ram-damage.js';
import {chaseBrief,CREW_LOGS,speedMph,district,journalText} from './back-nine-story.js';
import * as THREE from './vendor/three/three.module.js';
import {createRun,updateRun,objective} from './back-nine-sim.js';
import {COURSE,distance,clamp,navigationStats} from './back-nine-course.js';
import {createChaseScene} from './back-nine-scene.js';
import {createChaseAudio} from './back-nine-audio.js';
import {createSoftwareFrameBudget} from './software-frame-budget.js';
import {createFrameWake} from './frame-wake.js';
import {createOpeningStory} from './opening-story.js?v=20261111-back-nine';
import {BACK_NINE_SLIDES,paintBackNineBrief,backNineHint,backNineControls,backNineInstruction} from './back-nine-opening.js';

const playtestMode=new URLSearchParams(location.search).has('playtest');
const elements=new Map(),$=id=>elements.get(id)||(elements.set(id,document.getElementById(id)),elements.get(id)),SAVE='rough-cut.back-nine.v1';
const finalCutLink=mountFinalCutLink(document.querySelector('#panel-footer .actions'),'garage');
const joeReactions=createJoeReactions(),chatter=createChatterGate({duration:text=>Math.max(3.5,Math.min(6,text.length/24))}),pickDefeat=createDefeatPicker();
// Avoid replacing unchanged text nodes (and invalidating layout) every RAF.
function setText(id,value){const element=$(id);if(element.textContent!==value)element.textContent=value;}
function setHidden(id,value){const element=$(id);if(element.hidden!==value)element.hidden=value;}
function setClass(element,name,value){if(element.classList.contains(name)!==value)element.classList.toggle(name,value);}
function setData(element,name,value){value=String(value);if(element.dataset[name]!==value)element.dataset[name]=value;}
const coarsePointer=matchMedia('(pointer:coarse)'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let canvasAspect=16/9;
new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;if(width>0&&height>0&&canvasAspect!==width/height){canvasAspect=width/height;needsDraw=true;}}).observe($('game'));
const read=readRecord;
const saved=read(SAVE),settings=campaignPreferences(reducedMotion.matches),prefs=RCSpatialPreferences.create().get();
// Retain course variation and campaign completion, never an in-run checkpoint.
if(!validVariationSeed(saved.variationSeed)){saved.variationSeed=nextVariationSeed();writeRecord(SAVE,{...saved,variationSeed:saved.variationSeed});}
let run=createRun(0,0,saved.variationSeed),world=null,ready=false,manual=false,last=performance.now(),accumulator=0,fence=null,events=0,needsDraw=true;
const chaseControls=createChaseControls($('game'),()=>run,settings);
if(saved.completed)restoreEscape(run,saved.escape);
const driveButtons=new Map([...document.querySelectorAll('[data-drive]')].map(b=>[b.dataset.drive,b]));
const keys=new Set(),touch=new Set(),audio=createChaseAudio(settings.volume??.72,settings),budget=createSoftwareFrameBudget(),times=[];
const {bindings}=bindKeyboardSettings($('chase-keyboard'),{profile:'chase',stored:settings.chaseKeyboardBindings,storageField:'chaseKeyboardBindings',
 labels:{move_up:'Forward / accelerate',move_down:'Back / reverse',move_left:'Steer left',move_right:'Steer right',brake:'Brake / use',interact:'Alternate brake / use',look_back:'Rear glance'},
 onChange(value){settings.chaseKeyboardBindings={...value};keys.clear();touch.clear();briefSignature='';needsDraw=true;paintUI();}});
const down=action=>keys.has(bindings[action]);
const campaignUI=bindCampaignSettings($('chase-comfort'),settings,()=>{needsDraw=true;audio.update(run,['driving','sealing','dying'].includes(run.mode));paintUI();});
const renderer=new THREE.WebGLRenderer({canvas:$('game'),antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info'),gpu=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),software=/swiftshader|llvmpipe|software|microsoft basic render/i.test(gpu);
let pendingFootContacts=[],renderStarted=0,frames=0,gamepadButtons=[],uiMode='',announcedImpact=null,announcedRam='',pausedMode='driving',foreground=true;
const presentationWake=createFrameWake(()=>render(false),()=>software&&!manual&&foreground&&!document.hidden&&ready&&!openingActive&&(['driving','sealing','dying'].includes(run.mode)||needsDraw));
let openingActive=false,openingSlide=0,preparePromise=null,inputMethod=coarsePointer.matches?'touch':'keyboard',briefSignature='';
let guideReview=false,briefArtRequested=false;
function prepareBriefArt(){if(briefArtRequested)return;briefArtRequested=true;const image=$('brief-image');image.src=BACK_NINE_SLIDES[4].src;image.decode().catch(()=>{$('brief-art').dataset.failed='true';});}
 let defeatArtRequested=false;
 function prepareDefeatArt(){if(defeatArtRequested)return;defeatArtRequested=true;const image=$('defeat-image');image.src='./assets/optimized/back-nine-run-down-v1.webp';image.decode().catch(()=>{$('defeat-tableau').dataset.failed='true';});}
const opening=createOpeningStory({slides:BACK_NINE_SLIDES,storageKey:'rough-cut.back-nine-opening.v1',header:'THE BACK NINE',replayHint:'Replay it from the chase guide or pause menu.',
 reducedMotion:()=>settings.reducedMotion??reducedMotion.matches,captions:()=>settings.subtitles!==false,
 toggleFullscreen:()=>{if(document.fullscreenElement)document.exitFullscreen();else $('game-shell').requestFullscreen?.();},
 onGesture:()=>{if(navigator.userActivation?.hasBeenActive){audio.start();audio.intro(openingSlide,openingActive&&!document.hidden,settings);}},
 onSlide:(_slide,index)=>{openingSlide=index;audio.intro(index,true,settings);},
 finish:()=>{openingActive=false;if(run.mode==='briefing')prepareBriefArt();audio.intro(openingSlide,false,settings);keys.clear();touch.clear();accumulator=0;last=performance.now();uiMode='';paintUI();prepareCourse();if(ready)$('primary').focus({preventScroll:true});},
});
function showOpening(){if(openingActive)return;openingActive=true;keys.clear();touch.clear();setHidden('panel',true);setHidden('defeat-tableau',true);$('panel').dataset.defeat='false';setHidden('hud',true);setHidden('touch',true);$('dread').style.opacity='0';opening.open();}
function freshRound(){run=createRun(0,0,nextVariationSeed(run.variation.seed));events=0;save();world?.resetCamera();uiMode='';needsDraw=true;if(!opening.shouldSkip())showOpening();else{paintUI();prepareCourse();}}
function save(){if(!writeRecord(SAVE,{version:2,variationSeed:run.variation.seed,completed:run.mode==='complete',unlocked:true,escape:run.mode==='complete'?run.escape:null})){run.message='Browser storage is unavailable. This attempt can still be played.';run.messageTime=4;}}
function input(){
 const pad=navigator.getGamepads?.()?.find?.(p=>p?.connected),pressed=i=>!!pad?.buttons[i]?.pressed;
 const deadzone=chaseDeadzone(settings.stickDeadzone),stickX=chaseStickAxis(pad?.axes[0],deadzone),stickY=chaseStickAxis(pad?.axes[1],deadzone);
 const steer=(down('move_right')||keys.has('ArrowRight')||touch.has('right')?1:0)-(down('move_left')||keys.has('ArrowLeft')||touch.has('left')?1:0);
 const gas=down('move_up')||keys.has('ArrowUp')||touch.has('gas'),reverse=down('move_down')||keys.has('ArrowDown')||touch.has('reverse');
 const wasMenu=!openingActive&&['briefing','paused','caught','complete'].includes(run.mode);
 if(openingActive)gamepadMenu.update(pad,false);
 if(pad){
  if(pad.buttons.some(b=>b.pressed)||pad.axes.some(v=>Math.abs(v)>deadzone))inputMethod='gamepad';
  if(openingActive){if((pressed(0)&&!gamepadButtons[0])||(pressed(15)&&!gamepadButtons[15]))opening.action('next');else if(pressed(14)&&!gamepadButtons[14])opening.action('back');else if((pressed(1)&&!gamepadButtons[1])||(pressed(9)&&!gamepadButtons[9]))opening.action('skip');gamepadButtons=pad.buttons.map(b=>b.pressed);return {};}
 }
 const menuConsumed=gamepadMenu.update(pad,!openingActive&&['briefing','paused','caught','complete'].includes(run.mode));
 gamepadButtons=pad?pad.buttons.map(b=>b.pressed):[];
 if(wasMenu||menuConsumed)return {};
 return {steer:clamp(steer+stickX,-1,1),throttle:clamp(Number(gas)-Number(reverse)+(pad?.buttons[7]?.value||0)-(pad?.buttons[6]?.value||0)+(run.foot?-stickY:0),-1,1),brake:down('brake')||down('interact')||touch.has('brake')||pressed(1),rear:down('look_back')||touch.has('rear')||pressed(11)};
}
function primary(){if(openingActive||!ready||run.mode==='sealing'||run.mode==='dying')return;audio.start();if(run.mode==='caught'){run=createRun(0,0,nextVariationSeed(run.variation.seed));events=0;world.resetCamera();}if(run.mode==='complete'){freshRound();return;}run.mode=run.mode==='paused'?pausedMode:'driving';keys.clear();touch.clear();chaseControls.reset();save();uiMode='';$('game').focus();paintUI();}
function togglePause(){if(!ready)return;if(['driving','sealing','dying'].includes(run.mode)){pausedMode=run.mode;run.mode='paused';keys.clear();touch.clear();chaseControls.reset();}else if(run.mode==='paused')run.mode=pausedMode;audio.update(run,run.mode==='driving'||run.mode==='sealing'||run.mode==='dying'||run.mode==='complete'&&run.finale.tail>0);uiMode='';paintUI();}
const gamepadMenu=createDOMGamepadMenu({root:$('panel'),onStart:()=>{if(!openingActive)togglePause();},onBack:()=>{if(run.mode==='paused')togglePause();},onDisconnect:()=>{if(inputMethod==='gamepad'&&['driving','sealing','dying'].includes(run.mode))togglePause();}});
$('primary').addEventListener('click',primary);$('pause').addEventListener('click',togglePause);$('restart').addEventListener('click',freshRound);$('replay-story').addEventListener('click',showOpening);
$('playtest-feedback').addEventListener('click',()=>{if(!playtestMode)return;if(['driving','sealing','dying'].includes(run.mode))togglePause();const stored=writeRecord('rough-cut.back-nine.playtest-snapshot.v1',{capturedAt:new Date().toISOString(),build:'20261112-experience',run:JSON.parse(window.render_game_to_text())});window.open('./back-nine-playtest.html'+(stored?'':'?snapshot=none'),'_blank','noopener');});
$('review-guide').addEventListener('click',()=>{guideReview=!guideReview;paintUI();$('panel-content').scrollTop=0;});
$('panel').addEventListener('keydown',event=>{if(event.key!=='Tab'||openingActive)return;const items=[...$('panel').querySelectorAll('button:not(:disabled),a,input,summary')].filter(e=>e.getClientRects().length);if(!items.length)return;const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
$('sound').addEventListener('click',()=>{audio.start();campaignUI.set('muted',!settings.muted);});$('sound').setAttribute('aria-label','Toggle sound for all chapters');
for(const b of driveButtons.values()){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.drive);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>touch.delete(b.dataset.drive));}
window.addEventListener('keydown',e=>{if(openingActive||e.code!=='Escape'&&e.target.closest('input,select,textarea,summary'))return;inputMethod='keyboard';if(e.target.closest('button,a')&&['Enter','Space'].includes(e.code))return;if(e.code==='KeyF'){e.preventDefault();if(document.fullscreenElement)document.exitFullscreen();else $('game-shell').requestFullscreen?.();return;}if(e.code==='Escape'){e.preventDefault();if(!e.repeat)togglePause();return;}if((e.code==='Enter'||e.code==='Space')&&run.mode!=='driving'&&run.mode!=='sealing'){e.preventDefault();if(!e.repeat)primary();return;}if(e.code==='KeyR'&&run.mode==='caught'){primary();return;}if([...Object.values(bindings),'ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('focus',()=>{foreground=true;if(openingActive)audio.intro(openingSlide,true,settings);});window.addEventListener('blur',()=>{foreground=false;if(openingActive)audio.intro(openingSlide,false,settings);else audio.update(run,false);keys.clear();touch.clear();if(['driving','sealing','dying'].includes(run.mode))togglePause();});document.addEventListener('visibilitychange',()=>{if(openingActive)audio.intro(openingSlide,!document.hidden,settings);else if(document.hidden)audio.update(run,false);if(document.hidden&&['driving','sealing','dying'].includes(run.mode))togglePause();last=performance.now();accumulator=0;});
function simulate(dt){if(openingActive){input();return;}if(!ready||document.hidden||!foreground)return;const controls={...input(),...chaseControls.sample(dt)};updateRun(run,controls,dt);joeReactions.observe(run);if(events<run.events.length){for(const event of run.events.slice(events))if(event.type==='checkpoint'||event.type==='complete'||event.type==='crew-log'||event.type==='utility-choice')save();events=run.events.length;}audio.update(run,run.mode==='driving'||run.mode==='sealing'||run.mode==='dying'||run.mode==='complete'&&run.finale.tail>0);}
function paintUI(){
 if(openingActive)return;
 setText('sound',settings.muted?'Sound off':'Sound on');
 $('replay-story').disabled=!ready;
 if(run.mode!=='paused')guideReview=false;
 setData($('panel'),'guide',run.mode==='briefing'||guideReview);
 if(run.mode==='briefing'&&(ready||run.checkpoint>0||opening.shouldSkip()))prepareBriefArt();
 setHidden('playtest-feedback',!playtestMode||!['paused','caught','complete'].includes(run.mode));
 setHidden('brief-art',run.mode!=='briefing');setHidden('chapter-caption',run.mode!=='briefing');setHidden('review-guide',run.mode!=='paused');
 if($('review-guide').getAttribute('aria-expanded')!==String(guideReview))$('review-guide').setAttribute('aria-expanded',String(guideReview));setText('review-guide',guideReview?'Close instructions':'Review instructions');
 const defeated=run.mode==='caught';
 if(run.mode==='dying'||defeated)prepareDefeatArt();
 setData($('panel'),'defeat',defeated);setData($('panel'),'complete',run.mode==='complete');setData($('game-shell'),'reduced',settings.reducedMotion??reducedMotion.matches);
 setHidden('defeat-tableau',!defeated);setHidden('defeat-dialogue',!defeated);setHidden('defeat-review',!defeated);setHidden('chase-comfort',defeated||run.mode==='complete');setHidden('replay-story',defeated);
 const briefKey=run.mode+':'+run.checkpoint+':'+inputMethod+':'+guideReview+':'+!!run.foot;
 if(briefKey!==briefSignature){briefSignature=briefKey;paintBackNineBrief(run,inputMethod,guideReview,bindings);setText('comfort-controls',backNineHint(inputMethod,!!run.foot,bindings)+'. The camera follows your heading.');}
 setHidden('story',run.mode==='briefing');setHidden('controls',true);
 if(!ready){setHidden('panel',false);return;}const player=chaseActor(run);
 if(uiMode!==run.mode)needsDraw=true;const driving=['driving','sealing','dying'].includes(run.mode),target=run.checkpoint<2?COURSE.checkpoints[run.checkpoint]:COURSE.finish;
 setClass(document.documentElement,'touch-mode',coarsePointer.matches);
 setHidden('hud',!driving);setHidden('touch',run.mode!=='driving'||!coarsePointer.matches);setHidden('panel',driving);
 setText('objective',backNineInstruction(objective(run),inputMethod,bindings));setText('distance',`${Math.ceil(distance(player,target))} m · ${run.checkpoint}/2 relays online`);setText('speed',run.foot?'ON FOOT':`${speedMph(player.speed)} mph`);setText('surface',{path:'CART PATH',rough:'ROUGH · JOE HAS THE ADVANTAGE',sand:'BUNKER · SLOW GOING',wet:'WET TURF · EASE THE STEERING'}[player.surface]);setText('integrity-label',run.foot?'CART WRECKED':cartCondition(run.cart.health).label);
 const health=Math.ceil(run.cart.health);if($('cart-health').value!==health)$('cart-health').value=health;setText('health-value',health+'%');setData($('integrity'),'condition',cartCondition(run.cart.health).stage);setClass($('integrity').parentElement,'low-health',health<=30);setClass(document.documentElement,'on-foot',!!run.foot);
 setText('hint',backNineHint(inputMethod,!!run.foot,bindings));
 setText('surface',run.foot?(player.speed>.2?'RUNNING':'KEEP MOVING'):{path:'CART PATH',rough:'ROUGH · JOE HAS THE ADVANTAGE',sand:'BUNKER · SLOW GOING',wet:'WET TURF · EASE THE STEERING'}[player.surface]);
 for(const [action,label]of [['gas',run.foot?'Run':'Drive'],['reverse',run.foot?'Back':'Reverse'],['brake',run.foot?'Use':'Brake']]){const button=driveButtons.get(action);if(button.textContent!==label)button.textContent=label;}

 setText('district',district(chaseActor(run).y));setText('crew-count',`Crew logs ${CREW_LOGS.filter((_,i)=>run.story.collected&(1<<i)).length}/2 · optional`);
 const effect=run.impact,edge=$('impact-edge'),edgeStrength=(driving||run.mode==='dying')&&effect.age<.62&&!settings.reducedMotion?Math.sin(Math.min(1,effect.age/.045)*Math.PI/2)*Math.exp(-effect.age*6)*effect.strength*chaseControls.prefs.flash*.7:0;const opacity=String(Math.round(edgeStrength*1000)/1000),impactX=`${Math.round(-(effect.side||0)*28)}px`;if(edge.style.opacity!==opacity)edge.style.opacity=opacity;if(edge.style.getPropertyValue('--impact-x')!==impactX)edge.style.setProperty('--impact-x',impactX);
 const struck=driving&&run.impact.age<1.1;setClass($('integrity').parentElement,'impact',struck);
 if(struck&&announcedImpact!==run.impact){announcedImpact=run.impact;setText('status',run.impact.damaged?`Cart hit. ${Math.ceil(run.cart.health)} percent health remaining.`:'Vehicle impact.');}
 const t=run.tension||{},reduced=settings.reducedMotion??reducedMotion.matches;
 $('dread').style.opacity=driving?String(reduced?((t.intensity||0)>.5?.18:0):(t.intensity||0)*.55):'0';
 const joeDistance=distance(player,run.joe);
 const messages=driving?chaseMessages(run,{routeHints:chaseControls.prefs.routeHints,soundCaptions:settings.soundCaptions,coarse:coarsePointer.matches,method:inputMethod,bindings}):{banner:'',sound:'',dialogue:''};
 const reactionBlocked=!!world?.staffSightingActive?.()||!encounterAllows(run,'dialogue')||!!messages.banner||messages.soundUrgent||struck||joeDistance<18||joeDistance>85||run.grace>0||run.story.near>=0||run.joe.ram.phase!=='none'||['windup','surge'].includes(t.phase);
 const dialogue=chatter(run,()=>joeReactions.caption(run)||variedJoeCaption(run,messages.dialogue),{blocked:reactionBlocked,enabled:settings.subtitles,canStart:encounterAllows(run,'dialogue-start')&&dialogueApproachClear(run)});
 setText('caption',messages.banner||dialogue);setText('sound-caption',messages.sound);
 setData($('game-shell'),'message',!!messages.banner||!!dialogue);
 setData($('game-shell'),'ejecting',run.mode==='driving'&&!!run.foot?.ejection&&run.time-run.foot.ejection.at<1.18);
 if(run.mode==='driving'&&run.joe.ram.phase==='lineup'){const key=run.joe.ram.cycles;if(key!==announcedRam){announcedRam=key;setText('status',messages.banner);}}
 if(run.death){setText('status','Run down by Joe.');setText('hint','');setText('speed','RUN DOWN');setText('surface','');}
 finalCutLink.update(run.mode==='complete');if(uiMode===run.mode)return;uiMode=run.mode;setHidden('loading',true);setHidden('loading-art',run.mode!=='briefing');setHidden('restart',!['paused','caught'].includes(run.mode));$('panel-content').scrollTop=0;$('panel').scrollTop=0;
 const ending=escapeCopy(run.escape);
 setHidden('escape-record',run.mode!=='complete');if(run.mode==='complete')setText('escape-record',ending.detail);
 const copy={briefing:['ROUGH CUT · CHAPTER 02','The Back Nine',chaseBrief(run),'Start the cart'],sealing:['INSIDE THE GARAGE','Closing the shutter','You are inside. The engine is still outside.','Closing…'],paused:['CHASE PAUSED','Chase paused','You and Joe are stopped. Continue when you are ready.','Resume escape'],caught:['THE BACK NINE · DELIVERY BLOCKED','Sprint terminated','Run down by Joe’s industrial mower.','Restart from the shed'],complete:['THE BACK NINE · SURVIVED',ending.title,ending.story,'Drive again']}[run.mode];
 setText('field-log',journalText(run));setHidden('field-log',!['paused','complete'].includes(run.mode)||!run.story.collected);
 setText('checkpoint-note',defeated?'No checkpoints. Retry starts at the shed with a fresh cart and both relays offline. Enter / R also retries.':run.mode==='complete'?'Escape recorded on this device. Drive again starts a new run.':'Time waits until you begin. Relays power the exit; death restarts the whole run.');
 if(defeated){
  const review=pickDefeat(run,{nearExit:distance(player,COURSE.finish)<60,onFoot:!!run.foot,shortcut:!!run.hunt.choiceMask||run.events.some(e=>e.type==='shortcut'),damage:run.cart.hits>0,objectives:run.checkpoint>0});
  setText('defeat-line',`“${review.lines[0]}\n${review.lines[1]}”`);
  const failure=run.failure||captureFailure(run);setText('story',failure.cause);copy[2]=failure.cause;
  setText('defeat-review',`NEXT ACTION // ${failure.advice}\nRESTART FROM THE SHED // ${run.checkpoint}/2 relays reached this attempt · ${Math.ceil(distance(chaseActor(run),COURSE.finish))} m from the garage`);keys.clear();touch.clear();chaseControls.reset();$('primary').focus({preventScroll:true});}
 if(copy){setText('eyebrow',copy[0]);setText('title',copy[1]);setText('story',copy[2]);setText('primary',copy[3]);setText('status',copy[1]+'. '+copy[2]);if(['briefing','paused','complete'].includes(run.mode))$('primary').focus({preventScroll:true});}
}
function busy(){if(!fence)return false;const status=gl.clientWaitSync(fence,0,0);if(status===gl.TIMEOUT_EXPIRED)return true;gl.deleteSync(fence);fence=null;const ms=performance.now()-renderStarted;audio.presentRunner(run,pendingFootContacts,foreground&&!document.hidden&&!openingActive);pendingFootContacts=[];if(software)budget.observe(ms);times.push(ms);if(times.length>120)times.shift();return false;}
async function whenPresented(){while(busy())await new Promise(r=>setTimeout(r,8));}
function render(paint=true){if(openingActive)return;if(paint)paintUI();if(!ready||document.hidden||!foreground||(run.mode!=='driving'&&run.mode!=='sealing'&&run.mode!=='dying'&&!needsDraw)){if(ready&&!document.hidden&&foreground)busy();presentationWake.cancel();return;}
 // RAF still owns input, fixed-step simulation and UI. A software frame that
 // finishes between display ticks can present promptly instead of idling for
 // another whole tick. Keep one GPU frame in flight and the existing 60 Hz cap.
 if(software&&!manual){const wait=1000/60-(performance.now()-renderStarted);if(wait>0){presentationWake.request(wait);return;}}
 if(busy()){presentationWake.request();return;}presentationWake.cancel();needsDraw=false;const scale=software?Math.min(budget.scale(),prefs.resolution||1):Math.min(1,prefs.resolution||1),w=Math.round(1280*scale),h=Math.round(720*scale);if($('game').width!==w||$('game').height!==h)renderer.setSize(w,h,false);
 if(world.camera.aspect!==canvasAspect){world.camera.aspect=canvasAspect;world.camera.updateProjectionMatrix();}
 world.update(run,{rear:run.lookBack,reducedMotion:settings.reducedMotion??reducedMotion.matches,shake:chaseControls.prefs.shake,flash:chaseControls.prefs.flash});pendingFootContacts=world.drainRunnerContacts();renderStarted=performance.now();world.draw();frames++;fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();}
window.addEventListener('resize',()=>{needsDraw=true;});
window.addEventListener('fullscreenchange',()=>{needsDraw=true;});
window.advanceTime=async milliseconds=>{manual=true;presentationWake.cancel();const n=Math.max(1,Math.round(milliseconds/(1000/60)));for(let i=0;i<n;i++)simulate(1/60);await whenPresented();render();await whenPresented();};
window.render_game_to_text=()=>JSON.stringify({mode:openingActive?'back_nine_opening_story':'back_nine_'+run.mode,openingStory:opening.snapshot(),inputMethod,level:2,route:'shed',variation:{...run.variation},ready,coordinateSystem:'Metres; +y toward clubhouse, x across fairway; yaw 0 faces +y.',objective:backNineInstruction(objective(run),inputMethod,bindings),checkpoint:run.checkpoint,campaign:{...settings},comfort:{...chaseControls.prefs,motionBlur:false,soundCaptions:settings.soundCaptions,subtitles:settings.subtitles},messages:{banner:$('caption').textContent,sound:$('sound-caption').textContent},experience:run.experience,tactics:run.tactics,exitRelease:run.exitRelease,encounter:{...run.encounter},departure:{...run.departure},service:run.service,utility:run.utility,ramDamageMultiplier:Math.round(ramDamageScale(run)*100)/100,routeChoices:COURSE.decisions.map(d=>({id:d.id,gate:d.gate,foot:d.foot})),pressure:{...run.pressure},panic:{...run.panic},story:{...run.story,district:district(chaseActor(run).y)},speedDisplay:run.foot?{value:Math.round(run.foot.speed*10)/10,unit:'m/s'}:{value:speedMph(run.cart.speed),unit:'mph'},travel:run.foot?'on_foot':'cart',cart:{...run.cart},death:run.death,failure:run.failure,escape:run.escape,player:{...chaseActor(run)},joe:{senses:run.joe.senses,seenAge:run.joe.seenAge,ram:{...run.joe.ram},x:run.joe.x,y:run.joe.y,yaw:run.joe.yaw,speed:run.joe.speed,mode:run.joe.mode,lastSeen:run.joe.lastSeen,routePoints:run.joe.route.length,plans:run.joe.plans,expanded:run.joe.expanded},seconds:run.time,finishHold:run.finishHold,hunt:{...run.hunt},decoys:{...run.decoys},courseFX:run.courseFX,destruction:run.destruction,wreck:run.wreck,finale:{...run.finale},tension:{...run.tension},audio:audio.stats(),navigation:navigationStats(),graphics:{software,gpu,frames,resolution:[$('game').width,$('game').height],...world?.stats(),completionAverage:times.length?times.reduce((a,b)=>a+b,0)/times.length:0,completionP95:[...times].sort((a,b)=>a-b)[Math.min(times.length-1,Math.floor(times.length*.95))]||0,budget:budget.stats()},bindings:{...bindings},controls:backNineControls(inputMethod,!!run.foot,bindings)});
// Explicit development hook used only when the URL asks for it; normal runs
// expose observation/time stepping but no teleport or completion command.
if(new URLSearchParams(location.search).has('test'))window.__backNine={get run(){return run;},set run(v){run=v;events=v.events.length;world?.resetCamera();uiMode='';needsDraw=true;},simulate,render,whenPresented,COURSE};
function frame(now){const delta=Math.min(.1,(now-last)/1000);last=now;if(!manual&&(ready||openingActive)&&!document.hidden){accumulator+=delta;let steps=0;while(accumulator>=1/60&&steps++<6){simulate(1/60);accumulator-=1/60;}render();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
async function prepareCourse(){if(ready||preparePromise)return preparePromise;preparePromise=(async()=>{try{world=await createChaseScene(renderer,software,message=>setText('loading',message));renderer.setSize(software?960:1280,software?540:720,false);world.draw();fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();renderStarted=performance.now();await whenPresented();ready=true;$('primary').disabled=false;paintUI();render();}catch(error){setText('loading',error.message);setText('title','Could not prepare the chase');setText('primary','Reload level');$('primary').disabled=false;$('primary').onclick=()=>location.reload();console.error(error);}})();return preparePromise;}
paintUI();if(run.mode==='briefing'&&run.checkpoint===0&&!opening.shouldSkip())showOpening();else prepareCourse();
window.addEventListener('pointerdown',e=>{inputMethod=e.pointerType==='touch'?'touch':'keyboard';});
window.addEventListener('pagehide',()=>{presentationWake.cancel();audio.stop();world?.dispose();renderer.dispose();});


