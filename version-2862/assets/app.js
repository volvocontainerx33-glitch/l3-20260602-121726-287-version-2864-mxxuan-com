(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  $all('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
    }, { once: true });
  });

  var toggle = $('[data-menu-toggle]');
  var panel = $('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = $('[data-hero]');

  if (hero) {
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    play();
  }

  $all('[data-filter-panel]').forEach(function (panelElement) {
    var input = $('[data-filter-input]', panelElement);
    var yearSelect = $('[data-filter-year]', panelElement);
    var list = $('[data-filter-list]');
    var buttons = $all('[data-filter-category]', panelElement);
    var activeCategory = '';

    if (!list) {
      return;
    }

    var cards = $all('.movie-card', list);

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var category = card.getAttribute('data-category') || '';
        var matchQuery = !query || keywords.indexOf(query) !== -1 || title.indexOf(query) !== -1;
        var matchYear = !year || cardYear === year;
        var matchCategory = !activeCategory || category === activeCategory;
        card.style.display = matchQuery && matchYear && matchCategory ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-category') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });
  });

  var searchResults = $('[data-search-results]');
  var searchSummary = $('[data-search-summary]');
  var searchInput = $('[data-search-page-input]');

  if (searchResults && window.SEARCH_ITEMS) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = (params.get('q') || '').trim();

    if (searchInput) {
      searchInput.value = queryValue;
    }

    function renderSearch(query) {
      var keyword = query.toLowerCase();
      var results = keyword
        ? window.SEARCH_ITEMS.filter(function (item) {
            return item.text.indexOf(keyword) !== -1;
          }).slice(0, 120)
        : [];

      if (!keyword) {
        searchSummary.textContent = '输入关键词查找相关剧集。';
        searchResults.innerHTML = '';
        return;
      }

      searchSummary.textContent = results.length ? '搜索结果：' + query : '没有找到相关剧集。';
      searchResults.innerHTML = results.map(function (item) {
        return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
          '<span class="card-poster">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="card-badge">' + escapeHtml(item.category) + '</span>' +
          '<span class="card-year">' + escapeHtml(item.year) + '</span>' +
          '</span>' +
          '<span class="card-body">' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<em>' + escapeHtml(item.line) + '</em>' +
          '<span class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>' +
          '</span>' +
          '</a>';
      }).join('');
    }

    renderSearch(queryValue);
  }
})();
