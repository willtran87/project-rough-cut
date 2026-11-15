// Keep the original verification entry point, now including the restored effects.
if(!process.argv.some(a=>a.startsWith('--out=')))process.argv.push('--out=output/effects-restoration');
require('./verify-atmosphere-return.cjs');
