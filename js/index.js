const loadingContainer = document.getElementById('loadingContainer');
const loadingVideo = document.getElementById('loadingVideo');
const mainContent = document.getElementById('mainContent');

// Vérifie si on a déjà vu l'intro
const introAlreadyPlayed = sessionStorage.getItem('introPlayed') === 'true';

if (introAlreadyPlayed) {
  // Si oui, on affiche direct (le CSS gère le reste)
  loadingContainer.style.display = 'none';
  mainContent.classList.add('show');
  document.body.style.overflow = 'auto';
  // On dessine les lignes (si la fonction existe)
  if (typeof initPage === 'function') initPage();
} else {
  // Si non, on joue la vidéo
  sessionStorage.setItem('introPlayed', 'true');
  
  // 1. Si la vidéo se termine, on cache l'écran
  loadingVideo.addEventListener('ended', () => {
    loadingContainer.style.display = 'none';
    mainContent.classList.add('show');
    document.body.style.overflow = 'auto';
    if (typeof initPage === 'function') initPage();
  });

  // 2. Si la vidéo ne se lance pas (erreur de fichier), on cache direct
  loadingVideo.addEventListener('error', () => {
    loadingContainer.style.display = 'none';
    mainContent.classList.add('show');
    document.body.style.overflow = 'auto';
    if (typeof initPage === 'function') initPage();
  });
}
