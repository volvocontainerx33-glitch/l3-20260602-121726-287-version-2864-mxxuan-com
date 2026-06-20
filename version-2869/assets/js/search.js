(function () {
  var form = document.querySelector('.search-box');
  var input = document.querySelector('#searchInput');
  var typeSelect = document.querySelector('#typeSelect');
  var results = document.querySelector('#searchResults');
  var count = document.querySelector('#searchCount');

  if (!form || !input || !results || !window.SEARCH_DATA) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;

  function itemTemplate(item) {
    return [
      '<article class="wide-card">',
      '<a class="wide-poster" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
      '</a>',
      '<div>',
      '<div class="tag-row"><span>' + item.category + '</span><span>' + item.year + '年</span></div>',
      '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
      '<p>' + item.desc + '</p>',
      '<div class="detail-meta"><span>' + item.region + '</span><span>' + item.type + '</span><span>' + item.genre + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function runSearch() {
    var q = input.value.trim().toLowerCase();
    var type = typeSelect ? typeSelect.value : '';
    var filtered = window.SEARCH_DATA.filter(function (item) {
      var haystack = [item.title, item.category, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.desc].join(' ').toLowerCase();
      var matchText = !q || haystack.indexOf(q) !== -1;
      var matchType = !type || item.type.indexOf(type) !== -1;
      return matchText && matchType;
    }).slice(0, 120);
    results.innerHTML = filtered.map(itemTemplate).join('');
    if (count) {
      count.textContent = '找到 ' + filtered.length + ' 条相关影片';
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    runSearch();
  });

  if (typeSelect) {
    typeSelect.addEventListener('change', runSearch);
  }

  input.addEventListener('input', runSearch);
  runSearch();
})();
