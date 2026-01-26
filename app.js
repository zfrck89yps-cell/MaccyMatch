function startApp() {
  const app = document.getElementById("app");

  // Temporary home screen so we never see a blank/yellow screen
  app.innerHTML = `
    <div style="
      width:100%;
      height:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-direction:column;
      text-align:center;
      padding:24px;
      box-sizing:border-box;
      font-family:system-ui;
    ">
      <h1 style="margin:0;font-size:3rem;">Maccy Match</h1>
      <p style="margin-top:12px;font-size:1.2rem;">
        Tap a category
      </p>
    </div>
  `;
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  splash.style.opacity = "0";
  splash.style.transition = "opacity 300ms ease";

  setTimeout(() => {
    splash.remove();
  }, 350);
}

window.addEventListener("load", () => {
  // Start app immediately behind splash
  startApp();

  // Hide splash after 3 seconds (matches your video)
  setTimeout(hideSplash, 3000);
});
