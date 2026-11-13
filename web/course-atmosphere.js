// Spatial blends, not time-triggered filters: crossing a boundary or returning
// through it gives the same restrained palette, including in Reduced Motion.
export const COURSE_LOOKS=[
  {id:'tee',start:0,fog:0x101c22,moon:0xabc8d6,mist:0x879f99,height:.34,spread:1,power:1},
  {id:'audit_row',start:88,fog:0x141d17,moon:0xb9cbb3,mist:0x8b9a77,height:.25,spread:.85,power:.94},
  {id:'water_hazard',start:178,fog:0x0a2026,moon:0x9ecbd8,mist:0x88b6bc,height:.17,spread:1.25,power:.96},
  {id:'clubhouse_crossing',start:276,fog:0x211c18,moon:0xd0c3a6,mist:0xaea28c,height:.38,spread:.9,power:1.02},
  {id:'maintenance_maze',start:366,fog:0x171e19,moon:0xb9c5af,mist:0x8f9b82,height:.26,spread:.85,power:.92},
  {id:'dead_green',start:455,fog:0x211b1d,moon:0xc9b7b3,mist:0xa99a9f,height:.47,spread:1.1,power:.9},
  {id:'night_range',start:545,fog:0x101a29,moon:0xa8bedf,mist:0x8c9fb8,height:.22,spread:1.15,power:.94},
  {id:'release_corridor',start:635,fog:0x1d181c,moon:0xc3b8bd,mist:0xa6a0ad,height:.25,spread:1,power:.92},
];
export function courseLook(y){
  for(let i=1;i<COURSE_LOOKS.length;i++){
    const edge=COURSE_LOOKS[i].start;
    if(y<edge-12)return {a:COURSE_LOOKS[i-1],b:COURSE_LOOKS[i-1],mix:0};
    if(y<edge+12){const t=(y-edge+12)/24;return {a:COURSE_LOOKS[i-1],b:COURSE_LOOKS[i],mix:t*t*(3-2*t)};}
  }
  return {a:COURSE_LOOKS.at(-1),b:COURSE_LOOKS.at(-1),mix:0};
}
