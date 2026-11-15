import * as THREE from './vendor/three/three.module.js';
import {RIG_BODY} from './final-cut-rig.js';
import {CAB} from './final-cut-cab.js';
import {shoeGroundHeight} from './final-cut-ground-layout.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const top=id=>{const p=RIG_BODY.find(p=>p.id===id);return p.height+p.h/2;};
const anchor=(x,y,z,heading=-Math.PI/2,ground=false)=>({x,y,z,heading,ground,surface:ground?'ground':y>1.4?'cab-floor':RIG_BODY.find(p=>/^(board|step|cab-step)-/.test(p.id)&&Math.sign(p.side)===Math.sign(x)&&Math.abs(p.height+p.h/2+.12-y)<.001)?.id});
const floor=1.325+.12,seatFeet=CAB.feet.map(p=>anchor(p.x,p.y,p.z,0));
const boardStart=[anchor(-2.46,.12,.34,-Math.PI/2,true),anchor(-2.46,.12,.56,-Math.PI/2,true)];
const boardSteps=[
 [1,anchor(-2.045,top('step--1')+.12,.56)],[0,anchor(-2.045,top('step--1')+.12,.34)],
 [1,anchor(-1.84,top('board--1')+.12,.56)],[0,anchor(-1.84,top('board--1')+.12,.34)],
 [1,anchor(-1.57,top('cab-step--1')+.12,.56)],[0,anchor(-1.57,top('cab-step--1')+.12,.34)],
 [1,anchor(-.87,floor,.56)],[0,anchor(-.87,floor,.34)],
 [0,anchor(-.55,floor,-.12,0)],[1,anchor(-.15,floor,-.12,0)],
 [0,seatFeet[0]],[1,seatFeet[1]],
];
const exitSteps=[
 [1,anchor(.83,floor,-.12,0)],[0,anchor(.55,floor,-.12,0)],
 [0,anchor(.83,floor,.56,Math.PI/2)],[1,anchor(.83,floor,.34,Math.PI/2)],
 [1,anchor(1.56,top('cab-step-1')+.12,.34,Math.PI/2)],[0,anchor(1.56,top('cab-step-1')+.12,.56,Math.PI/2)],
 [1,anchor(2.35,.12,.34,Math.PI/2,true)],[0,anchor(2.35,.12,.56,Math.PI/2,true)],
 [1,anchor(3.11,.12,.34,Math.PI/2,true)],[0,anchor(3.11,.12,.56,Math.PI/2,true)],
];
export const TRANSFER_SCHEDULE={board:{start:.025,duration:.795,steps:boardSteps.length},exit:{start:.22,duration:.72,steps:exitSteps.length}};
// All support locations are fixed in their real parent: treads/cab follow the
// rig; ground landings stay horizontal outside the submerged lower steps.
export function transferPose(kind,t,body){
 body.updateWorldMatrix(true,false);const rig=body.parent,bodyQ=body.getWorldQuaternion(new THREE.Quaternion()),rigQ=rig.getWorldQuaternion(new THREE.Quaternion()),up=new THREE.Vector3(0,1,0);
 const point=a=>{const p=new THREE.Vector3(a.x,a.y,a.z);(a.ground?rig:body).localToWorld(p);if(a.ground){const heading=-(new THREE.Euler().setFromQuaternion(rigQ,'YXZ').y+a.heading);p.y+=shoeGroundHeight(p.x,-p.z,heading);}return p;};
 const rotation=a=>(a.ground?rigQ:bodyQ).clone().multiply(new THREE.Quaternion().setFromAxisAngle(up,a.heading));
 const boarding=kind==='board',steps=boarding?boardSteps:exitSteps,initial=boarding?boardStart:seatFeet;
 const schedule=TRANSFER_SCHEDULE[kind],progress=clamp((t-schedule.start)/schedule.duration)*steps.length;
 const feet=initial.map(a=>({position:point(a),rotation:rotation(a),planted:true,surface:a.surface}));
 const anchors=[...initial];
 for(let i=0;i<steps.length;i++){
  const [side,to]=steps[i],from=anchors[side];if(progress>=i+1){anchors[side]=to;feet[side]={position:point(to),rotation:rotation(to),planted:true,surface:to.surface};continue;}
  if(progress>i){const k=progress-i,level=from.ground&&to.ground,s=level?ease(0,1,k):ease(.3,.8,k),a=point(from),b=point(to),position=a.clone().lerp(b,s),height=Math.max(a.y,b.y)+.08;
   position.y=level?a.y+(b.y-a.y)*s+Math.sin(Math.PI*k)**2*.08:k<.3?a.y+(height-a.y)*ease(0,.3,k):k>.8?height+(b.y-height)*ease(.8,1,k):height;
   feet[side]={position,rotation:rotation(from).slerp(rotation(to),s),planted:false,surface:'swing'};
  }break;
 }
 const turn=boarding?ease(.55,.69,t):ease(.364,.508,t),seat=boarding?ease(.82,1,t):1-ease(0,.22,t),unroll=boarding?0:ease(.22,.7,t);
 const orientation=bodyQ.clone().slerp(rigQ,unroll).multiply(new THREE.Quaternion().setFromAxisAngle(up,boarding?-Math.PI/2*(1-turn):Math.PI/2*turn));
 const standing=feet[0].position.clone().add(feet[1].position).multiplyScalar(.5).addScaledVector(up,.76302);
 // Ground walking supports the pelvis from the lower planted shoe. Retain
 // that height at the boarding handoff when a paving lip raises one boot,
 // then release it continuously as the first stair step takes the load.
 if(boarding)standing.y-=Math.abs(feet[0].position.y-feet[1].position.y)*.5*(1-ease(0,1,progress));
 const seated=body.localToWorld(new THREE.Vector3(0,1.9899998,.4299999));
 return {feet,orientation,hip:standing.lerp(seated,seat),seat,progress,kind,t};
}

