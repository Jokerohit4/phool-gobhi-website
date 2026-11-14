/* Local review helper. Usage: node tools/preview-prototype.cjs */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.prototype-review', 'story');
fs.mkdirSync(output, { recursive: true });
const port = 9400 + process.pid % 1000;
const chromeLog = fs.openSync(path.join(output, 'chrome.log'), 'w');
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${port}`, `--remote-allow-origins=http://localhost:${port}`,
  `--user-data-dir=${path.join(output, `chrome-profile-${process.pid}`)}`, '--no-first-run', '--no-default-browser-check',
  '--window-size=1440,1000', 'about:blank'
], { windowsHide: true, stdio: ['ignore', chromeLog, chromeLog] });
let socket;
const pending = new Map();
let sequence = 0;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 45000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function screenshot(name, full = false) {
  const metrics = await send('Page.getLayoutMetrics');
  const clip = full ? { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 } : undefined;
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full, ...(clip ? { clip } : {}) });
  fs.writeFileSync(path.join(output, name), Buffer.from(shot.data, 'base64'));
}
async function main(){
 let pages;for(let i=0;i<50;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(1000)})).json();break;}catch{await delay(250);}}
 if(!pages)throw Error('Chrome did not start');socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(!m.id)return;const item=pending.get(m.id);if(!item)return;clearTimeout(item.timeout);pending.delete(m.id);if(m.error)item.reject(Error(JSON.stringify(m.error)));else item.resolve(m.result);});
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await send('Page.navigate',{url:'http://127.0.0.1:4173/story/model-source/build.html'});
 for(let i=0;i<80;i++){if(await evaluate('Boolean(window.pgJourney?.state.ready)'))break;await delay(250);}assert.equal(await evaluate('window.pgJourney?.state.ready'),true);
 const folder=path.join(root,'public/prototype/story/assets');await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:folder});
 for(const [pose,outputName] of [['phone','gobhi-front-phone.glb'],['wave','gobhi-wave.glb']]){
 const filename=`gobhi-build-${process.pid}-${pose}.glb`;
 await evaluate(`(()=>{window.pgGobhi.setPose(${JSON.stringify(pose)});const url=URL.createObjectURL(new Blob([window.pgGobhiGLB()],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download=${JSON.stringify(filename)};a.click();})()`);
 const target=path.join(folder,filename);for(let i=0;i<100&&!fs.existsSync(target);i++)await delay(250);assert.ok(fs.existsSync(target));const data=fs.readFileSync(target);assert.equal(data.readUInt32LE(0),0x46546c67);
 const oldLength=data.readUInt32LE(12),doc=JSON.parse(data.subarray(20,20+oldLength));
 const names=['stem','root-left','root-right','crown','florets-a','florets-b','florets-c','eye-left-socket','eye-left','eye-left-glint','eye-right-socket','eye-right','eye-right-glint','arm-left','nails-left','arm-right','nails-right'];
 assert.equal(doc.nodes.length,names.length);doc.nodes.forEach((node,i)=>node.name=names[i]);
 const json=Buffer.from(JSON.stringify(doc)),length=Math.ceil(json.length/4)*4,header=Buffer.from(data.subarray(0,20)),padding=Buffer.alloc(length-json.length,32),bin=data.subarray(20+oldLength);
 header.writeUInt32LE(20+length+bin.length,8);header.writeUInt32LE(length,12);const result=Buffer.concat([header,json,padding,bin]);fs.writeFileSync(path.join(folder,outputName),result);fs.unlinkSync(target);console.log('Exported '+pose+' pose: '+result.length+' bytes');
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();browser.kill();});
