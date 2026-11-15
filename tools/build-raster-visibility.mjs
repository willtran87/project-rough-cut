// Reproducible, import-free browser module. Pass a Zig executable (tested with
// 0.13.0), or set ZIG. No compiler/runtime dependency is shipped to the player.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
for(const simd of [false,true]){
 const r=spawnSync(process.argv[2]||process.env.ZIG||'zig',['cc','--target=wasm32-freestanding','-O3','-fno-fast-math','-ffp-contract=off',...(simd?['-msimd128','-DRASTER_SIMD']:[]),'-nostdlib','-Wl,--no-entry','-Wl,--export=__heap_base','-Wl,--export-memory','tools/raster-visibility.c','-o',`web/raster-visibility${simd?'-simd':''}.wasm`],{cwd:root,stdio:'inherit'});
 if(r.error)throw r.error;if(r.status!==0){process.exitCode=r.status??1;break;}
}
