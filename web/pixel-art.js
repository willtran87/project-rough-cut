import * as THREE from './vendor/three/three.module.js';

// Reuse the shipped illustrations as world textures, not a screen-space filter.
// Atlas crops stay in memory; source art and gameplay footprints are unchanged.
const images = new Map(), textures = new Map();
const sourceUrls={
  'final-cut-reed-clumps-v1':'./assets/optimized/final-cut-reed-clumps-v1.webp',
  'final-cut-rough-clumps-v1':'./assets/optimized/final-cut-rough-clumps-v1.webp',
  'final-cut-stone-materials-v1':'./assets/optimized/final-cut-stone-materials-v1.webp',
  'final-cut-ground-materials-v1':'./assets/optimized/final-cut-ground-materials-v1.webp',
  'final-cut-industrial-materials-v1':'./assets/optimized/final-cut-industrial-materials-v1.webp',
  'rough-cut-needle-sprays-v1':'./assets/optimized/rough-cut-needle-sprays-v1.webp',
  'rough-cut-architecture-surfaces-v1':'./assets/optimized/rough-cut-architecture-surfaces-v1.webp'
};
const status = { loaded: 0, pending: 0, errors: [] };
let invalidate = () => {};
function source(name) {
  if (!images.has(name)) {
    status.pending++;
    images.set(name, new Promise(resolve => {
      const image = new Image();
      image.onload = () => { status.loaded++; status.pending--; resolve(image); invalidate(); };
      image.onerror = () => { status.pending--; status.errors.push(name); resolve(null); };
      image.src = sourceUrls[name] || `./assets/optimized/${name}.webp`;
    }));
  }
  return images.get(name);
}
export function texture(name, crop = null, size = null, repeat = false) {
  const key = JSON.stringify([name, crop, size, repeat]);
  if (textures.has(key)) return textures.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = size?.[0] || crop?.[2] || 2;
  canvas.height = size?.[1] || crop?.[3] || 2;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.userData.sharedPixelArt = true;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  textures.set(key, tex);
  source(name).then(image => {
    if (!image) return;
    const [x, y, width, height] = crop || [0, 0, image.width, image.height];
    const targetWidth = size?.[0] || width, targetHeight = size?.[1] || height;
    // A texture already submitted while loading must release its old GPU allocation
    // before changing dimensions (WebGL cannot resize it with texSubImage2D).
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) tex.dispose();
    canvas.width = targetWidth; canvas.height = targetHeight;
    // These pixels are read by WebGL uploads and other texture canvases. Keep
    // them CPU-backed instead of forcing a GPU raster/readback round trip.
    const ctx = canvas.getContext('2d',{willReadFrequently:true}); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
    tex.needsUpdate = true; invalidate();
  });
  return tex;
}
export function paintedMaterial(name, crop, size, options = {}) {
  return new THREE.MeshBasicMaterial({ map: texture(name, crop, size), alphaTest: .3, side: THREE.DoubleSide, ...options });
}
export function card(name, crop, width, height, options = {}) {
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), paintedMaterial(name, crop, null, options));
}
export function onReady(fn) { invalidate = fn; }
export function stats() { return { ...status, errors: [...status.errors], textures: textures.size }; }
export { source };
