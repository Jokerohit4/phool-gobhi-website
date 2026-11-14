/* The inspector and GLB exporter use the standalone character study geometry. */
(() => {
'use strict';
const $=s=>document.querySelector(s),canvas=$('canvas');
const labels={logo:'THE LOGO, ALIVE.',phone:'HIS EVERYDAY, IN HIS HANDS.',wave:'VERY MUCH IN YOUR CORNER.'};
function ready(){
 $('.loading').classList.add('done');
 const stats=window.pgGobhi.stats;
 $('#render-note').textContent=stats.floretBuds+' FLORET BUDS / RECESSED STEM GROOVES';
}
addEventListener('journeyready',ready);
if(window.pgJourney?.state.ready)ready();
let down=false,lastX=0,lastY=0;
canvas.addEventListener('pointerdown',event=>{down=true;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointermove',event=>{if(!down)return;const view=window.pgGobhi.view;window.pgGobhi.orbit(view.yaw+(event.clientX-lastX)*.008,view.pitch+(event.clientY-lastY)*.005);lastX=event.clientX;lastY=event.clientY;});
canvas.addEventListener('pointerup',()=>{down=false;});canvas.addEventListener('pointercancel',()=>{down=false;});
canvas.addEventListener('wheel',event=>{event.preventDefault();window.pgGobhi.zoom(window.pgGobhi.view.distance+event.deltaY*.003);},{passive:false});
canvas.addEventListener('keydown',event=>{const v=window.pgGobhi.view;if(event.key==='ArrowLeft')window.pgGobhi.orbit(v.yaw-.15,v.pitch);else if(event.key==='ArrowRight')window.pgGobhi.orbit(v.yaw+.15,v.pitch);else if(event.key==='ArrowUp')window.pgGobhi.orbit(v.yaw,v.pitch-.08);else if(event.key==='ArrowDown')window.pgGobhi.orbit(v.yaw,v.pitch+.08);else return;event.preventDefault();});
document.querySelectorAll('[data-pose]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));window.pgGobhi.setPose(button.dataset.pose);$('#hands').setAttribute('aria-pressed','false');$('#pose-caption').textContent=labels[button.dataset.pose];}));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{const yaw={front:0,angle:.6,side:Math.PI/2}[button.dataset.view];window.pgGobhi.orbit(yaw,.12);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
$('#reset').addEventListener('click',()=>{window.pgGobhi.reset();$('#hands').setAttribute('aria-pressed','false');$('#pose-caption').textContent=labels[window.pgGobhi.stats.pose];});
$('#hands').addEventListener('click',()=>{const active=!window.pgGobhi.view.detail;if(active)window.pgGobhi.detail();else window.pgGobhi.reset();$('#hands').setAttribute('aria-pressed',String(active));$('#pose-caption').textContent=active?'HAND STUDY / PALM, FINGERS & WRIST':labels[window.pgGobhi.stats.pose];document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed','false'));});

function makeGLB(){
 const parts=window.pgGobhi.capture(),binary=[],bufferViews=[],accessors=[],meshes=[],materials=[],nodes=[],geometryCache=new Map(),materialCache=new Map(),meshCache=new Map();let offset=0;
 function append(array,target){const bytes=new Uint8Array(array.buffer,array.byteOffset,array.byteLength),padding=(4-offset%4)%4;if(padding){binary.push(new Uint8Array(padding));offset+=padding;}const index=bufferViews.length;bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.byteLength,target});binary.push(bytes);offset+=bytes.byteLength;return index;}
 function accessor(array,type,componentType,bounds=false,target=34962){const view=append(array,target),components={SCALAR:1,VEC2:2,VEC3:3}[type],entry={bufferView:view,componentType,count:array.length/components,type};if(bounds){entry.min=[Infinity,Infinity,Infinity];entry.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++) {const axis=i%3;entry.min[axis]=Math.min(entry.min[axis],array[i]);entry.max[axis]=Math.max(entry.max[axis],array[i]);}}accessors.push(entry);return accessors.length-1;}
 for(const part of parts){
  let geometry=geometryCache.get(part.geometry);if(!geometry){const data=part.geometry.cpu;geometry={attributes:{POSITION:accessor(data.positions,'VEC3',5126,true),NORMAL:accessor(data.normals,'VEC3',5126)},indices:accessor(data.indices,'SCALAR',5123,false,34963)};geometryCache.set(part.geometry,geometry);}
  const colorKey=part.color.join(',')+':'+part.roughness;let material=materialCache.get(colorKey);if(material===undefined){material=materials.length;materials.push({name:'Gobhi material '+material,pbrMetallicRoughness:{baseColorFactor:[...part.color,1],metallicFactor:0,roughnessFactor:part.roughness},doubleSided:true});materialCache.set(colorKey,material);}
  const meshKey=geometry.indices+':'+material;let meshIndex=meshCache.get(meshKey);if(meshIndex===undefined){meshIndex=meshes.length;meshes.push({primitives:[{...geometry,material}]});meshCache.set(meshKey,meshIndex);}
  nodes.push({name:'Gobhi sculpt '+nodes.length,mesh:meshIndex,matrix:part.matrix});
 }
 const gltf={asset:{version:'2.0',generator:'Phool Gobhi procedural model studio'},scene:0,scenes:[{name:'Gobhi — '+window.pgGobhi.stats.pose,nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials,accessors,bufferViews,buffers:[{byteLength:offset}]};
 const json=new TextEncoder().encode(JSON.stringify(gltf)),jsonLength=Math.ceil(json.length/4)*4,binLength=Math.ceil(offset/4)*4,output=new ArrayBuffer(12+8+jsonLength+8+binLength),view=new DataView(output),bytes=new Uint8Array(output);
 view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,output.byteLength,true);view.setUint32(12,jsonLength,true);view.setUint32(16,0x4e4f534a,true);bytes.fill(32,20,20+jsonLength);bytes.set(json,20);const binStart=20+jsonLength;view.setUint32(binStart,binLength,true);view.setUint32(binStart+4,0x004e4942,true);let cursor=binStart+8;binary.forEach(chunk=>{bytes.set(chunk,cursor);cursor+=chunk.length;});
 return output;
}
window.pgGobhiGLB=makeGLB;
$('#download').addEventListener('click',()=>{const data=makeGLB(),url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'})),link=document.createElement('a');link.href=url;link.download='phool-gobhi-'+window.pgGobhi.stats.pose+'.glb';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);$('#status').textContent='Your Gobhi model is ready.';$('#status').classList.add('visible');setTimeout(()=>$('#status').classList.remove('visible'),3000);});
})();
