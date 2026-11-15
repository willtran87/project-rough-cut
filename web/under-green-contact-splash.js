const random=n=>{const v=Math.sin(n*127.1+71.7)*43758.5453;return v-Math.floor(v);};
export const CONTACT_SPLASH_DROPS=12;
// Analytic, low ballistic fans. No cycling emitter: every droplet belongs to
// one real water contact and disappears when it returns to the water.
export function contactSplashSample(contact,index,time){
 const blade=contact.kind==='blade',count=blade?12:contact.kind==='drip'?3:8;
 if(index>=count)return null;
 const age=time-contact.time;if(age<0||age>.4)return null;
 const seed=contact.serial*41+index*7,spread=random(seed),bearing=Math.atan2(contact.vy||0,contact.vx||0);
 const directional=blade&&Math.hypot(contact.vx||0,contact.vy||0)>.08;
 const angle=directional?bearing+(spread-.5)*1.9:spread*Math.PI*2;
 const speed=(blade?.65:.3)+random(seed+1)*(blade?.85:.5);
 const up=(blade?.7:.45)+random(seed+2)*.55;
 const height=contact.height+.008+up*age-4.9*age*age;
 if(height<contact.height)return null;
 return {x:contact.x+Math.cos(angle)*speed*age,y:contact.y+Math.sin(angle)*speed*age,height,
  vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,vh:up-9.8*age,
  width:.012+random(seed+3)*.012,length:.025+random(seed+4)*.025,
  alpha:contact.strength*Math.max(0,1-age/.4)*(.65+random(seed+5)*.35)};
}
