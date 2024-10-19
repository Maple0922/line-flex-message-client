export const disablePinchZoom = () => {
  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length >= 2) {
        event.preventDefault();
      }
    },
    { passive: false }
  );
};

export const disableDoubleTapZoom = () => {
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 700) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
};
