import * as THREE from './vendor/three/three.module.js';
import {paintCourseSurface} from './course-crafted-surfaces.js';

// Eight non-repeating faces per course. Their physical pixel density follows
// the existing stone surface; the atlas adds use/weather rather than noise.
export function stoneFinishUV(row,variant,u,v){
  return [(variant*128+8+u*112)/1024,1-(row*64+4+(1-v)*56)/512];
}

export function createStoneFinishTexture(){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const g=canvas.getContext('2d'),base=document.createElement('canvas');base.width=base.height=128;
  paintCourseSurface(base.getContext('2d'),'stone');
  for(let row=0;row<8;row++)for(let variant=0;variant<8;variant++){
    let seed=851+variant*191+row*373;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const integer=n=>Math.floor(random()*n),ox=variant*128,oy=row*64;
    g.save();g.beginPath();g.rect(ox,oy,128,64);g.clip();
    // Crop at source resolution: do not enlarge pixels to fill a face.
    g.drawImage(base,0,integer(64),128,64,ox,oy,128,64);
    const mark=(x,y,w,h,color,alpha)=>{g.fillStyle=color;g.globalAlpha=alpha;g.fillRect(ox+x,oy+y,w,h);};
    const island=(x,y,w,h,color,alpha)=>{
      mark(x+2,y,w-4,h,color,alpha);mark(x,y+2,w,h-4,color,alpha);
      mark(x+2,y+h-1,Math.max(2,w-6),2,color,alpha);
    };
    // Capillary damp and soil splash climb unevenly from ground contact.
    // The second course gets only isolated remnants; upper courses stay dry.
    if(row<2){
      let h=row===0?24:5;
      for(let x=0;x<128;){
        const w=4+integer(7);h=Math.max(row===0?15:2,Math.min(row===0?35:10,h+integer(11)-5));
        mark(x,64-h,w,h,'#273a31',row===0?.55:.22);
        if(row===0)mark(x,64-h-3,w,3,'#3b4b38',.24);
        x+=w;
      }
      for(let i=0;i<(row===0?17:5);i++)island(integer(124),38+integer(23),5+integer(10),5+integer(7),'#4c593b',row===0?.32:.14);
    }
    // A few connected mineral runnels begin at the upper joint. Stepped ends
    // and interrupted edges keep the marks in the authored pixel vocabulary.
    for(let i=0;i<2;i++){
      let x=13+integer(98),y=2;const length=10+integer(29);
      for(;y<length;y+=3){mark(x,y,3+integer(3),3,'#293e38',.22);if(integer(4)===0)x+=integer(3)-1;}
      mark(x+1,y,2,2,'#293e38',.16);
    }
    // Short, discontinuous abraded edges follow the bevel. They are albedo,
    // never emissive highlights, and disappear with the practical lighting.
    for(let i=0;i<5;i++){
      const x=14+integer(96),w=3+integer(10),y=i<3?5:58;
      mark(x,y,w,1,'#b0b4a0',.48);mark(x+1,y+1,Math.max(2,w-3),1,'#879586',.30);
    }
    // Sparse exposed mineral chips, clustered at edges rather than peppered
    // uniformly across every face.
    for(let i=0;i<3;i++){
      const x=i===0?9:108+integer(8),y=12+integer(39);
      island(x,y,5+integer(4),5+integer(4),'#99a28e',.35);
    }
    g.restore();
  }
  g.globalAlpha=1;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
  texture.name='CourseStoneFinish';return texture;
}
