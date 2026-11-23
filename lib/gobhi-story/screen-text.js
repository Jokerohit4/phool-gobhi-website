/* Browser-rendered glyphs mapped to the four corners of the handset glass. */
const NS='http://www.w3.org/2000/svg';
let sequence=0;
const screenWidth=720,screenHeight=1500;

function perspectiveMatrix([a,b,c,d],width,height){
 const dx1=b.x-d.x,dx2=c.x-d.x,dy1=b.y-d.y,dy2=c.y-d.y;
 const dx3=a.x-b.x-c.x+d.x,dy3=a.y-b.y-c.y+d.y;
 const determinant=dx1*dy2-dx2*dy1;
 if(Math.abs(determinant)<.001)return null;
 const g=(dx3*dy2-dx2*dy3)/determinant,h=(dx1*dy3-dx3*dy1)/determinant;
 return [
  (b.x-a.x+g*b.x)/width,(b.y-a.y+g*b.y)/width,0,g/width,
  (c.x-a.x+h*c.x)/height,(c.y-a.y+h*c.y)/height,0,h/height,
  0,0,1,0,a.x,a.y,0,1,
 ];
}

export function createScreenText(canvas){
 const svg=document.createElementNS(NS,'svg'),group=document.createElementNS(NS,'g'),content=document.createElementNS(NS,'g'),defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath'),rect=document.createElementNS(NS,'rect'),id='gobhi-screen-text-'+(++sequence);
 svg.classList.add('phone-screen-text');svg.setAttribute('aria-hidden','true');
 Object.assign(svg.style,{position:'absolute',top:'0',left:'0',transformOrigin:'0 0',pointerEvents:'none',overflow:'hidden'});
 svg.setAttribute('viewBox',`0 0 ${screenWidth} ${screenHeight}`);
 svg.setAttribute('preserveAspectRatio','none');
 svg.setAttribute('text-rendering','geometricPrecision');
 clip.id=id;rect.setAttribute('width','720');rect.setAttribute('height','1500');rect.setAttribute('rx',String(.14/1.22*720));clip.append(rect);defs.append(clip);content.setAttribute('clip-path',`url(#${id})`);group.append(content);svg.append(defs,group);canvas.after(svg);
 let previous=null;
 return {
  update(runs,corners,opacity){
   if(opacity<=.0001||corners.some(point=>!point)){svg.style.display='none';return;}
   const [a,b,c]=corners;
   // Rasterize near the displayed size before applying the perspective warp.
   const width=Math.max(1,Math.round(Math.hypot(b.x-a.x,b.y-a.y)));
   const height=Math.max(1,Math.round(Math.hypot(c.x-a.x,c.y-a.y)));
   const matrix=perspectiveMatrix(corners,width,height);
   svg.style.display=matrix?'block':'none';
   if(!matrix)return;
   svg.style.width=width+'px';
   svg.style.height=height+'px';
   svg.style.transform=`matrix3d(${matrix.join(',')})`;
   group.setAttribute('opacity',String(opacity));
   if(runs===previous)return;previous=runs;
   while(content.children.length>runs.length)content.lastChild.remove();
   runs.forEach((run,i)=>{
    const node=content.children[i]||document.createElementNS(NS,'text');
    if(!node.parentNode)content.append(node);
    node.textContent=run.text;
    for(const [key,value] of Object.entries({x:run.x,y:run.y,'font-size':run.size,'font-weight':run.weight,'font-family':'GobhiWork,Arial,sans-serif',fill:run.color,opacity:run.opacity,transform:`matrix(${run.transform.join(' ')})`}))node.setAttribute(key,String(value));
   });
  },
  dispose(){svg.remove();}
 };
}
