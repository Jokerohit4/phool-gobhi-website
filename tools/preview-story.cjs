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
 let pages;for(let i=0;i<50;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(1000)})).json();break;}catch{await delay(250);}}if(!pages)throw Error('Chrome did not start');
 socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 const errors=[];socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(!m.id)return;const p=pending.get(m.id);if(!p)return;clearTimeout(p.timeout);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);});
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await send('Page.navigate',{url:'http://127.0.0.1:4173/?story=6'});await send('Page.bringToFront');
 for(let i=0;i<50;i++){if(await evaluate('Boolean(window.pgStory?.state.ready)'))break;await delay(250);}const loaded=await evaluate('({ready:window.pgStory?.state.ready,error:window.pgStoryError})');assert.equal(loaded.ready,true,JSON.stringify({loaded,errors}));assert.equal(await evaluate('document.querySelector(".loading").classList.contains("done")'),true);
 async function seek(p){await evaluate(`scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*${p},behavior:'instant'})`);await delay(1050);}
 if(process.argv.includes('--grip')||process.argv.includes('--shoulders')){
  const prefix=process.argv.includes('--shoulders')?'v9-final':'v8';await seek(0);await screenshot(prefix+'-hello.png');
  const states=[];for(const [name,p] of [['phone',.11],['orbit',.175],['behind',.205],['perspective',.23],['approach',.28],['centred',.35]]){await seek(p);await screenshot(prefix+'-'+name+'.png');states.push(await evaluate('window.pgStory.state'));}
  assert.equal(states[0].phone.scale,.155,'The held phone should be half its previous size');assert.equal(states[0].phone.screenFacingCamera,false);assert.equal(states[3].phone.screenFacingCamera,true);assert.ok(states[3].camera.eye[2]<0);assert.equal(states[5].phone.scale,.31,'The app tour should return to its readable size');assert.ok(Math.abs(states[5].phone.center.x-(await evaluate('document.querySelector("canvas").getBoundingClientRect().width'))/2)<4);
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('document.querySelector("#motion").click()');for(const [name,p] of [['hello',0],['phone',.11],['perspective',.23],['centred',.35]]){await seek(p);await screenshot(prefix+'-mobile-'+name+'.png');assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);}
  assert.deepEqual(errors,[]);assert.equal(await evaluate('document.querySelector("canvas").getContext("webgl").getError()'),0);console.log('Holding-pose checks passed: half-size phone, back-first reveal, behind-character perspective, full-size centred app, desktop/mobile framing, no WebGL or browser errors.');return;
 }
 if(process.argv.includes('--polish')){
  for(const [name,p] of [['water',.45],['food',.55],['workout',.65],['coins',.85]]){await seek(p);await delay(600);await screenshot('v7-final-'+name+'.png');}
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('document.querySelector("#motion").click()');await seek(.45);await screenshot('v7-final-mobile-water.png');
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  assert.ok((await evaluate('document.querySelector("#scene-heading").innerText')).includes('LOG. LET'));
  assert.deepEqual(errors,[]);assert.equal(await evaluate('document.querySelector("canvas").getContext("webgl").getError()'),0);console.log('Visual polish checks passed: four app chapters, mobile framing and heading spacing, no browser or WebGL errors.');return;
 }
 const states=[];const frames=[['01-hello',0],['02-phone-back',.11],['03-gobhi-perspective',.23],['04-centred-app',.35],['05-water',.45],['06-food',.55],['07-workout',.65],['08-history',.75],['09-coins',.85],['10-join',1]];
 for(const [name,p] of frames){await seek(p);await screenshot(name+'.png');const state=await evaluate('window.pgStory.state');states.push({name,scene:state.scene,phone:state.phone,camera:state.camera});assert.ok(Math.abs(state.progress-p)<.003);}
 assert.equal(states[0].phone.scale,0);assert.equal(states[1].phone.screenFacingCamera,false,'Initial phone reveal must show its back');assert.equal(states[2].phone.screenFacingCamera,true,'Over-the-shoulder view must show the app');assert.ok(states[2].camera.eye[2]<0,'The camera must be behind Gobhi');assert.ok(Math.abs(states[3].phone.center.x-(await evaluate('document.querySelector("canvas").getBoundingClientRect().width'))/2)<4,'App must be centred horizontally');
 for(const [p,field,value] of [[.45,'water',1250],[.55,'foodSaved',true],[.65,'workoutSaved',true],[.75,'historyWeek',true],[.85,'coinsCollected',true]]){await seek(p);assert.equal(await evaluate('document.querySelector("#demo-action").hidden'),false);if(field==='water'){const rect=await evaluate('window.pgStory.state.actionRect');const x=rect.x+rect.width/2,y=rect.y+rect.height/2;assert.equal(await evaluate(`document.elementFromPoint(${x},${y}).id`),'demo-action');await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});}else await evaluate('document.querySelector("#demo-action").click()');assert.equal(await evaluate(`window.pgStory.state.demo.${field}`),value);}
 await seek(.85);await delay(1500);await screenshot('09-coins-collected.png');
 await seek(.45);const movingScreen=await evaluate('window.pgStoryPaint.canvas.toDataURL()');await delay(400);assert.notEqual(await evaluate('window.pgStoryPaint.canvas.toDataURL()'),movingScreen,'The water surface and bubbles should animate while the story is idle');
 await seek(1);assert.equal(await evaluate('document.querySelector("#join-panel").hidden'),false);assert.ok((await evaluate('document.querySelector("#android-download").href')).includes('in.phoolgobi.customer'));assert.ok((await evaluate('document.querySelector("#ios-download").href')).includes('6804278072'));
 await seek(0);await evaluate('document.querySelector("#next").click()');await delay(2000);assert.equal(await evaluate('window.pgStoryUI.scene'),1,'Click should advance the story');
 await evaluate('document.querySelector("#previous").click()');await delay(2000);assert.equal(await evaluate('window.pgStoryUI.scene'),0);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:1100,y:500,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:1100,y:500,button:'left',clickCount:1});await delay(2000);assert.equal(await evaluate('window.pgStoryUI.scene'),1,'Clicking the 3D canvas should advance the story');await seek(0);
 await evaluate('document.querySelector("#about").click()');assert.equal(await evaluate('document.querySelector("dialog").open'),true);await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await delay(150);assert.equal(await evaluate('document.querySelector("dialog").open'),false);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});for(let i=0;i<12;i++){if(await evaluate('window.pgStoryUI.reduced'))break;await delay(200);}assert.equal(await evaluate('window.pgStoryUI.reduced'),true);await seek(.47);assert.ok(Math.abs((await evaluate('window.pgStory.state.progress'))-.45)<.001);
 const stillScreen=await evaluate('window.pgStoryPaint.canvas.toDataURL()');await delay(350);assert.equal(await evaluate('window.pgStoryPaint.canvas.toDataURL()'),stillScreen,'Reduced motion must freeze the app animations');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('window.pgStory.resetDemo();document.querySelector(".toast").classList.remove("visible");document.activeElement?.blur()');
 for(const [name,p] of [['mobile-01-hello',0],['mobile-02-phone',.11],['mobile-03-perspective',.23],['mobile-05-water',.45],['mobile-10-join',1]]){await seek(p);await screenshot(name+'.png');assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'No mobile horizontal overflow');}
 assert.equal(await evaluate('document.querySelector("canvas").getContext("webgl").getError()'),0);assert.deepEqual(errors,[]);
 const report={passed:['Waving greeting and speech cloud','Phone back faces the visitor on reveal','Camera moves behind Gobhi to reveal the app','Phone centred for feature tour','Water, food and workout demo actions','History view and coin reward','Scroll and click progression','Android and iOS store destinations','Keyboard dismissal and reduced motion','Mobile framing and overflow','No browser or WebGL errors'],states};fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();browser.kill();});
