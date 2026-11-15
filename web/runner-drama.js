const smooth=t=>t*t*(3-2*t);
// Authored joint poses, not a ragdoll: bounded work and a repeatable landing.
// time, travel, height, body tilt, side roll, hips, knees, shoulders, elbows
const poses=[
 [0,0,.38,-.12,0,1.48,-1.48,.67,.26],
 [.14,.08,.46,-.06,.12,1.25,-1.25,.95,.6],
 [.42,.65,.53,.15,.55,.55,-.85,-.3,.45],
 [.64,1,0,.3,.28,.68,-1.12,-.6,.9],
 [.86,1,0,-.28,.08,.62,-1.0,.2,.9],
 [1.18,1,0,0,0,0,0,0,.18]
];
const keys=['travel','height','tilt','roll','hip','knee','arm','elbow'];
export function ejectionPose(age,out={}){
 let i=0;while(i<poses.length-2&&age>poses[i+1][0])i++;
 const a=poses[i],b=poses[i+1],t=smooth(Math.max(0,Math.min(1,(age-a[0])/(b[0]-a[0]))));
 for(let k=0;k<keys.length;k++)out[keys[k]]=a[k+1]+(b[k+1]-a[k+1])*t;
 out.phase=age<.14?'release':age<.64?'falling':age<.86?'bracing':age<1.18?'recovering':'none';
 out.control=age>=.86;return out;
}

// Separate the reaching side from the trailing side without adding a ragdoll
// or changing the validated landing point/control timing. Both envelopes are
// zero at the seated origin and at the completed running handoff.
export function ejectionBalance(age,out={}){
 const ramp=(start,duration)=>smooth(Math.max(0,Math.min(1,(age-start)/duration)));
 out.air=ramp(.1,.18)*(1-ramp(.42,.24));
 out.plant=ramp(.46,.18)*(1-ramp(.86,.32));
 return out;
}
