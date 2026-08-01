'use client';

import { useEffect, useRef } from 'react';

interface Scene {
  t0: number;
  t1: number;
  sub: string;
}

const SCENES: Scene[] = [
  { t0: 0, t1: 3.2, sub: 'Your gym has empty hours every single day.' },
  { t0: 3.2, t1: 6.6, sub: 'Nearby, someone opens Phool Gobhi looking for one session — not a 12-month contract.' },
  { t0: 6.6, t1: 10.6, sub: 'They book, walk in, and scan a QR code to check in.' },
  { t0: 10.6, t1: 14.6, sub: 'You keep 80% of every session — credited to your wallet automatically.' },
  { t0: 14.6, t1: 18, sub: 'No listing fee. No monthly cost. Just more people walking through your door.' },
];
const TOTAL = 18;

export default function PartnerStoryAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const fsBtnRef = useRef<HTMLButtonElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    const playBtn = playBtnRef.current;
    const fsBtn = fsBtnRef.current;
    if (!cv || !wrap || !playBtn || !fsBtn) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const W = 800, H = 450;
    let isRunning = false;
    let startTs: number | null = null;
    let rafId = 0;

    const BG = '#08150E', BG2 = '#0F2318', BDR = '#1C3D28';
    const GRN = '#3D8B5E', BRT = '#5EBB80', TXT = '#DCF0E5';
    const DIM = '#8AAD96', GLD = '#D4A843', TER = '#E0755A';

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

    function drawGymFloor(al: number, litUp: number) {
      ctx!.save();
      ctx!.globalAlpha = al;
      rr(90, 130, 620, 260, 10, BG2, BDR, 2);
      // three equipment silhouettes that go from dim (idle) to lit (in use)
      [220, 400, 580].forEach((cx, i) => {
        const lit = clamp(litUp - i * 0.18, 0, 1);
        ctx!.save();
        ctx!.globalAlpha = al;
        rr(cx - 46, 200, 92, 130, 6, BG, lit > 0.05 ? BRT : BDR, lit > 0.05 ? 2 : 1.5);
        ctx!.strokeStyle = lit > 0.05 ? BRT : DIM;
        ctx!.lineWidth = 3;
        ctx!.beginPath(); ctx!.moveTo(cx, 210); ctx!.lineTo(cx, 320); ctx!.stroke();
        ctx!.beginPath(); ctx!.moveTo(cx - 24, 250); ctx!.lineTo(cx + 24, 250); ctx!.stroke();
        if (lit > 0.05) {
          ctx!.save(); ctx!.globalAlpha = al * lit;
          ctx!.fillStyle = GLD;
          ctx!.beginPath(); ctx!.arc(cx, 190, 4, 0, Math.PI * 2); ctx!.fill();
          ctx!.restore();
        }
        ctx!.restore();
      });
      ctx!.restore();
    }

    function drawClock(cx: number, cy: number, spin: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = al;
      ctx!.beginPath(); ctx!.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx!.strokeStyle = DIM; ctx!.lineWidth = 2; ctx!.stroke();
      ctx!.strokeStyle = TXT; ctx!.lineWidth = 2; ctx!.lineCap = 'round';
      const a1 = spin * Math.PI * 2, a2 = spin * Math.PI * 0.4;
      ctx!.beginPath(); ctx!.moveTo(cx, cy); ctx!.lineTo(cx + Math.sin(a1) * 14, cy - Math.cos(a1) * 14); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(cx, cy); ctx!.lineTo(cx + Math.sin(a2) * 9, cy - Math.cos(a2) * 9); ctx!.stroke();
      ctx!.restore();
    }

    function drawPin(cx: number, cy: number, al: number, label: string) {
      ctx!.save();
      ctx!.globalAlpha = al;
      ctx!.fillStyle = TER;
      ctx!.beginPath();
      ctx!.arc(cx, cy, 11, Math.PI * 0.15, Math.PI * 0.85, true);
      ctx!.lineTo(cx, cy + 22);
      ctx!.closePath();
      ctx!.fill();
      ctx!.fillStyle = BG;
      ctx!.beginPath(); ctx!.arc(cx, cy - 2, 4, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = DIM; ctx!.font = '10px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText(label, cx, cy + 38);
      ctx!.restore();
    }

    function drawPhone(cx: number, cy: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      const w = 140, h = 264, rx = cx - w / 2, ry = cy - h / 2;
      rr(rx, ry, w, h, 16, BG2, BRT, 2);
      rr(rx + 7, ry + 22, w - 14, h - 44, 8, BG);
      rr(cx - 18, ry + 8, 36, 9, 4, BDR);
      ctx!.fillStyle = BRT; ctx!.font = 'bold 11px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('Phool Gobhi', cx, ry + 55);
      ctx!.restore();
    }

    function drawListingCard(cx: number, topY: number, al: number) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      const w = 118, h = 96, x = cx - w / 2;
      rr(x, topY, w, h, 5, BDR);
      ctx!.fillStyle = TXT; ctx!.font = '9px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('FitZone · 800m', cx, topY + 20);
      ctx!.fillStyle = DIM; ctx!.font = '8px monospace';
      ctx!.fillText('7:00 PM · 1 slot left', cx, topY + 36);
      ctx!.fillStyle = GLD; ctx!.font = 'bold 10px monospace';
      ctx!.fillText('₹299 / session', cx, topY + 54);
      rr(cx - 38, topY + 64, 76, 22, 4, GRN);
      ctx!.fillStyle = TXT; ctx!.font = 'bold 9px monospace';
      ctx!.fillText('Book Session', cx, topY + 79);
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

    function drawPerson(cx: number, fy: number, walk: number, al = 1) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      ctx!.translate(cx, fy);
      const ls = Math.sin(walk) * 16;
      ctx!.lineCap = 'round';
      ctx!.strokeStyle = TXT; ctx!.lineWidth = 5;
      ctx!.beginPath(); ctx!.moveTo(-6, 0); ctx!.lineTo(-7 + ls, -38); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(6, 0); ctx!.lineTo(7 - ls, -38); ctx!.stroke();
      ctx!.lineWidth = 6;
      ctx!.beginPath(); ctx!.moveTo(0, -38); ctx!.lineTo(0, -72); ctx!.stroke();
      ctx!.fillStyle = TXT;
      ctx!.beginPath(); ctx!.arc(0, -86, 15, 0, Math.PI * 2); ctx!.fill();
      ctx!.restore();
    }

    function drawQR(cx: number, cy: number, size: number, al: number) {
      ctx!.save();
      ctx!.globalAlpha = al;
      rr(cx - size / 2, cy - size / 2, size, size, 4, BG2, GLD, 2);
      const cells = 5, cell = size / (cells + 1.6);
      ctx!.fillStyle = GLD;
      for (let r = 0; r < cells; r++) {
        for (let c = 0; c < cells; c++) {
          if ((r * 7 + c * 13) % 3 === 0) {
            ctx!.fillRect(cx - size / 2 + cell * 0.8 + c * cell, cy - size / 2 + cell * 0.8 + r * cell, cell * 0.78, cell * 0.78);
          }
        }
      }
      ctx!.restore();
    }

    function drawWallet(cx: number, cy: number, al: number, label: string, amount: string) {
      ctx!.save();
      ctx!.globalAlpha = al;
      rr(cx - 62, cy - 40, 124, 80, 6, BG2, BRT, 2);
      ctx!.fillStyle = DIM; ctx!.font = '9px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText(label, cx, cy - 16);
      ctx!.fillStyle = GLD; ctx!.font = 'bold 20px monospace';
      ctx!.fillText(amount, cx, cy + 16);
      ctx!.restore();
    }

    function drawCoin(x: number, y: number, r: number, al: number) {
      ctx!.save();
      ctx!.globalAlpha = clamp(al, 0, 1);
      ctx!.beginPath(); ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fillStyle = GLD; ctx!.fill();
      ctx!.strokeStyle = '#7a5c00'; ctx!.lineWidth = 1; ctx!.stroke();
      ctx!.fillStyle = BG2; ctx!.font = `bold ${Math.max(8, r)}px monospace`;
      ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle';
      ctx!.fillText('₹', x, y);
      ctx!.textBaseline = 'alphabetic';
      ctx!.restore();
    }

    // ── Scene 1: the empty gym ───────────────────────────
    function s1(t: number) {
      drawBg();
      ctx!.textAlign = 'left';
      ctx!.globalAlpha = ease(prog(t, 0, 0.3));
      ctx!.fillStyle = DIM; ctx!.font = 'bold 11px monospace';
      ctx!.fillText('YOUR GYM · 3:00 PM WEEKDAY', 90, 105);
      ctx!.globalAlpha = 1;
      drawGymFloor(ease(prog(t, 0.05, 0.4)), 0);
      drawClock(690, 165, t * 0.15, ease(prog(t, 0.2, 0.5)));
      ctx!.globalAlpha = ease(prog(t, 0.55, 0.9));
      ctx!.fillStyle = TER; ctx!.font = 'bold 15px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('68% of slots sit empty — every single weekday', W / 2, 425);
      ctx!.globalAlpha = 1;
    }

    // ── Scene 2: nearby customer opens the app ───────────
    function s2(t: number) {
      drawBg();
      ctx!.textAlign = 'left';
      ctx!.fillStyle = DIM; ctx!.font = 'bold 11px monospace';
      ctx!.globalAlpha = ease(prog(t, 0, 0.2));
      ctx!.fillText('800m FROM YOUR GYM', 90, 60);
      ctx!.globalAlpha = 1;
      drawPin(150, 130, ease(prog(t, 0, 0.35)), 'Customer');
      drawPin(600, 150, ease(prog(t, 0.1, 0.4)), 'Your gym');
      ctx!.save();
      ctx!.globalAlpha = ease(prog(t, 0.15, 0.4));
      ctx!.strokeStyle = BRT; ctx!.lineWidth = 1.5; ctx!.setLineDash([5, 6]);
      ctx!.beginPath(); ctx!.moveTo(160, 152); ctx!.lineTo(590, 168); ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.restore();
      drawPhone(W / 2, 300, ease(prog(t, 0.3, 0.6)));
      drawListingCard(W / 2, 200, ease(prog(t, 0.45, 0.8)));
    }

    // ── Scene 3: book, walk in, scan QR ──────────────────
    function s3(t: number) {
      drawBg();
      drawCheck(W / 2, 90, 34, ease(prog(t, 0, 0.22)));
      ctx!.globalAlpha = ease(prog(t, 0.05, 0.25));
      ctx!.fillStyle = BRT; ctx!.font = 'bold 12px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('Booking confirmed', W / 2, 130);
      ctx!.globalAlpha = 1;

      const walkT = prog(t, 0.25, 0.75);
      const px = lerp(90, 560, ease(walkT));
      drawPerson(px, 340, walkT < 1 ? t * 14 : 0, ease(prog(t, 0.22, 0.4)));
      rr(560, 190, 150, 200, 8, BG2, BDR, 2);
      ctx!.save();
      ctx!.globalAlpha = ease(prog(t, 0.25, 0.5));
      ctx!.fillStyle = DIM; ctx!.font = '10px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('FitZone entrance', 635, 210);
      ctx!.restore();
      drawQR(635, 280, 84, ease(prog(t, 0.55, 0.85)));
      ctx!.globalAlpha = ease(prog(t, 0.8, 1));
      ctx!.fillStyle = GLD; ctx!.font = 'bold 10px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('Checked in ✔', 635, 400);
      ctx!.globalAlpha = 1;
    }

    // ── Scene 4: the payout split ─────────────────────────
    function s4(t: number) {
      drawBg();
      ctx!.textAlign = 'center';
      ctx!.globalAlpha = ease(prog(t, 0, 0.2));
      ctx!.fillStyle = DIM; ctx!.font = 'bold 11px monospace';
      ctx!.fillText('SESSION COMPLETE · ₹299', W / 2, 55);
      ctx!.globalAlpha = 1;

      drawCoin(W / 2, 110, 16, ease(prog(t, 0.1, 0.35)));

      const splitA = ease(prog(t, 0.3, 0.55));
      ctx!.save();
      ctx!.globalAlpha = splitA;
      ctx!.strokeStyle = BRT; ctx!.lineWidth = 2.5;
      ctx!.beginPath(); ctx!.moveTo(W / 2, 130); ctx!.lineTo(300, 230); ctx!.stroke();
      ctx!.strokeStyle = TER;
      ctx!.beginPath(); ctx!.moveTo(W / 2, 130); ctx!.lineTo(520, 230); ctx!.stroke();
      ctx!.restore();

      drawWallet(280, 300, ease(prog(t, 0.45, 0.7)), 'YOUR WALLET · 80%', '₹239');
      ctx!.save();
      ctx!.globalAlpha = ease(prog(t, 0.5, 0.75)) * 0.85;
      rr(520 - 55, 260, 110, 66, 6, BG2, TER, 1.5);
      ctx!.fillStyle = DIM; ctx!.font = '9px monospace';
      ctx!.fillText('PLATFORM · 20%', 520, 288);
      ctx!.fillStyle = TER; ctx!.font = 'bold 15px monospace';
      ctx!.fillText('₹60', 520, 312);
      ctx!.restore();

      ctx!.globalAlpha = ease(prog(t, 0.72, 1));
      ctx!.fillStyle = BRT; ctx!.font = 'bold 13px monospace';
      ctx!.fillText('Credited automatically. No invoices to chase.', W / 2, 400);
      ctx!.globalAlpha = 1;
    }

    // ── Scene 5: the pitch ────────────────────────────────
    function s5(t: number) {
      drawBg();
      const grd = ctx!.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 320);
      grd.addColorStop(0, 'rgba(61,139,94,0.1)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = grd; ctx!.fillRect(0, 0, W, H);

      ctx!.textAlign = 'center';
      ctx!.globalAlpha = ease(prog(t, 0, 0.3));
      ctx!.fillStyle = BRT; ctx!.font = 'bold 26px monospace';
      ctx!.fillText('Phool Gobhi', W / 2, 130);
      ctx!.fillStyle = DIM; ctx!.font = '11px monospace';
      ctx!.fillText('Partner with us', W / 2, 152);
      ctx!.globalAlpha = 1;

      const ck = ease(prog(t, 0.25, 0.55));
      ctx!.save(); ctx!.globalAlpha = ck * 0.12;
      ctx!.beginPath(); ctx!.arc(W / 2, 250, 50, 0, Math.PI * 2);
      ctx!.fillStyle = BRT; ctx!.fill();
      ctx!.restore();
      drawCheck(W / 2, 250, 68, ck);

      ctx!.globalAlpha = ease(prog(t, 0.55, 0.85));
      ctx!.fillStyle = TXT; ctx!.font = 'bold 16px monospace';
      ctx!.fillText('No listing fee. No monthly cost.', W / 2, 340);
      ctx!.globalAlpha = ease(prog(t, 0.65, 0.95));
      ctx!.fillStyle = GLD; ctx!.font = 'bold 14px monospace';
      ctx!.fillText('Just more people walking through your door.', W / 2, 365);
      ctx!.globalAlpha = 1;
    }

    function updateSub(elapsed: number) {
      const el = subTextRef.current;
      if (!el) return;
      for (const scene of SCENES) {
        if (elapsed >= scene.t0 && elapsed < scene.t1) { el.textContent = scene.sub; return; }
      }
      if (elapsed >= TOTAL) el.textContent = SCENES[SCENES.length - 1].sub;
    }

    function render(ts: number) {
      if (!isRunning) return;
      if (!startTs) startTs = ts;
      const elapsed = (ts - startTs) / 1000, t = Math.min(elapsed, TOTAL);
      if (t < 3.2) s1(prog(t, 0, 3.2));
      else if (t < 6.6) s2(prog(t, 3.2, 6.6));
      else if (t < 10.6) s3(prog(t, 6.6, 10.6));
      else if (t < 14.6) s4(prog(t, 10.6, 14.6));
      else s5(prog(t, 14.6, 18));
      updateSub(elapsed);
      if (barRef.current) barRef.current.style.width = Math.min(100, (t / TOTAL) * 100) + '%';
      if (t < TOTAL) {
        rafId = requestAnimationFrame(render);
      } else {
        isRunning = false;
        if (playBtn) playBtn.textContent = '↺  Replay';
      }
    }

    function play() {
      cancelAnimationFrame(rafId);
      isRunning = true; startTs = null;
      if (playBtn) playBtn.textContent = '▶  Playing...';
      rafId = requestAnimationFrame(render);
    }

    function drawIdle() {
      drawBg();
      ctx!.fillStyle = DIM; ctx!.font = '13px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('▶  Press Play to see how a booking becomes a payout', W / 2, H / 2 - 12);
      ctx!.fillStyle = BDR; ctx!.font = '10px monospace';
      ctx!.fillText('18 seconds • 5 scenes • the partner side of the story', W / 2, H / 2 + 14);
    }

    function resize() {
      const maxW = cv!.parentElement ? cv!.parentElement.clientWidth : W;
      cv!.style.width = maxW + 'px';
      cv!.style.height = Math.round((maxW * H) / W) + 'px';
    }

    function isFS() { return !!document.fullscreenElement; }
    function toggleFS() { if (isFS()) document.exitFullscreen?.(); else wrap!.requestFullscreen?.(); }
    function handleFsChange() { if (fsBtn) fsBtn.textContent = isFS() ? '✕' : '⛶'; }

    playBtn.addEventListener('click', play);
    fsBtn.addEventListener('click', toggleFS);
    cv.addEventListener('click', toggleFS);
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('resize', resize);

    drawIdle();
    resize();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      playBtn.removeEventListener('click', play);
      fsBtn.removeEventListener('click', toggleFS);
      cv.removeEventListener('click', toggleFS);
      document.removeEventListener('fullscreenchange', handleFsChange);
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
          ref={fsBtnRef}
          type="button"
          title="Fullscreen"
          aria-label="Fullscreen"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors shrink-0"
        >
          {'⛶'}
        </button>
        <p ref={subTextRef} className="flex-1 text-xs sm:text-sm italic text-gray-400 min-h-[1.2em]">
          An 18-second animated walkthrough of how a booking turns into money in your wallet.
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
        <div ref={barRef} className="h-full bg-emerald-500 transition-[width] duration-150 ease-linear" style={{ width: '0%' }} />
      </div>
    </div>
  );
}
