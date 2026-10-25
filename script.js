
const magnets = document.querySelectorAll('.magnet');

magnets.forEach(magnet => {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;


  magnet.addEventListener('pointerdown', (e) => {
    e.preventDefault(); 

    magnet.classList.add('dragging');
    
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;

    magnet.setPointerCapture(e.pointerId);
  });


  magnet.addEventListener('pointermove', (e) => {

    if (!magnet.classList.contains('dragging')) return;

    currentX = e.clientX - startX;
    currentY = e.clientY - startY;


    magnet.style.transform = `translate(${currentX}px, ${currentY}px)`;
  });

  magnet.addEventListener('pointerup', (e) => {
    magnet.classList.remove('dragging');
    magnet.releasePointerCapture(e.pointerId);
  });
});