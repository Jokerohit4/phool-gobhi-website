/* A small, dependency-free WebGL sculpture. All geometry is generated locally. */
(() => {
  'use strict';
  const canvas = document.getElementById('hero-scene');
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }); } catch (_) { /* CSS fallback below */ }
  const fallback = () => document.body.classList.add('no-webgl');
  if (!gl) { fallback(); return; }
  const vertex = `attribute vec3 aPosition; attribute vec3 aNormal;
    uniform mat4 uModel; uniform mat4 uProjection; uniform mat3 uNormal;
    varying vec3 vNormal; varying vec3 vWorld;
    void main(){vec4 world=uModel*vec4(aPosition,1.);vWorld=world.xyz;
    vNormal=normalize(uNormal*aNormal);gl_Position=uProjection*world;}`;
  const fragment = `precision mediump float;
    varying vec3 vNormal; varying vec3 vWorld; uniform vec3 uColor; uniform float uGloss;
    void main(){vec3 n=normalize(vNormal);vec3 key=normalize(vec3(-.7,1.3,1.8));
    vec3 fill=normalize(vec3(1.,.2,.8)); float diffuse=max(dot(n,key),0.);
    float bounce=max(dot(n,fill),0.); float hemi=n.y*.5+.5;
    vec3 base=uColor*(.38+.57*diffuse+.17*bounce+.09*hemi);
    vec3 halfDir=normalize(key+vec3(0.,0.,1.)); float spec=pow(max(dot(n,halfDir),0.),48.);
    float rim=pow(1.-max(n.z,0.),3.);base+=vec3(1.,.96,.83)*spec*uGloss;
    base+=uColor*rim*.11;gl_FragColor=vec4(base,1.);}`;
  function shader(type, source) {
    const value = gl.createShader(type); gl.shaderSource(value, source); gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value));
    return value;
  }
  let program;
  try {
    program = gl.createProgram(); gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('WebGL program unavailable');
  } catch (_) { fallback(); return; }
  gl.useProgram(program); gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
  const locations = {};
  ['uModel', 'uProjection', 'uNormal', 'uColor', 'uGloss'].forEach(key => { locations[key] = gl.getUniformLocation(program, key); });
  const position = gl.getAttribLocation(program, 'aPosition');
  const normal = gl.getAttribLocation(program, 'aNormal');
  function mesh(vertices, normals, indices) {
    const buffer = (data, target) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; };
    return { position: buffer(new Float32Array(vertices), gl.ARRAY_BUFFER), normal: buffer(new Float32Array(normals), gl.ARRAY_BUFFER), index: buffer(new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER), count: indices.length };
  }
  function surface(rows, columns, point) {
    const vertices = [], normals = [], indices = [];
    for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
      const data = point(row / rows, col / columns); vertices.push(...data[0]); normals.push(...data[1]);
      if (row < rows && col < columns) { const a = row * (columns + 1) + col; const b = a + columns + 1; indices.push(a, b, a + 1, a + 1, b, b + 1); }
    }
    return mesh(vertices, normals, indices);
  }
  const TAU = Math.PI * 2;
  const sphere = surface(24, 32, (v, u) => {
    const t = v * Math.PI, p = u * TAU;
    const n = [Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)];
    return [n, n];
  });
  const torus = surface(90, 32, (u, v) => {
    const a = u * TAU, b = v * TAU, radius = 2.15, tube = .57;
    return [[(radius + tube * Math.cos(b)) * Math.cos(a), (radius + tube * Math.cos(b)) * Math.sin(a), tube * Math.sin(b)], [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)]];
  });
  // Column-major matrices; orthographic projection keeps the sculpture editorial.
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
    }
    return out;
  }
  function rotation(x, y, z) {
    const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
    return multiply(multiply(new Float32Array([cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1]),new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1])),new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]));
  }
  function draw(geometry, translation, scale, angles, color, gloss = .18) {
    const r = rotation(...angles), model = new Float32Array(r), n = new Float32Array(9);
    for (let col = 0; col < 3; col++) for (let row = 0; row < 3; row++) { model[col * 4 + row] *= scale[col]; n[col * 3 + row] = r[col * 4 + row] / scale[col]; }
    model[12] = translation[0]; model[13] = translation[1]; model[14] = translation[2];
    gl.uniformMatrix4fv(locations.uModel, false, model); gl.uniformMatrix3fv(locations.uNormal, false, n);
    gl.uniform3fv(locations.uColor, color); gl.uniform1f(locations.uGloss, gloss);
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.position); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.normal); gl.enableVertexAttribArray(normal); gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.index); gl.drawElements(gl.TRIANGLES, geometry.count, gl.UNSIGNED_SHORT, 0);
  }
  const florets = [];
  // Deterministic clustered florets: ivory cauliflower, green leaves and a tiny face.
  for (let row = 0; row < 3; row++) {
    const count = row === 0 ? 1 : row === 1 ? 7 : 10;
    for (let i = 0; i < count; i++) {
      const angle = i / count * TAU + row * .35;
      const radius = row === 0 ? 0 : row === 1 ? .29 : .49;
      florets.push([Math.cos(angle) * radius, .42 + (row === 0 ? .32 : row === 1 ? .19 : 0), Math.sin(angle) * radius * .65, .23 + (i % 3) * .015]);
    }
  }
  let width = 1, height = 1, pointerX = 0, pointerY = 0, scroll = 0;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true, frame = 0, lastTime = 0, elapsed = 0, lost = false;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.8);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const x = 4.5 * width / height;
    gl.uniformMatrix4fv(locations.uProjection, false, new Float32Array([1/x,0,0,0,0,1/4.5,0,0,0,0,-1/20,0,0,0,0,1]));
    render();
  }
  function render() {
    if (lost) return;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const float = paused ? 0 : Math.sin(elapsed * .0006) * .07;
    const ringAngles = [.2 + pointerY * .12, -.38 + pointerX * .12 + scroll * .22, -.28 + float * .15];
    draw(torus, [.55, .45 + float, -.8], [1, 1.16, 1], ringAngles, [.16, .40, .235], .3);
    // Fine inner material ring gives the sculpture a crafted edge.
    draw(torus, [.55, .45 + float, -.83], [.83, .965, .91], ringAngles, [.49, .61, .36], .23);
    const mx = 2.13, my = -2.45 + float, mz = 2.2;
    const part = (offset, scale, color, angles = [0, 0, 0], gloss = .18) => draw(sphere, [mx+offset[0],my+offset[1],mz+offset[2]], scale, angles, color, gloss);
    part([0,-.1,0],[.29,.49,.24],[.40,.57,.27]);
    part([-.27,-.08,.01],[.19,.42,.10],[.32,.51,.23],[0,0,.55]);
    part([.27,-.08,.01],[.19,.42,.10],[.45,.61,.29],[0,0,-.55]);
    part([-.16,-.5,.03],[.15,.12,.22],[.30,.46,.22]);
    part([.16,-.5,.03],[.15,.12,.22],[.38,.53,.24]);
    part([0,.37,0],[.58,.32,.43],[.83,.84,.66]);
    florets.forEach(([x,y,z,size], index) => {
      part([x,y,z],[size,size*.91,size],[.93+(index%2)*.02,.91+(index%2)*.02,.77+(index%3)*.015],[0,0,0],.1);
      // Small secondary curds keep the head recognisably cauliflower.
      if (index % 2 === 0) part([x+.075,y+.09,z+.12],[.105,.105,.1],[.96,.94,.82],[0,0,0],.1);
    });
    part([-.09,-.01,.235],[.028,.048,.024],[.12,.23,.13]);
    part([.09,-.01,.235],[.028,.048,.024],[.12,.23,.13]);
    part([0,-.12,.247],[.045,.013,.012],[.18,.32,.15]);
    part([-.17,-.08,.20],[.045,.022,.02],[.69,.49,.30]);
    part([.17,-.08,.20],[.045,.022,.02],[.69,.49,.30]);
    // A mustard seed-like sphere is a quiet reward cue.
    draw(sphere, [-1.9, 2.38 + float * 1.3, 1.1], [.13,.13,.13],[0,0,0],[.83,.63,.18],.35);
  }
  function tick(time) {
    frame = 0;
    if (paused || !visible || lost) { lastTime = 0; return; }
    if (lastTime) elapsed += Math.min(time - lastTime, 50);
    lastTime = time;
    render(); frame = requestAnimationFrame(tick);
  }
  function schedule() { if (!frame && !paused && visible && !lost) frame = requestAnimationFrame(tick); }
  window.pgScene = {
    setPaused(value) { paused = value; if (paused) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; render(); } else schedule(); },
    setPointer(x,y) { pointerX = x; pointerY = y; },
    setScroll(value) { scroll = value; }
  };
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { rootMargin: '80px' });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden && canvas.getBoundingClientRect().bottom > 0; schedule(); });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); fallback(); });
  new ResizeObserver(resize).observe(canvas);
  resize(); schedule();
})();
