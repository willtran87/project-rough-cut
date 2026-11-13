// District identities live on existing solid course structures. No new ground
// collision, route change, light source, texture or per-frame geometry.
export const COURSE_LANDMARKS=[
 {id:'irrigation-header',x:34,y:190,height:6.8,kind:'pump',fault:190},
 {id:'range-service-awning',x:9,y:342,height:3.65,kind:'cistern',fault:342},
 {id:'club-clock',x:4,y:781.65,height:9.75,kind:'clubhouse'}
];

export function buildCourseLandmarks({THREE,box,put,cylinder}){
 const [pump,range,club]=COURSE_LANDMARKS;
 // An elevated header tank explains the reservoirs and irrigation plant.
 // Feet sit within the cabinet's already-solid 1.8 m radius.
 const x=pump.x,z=-pump.y;
 for(const side of [-1,1])for(const end of [-1,1]){
  box('iron',x+side*.8,3.55,z+end*.64,.1,3.4,.1);
  const brace=new THREE.BoxGeometry(.065,2.15,.065);brace.rotateZ(side*.64);put(brace,'iron',x+side*.4,3.65,z+end*.64);brace.dispose();
 }
 put(cylinder,'paint',x,5.65,z,1.22,1.65,1.22);
 for(const h of [4.87,6.43])put(cylinder,'iron',x,h,z,1.26,.09,1.26);
 put(cylinder,'roof',x,6.53,z,1.28,.11,1.28);
 put(cylinder,'rust',x+1.05,3.3,z-.32,.065,5.3,.065);
 for(let n=0;n<9;n++)box('iron',x-.99,2.35+n*.38,z+.69,.38,.035,.035);
 for(const side of [-1,1])box('iron',x-.99+side*.21,3.92,z+.69,.04,3.35,.04);
 box('iron',x,6.71,z+.1,.56,.16,.38);box('faultLamp0',x,6.7,z+.31,.39,.07,.025);
 // A covered wash/ball-recovery bay belongs to the night range. Open sides
 // preserve the existing cistern outline and recognizable service passage.
 for(const side of [-1,1])for(const end of [-1,1])box('iron',range.x+side*2.65,2.13,-range.y+end*3.9,.09,1.9,.09);
 for(const side of [-1,1]){
  const roof=new THREE.BoxGeometry(5.65,.1,4.18);roof.rotateX(side*.12);put(roof,'roof',range.x,3.28,-range.y+side*2.02);roof.dispose();
  box('paint',range.x+side*2.7,3.03,-range.y,.1,.16,8.2);
 }
 box('iron',range.x,3.6,-range.y,5.7,.1,.12);
 box('paint',range.x,3.11,-range.y+4.13,5.65,.26,.12);
 box('iron',range.x,2.91,-range.y+3.9,1.65,.11,.25);box('faultLamp1',range.x,2.84,-range.y+3.9,1.4,.04,.15);
 // A stopped club clock is legible architectural detail, not an objective
 // arrow. Its two hands are fixed just before midnight.
 const disk=new THREE.CylinderGeometry(1,1,1,24);disk.rotateX(Math.PI/2);
 put(disk,'iron',club.x,8.95,-club.y,.84,.84,.08);put(disk,'clockFace',club.x,8.95,-club.y+.055,.75,.75,.035);
 for(let n=0;n<12;n++){const a=n*Math.PI/6,g=new THREE.BoxGeometry(.035,n%3===0?.14:.085,.025);g.rotateZ(-a);put(g,'iron',club.x+Math.sin(a)*.61,8.95+Math.cos(a)*.61,-club.y+.08);g.dispose();}
 for(const [length,angle]of [[.53,-Math.PI/30],[.35,-.04]]){const hand=new THREE.BoxGeometry(.04,length,.025);hand.translate(0,length*.5,0);hand.rotateZ(-angle);put(hand,'iron',club.x,8.95,-club.y+.105);hand.dispose();}
 disk.dispose();
 return {count:COURSE_LANDMARKS.length,faults:2};
}
