/* =============================================================
   Shazeeda's Brews & Bites — QR generator logic (internal tool)
   Uses the self-hosted qrcode-generator library (js/vendor/qrcode.js,
   global `qrcode`). Renders at high resolution for crisp printing;
   the canvas is scaled down for display via CSS.
   ============================================================= */
(function () {
  "use strict";

  var urlInput = document.getElementById("url");
  var box = document.getElementById("qrbox");
  var dlBtn = document.getElementById("dl");
  var lastCanvas = null;

  var DARK = "#29261b";
  var LIGHT = "#ffffff";
  var MARGIN = 2;        // quiet zone, in modules
  var TARGET_PX = 1280;  // rendered size — large enough to print sharply

  document.getElementById("gen").addEventListener("click", function () {
    var value = urlInput.value.trim();
    if (!value) { urlInput.focus(); return; }

    box.innerHTML = "";
    lastCanvas = null;
    dlBtn.hidden = true;

    try {
      var qr = qrcode(0, "M"); // type 0 = auto-size, medium error correction
      qr.addData(value);
      qr.make();

      var count = qr.getModuleCount();
      var total = count + MARGIN * 2;
      var scale = Math.max(4, Math.round(TARGET_PX / total));
      var size = total * scale;

      var canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = LIGHT;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = DARK;
      for (var r = 0; r < count; r++) {
        for (var c = 0; c < count; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect((c + MARGIN) * scale, (r + MARGIN) * scale, scale, scale);
          }
        }
      }

      box.appendChild(canvas);
      lastCanvas = canvas;
      dlBtn.hidden = false;
    } catch (e) {
      box.textContent = "Could not generate QR code — is the URL too long?";
    }
  });

  dlBtn.addEventListener("click", function () {
    if (!lastCanvas) return;
    var a = document.createElement("a");
    a.href = lastCanvas.toDataURL("image/png");
    a.download = "shazeedas-menu-qr.png";
    a.click();
  });
})();
