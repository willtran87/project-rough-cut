// One slow mechanical rotation per 1.6 seconds, no strobe. Zero pulses and
// Reduced Motion retain a steady red warning rather than hiding the beacon.
export function mowerBeacon(time,flash=1,reduced=false){
 const amount=reduced?0:Math.max(0,Math.min(1,flash)),beam=(.5+.5*Math.cos(time*Math.PI*1.25))**3;
 return {red:.5+amount*beam*.5,lens:1.1+amount*beam*1.1,power:105+amount*beam*95,angle:reduced?0:time*Math.PI*1.25};
}
