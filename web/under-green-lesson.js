import {WATERS,waterLocal} from './under-green-course.js';
const lesson=WATERS.find(w=>w.lesson),clearance=.4;
// A completed crossing is an observable fact, not a claim of comprehension.
// No compulsory waiting, movement override or enemy behavior depends on it.
export function observeLesson(r){
 if(r.lessonCrossed)return false;
 const p=waterLocal(r.player,lesson),near=-lesson.depth/2-clearance,far=lesson.depth/2+clearance;
 if(Math.abs(p.x)>lesson.width/2){r.lessonApproach=false;r.lessonEntered=false;return false;}
 if(p.y<=near){r.lessonApproach=true;r.lessonEntered=false;}
 else if(r.lessonApproach&&p.y<far)r.lessonEntered=true;
 if(!r.lessonEntered||p.y<far||r.player.recovery)return false;
 r.lessonCrossed=true;r.saveSerial++;r.events.push({type:'lesson-crossed',time:r.time});
 return true;
}
