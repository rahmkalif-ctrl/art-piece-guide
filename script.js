document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('artCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const brushColor = document.getElementById('brushColor');
  const brushSize = document.getElementById('brushSize');
  const clearBtn = document.getElementById('clearBtn');
  const publishBtn = document.getElementById('publishBtn');
  const artTitleInput = document.getElementById('artTitle');
  const artistNameInput = document.getElementById('artistName');
  const communityGallery = document.getElementById('communityGallery');
  const communityCards = document.getElementById('communityCards');

  let isDrawing = false;

  // Initialize white canvas background
  function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  initCanvas();

  // Helper to get precise mouse / pointer coordinates on the canvas
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // Start Drawing
  function startDrawing(e) {
    isDrawing = true;
    const pos = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  // Draw Line
  function draw(e) {
    if (!isDrawing) return;
    
    // Prevent default touch scrolling behavior while drawing on mobile/touch
    e.preventDefault();

    const pos = getCoordinates(e);

    ctx.lineWidth = brushSize ? brushSize.value : 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor ? brushColor.value : '#1c150e';

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

  // Universal Pointer Event Listeners (Works for Mouse, Trackpad, Touch, and Stylus)
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);

  // Clear Canvas Button
  if (clearBtn) {
    clearBtn.addEventListener('click', initCanvas);
  }

  // Publish Artwork to Gallery
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const title = artTitleInput.value.trim() || 'Untitled Piece';
      const artist = artistNameInput.value.trim() || 'Anonymous Artist';
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

        artTitleInput.value = '';
        artistNameInput.value = '';
        initCanvas();

        card.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
