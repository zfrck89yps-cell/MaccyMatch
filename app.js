function renderMenu() {
  document.getElementById("app").innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:42px;font-weight:900;">
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
  const tapText = document.getElementById("tapText");
  const video = document.getElementById("splashVideo");

  const start = async () => {
    tapText.style.display = "none";

    // IMPORTANT: exact filename & path
    video.src = "/MaccyMatch/Assets/Splash.mp4?v=9";
    video.currentTime = 0;
    video.style.display = "block";
    video.muted = false;
    video.volume = 1.0;

    try {
      await video.play();
    } catch (e) {
      hideSplash();
      return;
    }

    video.addEventListener("ended", hideSplash, { once: true });
    setTimeout(hideSplash, 4500); // safety
  };

  splash.addEventListener("click", start, { once: true });
  splash.addEventListener("touchstart", start, { once: true });
});
