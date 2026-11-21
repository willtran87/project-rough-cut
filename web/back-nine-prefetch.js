// Course assets requested by createChaseScene and the modules it calls. While
// the opening story is on screen the network is otherwise idle, so these are
// pulled into the HTTP cache at low priority. Nothing is decoded or built here:
// the scene's own loaders issue the same URLs later and remain authoritative.
// A stale entry costs one wasted request; a missing entry loads as before.
const COURSE_ASSETS=[
 './assets/models/joe-riding-pixel.glb',
 './assets/optimized/back-nine-work-cloth-v1.webp',
 './assets/optimized/back-nine-mower-rust-v1.webp',
 './assets/optimized/back-nine-work-gear-v1.webp',
 './assets/optimized/rough-cut-architecture-surfaces-v1.webp',
 './assets/optimized/back-nine-mower-steel-v1.webp',
 './assets/optimized/back-nine-weathered-turf-v1.webp',
 './assets/optimized/back-nine-short-turf-v2.webp',
 './assets/optimized/back-nine-mower-paint-v1.webp',
 './assets/under-green/sediment-field-v1.webp',
 './assets/optimized/back-nine-hair-v1.webp',
 './assets/models/ghost-joe.glb?v=20261107-motion',
 './assets/optimized/back-nine-face-v1.webp',
 './assets/optimized/back-nine-storm-density-v1.webp',
 './assets/optimized/back-nine-glass-v1.webp',
 './assets/optimized/rough-cut-needle-sprays-v1.webp',
 './assets/optimized/rough-cut-verge-atlas-v1.webp',
 './assets/optimized/rough-cut-hedge-hide-v2.webp',
 './assets/optimized/rough-cut-distant-treeline-v1.webp',
 './assets/baked/course-pines.bin.gz',
 './assets/baked/course-contours.bin.gz',
 './assets/optimized/rough-cut-moon-v1.webp',
 './assets/optimized/rough-cut-far-ridge-v1.webp',
 './assets/optimized/rough-cut-night-sky-v2.webp',
 './assets/baked/course-pines.json',
];
let started=false;
// Three transfers at a time leaves room for the story's own slide images.
export function prefetchBackNineCourse(concurrency=3){
 if(started)return;started=true;
 const queue=[...COURSE_ASSETS];
 const next=()=>{
  const url=queue.shift();if(!url)return;
  fetch(url,{priority:'low'}).then(response=>response.ok?response.arrayBuffer():null).catch(()=>{}).then(next);
 };
 for(let i=0;i<concurrency;i++)next();
}
