document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('artCanvas');
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

  // Set white canvas background on load
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Drawing Event Listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  function startDrawing(e) {
    isDrawing = true;
    draw(e);
  }

  function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor.value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
  }

  // Clear Canvas
  clearBtn.addEventListener('click', () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  // Publish Drawing as a New Artwork Card
  publishBtn.addEventListener('click', () => {
    const title = artTitleInput.value.trim() || 'Untitled Piece';
    const artist = artistNameInput.value.trim() || 'Anonymous Artist';
    
    // Convert canvas content to image Data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Create new artwork card
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

    // Unhide the community gallery section and insert card
    communityGallery.style.display = 'block';
    communityCards.prepend(card);

    // Reset inputs and clear canvas
    artTitleInput.value = '';
    artistNameInput.value = '';
    clearBtn.click();

    // Scroll smoothly to the newly added piece
    card.scrollIntoView({ behavior: 'smooth' });
  });
});
