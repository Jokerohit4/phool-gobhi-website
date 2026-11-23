/* One WebGL world: studio, Gobhi, phone, and the app journey. No 3-D CDN. */
import { storyPaint } from './paint';
import { createScreenText } from './screen-text';
import { createDemoDay, applyDemoAction, waterScrollProgress, chapterProgress, scrollWorkoutSets, rewardSpinDuration, rewardLandingAngle, journeyStops, journeyScreens, visualScenes, chapterIndex, chapterAt, tourTiming } from './journey';
import { sampleCameraPath } from './motion';
import { storyStaging, appTransition } from './staging';
export function createStoryRenderer(canvas, root) {
const lifecycle=new AbortController(),signal=lifecycle.signal,buffers=new Set(),allTextures=new Set(),shaders=new Set();let disposed=false,loadTimeout;
const listen=(target,name,fn,options={})=>target.addEventListener(name,fn,{...options,signal});
const studioMode=false;const assetBase=new URL('/gobhi/',location.origin);const actors={};let phoneTexture=null,phoneTextureWidth=0,lastScreen='',lastPaint='',lastState=null,phonePose=null,viewProjection=null,screenEnteredAt=0,actionTime=-10000,actionScreen='',previousWater=1000;let demo=createDemoDay(),rewardTime=-10000,lastShadowClock=-1000,lastShadowProgress=-1;
let studioDetail=false,studioPose='logo',studioYaw=.20,studioPitch=.14,studioDistance=6.8,capture=null;
let historyEnteredAt=0,historyWasVisible=false;
let rawWaterProgress=0,scrollDirection=1,waterDisplay=1000,waterDwell=0,waterArmed=false;
let chapterDwell=[0,0,0],mealTime=-10000,setTimes=[-10000,-10000,-10000],wheelFrom=0,wheelTarget=0;
let gl;try{gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power',premultipliedAlpha:false});}catch(_){/* fallback */}
function fail(){if(disposed)return;root.classList.add('no-webgl');root.querySelector('.loading')?.classList.add('done');}
if(!gl){fail();return null;}
const screenText=createScreenText(canvas);let screenTextRuns=[];
function nativeTextWeight(){return smooth(.34,.35,progress)*(1-smooth(.88,.89,progress));}
const VS=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUV;uniform mat4 uModel,uView,uProjection;uniform mat3 uNormal;uniform float uOutline;uniform mat4 uLightVP;varying vec4 vShadow;varying vec3 vNormal,vWorld;varying vec2 vUV;void main(){vec4 w=uModel*vec4(aPosition+aNormal*uOutline,1.);vShadow=uLightVP*w;vWorld=w.xyz;vNormal=normalize(uNormal*aNormal);vUV=aUV;gl_Position=uProjection*uView*w;}`;
const FS=`precision mediump float;varying vec3 vNormal,vWorld;varying vec4 vShadow;varying vec2 vUV;uniform vec3 uColor,uCamera;uniform float uGloss,uTextured,uAlpha,uUnlit;uniform sampler2D uTexture,uShadowMap;uniform float uShadowEnabled,uShowcase,uDissolve;float visibility(){if(uShadowEnabled<.5)return 1.;vec3 p=vShadow.xyz/vShadow.w*.5+.5;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.)return 1.;float shadow=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float depth=texture2D(uShadowMap,p.xy+vec2(float(x),float(y))*.0028).r;shadow+=step(p.z-.0022,depth);}return .60+.40*shadow/9.;}void main(){if(uDissolve<.999){vec2 q=mod(floor(gl_FragCoord.xy),4.);float a=mod(q.x+q.y*2.,4.);float b=mod(floor(q.x/2.)+floor(q.y/2.)*2.,4.);if((a*4.+b+.5)/16.>uDissolve)discard;}if(uUnlit>.5){gl_FragColor=vec4(uColor*(.5+.5*visibility()),uAlpha);return;}if(uTextured>.5){vec4 tex=texture2D(uTexture,vUV);float alpha=tex.a*uAlpha;if(alpha<.008)discard;gl_FragColor=vec4(tex.rgb*.97,alpha);return;}vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-.6,1.2,mix(1.8,-1.8,uShowcase)));float d=max(dot(n,l),0.)*visibility();float f=max(dot(n,normalize(vec3(1.,.3,.7))),0.);vec3 col=uColor*(.45+.48*d+.14*f+.09*(n.y*.5+.5));vec3 view=normalize(uCamera-vWorld);float s=pow(max(dot(n,normalize(l+view)),0.),64.);col+=vec3(1.,.98,.88)*s*uGloss;float a=uAlpha;if(uTextured>.5){vec4 tex=texture2D(uTexture,vUV);col=tex.rgb*(.92+.08*d);a*=tex.a;}if(uUnlit>.5)col=uColor*(.5+.5*visibility());if(a<.008)discard;float fog=1.-exp(-pow(length(uCamera-vWorld)*.026,2.));col=mix(col,vec3(.984,.973,.945),fog);gl_FragColor=vec4(col,a);}`;
function shader(type,source){const s=gl.createShader(type);shaders.add(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VS));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');}catch(error){fail();return null;}
gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(.973,.961,.929,1);
const U={};['uModel','uView','uProjection','uNormal','uColor','uCamera','uGloss','uTextured','uAlpha','uUnlit','uTexture','uOutline','uLightVP','uShadowEnabled','uShadowMap','uShowcase','uDissolve'].forEach(n=>U[n]=gl.getUniformLocation(program,n));
const SHADOW_SIZE=512;let depthPass=false,shadowReady=false,shadowActive=false,shadowProgram=null,shadowFramebuffer=null,shadowDepth=null,shadowA=0,shadowU={};
function orthographic(r,near,far){return new Float32Array([1/r,0,0,0,0,1/r,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]);}
if(!matchMedia('(max-width:1023px)').matches&&gl.getExtension('WEBGL_depth_texture')){
 try{
  shadowProgram=gl.createProgram();gl.attachShader(shadowProgram,shader(gl.VERTEX_SHADER,'attribute vec3 aPosition;uniform mat4 uModel,uLightVP;void main(){gl_Position=uLightVP*uModel*vec4(aPosition,1.);}'));gl.attachShader(shadowProgram,shader(gl.FRAGMENT_SHADER,'precision mediump float;void main(){gl_FragColor=vec4(1.);}'));gl.linkProgram(shadowProgram);
  if(!gl.getProgramParameter(shadowProgram,gl.LINK_STATUS))throw Error('shadow link');
  shadowU={model:gl.getUniformLocation(shadowProgram,'uModel'),light:gl.getUniformLocation(shadowProgram,'uLightVP')};shadowA=gl.getAttribLocation(shadowProgram,'aPosition');
  shadowFramebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFramebuffer);shadowDepth=gl.createTexture();allTextures.add(shadowDepth);gl.bindTexture(gl.TEXTURE_2D,shadowDepth);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,SHADOW_SIZE,SHADOW_SIZE,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shadowDepth,0);
  const color=gl.createTexture();allTextures.add(color);gl.bindTexture(gl.TEXTURE_2D,color);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SHADOW_SIZE,SHADOW_SIZE,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,color,0);shadowReady=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
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
function mesh(v,n,uv,indices){function buffer(data,target){const b=gl.createBuffer();buffers.add(b);gl.bindBuffer(target,b);gl.bufferData(target,data,gl.STATIC_DRAW);return b;}return {v:buffer(new Float32Array(v),gl.ARRAY_BUFFER),n:buffer(new Float32Array(n),gl.ARRAY_BUFFER),uv:buffer(new Float32Array(uv),gl.ARRAY_BUFFER),i:buffer(new Uint16Array(indices),gl.ELEMENT_ARRAY_BUFFER),count:indices.length,cpu:{positions:new Float32Array(v),normals:new Float32Array(n),uv:new Float32Array(uv),indices:new Uint16Array(indices)}};}
function surface(rows,cols,fn){const v=[],n=[],uv=[],idx=[];for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){const [p,no]=fn(r/rows,c/cols);v.push(...p);n.push(...no);uv.push(c/cols,r/rows);if(r<rows&&c<cols){const a=r*(cols+1)+c,b=a+cols+1;idx.push(a,b,a+1,a+1,b,b+1);}}return mesh(v,n,uv,idx);}
const sphere=surface(12,20,(v,u)=>{const t=v*PI,p=u*TAU,n=[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];return[n,n];});
const cylinder=surface(1,32,(v,u)=>{const a=u*TAU;return [[Math.cos(a),v*2-1,Math.sin(a)],[Math.cos(a),0,Math.sin(a)]];});
function disc(){const v=[0,0,0],n=[0,1,0],uv=[.5,.5],idx=[];for(let i=0;i<=64;i++){const a=i/64*TAU;v.push(Math.cos(a),0,Math.sin(a));n.push(0,1,0);uv.push(.5+Math.cos(a)*.5,.5+Math.sin(a)*.5);if(i<64)idx.push(0,i+1,i+2);}return mesh(v,n,uv,idx);}
const cap=disc();
function torus(radius,tube){return surface(40,8,(u,v)=>{const a=u*TAU,b=v*TAU;return[[(radius+tube*Math.cos(b))*Math.cos(a),(radius+tube*Math.cos(b))*Math.sin(a),tube*Math.sin(b)],[Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a),Math.sin(b)]];});}
const ring=torus(.62,.095),appRing=torus(.62,.009);
const droplet=surface(24,32,(v,u)=>{const a=v*PI,b=u*TAU,n=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)],r=.72-.28*n[1];return[[n[0]*r,n[1]+.3*Math.pow(Math.max(0,n[1]),5),n[2]*r],n];});
function panel(w,h,r,d=0,frontOnly=false){const points=[];for(let k=0;k<4;k++){const cx=k===0||k===3?w/2-r:-w/2+r,cy=k<2?h/2-r:-h/2+r;for(let i=0;i<=10;i++){const a=(k*90+i*9)*PI/180;points.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}}const v=[],n=[],uv=[],idx=[];function vertex(p,normal,tex){v.push(...p);n.push(...normal);uv.push(...tex);return v.length/3-1;}const c=vertex([0,0,d/2],[0,0,1],[.5,.5]);points.forEach(p=>vertex([...p,d/2],[0,0,1],[p[0]/w+.5,p[1]/h+.5]));for(let i=0;i<points.length;i++)idx.push(c,i+1,(i+1)%points.length+1);if(!frontOnly){const back=vertex([0,0,-d/2],[0,0,-1],[.5,.5]);points.forEach(p=>vertex([...p,-d/2],[0,0,-1],[p[0]/w+.5,p[1]/h+.5]));for(let i=0;i<points.length;i++)idx.push(back,back+(i+1)%points.length+1,back+i+1);for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length],nn=norm([p[0],p[1],0]),s=v.length/3;vertex([...p,d/2],nn,[0,0]);vertex([...q,d/2],nn,[1,0]);vertex([...q,-d/2],nn,[1,1]);vertex([...p,-d/2],nn,[0,1]);idx.push(s,s+1,s+2,s,s+2,s+3);}}return mesh(v,n,uv,idx);}
const geo={phone:panel(1.34,2.72,.18,.15),screen:panel(1.22,2.58,.14,.006,true),island:panel(.4,.105,.052,.02),card:panel(3,4.3,.16,.06),cardFront:panel(2.96,4.26,.145,.002,true),small:panel(1.65,1.1,.1,.035),smallFront:panel(1.62,1.07,.09,.002,true),flat:panel(2,2,.01,.001,true),bar:panel(.32,1,.08,.28)};
let textures={};
function texture(image){const t=gl.createTexture();allTextures.add(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;}
const cream=[.973,.961,.929],green=[.12,.37,.22],sage=[.43,.56,.31],ivory=[.94,.925,.79],gold=[.76,.57,.19],ink=[.10,.16,.12];
function draw(g,pos,scale,rot,color,tex=null,options={},parent=null){if(options.alpha===0)return;let m=matrix(pos,scale,rot);if(parent)m=mul(parent,m);if(capture){capture.push({geometry:g,matrix:Array.from(m),color:Array.from(color),roughness:options.gloss>.3?.38:.72});return;}if(depthPass){if(options.depthWrite===false||(options.alpha??1)<.1)return;gl.uniformMatrix4fv(shadowU.model,false,m);gl.bindBuffer(gl.ARRAY_BUFFER,g.v);gl.enableVertexAttribArray(shadowA);gl.vertexAttribPointer(shadowA,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.i);gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);return;}gl.uniformMatrix4fv(U.uModel,false,m);gl.uniformMatrix3fv(U.uNormal,false,normalMatrix(m));gl.uniform3fv(U.uColor,color);gl.uniform1f(U.uGloss,options.gloss??.14);gl.uniform1f(U.uTextured,tex?1:0);gl.uniform1f(U.uAlpha,options.alpha??1);gl.uniform1f(U.uDissolve,options.dissolve??1);gl.uniform1f(U.uUnlit,options.unlit?1:0);if(tex){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(U.uTexture,0);}for(const [name,key,size] of [['aPosition','v',3],['aNormal','n',3],['aUV','uv',2]]){gl.bindBuffer(gl.ARRAY_BUFFER,g[key]);gl.enableVertexAttribArray(A[name]);gl.vertexAttribPointer(A[name],size,gl.FLOAT,false,0,0);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.i);gl.depthMask(options.depthWrite!==false);if(options.outline){gl.uniform1f(U.uOutline,options.outline);gl.uniform3fv(U.uColor,[.12,.265,.16]);gl.uniform1f(U.uUnlit,1);gl.enable(gl.CULL_FACE);gl.cullFace(gl.FRONT);gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);gl.disable(gl.CULL_FACE);gl.uniform1f(U.uOutline,0);gl.uniform3fv(U.uColor,color);gl.uniform1f(U.uUnlit,options.unlit?1:0);}gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);gl.depthMask(true);}
function ball(p,s,c,parent,rot=[0,0,0],alpha=1){draw(sphere,p,s,rot,c,null,{alpha},parent);}
function plinth(pos,radius=.9,height=.08,color=[.87,.86,.78]){draw(cylinder,pos,[radius,height,radius],[0,0,0],color);draw(cap,[pos[0],pos[1]+height,pos[2]],[radius,1,radius],[0,0,0],lerp(color,cream,.55),null,{unlit:true});}
function shadow(x,y,z,sx,sz,alpha=.25){draw(geo.flat,[x,y,z],[sx,sz,1],[-PI/2,0,0],[0,0,0],textures.shadow,{alpha,depthWrite:false});}
function rod(a,b,r,color,parent){const d=sub(b,a),length=Math.hypot(...d),mid=lerp(a,b,.5),yaw=Math.atan2(d[0],d[2]),pitch=Math.acos(clamp(d[1]/length,-1,1));draw(cylinder,mid,[r,length/2,r],[pitch,yaw,0],color,null,{},parent);ball(a,[r,r,r],color,parent);ball(b,[r,r,r],color,parent);}
function phone(pos,scale,rot,screenTex,alpha=1){const root=matrix(pos,[scale,scale,scale],rot);
 draw(geo.phone,[0,0,0],[1,1,1],[0,0,0],[.14,.21,.16],null,{gloss:.38,alpha},root);
 if(!depthPass)gl.uniform1f(U.uShadowEnabled,0);
 draw(geo.screen,[0,0,.083],[1,1,1],[0,0,0],cream,screenTex,{alpha},root);
 if(!depthPass)gl.uniform1f(U.uShadowEnabled,shadowActive?1:0);
 draw(geo.screen,[0,0,-.083],[1,1,1],[0,PI,0],cream,textures.back,{alpha},root);
 draw(geo.island,[0,1.165,.101],[1,1,1],[0,0,0],[.10,.13,.10],null,{alpha},root);draw(geo.island,[0,-1.255,.105],[.85,.22,1],[0,0,0],[.16,.19,.15],null,{alpha},root);
 draw(cameraBump,[.34,.93,-.105],[1,1,1],[0,0,0],[.19,.28,.21],null,{alpha,gloss:.25},root);
 for(const y of [.82,1.03]){ball([.34,y,-.14],[.071,.071,.030],[.07,.13,.10],root,[0,0,0],alpha);ball([.325,y+.018,-.165],[.021,.021,.009],[.24,.37,.29],root,[0,0,0],alpha);}
 return root;
}
function card(pos,rotation,tex,scale=1,alpha=1){const root=matrix(pos,[scale,scale,scale],rotation);draw(geo.card,[0,0,0],[1,1,1],[0,0,0],[.91,.92,.86],null,{alpha},root);draw(geo.cardFront,[0,0,.035],[1,1,1],[0,0,0],cream,tex,{alpha},root);return root;}
function miniCard(pos,rot,tex,alpha=1){const root=matrix(pos,[.78,.78,.78],rot);draw(geo.small,[0,0,0],[1,1,1],[0,0,0],[.92,.93,.87],null,{alpha},root);draw(geo.smallFront,[0,0,.022],[1,1,1],[0,0,0],cream,tex,{alpha},root);}
function dumbbell(pos,scale=1,rot=[0,0,-.5]){const root=matrix(pos,[scale,scale,scale],rot);draw(cylinder,[0,0,0],[.10,.64,.10],[0,0,PI/2],[.40,.52,.32],null,{},root);for(const x of [-.65,.65]){draw(cylinder,[x,0,0],[.43,.13,.43],[0,0,PI/2],green,null,{gloss:.45},root);draw(cap,[x+(x<0?-.135:.135),0,0],[.43,1,.43],[0,0,-PI/2],sage,null,{gloss:.2},root);}ball([0,0,0],[.65,.08,.08],[.46,.58,.35],root);}
let activeUntil=0,inTick=false,textureClock=0;
let progress=0,targetProgress=0,reduced=false,frame=0,visible=true,ready=false,lastTime=0,clock=0,width=1,height=1,mobile=false,landscapePhone=false,cameraState=null;
const stops=journeyStops;
const keys=[
 {p:0,eye:[0,2.0,8.3],target:[-.85,1.30,0],me:[0,2.4,8.1],mt:[0,1.65,0]},
 {p:.11,eye:[0,1.9,6.7],target:[-.65,1.15,.2],me:[0,2.3,7.8],mt:[0,1.75,.2]},
 {p:.175,eye:[-4.1,2.4,.5],target:[0,1.0,.35],me:[-4.4,2.8,.5],mt:[0,1.25,.4]},
 // Spiral in toward the held screen without the former far-back detour.
 // Keep the framing growth distributed across the whole handoff, not .205-.23.
 {p:.205,eye:[-2.7,1.6,-.7],target:[0,.80,.72],me:[-2.7,1.8,-.7],mt:[0,1.0,.72]},
 {p:.245,eye:[-1.5,1.1,-.7],target:[0,.74,.85],me:[-1.5,1.25,-.7],mt:[0,.88,.85]},
 {p:.28,eye:[-.7,.90,.05],target:[0,.65,1.20],me:[-.7,.98,.05],mt:[0,.75,1.20]},
 {p:.35,eye:[0,.55,.80],target:[0,.55,2.30],me:[0,.65,.80],mt:[0,.65,2.30]},
 {p:.89,eye:[0,.55,.80],target:[0,.55,2.30],me:[0,.65,.80],mt:[0,.65,2.30]},
 {p:.94,eye:[4.1,2.1,3.2],target:[.4,1.05,.50],me:[4.1,2.7,3.2],mt:[.4,1.60,.5]},
 {p:1,eye:[0,2.3,8.0],target:[-.95,1.32,0],me:[0,2.85,9.3],mt:[.55,2.55,0]}
];
let endingFit=null;
function camera(p){return sampleCameraPath(endingFit?.keys??keys,p,mobile);}
function sceneIndex(p){return chapterIndex(p);}
function visualIndex(p){return visualScenes[sceneIndex(p)];}
function transformPoint(m,p){return[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
function project(p){const m=viewProjection,w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];if(w<=0)return null;return{x:((m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12])/w*.5+.5)*width,y:(.5-(m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13])/w*.5)*height};}
function boxCorners(min,max){const points=[];for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])points.push([x,y,z]);return points;}
function boundsAt(points,m){const projected=points.map(p=>{const w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];return{x:(dot([m[0],m[4],m[8]],p)+m[12])/w*.5*width+width*.5,y:height*.5-(dot([m[1],m[5],m[9]],p)+m[13])/w*.5*height};});const xs=projected.map(p=>p.x),ys=projected.map(p=>p.y);return{left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};}
function fitEnding(){
 const stage=storyStaging(1,mobile),panel=root.querySelector('#join-panel'),wasHidden=panel.hidden,visibility=panel.style.visibility;panel.style.visibility='hidden';panel.hidden=false;
 const copy=panel.getBoundingClientRect(),replay=panel.querySelector('.replay').getBoundingClientRect(),legal=panel.querySelector('.story-site-links').getBoundingClientRect();panel.hidden=wasHidden;panel.style.visibility=visibility;
 const stacked=mobile&&!matchMedia('(min-width:640px) and (max-height:519px)').matches,region=stacked?{left:width*.055,right:width*.945,top:replay.bottom+18,bottom:Math.min(height-30,legal.top-18)}:{left:Math.max(copy.right+28,width*.47),right:width-24,top:Math.min(110,height*.20),bottom:height-30};
 const s=stage.actorScale,r=stage.plinthRadius,actor=boxCorners([stage.actorX-1.23*s,0,-.58*s],[stage.actorX+1.23*s,2.66*s,.58*s]),phone=boxCorners([stage.phoneX-.67*stage.phoneFinalScale,stage.phoneFinalY-1.36*stage.phoneFinalScale,stage.phoneFinalZ-.025],[stage.phoneX+.67*stage.phoneFinalScale,stage.phoneFinalY+1.36*stage.phoneFinalScale,stage.phoneFinalZ+.025]),platform=Array.from({length:64},(_,i)=>{const a=Math.floor(i/2)*TAU/32;return[stage.plinthX+Math.cos(a)*r,i%2?0:-.12,Math.sin(a)*r];}),points=[...actor,...phone,...platform],fov=mobile?48:42,target=[stage.plinthX,1.1*s,0];let distance=3,bounds,eye;
 for(let i=0;i<100;i++){eye=[target[0],target[1]+distance*.16,distance];bounds=boundsAt(points,mul(projection(fov,width/height),lookAt(eye,target)));if(bounds.right-bounds.left<=(region.right-region.left)*.96&&bounds.bottom-bounds.top<=(region.bottom-region.top)*.96)break;distance*=1.06;}
 const fittedKeys=[...keys.slice(0,-1),{p:.96,eye,target,me:eye,mt:target},{p:1,eye,target,me:eye,mt:target}];endingFit={keys:fittedKeys,eye,target,region,shift:[-((region.left+region.right)-(bounds.left+bounds.right))/width,((region.top+region.bottom)-(bounds.top+bounds.bottom))/height],actor,phone,fov};
}
function model(pose,pos=[0,0,0],rot=0,alpha=1,parts='all',scale=1,dissolve=1){const actor=actors[pose];if(!actor||alpha<.004)return;const root=matrix(pos,[scale,scale,scale],[0,rot,0]);
 for(const node of actor){if(pose==='phone'&&node.name.startsWith('nails-'))continue;const limb=node.name.startsWith('arm-')||node.name.startsWith('nails-');if(parts==='body'&&limb||parts==='limbs'&&!limb||parts==='wave-hand'&&node.name!=='arm-right')continue;let parent=root;
  if((pose==='phone'||pose==='wave'&&progress<.5)&&limb){const side=node.name.endsWith('right')?1:-1,pivot=[side*.19,1.03,-.01],release=storyStaging(progress,mobile).release;parent=mul(root,mul(matrix(pivot),mul(matrix([0,0,0],[1,1,1],[release*.82,0,0]),matrix(pivot.map(v=>-v)))));}
  if(pose==='wave'&&(node.name==='arm-right'||node.name==='nails-right')&&!reduced){const angle=Math.sin(clock*.0042)*.065*(storyStaging(progress,mobile).endingGrip?1:1-storyStaging(progress,mobile).reach);parent=mul(parent,mul(matrix([.19,1.03,-.01]),mul(matrix([0,0,0],[1,1,1],[angle*.5,0,angle]),matrix([-.19,-1.03,.01]))));}
  const material=node.material,outline=node.name==='crown'?.019:node.name==='stem'?.012:0;
  draw(node.geometry,[0,0,0],[1,1,1],[0,0,0],material.color,null,{alpha,dissolve,gloss:(1-material.roughness)*.30,outline},mul(parent,node.matrix));
 }
}
// Move one opaque arm surface along its reach, instead of blending two hands.
const reachMeshes=[];let lastReach=-1;
function prepareReach(){for(const node of actors.wave){const g=node.geometry;if(!g.morph)continue;const start=g.cpu.positions,normal=g.cpu.normals;reachMeshes.push({g,start,normal,end:start.map((v,i)=>v+g.morph.position[i]),endNormal:normal.map((v,i)=>v+g.morph.normal[i]),positions:new Float32Array(start.length),normals:new Float32Array(normal.length)});}}
function updateReach(amount){if(Math.abs(amount-lastReach)<.00001)return;lastReach=amount;for(const item of reachMeshes){for(let i=0;i<item.start.length;i++){item.positions[i]=mix(item.start[i],item.end[i],amount);item.normals[i]=mix(item.normal[i],item.endNormal[i],amount);}gl.bindBuffer(gl.ARRAY_BUFFER,item.g.v);gl.bufferSubData(gl.ARRAY_BUFFER,0,item.positions);gl.bindBuffer(gl.ARRAY_BUFFER,item.g.n);gl.bufferSubData(gl.ARRAY_BUFFER,0,item.normals);}}
function speech(alpha){if(alpha<.003)return;if(!depthPass)gl.uniform1f(U.uShadowEnabled,0);const root=matrix(mobile?[0,3.20,.03]:[-2.25,2.14,.04],mobile?[.72,.72,.72]:[1,1,1],[0,0,0]);const white=[.99,.985,.96];
 draw(cloudBody,[0,0,0],[1,1,1],[0,0,0],white,null,{alpha,gloss:.04},root);
 for(const [x,y,r] of [[-1.29,.24,.42],[-.84,.60,.40],[-.22,.68,.45],[.49,.65,.43],[1.11,.43,.43],[1.42,.06,.36],[-1.39,-.17,.37]])ball([x,y,-.17],[r,r,.20],white,root,[0,0,0],alpha);
 ball([1.08,-.69,-.02],[.19,.29,.15],white,root,[0,0,-.65],alpha);ball([1.28,-.87,-.01],[.10,.18,.10],white,root,[0,0,-.65],alpha);
 draw(cloudText,[0,0,.146],[1,1,1],[0,0,0],white,textures.speech,{alpha,depthWrite:false},root);if(!depthPass)gl.uniform1f(U.uShadowEnabled,shadowActive?1:0);
}
function showcaseLight(enabled){if(depthPass)return;gl.uniform1f(U.uShowcase,enabled?1:0);gl.uniform1f(U.uShadowEnabled,enabled?0:shadowActive?1:0);}
function coin(pos,angle,scale=.10,alpha=1){showcaseLight(true);const root=matrix(pos,[scale,scale,scale],[.12*Math.sin(angle*.4),angle,.15]);draw(cylinder,[0,0,0],[.75,.085,.75],[PI/2,0,0],[.88,.63,.18],null,{alpha,gloss:.65},root);for(const side of [-1,1]){draw(cap,[0,0,side*.087],[.75,1,.75],[side*PI/2,0,0],[.96,.75,.30],null,{alpha,gloss:.5},root);draw(ring,[0,0,side*.092],[.92,.92,.25],[0,0,0],[1,.86,.48],null,{alpha,gloss:.55},root);draw(coinMark,[0,0,side*.102],[1,1,1],[0,side<0?PI:0,0],[1,1,1],textures.coin,{alpha,depthWrite:false},root);}showcaseLight(false);}
function bowl(pos){const root=matrix(pos,[1,1,1],[.15,0,.15]);ball([0,0,0],[.66,.27,.66],[.79,.67,.45],root);ball([0,.11,0],[.61,.16,.61],[.93,.87,.67],root);for(let i=0;i<13;i++){const a=i*2.4,r=.16+((i*7)%5)*.07;ball([Math.cos(a)*r,.23,Math.sin(a)*r],[.12,.06,.12],i%3===0?[.53,.65,.32]:i%3===1?[.76,.40,.20]:[.93,.79,.48],root);}draw(ring,[0,.13,0],[.91,.91,.91],[PI/2,0,0],[.87,.80,.64],null,{},root);}
function bottle(pos){const root=matrix(pos,[.64,.64,.64],[0,0,-.17]);draw(cylinder,[0,.5,0],[.24,.48,.24],[0,0,0],[.59,.70,.54],null,{gloss:.5},root);ball([0,.99,0],[.24,.13,.24],[.64,.74,.58],root);draw(cylinder,[0,1.12,0],[.13,.10,.13],[0,0,0],green,null,{},root);draw(cap,[0,1.23,0],[.13,1,.13],[0,0,0],sage,null,{},root);}
const cloudBody=panel(3.26,1.42,.52,.24),cloudText=panel(3.16,1.38,.25,.002,true),cameraBump=panel(.24,.43,.09,.035),coinMark=panel(.98,.98,.30,.001,true);
const screenNames=journeyScreens;
function rewardVisual(){
 const p=demo.coinsCollected?(reduced?1:clamp((clock-rewardTime)/rewardSpinDuration)):0,ease=1-Math.pow(1-p,4);
 return {phase:!demo.coinsCollected?'idle':p<1?'spinning':'won',angle:demo.coinsCollected?mix(wheelFrom,wheelTarget,ease):reduced?0:clock*.00036+smooth(.808,.858,progress)*TAU*.45,boost:demo.coinsCollected?ease*TAU*2:0,win:demo.coinsCollected?(reduced?1:clamp((clock-rewardTime-rewardSpinDuration)/1400)):0,count:demo.coinsCollected?(reduced?20:Math.round(20*(1-Math.pow(1-clamp((clock-rewardTime-rewardSpinDuration)/900),3)))):0};
}
const chapterEntered=new Map();let delightEvent={screen:'',time:-10000,mapFrom:0};
function delightVisual(index){
 const name=screenNames[index],entered=chapterEntered.get(index),inTour=index>=3&&index<stops.length-1;
 return {reveal:reduced||!inTour?1:entered===undefined?0:clamp((clock-entered)/1700),save:reduced?1:clamp((clock-delightEvent.time)/1400),hasEvent:delightEvent.screen===name,mapFrom:delightEvent.mapFrom};
}
function changeDay(name,value){
 const before=demo,start=name==='coins'&&!demo.coinsCollected?rewardVisual().angle:0,result=applyDemoAction(demo,name,value);demo=result.state;
 if((!before.planSaved&&demo.planSaved)||before.routineSaved!==demo.routineSaved||before.routineStarted!==demo.routineStarted||before.buddyFollowing!==demo.buddyFollowing||before.buddyShared!==demo.buddyShared||before.mapPlace!==demo.mapPlace||before.wellbeingDone!==demo.wellbeingDone){delightEvent={screen:name==='wellbeing'?'workout':name,time:clock,mapFrom:before.mapPlace};request(4200);}
 if((name==='context'&&before.context!==demo.context)||(name==='training-days'&&before.trainingDays!==demo.trainingDays)){if(name==='context')for(const i of [4,5,8,10,11])chapterEntered.delete(i);chapterEntered.set(sceneIndex(progress),clock);delightEvent={screen:'',time:-10000,mapFrom:demo.mapPlace};request(4200);}
 if(result.celebrate){actionTime=clock;actionScreen=name.replace('-scroll','');previousWater=before.water;
  if(actionScreen==='food')mealTime=clock;
  if(actionScreen==='workout')for(let i=before.workoutSets;i<demo.workoutSets;i++)setTimes[i]=clock+(i-before.workoutSets)*170;
  request(name==='coins'?4400:name==='water'?4000:2000);
  if(name==='coins'){rewardTime=clock;wheelFrom=start;wheelTarget=rewardLandingAngle(start);}
 }
 lastPaint='';return result.message;
}
function historyVisual(){return reduced?1:Math.max(chapterProgress(progress,tourTiming.historyStart,tourTiming.historyEnd)*.15,(historyWasVisible?clamp((clock-historyEnteredAt)/2400):0));}
function assistantVisual(){return reduced?1:Math.max(chapterProgress(progress,.39,.435),chapterEntered.has(4)?clamp((clock-chapterEntered.get(4))/1800):0);}
const blendSnapshots=new Map();let blendCanvas=null;
function snapshotPhase(name,index){const d=delightVisual(index);return (name==='history'?Math.floor(historyVisual()*100):name==='assistant'?Math.floor(assistantVisual()*100):'')+((['plan','assistant','home','map','buddies'].includes(name)||name==='workout'&&demo.context==='wellbeing')?':'+Math.floor(d.reveal*100)+':'+(d.hasEvent?Math.floor(d.save*100):''):'');}
function blendScreens(transition,textureWidth){
 const blendCanvases=[transition.from,transition.to].map(index=>{
  const name=screenNames[index],key=textureWidth+':'+nativeTextWeight()+JSON.stringify(demo)+snapshotPhase(name,index);
  let item=blendSnapshots.get(index);if(!item){const spare=[...blendSnapshots.keys()].find(key=>key!==transition.from&&key!==transition.to);if(spare!==undefined){item=blendSnapshots.get(spare);blendSnapshots.delete(spare);item.key='';}else item={key:'',canvas:document.createElement('canvas')};blendSnapshots.set(index,item);}
  if(item.key!==key){
   const reward=rewardVisual(),image=storyPaint.screen(name,demo,{textureWidth,captureText:true,textOpacity:1-nativeTextWeight(),entry:1,still:true,time:0,delight:delightVisual(index),waterDisplay:demo.water,planProgress:chapterProgress(progress,.31,.37),assistantProgress:assistantVisual(),mealProgress:1,mealSave:1,setAnimations:[1,1,1],historyProgress:historyVisual(),rewardPhase:reward.phase,wheelAngle:reward.angle,rewardCount:reward.count,rewardWin:1}),copy=item.canvas;
   if(copy.width!==image.width){copy.width=image.width;copy.height=image.height;}const ctx=copy.getContext('2d');ctx.clearRect(0,0,copy.width,copy.height);ctx.drawImage(image,0,0);copy.screenText=image.screenText;item.key=key;
  }
  return item.canvas;
 });
 if(!blendCanvas)blendCanvas=document.createElement('canvas');if(blendCanvas.width!==textureWidth){blendCanvas.width=textureWidth;blendCanvas.height=Math.round(textureWidth*1500/720);}
 const ctx=blendCanvas.getContext('2d');ctx.globalAlpha=1;ctx.drawImage(blendCanvases[0],0,0);ctx.globalAlpha=transition.blend;ctx.drawImage(blendCanvases[1],0,0);ctx.globalAlpha=1;blendCanvas.screenText=blendCanvases.flatMap((c,i)=>c.screenText.map(run=>({...run,opacity:run.opacity*(i?transition.blend:1-transition.blend)})));return blendCanvas;
}
function screenTexture(name){
 const chapter=sceneIndex(progress),identity=name+chapter;if(lastScreen!==identity){lastScreen=identity;screenEnteredAt=clock;if(!chapterEntered.has(chapter))chapterEntered.set(chapter,clock);}
 const transition=reduced?null:appTransition(progress),textureWidth=mobile?768:1024,animated=!reduced&&chapter>=3&&chapter<stops.length-1,key=identity+textureWidth+':'+Math.round(nativeTextWeight()*10000)+JSON.stringify(demo)+(transition?transition.from+':'+Math.round(transition.blend*1000)+':'+snapshotPhase(screenNames[transition.from],transition.from)+':'+snapshotPhase(screenNames[transition.to],transition.to):animated?Math.floor((name==='coins'?clock:textureClock)/((['history','plan','assistant','home','map','buddies'].includes(name)||name==='workout'&&demo.context==='wellbeing')?33:name==='coins'?42:66)):'still')+(name==='water'&&!animated?Math.round(waterDisplay):'');
 if(lastPaint!==key){lastPaint=key;const r=rewardVisual(),image=transition?blendScreens(transition,textureWidth):storyPaint.screen(name,demo,{textureWidth,captureText:true,textOpacity:1-nativeTextWeight(),time:reduced?0:clock/1000,entry:1,delight:delightVisual(chapter),action:reduced?1:clamp((clock-actionTime)/(name==='water'?2200:1000)),hasAction:actionScreen===name,previousWater,waterDisplay,waterScroll:waterScrollProgress(reduced?rawWaterProgress:progress),planProgress:chapterProgress(progress,.31,.37),assistantProgress:assistantVisual(),historyProgress:historyVisual(),mealProgress:chapterProgress(reduced?rawWaterProgress:progress,tourTiming.mealStart,tourTiming.mealEnd),mealSave:reduced?1:clamp((clock-mealTime)/1000),workoutProgress:chapterProgress(reduced?rawWaterProgress:progress,tourTiming.workoutStart,tourTiming.workoutEnd),setAnimations:setTimes.map(time=>reduced?1:clamp((clock-time)/700)),rewardPhase:r.phase,wheelAngle:r.angle,rewardCount:r.count,rewardWin:r.win,still:reduced});
  screenTextRuns=image.screenText||[];
  if(!phoneTexture){phoneTexture=texture(image);phoneTextureWidth=image.width;}else{gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,phoneTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);if(phoneTextureWidth!==image.width){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);phoneTextureWidth=image.width;}else gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,image);}
 }return phoneTexture;
}
function currentPhone(){
 const stage=storyStaging(progress,mobile),reveal=smooth(.040,.11,progress),grow=smooth(.29,.35,progress),end=stage.ending,mobileFit=grow*(1-smooth(.87,.91,progress)),tour=smooth(.31,.37,progress)*(1-smooth(.87,.91,progress)),bob=reduced?0:Math.sin(clock*.0015)*.004*tour;
 return{position:[stage.phoneX,mix(mix(.74,.55,grow),stage.phoneFinalY,end)+bob,mix(mix(.72,2.30,stage.departure),stage.phoneFinalZ,end)],scale:mix(mix(.155,.31,grow)*reveal,stage.phoneFinalScale,end)*(mobile?mix(1,.92*(landscapePhone?1:Math.min(1,height/780)),mobileFit):1),rotation:[0,mix(PI,0,end),reduced?0:Math.sin(clock*.0009)*.006*tour]};
}
const accents=[[.64,.83,.32],[.64,.83,.32],[.64,.83,.32],[.64,.83,.32],[.18,.69,.88],[.96,.49,.30],[.65,.45,.88],[.45,.73,.35],[.96,.71,.20],[.64,.83,.32]];
// A visible turn, shared by desktop and touch. Scroll contributes continuously;
// time keeps the props alive while reading a settled chapter.
function propTurn(){return reduced?0:clock*.00075+progress*TAU*2;}
function newAccents(chapter,strength){
 if(![3,4,5,10,11].includes(chapter)&&!(chapter===8&&demo.context==='wellbeing'))return;
 const d=delightVisual(chapter),reveal=d.reveal,alpha=strength*smooth(0,.5,reveal),float=reduced?0:Math.sin(clock*.00155)*.024,sway=reduced?0:Math.sin(clock*.0011)*.008,side=(mobile?-.31:-.47)+sway,turn=propTurn();
 if(alpha<.003)return;
 if(chapter===3){
  const size=mobile?.050:.069,root=matrix([side,.56+float,2.38],[size,size,size],[.05+Math.sin(turn)*.20,Math.sin(turn*.9)*.55,-.10+Math.sin(turn*.8)*.22]);
  draw(geo.card,[0,0,0],[1,1,.45],[0,0,0],ivory,null,{alpha,gloss:.18},root);draw(geo.bar,[0,1.37,-.04],[7,.13,.18],[0,0,0],green,null,{alpha},root);
  for(let i=0;i<7;i++){const on=demo.context==='wellbeing'||[0,2,4,5].slice(0,demo.trainingDays).includes(i),rise=smooth(i*.07,.5+i*.07,reveal),breath=reduced?1:1+Math.sin(clock*.002+i*.7)*.09;ball([-.93+(i%4)*.62,.45-Math.floor(i/4)*.8+(1-rise)*.35,-.10],[.17*rise*breath,.17*rise*breath,.08],on?sage:[.76,.79,.65],root,[0,0,0],alpha);}
 }
 if(chapter===4){
  const root=matrix([side,.59+float,2.38],[1,1,1],[Math.sin(turn*.7)*.22,Math.sin(turn)*.35,turn]),color=[.68,.53,.88],pulse=reduced?1:1+Math.sin(clock*.002)*.09;
  draw(geo.bar,[0,0,0],[.08*pulse,.18*pulse,.05],[0,0,.55],color,null,{alpha,gloss:.3},root);draw(geo.bar,[0,0,0],[.08*pulse,.18*pulse,.05],[0,0,.55+PI/2],color,null,{alpha,gloss:.3},root);
  for(let i=0;i<3;i++){const a=i*TAU/3+(reduced?0:clock*.00075);ball([Math.cos(a)*.09,Math.sin(a)*.09,-.02],[.011,.011,.011],i%2?gold:color,root,[0,0,0],alpha*smooth(i*.12,.5+i*.12,reveal));}
 }
 if(chapter===5){
  const colors=[[.50,.78,.89],[.96,.65,.45],[.70,.60,.87]],done=[demo.waterLogs>0,demo.foodSaved,demo.context==='wellbeing'?demo.wellbeingDone:demo.workoutSaved],size=mobile?.034:.046;
  for(let i=0;i<3;i++){const grow=smooth(i*.15,.55+i*.15,reveal),y=.73-i*.14+(1-grow)*.045,root=matrix([side+(reduced?0:Math.sin(clock*.0014+i)*.006),y+float*(.65+i*.12)+(reduced?0:Math.sin(clock*.0018+i)*.008),2.39],[grow,grow,grow],[Math.sin(turn)*.18,reduced?0:Math.sin(turn+i*.4)*.55,reduced?0:Math.sin(turn+i*.4)*.22]);
   draw(cap,[0,0,0],[size,1,size],[-PI/2,0,0],done[i]?colors[i]:[.74,.79,.65],null,{alpha,gloss:.2},root);
   if(done[i]){draw(geo.bar,[-size*.23,0,-.007],[size*.65,size*.45,.025],[0,0,-.75],green,null,{alpha},root);draw(geo.bar,[size*.13,size*.12,-.007],[size*.65,size*.8,.025],[0,0,.65],green,null,{alpha},root);}
  }
 }
 if(chapter===8){
  const root=matrix([side,.60+float,2.38],[1,1,1],[Math.sin(turn)*.22,Math.sin(turn)*.45,Math.sin(turn*.8)*.24]);
  draw(droplet,[0,0,0],[.06,.09,.032],[0,0,-.55],sage,null,{alpha,gloss:.25},root);draw(geo.bar,[-.022,-.06,-.02],[.027,.08,.03],[0,0,-.55],green,null,{alpha},root);
  for(let i=0;i<2;i++)ball([side+.07,.59+i*.055+float,2.38],[.008,.008,.008],sage,null,[0,0,0],alpha);
 }
 if(chapter===10){
  const root=matrix([side,.60+float,2.38],[1,1,1],[Math.sin(turn*.8)*.18,Math.sin(turn)*.50,Math.sin(turn*.9)*.20]);
  draw(geo.bar,[0,0,.01],[.35,.012,.03],[0,0,PI/2],sage,null,{alpha},root);
  for(let i=0;i<2;i++){const px=i?.043:-.043,py=(i?.024:-.024)+(reduced?0:Math.sin(clock*.0018+i)*.006),r=mobile?.036:.045;
   draw(cap,[px,py,0],[r,1,r],[-PI/2,0,0],i?[.88,.65,.77]:[.62,.77,.43],null,{alpha,gloss:.25},root);ball([px,py+.008,-.008],[r*.28,r*.28,.008],ivory,root,[0,0,0],alpha);ball([px,py-.015,-.007],[r*.48,r*.23,.006],ivory,root,[0,0,0],alpha);
  }
 }
 if(chapter===11){
  const pop=d.hasEvent?Math.sin(d.save*PI)*.10:0,root=matrix([side,.62+float+pop*.12,2.38],[1,1,1],[Math.sin(turn*.8)*.22,Math.sin(turn)*.50,Math.sin(turn*.9)*.25]);
  draw(droplet,[0,0,0],[.055,.084,.045],[0,0,PI],sage,null,{alpha,gloss:.35},root);ball([0,.03,-.042],[.022,.022,.010],ivory,root,[0,0,0],alpha);
  for(let i=0;i<3;i++)ball([side-.065+i*.025,.40+i*.035+(reduced?0:Math.sin(clock*.002-i*.7)*.012),2.37],[.007,.007,.007],sage,null,[0,0,0],alpha*smooth(i*.15,.6+i*.15,reveal));
 }
}
function appAccents(index,weight=1,chapter=sceneIndex(progress)){const strength=weight*smooth(.31,.37,progress)*(1-smooth(.87,.91,progress));if(strength<.005)return;const color=accents[index],drift=reduced?0:Math.sin(clock*.0015)*.025,turn=propTurn();
 showcaseLight(true);
 newAccents(chapter,strength);
 draw(appRing,[0,.55,2.68],[.66,.80,.16],[0,0,reduced?0:clock*.000035],lerp(color,cream,.60),null,{alpha:strength*.45,depthWrite:false,unlit:true});
 if(index===4){const float=reduced?0:Math.sin(clock*.0007)*.010,breath=reduced?1:1+Math.sin(clock*.00065)*.025;draw(droplet,[mobile?-.30:-.43,.51+float,2.33],[(mobile?.045:.065)*breath,.085*breath,mobile?.045:.065],[Math.sin(turn)*.30,Math.sin(turn*.8)*.45,-.17+Math.sin(turn)*.32],color,null,{alpha:strength,gloss:.38});for(let i=0;i<3;i++)ball([(mobile?-.30:-.48)+i*.025,.70+i*.045+float,2.43],[.007,.007,.007],lerp(color,cream,.35),null,[0,0,0],strength);}
 if(index===5){const gather=chapterProgress(reduced?rawWaterProgress:progress,tourTiming.mealStart,tourTiming.mealEnd),size=mobile?.11:.15,root=matrix([mobile?-.31:-.46,.5+drift,2.35],[size,size,size],[.12,reduced?0:Math.sin(clock*.0005)*.12,reduced?0:Math.sin(clock*.0006)*.10]);ball([0,0,.02],[.98,.98,.12],[.95,.91,.80],root,[0,0,0],strength);draw(cap,[0,0,-.105],[.81,1,.81],[-PI/2,0,0],[.99,.96,.87],null,{alpha:strength},root);for(let i=0;i<7;i++){const radius=mix(1.12,.45,gather),a=i*2.4+mix(.4,0,gather),position=[Math.sin(a)*radius,Math.cos(a)*radius,-.16];if(demo.meal==='paneer'&&i%2===0)draw(geo.bar,position,[.65,.20,.65],[.12,0,a],[.92,.78,.47],null,{alpha:strength},root);else ball(position,[i%2?.15:.22,.17,.09],i%3===0?[.85,.57,.29]:i%3===1?green:[.96,.86,.59],root,[0,0,a],strength);}}
 if(index===6&&demo.context!=='wellbeing'){const lift=reduced?0:Math.sin(clock*.0012)*.025+Math.sin(chapterProgress(progress,tourTiming.workoutStart,tourTiming.workoutEnd)*PI*3)*.035;dumbbell([mobile?-.31:-.47,.55+lift,2.38],mobile?.11:.16,[Math.sin(turn)*.20,turn,-.55+Math.sin(turn*.8)*.22+lift]);}
 if(index===7){const growth=historyVisual(),root=matrix([mobile?-.295:-.455,.39+drift,2.4],[1,1,1],[Math.sin(turn*.8)*.14,Math.sin(turn)*.50,Math.sin(turn*.9)*.16]);for(let i=0;i<3;i++){const rise=reduced?1:smooth((2-i)*.13,.65+(2-i)*.13,growth),h=(.26-i*.075)*rise;draw(geo.bar,[(i-1)*.065,h*.5,0],[.14,h,.14],[0,0,0],i===0?green:color,null,{alpha:strength},root);}}
 const age=index===8?(clock-rewardTime-rewardSpinDuration)/1600:(clock-actionTime)/1500;if(!reduced&&age>=0&&age<1&&index>=5&&(index===8||actionScreen===chapterAt(progress))&&(index!==6||demo.workoutSaved))for(let i=0;i<(index===8?24:10);i++){const a=i*2.399,spread=.26+age*.30;draw(geo.bar,[Math.cos(a)*spread,.55+Math.sin(a)*spread*.8+age*.10,2.23],[.025,.012,.015],[0,age*4,a+age],i%2?color:gold,null,{alpha:Math.sin(age*PI)*strength});}
 showcaseLight(false);
}
function drawActor(stage){const actorX=stage.actorX;if(stage.actorVisible&&stage.actorScale>.001){model('wave',[actorX,0,0],0,1,'body',stage.actorScale,stage.actorOpacity);if(stage.endingGrip){model('grip',[actorX,0,0],0,1,'limbs',stage.actorScale,stage.actorOpacity);model('wave',[actorX,0,0],0,1,'wave-hand',stage.actorScale,stage.actorOpacity);}else model('wave',[actorX,0,0],0,1,'limbs',stage.actorScale,stage.actorOpacity);}}
function drawWorld(){
 const index=visualIndex(progress),stage=storyStaging(progress,mobile),end=stage.ending,actorX=stage.actorX;
 updateReach(stage.reach);
 if(depthPass){drawActor(stage);phonePose=currentPhone();if(phonePose.scale>.002)draw(geo.phone,phonePose.position,[phonePose.scale,phonePose.scale,phonePose.scale],phonePose.rotation,green);return;}
 if(progress<.31||progress>.89){draw(geo.flat,[0,-.12,0],[60,60,1],[-PI/2,0,0],cream,null,{unlit:true});plinth([stage.plinthX,-.065,0],mix(1.7,stage.plinthRadius,end),.055,[.91,.91,.84]);}
 updateReach(stage.reach);
 if(mobile&&stage.actorVisible){for(const [size,alpha] of [[.64,.035],[.48,.07]])draw(cap,[stage.actorX,-.008,0],[size*stage.actorScale,1,size*.55*stage.actorScale],[0,0,0],[.30,.34,.24],null,{alpha:alpha*stage.actorOpacity,unlit:true,depthWrite:false});}
 drawActor(stage);
 speech(1-smooth(.015,.07,progress));
 const transition=reduced?null:appTransition(progress);if(transition){appAccents(visualScenes[transition.from],1-transition.blend,transition.from);appAccents(visualScenes[transition.to],transition.blend,transition.to);}else appAccents(index);
 phonePose=currentPhone();if(phonePose.scale>.002)phone(phonePose.position,phonePose.scale,phonePose.rotation,screenTexture(screenNames[sceneIndex(progress)]));
 if(progress>.845&&progress<.93){const intensity=smooth(.845,.865,progress)*(1-smooth(.89,.925,progress)),r=rewardVisual(),bloom=reduced?0:Math.sin(r.win*PI)*(mobile?.015:.05);for(let i=0;i<5;i++){const a=i*TAU/5+clock*.00028+r.boost*.12,rx=(mobile?.32:.46)+bloom,ry=(mobile?.40:.46)+bloom;coin([Math.cos(a)*rx,.55+Math.sin(a)*ry,2.23-(i%2)*.12],clock*.0012+i*.9+r.boost,mobile?.050+(i%2)*.008:.065+(i%2)*.009,intensity);}}
}
function stageSnapshot(){return {...storyStaging(progress,mobile),endingLayout:endingFit?{region:endingFit.region,actor:boundsAt(endingFit.actor,viewProjection),phone:boundsAt(endingFit.phone,viewProjection)}:null};}
function render(){if(!ready)return;
 const historyTransition=appTransition(progress),historyInView=chapterAt(progress)==='history'||(historyTransition&&[historyTransition.from,historyTransition.to].some(i=>screenNames[i]==='history'));
 if(!historyInView)historyWasVisible=false;
 if(chapterAt(progress)==='history'&&!historyTransition&&!historyWasVisible){historyEnteredAt=clock;historyWasVisible=true;}
 shadowActive=shadowReady&&!mobile&&storyStaging(progress,mobile).actorVisible;cameraState=camera(progress);const origin=[0,1.0,.5],lightVP=mul(orthographic(5.5,.1,30),lookAt([-4,8,6],origin));
 if(shadowActive&&(Math.abs(progress-lastShadowProgress)>.002||clock-lastShadowClock>200)){lastShadowClock=clock;lastShadowProgress=progress;depthPass=true;gl.useProgram(shadowProgram);gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFramebuffer);gl.viewport(0,0,SHADOW_SIZE,SHADOW_SIZE);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(shadowU.light,false,lightVP);drawWorld();gl.bindFramebuffer(gl.FRAMEBUFFER,null);depthPass=false;}
 gl.useProgram(program);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.984,.973,.945,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const view=lookAt(cameraState.eye,cameraState.target),fov=mobile?mix(48,58,smooth(.24,.35,progress))-(smooth(.90,1,progress)*10):42,projectionMatrix=projection(mix(fov,endingFit?.fov??fov,smooth(.89,.96,progress)),width/height);if(endingFit){projectionMatrix[8]=endingFit.shift[0]*smooth(.89,.96,progress);projectionMatrix[9]=endingFit.shift[1]*smooth(.89,.96,progress);}viewProjection=mul(projectionMatrix,view);gl.uniformMatrix4fv(U.uView,false,view);gl.uniformMatrix4fv(U.uProjection,false,projectionMatrix);gl.uniform3fv(U.uCamera,cameraState.eye);gl.uniformMatrix4fv(U.uLightVP,false,lightVP);gl.uniform1f(U.uOutline,0);gl.uniform1f(U.uShadowEnabled,shadowActive?1:0);
 if(shadowReady){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadowDepth);gl.uniform1i(U.uShadowMap,1);gl.activeTexture(gl.TEXTURE0);}drawWorld();
 const textModel=matrix(phonePose.position,[phonePose.scale,phonePose.scale,phonePose.scale],phonePose.rotation),textCorners=[[-.61,1.29,.086],[.61,1.29,.086],[-.61,-1.29,.086]].map(p=>project(transformPoint(textModel,p)));screenText.update(screenTextRuns,textCorners,width,height,nativeTextWeight());
 const index=sceneIndex(progress);let actionRect=null;if(index>=3&&index<stops.length-1&&phonePose.scale>.01){const model=matrix(phonePose.position,[phonePose.scale,phonePose.scale,phonePose.scale],phonePose.rotation),coords=[[-.53,-.86,.095],[.53,-.86,.095],[.53,-1.00,.095],[-.53,-1.00,.095]].map(p=>project(transformPoint(model,p)));if(coords.every(Boolean)){const xs=coords.map(p=>p.x),ys=coords.map(p=>p.y);actionRect={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}}
 const navRects=[];
 if(progress>=.35&&progress<=.89){const tabs=demo.context==='wellbeing'?['Home','Map','Buddies','You']:['Home','Train','Map','Buddies','You'],m=matrix(phonePose.position,[phonePose.scale,phonePose.scale,phonePose.scale],phonePose.rotation);tabs.forEach((tab,i)=>{const x0=-.61+i*1.22/tabs.length,x1=-.61+(i+1)*1.22/tabs.length,pts=[[x0,-1.075,.086],[x1,-1.075,.086],[x0,-1.29,.086],[x1,-1.29,.086]].map(p=>project(transformPoint(m,p)));if(pts.every(Boolean)){const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);navRects.push({tab,x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)});}});}
 const center=phonePose.scale>.001?project(phonePose.position):null,toCamera=sub(cameraState.eye,phonePose.position),normal=[Math.sin(phonePose.rotation[1]),0,Math.cos(phonePose.rotation[1])],reward=rewardVisual();lastState={ready:true,scene:index,progress,camera:cameraState,phone:{...phonePose,center,bounds:phonePose.scale>.001?boundsAt(boxCorners([-.67,-1.36,-.10],[.67,1.36,.10]),mul(viewProjection,matrix(phonePose.position,[phonePose.scale,phonePose.scale,phonePose.scale],phonePose.rotation))):null,screenFacingCamera:dot(normal,toCamera)>0},staging:stageSnapshot(),renderBudget:{mobile,shadow:shadowActive,pixels:canvas.width*canvas.height,nativeText:nativeTextWeight(),transitionSurfaces:blendSnapshots.size,textureWidth:phoneTextureWidth,pixelRatio:canvas.width/width},character:{pose:index===0?'wave':index===stops.length-1?'right-hand-phone':'front-phone',frontFacing:index<=1,seenFromBack:cameraState.eye[2]<0},screen:screenNames[index],demo:{...demo},microMotion:{active:!reduced,phase:reduced?0:clock/1000,float:reduced?0:Math.sin(clock*.00155)*.024},delight:delightVisual(index),waterDisplay,waterScrollProgress:waterScrollProgress(reduced?rawWaterProgress:progress),planProgress:chapterProgress(progress,.31,.37),assistantProgress:assistantVisual(),historyProgress:historyVisual(),mealProgress:chapterProgress(reduced?rawWaterProgress:progress,tourTiming.mealStart,tourTiming.mealEnd),workoutProgress:chapterProgress(reduced?rawWaterProgress:progress,tourTiming.workoutStart,tourTiming.workoutEnd),navRects,rewardPhase:reward.phase,wheelAngle:reward.angle,coinRotation:clock*.0012+reward.boost,actionRect,mobile};root.dispatchEvent(new CustomEvent('gobhi:frame',{detail:lastState,bubbles:true}));
}
function advanceWater(elapsed){
 const inWater=chapterAt(progress)==='water',forward=scrollDirection>0;
 if(inWater&&forward&&Math.abs(targetProgress-progress)<.025)waterDwell+=Math.min(elapsed,100);
 if(waterDwell>=250)waterArmed=true;
 const passed=reduced?rawWaterProgress>=tourTiming.waterSave&&chapterAt(rawWaterProgress)==='water':progress>=tourTiming.waterSave;
 if(inWater&&forward&&passed&&(waterArmed||reduced)&&demo.waterLogs===0){const before=demo,result=applyDemoAction(demo,'water-scroll');demo=result.state;previousWater=before.water;actionTime=clock;actionScreen='water';lastPaint='';request(4000);}
 const guide=waterScrollProgress(reduced?rawWaterProgress:progress),target=demo.water+(inWater&&demo.waterLogs===0?demo.waterAmount*guide:0);
 waterDisplay=reduced?target:mix(waterDisplay,target,1-Math.exp(-Math.min(elapsed,250)/550));
 if(Math.abs(waterDisplay-target)<.25)waterDisplay=target;
}
function advanceShowcase(elapsed){
 const name=chapterAt(progress),p=reduced?rawWaterProgress:progress,forward=scrollDirection>0,slot=['food','workout','coins'].indexOf(name);
 if(slot>=0&&forward){chapterDwell[slot]+=Math.min(elapsed,100);if(reduced||chapterDwell[slot]>=250){
  if(name==='food'&&p>=tourTiming.mealEnd&&!demo.foodSaved)changeDay('food-scroll');
  if(name==='workout'&&demo.context!=='wellbeing'&&scrollWorkoutSets(p)>demo.workoutSets)changeDay('workout-scroll',scrollWorkoutSets(p));
  if(name==='coins'&&p>=tourTiming.coinSave&&!demo.coinsCollected)changeDay('coins');
 }}
}
function tick(time){
 frame=0;if(!ready||!visible)return;inTick=true;
 const moving=Math.abs(progress-targetProgress)>.00003,elapsed=lastTime?time-lastTime:16,ambient=desktopAmbient();
 // Settled desktop props use 20fps and reuse the phone texture. Native scroll
 // still renders on the next frame; mobile keeps its finite activity budget.
 if(!moving&&!reduced&&lastTime&&(time<activeUntil||ambient)&&elapsed<(mobile?42:time<activeUntil?33:50)){frame=requestAnimationFrame(tick);inTick=false;return;}
 lastTime=time;if(!reduced)clock+=elapsed;
 if(moving||time<activeUntil||mobile)textureClock=clock;
 // Native scroll is the timeline, including when decorative motion is paused.
 progress=targetProgress;
 if(Math.abs(progress-targetProgress)<.00003)progress=targetProgress;
 advanceWater(elapsed);advanceShowcase(elapsed);render();
 if(Math.abs(progress-targetProgress)>.00003||(!reduced&&(time<activeUntil||desktopAmbient())))frame=requestAnimationFrame(tick);
 else{root.classList.add('story-idle');lastTime=0;}
 inTick=false;
}
function request(duration=0){if(duration){activeUntil=Math.max(activeUntil,performance.now()+duration);root.classList.remove('story-idle');}if(!inTick&&!frame&&visible&&ready)frame=requestAnimationFrame(tick);}
function desktopAmbient(){return !mobile&&!reduced&&progress>=.335&&progress<=.89;}

function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;mobile=matchMedia('(max-width:1023px)').matches;landscapePhone=mobile&&matchMedia('(min-width:640px) and (max-height:519px)').matches;const ratio=Math.min(devicePixelRatio||1,mobile?2.5:2,Math.max(1,Math.sqrt((mobile?3000000:6000000)/Math.max(1,width*height)))),w=Math.round(width*ratio),h=Math.round(height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;lastShadowProgress=-1;}gl.viewport(0,0,canvas.width,canvas.height);fitEnding();render();request(1800);}
const api={setProgress(value,still=false){const changed=Math.abs(value-rawWaterProgress)>.000001||still!==reduced;if(changed)request(chapterAt(value)==='water'?4000:['plan','assistant','home','map','buddies'].includes(chapterAt(value))||chapterAt(value)==='workout'&&demo.context==='wellbeing'?4200:chapterAt(value)==='history'?3200:2000);if(Math.abs(value-rawWaterProgress)>.000001)scrollDirection=value>rawWaterProgress?1:-1;rawWaterProgress=clamp(value);reduced=still;targetProgress=clamp(value);if(still){progress=targetProgress;advanceWater(0);advanceShowcase(0);}request();},get state(){return lastState||{ready:false};},act(name,value){request(name==='coins'?4400:name==='water'?4000:name==='history'?3200:1800);const message=changeDay(name,value);if(reduced)advanceWater(0);if(name==='history'){screenEnteredAt=clock;historyEnteredAt=clock;}render();request();return message;},resetDemo(){demo=createDemoDay();chapterEntered.clear();delightEvent={screen:'',time:-10000,mapFrom:0};lastScreen='';historyEnteredAt=clock;historyWasVisible=false;waterDisplay=1000;waterDwell=0;waterArmed=false;chapterDwell=[0,0,0];mealTime=-10000;setTimes=[-10000,-10000,-10000];wheelFrom=0;wheelTarget=0;rewardTime=-10000;previousWater=1000;actionTime=-10000;actionScreen='';lastPaint='';render();request();}};
let resizeTimer;const observer=new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,100);});observer.observe(canvas);listen(document,'visibilitychange',()=>{visible=!document.hidden;lastTime=0;if(!visible){cancelAnimationFrame(frame);frame=0;root.classList.add('story-idle');}else request(1200);});listen(canvas,'webglcontextlost',e=>{e.preventDefault();ready=false;cancelAnimationFrame(frame);fail();});
async function loadActor(file){
 const response=await fetch(new URL(file,assetBase),{signal});if(!response.ok)throw Error('Could not load '+file);const buffer=await response.arrayBuffer();signal.throwIfAborted();const header=new DataView(buffer),jsonLength=header.getUint32(12,true),data=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,jsonLength))),binStart=20+jsonLength+8,cache=new Map();
 function array(index){const a=data.accessors[index],view=data.bufferViews[a.bufferView],offset=binStart+(view.byteOffset||0)+(a.byteOffset||0),size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];if(a.componentType===5126)return new Float32Array(buffer,offset,a.count*size);if(a.componentType===5123)return new Uint16Array(buffer,offset,a.count*size);throw Error('Unsupported model accessor');}
 return data.nodes.map(node=>{const primitive=data.meshes[node.mesh].primitives[0];let geometry=cache.get(node.mesh);if(!geometry){const v=array(primitive.attributes.POSITION),n=array(primitive.attributes.NORMAL),indices=array(primitive.indices);geometry=mesh(v,n,new Float32Array(v.length/3*2),indices);if(primitive.targets?.[0])geometry.morph={position:array(primitive.targets[0].POSITION),normal:array(primitive.targets[0].NORMAL)};cache.set(node.mesh,geometry);}const m=data.materials[primitive.material].pbrMetallicRoughness;return{name:node.name,geometry,matrix:new Float32Array(node.matrix||identity()),material:{color:m.baseColorFactor.slice(0,3),roughness:m.roughnessFactor??.7}};});
}
async function init(){try{
 loadTimeout=setTimeout(()=>lifecycle.abort(),45000);
 await Promise.all([document.fonts.load('400 24px GobhiWork'),document.fonts.load('600 24px GobhiWork'),document.fonts.load('800 24px GobhiWork')]);
 const loaded=await Promise.all([loadActor('runtime/gobhi-wave.glb'),loadActor('runtime/gobhi-hold.glb'),loadActor('runtime/gobhi-display-grip.glb')]);if(disposed)return;actors.wave=loaded[0];actors.phone=loaded[1];actors.grip=loaded[2];prepareReach();textures.speech=texture(storyPaint.speech());textures.back=texture(storyPaint.back());textures.coin=texture(storyPaint.coinMark());textures.home=screenTexture('home');ready=true;resize();request();root.dispatchEvent(new Event('gobhi:ready'));
 }catch{fail();}finally{clearTimeout(loadTimeout);}}
init();
return {setProgress:api.setProgress,act:api.act,resetDemo:api.resetDemo,get state(){return api.state;},dispose(){if(disposed)return;disposed=true;screenText.dispose();blendSnapshots.clear();chapterEntered.clear();ready=false;visible=false;cancelAnimationFrame(frame);clearTimeout(loadTimeout);lifecycle.abort();observer.disconnect();clearTimeout(resizeTimer);for(const buffer of buffers)gl.deleteBuffer(buffer);for(const tex of allTextures)gl.deleteTexture(tex);for(const s of shaders)gl.deleteShader(s);gl.deleteProgram(program);if(shadowProgram)gl.deleteProgram(shadowProgram);if(shadowFramebuffer)gl.deleteFramebuffer(shadowFramebuffer);}};
}
