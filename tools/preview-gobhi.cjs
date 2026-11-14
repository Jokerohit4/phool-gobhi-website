/* Local review helper. Usage: node tools/preview-prototype.cjs */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.prototype-review', 'gobhi');
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
 let pages;for(let i=0;i<45;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(1000)})).json();break;}catch{await delay(250);}}
 if(!pages)throw Error('Chrome did not start');
 socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 const errors=[];socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(!m.id)return;const p=pending.get(m.id);if(!p)return;clearTimeout(p.timeout);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);});
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Page.navigate',{url:'http://127.0.0.1:4173/model.html'});await send('Page.bringToFront');
 for(let i=0;i<40;i++){await delay(300);if(await evaluate('Boolean(window.pgJourney?.state.ready)'))break;}
 const status=await evaluate('({ready:window.pgJourney?.state.ready,error:window.pgRenderError,stats:window.pgGobhi?.stats})');console.log(JSON.stringify(status,null,2));
 assert.equal(status.ready,true,JSON.stringify({status,errors}));assert.equal(await evaluate('document.querySelector(".loading").classList.contains("done")'),true);
 assert.equal(status.stats.hands.digitsPerHand,5);assert.equal(status.stats.hands.opposableThumb,true);assert.ok(Object.values(status.stats.hands.components).every(n=>n===1),'Every forearm and hand must form a connected mesh');assert.ok(status.stats.crownTriangles>5000);assert.ok(status.stats.floretBuds>400,'Crown should have dense geometric floret detail');assert.equal(status.stats.armSpan,.84);
 const grooves=await evaluate('(()=>{const body=window.pgGobhi.capture()[0].geometry.cpu.positions;const cols=193,row=19,points=[];for(let c=0;c<cols;c++){const i=(row*cols+c)*3;points.push({x:body[i],z:body[i+2],r:Math.hypot(body[i],body[i+2]/.76)});}const back=Math.max(...points.filter(p=>p.z<0).map(p=>p.r));return {left:back-Math.min(...points.filter(p=>p.z>.1&&p.x<0).map(p=>p.r)),right:back-Math.min(...points.filter(p=>p.z>.1&&p.x>0).map(p=>p.r))};})()');assert.ok(grooves.left>.018&&grooves.right>.018,'Both stem grooves must be recessed into the body geometry');assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
 for(const pose of ['logo','phone','wave']){await evaluate(`document.querySelector('[data-pose="${pose}"]').click()`);await delay(350);await screenshot('gobhi-'+pose+'.png');assert.equal(await evaluate('window.pgGobhi.stats.pose'),pose);}
 await evaluate('document.querySelector("[data-pose=logo]").click();document.querySelector("[data-view=front]").click()');await delay(200);await screenshot('gobhi-front.png');
 await evaluate('document.querySelector("[data-view=side]").click()');await delay(200);await screenshot('gobhi-side.png');assert.ok(Math.abs((await evaluate('window.pgGobhi.view.yaw'))-Math.PI/2)<.001);
 await evaluate('document.querySelector("#hands").click()');await delay(250);assert.equal(await evaluate('window.pgGobhi.view.detail'),true);await screenshot('gobhi-hand-detail.png');
 await evaluate('document.querySelector("[data-view=side]").click()');await delay(150);await screenshot('gobhi-hand-side.png');
 await evaluate('document.querySelector("#reset").click()');assert.equal(await evaluate('window.pgGobhi.view.detail'),false);
 const downloadDirectory=path.join(output,'downloads-'+process.pid);fs.mkdirSync(downloadDirectory,{recursive:true});
 await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDirectory});
 await evaluate('document.querySelector("#download").click()');
 const downloadPath=path.join(downloadDirectory,'phool-gobhi-logo.glb');
 for(let i=0;i<60&&!fs.existsSync(downloadPath);i++)await delay(250);
 assert.ok(fs.existsSync(downloadPath),'GLB download should complete');
 const glb=fs.readFileSync(downloadPath);assert.equal(glb.readUInt32LE(0),0x46546c67);assert.equal(glb.readUInt32LE(4),2);assert.equal(glb.readUInt32LE(8),glb.length);const jsonLength=glb.readUInt32LE(12),data=JSON.parse(glb.subarray(20,20+jsonLength).toString('utf8').trim());assert.ok(data.meshes.length>5);assert.ok(data.nodes.length>20);assert.ok(data.accessors.every(a=>a.count>0));assert.ok(data.bufferViews.every(v=>(v.byteOffset||0)+v.byteLength<=data.buffers[0].byteLength));assert.ok(data.nodes.every(n=>n.matrix.every(Number.isFinite)));
 fs.writeFileSync(path.join(root,'public/prototype/assets/gobhi-logo.glb'),glb);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await delay(350);await screenshot('gobhi-mobile.png');assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
 assert.equal(await evaluate('document.querySelector("canvas").getContext("webgl").getError()'),0);assert.deepEqual(errors,[]);
 assert.ok(!fs.readFileSync(path.join(root,'public/prototype/index.html'),'utf8').includes('gobhi-model.js'),'Website must not integrate the unapproved model');
 const report={passed:['Dense geometric broccoli florets','Five anatomical digits and an opposable thumb','Connected forearm-to-hand geometry in all poses','Hand close-up controls and reset','Both stem grooves recessed into body geometry','Front and side model views','GLB binary structure, buffers and mesh accessors','Desktop and mobile rendering','Website isolated from model revisions','No browser or WebGL errors'],stats:status.stats,grooves,glb:{bytes:glb.length,nodes:data.nodes.length,meshes:data.meshes.length}};
 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();browser.kill();});
