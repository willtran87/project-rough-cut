import * as THREE from './vendor/three/three.module.js';

// Four panes wrap the existing cylindrical glass. Integer clusters describe
// a bright mantle, darker edges and soot trapped beneath the metal cap.
// The map modulates visible glass only; physical lantern power is independent.
export function paintLanternGlass(g){
  const colors=['#423622','#78603a','#b49b65','#dac88f','#f0e1b4','#fff4d2','#ffffff'];
  const rect=(x,y,w,h,c)=>{g.fillStyle=colors[c];g.fillRect(x,y,w,h);};
  rect(0,0,96,64,4);
  for(let pane=0;pane<4;pane++){
    const x=pane*24,shift=[0,1,-1,0][pane];
    // Refraction follows the pane vertically; the brightest section narrows
    // toward the upper chimney instead of lighting the entire shell evenly.
    rect(x,0,3,64,2);rect(x+3,0,3,64,3);
    rect(x+20,0,4,64,3);rect(x+23,0,1,64,2);
    rect(x+9+shift,15,7,36,5);rect(x+11+shift,26,4,23,6);
    rect(x+8+shift,35,10,13,5);rect(x+10+shift,32,6,18,6);
    rect(x+10+shift,11,4,16,5);rect(x+12+shift,8,2,9,4);
    // A continuous soot rim with asymmetric, stepped tails.
    rect(x,0,24,3,0);rect(x,3,24,3,1);
    rect(x+2,6,7,3+pane%2,2);rect(x+3,8,4,3,3);
    rect(x+17,6,6,5-pane%3,2);rect(x+19,10,3,3,3);
    // Condensation and old wipe marks are sparse connected pixels.
    for(const [u,v,h]of [[5,18,8],[19,30,10],[6,47,6]]){
      rect(x+u,v+pane,1,h,3);rect(x+u+1,v+pane+h-2,1,2,5);
    }
    rect(x,58,24,6,2);rect(x+4,57,17,2,3);
    rect(x+8,53,10,4,4);rect(x+10,54,6,2,5);
  }
}

export function createLanternGlassTexture(){
  const canvas=document.createElement('canvas');canvas.width=96;canvas.height=64;
  paintLanternGlass(canvas.getContext('2d'));
  const texture=new THREE.CanvasTexture(canvas);texture.name='CourseLanternGlass';
  texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;
  texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
  // The world batches and station clones share this map. The world factory
  // owns disposal; individual material clones must not dispose it again.
  texture.userData.sharedPixelArt=true;
  return texture;
}
