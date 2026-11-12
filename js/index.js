const loadingContainer = document.getElementById('loadingContainer');
const mainContent = document.getElementById('mainContent');

// On vérifie si on a déjà vu l'animation
const introAlreadyPlayed = sessionStorage.getItem('introPlayed') === 'true';

if (introAlreadyPlayed) {
  loadingContainer.style.display = 'none';
  mainContent.classList.add('show');
  document.body.style.overflow = 'auto';
  initPage();
} else {
  sessionStorage.setItem('introPlayed', 'true');
  
  // SÉCURITÉ : On attend 7 secondes et on force l'affichage
  setTimeout(() => {
    loadingContainer.classList.add('fade-out');
    setTimeout(() => {
      loadingContainer.style.display = 'none';
      mainContent.classList.add('show');
      document.body.style.overflow = 'auto';
      initPage();
    }, 500); 
  }, 7000);
}

// --- TON CODE DE DESSIN COMPLET ---

function drawTrackerConnectors() {
  const wrap = document.getElementById('trackerWrap');
  const hub = document.getElementById('trackerHub');
  const svg = document.getElementById('trackerSvg');
  const nodes = document.querySelectorAll('.tracker-item');
  if (!wrap || !hub || !svg || !nodes.length) return;

  svg.querySelectorAll('path.connector, path.connector-signal').forEach((p) => p.remove());

  const wrapRect = wrap.getBoundingClientRect();
  const hubRect = hub.getBoundingClientRect();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';

  const hubX = hubRect.left + hubRect.width / 2 - wrapRect.left;
  const hubY = hubRect.top + hubRect.height / 2 - wrapRect.top;
  const isMobile = window.innerWidth <= 768;

  nodes.forEach((node, i) => {
    const nodeRect = node.getBoundingClientRect();
    let d;

    if (isMobile) {
      const nodeMidY = nodeRect.top + nodeRect.height / 2 - wrapRect.top;
      const onLeft = i % 2 === 0;
      const spineX = onLeft ? nodeRect.left - wrapRect.left - 16 : nodeRect.right - wrapRect.left + 16;
      const nodeEdgeX = onLeft ? nodeRect.left - wrapRect.left - 3 : nodeRect.right - wrapRect.left + 3;
      d = `M ${hubX} ${hubY} L ${spineX} ${hubY} L ${spineX} ${nodeMidY} L ${nodeEdgeX} ${nodeMidY}`;
    } else {
      const nodeX = nodeRect.left + nodeRect.width / 2 - wrapRect.left;
      const nodeY = nodeRect.top - wrapRect.top - 6;
      const midY = hubY + (nodeY - hubY) * 0.55;
      d = `M ${hubX} ${hubY} L ${hubX} ${midY} L ${nodeX} ${midY} L ${nodeX} ${nodeY}`;
    }

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'connector');
    path.setAttribute('marker-end', 'url(#arrowHead)');
    svg.appendChild(path);

    if (!reduceMotion) {
      const signal = document.createElementNS(svgNS, 'path');
      signal.setAttribute('d', 'M0,0 L2.6,-3.1 A4,4 0 1,0 2.6,3.1 Z');
      signal.setAttribute('class', 'connector-signal');
      const anim = document.createElementNS(svgNS, 'animateMotion');
      anim.setAttribute('dur', '1.8s');
      anim.setAttribute('begin', `${i * 0.25}s`);
      anim.setAttribute('repeatCount', 'indefinite');
      anim.setAttribute('rotate', 'auto');
      anim.setAttribute('path', d);
      signal.appendChild(anim);
      svg.appendChild(signal);
    }
  });
}

// C'est la fonction exacte de la page À propos !
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

  // Plus de flèches ici, juste le tracé pur
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

    // Petits anneaux concentriques
    if (!isDot && Math.random() < 0.3) {
      const inner = document.createElementNS(svgNS, 'circle');
      inner.setAttribute('cx', cx.toFixed(1));
      inner.setAttribute('cy', cy.toFixed(1));
      inner.setAttribute('r', (r * 0.55).toFixed(1));
      inner.setAttribute('stroke-width', '0.5');
      inner.setAttribute('opacity', '0.85');
      svg.appendChild(inner);
    }
  }
}

function generateTrackerMotif() {
  const section = document.getElementById('trackerSection');
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const W = Math.max(280, Math.round(rect.width));
  const H = Math.max(260, Math.round(rect.height));
  const isMobile = window.innerWidth <= 768;
  
  // On utilise EXACTEMENT les réglages de la page À propos
  drawOrganicMotif('trackerMotif', W, H, {
    strands: 7,
    bubbles: 18,
    convergeY: H * 0.5,
    convergeStrength: 0.2,
    pacman: true,
  });
}

function generateBackgroundMotif() {
  const W = Math.max(280, window.innerWidth);
  const H = Math.max(260, window.innerHeight);
  
  // On utilise EXACTEMENT les réglages de la page À propos
  drawOrganicMotif('bgMotif', W, H, {
    strands: 7,
    bubbles: 18,
    convergeY: H * 0.5,
    convergeStrength: 0.2,
    pacman: true,
  });
}

function initPage() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    drawTrackerConnectors();
    generateTrackerMotif();
    generateBackgroundMotif();
  }));

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      drawTrackerConnectors();
      generateTrackerMotif();
      generateBackgroundMotif();
    }, 100);
  });
}
