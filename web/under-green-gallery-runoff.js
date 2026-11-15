// Course metres. Shallow water collects beneath the existing west roof
// failure and the central root shoulder. These uneven depressions leave
// intact paving between them; they are not timed channels or route markers.
export const GALLERY_RUNOFF_POOLS=Object.freeze([
 {id:'gallery-vault-seep',clumps:0,points:[[-4.49,14.00],[-4.10,13.77],[-3.72,13.96],[-3.45,14.33],[-3.12,14.50],[-3.26,14.89],[-3.04,15.20],[-3.42,15.60],[-3.81,15.79],[-4.12,15.70],[-4.28,15.39],[-4.56,15.11],[-4.38,14.65]]},
 {id:'gallery-canopy-seep',clumps:0,points:[[-.64,12.32],[.04,12.15],[.62,12.37],[1.30,12.18],[1.76,12.57],[1.51,13.10],[1.97,13.56],[1.78,14.05],[1.18,14.33],[1.44,14.89],[1.09,15.41],[.72,15.76],[.35,16.41],[-.07,16.63],[-.44,16.20],[-.16,15.77],[-.63,15.39],[-.51,14.86],[-.90,14.51],[-.72,14.10],[-.95,13.61],[-.56,13.18]]}
]);

// Origins sit at the underside of the corresponding physical roof/root,
// rather than dropping out of empty air. Each lands inside its named pool.
export const GALLERY_RUNOFF_DRIPS=Object.freeze([
 {pool:'gallery-leak',surface:'pipe',x:-2.65,y:10.5,height:3.106,period:4.9,offset:1.7},
 {pool:'gallery-vault-seep',surface:'roof',x:-3.75,y:14.72,height:3.766,period:6.3,offset:2.4},
 {pool:'gallery-canopy-seep',surface:'root',x:.35,y:13.2,height:3.38,period:5.1,offset:.8}
]);
