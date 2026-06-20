(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function runFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-filter-select="type"]');
    var yearSelect = scope.querySelector('[data-filter-select="year"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var query = input ? input.value.trim().toLowerCase() : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var show = true;

      if (query && text.indexOf(query) === -1) {
        show = false;
      }

      if (type && cardType !== type) {
        show = false;
      }

      if (year && cardYear !== year) {
        show = false;
      }

      card.classList.toggle('hidden-by-filter', !show);
    });
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (input && q && input.hasAttribute('data-query-from-url')) {
      input.value = q;
    }

    scope.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', function () {
        runFilter(scope);
      });
      control.addEventListener('change', function () {
        runFilter(scope);
      });
    });

    runFilter(scope);
  });

  function setupPlayer() {
    var shell = document.querySelector('.player-shell[data-url]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var url = shell.getAttribute('data-url');
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
      if (loaded || !video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }

      loaded = true;
    }

    function startPlayback() {
      attachSource();
      shell.classList.add('is-playing');

      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  setupPlayer();
})();
