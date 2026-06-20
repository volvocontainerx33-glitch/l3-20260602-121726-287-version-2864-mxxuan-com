(function () {
  function prepare(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector("[data-action='start-play']");
    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-url");
    var hls = null;
    var ready = false;

    function bind() {
      if (ready || !stream) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      bind();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (cover) {
        cover.classList.remove("is-hidden");
      }
      if (hls && typeof hls.stopLoad === "function") {
        hls.stopLoad();
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(prepare);
})();
