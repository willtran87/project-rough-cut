// Bind-pose coordinates travel with Joe's existing morphs and wheel rotation.
// Broad islands control the dissolve; the smaller marks retain a pixel-art
// surface without screen-space grain crawling when the camera moves.
export const courseGhostSurfaceGLSL = `
  vec3 spectralCell=floor(ghostSurface*24.0);
  vec3 spectralIsland=floor(ghostSurface*vec3(7.0,11.0,7.0));
  float cluster=fract(sin(dot(spectralIsland,vec3(17.13,43.71,29.37)))*437.11);
  float grain=fract(sin(dot(spectralCell,vec3(31.17,19.73,47.11)))*237.19);
  float lowerBody=1.0-smoothstep(.28,1.48,ghostHeight);
  float delay=.025+lowerBody*.10+cluster*.20;
  float island=smoothstep(delay,delay+.20,ghostFade);
  float veil=smoothstep(lowerBody*.20,1.0,ghostFade);
  diffuseColor.a*=veil*island*(.90+.08*grain);
  if(diffuseColor.a<.002)discard;
`;
