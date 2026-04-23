(() => {
  if (!('serviceWorker' in navigator)) return;
  // Intentionally no-op by default.
  // App-level registration is already controlled inside src/app.v51.js
})();
