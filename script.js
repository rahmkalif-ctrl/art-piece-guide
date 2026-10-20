document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('artCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const brushColor = document.getElementById('brushColor');
  const brushSize = document.getElementById('brushSize');
  const drawBtn = document.getElementById('drawBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearBtn = document.getElementById('clearBtn');
  const publishBtn = document.getElementById('publishBtn');
  const artTitleInput = document.getElementById('artTitle');
  const artistNameInput = document.getElementById('artistName');
  const communityGallery = document.getElementById('communityGallery');
  const communityCards = document.getElementById('communityCards');

  let isDrawing = false;
  let isEraser = false;

  // Key used to store artwork in browser memory
  const STORAGE_KEY = 'community_artworks_gallery';

  // Initialize white canvas background
  function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }
  initCanvas();

  // Helper function to render an artwork card into the DOM
  function renderArtworkCard(art, prepend = true) {
    const card = document.createElement('article');
    card.className = 'artwork-card';
    card.innerHTML = `
      <div class="artwork-image">
        <img src="${art.dataUrl}" alt="${art.title}">
      </div>
      <div class="artwork-details">
        <h2>${art.title}</h2>
        <p class="artist-info"><strong>Artist:</strong> ${art.artist} (${art.year || '2026'}) — Community Creation</p>
        <p class="analysis">
          <strong>Artist Context & Historical Analysis:</strong> An original digital creation crafted by a visitor in the Virtual Gallery studio using custom digital brush techniques.
        </p>
      </div>
    `;

    if (prepend) {
      communityCards.prepend(card);
    } else {
      communityCards.appendChild(card);
    }

    return card;
  }

  // Load and display all previously saved artworks from localStorage
  function loadSavedArtworks() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
      const artworks = JSON.parse(savedData);
      if (Array.isArray(artworks) && artworks.length > 0) {
        communityGallery.style.display = 'block';
        communityCards.innerHTML = ''; // Clear gallery container before loading
        artworks.forEach(art => renderArtworkCard(art, false));
      }
    } catch (e) {
      console.error("Error loading saved artworks:", e);
    }
  }

  // Save a newly submitted artwork to localStorage
  function saveArtworkToStorage(artObject) {
    let artworks = [];
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        artworks = JSON.parse(savedData);
      } catch (e) {
        artworks = [];
      }
    }
    artworks.unshift(artObject); // Place newest artwork first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
  }

  // Restore saved creations on initial page load
  loadSavedArtworks();

  // Switch to Brush Mode
  if (drawBtn) {
    drawBtn.addEventListener('click', () => {
      isEraser = false;
      drawBtn.classList.add('active-tool');
      if (eraserBtn) eraserBtn.classList.remove('active-tool');
      ctx.beginPath();
    });
  }

  // Switch to Eraser Mode
  if (eraserBtn) {
    eraserBtn.addEventListener('click', () => {
      isEraser = true;
      eraserBtn.classList.add('active-tool');
      if (drawBtn) drawBtn.classList.remove('active-tool');
      ctx.beginPath();
    });
  }

  // Get precise cursor position on the canvas
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // Start Drawing / Erasing
  function startDrawing(e) {
    isDrawing = true;
    const pos = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  // Drawing Execution
  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getCoordinates(e);

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = brushSize ? brushSize.value : 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : (brushColor ? brushColor.value : '#1c150e');

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  // Stop Drawing
  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      ctx.closePath();
    }
  }

  // Universal Event Listeners (Mouse, Touch, Trackpad, Stylus)
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);

  // Clear Canvas Button
  if (clearBtn) {
    clearBtn.addEventListener('click', initCanvas);
  }

  // Publish Drawing to Gallery and Save to LocalStorage
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const title = artTitleInput ? artTitleInput.value.trim() || 'Untitled Piece' : 'Untitled Piece';
      const artist = artistNameInput ? artistNameInput.value.trim() || 'Anonymous Artist' : 'Anonymous Artist';
      const dataUrl = canvas.toDataURL('image/png');

      const artObject = {
        title: title,
        artist: artist,
        dataUrl: dataUrl,
        year: '2026'
      };

      // 1. Save to browser storage
      saveArtworkToStorage(artObject);

      // 2. Render card in the gallery
      communityGallery.style.display = 'block';
      const newCard = renderArtworkCard(artObject, true);

      // 3. Reset studio form and canvas
      if (artTitleInput) artTitleInput.value = '';
      if (artistNameInput) artistNameInput.value = '';
      initCanvas();

      // 4. Smooth scroll to the newly published artwork
      newCard.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
