// Rest-space detail stays sewn to the existing skinned surface in every pose.
// These masks describe established cuffs/hem/elbows/knees/lasted shoes; they do
// not add collision, change silhouettes or advance a separate animation clock.
export const JOE_GARMENT_VERTEX='varying vec3 joeRest; varying vec3 joeRestNormal;\n';
export const JOE_GARMENT_POSITION='joeRest=position;joeRestNormal=normal;';
export const JOE_GARMENT_FRAGMENT=`varying vec3 joeRest; varying vec3 joeRestNormal;
vec3 joeSkinSample(sampler2D skinTexture){
 vec3 w=pow(abs(normalize(joeRestNormal)),vec3(4.0));w/=max(dot(w,vec3(1.0)),.0001);
 vec3 p=joeRest*4.0+vec3(.2);
 return texture2D(skinTexture,p.yz).rgb*w.x+texture2D(skinTexture,p.xz).rgb*w.y+texture2D(skinTexture,p.xy).rgb*w.z;
}
float joeWear(vec3 center,vec3 radius){vec3 p=vec3(abs(joeRest.x),joeRest.yz);vec3 d=(p-center)/radius;return exp(-dot(d,d)*2.0);}
float joeRib(float coord){float a=1.0-smoothstep(.25,.7,fwidth(coord));return .5+.5*cos(coord*6.2831853)*a;}
`;
export function joeGarmentFinish(name){
 if(name==='Sweater')return `
  float elbow=joeWear(vec3(.27,1.16,.18),vec3(.095,.105,.10));
  float cuff=joeWear(vec3(.225,1.075,-.085),vec3(.075,.065,.065));
  float hem=(1.0-smoothstep(.97,1.015,joeRest.y))*smoothstep(.01,.12,joeRest.z);
  float ribs=mix(joeRib(joeRest.y/.0045),joeRib(joeRest.z/.0045),cuff);
  diffuseColor.rgb*=1.0-.16*max(cuff,hem)+.06*ribs*max(cuff,hem);
  float nap=dot(diffuseColor.rgb,vec3(.299,.587,.114));
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(nap)*1.18,elbow*.34);
 `;
 if(name==='Trousers')return `
  float knee=joeWear(vec3(.11,.53,.30),vec3(.095,.14,.09));
  float hem=(1.0-smoothstep(.16,.205,joeRest.y));
  diffuseColor.rgb*=1.0+.13*knee-.13*hem;
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.11,.082,.045),hem*.12);
 `;
 if(name==='Leather')return `
  float toe=(1.0-smoothstep(.22,.285,joeRest.z))*smoothstep(.04,.075,joeRest.y);
  float heel=smoothstep(.39,.45,joeRest.z)*(1.0-smoothstep(.065,.105,joeRest.y));
  float edge=(1.0-smoothstep(.038,.062,joeRest.y));
  diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.32+vec3(.018,.011,.006),max(toe,heel)*.5);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.10,.078,.047),edge*.24);
 `;
 return '';
}
