const SNAP_DISTANCE = 80; 
const MAX_ROTATION_SPEED = 2.5; 

const magnets = document.querySelectorAll('.magnet');
const slots = document.querySelectorAll('.slot');
let placedCount = 0; 

magnets.forEach((magnet, index) => {
  const zone = index % 4; 
  let top, left;

  if (zone === 0) { 
    top = 5 + Math.random() * 15; 
    left = 10 + Math.random() * 80; 
  } else if (zone === 1) { 
    top = 75 + Math.random() * 15; 
    left = 10 + Math.random() * 80; 
  } else if (zone === 2) { 
    top = 10 + Math.random() * 80; 
    left = 5 + Math.random() * 15; 
  } else { 
    top = 10 + Math.random() * 80; 
    left = 75 + Math.random() * 15; 
  }

  magnet.style.top = `${top}vh`;
  magnet.style.left = `${left}vw`;

  const randomRotation = Math.floor(Math.random() * 360);
  magnet.style.transform = `rotate(${randomRotation}deg)`;

  magnet.currentRotation = randomRotation;
  magnet.currentX = 0; 
  magnet.currentY = 0;
});

magnets.forEach(magnet => {
  let startX = 0, startY = 0;
  let isDragging = false;

  magnet.addEventListener('pointerdown', (e) => {
    if (magnet.classList.contains('snapped')) return;
    
    e.preventDefault();
    magnet.classList.add('dragging');
    isDragging = true;
    
    startX = e.clientX - magnet.currentX;
    startY = e.clientY - magnet.currentY;

    magnet.setPointerCapture(e.pointerId);
  });

  magnet.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    magnet.currentX = e.clientX - startX;
    magnet.currentY = e.clientY - startY;

    const deltaX = e.movementX; 
    const deltaY = e.movementY;

    if (deltaX !== 0 || deltaY !== 0) {
      const movementAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      let angleDiff = movementAngle - magnet.currentRotation;
      
      while (angleDiff > 180) angleDiff -= 360;
      while (angleDiff < -180) angleDiff += 360;

      let rotateSpeed = angleDiff * 0.5;
      if (rotateSpeed > MAX_ROTATION_SPEED) rotateSpeed = MAX_ROTATION_SPEED;
      if (rotateSpeed < -MAX_ROTATION_SPEED) rotateSpeed = -MAX_ROTATION_SPEED;
      
      magnet.currentRotation += rotateSpeed;
    }

    magnet.style.transform = `translate(${magnet.currentX}px, ${magnet.currentY}px) rotate(${magnet.currentRotation}deg)`;
  });

  magnet.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    magnet.classList.remove('dragging');
    magnet.releasePointerCapture(e.pointerId);
    
    const letter = magnet.dataset.letter;
    const freeSlots = document.querySelectorAll(`.slot[data-letter="${letter}"]:not(.filled)`);
    
    let snapped = false;
    const magnetRect = magnet.getBoundingClientRect();

    for (let slot of freeSlots) {
      const slotRect = slot.getBoundingClientRect();
      const distance = Math.hypot(
        (slotRect.left + slotRect.width / 2) - (magnetRect.left + magnetRect.width / 2),
        (slotRect.top + slotRect.height / 2) - (magnetRect.top + magnetRect.height / 2)
      );

      if (distance < SNAP_DISTANCE) {
        snapToSlot(magnet, slot);
        snapped = true;
        break; 
      }
    }

    if (!snapped) {
      magnet.style.transform = `translate(${magnet.currentX}px, ${magnet.currentY}px) rotate(${magnet.currentRotation}deg)`;
    }
  });
});

function snapToSlot(magnet, slot) {
  magnet.classList.add('snapped');
  slot.classList.add('filled');
  magnet.style.pointerEvents = 'none'; 
  
  const slotX = slot.offsetLeft;
  const slotY = slot.offsetTop;
  const magnetX = magnet.offsetLeft;
  const magnetY = magnet.offsetTop;

  const diffX = slotX - magnetX;
  const diffY = slotY - magnetY;

  magnet.style.transform = `translate(${diffX}px, ${diffY}px) rotate(0deg)`;
  magnet.style.transition = 'transform 0.6s cubic-bezier(0.25, 1.5, 0.5, 1)';
  
  placedCount++;
  
  if (placedCount === magnets.length) {
    setTimeout(triggerFireworks, 300);
  }
}

function triggerFireworks() {
  const duration = 14 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 80 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

const pressedKeys = new Set();

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  pressedKeys.add(key);

  if (pressedKeys.has('q') && pressedKeys.has('w') && pressedKeys.has('r')) {
    autoSolve();
    pressedKeys.clear(); 
  }
});

window.addEventListener('keyup', (e) => {
  pressedKeys.delete(e.key.toLowerCase());
});

function autoSolve() {
  const unplacedMagnets = document.querySelectorAll('.magnet:not(.snapped)');
  
  if (unplacedMagnets.length === 0) return;

  unplacedMagnets.forEach(magnet => {
    const letter = magnet.dataset.letter;
    const freeSlot = document.querySelector(`.slot[data-letter="${letter}"]:not(.filled)`);
    
    if (freeSlot) {
      snapToSlot(magnet, freeSlot);
    }
  });
}