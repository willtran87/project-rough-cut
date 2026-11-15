// Separate physical planes must not display identical damage opposite one
// another. Offset by each plane's fixed coordinate, preserving the existing
// metres-per-UV scale and continuity across adjacent coplanar pieces.
// The folded sheet already owns its physical UVs and is left untouched.
export function offsetRangePanelUV(geometry){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
 if(!p||!n||!uv)return;
 for(let i=0;i<p.count;i++){
  const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));
  const plane=x>y&&x>z?p.getX(i):y>x&&y>z?p.getY(i):p.getZ(i);
  const u=x>y&&x>z?plane*.619+.73:y>x&&y>z?plane*.131:plane*.377+.41;
  const v=x>y&&x>z?plane*.247+.19:y>x&&y>z?plane*.347:plane*.193+.61;
  uv.setXY(i,uv.getX(i)+u,uv.getY(i)+v);
 }
}
