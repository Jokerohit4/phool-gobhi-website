(() => {
'use strict';
const $ = s => document.querySelector(s);
const buttons = [...document.querySelectorAll('[data-chapter]')];
const sections = [...document.querySelectorAll('.scroll-story section')];
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reducedQuery.matches;
const stops = [0, .19, .40, .59, .77, 1];
const chapters = [
 {kicker:'01 / A DAY WITH GOBHI', title:'Big plans.<br> Small beginnings.', description:"Even Gobhi starts somewhere.<br> Let's see what he's up to.", subtitle:'ONE PHONE. A LITTLE MORE POSSIBILITY.', className:'',button:'Follow Gobhi',cue:'SCROLL TO STEP INTO HIS DAY'},
 {kicker:'02 / A LITTLE CLOSER', title:'A whole day.<br> In his hands.', description:'His workout. His everyday habits.<br> Come on in. There’s room for you, too.',subtitle:'FROM HIS WORLD, INTO THE APP.',className:'scene-close',cue:'KEEP SCROLLING. WE’RE GOING INSIDE.'},
 {kicker:'03 / MAKE YOUR MOVE',title:'Show up.<br> Find your strong.',description:'A routine to start with. One set at a time.<br> Your gym, your home, your own rhythm.',subtitle:'TRAINING / YOUR NEXT LITTLE WIN',className:'scene-inside',cue:'YOUR EVERYDAY IS JUST AHEAD'},
 {kicker:'04 / THE EVERYDAY MATTERS',title:'Fuel the day.<br> Feel more you.',description:'A meal. A little water. A moment to check in.<br> The small things belong here, too.',subtitle:'FOOD & WATER / ALL PART OF YOUR DAY',className:'scene-inside',cue:'A LITTLE FURTHER. IT ALL ADDS UP.'},
 {kicker:'05 / LOOK AT YOU GO',title:'Little things.<br> Real momentum.',description:'Your training and daily habits, coming together.<br> A little perspective on how far you’ve come.',subtitle:'PROGRESS / YOUR EFFORT, IN PERSPECTIVE',className:'scene-inside',cue:'THERE’S ONE MORE LITTLE BEGINNING'},
 {kicker:'06 / NOW, YOUR TURN',title:'Make a little<br> room for you.',description:'Your everyday, a little more connected.<br> Start wherever you are.',subtitle:'PHOOL GOBHI / A LITTLE BETTER, TOGETHER.',className:'scene-ending',button:'Make it my everyday',cue:'YOUR STORY STARTS HERE'}
];
let active = -1, progress = 0, pending = false;
function getProgress(){return Math.max(0,Math.min(1,scrollY/(document.documentElement.scrollHeight-innerHeight)));}
function go(index){ const distance = document.documentElement.scrollHeight-innerHeight; scrollTo({top:distance*stops[index],behavior:reduced?'instant':'smooth'}); }
function update(){
 pending=false; progress=getProgress();
 let index=0;const boundaries=[.105,.32,.505,.685,.9];boundaries.forEach((value,i)=>{if(progress>=value)index=i+1;});
 if(active!==index){
  active=index;const chapter=chapters[index];
  document.body.dataset.scene=index>=2&&index<=4?'inside':'studio';
  $('#chapter-copy').className='chapter-copy '+chapter.className;
  $('#chapter-kicker').textContent=chapter.kicker;$('#chapter-heading').innerHTML=chapter.title;
  $('#chapter-description').innerHTML=chapter.description;$('#scene-subtitle').textContent=chapter.subtitle;
  $('#scroll-label').textContent=chapter.cue;$('#scene-number').textContent=String(index+1).padStart(2,'0');
  $('#begin').style.display=chapter.button?'flex':'none';$('#begin').innerHTML=(chapter.button||'')+' <span>'+(index===5?'↗':'↓')+'</span>';
  buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 }
 const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 // Give the phone the whole frame while the camera crosses its screen.
 const copyOpacity=progress<.33?1-smooth(.23,.275,progress):smooth(.35,.39,progress);
 $('#chapter-copy').style.opacity=copyOpacity;
 $('#chapter-copy').style.visibility=copyOpacity<.01?'hidden':'visible';
 $('#journey-progress').style.width=(progress*100)+'%';$('#side-progress').style.height=(progress*100)+'%';
 window.pgJourney?.setProgress(progress,reduced);
}
addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
addEventListener('resize',update);
buttons.forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.chapter))));
$('.brand').addEventListener('click',event=>{event.preventDefault();go(0);});
$('.skip').addEventListener('click',event=>{event.preventDefault();go(2);});
const dialog=$('#info-dialog');
function openDialog(about=false){
 $('#dialog-kicker').textContent=about?'A SCROLL-DRIVEN DESIGN STUDY':'YOUR EVERYDAY, COMING TOGETHER';
 $('#dialog-heading').textContent=about?'One continuous world.':'Now, your turn.';
 $('#dialog-body').textContent=about?'Scroll to move the camera from Gobhi and his phone into a dimensional journey through the app. Use the chapter controls to jump to a moment. The motion control switches to still chapter views.':'This is a scroll-driven 3-D concept for the new Phool Gobhi website. The finished experience will connect you to the app here.';
 dialog.showModal();document.documentElement.style.overflow='hidden';
}
$('#begin').addEventListener('click',()=>{if(active===5)openDialog();else{if(reduced)setMotion(false);go(1);}});
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>openDialog(button.dataset.open==='about')));
$('.close').addEventListener('click',()=>dialog.close());$('#back-to-story').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.documentElement.style.overflow='';});
dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
function setMotion(value){reduced=value;document.body.classList.toggle('reduced-motion',value);$('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-toggle').setAttribute('aria-label',value?'Enable continuous camera animation':'Use still chapter views');$('#motion-toggle').innerHTML='◌ <span>'+(value?'Still chapters':'Motion on')+'</span>';update();}
$('#motion-toggle').addEventListener('click',()=>setMotion(!reduced));reducedQuery.addEventListener('change',()=>setMotion(reducedQuery.matches));
function sceneReady(){setMotion(reduced);$('.loading').classList.add('done');}
window.addEventListener('journeyready',sceneReady);
window.pgJourneyUI={go,get progress(){return progress;},get chapter(){return active;},get reduced(){return reduced;}};
setMotion(reduced);
if(window.pgJourney?.state.ready)sceneReady();
})();
