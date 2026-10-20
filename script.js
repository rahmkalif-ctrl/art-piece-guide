document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('artCanvas');
  if (!canvas) {
    console.error("Canvas element '#artCanvas' not found!");
    return;
  }

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

  // Prevent browser scrolling/swiping over the canvas
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'crosshair';

  let isDrawing = false;
  let isEraser = false;
  const STORAGE_KEY = 'community_artworks_gallery';

  // 1. Initialize White Canvas Background
  function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }
  initCanvas();

  // 2. Tool Mode Toggles
  if (drawBtn) {
    drawBtn.addEventListener('click', () => {
      isEraser = false;
      drawBtn.classList.add('active-tool');
      if (eraserBtn) eraserBtn.classList.remove('active-tool');
    });
  }

  if (eraserBtn) {
    eraserBtn.addEventListener('click', () => {
      isEraser = true;
      eraserBtn.classList.add('active-tool');
      if (drawBtn) drawBtn.classList.remove('active-tool');
    });
  }

  // 3. Coordinate Helper
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  // 4. Drawing Engine
  function startDrawing(e) {
    isDrawing = true;
    const pos = getPos(e);

    const size = brushSize ? parseFloat(brushSize.value) : 5;
    const color = isEraser ? '#ffffff' : (brushColor ? brushColor.value : '#1c150e');

    // Draw initial dot on initial click/tap
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Prepare path line
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();

    const pos = getPos(e);
    const size = brushSize ? parseFloat(brushSize.value) : 5;
    const color = isEraser ? '#ffffff' : (brushColor ? brushColor.value : '#1c150e');

    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Reset path anchor to current point for continuous smooth strokes
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      ctx.beginPath();
    }
  }

  // 5. Attach Pointer & Touch Listeners
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  window.addEventListener('pointerup', stopDrawing);

  canvas.addEventListener('touchstart', (e) => { startDrawing(e); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { draw(e); }, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  // 6. Clear Canvas
  if (clearBtn) {
    clearBtn.addEventListener('click', initCanvas);
  }

  // 7. LocalStorage Persistence Logic
  function renderArtworkCard(art, prepend = true) {
    if (!communityCards) return null;
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

  function loadSavedArtworks() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return;
      const artworks = JSON.parse(savedData);
      if (Array.isArray(artworks) && artworks.length > 0) {
        if (communityGallery) communityGallery.style.display = 'block';
        if (communityCards) communityCards.innerHTML = '';
        artworks.forEach(art => renderArtworkCard(art, false));
      }
    } catch (err) {
      console.warn("Could not load saved artworks:", err);
    }
  }

  function saveArtworkToStorage(artObject) {
    try {
      let artworks = [];
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) artworks = JSON.parse(savedData);
      artworks.unshift(artObject);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
    } catch (err) {
      console.warn("Could not save artwork to storage:", err);
    }
  }

  loadSavedArtworks();

  // 8. Add to Gallery Button
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const title = (artTitleInput && artTitleInput.value.trim()) ? artTitleInput.value.trim() : 'Untitled Piece';
      const artist = (artistNameInput && artistNameInput.value.trim()) ? artistNameInput.value.trim() : 'Anonymous Artist';
      const dataUrl = canvas.toDataURL('image/png');

      const artObject = {
        title: title,
        artist: artist,
        dataUrl: dataUrl,
        year: '2026'
      };

      saveArtworkToStorage(artObject);

      if (communityGallery) communityGallery.style.display = 'block';
      const newCard = renderArtworkCard(artObject, true);

      if (artTitleInput) artTitleInput.value = '';
      if (artistNameInput) artistNameInput.value = '';
      initCanvas();

      if (newCard) newCard.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
