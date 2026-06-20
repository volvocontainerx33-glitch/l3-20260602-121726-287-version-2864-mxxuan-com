(function () {
  function setup(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    var status = root.querySelector('[data-player-status]');
    var stream = root.getAttribute('data-stream') || '';
    var hls = null;
    var loaded = false;

    if (!video || !button) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function attach() {
      if (loaded) {
        return true;
      }

      if (!stream) {
        setStatus('视频暂未就绪');
        return false;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放暂时不可用');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        setStatus('该设备暂不支持在线播放');
        return false;
      }

      loaded = true;
      return true;
    }

    function start() {
      if (!attach()) {
        return;
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          root.classList.add('is-playing');
          setStatus('');
        }).catch(function () {
          setStatus('点击视频区域继续播放');
        });
      } else {
        root.classList.add('is-playing');
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      root.classList.remove('is-playing');
    });
    video.addEventListener('ended', function () {
      root.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setup);
})();
