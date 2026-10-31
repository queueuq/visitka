
const SNAP_DISTANCE = 150; 
const MAX_ROTATION_SPEED = 1.5; 


const magnets = document.querySelectorAll('.magnet');
const slots = document.querySelectorAll('.slot');
let placedCount = 0; 


magnets.forEach(magnet => {
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;
  let rotation = 0;
  let isDragging = false;

  magnet.addEventListener('pointerdown', (e) => {
    if (magnet.classList.contains('snapped')) return;
    
    e.preventDefault();
    magnet.classList.add('dragging');
    isDragging = true;
    
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;

    magnet.setPointerCapture(e.pointerId);
  });

  magnet.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    currentX = e.clientX - startX;
    currentY = e.clientY - startY;



    const deltaX = e.movementX; 
    const deltaY = e.movementY;


    if (deltaX !== 0 || deltaY !== 0) {
      const movementAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;


      let angleDiff = movementAngle - rotation;
      
      while (angleDiff > 180) angleDiff -= 360;
      while (angleDiff < -180) angleDiff += 360;


      let rotateSpeed = angleDiff * 0.5;
      if (rotateSpeed > MAX_ROTATION_SPEED) rotateSpeed = MAX_ROTATION_SPEED;
      if (rotateSpeed < -MAX_ROTATION_SPEED) rotateSpeed = -MAX_ROTATION_SPEED;
      
      rotation += rotateSpeed;
    }

    magnet.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
  });

  magnet.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    magnet.classList.remove('dragging');
    magnet.releasePointerCapture(e.pointerId);
    
    const letter = magnet.dataset.letter;
    const targetSlot = document.querySelector(`.slot[data-letter="${letter}"]`);
    
    if (targetSlot && !targetSlot.classList.contains('filled')) {
      const slotRect = targetSlot.getBoundingClientRect();
      const magnetRect = magnet.getBoundingClientRect();
      
      const distance = Math.hypot(
        (slotRect.left + slotRect.width / 2) - (magnetRect.left + magnetRect.width / 2),
        (slotRect.top + slotRect.height / 2) - (magnetRect.top + magnetRect.height / 2)
      );

      if (distance < SNAP_DISTANCE) {
        snapToSlot(magnet, targetSlot);
        return;
      }
    }


    magnet.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
  });
});


function snapToSlot(magnet, slot) {
  magnet.classList.add('snapped');
  slot.classList.add('filled');
  magnet.style.pointerEvents = 'none'; 
  
  const board = document.querySelector('.board');
  const boardRect = board.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();

  const targetX = slotRect.left - boardRect.left;
  const targetY = slotRect.top - boardRect.top;
  

  magnet.style.transform = `translate(${targetX}px, ${targetY}px) rotate(0deg)`;
  magnet.style.transition = 'transform 0.2s ease-out';
  
  
  placedCount++;
  
  if (placedCount === magnets.length) {
    setTimeout(triggerFireworks, 300);
  }
}


function triggerFireworks() {
  const duration = 3 * 1000;
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

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}