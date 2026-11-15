const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};

// A small, fixed pixel mask. Broad curved wisps break up the beam; neighboring
// pixels share clusters rather than adding independent full-strength noise.
export function lightHazeAlpha(x,y,size=128){
  const u=(x+.5)/size*2-1,t=(y+.5)/size;
  const width=.14+.74*t,edge=clamp(1-Math.abs(u)/width,0,1);
  const envelope=edge*edge*smooth(0,.10,t)*(1-smooth(.58,1,t));
  const px=Math.floor(x/2),py=Math.floor(y/2);
  const wisp=.68+.20*Math.sin(px*.29+Math.sin(py*.17)*1.4)+.12*Math.sin(py*.43+px*.11);
  return Math.round(clamp(envelope*wisp,0,1)*16)/16;
}

// The visibility boundary and walking through the source both dissolve gently.
// At the existing dim/off threshold no beam remains, matching the circuit cue.
export function lightHazeFade(distance,power){
  return smooth(.55,1.5,distance)*(1-smooth(8.5,12,distance))*smooth(.2,.5,power);
}
