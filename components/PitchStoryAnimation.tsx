'use client';

import { useEffect, useRef } from 'react';

interface Scene {
  t0: number;
  t1: number;
  sub: string;
}

export default function PitchStoryAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const muteBtnRef = useRef<HTMLButtonElement>(null);
  const fsBtnRef = useRef<HTMLButtonElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    const playBtn = playBtnRef.current;
    const muteBtn = muteBtnRef.current;
    const fsBtn = fsBtnRef.current;
    if (!cv || !wrap || !playBtn || !muteBtn || !fsBtn) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const W = 800, H = 450;
    let isRunning = false;
    let startTs: number | null = null;
    let rafId = 0;
    const TOTAL = 30;

    const SCENES: Scene[] = [
      { t0: 0, t1: 5, sub: "You join a gym. ₹30,000 for the full year." },
      { t0: 5, t1: 9, sub: "Month 1 — you're unstoppable." },
      { t0: 9, t1: 16, sub: 'Life happens. You stop. The money keeps going.' },
      { t0: 16, t1: 21, sub: 'You paid for a year of guilt.' },
      { t0: 21, t1: 26, sub: "The gym's model? Built for people not to come." },
      { t0: 26, t1: 30, sub: 'Pay only when you show up. That’s Phool Gobhi.' },
    ];

    // ── Audio ────────────────────────────────────────────
    let AC: AudioContext | null = null;
    let masterGain: GainNode | null = null;
    let droneNodes: { osc: OscillatorNode; g: GainNode }[] = [];
    let isMuted = false;
    let lastSceneIdx = -1;
    let coinTimer = -99;
    let s4played = [false, false, false, false];
    let ckPlayed = false;

    function getAC(): AudioContext | null {
      if (!AC) {
        try {
          const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          AC = new Ctor();
        } catch {
          return null;
        }
        masterGain = AC.createGain();
        masterGain.gain.value = 1;
        masterGain.connect(AC.destination);
      }
      if (AC.state === 'suspended') AC.resume();
      return AC;
    }

    function tone(freq: number, dur: number, vol: number, wave: OscillatorType = 'sine', delay = 0) {
      if (isMuted) return;
      const ac = getAC();
      if (!ac || !masterGain) return;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      const t0 = ac.currentTime + delay;
      osc.type = wave;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol || 0.07, t0 + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.1);
    }

    function startDrone() {
      if (isMuted) return;
      const ac = getAC();
      if (!ac || !masterGain) return;
      stopDrone();
      ([[55, 0.05], [82.4, 0.025], [110, 0.015]] as [number, number][]).forEach((p) => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = p[0];
        g.gain.setValueAtTime(0, ac.currentTime);
        g.gain.linearRampToValueAtTime(p[1], ac.currentTime + 1.5);
        osc.connect(g);
        g.connect(masterGain!);
        osc.start();
        droneNodes.push({ osc, g });
      });
    }

    function stopDrone() {
      const ac = getAC();
      if (!ac) return;
      droneNodes.forEach((n) => {
        try {
          n.g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.8);
        } catch {}
        setTimeout(() => {
          try {
            n.osc.stop();
          } catch {}
        }, 900);
      });
      droneNodes = [];
    }

    function sceneSound(idx: number) {
      if (isMuted) return;
      switch (idx) {
        case 0: tone(261.6, 0.6, 0.07, 'sine', 0); tone(329.6, 0.6, 0.06, 'sine', 0.14); tone(392, 0.8, 0.07, 'sine', 0.28); break;
        case 1: tone(523.2, 0.18, 0.08, 'square', 0); tone(659.3, 0.18, 0.07, 'square', 0.12); tone(783.9, 0.28, 0.08, 'square', 0.24); break;
        case 2: tone(220, 1.0, 0.06, 'sine', 0); tone(196, 1.0, 0.05, 'sine', 0.5); tone(174.6, 1.4, 0.05, 'sine', 1.0); break;
        case 3: tone(65.4, 1.5, 0.12, 'sine', 0); tone(55, 1.2, 0.08, 'sine', 0.15); break;
        case 4: tone(55, 2.2, 0.07, 'sawtooth', 0); tone(58.3, 2.2, 0.05, 'sawtooth', 0); tone(73.4, 1.8, 0.04, 'sine', 0.3); break;
        case 5: tone(523.2, 1.0, 0.07, 'sine', 0); tone(659.3, 1.0, 0.06, 'sine', 0.09); tone(783.9, 1.3, 0.07, 'sine', 0.18); tone(1046.5, 1.6, 0.05, 'sine', 0.28); break;
      }
    }

    function playCoin() {
      if (isMuted) return;
      const f = 1200 + Math.random() * 400;
      tone(f, 0.13, 0.04, 'sine', 0);
      tone(f * 0.75, 0.09, 0.025, 'sine', 0.025);
    }
    function playThud() {
      tone(80, 0.5, 0.09, 'sine', 0);
      tone(60, 0.35, 0.07, 'sine', 0.06);
    }
    function playCheck() {
      tone(783.9, 0.7, 0.07, 'sine', 0);
      tone(1046.5, 0.8, 0.06, 'sine', 0.1);
      tone(1318.5, 1.0, 0.07, 'sine', 0.2);
    }

    const BG = '#08150E', BG2 = '#0F2318', BDR = '#1C3D28';
    const GRN = '#3D8B5E', BRT = '#5EBB80', TXT = '#DCF0E5';
    const DIM = '#8AAD96', GLD = '#D4A843';

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
    const ease = (t: number) => { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; };
    const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

    function rr(x: number, y: number, w: number, h: number, r = 0, fill?: string, stroke?: string, lw?: number) {
      ctx!.beginPath();
      ctx!.moveTo(x + r, y); ctx!.lineTo(x + w - r, y);
      ctx!.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx!.lineTo(x + w, y + h - r);
      ctx!.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx!.lineTo(x + r, y + h);
      ctx!.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx!.lineTo(x, y + r);
      ctx!.quadraticCurveTo(x, y, x + r, y);
      ctx!.closePath();
      if (fill) { ctx!.fillStyle = fill; ctx!.fill(); }
      if (stroke) { ctx!.strokeStyle = stroke; ctx!.lineWidth = lw || 1.5; ctx!.stroke(); }
    }

    function drawBg() { ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H); }

    function drawPerson(cx: number, fy: number, sc = 1, mood: 'happy' | 'sad' | 'ok', wp: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      ctx!.translate(cx, fy); ctx!.scale(sc, sc);
      const ls = wp ? Math.sin(wp) * 18 : 0, as2 = -ls * 0.6;
      ctx!.lineCap = 'round';
      ctx!.strokeStyle = TXT; ctx!.lineWidth = 5;
      ctx!.beginPath(); ctx!.moveTo(-6, 0); ctx!.lineTo(-8 + ls, -42); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(6, 0); ctx!.lineTo(8 - ls, -42); ctx!.stroke();
      ctx!.lineWidth = 6;
      ctx!.beginPath(); ctx!.moveTo(0, -42); ctx!.lineTo(0, -82); ctx!.stroke();
      ctx!.lineWidth = 4;
      ctx!.beginPath(); ctx!.moveTo(0, -68); ctx!.lineTo(-22 + as2, -48); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(0, -68); ctx!.lineTo(22 - as2, -48); ctx!.stroke();
      ctx!.fillStyle = TXT;
      ctx!.beginPath(); ctx!.arc(0, -98, 18, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = BG;
      ctx!.beginPath(); ctx!.arc(-6, -100, 2.5, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(6, -100, 2.5, 0, Math.PI * 2); ctx!.fill();
      ctx!.strokeStyle = BG; ctx!.lineWidth = 2.5;
      ctx!.beginPath();
      if (mood === 'happy') ctx!.arc(0, -92, 7, 0, Math.PI);
      else if (mood === 'sad') ctx!.arc(0, -86, 7, Math.PI, 0);
      else { ctx!.moveTo(-5, -92); ctx!.lineTo(5, -92); }
      ctx!.stroke();
      ctx!.restore();
    }

    function drawGym(cx: number, bottom: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      const w = 172, h = 200, x = cx - w / 2, y = bottom - h;
      rr(x, y, w, h, 3, BG2, GRN, 2);
      ctx!.fillStyle = GRN; ctx!.fillRect(x - 10, y - 8, w + 20, 10);
      [28, 76, 124].forEach((px) => rr(x + px, y + 14, 12, h - 52, 0, BDR));
      rr(cx - 20, bottom - 52, 40, 52, 0, BG, BRT, 1.5);
      rr(cx - 54, y - 34, 108, 26, 3, BG2, GLD, 1);
      ctx!.fillStyle = GLD; ctx!.font = 'bold 10px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('₹30,000 / year', cx, y - 17);
      ctx!.restore();
    }

    function drawCalendar(x: number, y: number, month: string, dots: number[], al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      const w = 195, h = 225;
      rr(x, y, w, h, 4, BG2, BDR);
      ctx!.fillStyle = GRN;
      ctx!.beginPath();
      ctx!.moveTo(x + 4, y); ctx!.lineTo(x + w - 4, y);
      ctx!.quadraticCurveTo(x + w, y, x + w, y + 4); ctx!.lineTo(x + w, y + 33);
      ctx!.lineTo(x, y + 33); ctx!.lineTo(x, y + 4);
      ctx!.quadraticCurveTo(x, y, x + 4, y); ctx!.closePath(); ctx!.fill();
      ctx!.fillStyle = TXT; ctx!.font = 'bold 12px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText(month, x + w / 2, y + 21);
      const cw = w / 7, ch = (h - 33) / 6;
      ctx!.fillStyle = DIM; ctx!.font = '8px monospace';
      ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => ctx!.fillText(d, x + i * cw + cw / 2, y + 47));
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 7; c++) {
          const idx = r * 7 + c, val = dots[idx] || 0;
          if (val > 0) {
            const dx = x + c * cw + cw / 2, dy = y + 33 + ch + r * ch + ch / 2;
            ctx!.save(); ctx!.globalAlpha = al * val;
            ctx!.strokeStyle = BRT; ctx!.lineWidth = 2; ctx!.lineCap = 'round';
            ctx!.beginPath();
            ctx!.moveTo(dx - 5, dy); ctx!.lineTo(dx - 2, dy + 5); ctx!.lineTo(dx + 6, dy - 5); ctx!.stroke();
            ctx!.restore();
          }
        }
      }
      ctx!.restore();
    }

    function drawCoin(x: number, y: number, r: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      ctx!.beginPath(); ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fillStyle = GLD; ctx!.fill();
      ctx!.strokeStyle = '#7a5c00'; ctx!.lineWidth = 1; ctx!.stroke();
      ctx!.fillStyle = BG2; ctx!.font = `bold ${r < 10 ? 8 : r}px monospace`;
      ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle';
      ctx!.fillText('₹', x, y);
      ctx!.textBaseline = 'alphabetic';
      ctx!.restore();
    }

    function drawPhone(cx: number, cy: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      const w = 132, h = 252, rx = cx - w / 2, ry = cy - h / 2;
      rr(rx, ry, w, h, 16, BG2, BRT, 2);
      rr(rx + 7, ry + 23, w - 14, h - 46, 8, BG);
      rr(cx - 18, ry + 8, 36, 9, 4, BDR);
      ctx!.fillStyle = BRT; ctx!.font = 'bold 11px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('Phool Gobhi', cx, ry + 56);
      ctx!.fillStyle = DIM; ctx!.font = '8px monospace';
      ctx!.fillText('Pay-per-Session Fitness', cx, ry + 70);
      ctx!.strokeStyle = BDR; ctx!.lineWidth = 1;
      ctx!.beginPath(); ctx!.moveTo(rx + 7, ry + 80); ctx!.lineTo(rx + w - 7, ry + 80); ctx!.stroke();
      rr(rx + 10, ry + 90, w - 20, 52, 4, BDR);
      ctx!.fillStyle = TXT; ctx!.font = '9px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('FitZone · Gurugram', cx, ry + 107);
      ctx!.fillStyle = DIM; ctx!.font = '8px monospace';
      ctx!.fillText('09:00 AM · 1 slot available', cx, ry + 120);
      ctx!.fillStyle = GLD; ctx!.font = 'bold 9px monospace';
      ctx!.fillText('₹299 / session', cx, ry + 134);
      rr(cx - 44, ry + 155, 88, 26, 4, GRN);
      ctx!.fillStyle = TXT; ctx!.font = 'bold 10px monospace';
      ctx!.fillText('Book Session', cx, ry + 173);
      ctx!.restore();
    }

    function drawCheck(cx: number, cy: number, size: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      ctx!.strokeStyle = BRT; ctx!.lineWidth = size * 0.14;
      ctx!.lineCap = 'round'; ctx!.lineJoin = 'round';
      ctx!.beginPath();
      ctx!.moveTo(cx - size * 0.42, cy + size * 0.02);
      ctx!.lineTo(cx - size * 0.1, cy + size * 0.38);
      ctx!.lineTo(cx + size * 0.52, cy - size * 0.38);
      ctx!.stroke();
      ctx!.restore();
    }

    function s1(t: number) {
      drawBg();
      drawGym(590, 370, ease(prog(t, 0, 0.5)));
      const px = lerp(70, 390, ease(prog(t, 0, 0.75)));
      const walking = t < 0.75;
      drawPerson(px, 370, 1, walking ? 'ok' : 'happy', walking ? t * 12 : 0, ease(prog(t, 0, 0.25)));
      if (t > 0.72) {
        const rt = ease(prog(t, 0.72, 1));
        ctx!.globalAlpha = rt;
        ctx!.fillStyle = GLD; ctx!.font = 'bold 17px monospace'; ctx!.textAlign = 'center';
        ctx!.fillText('Membership Activated! ✔', 400, lerp(355, 300, rt));
        ctx!.globalAlpha = 1;
      }
      ctx!.globalAlpha = ease(prog(t, 0.1, 0.5));
      ctx!.fillStyle = DIM; ctx!.font = '11px monospace'; ctx!.textAlign = 'left';
      ctx!.fillText('January 2025', 30, 34);
      ctx!.globalAlpha = 1;
    }

    function s2(t: number) {
      drawBg();
      ctx!.fillStyle = DIM; ctx!.font = '11px monospace'; ctx!.textAlign = 'left';
      ctx!.fillText('January 2025', 30, 34);
      const activeDays = [0, 2, 4, 6, 8, 9, 10, 12, 13, 15, 16, 17, 19, 20, 23];
      const visible = Math.round(t * activeDays.length);
      const dots = Array.from({ length: 35 }, (_, i) => {
        const pos = activeDays.indexOf(i); return pos !== -1 && pos < visible ? 1 : 0;
      });
      drawCalendar(55, 70, 'JANUARY', dots, 1);
      drawPerson(548, 370, 1.05, 'happy', t * 10, 1);
      rr(478, 373, 138, 11, 2, BDR, GRN);
      ctx!.strokeStyle = GRN; ctx!.lineWidth = 3; ctx!.lineCap = 'round';
      ctx!.beginPath(); ctx!.moveTo(488, 373); ctx!.lineTo(484, 330); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(606, 373); ctx!.lineTo(610, 330); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(484, 330); ctx!.lineTo(610, 330); ctx!.stroke();
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 + t * 4;
        const ex = 548 + Math.cos(ang) * 58, ey = 260 + Math.sin(ang) * 36;
        ctx!.save(); ctx!.globalAlpha = 0.3 + 0.3 * Math.sin(t * 5 + i);
        ctx!.strokeStyle = BRT; ctx!.lineWidth = 2;
        ctx!.beginPath(); ctx!.moveTo(ex, ey);
        ctx!.lineTo(ex + Math.cos(ang) * 14, ey + Math.sin(ang) * 14); ctx!.stroke();
        ctx!.restore();
      }
    }

    function s3(t: number) {
      drawBg();
      const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY'];
      const mi = Math.min(4, Math.floor(t * 5.4));
      const density = Math.max(0, 1 - mi * 0.26);
      const allDays = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
      const maxC = Math.round(allDays.length * density);
      const dots = Array.from({ length: 35 }, (_, i) => {
        const pos = allDays.indexOf(i); return pos !== -1 && pos < maxC ? 1 : 0;
      });
      drawCalendar(55, 70, MONTHS[mi], dots, 1);
      ctx!.fillStyle = DIM; ctx!.font = '11px monospace'; ctx!.textAlign = 'left';
      const mn = MONTHS[mi]; ctx!.fillText(mn.charAt(0) + mn.slice(1).toLowerCase() + ' 2025', 30, 34);
      const mood = t < 0.3 ? 'ok' : 'sad';
      drawPerson(548, 370, 1, mood, t < 0.25 ? t * 8 : 0, 1);
      for (let ci = 0; ci < 8; ci++) {
        const phase = (ci / 8 + t * 0.9) % 1;
        const coinX = lerp(95, 680, phase);
        const coinY = 405 - phase * 55 + Math.sin(phase * Math.PI * 3) * 10;
        drawCoin(coinX, coinY, 9, Math.sin(phase * Math.PI) * 0.85);
      }
      ctx!.globalAlpha = ease(prog(t, 0.5, 0.8));
      ctx!.fillStyle = GLD; ctx!.font = '10px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('₹₹₹  Membership fees keep running...', W / 2, 430);
      ctx!.globalAlpha = 1;
    }

    function s4(t: number) {
      drawBg();
      ctx!.textAlign = 'center';
      ctx!.globalAlpha = ease(prog(t, 0, 0.28));
      ctx!.fillStyle = DIM; ctx!.font = 'bold 38px monospace';
      ctx!.fillText('11 months paid.', W / 2, 105);
      ctx!.globalAlpha = ease(prog(t, 0.22, 0.48));
      ctx!.fillStyle = TXT; ctx!.font = 'bold 46px monospace';
      ctx!.fillText('3 visits.', W / 2, 195);
      ctx!.globalAlpha = ease(prog(t, 0.44, 0.68));
      ctx!.fillStyle = GLD; ctx!.font = 'bold 31px monospace';
      ctx!.fillText('₹10,000 per visit.', W / 2, 280);
      ctx!.globalAlpha = ease(prog(t, 0.64, 0.88));
      ctx!.fillStyle = DIM; ctx!.font = '16px monospace';
      ctx!.fillText('You paid for a year of guilt.', W / 2, 365);
      ctx!.globalAlpha = 1;
      drawPerson(710, 410, 0.72, 'sad', 0, ease(prog(t, 0.15, 0.4)));
      if (t > 0.4) {
        ctx!.save();
        ctx!.globalAlpha = ease(prog(t, 0.4, 0.65));
        rr(650, 330, 72, 40, 4, BG2, DIM, 1);
        ctx!.fillStyle = DIM; ctx!.font = '9px monospace'; ctx!.textAlign = 'center';
        ctx!.fillText('WALLET', 686, 350); ctx!.fillText('₹ 0', 686, 364);
        ctx!.restore();
      }
    }

    function s5(t: number) {
      drawBg();
      ctx!.textAlign = 'center';
      ctx!.globalAlpha = ease(prog(t, 0, 0.3));
      ctx!.fillStyle = DIM; ctx!.font = 'bold 12px monospace';
      ctx!.fillText("INSIDE THE GYM'S BUSINESS MODEL", W / 2, 35);
      ctx!.globalAlpha = 1;
      for (let ti = 0; ti < 8; ti++) {
        const tx = 58 + ti * 88;
        ctx!.save(); ctx!.globalAlpha = ease(prog(t, ti * 0.04, ti * 0.04 + 0.32));
        rr(tx, 168, 50, 11, 2, BDR, GRN);
        ctx!.strokeStyle = GRN; ctx!.lineWidth = 3; ctx!.lineCap = 'round';
        ctx!.beginPath(); ctx!.moveTo(tx + 8, 168); ctx!.lineTo(tx + 4, 130); ctx!.stroke();
        ctx!.beginPath(); ctx!.moveTo(tx + 42, 168); ctx!.lineTo(tx + 46, 130); ctx!.stroke();
        ctx!.beginPath(); ctx!.moveTo(tx + 4, 130); ctx!.lineTo(tx + 46, 130); ctx!.stroke();
        ctx!.restore();
      }
      const sa = ease(prog(t, 0.38, 0.72));
      ctx!.globalAlpha = sa;
      rr(52, 246, 248, 82, 4, BG2, GRN);
      ctx!.fillStyle = BRT; ctx!.font = 'bold 30px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('2,000', 176, 290);
      ctx!.fillStyle = DIM; ctx!.font = '11px monospace';
      ctx!.fillText('members enrolled', 176, 310);
      rr(500, 246, 248, 82, 4, BG2, '#88222288');
      ctx!.fillStyle = '#E74C3C'; ctx!.font = 'bold 30px monospace';
      ctx!.fillText('200', 624, 290);
      ctx!.fillStyle = DIM; ctx!.font = '11px monospace';
      ctx!.fillText('gym capacity', 624, 310);
      ctx!.strokeStyle = GLD; ctx!.lineWidth = 1.5;
      ctx!.beginPath(); ctx!.moveTo(308, 287); ctx!.lineTo(492, 287); ctx!.stroke();
      ctx!.fillStyle = GLD; ctx!.font = 'bold 11px monospace';
      ctx!.fillText('10×', 400, 284);
      ctx!.globalAlpha = 1;
      ctx!.globalAlpha = ease(prog(t, 0.68, 1));
      ctx!.fillStyle = DIM; ctx!.font = '13px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('“The model works because most people don’t show up.”', W / 2, 398);
      ctx!.globalAlpha = 1;
    }

    function s6(t: number) {
      drawBg();
      const grd = ctx!.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 320);
      grd.addColorStop(0, 'rgba(61,139,94,0.09)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = grd; ctx!.fillRect(0, 0, W, H);

      ctx!.globalAlpha = ease(prog(t, 0, 0.32));
      ctx!.fillStyle = BRT; ctx!.font = 'bold 26px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('Phool Gobhi', W / 2, 42);
      ctx!.fillStyle = DIM; ctx!.font = '11px monospace';
      ctx!.fillText('The pay-per-session gym marketplace', W / 2, 62);
      ctx!.globalAlpha = 1;

      drawPhone(W / 2, 235, ease(prog(t, 0.1, 0.5)));

      const pA = ease(prog(t, 0.4, 0.65));
      const pX = lerp(85, 215, ease(prog(t, 0.4, 0.88)));
      drawPerson(pX, 402, 0.82, 'happy', t * 6, pA);

      ctx!.save(); ctx!.globalAlpha = ease(prog(t, 0.32, 0.62));
      rr(668, 278, 92, 112, 4, BG2, BRT, 2);
      ctx!.fillStyle = BRT; ctx!.font = 'bold 10px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('GYM', 714, 298);
      rr(695, 344, 32, 46, 2, BG, BRT, 1.5);
      ctx!.restore();

      if (t > 0.6) {
        const ckA = ease(prog(t, 0.6, 0.84));
        ctx!.save(); ctx!.globalAlpha = ckA * 0.12;
        ctx!.beginPath(); ctx!.arc(W / 2, 382, 42, 0, Math.PI * 2);
        ctx!.fillStyle = BRT; ctx!.fill();
        ctx!.restore();
        drawCheck(W / 2, 382, 58, ckA);
      }

      ctx!.globalAlpha = ease(prog(t, 0.84, 1));
      ctx!.fillStyle = BRT; ctx!.font = 'bold 13px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('No lock-in. No guilt. Just fitness.', W / 2, 440);
      ctx!.globalAlpha = 1;
    }

    function updateSub(elapsed: number) {
      const el = subTextRef.current;
      if (!el) return;
      for (const scene of SCENES) {
        if (elapsed >= scene.t0 && elapsed < scene.t1) { el.textContent = scene.sub; return; }
      }
      if (elapsed >= TOTAL) el.textContent = 'The problem is real. The solution is Phool Gobhi.';
    }

    function render(ts: number) {
      if (!isRunning) return;
      if (!startTs) startTs = ts;
      const elapsed = (ts - startTs) / 1000, t = Math.min(elapsed, TOTAL);
      const si = t < 5 ? 0 : t < 9 ? 1 : t < 16 ? 2 : t < 21 ? 3 : t < 26 ? 4 : 5;
      if (si !== lastSceneIdx) {
        sceneSound(si); lastSceneIdx = si;
        if (si === 3) s4played = [false, false, false, false];
        if (si === 5) ckPlayed = false;
      }
      if (t < 5) s1(prog(t, 0, 5));
      else if (t < 9) s2(prog(t, 5, 9));
      else if (t < 16) s3(prog(t, 9, 16));
      else if (t < 21) s4(prog(t, 16, 21));
      else if (t < 26) s5(prog(t, 21, 26));
      else s6(prog(t, 26, 30));
      if (si === 2 && elapsed - coinTimer > 1.6) { playCoin(); coinTimer = elapsed; }
      if (si === 3) {
        const lt = prog(t, 16, 21);
        if (!s4played[0] && lt > 0.05) { playThud(); s4played[0] = true; }
        if (!s4played[1] && lt > 0.22) { playThud(); s4played[1] = true; }
        if (!s4played[2] && lt > 0.42) { playThud(); s4played[2] = true; }
        if (!s4played[3] && lt > 0.62) { playThud(); s4played[3] = true; }
      }
      if (si === 5 && !ckPlayed && prog(t, 26, 30) > 0.62) { playCheck(); ckPlayed = true; }
      updateSub(elapsed);
      if (barRef.current) barRef.current.style.width = Math.min(100, (t / TOTAL) * 100) + '%';
      if (t < TOTAL) {
        rafId = requestAnimationFrame(render);
      } else {
        isRunning = false; stopDrone();
        if (playBtn) playBtn.textContent = '↺  Replay';
      }
    }

    function play() {
      cancelAnimationFrame(rafId);
      isRunning = true; startTs = null; lastSceneIdx = -1;
      coinTimer = -99; s4played = [false, false, false, false]; ckPlayed = false;
      if (!isMuted) startDrone();
      if (playBtn) playBtn.textContent = '▶  Playing...';
      rafId = requestAnimationFrame(render);
    }

    function drawIdle() {
      drawBg();
      ctx!.fillStyle = DIM; ctx!.font = '13px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('▶  Press Play to watch the story unfold', W / 2, H / 2 - 12);
      ctx!.fillStyle = BDR; ctx!.font = '10px monospace';
      ctx!.fillText('30 seconds • 6 scenes • the full problem', W / 2, H / 2 + 14);
    }

    function resize() {
      const maxW = cv!.parentElement ? cv!.parentElement.clientWidth : W;
      cv!.style.width = maxW + 'px';
      cv!.style.height = Math.round((maxW * H) / W) + 'px';
    }

    function handleMuteClick() {
      isMuted = !isMuted;
      muteBtn!.textContent = isMuted ? '🔇' : '🔊';
      if (isMuted) stopDrone(); else if (isRunning) startDrone();
    }

    function isFS() {
      return !!document.fullscreenElement;
    }
    function enterFS() {
      wrap!.requestFullscreen?.();
    }
    function exitFS() {
      document.exitFullscreen?.();
    }
    function toggleFS() {
      if (isFS()) exitFS(); else enterFS();
    }
    function handleFsChange() {
      if (fsBtn) fsBtn.textContent = isFS() ? '✕' : '⛶';
    }

    playBtn.addEventListener('click', play);
    muteBtn.addEventListener('click', handleMuteClick);
    fsBtn.addEventListener('click', toggleFS);
    cv.addEventListener('click', toggleFS);
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('resize', resize);

    drawIdle();
    resize();

    return () => {
      cancelAnimationFrame(rafId);
      stopDrone();
      window.removeEventListener('resize', resize);
      playBtn.removeEventListener('click', play);
      muteBtn.removeEventListener('click', handleMuteClick);
      fsBtn.removeEventListener('click', toggleFS);
      cv.removeEventListener('click', toggleFS);
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (AC) AC.close().catch(() => {});
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative bg-[#08150E] border border-gray-800 rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} width={800} height={450} className="block w-full h-auto cursor-pointer" />
      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 border-t border-gray-800">
        <button
          ref={playBtnRef}
          type="button"
          className="px-4 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xs uppercase tracking-wide rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shrink-0"
        >
          {'▶  Play Story'}
        </button>
        <button
          ref={muteBtnRef}
          type="button"
          aria-label="Mute"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors shrink-0"
        >
          {'🔊'}
        </button>
        <button
          ref={fsBtnRef}
          type="button"
          title="Fullscreen"
          aria-label="Fullscreen"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors shrink-0"
        >
          {'⛶'}
        </button>
        <p ref={subTextRef} className="flex-1 text-xs sm:text-sm italic text-gray-400 min-h-[1.2em]">
          A 30-second animated story about why gym memberships are broken.
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
        <div ref={barRef} className="h-full bg-emerald-500 transition-[width] duration-150 ease-linear" style={{ width: '0%' }} />
      </div>
    </div>
  );
}
