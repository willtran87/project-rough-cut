// Where browser tools put scratch files (browser temp, before/after captures).
// ROUGH_CUT_ARTIFACTS overrides; otherwise keep the original workstation's
// F:/CodexArtifacts drive when it exists, else fall back to output/artifacts
// inside the repository (gitignored) so the tools run on any machine.
const fs = require('node:fs');
const path = require('node:path');

const legacy = 'F:/CodexArtifacts/project-rough-cut';
const root = (process.env.ROUGH_CUT_ARTIFACTS
  || (fs.existsSync(legacy) ? legacy : path.resolve(__dirname, '../../output/artifacts'))).replace(/\\/g, '/');

function dir(name) {
  const target = root + '/' + name;
  fs.mkdirSync(target, { recursive: true });
  return target;
}

module.exports = { root, dir };
