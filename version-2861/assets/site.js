(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var nav = qs('.main-nav');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dots button');

    if (slides.length < 2) {
      return;
    }

    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });

      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupPageFilter() {
    var input = qs('.page-filter');
    var year = qs('.year-filter');
    var cards = qsa('[data-card]');
    var empty = qs('.empty-state');

    if (!cards.length) {
      return;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var keywordOk = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        var yearOk = !selectedYear || cardYear === selectedYear;
        var ok = keywordOk && yearOk;

        card.style.display = ok ? '' : 'none';

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (year) {
      year.addEventListener('change', apply);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    apply();
  }

  function setupPlayer() {
    var video = qs('[data-player]');
    var cover = qs('.player-cover');
    var button = qs('.play-button');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var loaded = false;

    function loadSource() {
      if (loaded || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function startPlayback() {
      loadSource();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    button.addEventListener('click', startPlayback);
    cover && cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupPageFilter();
    setupPlayer();
  });
})();
