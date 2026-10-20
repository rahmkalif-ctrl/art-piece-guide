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

  // Initialize white canvas background
  function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }
  initCanvas();

  // Switch to Brush Mode
  if (drawBtn) {
    drawBtn.addEventListener('click', () => {
      isEraser = false;
      drawBtn.classList.add('active-tool');
      if (eraserBtn) eraserBtn.classList.remove('active-tool');
      ctx.beginPath(); // Reset path buffer
    });
  }

  // Switch to Eraser Mode
  if (eraserBtn) {
    eraserBtn.addEventListener('click', () => {
      isEraser = true;
      eraserBtn.classList.add('active-tool');
      if (drawBtn) drawBtn.classList.remove('active-tool');
      ctx.beginPath(); // Reset path buffer
    });
  }

  // Calculate precise cursor position relative to canvas scaling
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // Start Stroke
  function startDrawing(e) {
    isDrawing = true;
    const pos = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  // Execute Drawing / Erasing
  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getCoordinates(e);

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = brushSize ? brushSize.value : 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Use white stroke for eraser mode against white canvas background
    ctx.strokeStyle = isEraser ? '#ffffff' : (brushColor ? brushColor.value : '#1c150e');

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  // End Stroke
  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      ctx.closePath();
    }
  }

  // Universal Pointer Events (Mouse, Trackpad, Touch, Stylus)
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);

  // Clear Canvas
  if (clearBtn) {
    clearBtn.addEventListener('click', initCanvas);
  }

  // Publish Drawing
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const title = artTitleInput ? artTitleInput.value.trim() || 'Untitled Piece' : 'Untitled Piece';
      const artist = artistNameInput ? artistNameInput.value.trim() || 'Anonymous Artist' : 'Anonymous Artist';
      const dataUrl = canvas.toDataURL('image/png');

      const card = document.createElement('article');
      card.className = 'artwork-card';
      card.innerHTML = `
        <div class="artwork-image">
          <img src="${dataUrl}" alt="${title}">
        </div>
        <div class="artwork-details">
          <h2>${title}</h2>
          <p class="artist-info"><strong>Artist:</strong> ${artist} (2026) — Community Creation</p>
          <p class="analysis">
            <strong>Artist Context & Historical Analysis:</strong> An original digital creation crafted by a visitor in the Virtual Gallery studio using custom digital brush techniques.
          </p>
        </div>
      `;

      if (communityGallery && communityCards) {
        communityGallery.style.display = 'block';
        communityCards.prepend(card);

        if (artTitleInput) artTitleInput.value = '';
        if (artistNameInput) artistNameInput.value = '';
        initCanvas();

        card.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
