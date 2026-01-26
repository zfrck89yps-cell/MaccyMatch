/* =========================
   SPLASH CONTROL
========================= */

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  splash.classList.add("hidden");

  // Remove from DOM after fade
  setTimeout(() => {
    splash.remove();
  }, 400);
}

/* =========================
   APP START
========================= */

function startApp() {
  const app = document.getElementById("app");

  // Temporary home screen (prevents blank/yellow screen)
  app.innerHTML = `
    <div style="
      width:100%;
      height:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-direction:column;
      background:#FFF4CC;
      text-align:center;
    ">
      <h1 style="margin:0;font-size:3rem;">Maccy Match</h1>
      <p style="margin-top:12px;font-size:1.2rem;">
        Tap a category
      </p>
    </div>
  `;
}

/* =========================
   BOOTSTRAP
========================= */

window.addEventListener("load", () => {
  // Start app immediately (runs behind splash)
  startApp();

  // Locked splash timing
  setTimeout(hideSplash, 2600);
});
