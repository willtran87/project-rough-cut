// Where browser tools put scratch files (browser temp, before/after captures).
// ROUGH_CUT_ARTIFACTS overrides; otherwise output/artifacts inside the
// repository (gitignored), so the tools behave the same on every machine.
const fs = require('node:fs');
const path = require('node:path');

const root = (process.env.ROUGH_CUT_ARTIFACTS
  || path.resolve(__dirname, '../../output/artifacts')).replace(/\\/g, '/');

function dir(name) {
  const target = root + '/' + name;
  fs.mkdirSync(target, { recursive: true });
  return target;
}

module.exports = { root, dir };
