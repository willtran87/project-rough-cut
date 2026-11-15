// Windows CPU rendering, with an isolated browser profile and a local-only
// server. No Playwright dependency, browser installation changes or art overrides.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const project=fileURLToPath(new URL('..',import.meta.url));
const args=process.argv.slice(2),options={port:4188,profile:path.join(project,'output','back-nine-software-profile'),headless:false};
for(let i=0;i<args.length;i++){
 const arg=args[i];
 if(arg==='--headless')options.headless=true;
 else if(['--port','--profile','--browser'].includes(arg)&&args[i+1])options[arg.slice(2)]=args[++i];
 else throw new Error('Unknown or incomplete option: '+arg);
}
if(process.platform!=='win32')throw new Error('This launcher uses Windows WARP. Open back-nine.html normally on other systems.');
options.port=Number(options.port);
if(!Number.isInteger(options.port)||options.port<0||options.port>65535)throw new Error('Invalid local server port');
const candidates=[options.browser,
 path.join(process.env.PROGRAMFILES||'C:/Program Files','Google/Chrome/Application/chrome.exe'),
 path.join(process.env['PROGRAMFILES(X86)']||'C:/Program Files (x86)','Microsoft/Edge/Application/msedge.exe')].filter(Boolean);
const browser=options.browser?path.resolve(options.browser):candidates.find(p=>fs.existsSync(p));
if(!browser||!fs.existsSync(browser))throw new Error('Chrome or Edge was not found. Pass --browser with its executable path.');
const root=fs.realpathSync(path.join(project,'web')),profile=path.resolve(options.profile);
fs.mkdirSync(profile,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff':'font/woff','.woff2':'font/woff2'};
const inside=file=>file===root||file.startsWith(root+path.sep);
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!inside(file)){res.writeHead(403);res.end();return;}
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  file=fs.realpathSync(file);
  if(!inside(file)){res.writeHead(403);res.end();return;}
  const stat=fs.statSync(file);
  if(!stat.isFile())throw new Error('Not a file');
  res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.on('error',error=>{console.error('Could not start the local game server:',error.message);process.exitCode=1;});
server.listen(options.port,'127.0.0.1',()=>{
 const url=`http://127.0.0.1:${server.address().port}/back-nine.html`;
 const flags=[`--user-data-dir=${profile}`,'--use-angle=d3d11-warp','--disable-background-mode','--no-first-run','--no-default-browser-check',`--app=${url}`];
 // Test-only entry keeps the exact same software renderer and content server.
 if(options.headless)flags.push('--headless=new','--remote-debugging-port=0');
 const child=spawn(browser,flags,{stdio:'ignore',windowsHide:true});
 console.log(JSON.stringify({url,browser,pid:child.pid,profile,renderer:'d3d11-warp',headless:options.headless}));
 let closing=false;
 const close=()=>{if(closing)return;closing=true;server.close();server.closeAllConnections();};
 child.on('error',error=>{console.error(error.message);process.exitCode=1;close();});
 child.on('exit',close);
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{child.kill();close();});
});
