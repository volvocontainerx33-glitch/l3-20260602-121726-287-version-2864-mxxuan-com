(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
            thumbs.forEach(function (thumb, position) {
                thumb.classList.toggle("is-active", position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        var next = document.querySelector("[data-hero-next]");
        var prev = document.querySelector("[data-hero-prev]");
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
        }
        start();
    }

    function setupFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-filter-value]"));
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    cards.forEach(function (card) {
                        var text = [
                            card.getAttribute("data-title") || "",
                            card.getAttribute("data-year") || "",
                            card.getAttribute("data-genre") || "",
                            card.getAttribute("data-tags") || "",
                            card.getAttribute("data-region") || ""
                        ].join(" ");
                        card.classList.toggle("is-hidden", value !== "all" && text.indexOf(value) === -1);
                    });
                });
            });
        });
    }

    function setupSearch() {
        var panel = document.querySelector("[data-search-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var form = panel.querySelector("[data-search-form]");
        var results = panel.querySelector("[data-search-results]");
        var triggers = Array.prototype.slice.call(document.querySelectorAll(".search-toggle"));
        var closers = Array.prototype.slice.call(panel.querySelectorAll(".search-close"));

        function openPanel() {
            document.body.classList.add("search-open");
            panel.setAttribute("aria-hidden", "false");
            window.setTimeout(function () {
                if (input) {
                    input.focus();
                }
            }, 60);
        }

        function closePanel() {
            document.body.classList.remove("search-open");
            panel.setAttribute("aria-hidden", "true");
        }

        function itemTemplate(item) {
            return "<a class=\"search-result-card\" href=\"" + item.url + "\">" +
                "<img src=\"" + item.image + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                "<span><strong>" + escapeHtml(item.title) + "</strong>" +
                "<p>" + escapeHtml(item.description) + "</p></span></a>";
        }

        function render() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var index = window.SEARCH_INDEX || [];
            if (!query) {
                results.innerHTML = "<div class=\"empty-result\">输入关键词即可查找影片。</div>";
                return;
            }
            var matched = index.filter(function (item) {
                return item.text.toLowerCase().indexOf(query) !== -1;
            }).slice(0, 18);
            if (!matched.length) {
                results.innerHTML = "<div class=\"empty-result\">没有找到匹配影片。</div>";
                return;
            }
            results.innerHTML = matched.map(itemTemplate).join("");
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", openPanel);
        });
        closers.forEach(function (closer) {
            closer.addEventListener("click", closePanel);
        });
        if (input) {
            input.addEventListener("input", render);
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render();
            });
        }
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closePanel();
            }
        });
        render();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (container) {
            var video = container.querySelector("video");
            var button = container.querySelector("[data-player-play]");
            var error = container.querySelector("[data-player-error]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream") || "";
            var initialized = false;
            var failed = false;

            function readyState() {
                container.classList.add("is-ready");
            }

            function showError(message) {
                failed = true;
                readyState();
                if (error) {
                    error.textContent = message;
                }
            }

            function initialize() {
                if (initialized || failed) {
                    return;
                }
                initialized = true;
                if (!stream) {
                    showError("视频暂时不可用，请稍后重试。");
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, readyState);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError("视频加载暂时不可用，请稍后重试。");
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", readyState, { once: true });
                } else {
                    showError("当前设备暂不支持该视频格式。");
                }
            }

            function togglePlay(event) {
                if (event) {
                    event.preventDefault();
                }
                initialize();
                if (failed) {
                    return;
                }
                if (video.paused) {
                    var playPromise = video.play();
                    if (playPromise && playPromise.catch) {
                        playPromise.catch(function () {});
                    }
                } else {
                    video.pause();
                }
            }

            initialize();
            if (button) {
                button.addEventListener("click", togglePlay);
            }
            video.addEventListener("click", togglePlay);
            video.addEventListener("play", function () {
                container.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                container.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                container.classList.remove("is-playing");
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearch();
        setupPlayers();
    });
})();
