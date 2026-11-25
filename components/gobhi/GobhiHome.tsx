'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import LoadingWithMascot from '@/components/LoadingWithMascot';
import ThemeSwitch from '@/components/ThemeSwitch';
import { useSession } from '@/components/auth/SessionProvider';
import { trackCta } from '@/lib/analytics';
import { journeyChapters, waterAmounts } from '@/lib/gobhi-story/journey';
import './gobhi-home.css';

function StoreLinks({ androidUrl, iosUrl, primary = false }: { androidUrl: string; iosUrl: string; primary?: boolean }) {
  return <div className="store-links">
    <a id={primary ? 'android-download' : undefined} href={androidUrl} aria-label="Download Phool Gobhi for Android" onClick={() => trackCta('home_download_android')}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5 18 11a1.2 1.2 0 0 1 0 2L5 20.5Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="m5 3.5 9 12m-9 5 9-12" stroke="currentColor" strokeWidth="1.1"/></svg>
      <span><small>DOWNLOAD FOR</small><b>Android</b></span><em>↗</em>
    </a>
    <a id={primary ? 'ios-download' : undefined} href={iosUrl} target="_blank" rel="noopener noreferrer" aria-label="Download Phool Gobhi for iOS on the App Store" onClick={() => trackCta('home_download_ios')}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.3 6.3c1-.9 1.6-2.1 1.4-3.3-1.2.1-2.5.8-3.3 1.7-.7.8-1.4 2-1.2 3.2 1.3.1 2.4-.6 3.1-1.6ZM19.7 16.7c-.4 1-1 2-1.8 3-.7.9-1.5 1.9-2.7 1.9-1.1 0-1.4-.6-2.9-.6s-1.9.6-2.9.6c-1.2.1-2.1-1.1-2.9-2-1.6-2-2.8-5.6-1.1-8.3.8-1.3 2.1-2.1 3.5-2.1 1.1 0 2.2.7 2.9.7.6 0 2-.8 3.4-.7 1.2.1 2.3.5 3.1 1.5-2.8 1.5-2.4 5.3.4 6Z" fill="currentColor"/></svg>
      <span><small>DOWNLOAD ON THE</small><b>App Store</b></span><em>↗</em>
    </a>
  </div>;
}

function SiteLinks() {
  return <nav className="story-site-links" aria-label="More from Phool Gobhi">
    <Link href="/about">About us</Link><Link href="/partnerships">For gyms</Link><Link href="/contact">Contact</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link>
  </nav>;
}

