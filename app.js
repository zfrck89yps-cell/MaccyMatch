function renderMenu() {
  const app = document.getElementById("app");

  // Placeholder menu — replace later
  app.innerHTML = `
    <div style="
      font-size: 42px;
      font-weight: 700;
      text-align: center;
    ">
      Main Menu
    </div>
  `;
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

window.addEventListener("load", () => {
  renderMenu();

  const splash = document.getElementById("splash");

  const startApp = () => {
    hideSplash();
  };

  splash.addEventListener("click", startApp, { once: true });
  splash.addEventListener("touchstart", startApp, { once: true });
});
