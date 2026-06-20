(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initImageFallbacks();
    initCardFilters();
  });

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    show(0);
    start();
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll('img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.setAttribute('aria-hidden', 'true');
      });
    });
  }

  function initCardFilters() {
    var bars = document.querySelectorAll('[data-filter-bar]');
    bars.forEach(function (bar) {
      var container = bar.parentElement;
      var grid = container ? container.querySelector('[data-card-grid]') : null;
      var searchInput = bar.querySelector('[data-card-search]');
      var typeButtons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter-type]'));
      var yearButtons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter-year]'));
      var emptyState = container ? container.querySelector('[data-empty-state]') : null;
      var selectedType = 'all';
      var selectedYear = 'all';

      if (!grid) {
        return;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.type,
            card.dataset.region,
            card.dataset.tags
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchType = selectedType === 'all' || normalize(card.dataset.type).indexOf(normalize(selectedType)) !== -1;
          var matchYear = selectedYear === 'all' || String(card.dataset.year) === String(selectedYear);
          var shouldShow = matchKeyword && matchType && matchYear;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }

      typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          selectedType = button.dataset.filterType;
          typeButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          selectedYear = button.dataset.filterYear;
          yearButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      apply();
    });
  }
})();
