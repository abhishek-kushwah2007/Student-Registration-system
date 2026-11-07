SRS PWA files
Copy these 4 files into the SAME project folder as index.html:
- manifest.json
- service-worker.js
- icon-192.png
- icon-512.png

In index.html, inside <head>, add:
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#2563eb">

Just before </body>, add:
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(error => console.error("Service worker registration failed:", error));
  });
}
</script>

Commit/push or upload all changed files to GitHub Pages. Wait for redeployment, then open the website in Chrome and check Install app / Add to Home screen.
