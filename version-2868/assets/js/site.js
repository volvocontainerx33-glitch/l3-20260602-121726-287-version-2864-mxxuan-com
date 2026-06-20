(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setMenu() {
    var button = document.querySelector(".menu-toggle");
    if (!button) return;
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function setHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    if (slides.length < 2) return;
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().replace(/\s+/g, " ");
  }

  function setFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".live-search");
      var scope = document.querySelector(panel.getAttribute("data-scope") || ".movie-grid");
      if (!scope) scope = panel.nextElementSibling;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card")) : [];
      var empty = document.querySelector(".empty-state");
      var activeFilter = "";
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));

      function apply() {
        var q = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.textContent
          ].join(" "));
          var ok = (!q || haystack.indexOf(q) > -1) && (!activeFilter || haystack.indexOf(normalize(activeFilter)) > -1);
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        if (empty) empty.style.display = visible ? "none" : "block";
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          activeFilter = button.getAttribute("data-filter") || "";
          apply();
        });
      });

      if (input) input.addEventListener("input", apply);
      apply();
    });
  }

  function setSearchPage() {
    var input = document.querySelector(".search-page .live-search");
    if (!input) return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    input.value = q;
    input.dispatchEvent(new Event("input"));
  }

  function setPlayer() {
    var box = document.querySelector(".player-box");
    if (!box) return;
    var video = box.querySelector("video");
    var overlay = box.querySelector(".play-overlay");
    if (!video || !overlay) return;
    var stream = video.getAttribute("data-stream");
    var attached = false;

    function attach() {
      if (attached || !stream) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        attached = true;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
      } else {
        video.src = stream;
        attached = true;
      }
    }

    function play() {
      attach();
      box.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    setMenu();
    setHero();
    setFilters();
    setSearchPage();
    setPlayer();
  });
})();
