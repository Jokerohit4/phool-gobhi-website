(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const atmosphere=document.createElement('div');atmosphere.className='app-atmosphere';atmosphere.setAttribute('aria-hidden','true');$('.world').append(atmosphere);let renderedScene=-1,copyAnimation;
const stops=[0,.11,.23,.35,.45,.55,.65,.75,.85,1];
const scenes=[
 {name:'hello',label:'A LITTLE COMPANY FOR YOUR EVERYDAY.'},
 {name:'phone',kicker:'LET’S TAKE A LITTLE LOOK',title:'Your day.<br> In my hands.',description:'Your health and fitness, together.<br> Let me show you around.',label:'FIRST, A LITTLE SOMETHING FROM MY POCKET.'},
 {name:'perspective',kicker:'COME OVER HERE',title:'See it from<br> my side.',description:'A little closer.<br> There’s a whole everyday in here.',label:'OVER GOBHI’S SHOULDER. INTO HIS EVERYDAY.'},
 {name:'inside',kicker:'WELCOME TO PHOOL GOBHI',title:'A little space.<br> For all of you.',description:'Workouts, daily habits and the little wins.<br> Let’s start with something small.',screen:'home',label:'YOUR EVERYDAY, COMING TOGETHER.'},
 {name:'water',kicker:'01 / STAY HYDRATED',title:'A little sip.<br> A better rhythm.',description:'Keep track of your water through the day.<br> Try logging a glass in the app preview.',screen:'water',action:'Log 250 ml of water',label:'WATER LOGGING / EVERY LITTLE SIP COUNTS.'},
 {name:'food',kicker:'02 / FOOD, REMEMBERED',title:'Good food.<br> Less guesswork.',description:'Log meals, keep favourites, and make room<br> for the food that fits your everyday.',screen:'food',action:'Log the sample meal',label:'FOOD LOGGING / FAMILIAR MEALS, LESS EFFORT.'},
 {name:'workout',kicker:'03 / YOUR OWN STRONG',title:'Every set.<br> Part of your story.',description:'Record your sets, reps and weights.<br> At your gym, at home, at your pace.',screen:'workout',action:'Save the sample workout',label:'WORKOUT LOGGING / YOUR EFFORT, RECORDED.'},
 {name:'history',kicker:'04 / A LITTLE PERSPECTIVE',title:'Look back.<br> See it adding up.',description:'Your sessions and daily habits, together.<br> Keep the thread of your progress.',screen:'history',action:'Toggle the sample history view',label:'HISTORY / SMALL THINGS, REAL MOMENTUM.'},
 {name:'coins',kicker:'05 / CELEBRATE SHOWING UP',title:'Little wins.<br> A little reward.',description:'A bit of encouragement to keep you going.<br> Give the reward wheel a spin.',screen:'coins',action:'Spin the sample reward wheel',label:'GOBHI COINS / MAKE THE EVERYDAY FEEL GOOD.'},
 {name:'join',label:'A LITTLE BETTER, TOGETHER.'}
];
let active=0,progress=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,motionChosen=false,queued=false,tween=0,toastTimer;
const appTitles={inside:'Your day.<br>Turn it up.',water:'SIP. LOG.<br>LET\u2019S GO.',food:'GOOD FOOD.<br>GOOD MOOD.',workout:'YOUR SETS.<br>YOUR STRONG.',history:'SMALL STEPS.<br>LOOK AT YOU.',coins:'SHOW UP.<br>GLOW UP.'};
const appWords={inside:'EVERYDAY',water:'FLOW',food:'FUEL',workout:'STRONG',history:'GROW',coins:'WIN!'};
const query=matchMedia('(prefers-reduced-motion: reduce)');
function update(){queued=false;const total=document.documentElement.scrollHeight-innerHeight;progress=total>0?Math.max(0,Math.min(1,scrollY/total)):0;let index=0;for(let i=1;i<stops.length;i++)if(progress>=(stops[i-1]+stops[i])/2)index=i;active=index;const scene=scenes[index];
 document.body.dataset.phase=index===0?'hello':index===9?'join':index>=3?'app':'setup';
 document.body.dataset.scene=scene.name;atmosphere.dataset.word=appWords[scene.name]||'';
 if(reduced)copyAnimation?.cancel();
 $('#scene-copy').hidden=index===0||index===9;$('#intro-caption').hidden=index!==0;$('#join-panel').hidden=index!==9;$('#sample-label').hidden=index<3||index>8;
 $('#scene-kicker').textContent=scene.kicker||'';$('#scene-heading').innerHTML=(appTitles[scene.name]||scene.title||'').replace(/<br>/g,'<br> ');$('#scene-description').innerHTML=scene.description||'';$('#scene-label').textContent=scene.label;
 if(renderedScene!==index){renderedScene=index;copyAnimation?.cancel();if(!reduced)copyAnimation=$('#scene-copy').animate([{transform:'translateY(18px)',filter:'blur(3px)'},{transform:'translateY(0)',filter:'blur(0)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});}
 $('#previous').disabled=index===0;$('#next').disabled=index===9;$('#next').innerHTML=(index===0?"Let's go":index===8?'Join us':'Next')+' <span>→</span>';
 $$('[data-step]').forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});$('#journey-progress').style.width=progress*100+'%';
 const copyOpacity=index===2?1-Math.max(0,Math.min(1,(progress-.18)/.03)):1;$('#scene-copy').style.opacity=copyOpacity;
 $('#scroll-hint').hidden=index===9;
 window.pgStory?.setProgress(progress,reduced);
 if(!scene.action&&scene.screen!=='home')$('#demo-action').hidden=true;
}
function go(index){index=Math.max(0,Math.min(9,index));cancelAnimationFrame(tween);const target=(document.documentElement.scrollHeight-innerHeight)*stops[index];if(reduced){scrollTo({top:target,behavior:'instant'});update();return;}const start=scrollY,time=performance.now(),duration=Math.min(1500,900+Math.abs(index-active)*100);
 function move(now){const t=Math.min(1,(now-time)/duration),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;scrollTo({top:start+(target-start)*ease,behavior:'instant'});if(t<1)tween=requestAnimationFrame(move);else{tween=0;update();}}
 tween=requestAnimationFrame(move);
}
function next(){if(active===0&&reduced&&!motionChosen){reduced=false;setMotion();}go(active+1);}
function setMotion(){document.body.classList.toggle('reduced-motion',reduced);$('#motion').setAttribute('aria-pressed',String(reduced));$('#motion').setAttribute('aria-label',reduced?'Enable continuous camera animation':'Use still scene views');$('#motion').innerHTML='◌ <span>'+(reduced?'Still scenes':'Motion on')+'</span>';update();}
$('#next').addEventListener('click',next);$('#start-story').addEventListener('click',next);$('#previous').addEventListener('click',()=>go(active-1));$('#get-app').addEventListener('click',()=>go(9));$('#replay').addEventListener('click',()=>{window.pgStory?.resetDemo();go(0);});
$$('[data-step]').forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.step))));$('.brand').addEventListener('click',event=>{event.preventDefault();go(0);});$('.skip').addEventListener('click',event=>{event.preventDefault();go(4);});
$('#motion').addEventListener('click',()=>{motionChosen=true;reduced=!reduced;setMotion();});query.addEventListener('change',()=>{if(!motionChosen){reduced=query.matches;setMotion();}});
let pointer=null;$('#story-canvas').addEventListener('pointerdown',event=>{pointer={x:event.clientX,y:event.clientY};});$('#story-canvas').addEventListener('pointerup',event=>{if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)<8&&active<9)next();pointer=null;});$('#story-canvas').addEventListener('pointercancel',()=>{pointer=null;});
addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);addEventListener('wheel',()=>{cancelAnimationFrame(tween);tween=0;},{passive:true});addEventListener('touchstart',()=>{cancelAnimationFrame(tween);tween=0;},{passive:true});
$('#demo-action').addEventListener('click',event=>{event.stopPropagation();if(active===3){go(4);return;}const result=window.pgStory?.act(scenes[active].screen);if(result){clearTimeout(toastTimer);$('.toast').textContent=result;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),2800);}});
addEventListener('storyframe',event=>{const state=event.detail,rect=state.actionRect,scene=scenes[active],button=$('#demo-action');if(!rect||active<3||active>8||Math.abs(state.progress-progress)>.035){button.hidden=true;return;}button.hidden=false;button.style.left=rect.x+'px';button.style.top=rect.y+'px';button.style.width=rect.width+'px';button.style.height=Math.max(30,rect.height)+'px';button.setAttribute('aria-label',scene.action||'Open water logging');});
const dialog=$('#about-dialog');$('#about').addEventListener('click',()=>dialog.showModal());$('.dialog-close').addEventListener('click',()=>dialog.close());$('.dialog-button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
function ready(){setMotion();$('.loading').classList.add('done');}
addEventListener('storyready',ready);window.pgStoryUI={go,next,get scene(){return active;},get progress(){return progress;},get reduced(){return reduced;}};setMotion();if(window.pgStory?.state.ready)ready();
})();
