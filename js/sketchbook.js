const tornado = document.getElementById('tornado');
const rig = document.getElementById('rig');
const scene = document.getElementById('scene');
const readout = document.getElementById('zoomReadout');
const detail = document.getElementById('detail');
const detailFrame = document.getElementById('detailFrame');
const detailLabel = document.getElementById('detailLabel');
const detailClose = document.getElementById('detailClose');

// ⚠️ déclaré AVANT la boucle pour éviter le bug "Cannot access 'paused' before initialization"
let paused = false;

const isMobile = window.innerWidth < 640;

const sketchPaths = [
  'M6 34 Q8 12 24 10 Q42 8 45 22 Q46 34 33 37',
  'M8 10 Q26 6 40 18 Q48 26 40 34 Q30 42 16 36',
  'M10 30 Q10 14 22 9 Q36 4 42 16 Q46 28 34 34',
  'M6 18 Q22 6 38 14 Q46 20 38 30 Q28 38 14 30',
  'M8 8 Q30 4 42 20 Q46 30 32 36 Q16 40 10 26',
];
function svgFor(i){
  const d = sketchPaths[i % sketchPaths.length];
  return `<svg viewBox="0 0 50 44"><path d="${d}"/></svg>`;
}

const N = isMobile ? 50 : 70;
const TURNS = 4.5;
const HEIGHT = isMobile ? 560 : 700;
const MAX_RADIUS = isMobile ? 190 : 340;
const MIN_RADIUS_RATIO = 0.42;

const thumbs = [];
for(let i=0;i<N;i++){
  const t = i / (N - 1);
  const angle = t * TURNS * 360 + (Math.random()*10 - 5);
  const y = -HEIGHT/2 + t * HEIGHT;

  const shape = Math.sin(Math.PI * Math.pow(t, 0.75));
  const radius = MAX_RADIUS * (MIN_RADIUS_RATIO + (1 - MIN_RADIUS_RATIO) * shape) + (Math.random()*14 - 7);

  const size = (isMobile ? 26 : 30) + Math.random() * (isMobile ? 32 : 44);

  const el = document.createElement('div');
  el.className = 'thumb' + (Math.random() < 0.28 ? ' tone-a' : (Math.random() < 0.4 ? ' tone-b' : ''));
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.marginLeft = (-size/2) + 'px';
  el.style.marginTop = (-size/2) + 'px';
  el.style.transform = `translateY(${y}px) rotateY(${angle}deg) translateZ(${radius}px)`;
  el.innerHTML = svgFor(i);
  el.dataset.index = i;

  el.addEventListener('click', () => openDetail(i));

  tornado.appendChild(el);
  thumbs.push(el);
}

function openDetail(i){
  detailFrame.innerHTML = svgFor(i);
  detailLabel.textContent = `fig. ${String(i+1).padStart(2,'0')}`;
  detail.classList.add('open');
  paused = true;
}
detailClose.addEventListener('click', () => { detail.classList.remove('open'); paused = false; });

let autoSpin = 0;
let userSpin = 0;
let tiltX = -10;
let scale = isMobile ? 0.55 : 0.8;

function applyTransform(){
  rig.style.transform = `scale(${scale}) rotateX(${tiltX}deg)`;
  tornado.style.transform = `rotateY(${autoSpin + userSpin}deg)`;
  readout.textContent = `×${scale.toFixed(1)}`;
}

function loop(){
  if(!paused) autoSpin += 0.25;
  applyTransform();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

scene.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY;
  const zoomFactor = 1 - delta * 0.0016;
  scale = Math.min(4, Math.max(0.3, scale * zoomFactor));
  userSpin += delta * 0.15;
}, { passive:false });

let dragging = false, moved = false, lastX = 0, lastY = 0, downX = 0, downY = 0;

function dragStart(x, y){
  dragging = true; moved = false;
  lastX = x; lastY = y; downX = x; downY = y;
}
function dragMove(x, y){
  if(!dragging) return;
  if(Math.abs(x-downX) > 4 || Math.abs(y-downY) > 4) moved = true;
  userSpin += (x - lastX) * 0.4;
  tiltX = Math.min(20, Math.max(-70, tiltX - (y - lastY) * 0.2));
  lastX = x; lastY = y;
}
function dragEnd(){ dragging = false; }

scene.addEventListener('mousedown', (e) => { dragStart(e.clientX, e.clientY); scene.style.cursor='grabbing'; });
window.addEventListener('mousemove', (e) => dragMove(e.clientX, e.clientY));
window.addEventListener('mouseup', () => { dragEnd(); scene.style.cursor='grab'; });

scene.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  dragStart(t.clientX, t.clientY);
}, { passive:true });
scene.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  dragMove(t.clientX, t.clientY);
}, { passive:true });
scene.addEventListener('touchend', dragEnd);

let pinchStartDist = null, pinchStartScale = 1;
scene.addEventListener('touchstart', (e) => {
  if(e.touches.length === 2){
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchStartDist = Math.hypot(dx, dy);
    pinchStartScale = scale;
  }
}, { passive:true });
scene.addEventListener('touchmove', (e) => {
  if(e.touches.length === 2 && pinchStartDist){
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    scale = Math.min(4, Math.max(0.3, pinchStartScale * (dist / pinchStartDist)));
  }
}, { passive:true });
scene.addEventListener('touchend', (e) => { if(e.touches.length < 2) pinchStartDist = null; });
