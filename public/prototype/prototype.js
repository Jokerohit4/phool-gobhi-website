/* Standalone concept: no API calls, accounts, cookies or external dependencies. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = $('#prototype-dialog');
  let toastTimer;
  let chapterTimer;
  let activeChapter = 'train';
  const toast = (message) => {
    clearTimeout(toastTimer);
    $('.toast').textContent = message;
    $('.toast').classList.add('visible');
    toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 3800);
  };

  const chapters = {
    train: {
      color: '#e9eddf', description: 'Your next session. At your pace.', count: '01 — 03',
      html: `<div class="demo-top"><span>YOUR TRAINING, TOGETHER</span><span>↗</span></div><h3>A little stronger.<br>One rep at a time.</h3><p class="demo-subtitle">Full body strength · 6 exercises</p><div class="exercise-list"><div class="exercise"><span class="exercise-thumb">↗</span><div>Goblet squat<small>3 sets · 10 reps</small></div><span>01</span></div><div class="exercise"><span class="exercise-thumb">⌁</span><div>Dumbbell bench press<small>3 sets · 12 reps</small></div><span>02</span></div><div class="exercise"><span class="exercise-thumb">↔</span><div>Seated cable row<small>3 sets · 12 reps</small></div><span>03</span></div></div><button class="demo-button" data-demo-action="workout">Start your little session <span>→</span></button><p class="demo-footer">Warm up. Find your rhythm. Make it yours.</p>`
    },
    nourish: {
      color: '#f0e7d5', description: 'The everyday matters, too.', count: '02 — 03',
      html: `<div class="demo-top"><span>A LITTLE NOURISHMENT</span><span>◒</span></div><h3>Food for your<br>kind of day.</h3><p class="demo-subtitle">Your food journal · Today</p><div class="food-row"><div class="food-art" aria-hidden="true"></div><div><strong>A very good lunch.</strong><small>Dal, rice & a little sabzi</small><p class="demo-subtitle">Your saved meal · 1 serving</p></div></div><div class="nutrition-bars"><div><span>Protein</span><b>18g</b></div><div><span>Carbs</span><b>62g</b></div><div><span>Fat</span><b>12g</b></div></div><button class="demo-button" data-demo-action="meal">Log this little moment <span>+</span></button><p class="demo-footer">Illustrative meal and nutrition values.</p>`
    },
    progress: {
      color: '#e3e8df', description: 'A little proof that it all adds up.', count: '03 — 03',
      html: `<div class="demo-top"><span>YOUR WEEK, IN A LITTLE PICTURE</span><span>↗</span></div><h3>Look at you.<br>Showing up.</h3><p class="summary-big">3<small>sessions this week</small></p><div class="week-chart" aria-label="Illustrative activity across the week"><div style="height:58%"><span>M</span></div><div style="height:35%"><span>T</span></div><div style="height:100%"><span>W</span></div><div style="height:20%"><span>T</span></div><div style="height:75%"><span>F</span></div><div style="height:12%"><span>S</span></div><div style="height:12%"><span>S</span></div></div><p class="progress-caption"><span>↗</span> Small things. Starting to add up.</p><button class="demo-button" data-demo-action="review">Your week, a little closer <span>↗</span></button><p class="demo-footer">Sample weekly summary.</p>`
    }
  };
  function setChapter(key, animate = true) {
    activeChapter = key;
    const data = chapters[key];
    $$('[data-chapter]').forEach(button => {
      const selected = button.dataset.chapter === key;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $('#chapter-panel').setAttribute('aria-labelledby', `tab-${key}`);
    $('.chapter-stage').style.background = data.color;
    $('#stage-description').textContent = data.description;
    $('#stage-count').textContent = data.count;
    clearTimeout(chapterTimer);
    const update = () => {
      $('#demo-content').innerHTML = data.html;
      $('#demo-content').classList.remove('switching');
    };
    if (animate && !reduceMotion.matches) {
      $('#demo-content').classList.add('switching');
      chapterTimer = setTimeout(update, 140);
    } else update();
  }
  $$('[data-chapter]').forEach(button => button.addEventListener('click', () => setChapter(button.dataset.chapter)));
  setChapter('train', false);

  const personas = {
    gym: { label: 'YOUR GYM. YOUR RHYTHM.', title: "You bring the effort.<br>We'll keep the thread.", description: 'Your sessions, routines and personal bests, together. Keep training at the gym you love.', color: '#ebe4d6', art: '' },
    home: { label: 'YOUR SPACE. YOUR STARTING POINT.', title: 'Big things start<br>in small spaces.', description: 'Home-friendly routines and a little structure. Make the most of the space and equipment you have.', color: '#eee0d5', art: 'home' },
    sport: { label: 'FOR THE GAME YOU LOVE.', title: 'A little stronger.<br>For your next game.', description: 'Keep your training and daily nutrition in the picture, alongside the sports you love to play.', color: '#f0e7d2', art: 'sport' },
    wellness: { label: 'FEELING GOOD IS A GOOD GOAL.', title: 'No finish line.<br>Just a little more you.', description: 'Sleep, mood, movement and everyday habits. Find small ways to care for yourself, at your pace.', color: '#e9e3ee', art: 'wellness' }
  };
  function setPersona(key) {
    const data = personas[key];
    $$('[data-persona]').forEach(button => {
      const selected = button.dataset.persona === key;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $('#persona-panel').setAttribute('aria-labelledby', `persona-${key}`);
    $('#persona-panel').style.background = data.color;
    $('#persona-label').textContent = data.label;
    $('#persona-title').innerHTML = data.title;
    $('#persona-description').textContent = data.description;
    $('#persona-art').className = `persona-art ${data.art}`;
  }
  $$('[data-persona]').forEach(button => button.addEventListener('click', () => setPersona(button.dataset.persona)));
  // Both tab lists implement roving focus and automatic arrow-key activation.
  $$('[role="tablist"]').forEach(list => list.addEventListener('keydown', event => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(document.activeElement);
    if (index === -1) return;
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); tabs[next].focus(); tabs[next].click(); }
  }));

  function openDialog(partner = false) {
    $('#dialog-eyebrow').textContent = partner ? 'FOR YOUR GYM AND ITS PEOPLE' : "A LITTLE LOOK AT WHAT'S NEXT";
    $('#dialog-title').innerHTML = partner ? 'Good habits.<br>Stronger connections.' : 'This is your<br>starting point.';
    $('#dialog-description').textContent = partner
      ? 'The finished partner page will show how your gym connects member visits, training and engagement. This prototype previews the new brand direction.'
      : "You're exploring the new Phool Gobhi website concept. App store links will connect here in the finished website.";
    $('#dialog-action').textContent = partner ? 'Back to the concept ↗' : 'Explore the everyday ↗';
    $('#dialog-action').dataset.partner = String(partner);
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
  }
  $$('[data-download]').forEach(button => button.addEventListener('click', () => openDialog()));
  $('#partner-button').addEventListener('click', () => openDialog(true));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  $('#dialog-action').addEventListener('click', () => {
    const partner = $('#dialog-action').dataset.partner === 'true';
    dialog.close();
    if (!partner) $('#your-day').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  });

  let water = 1.2;
  $('#water-add').addEventListener('click', () => {
    water = Math.round((water + .25) * 100) / 100;
    $('#water-amount').innerHTML = `${water.toFixed(2).replace(/0$/, '')}<small>of 2.5 litres</small>`;
    toast(water >= 2.5 ? 'Your sample water goal, complete. A little celebration!' : 'A little sip, logged. +250 ml in this preview.');
  });
  $('#start-workout').addEventListener('click', () => {
    setChapter('train', false);
    $('#your-day').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    toast('Your sample session is ready. Six exercises, your pace.');
  });
  $('#demo-content').addEventListener('click', event => {
    const action = event.target.closest('[data-demo-action]');
    if (!action) return;
    if (action.dataset.demoAction === 'workout') {
      action.innerHTML = 'Session in progress <span>✓</span>';
      $('.demo-subtitle').textContent = 'Goblet squat · Set 1 of 3 · 10 reps';
      $('.demo-footer').textContent = 'Example session started. Nothing is saved to an account.';
      toast('A little beginning. Your sample session has started.');
    } else if (action.dataset.demoAction === 'meal') {
      action.innerHTML = 'Lunch logged <span>✓</span>';
      action.disabled = true;
      toast('Lunch added to this preview. One less thing to remember.');
    } else {
      $('#dialog-eyebrow').textContent = 'YOUR SAMPLE WEEK';
      $('#dialog-title').innerHTML = 'Three sessions.<br>Lots of little wins.';
      $('#dialog-description').textContent = 'This illustrative week includes three training sessions and a growing record of daily habits. The finished website will demonstrate the app’s weekly review using approved product screens.';
      $('#dialog-action').textContent = 'Keep exploring ↗';
      $('#dialog-action').dataset.partner = 'true';
      dialog.showModal(); document.documentElement.style.overflow = 'hidden';
    }
  });

  $('.menu-toggle').addEventListener('click', () => {
    const open = $('.header').classList.toggle('menu-open');
    $('.menu-toggle').setAttribute('aria-expanded', String(open));
    $('.menu-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    $('.menu-toggle').textContent = open ? '×' : '☰';
  });
  $$('.header nav a').forEach(link => link.addEventListener('click', () => {
    $('.header').classList.remove('menu-open');
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
    $('.menu-toggle').textContent = '☰';
  }));

  let paused = reduceMotion.matches;
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    $('#motion-toggle').setAttribute('aria-pressed', String(paused));
    $('#motion-toggle').setAttribute('aria-label', paused ? 'Play decorative animation' : 'Pause decorative animation');
    $('#motion-toggle').textContent = paused ? '▶' : 'Ⅱ';
    window.pgScene?.setPaused(paused);
  }
  $('#motion-toggle').addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; updateMotion(); });
  updateMotion();
  const hero = $('.hero');
  hero.addEventListener('pointermove', event => {
    if (paused || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    document.documentElement.style.setProperty('--pointer-x', x.toFixed(3));
    document.documentElement.style.setProperty('--pointer-y', y.toFixed(3));
    window.pgScene?.setPointer(x, y);
  });
  hero.addEventListener('pointerleave', () => {
    document.documentElement.style.setProperty('--pointer-x', 0);
    document.documentElement.style.setProperty('--pointer-y', 0);
    window.pgScene?.setPointer(0, 0);
  });
  let scrollPending = false;
  addEventListener('scroll', () => {
    if (scrollPending || paused) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      const value = Math.min(scrollY / 850, 1);
      document.documentElement.style.setProperty('--scroll', value.toFixed(3));
      window.pgScene?.setScroll(value);
      scrollPending = false;
    });
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    document.body.classList.add('js-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .1 });
    $$('.reveal').forEach(element => observer.observe(element));
  }
  // Expose only the currently selected panel for lightweight preview checks.
  window.pgPrototype = { get chapter() { return activeChapter; } };
})();
