(function () {
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"card-cover\" href=\"" + movie.url + "\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"score-badge\">" + escapeHtml(movie.score) + "</span></a>" +
      "<div class=\"card-body\"><div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.category) + "</span></div>" +
      "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function run(value) {
    if (!results) {
      return;
    }
    var keyword = normalize(value);
    var data = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
    var matched = keyword ? data.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.category,
        movie.region,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" "));
      return haystack.indexOf(keyword) !== -1;
    }) : data.slice(0, 24);

    var limited = matched.slice(0, 120);
    var heading = keyword ? "<p class=\"search-summary\">搜索结果</p>" : "<p class=\"search-summary\">热门推荐</p>";
    var grid = limited.length ? "<div class=\"movie-grid four\">" + limited.map(card).join("") + "</div>" : "<p class=\"search-summary\">没有匹配的影片</p>";
    results.innerHTML = heading + grid;
  }

  if (input) {
    input.value = query;
    input.addEventListener("input", function () {
      run(input.value);
    });
  }

  run(query);
})();
