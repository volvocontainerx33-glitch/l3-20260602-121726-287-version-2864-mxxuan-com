(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        function showHero(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function playHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showHero(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                playHero();
            });
        });

        playHero();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var list = document.querySelector('[data-searchable-list]');

    if (filterForm && list) {
        var input = filterForm.querySelector('[data-filter-input]');
        var year = filterForm.querySelector('[data-filter-year]');
        var type = filterForm.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var selectedYear = year ? year.value : '';
            var selectedType = type ? type.value : '';

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
                card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchType));
            });
        }

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        [input, year, type].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var source = shell.getAttribute('data-video-src');

        if (!video || !source) {
            return;
        }

        if (overlay) {
            overlay.hidden = true;
        }

        var canNative = video.canPlayType('application/vnd.apple.mpegurl');

        if (canNative) {
            if (!video.src) {
                video.src = source;
            }
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsInstance) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.__hlsInstance = hls;
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.play().catch(function () {});
            }
            return;
        }

        if (!video.src) {
            video.src = source;
        }
        video.play().catch(function () {});
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var overlay = shell.querySelector('.player-overlay');
        var video = shell.querySelector('video');

        if (overlay) {
            overlay.addEventListener('click', function () {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!video.src) {
                    startPlayer(shell);
                }
            });
        }
    });
})();
