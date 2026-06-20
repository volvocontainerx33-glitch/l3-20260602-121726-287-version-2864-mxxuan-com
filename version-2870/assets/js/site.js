(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
      menuButton.textContent = mobileMenu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var input = panel.querySelector("[data-card-filter]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-chip]"));
    var list = document.querySelector("[data-card-list]");
    var activeChip = "";

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function filter() {
      if (!list) {
        return;
      }
      var query = normalize(input ? input.value : "");
      var chip = normalize(activeChip);
      Array.prototype.slice.call(list.children).forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passChip = !chip || haystack.indexOf(chip) !== -1;
        card.classList.toggle("hidden-by-filter", !(passQuery && passChip));
      });
    }

    if (input) {
      input.addEventListener("input", filter);
    }

    chips.forEach(function (chipButton) {
      chipButton.addEventListener("click", function () {
        activeChip = chipButton.getAttribute("data-chip") || "";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chipButton);
        });
        filter();
      });
    });
  });
})();
