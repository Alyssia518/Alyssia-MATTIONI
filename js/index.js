// ==========================================
// NOUVEAU : Génération du dessin en fond (page d'accueil)
// ==========================================
function generateBackgroundMotif() {
  const W = Math.max(280, window.innerWidth);
  const H = Math.max(260, window.innerHeight);
  
  drawOrganicMotif('bgMotif', W, H, {
    strands: 12,
    bubbles: 40,
    convergeY: H * 0.5,
    convergeStrength: 0.2,
    pacman: true,
  });
}

// On génère le dessin dès que le contenu principal s'affiche
if (mainContent.classList.contains('show')) {
  generateBackgroundMotif();
} else {
  // Si l'animation d'intro est en cours, on attend qu'elle se termine
  const checkIntro = setInterval(() => {
    if (mainContent.classList.contains('show')) {
      clearInterval(checkIntro);
      generateBackgroundMotif();
    }
  }, 500);
}

// On regénère le dessin si on redimensionne la fenêtre
window.addEventListener('resize', () => {
  generateBackgroundMotif();
});
