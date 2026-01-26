function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

function startApp() {
  const app = document.getElementById("app");

  // Temporary home screen - replace later with your real menu
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
      <p style="margin:12px 0 0;font-size:1.2rem;">Loading complete ✅</p>
    </div>
  `;
}

window.addEventListener("load", () => {
  startApp();
  setTimeout(hideSplash, 2600);
});
