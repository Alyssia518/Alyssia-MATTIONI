const loadingContainer = document.getElementById('loadingContainer');
const loadingVideo = document.getElementById('loadingVideo');
const mainContent = document.getElementById('mainContent');

const introAlreadyPlayed = sessionStorage.getItem('introPlayed') === 'true';

function redirectToMain() {
  sessionStorage.setItem('introPlayed', 'true');
  loadingContainer.classList.add('fade-out');
  setTimeout(() => {
    loadingContainer.style.display = 'none';
    mainContent.classList.add('show');
    document.body.style.overflow = 'auto';
    initMainPage();
  }, 500);
}

if (introAlreadyPlayed) {
  loadingContainer.style.display = 'none';
  mainContent.classList.add('show');
  document.body.style.overflow = 'auto';
  initMainPage();
}

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

let trackerResizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(trackerResizeTimeout);
  trackerResizeTimeout = setTimeout(() => {
    drawTrackerConnectors();
    generateTrackerMotif();
  }, 100);
});

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
  const arrowId = `arrow-${svgId}`;

  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <marker id="${arrowId}" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
      <path d="M0,0 L5,2.5 L0,5 Z" fill="#000000"></path>
    </marker>`;
  svg.appendChild(defs);

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
    if (signalStrands.has(s)) {
      path.setAttribute('stroke-dasharray', '2.5 4');
      path.setAttribute('marker-end', `url(#${arrowId})`);
    }
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
  drawOrganicMotif('trackerMotif', W, H, {
    strands: isMobile ? Math.max(9, Math.round(H / 70)) : 9,
    bubbles: isMobile ? Math.max(26, Math.round(H / 22)) : 26,
    convergeY: H * 0.5,
    convergeStrength: 0.22,
    pacman: true,
  });
}

function initMainPage() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    drawTrackerConnectors();
    generateTrackerMotif();
  }));

  const bubbles = document.querySelectorAll('.floating-bubble');
  const detectZone = document.querySelector('.detect-zone');
  let dragging = null, offsetX = 0, offsetY = 0;

  function checkCollision(bubble, zone) {
    const bRect = bubble.getBoundingClientRect();
    const zRect = zone.getBoundingClientRect();
    return !(bRect.right < zRect.left || bRect.left > zRect.right || bRect.bottom < zRect.top || bRect.top > zRect.bottom);
  }

  function updateTextOnContact() {
    let isTouching = false;
    bubbles.forEach(bubble => { if (checkCollision(bubble, detectZone)) isTouching = true; });
    detectZone.classList.toggle('touching', isTouching);
    requestAnimationFrame(updateTextOnContact);
  }
  updateTextOnContact();

  function resumeFloating(bubble) {
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'float 8s ease-in-out infinite';
  }

  bubbles.forEach(bubble => {
    bubble.addEventListener('mousedown', (e) => {
      dragging = bubble;
      offsetX = e.clientX - bubble.offsetLeft;
      offsetY = e.clientY - bubble.offsetTop;
      bubble.style.animation = 'none';
    });
    bubble.addEventListener('touchstart', (e) => {
      e.preventDefault();
      dragging = bubble;
      const touch = e.touches[0];
      offsetX = touch.clientX - bubble.offsetLeft;
      offsetY = touch.clientY - bubble.offsetTop;
      bubble.style.animation = 'none';
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (dragging) {
      dragging.style.left = `${e.clientX - offsetX}px`;
      dragging.style.top = `${e.clientY - offsetY}px`;
    }
  });
  document.addEventListener('mouseup', () => {
    if (dragging) { resumeFloating(dragging); dragging = null; }
  });
  document.addEventListener('touchmove', (e) => {
    if (dragging) {
      const touch = e.touches[0];
      dragging.style.left = `${touch.clientX - offsetX}px`;
      dragging.style.top = `${touch.clientY - offsetY}px`;
    }
  });
  document.addEventListener('touchend', () => {
    if (dragging) { resumeFloating(dragging); dragging = null; }
  });
}

loadingVideo.addEventListener('ended', redirectToMain);
loadingVideo.addEventListener('error', redirectToMain);
setTimeout(() => {
  if (!mainContent.classList.contains('show')) redirectToMain();
}, 8000);