export default function GobhiHome({ androidUrl, iosUrl }: { androidUrl: string; iosUrl: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { user, loading } = useSession();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let cancelled = false, dispose: (() => void) | undefined;
    import('@/lib/gobhi-story/controller').then(({ mountGobhiStory }) => {
      if (!cancelled) dispose = mountGobhiStory(element);
    }).catch((error) => {
      console.error('[gobhi] story failed to mount', error);
      if (!cancelled) { element.classList.add('no-webgl'); element.querySelector('.loading')?.classList.add('done'); }
    });
    return () => { cancelled = true; dispose?.(); };
  }, []);

  return <div ref={root} className="gobhi-home" data-phase="hello" data-scene="hello">
    <div className="story-content" inert>
    <a className="skip" href="#plan">Skip to the app tour</a>
    <div className="story-progress" aria-hidden="true"><i/></div>
    <header className="masthead">
      <a className="brand" href="#hello" aria-label="Phool Gobhi home"><Image src="/gobhi/gobhi.png" width={42} height={42} alt="" priority/><span>phool<br/>gobhi</span></a>
      <span className="edition" aria-hidden="true">YOUR EVERYDAY, TOGETHER.</span>
      <div className="masthead-actions">
        <details className="story-menu"><summary aria-label="Explore Phool Gobhi"><span aria-hidden="true">☰</span><span className="menu-label">Explore</span></summary><nav aria-label="Website">
          <p className="menu-heading">Take the tour</p>
          <button id="explore-buddies">Meet your buddies <span aria-hidden="true">↓</span></button><button id="explore-map">Explore the map <span aria-hidden="true">↓</span></button>
          <p className="menu-heading">Around the site</p>
          <Link href="/gyms">Find a gym <span aria-hidden="true">→</span></Link><Link href="/coach">Your coach <span aria-hidden="true">→</span></Link>
          {!loading && (user
            ? <Link href="/account/profile">Your account <span aria-hidden="true">→</span></Link>
            : <Link href="/login">Log in <span aria-hidden="true">→</span></Link>)}
          <Link href="/partnerships">For gyms &amp; partners <span aria-hidden="true">→</span></Link><Link href="/about">Our story <span aria-hidden="true">→</span></Link><Link href="/contact">Say hello <span aria-hidden="true">→</span></Link>
          <ThemeSwitch/>
        </nav></details>
        <button className="header-cta" id="get-app">Get the app <span aria-hidden="true">↓</span></button>
      </div>
    </header>
    <h1 id="story-heading" className="sr-only" tabIndex={-1}>Hi, I am Gobhi. Your health and fitness expert. Let’s hit your goals, together.</h1>
    <div className="sr-only"><p>Your training, daily habits and little wins, together with Phool Gobhi.</p><ul><li>Build a weekly plan that fits home, your gym, or wellbeing.</li><li>Ask Gobhi for a sample routine, review it and choose what to save.</li><li>See the same plan and completed habits in Today.</li><li>Find fitness buddies, chat with matches and share your personal records.</li><li>Explore the Map.</li><li>Log your water and food.</li><li>Record workout sets, reps and weights.</li><li>Look back at your history.</li><li>Celebrate your progress with Gobhi coins.</li></ul></div>
    <div className="world"><canvas id="story-canvas" role="img" aria-label="Follow Gobhi from a wave hello into an interactive day with the Phool Gobhi app. Scroll to explore, or use the app controls to try logging."/></div>
    <section className="scene-copy" id="scene-copy" aria-live="polite" hidden><p className="eyebrow" id="scene-kicker"/><h2 id="scene-heading" tabIndex={-1}/><p id="scene-description"/></section>
    <div className="intro-caption" id="intro-caption"><span>GOOD HABITS. A LITTLE COMPANY.</span><button className="text-button" id="start-story">Come, take a look <span>↓</span></button></div>
    <div className="story-controls">
    <nav className="phone-nav-targets" aria-label="App preview navigation">{['Home','Train','Map','Buddies','You'].map(tab=><button key={tab} data-phone-tab={tab} aria-label={`App preview: ${tab}`} hidden>{tab}</button>)}</nav>
    <button id="phone-water-row" className="demo-action phone-hotspot" aria-label="Open water log from Today" hidden/>
    {waterAmounts.map(amount=><button key={amount} className="demo-action phone-hotspot" data-phone-water-amount={amount} aria-label={`Select ${amount} ml on the phone`} aria-pressed={amount===250} hidden/>)}
    <button id="demo-action" className="demo-action phone-hotspot" aria-label="Try the app preview" hidden/>
    <aside className="app-interaction" id="app-interaction" aria-label="Try a day with Gobhi" hidden>
      <p id="phone-screen-summary" className="sr-only"/>
      <p className="interaction-caption">YOUR TURN. A LITTLE GOOD, ADDED.</p>
      <div id="plan-choices" className="plan-choices" hidden><div id="context-choices" className="interaction-choices" role="group" aria-label="Your kind of fitness" hidden>{[['home','Home'],['gym','My gym'],['wellbeing','Wellbeing']].map(([value,label])=><button key={value} data-context={value} aria-pressed={value==='home'}>{label}</button>)}</div>
      <div id="training-choices" className="interaction-choices training-choices" role="group" aria-label="Training days per week" hidden>{[2,3,4].map(days=><button key={days} data-training-days={days} aria-pressed={days===3}>{days} days</button>)}</div>
      </div>
      <div id="water-choices" className="interaction-choices" role="group" aria-label="Choose water amount" hidden>{waterAmounts.map(amount=><button key={amount} data-water-amount={amount} aria-pressed={amount===250}>{amount} ml</button>)}</div>
      <div id="meal-choices" className="interaction-choices" role="group" aria-label="Choose a sample meal" hidden><button data-meal="dal" aria-pressed="true">Dal &amp; rice</button><button data-meal="paneer" aria-pressed="false">Paneer bowl</button></div>
      <div className="interaction-main"><div><strong id="interaction-stat"/><p id="interaction-detail"/></div><button id="interaction-action" className="interaction-action">Log a glass <span aria-hidden="true">+</span></button></div>
      <div className="interaction-footer"><span id="interaction-feedback" role="status" aria-live="polite">Sample day · yours to try</span><button id="journey-follow" hidden>Then, a little fuel <span aria-hidden="true">→</span></button></div>
    </aside>
    </div>
    <div className="utilities"><button id="motion" aria-pressed="false">◌ <span>Motion on</span></button><button id="about" aria-label="About the product preview">i</button></div>
    <div className="scroll-hint" id="scroll-hint"><i/><span>SCROLL TO FOLLOW GOBHI</span></div>
    <div className="scroll-story" id="story-track">{journeyChapters.slice(0, -1).map(id => <div key={id} id={id}/>)}
      <div id="join">
    <div className="join-panel" id="join-panel" hidden><p className="eyebrow">YOUR GOALS. YOUR PEOPLE. YOUR EVERYDAY.</p><h2 id="join-heading" tabIndex={-1}>Let’s get<br/><span>going.</span></h2><p>Your goals, habits and fitness buddies.<br/>A little better, together with Phool Gobhi.</p>
      <StoreLinks androidUrl={androidUrl} iosUrl={iosUrl} primary/>
      <button className="replay text-button" id="replay">Say hi again <span>↺</span></button><SiteLinks/>
    </div>
      </div>
    </div>
    <dialog id="about-dialog"><button className="dialog-close" aria-label="Close dialog">×</button><p className="eyebrow">A LITTLE LOOK INSIDE PHOOL GOBHI</p><h2>Your everyday,<br/>coming together.</h2><p>Meet Gobhi, set a goal, ask for a little help, log your day, meet your buddies and watch it all add up.</p><p className="fine-print">App screens use sample data. These demonstrations stay on this page and don’t change your account.</p><button className="dialog-button">Back to Gobhi →</button></dialog>
    <div className="toast" role="status" aria-live="polite"/>
    </div>
    <div className="loading" role="status">
      <LoadingWithMascot
        audience="customer"
        minVisibleMs={0}
        mascotSize={88}
        message="Gobhi’s warming up to help you hit your goals…"
        className="gobhi-loading-content"
      />
    </div>
    <div className="no-webgl-message">
      <Image src="/gobhi/gobhi.png" width={100} height={100} alt="Gobhi, your fitness buddy"/>
      <h2 tabIndex={-1}>A little better,<br/>together.</h2><p>Your water, food, workouts and little wins. Bring your everyday together with Phool Gobhi.</p>
      <StoreLinks androidUrl={androidUrl} iosUrl={iosUrl}/>
      <button className="text-button" onClick={() => location.reload()}>Meet Gobhi in 3D <span>↻</span></button>
      <SiteLinks/>
      <ThemeSwitch/>
    </div>
    <noscript><style>{'.gobhi-home .loading,.gobhi-home .story-content,.gobhi-home .no-webgl-message button{display:none!important}.gobhi-home .no-webgl-message{display:flex!important}'}</style></noscript>
  </div>;
}
