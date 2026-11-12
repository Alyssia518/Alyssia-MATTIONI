const loadingContainer = document.getElementById('loadingContainer');
const mainContent = document.getElementById('mainContent');

// Vérifie si l'animation a déjà été vue (pour ne pas la relancer quand on clique sur "Retour")
const introAlreadyPlayed = sessionStorage.getItem('introPlayed') === 'true';

if (introAlreadyPlayed) {
  // Si on a déjà vu l'anim, on l'affiche direct sans rien attendre
  loadingContainer.style.display = 'none';
  mainContent.classList.add('show');
  document.body.style.overflow = 'auto';
  initPage();
} else {
  // Si c'est la 1ère fois, on sauvegarde le fait qu'on va la voir
  sessionStorage.setItem('introPlayed', 'true');

  // LE FIX : On attend 6 secondes (5000 ms = 5s, 6000 ms = 6s) 
  // et on force l'affichage, quoi qu'il arrive.
  setTimeout(() => {
    loadingContainer.classList.add('fade-out'); // On lance le fondu
    setTimeout(() => {
      loadingContainer.style.display = 'none'; // On cache la vidéo
      mainContent.classList.add('show');       // On affiche l'accueil
      document.body.style.overflow = 'auto';   // On réactive le scroll
      initPage();                              // On dessine les lignes
    }, 500); // On laisse 0.5 sec pour que le fondu CSS se termine
  }, 6000); // <-- Modifie ce chiffre si ta vidéo est plus longue (ex: 8000 pour 8s)
}

// --- Tes fonctions de dessin (ne pas toucher) ---
function drawTrackerConnectors() { /* ... ton code actuel ... */ }
