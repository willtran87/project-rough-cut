// Static distance to actual enclosing wall faces. One byte stores 0..1m;
// linear sampling preserves straight wall distances between texel centres.
// Only nearby pixels are visited for each wall, so startup work follows the
// perimeter rather than multiplying the entire map by every wall segment.
export function floodShoreField(layout){
 const minX=Math.min(...layout.tiles.map(t=>t.x-t.w/2))-.5;
 const minY=Math.min(...layout.tiles.map(t=>t.y-t.d/2))-.5;
 const spanX=Math.max(...layout.tiles.map(t=>t.x+t.w/2))+.5-minX;
 const spanY=Math.max(...layout.tiles.map(t=>t.y+t.d/2))+.5-minY;
 const width=Math.ceil(spanX*16),height=Math.ceil(spanY*16),data=new Uint8Array(width*height);data.fill(255);
 for(const wall of layout.walls){
  const x0=wall.x-wall.w/2,x1=wall.x+wall.w/2,y0=wall.y-wall.d/2,y1=wall.y+wall.d/2;
  const left=Math.max(0,Math.floor((x0-1-minX)/spanX*width)),right=Math.min(width-1,Math.ceil((x1+1-minX)/spanX*width));
  const bottom=Math.max(0,Math.floor((y0-1-minY)/spanY*height)),top=Math.min(height-1,Math.ceil((y1+1-minY)/spanY*height));
  for(let row=bottom;row<=top;row++)for(let col=left;col<=right;col++){
   const x=minX+(col+.5)/width*spanX,y=minY+(row+.5)/height*spanY;
   const dx=Math.max(x0-x,0,x-x1),dy=Math.max(y0-y,0,y-y1);
   const distance=Math.min(255,Math.round(Math.hypot(dx,dy)*255)),index=row*width+col;
   if(distance<data[index])data[index]=distance;
  }
 }
 return {data,width,height,minX,minY,spanX,spanY};
}
