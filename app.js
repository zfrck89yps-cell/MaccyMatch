window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const app = document.getElementById("app");

  const start = () => {
    splash.classList.add("hidden");

    setTimeout(() => {
      splash.remove();
      app.style.display = "block";
    }, 350);
  };

  splash.addEventListener("click", start, { once: true });
  splash.addEventListener("touchstart", start, { once: true });
});
