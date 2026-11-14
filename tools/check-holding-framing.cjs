/* Check the actual renderer's late handoff without time-dependent idle motion. */
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const assert=require('node:assert/strict');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loadTs(file){const target=path.join(root,file),m=new Module(target,module);m.filename=target;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(target,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,target);return m.exports;}
const {sampleCameraPath}=loadTs('lib/gobhi-story/motion.ts');
const {storyStaging,smooth}=loadTs('lib/gobhi-story/staging.ts');
const source=fs.readFileSync(path.join(root,'lib/gobhi-story/renderer.js'),'utf8');
const keys=new Function('return '+source.match(/const keys=(\[[\s\S]*?\n\]);/)[1])();
const phone=new Function('storyStaging','smooth','mix','progress','mobile','height','landscapePhone','reduced','clock','const PI=Math.PI;'+source.match(/function currentPhone\(\)\{([\s\S]*?)\n\}/)[1]);
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]),norm=a=>{const n=Math.hypot(...a);return a.map(v=>v/n);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function framedHeight(p,mobile,height){
 const pose=phone(storyStaging,smooth,(a,b,t)=>a+(b-a)*t,p,mobile,height,false,false,0),camera=sampleCameraPath(keys,p,mobile),z=norm(sub(camera.eye,camera.target)),x=norm(cross([0,1,0],z)),y=cross(z,x),fov=mobile?48+10*smooth(.24,.35,p):42,f=1/Math.tan(fov*Math.PI/360),ys=[];
 const [rx,ry,rz]=pose.rotation,cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
 for(const a of [-.67,.67])for(const b of [-1.36,1.36])for(const c of [-.10,.10]){const px=a,py=b*cx-c*sx,pz=b*sx+c*cx,qx=px*cy+pz*sy,qz=-px*sy+pz*cy,local=[qx*cz-py*sz,qx*sz+py*cz,qz],point=pose.position.map((v,i)=>v+local[i]*pose.scale),relative=sub(point,camera.eye);ys.push(height*(.5-.5*f*dot(y,relative)/(-dot(z,relative))));}
 return {height:Math.max(...ys)-Math.min(...ys),scale:pose.scale};
}
const report=[];
for(const [width,height,mobile] of [[1440,900,false],[390,844,true],[768,1024,true]]){
 let previous=framedHeight(.31,mobile,height),peak=0;
 for(let step=1;step<=400;step++){const p=.31+step*.0001,current=framedHeight(p,mobile,height),growth=current.height-previous.height;assert.ok(growth>=-1e-7,`${width}x${height}: phone shrinks at ${p}: ${growth}px`);peak=Math.max(peak,growth/.0001*.01);previous=current;}
 const final=framedHeight(.35,mobile,height),settled=framedHeight(.38,mobile,height);assert.ok(Math.abs(final.height-settled.height)<1e-6,'No further mobile fit adjustment after the handoff');
 report.push({width,height,finalHeight:+final.height.toFixed(3),peakPixelsPerOnePercentScroll:+peak.toFixed(3)});
}
console.log(JSON.stringify({passed:'Projected screen height grows monotonically and settles by .35',report},null,2));
