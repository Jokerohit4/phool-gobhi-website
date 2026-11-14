/* One WebGL world: studio, Gobhi, phone, and the app journey. No 3-D CDN. */
(() => {
'use strict';
const canvas=document.getElementById('journey-canvas');
const studioMode=canvas.dataset.studio==='true';
let studioDetail=false,studioPose='logo',studioYaw=.20,studioPitch=.14,studioDistance=6.8,capture=null;
let gl;try{gl=canvas.getContext('webgl',{alpha:false,antialias:true,premultipliedAlpha:false});}catch(_){/* fallback */}
function fail(){document.body.classList.add('no-webgl');}
if(!gl){fail();return;}
const VS=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUV;uniform mat4 uModel,uView,uProjection;uniform mat3 uNormal;uniform float uOutline;uniform mat4 uLightVP;varying vec4 vShadow;varying vec3 vNormal,vWorld;varying vec2 vUV;void main(){vec4 w=uModel*vec4(aPosition+aNormal*uOutline,1.);vShadow=uLightVP*w;vWorld=w.xyz;vNormal=normalize(uNormal*aNormal);vUV=aUV;gl_Position=uProjection*uView*w;}`;
const FS=`precision mediump float;varying vec3 vNormal,vWorld;varying vec4 vShadow;varying vec2 vUV;uniform vec3 uColor,uCamera;uniform float uGloss,uTextured,uAlpha,uUnlit;uniform sampler2D uTexture,uShadowMap;uniform float uShadowEnabled;float visibility(){if(uShadowEnabled<.5)return 1.;vec3 p=vShadow.xyz/vShadow.w*.5+.5;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.)return 1.;float shadow=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float depth=texture2D(uShadowMap,p.xy+vec2(float(x),float(y))*.0018).r;shadow+=step(p.z-.0022,depth);}return .60+.40*shadow/9.;}void main(){vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-.6,1.2,1.8));float d=max(dot(n,l),0.)*visibility();float f=max(dot(n,normalize(vec3(1.,.3,.7))),0.);vec3 col=uColor*(.45+.48*d+.14*f+.09*(n.y*.5+.5));vec3 view=normalize(uCamera-vWorld);float s=pow(max(dot(n,normalize(l+view)),0.),64.);col+=vec3(1.,.98,.88)*s*uGloss;float grain=sin(vWorld.x*137.+sin(vWorld.z*91.))*sin(vWorld.y*143.+vWorld.z*47.);col*=.996+.004*grain;float a=uAlpha;if(uTextured>.5){vec4 tex=texture2D(uTexture,vUV);col=tex.rgb*(.92+.08*d);a*=tex.a;}if(uUnlit>.5)col=uColor*(.5+.5*visibility());if(a<.008)discard;float fog=1.-exp(-pow(length(uCamera-vWorld)*.026,2.));col=mix(col,vec3(.973,.961,.929),fog);gl_FragColor=vec4(col,a);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VS));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');}catch(error){window.pgRenderError=String(error);fail();return;}
gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(.973,.961,.929,1);
const U={};['uModel','uView','uProjection','uNormal','uColor','uCamera','uGloss','uTextured','uAlpha','uUnlit','uTexture','uOutline','uLightVP','uShadowEnabled','uShadowMap'].forEach(n=>U[n]=gl.getUniformLocation(program,n));
let depthPass=false,shadowReady=false,shadowProgram=null,shadowFramebuffer=null,shadowDepth=null,shadowA=0,shadowU={};
function orthographic(r,near,far){return new Float32Array([1/r,0,0,0,0,1/r,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]);}
if(gl.getExtension('WEBGL_depth_texture')){
 try{
  shadowProgram=gl.createProgram();gl.attachShader(shadowProgram,shader(gl.VERTEX_SHADER,'attribute vec3 aPosition;uniform mat4 uModel,uLightVP;void main(){gl_Position=uLightVP*uModel*vec4(aPosition,1.);}'));gl.attachShader(shadowProgram,shader(gl.FRAGMENT_SHADER,'precision mediump float;void main(){gl_FragColor=vec4(1.);}'));gl.linkProgram(shadowProgram);
  if(!gl.getProgramParameter(shadowProgram,gl.LINK_STATUS))throw Error('shadow link');
  shadowU={model:gl.getUniformLocation(shadowProgram,'uModel'),light:gl.getUniformLocation(shadowProgram,'uLightVP')};shadowA=gl.getAttribLocation(shadowProgram,'aPosition');
  shadowFramebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFramebuffer);shadowDepth=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowDepth);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,1024,1024,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shadowDepth,0);
  const color=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,color);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1024,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,color,0);shadowReady=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
 }catch(error){shadowReady=false;}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.useProgram(program);
}
const A={};['aPosition','aNormal','aUV'].forEach(n=>A[n]=gl.getAttribLocation(program,n));
const PI=Math.PI,TAU=2*PI,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);},lerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function matrix(pos=[0,0,0],scale=[1,1,1],rot=[0,0,0]){const [x,y,z]=rot,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);const m=mul(mul(new Float32Array([cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1]),new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1])),new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]));for(let c=0;c<3;c++)for(let r=0;r<3;r++)m[c*4+r]*=scale[c];m[12]=pos[0];m[13]=pos[1];m[14]=pos[2];return m;}
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
function normalMatrix(m){const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]],v=cross(b,c),w=cross(c,a),z=cross(a,b),d=dot(a,v)||1;return new Float32Array([...v.map(x=>x/d),...w.map(x=>x/d),...z.map(x=>x/d)]);}
function lookAt(eye,target){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function projection(fov,aspect){const f=1/Math.tan(fov*PI/360),near=.035,far=120;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
function mesh(v,n,uv,indices){function buffer(data,target){const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,data,gl.STATIC_DRAW);return b;}return {v:buffer(new Float32Array(v),gl.ARRAY_BUFFER),n:buffer(new Float32Array(n),gl.ARRAY_BUFFER),uv:buffer(new Float32Array(uv),gl.ARRAY_BUFFER),i:buffer(new Uint16Array(indices),gl.ELEMENT_ARRAY_BUFFER),count:indices.length,cpu:{positions:new Float32Array(v),normals:new Float32Array(n),uv:new Float32Array(uv),indices:new Uint16Array(indices)}};}
function surface(rows,cols,fn){const v=[],n=[],uv=[],idx=[];for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){const [p,no]=fn(r/rows,c/cols);v.push(...p);n.push(...no);uv.push(c/cols,r/rows);if(r<rows&&c<cols){const a=r*(cols+1)+c,b=a+cols+1;idx.push(a,b,a+1,a+1,b,b+1);}}return mesh(v,n,uv,idx);}
const sphere=surface(22,32,(v,u)=>{const t=v*PI,p=u*TAU,n=[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];return[n,n];});
const cylinder=surface(1,64,(v,u)=>{const a=u*TAU;return [[Math.cos(a),v*2-1,Math.sin(a)],[Math.cos(a),0,Math.sin(a)]];});
function disc(){const v=[0,0,0],n=[0,1,0],uv=[.5,.5],idx=[];for(let i=0;i<=64;i++){const a=i/64*TAU;v.push(Math.cos(a),0,Math.sin(a));n.push(0,1,0);uv.push(.5+Math.cos(a)*.5,.5+Math.sin(a)*.5);if(i<64)idx.push(0,i+1,i+2);}return mesh(v,n,uv,idx);}
const cap=disc();
function torus(radius,tube){return surface(64,24,(u,v)=>{const a=u*TAU,b=v*TAU;return[[(radius+tube*Math.cos(b))*Math.cos(a),(radius+tube*Math.cos(b))*Math.sin(a),tube*Math.sin(b)],[Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a),Math.sin(b)]];});}
const ring=torus(.62,.095);
function panel(w,h,r,d=0,frontOnly=false){const points=[];for(let k=0;k<4;k++){const cx=k===0||k===3?w/2-r:-w/2+r,cy=k<2?h/2-r:-h/2+r;for(let i=0;i<=10;i++){const a=(k*90+i*9)*PI/180;points.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}}const v=[],n=[],uv=[],idx=[];function vertex(p,normal,tex){v.push(...p);n.push(...normal);uv.push(...tex);return v.length/3-1;}const c=vertex([0,0,d/2],[0,0,1],[.5,.5]);points.forEach(p=>vertex([...p,d/2],[0,0,1],[p[0]/w+.5,p[1]/h+.5]));for(let i=0;i<points.length;i++)idx.push(c,i+1,(i+1)%points.length+1);if(!frontOnly){const back=vertex([0,0,-d/2],[0,0,-1],[.5,.5]);points.forEach(p=>vertex([...p,-d/2],[0,0,-1],[p[0]/w+.5,p[1]/h+.5]));for(let i=0;i<points.length;i++)idx.push(back,back+(i+1)%points.length+1,back+i+1);for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length],nn=norm([p[0],p[1],0]),s=v.length/3;vertex([...p,d/2],nn,[0,0]);vertex([...q,d/2],nn,[1,0]);vertex([...q,-d/2],nn,[1,1]);vertex([...p,-d/2],nn,[0,1]);idx.push(s,s+1,s+2,s,s+2,s+3);}}return mesh(v,n,uv,idx);}
const geo={phone:panel(1.34,2.72,.18,.15),screen:panel(1.22,2.58,.14,.006,true),island:panel(.4,.105,.052,.02),card:panel(3,4.3,.16,.06),cardFront:panel(2.96,4.26,.145,.002,true),small:panel(1.65,1.1,.1,.035),smallFront:panel(1.62,1.07,.09,.002,true),flat:panel(2,2,.01,.001,true),bar:panel(.32,1,.08,.28)};
let textures={};
function texture(image){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;}
const cream=[.973,.961,.929],green=[.12,.37,.22],sage=[.43,.56,.31],ivory=[.94,.925,.79],gold=[.76,.57,.19],ink=[.10,.16,.12];
function draw(g,pos,scale,rot,color,tex=null,options={},parent=null){if(options.alpha===0)return;let m=matrix(pos,scale,rot);if(parent)m=mul(parent,m);if(capture){capture.push({geometry:g,matrix:Array.from(m),color:Array.from(color),roughness:options.gloss>.3?.38:.72});return;}if(depthPass){if(options.depthWrite===false||(options.alpha??1)<.1)return;gl.uniformMatrix4fv(shadowU.model,false,m);gl.bindBuffer(gl.ARRAY_BUFFER,g.v);gl.enableVertexAttribArray(shadowA);gl.vertexAttribPointer(shadowA,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.i);gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);return;}gl.uniformMatrix4fv(U.uModel,false,m);gl.uniformMatrix3fv(U.uNormal,false,normalMatrix(m));gl.uniform3fv(U.uColor,color);gl.uniform1f(U.uGloss,options.gloss??.14);gl.uniform1f(U.uTextured,tex?1:0);gl.uniform1f(U.uAlpha,options.alpha??1);gl.uniform1f(U.uUnlit,options.unlit?1:0);if(tex){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(U.uTexture,0);}for(const [name,key,size] of [['aPosition','v',3],['aNormal','n',3],['aUV','uv',2]]){gl.bindBuffer(gl.ARRAY_BUFFER,g[key]);gl.enableVertexAttribArray(A[name]);gl.vertexAttribPointer(A[name],size,gl.FLOAT,false,0,0);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.i);gl.depthMask(options.depthWrite!==false);if(options.outline){gl.uniform1f(U.uOutline,options.outline);gl.uniform3fv(U.uColor,[.12,.265,.16]);gl.uniform1f(U.uUnlit,1);gl.enable(gl.CULL_FACE);gl.cullFace(gl.FRONT);gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);gl.disable(gl.CULL_FACE);gl.uniform1f(U.uOutline,0);gl.uniform3fv(U.uColor,color);gl.uniform1f(U.uUnlit,options.unlit?1:0);}gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);gl.depthMask(true);}
function ball(p,s,c,parent,rot=[0,0,0],alpha=1){draw(sphere,p,s,rot,c,null,{alpha},parent);}
function plinth(pos,radius=.9,height=.08,color=[.87,.86,.78]){draw(cylinder,pos,[radius,height,radius],[0,0,0],color);draw(cap,[pos[0],pos[1]+height,pos[2]],[radius,1,radius],[0,0,0],lerp(color,cream,.55),null,{unlit:true});}
function shadow(x,y,z,sx,sz,alpha=.25){draw(geo.flat,[x,y,z],[sx,sz,1],[-PI/2,0,0],[0,0,0],textures.shadow,{alpha,depthWrite:false});}
function rod(a,b,r,color,parent){const d=sub(b,a),length=Math.hypot(...d),mid=lerp(a,b,.5),yaw=Math.atan2(d[0],d[2]),pitch=Math.acos(clamp(d[1]/length,-1,1));draw(cylinder,mid,[r,length/2,r],[pitch,yaw,0],color,null,{},parent);ball(a,[r,r,r],color,parent);ball(b,[r,r,r],color,parent);}
const sculpt=window.createGobhiModel({mesh,surface,draw,matrix,multiply:mul,sphere,cylinder,cap,isReduced:()=>reduced});
function gobhi(...args){sculpt.draw(...args);}
function phone(pos,scale,rot,screenTex,alpha=1){const root=matrix(pos,[scale,scale,scale],rot);draw(geo.phone,[0,0,0],[1,1,1],[0,0,0],[.17,.20,.16],null,{gloss:.55,alpha},root);draw(geo.phone,[.015,0,-.025],[1.005,.995,.91],[0,0,0],[.54,.58,.47],null,{gloss:.6,alpha},root);draw(geo.screen,[0,0,.083],[1,1,1],[0,0,0],cream,screenTex,{alpha},root);draw(geo.island,[0,1.165,.101],[1,1,1],[0,0,0],[.10,.13,.10],null,{alpha},root);draw(geo.island,[0,-1.19,.105],[.85,.22,1],[0,0,0],[.16,.19,.15],null,{alpha},root);return root;}
function card(pos,rotation,tex,scale=1,alpha=1){const root=matrix(pos,[scale,scale,scale],rotation);draw(geo.card,[0,0,0],[1,1,1],[0,0,0],[.91,.92,.86],null,{alpha},root);draw(geo.cardFront,[0,0,.035],[1,1,1],[0,0,0],cream,tex,{alpha},root);return root;}
function miniCard(pos,rot,tex,alpha=1){const root=matrix(pos,[.78,.78,.78],rot);draw(geo.small,[0,0,0],[1,1,1],[0,0,0],[.92,.93,.87],null,{alpha},root);draw(geo.smallFront,[0,0,.022],[1,1,1],[0,0,0],cream,tex,{alpha},root);}
function dumbbell(pos,scale=1,rot=[0,0,-.5]){const root=matrix(pos,[scale,scale,scale],rot);draw(cylinder,[0,0,0],[.10,.64,.10],[0,0,PI/2],[.40,.52,.32],null,{},root);for(const x of [-.65,.65]){draw(cylinder,[x,0,0],[.43,.13,.43],[0,0,PI/2],green,null,{gloss:.45},root);draw(cap,[x+(x<0?-.135:.135),0,0],[.43,1,.43],[0,0,-PI/2],sage,null,{gloss:.2},root);}ball([0,0,0],[.65,.08,.08],[.46,.58,.35],root);}
let progress=0,targetProgress=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,frame=0,visible=true,ready=false,lastTime=0,clock=0,width=1,height=1,mobile=false,cameraState=null;
const keys=[
 {p:0,eye:[-4.2,3.0,7.8],target:[-.05,1.2,.8],mobileEye:[-2.8,3.2,9.2],mobileTarget:[1.05,2.1,1.2]},
 {p:.19,eye:[2.7,2.7,5.5],target:[.25,1.4,1.2],mobileEye:[2.1,2.8,5.5],mobileTarget:[.6,2.1,1.2]},
 {p:.285,eye:[.62,1.52,3.1],target:[.55,1.45,1.45],mobileEye:[.62,1.7,3.3],mobileTarget:[.55,1.7,1.45]},
 {p:.345,eye:[.55,1.5,1.0],target:[.55,1.5,-6],mobileEye:[.55,1.5,1.0],mobileTarget:[.55,1.5,-6]},
 {p:.40,eye:[-.95,2.0,.7],target:[-.6,1.6,-6],mobileEye:[1.1,2.8,1.5],mobileTarget:[1.1,3.05,-6]},
 {p:.48,eye:[-.75,2.0,-.1],target:[-.6,1.6,-6],mobileEye:[1.1,2.8,.7],mobileTarget:[1.1,3.05,-6]},
 {p:.59,eye:[-.8,2.0,-6.8],target:[-.65,1.6,-13.7],mobileEye:[1.1,2.8,-5.9],mobileTarget:[1.1,3.05,-13.7]},
 {p:.66,eye:[-.7,2.0,-7.5],target:[-.6,1.6,-13.7],mobileEye:[1.1,2.8,-6.6],mobileTarget:[1.1,3.05,-13.7]},
 {p:.77,eye:[-.8,2.0,-14.3],target:[-.7,1.6,-21.4],mobileEye:[1.1,2.8,-13.4],mobileTarget:[1.1,3.05,-21.4]},
 {p:.85,eye:[-.6,2.05,-15.0],target:[-.6,1.6,-21.4],mobileEye:[1.1,2.8,-13.8],mobileTarget:[1.1,3.05,-21.4]},
 {p:1,eye:[5.7,3.1,-13.6],target:[-.15,1.3,-21.4],mobileEye:[3.9,3.2,-12.7],mobileTarget:[2.0,2.6,-21.4]}
];
function camera(p){let i=0;while(i<keys.length-2&&p>keys[i+1].p)i++;const a=keys[i],b=keys[i+1],t=smooth(a.p,b.p,p);return{eye:lerp(mobile?a.mobileEye:a.eye,mobile?b.mobileEye:b.eye,t),target:lerp(mobile?a.mobileTarget:a.target,mobile?b.mobileTarget:b.target,t)};}
function bowl(pos){const root=matrix(pos,[1,1,1],[.15,0,.15]);ball([0,0,0],[.66,.27,.66],[.79,.67,.45],root);ball([0,.11,0],[.61,.16,.61],[.93,.87,.67],root);for(let i=0;i<13;i++){const a=i*2.4,r=.16+((i*7)%5)*.07;ball([Math.cos(a)*r,.23,Math.sin(a)*r],[.12,.06,.12],i%3===0?[.53,.65,.32]:i%3===1?[.76,.40,.20]:[.93,.79,.48],root);}draw(ring,[0,.13,0],[.91,.91,.91],[PI/2,0,0],[.87,.80,.64],null,{},root);}
function bottle(pos){const root=matrix(pos,[.64,.64,.64],[0,0,-.17]);draw(cylinder,[0,.5,0],[.24,.48,.24],[0,0,0],[.59,.70,.54],null,{gloss:.5},root);ball([0,.99,0],[.24,.13,.24],[.64,.74,.58],root);draw(cylinder,[0,1.12,0],[.13,.10,.13],[0,0,0],green,null,{},root);draw(cap,[0,1.23,0],[.13,1,.13],[0,0,0],sage,null,{},root);}
function drawWorld(){
 // Warm studio floor: all scenes share the same ground and lighting.
 draw(geo.flat,[0,-.86,-12],[70,70,1],[-PI/2,0,0],cream,null,{gloss:0,unlit:true});
 if(progress<.37){
  plinth([1.15,-.73,1.0],2.1,.10,[.88,.88,.81]);shadow(1.5,-.62,.2,1.25,.8,.28);shadow(.55,-.61,1.35,.75,.45,.2);
  gobhi([1.8,-.47,2.0],1.25,-1.98,true,clock);
  const straighten=smooth(.12,.29,progress);
  phone([.55,1.12,1.45],.86,[-.03*(1-straighten),-.24*(1-straighten),-.10*(1-straighten)],textures.home);
  // A subtle tap pulse is part of the screen surface, at the fingertip.
  if(!reduced&&progress<.2){const pulse=(Math.sin(clock*.002)+1)/2;draw(ring,[.73,.88,1.58],[.07+pulse*.055,.07+pulse*.055,.07],[0,0,0],sage,null,{alpha:(1-pulse)*.6,depthWrite:false});}
 }
 const enter=smooth(.31,.365,progress);
 if(enter>0){
  if(progress<.575){
   plinth([1.25,-.73,-6],2.0,.075,[.88,.90,.82]);shadow(1,-.64,-6,1.8,.7,.22);
   card([.95,1.6,-6],[-.02,-.12,-.035],textures.train,.86,enter);
   miniCard([2.7,2.65,-6.65],[0,-.23,.07],textures.session,enter);
   dumbbell([2.8,.1,-5.5],.48,[.3,.2,-.55]);
   draw(ring,[-.7,.3,-6.7],[.55,.55,.55],[.1,.25,.2],gold,null,{alpha:enter});
  }
  if(progress>.45&&progress<.76){
   const alpha=smooth(.45,.51,progress);
   plinth([1.2,-.73,-13.7],2.0,.075,[.91,.87,.77]);shadow(1,-.64,-13.7,1.8,.7,.22);
   card([.95,1.6,-13.7],[0,.09,.035],textures.food,.86,alpha);
   miniCard([2.65,2.5,-14.1],[0,-.15,-.055],textures.water,alpha);
   bowl([-.12,.20,-13.0]);bottle([2.7,-.3,-13.0]);
  }
  if(progress>.62){
   const alpha=smooth(.62,.69,progress),close=smooth(.86,1,progress),scale=mix(.86,.57,close);
   plinth([1.7,-.73,-21.4],2.7,.075,[.86,.89,.81]);shadow(1.5,-.64,-21.4,2.1,.75,.23);
   card([1.1,1.6,-21.4],[0,mix(-.10,-.2,close),mix(-.03,-.05,close)],textures.progress,scale,alpha);
   if(close>.03){const root=matrix([1.1,1.6,-21.46],[1.32,1,1],[0,-.2,-.05]);draw(geo.phone,[0,0,0],[1,1,1],[0,0,0],[.19,.23,.17],null,{gloss:.5,alpha:close},root);}
   if(close<.95){
    const growth=[.43,.74,1.0,.55,.86];growth.forEach((h,i)=>{const s=(1-close)*alpha;draw(geo.bar,[2.2+i*.26,-.3+h*.55*s,-21.0],[.85,h*1.1*s,.9],[0,-.05,0],i===2?green:[.52,.64,.39],null,{gloss:.25,alpha:1-close});});
    miniCard([2.7,2.6,-21.9],[0,-.2,.055],textures.streak,alpha*(1-close));
    draw(ring,[-.45,.5,-20.9],[.62,.62,.62],[.1,-.25,clock*.00004],gold,null,{alpha:alpha*(1-close),gloss:.4});
   }
   if(close>.05)gobhi([3.1,-.47,-21.2],1.25,-.3,false,clock,close);
  }
 }
}
function drawStudio(){
 if(studioDetail){draw(geo.flat,[0,-.15,0],[50,50,1],[-PI/2,0,0],cream,null,{unlit:true});sculpt.drawHandDetail();return;}
 draw(geo.flat,[0,-.15,0],[50,50,1],[-PI/2,0,0],cream,null,{unlit:true});
 plinth([0,-.075,0],2.25,.065,[.91,.91,.84]);
 if(studioPose==='phone'){
  gobhi([.65,.02,.65],1,-1.45,true,clock,1,'phone');
  phone([.04,1.07,.70],.46,[-.03,.35,-.04],textures.home);
 }else gobhi([0,.02,0],1,0,false,clock,1,studioPose);
}
function render(){if(!ready)return;
 if(studioMode){const target=studioDetail?[-.44,.51,.10]:[0,1.25,0],h=Math.cos(studioPitch)*studioDistance;cameraState={eye:[target[0]+Math.sin(studioYaw)*h,target[1]+Math.sin(studioPitch)*studioDistance,target[2]+Math.cos(studioYaw)*h],target};}
 else cameraState=camera(progress);
 const origin=studioMode?[0,1,0]:[1.3,1,progress<.37?1:progress<.53?-6:progress<.70?-13.7:-21.4];
 const lightVP=mul(orthographic(5.5,.1,30),lookAt([origin[0]-4,origin[1]+7,origin[2]+6],origin));
 if(shadowReady){depthPass=true;gl.useProgram(shadowProgram);gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFramebuffer);gl.viewport(0,0,1024,1024);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(shadowU.light,false,lightVP);studioMode?drawStudio():drawWorld();gl.bindFramebuffer(gl.FRAMEBUFFER,null);depthPass=false;}
 gl.useProgram(program);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.973,.961,.929,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.uniformMatrix4fv(U.uView,false,lookAt(cameraState.eye,cameraState.target));gl.uniformMatrix4fv(U.uProjection,false,projection(studioMode?39:mobile?58:44,width/height));gl.uniform3fv(U.uCamera,cameraState.eye);gl.uniformMatrix4fv(U.uLightVP,false,lightVP);gl.uniform1f(U.uOutline,0);gl.uniform1f(U.uShadowEnabled,shadowReady?1:0);
 if(shadowReady){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadowDepth);gl.uniform1i(U.uShadowMap,1);gl.activeTexture(gl.TEXTURE0);}
 studioMode?drawStudio():drawWorld();
}
function tick(time){frame=0;if(!ready||!visible)return;const delta=lastTime?Math.min(time-lastTime,50):16;lastTime=time;if(!reduced)clock+=delta;const previous=progress;progress=reduced?targetProgress:mix(progress,targetProgress,1-Math.exp(-delta*.013));if(Math.abs(progress-targetProgress)<.00003)progress=targetProgress;render();if((!reduced&&(studioMode||progress<.25||progress>.9))||Math.abs(progress-targetProgress)>.00003)frame=requestAnimationFrame(tick);}
function request(){if(!frame&&visible&&ready)frame=requestAnimationFrame(tick);}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;mobile=width<751;const ratio=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);gl.viewport(0,0,canvas.width,canvas.height);render();request();}
const stillStops=[0,.19,.40,.59,.77,1],stillBounds=[.105,.32,.505,.685,.9];
window.pgJourney={setProgress(value,still=false){reduced=still;let index=0;stillBounds.forEach((v,i)=>{if(value>=v)index=i+1;});targetProgress=still?stillStops[index]:clamp(value);if(still)progress=targetProgress;render();request();},get state(){return{progress,targetProgress,reduced,mobile,camera:cameraState,ready,engine:'WebGL',model:'Logo-derived implicit sculpt',shadows:shadowReady};}};
window.pgGobhi={
 get stats(){return {...sculpt.stats,shadowMap:shadowReady?'1024px PCF':'material fallback',pose:studioDetail?'hand-detail':studioPose};},
 setPose(pose){if(!['logo','phone','wave'].includes(pose))return;studioPose=pose;studioDetail=false;studioDistance=6.8;studioYaw=pose==='phone'?-.45:.20;render();request();},
 orbit(yaw,pitch){studioYaw=yaw;studioPitch=clamp(pitch,-.22,.7);render();request();},
 zoom(distance){studioDistance=clamp(distance,studioDetail?.8:4.6,studioDetail?2.5:10);render();request();},
 detail(){studioDetail=true;studioDistance=1.4;studioYaw=.30;studioPitch=.1;render();request();},
 reset(){studioDetail=false;studioDistance=6.8;studioYaw=.20;studioPitch=.14;render();request();},
 get view(){return {detail:studioDetail,yaw:studioYaw,pitch:studioPitch,distance:studioDistance};},
 capture(){capture=[];sculpt.draw([0,0,0],1,0,studioPose==='phone',0,1,studioPose);const objects=capture;capture=null;return objects;}
};
new ResizeObserver(resize).observe(canvas);document.addEventListener('visibilitychange',()=>{visible=!document.hidden;lastTime=0;request();});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;cancelAnimationFrame(frame);fail();});
/* Canvas UI textures use the same bundled Work Sans family as the app. */
function ui(type,width=720,height=1032){const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');const s=width/720;x.scale(s,s);const H=height/s;x.fillStyle='#fbf8f1';x.fillRect(0,0,720,H);
 const rr=(a,b,w,h,r,color)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 const text=(value,a,b,size=24,color='#213e2b',weight=400)=>{x.fillStyle=color;x.font=`${weight} ${size}px Work, Arial`;x.fillText(value,a,b);};
 const line=(y)=>{x.strokeStyle='#dedfd1';x.lineWidth=1;x.beginPath();x.moveTo(48,y);x.lineTo(672,y);x.stroke();};
 const check=(a,b)=>{rr(a,b,30,30,15,'#dce6d5');text('✓',a+7,b+23,20,'#25613a',600);};
 if(type==='home'){
  text('9:41',47,55,19,'#263b2b',600);text('▮▮  ▰',596,55,17);text('WEDNESDAY, 11 NOVEMBER',48,136,17,'#7d8975',600);text('A little stronger,',48,200,49,'#233d2b',600);text('Gobhi.',48,253,49,'#233d2b',600);rr(611,160,56,56,28,'#e1e7d4');text('G',628,197,26,'#426641',600);
  text('Today',48,315,22,'#28663c',600);text('Your progress',171,315,21,'#8b9282');line(337);rr(48,335,75,3,1,'#23653b');
  rr(40,365,640,433,35,'#dce6d5');text('YOUR NEXT LITTLE WIN',72,410,17,'#647a57',600);text('Show up.',72,484,64,'#285438',600);text('Get stronger.',72,551,64,'#285438',600);text('Full body strength',74,620,24,'#36533c',600);text('6 exercises · Your gym',74,658,19,'#718166');rr(71,697,577,64,32,'#24603b');text('Let’s do this',98,738,22,'#ffffff',600);text('→',595,739,27,'#ffffff');
  rr(40,824,306,206,28,'#efdfad');rr(362,824,318,206,28,'#e6e9de');text('MOVEMENT',66,865,15,'#7d713e',600);text('6,240',66,926,49,'#534c2c',600);text('steps',68,958,17,'#82764a');text('HYDRATION',388,865,15,'#707b65',600);text('1.2',388,926,49,'#40533a',600);text('of 2.5 litres',388,958,17,'#77826c');
  if(H>1100){text('THE SMALL THINGS COUNT',48,1091,16,'#7a846e',600);check(48,1120);text('A moment for yourself',94,1145,20);check(48,1180);text('Log your breakfast',94,1205,20);line(H-105);text('⌂',95,H-58,35,'#24603b');text('↗',270,H-58,35,'#8b9282');text('♡',443,H-58,35,'#8b9282');text('◎',610,H-58,35,'#8b9282');}
 }else if(type==='train'){
  text('TRAIN / YOUR NEXT SESSION',48,67,17,'#748368',600);text('A little stronger.',48,143,53,'#213d2b',600);text('One rep at a time.',48,201,53,'#213d2b',600);text('Full body strength',48,257,24,'#79876d');
  rr(46,293,628,128,23,'#dce6d5');text('YOUR GYM',72,334,16,'#5e7b52',600);text('6 exercises',72,379,31,'#315b37',600);text('↗',606,375,38,'#315b37');
  const rows=[['Goblet squat','3 sets · 10 reps'],['Dumbbell bench press','3 sets · 12 reps'],['Seated cable row','3 sets · 12 reps'],['A little stretch','A moment to cool down']];
  rows.forEach((row,i)=>{const y=456+i*102;rr(48,y,62,62,15,i===0?'#d7e4cd':'#e9ebdf');text(['↗','⌁','↔','✳'][i],65,y+43,31,'#4e7544');text(row[0],133,y+25,25,'#2b4630',600);text(row[1],133,y+56,18,'#8b9380');text(String(i+1).padStart(2,'0'),623,y+33,19,'#89957c');line(y+82);});
  rr(48,906,624,69,35,'#23613a');text('Start your session',80,951,23,'#ffffff',600);text('→',606,952,29,'#ffffff');
 }else if(type==='food'){
  text('FOOD / YOUR EVERYDAY',48,67,17,'#8f7b50',600);text('A little fuel.',48,143,56,'#463f2c',600);text('A very good day.',48,202,56,'#463f2c',600);text('Your food journal · Today',48,258,23,'#928367');
  rr(48,296,624,330,26,'#eee4cb');x.fillStyle='#d6c49f';x.beginPath();x.ellipse(360,458,190,115,-.12,0,TAU);x.fill();x.fillStyle='#f2e5c5';x.beginPath();x.ellipse(360,447,171,100,-.12,0,TAU);x.fill();[['#c27d49',-.2],['#859e5b',1.9],['#e4ba70',3.9]].forEach(([color,a])=>{x.fillStyle=color;x.beginPath();x.ellipse(360+Math.cos(a)*67,445+Math.sin(a)*32,78,43,-.2,0,TAU);x.fill();});text('Dal, rice & a little sabzi',48,684,29,'#4b4932',600);text('Your saved meal · 1 serving',48,724,20,'#8b8269');
  [['Protein','18g'],['Carbs','62g'],['Fat','12g']].forEach((a,i)=>{const px=48+i*216;rr(px,766,192,112,16,'#f0e7d5');text(a[0],px+20,802,17,'#8a7b5a');text(a[1],px+20,850,35,'#5e5338',600);});rr(48,918,624,67,34,'#23613a');text('Log this little moment',80,962,22,'#ffffff',600);text('+',611,962,29,'#ffffff');
 }else if(type==='progress'){
  text('YOUR PROGRESS / THIS WEEK',48,67,17,'#748368',600);text('Look at you.',48,145,57,'#24412c',600);text('Showing up.',48,205,57,'#24412c',600);text('3',45,372,132,'#29623c',600);text('sessions this week',149,365,23,'#839078');
  const bars=[.52,.34,1,.15,.77,.12,.12],base=683;bars.forEach((v,i)=>{const px=54+i*88;rr(px,base-v*230,55,v*230,8,i===2?'#24613b':'#b7c8a3');text(['M','T','W','T','F','S','S'][i],px+16,720,17,'#819072');});line(752);
  check(48,790);text('Your everyday is adding up.',98,815,23,'#4d6843',600);text('A little consistency, at your pace.',48,871,21,'#849176');rr(48,922,624,65,33,'#23613a');text('Your week, a little closer',80,964,22,'#ffffff',600);text('↗',615,964,26,'#ffffff');
 }else{
  const types={session:['YOUR SESSION','1 of 3','Sets, at your pace.'],water:['A LITTLE HYDRATION','1.2 litres','Every little sip counts.'],streak:['A LITTLE CONSISTENCY','3 days','Of showing up for you.']};const a=types[type];text(a[0],48,90,25,'#7b8969',600);text(a[1],48,238,89,'#2c5734',600);text(a[2],48,327,30,'#8c957f');
 }
 return texture(c);
}
async function init(){
 try{await Promise.all([document.fonts.load('400 24px Work'),document.fonts.load('600 24px Work')]);}catch(_){/* system font fallback */}
 ['train','food','progress','session','water','streak'].forEach(type=>{textures[type]=ui(type,720,['session','water','streak'].includes(type)?470:1032);});textures.home=ui('home',720,1500);
 const sc=document.createElement('canvas');sc.width=sc.height=128;const sx=sc.getContext('2d'),g=sx.createRadialGradient(64,64,1,64,64,62);g.addColorStop(0,'rgba(33,49,23,.5)');g.addColorStop(1,'rgba(33,49,23,0)');sx.fillStyle=g;sx.fillRect(0,0,128,128);textures.shadow=texture(sc);
 ready=true;resize();request();window.dispatchEvent(new Event('journeyready'));
}
init();
})();
