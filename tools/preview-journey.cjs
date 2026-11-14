/* Local review helper. Usage: node tools/preview-prototype.cjs */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.prototype-review', 'journey');
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
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 20000);
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
async function main() {
  let pages;
  for (let attempt=0;attempt<40;attempt++) {
    try { pages=await (await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(1000)})).json();break; } catch { await delay(250); }
  }
  if(!pages)throw new Error('Chrome did not start');
  socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  const errors=[];
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);
    if(!message.id)return;const item=pending.get(message.id);if(!item)return;
    clearTimeout(item.timeout);pending.delete(message.id);
    if(message.error)item.reject(new Error(JSON.stringify(message.error)));else item.resolve(message.result);
  });
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await send('Page.navigate',{url:'http://127.0.0.1:4173/'});await send('Page.bringToFront');
  await delay(2000);
  for(let i=0;i<20;i++){if(await evaluate('Boolean(window.pgJourney?.state.ready)'))break;await delay(300);}
  assert.equal(await evaluate('window.pgJourney.state.ready'),true,'WebGL should be ready');
  assert.equal(await evaluate('document.querySelector(".loading").classList.contains("done")'),true,'Loading overlay must clear, including when the scene loads before the controller');
  await evaluate('if(window.pgJourneyUI.reduced)document.querySelector("#motion-toggle").click()');
  async function scrollToProgress(value){await evaluate(`scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*${value},behavior:'instant'})`);await delay(1100);}
  const states=[];
  for(const [name,p] of [['01-gobhi',0],['02-phone',.19],['03-training',.40],['04-nourish',.59],['05-progress',.77],['06-your-turn',1]]){
    await scrollToProgress(p);await screenshot(name+'.png');
    const state=await evaluate('window.pgJourney.state');states.push({name,progress:state.progress,camera:state.camera});
    assert.ok(Math.abs(state.progress-p)<.003,'Camera must track scroll');
  }
  for(const [name,p] of [['02b-screen-approach',.285],['02c-screen-entry',.345],['02d-inside',.365]]){await scrollToProgress(p);await screenshot(name+'.png');}
  assert.ok(states[0].camera.eye[2]>states[2].camera.eye[2]);
  assert.ok(states[2].camera.eye[2]>states[4].camera.eye[2],'Camera should travel through the app world');
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  await evaluate('document.querySelectorAll("[data-chapter]")[3].click()');await delay(1800);
  assert.equal(await evaluate('window.pgJourneyUI.chapter'),3,'Chapter navigation should move through the story');
  await evaluate('document.querySelector("[data-open]").click()');
  assert.equal(await evaluate('document.querySelector("dialog").open'),true);
  await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await delay(100);
  assert.equal(await evaluate('document.querySelector("dialog").open'),false);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await delay(800);
  for(let i=0;i<10;i++){if(await evaluate('window.pgJourneyUI.reduced'))break;await delay(200);}
  assert.equal(await evaluate('window.pgJourneyUI.reduced'),true);
  await scrollToProgress(.43);assert.ok(Math.abs((await evaluate('window.pgJourney.state.progress'))-.4)<.001,'Reduced motion uses still chapter views');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  for(const [name,p] of [['mobile-01-gobhi',0],['mobile-03-training',.4],['mobile-04-nourish',.59],['mobile-06-ending',1]]){
    await scrollToProgress(p);await screenshot(name+'.png');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'Mobile must not overflow');
  }
  assert.equal(await evaluate('window.pgJourney.state.mobile'),true);
  assert.equal(await evaluate('document.querySelector("canvas").getContext("webgl").getError()'),0,'No WebGL errors');
  assert.deepEqual(errors,[]);
  const report={passed:['Continuous 3-D world initialisation','Scroll-driven camera movement','All six story frames','Chapter navigation','Dialog and keyboard Escape','Reduced-motion still chapters','Desktop and mobile overflow','Mobile 3-D frames','No WebGL errors','No browser exceptions'],states};
  fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();browser.kill();});
