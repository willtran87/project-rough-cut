const random=n=>{const v=Math.sin(n*127.1+71.7)*43758.5453;return v-Math.floor(v);};
export const CONTACT_SPLASH_DROPS=12;
// Analytic, low ballistic fans. No cycling emitter: every droplet belongs to
// one real water contact and disappears when it returns to the water.
export function contactSplashSample(contact,index,time){
 const blade=contact.kind==='blade',joe=contact.kind==='joe',step=joe||contact.kind==='player',count=blade||step?12:3;
 if(index>=count)return null;
 // A wading stride kicks a visible fan ahead of the foot and lasts a little
 // longer than a blade nick. Joe's heavier tread throws wider and higher.
 const life=joe?.85:step?.6:.4,age=time-contact.time;if(age<0||age>life)return null;
 const seed=contact.serial*41+index*7,spread=random(seed),bearing=Math.atan2(contact.vy||0,contact.vx||0);
 const pace=Math.hypot(contact.vx||0,contact.vy||0),directional=(blade||step)&&pace>.08;
 const angle=directional?bearing+(spread-.5)*(blade?1.9:joe?3.4:1.3):spread*Math.PI*2;
 // The fan leaves with the walker's own travel, so a wading player sees it
 // land ahead of them instead of walking over it.
 const carry=step?pace*(joe?.5:1.05):0;
 const speed=blade?.65+random(seed+1)*.85:joe?carry+.6+random(seed+1)*2:step?carry+1.6+random(seed+1)*2.4:.3+random(seed+1)*.5;
 const up=blade?.7+random(seed+2)*.55:joe?2+random(seed+2)*2.2:step?1.4+random(seed+2)*1.3:.45+random(seed+2)*.55;
 const height=contact.height+.008+up*age-4.9*age*age;
 if(height<contact.height)return null;
 return {x:contact.x+Math.cos(angle)*speed*age,y:contact.y+Math.sin(angle)*speed*age,height,
  vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,vh:up-9.8*age,
  width:(joe?.055:step?.045:.012)+random(seed+3)*(step?.035:.012),length:(joe?.12:step?.09:.025)+random(seed+4)*(step?.09:.025),
  alpha:contact.strength*Math.max(0,1-age/life)*(.65+random(seed+5)*.35)};
}
