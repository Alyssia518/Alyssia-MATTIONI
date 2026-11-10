const burger = document.getElementById('burgerBtn');
const overlay = document.getElementById('navOverlay');

// ---- motif organique, repris tel quel de la page d'accueil ----
function drawOrganicMotif(svgId, W, H, opts) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STRANDS = opts.strands;
  const BUBBLES = opts.bubbles;
  const convergeY = opts.convergeY;
  const convergeStrength = opts.convergeStrength;

  const signalStrands = new Set();
  for (let s = 0; s < STRANDS; s++) {
    if (s % 3 === 1) signalStrands.add(s);
  }

  for (let s = 0; s < STRANDS; s++) {
    let x = -10;
    let y = 15 + Math.random() * (H - 30);
    let angle = 0;
    const points = [`M${x.toFixed(1)},${y.toFixed(1)}`];

    while (x < W + 10) {
      const stepLen = 14 + Math.random() * 10;
      angle += (Math.random() - 0.5) * 0.8;
      angle = Math.max(-1.1, Math.min(1.1, angle));
      x += Math.cos(angle) * stepLen;
      y += Math.sin(angle) * stepLen;
      y = Math.max(6, Math.min(H - 6, y));

      const pull = Math.exp(-((x - W / 2) ** 2) / (W * 43)) * convergeStrength;
      y = y * (1 - pull) + convergeY * pull;

      points.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
    }

    const d = points.join(' ');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke-width', (0.55 + Math.random() * 0.25).toFixed(2));
    path.setAttribute('opacity', (0.85 + Math.random() * 0.15).toFixed(2));
    if (signalStrands.has(s)) path.setAttribute('stroke-dasharray', '2.5 4');
    svg.appendChild(path);

    if (signalStrands.has(s) && !reduceMotion) {
      const signal = document.createElementNS(svgNS, 'path');
      signal.setAttribute('d', 'M0,0 L1.9,-2.3 A3,3 0 1,0 1.9,2.3 Z');
      signal.setAttribute('class', 'is-dot');
      signal.setAttribute('opacity', '0.85');
      const anim = document.createElementNS(svgNS, 'animateMotion');
      anim.setAttribute('dur', `${3.5 + Math.random()}s`);
      anim.setAttribute('repeatCount', 'indefinite');
      anim.setAttribute('rotate', 'auto');
      anim.setAttribute('path', d);
      signal.appendChild(anim);
      svg.appendChild(signal);
    }
  }

  for (let i = 0; i < BUBBLES; i++) {
    const cx = Math.random() * W;
    let cy = 8 + Math.random() * (H - 16);
    const pull = Math.exp(-((cx - W / 2) ** 2) / (W * 43)) * (convergeStrength * 0.8);
    cy = cy * (1 - pull) + convergeY * pull;
    const r = opts.pacman ? 4 + Math.random() * 11 : 1.5 + Math.random() * 9;
    const isDot = Math.random() < (opts.pacman ? 0.6 : 0.3);

    if (opts.pacman && isDot) {
      const facing = Math.random() * Math.PI * 2;
      const mouth = (40 + Math.random() * 15) * (Math.PI / 180);
      const a1 = facing - mouth;
      const a2 = facing + mouth;
      const p1x = cx + Math.cos(a1) * r;
      const p1y = cy + Math.sin(a1) * r;
      const p2x = cx + Math.cos(a2) * r;
      const p2y = cy + Math.sin(a2) * r;
      const pac = document.createElementNS(svgNS, 'path');
      pac.setAttribute('d', `M${cx.toFixed(1)},${cy.toFixed(1)} L${p1x.toFixed(1)},${p1y.toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${p2x.toFixed(1)},${p2y.toFixed(1)} Z`);
      pac.setAttribute('class', 'is-dot');
      pac.setAttribute('opacity', (0.88 + Math.random() * 0.12).toFixed(2));
      svg.appendChild(pac);
      continue;
    }

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', cx.toFixed(1));
    circle.setAttribute('cy', cy.toFixed(1));
    circle.setAttribute('r', r.toFixed(1));
    circle.setAttribute('stroke-width', isDot ? '0' : (0.55 + Math.random() * 0.3).toFixed(2));
    circle.setAttribute('opacity', (0.8 + Math.random() * 0.2).toFixed(2));
    if (isDot) circle.setAttribute('class', 'is-dot');
    svg.appendChild(circle);
  }
}

function generateNavMotif() {
  const W = Math.max(280, window.innerWidth);
  const H = Math.max(260, window.innerHeight);
  drawOrganicMotif('navMotif', W, H, {
    strands: 7,
    bubbles: 18,
    convergeY: H * 0.5,
    convergeStrength: 0.2,
    pacman: true,
  });
}

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  overlay.classList.toggle('open');
  if (overlay.classList.contains('open')) generateNavMotif();
});

async function copyEmail(feedbackEl) {
  try {
    await navigator.clipboard.writeText('alyssia.mattioni@gmail.com');
    if (feedbackEl) {
      feedbackEl.classList.add('visible');
      setTimeout(() => feedbackEl.classList.remove('visible'), 1600);
    }
  } catch (err) {
    window.prompt('Copie l\'adresse :', 'alyssia.mattioni@gmail.com');
  }
}

const copyFeedback = document.getElementById('copyFeedback');
document.getElementById('mailRow').addEventListener('click', () => copyEmail(copyFeedback));