function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function getQuery() {
  var params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

function makeCard(movie) {
  var tags = movie.tags.slice(0, 4).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  return [
    '<article class="movie-card">',
    '  <a class="poster-link" href="' + escapeHtml(movie.href) + '">',
    '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '    <span class="poster-fallback">' + escapeHtml(movie.title.slice(0, 4)) + '</span>',
    '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
    '  </a>',
    '  <div class="card-body">',
    '    <div class="card-meta">',
    '      <span>' + escapeHtml(movie.year) + '</span>',
    '      <span>' + escapeHtml(movie.type) + '</span>',
    '      <span>' + escapeHtml(movie.region) + '</span>',
    '    </div>',
    '    <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
    '    <p>' + escapeHtml(movie.one_line) + '</p>',
    '    <div class="tag-row">' + tags + '</div>',
    '  </div>',
    '</article>'
  ].join('\n');
}

async function initSearch() {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var summary = document.getElementById('searchSummary');
  if (!input || !results || !summary) {
    return;
  }

  var response = await fetch('assets/data/search-index.json');
  var movies = await response.json();
  var query = getQuery();
  input.value = query;

  function render() {
    var keyword = normalize(input.value);
    if (!keyword) {
      results.innerHTML = '';
      summary.textContent = '请输入关键词进行搜索。';
      return;
    }

    var matched = movies.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(' '),
        movie.one_line
      ].join(' '));
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 120);

    results.innerHTML = matched.map(makeCard).join('\n');
    summary.textContent = '找到 ' + matched.length + ' 条匹配结果。';

    results.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  input.addEventListener('input', render);
  render();
}

initSearch();
