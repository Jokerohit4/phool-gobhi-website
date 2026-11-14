/* Local review helper. Usage: node tools/preview-prototype.cjs */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.prototype-review');
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
  for (let attempt = 0; attempt < 40; attempt++) {
    try { pages = await (await fetch(`http://127.0.0.1:${port}/json`, { signal: AbortSignal.timeout(1000) })).json(); break; } catch { await delay(250); }
  }
  if (!pages) throw new Error('Chrome debugging endpoint did not start');
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (!message.id) return;
    const item = pending.get(message.id); if (!item) return;
    clearTimeout(item.timeout); pending.delete(message.id);
    if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result);
  });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:4173/landing-v1.html' });
  await send('Page.bringToFront');
  await delay(1800);
  await evaluate('document.fonts.ready');
  assert.equal(await evaluate('document.querySelector("h1").textContent.includes("stronger")'), true);
  assert.equal(await evaluate('Boolean(window.pgScene)'), true, 'WebGL scene should initialise');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Desktop should not overflow');
  await screenshot('desktop.png');
  // Expose reveal sections before capturing the complete document.
  await evaluate('document.querySelectorAll(".reveal").forEach(el=>el.classList.add("is-visible"))');
  await delay(900);
  await screenshot('full-page.png', true);
  await evaluate('document.querySelector("#tab-nourish").click()');
  await delay(220);
  assert.equal(await evaluate('window.pgPrototype.chapter'), 'nourish');
  assert.equal(await evaluate('document.querySelector("#chapter-panel").textContent.includes("Food for your")'), true);
  await evaluate('document.querySelector("[data-demo-action=meal]").click()');
  assert.equal(await evaluate('document.querySelector("[data-demo-action=meal]").disabled'), true);
  await evaluate('document.querySelector("#tab-nourish").focus()');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight' });
  assert.equal(await evaluate('window.pgPrototype.chapter'), 'progress', 'Arrow navigation should activate the next tab');
  await evaluate('document.querySelector("[data-persona=wellness]").click()');
  assert.equal(await evaluate('document.querySelector("#persona-panel").getAttribute("aria-labelledby")'), 'persona-wellness');
  await evaluate('document.querySelector("#water-add").click()');
  assert.equal(await evaluate('document.querySelector("#water-amount").textContent.includes("1.45")'), true);
  await evaluate('document.querySelector("[data-download]").click()');
  assert.equal(await evaluate('document.querySelector("dialog").open'), true);
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await delay(150);
  assert.equal(await evaluate('document.querySelector("dialog").open'), false);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await delay(100);
  assert.equal(await evaluate('document.querySelector("#motion-toggle").getAttribute("aria-pressed")'), 'true');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate('document.querySelector("#tab-train").click(); document.querySelector("[data-persona=gym]").click(); document.querySelector(".toast").classList.remove("visible"); document.activeElement?.blur(); scrollTo(0,0)');
  await delay(450);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Mobile should not overflow');
  await screenshot('mobile.png');
  await screenshot('mobile-full-page.png', true);
  await evaluate('document.querySelector(".menu-toggle").click()');
  assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'true');
  const brokenImages = await evaluate('[...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img=>img.src)');
  assert.deepEqual(brokenImages, []);
  assert.deepEqual(errors, []);
  const report = { desktop: '1440 × 1000', mobile: '390 × 844', passed: ['WebGL rendering', 'No horizontal overflow', 'Product tabs and sample meal action', 'Keyboard tab navigation', 'Persona switching', 'Water logging preview', 'Dialog open / Escape close', 'Reduced motion', 'Mobile navigation', 'Image loading', 'No browser exceptions'], screenshots: ['desktop.png','full-page.png','mobile.png','mobile-full-page.png'] };
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { socket?.close(); browser.kill(); });
