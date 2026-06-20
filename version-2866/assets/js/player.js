import { H as Hls } from './hls-dru42stk.js';

function initPlayers() {
  var players = document.querySelectorAll('.movie-player');
  players.forEach(function (video) {
    var source = video.dataset.src;
    var card = video.closest('.player-card');
    var overlay = card ? card.querySelector('.player-overlay') : null;
    var trigger = overlay ? overlay.querySelector('.play-trigger') : null;
    var hlsInstance = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function attachSource() {
      if (!source) {
        return Promise.reject(new Error('missing video source'));
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return video.play();
      }

      if (Hls && Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
        return video.play();
      }

      video.src = source;
      return video.play();
    }

    function play() {
      attachSource()
        .then(hideOverlay)
        .catch(function () {
          if (overlay) {
            var message = overlay.querySelector('p');
            if (message) {
              message.textContent = '播放源加载失败，请检查对应 m3u8 文件是否存在。';
            }
          }
        });
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('play', hideOverlay);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayers);
} else {
  initPlayers();
}
