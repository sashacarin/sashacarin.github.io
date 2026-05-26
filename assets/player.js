(function () {
  var KEY = 'bgPlayer';
  var tracks = [
    'media/bjork-possibly-maybe.mp3',
    'media/brakhage-jamtland.mp3',
    'media/dangelo-send-it-on.mp3',
    'media/leechmilk-descending.mp3',
    'media/sprain-man-proposes-god-disposes.mp3',
    'media/suburban-lawns-gossip.mp3',
    'media/this-heat-horizontal-hold.mp3'
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();
  if (!state || !Array.isArray(state.order) || state.order.length !== tracks.length) {
    var order = tracks.slice();
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = order[i]; order[i] = order[j]; order[j] = t;
    }
    state = { order: order, index: 0, time: 0, playing: true };
    save();
  }

  var audio = document.getElementById('bg-music');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'bg-music';
    document.body.appendChild(audio);
  }

  audio.src = state.order[state.index];
  audio.addEventListener('loadedmetadata', function once() {
    audio.removeEventListener('loadedmetadata', once);
    if (state.time) { try { audio.currentTime = state.time; } catch (e) {} }
  });

  audio.addEventListener('ended', function () {
    state.index = (state.index + 1) % state.order.length;
    state.time = 0;
    save();
    audio.src = state.order[state.index];
    audio.play();
  });

  var lastSave = 0;
  audio.addEventListener('timeupdate', function () {
    state.time = audio.currentTime;
    var now = Date.now();
    if (now - lastSave > 1000) { lastSave = now; save(); }
  });

  window.addEventListener('pagehide', function () {
    state.time = audio.currentTime;
    save();
  });

  function play() {
    state.playing = true;
    save();
    return audio.play();
  }
  function pause() {
    state.playing = false;
    save();
    audio.pause();
  }

  var toggle = document.getElementById('music-toggle');
  if (!toggle) {
    toggle = document.createElement('img');
    toggle.id = 'music-toggle';
    toggle.className = 'music-toggle-floating';
    toggle.src = 'assets/greensmilies.gif';
    toggle.alt = 'pause/unpause music';
    toggle.width = 88;
    toggle.height = 31;
    document.body.appendChild(toggle);
  }
  toggle.addEventListener('click', function () {
    if (audio.paused) play(); else pause();
  });

  if (state.playing) {
    play().catch(function () {
      var resume = function () {
        play();
        document.removeEventListener('click', resume);
        document.removeEventListener('keydown', resume);
      };
      document.addEventListener('click', resume);
      document.addEventListener('keydown', resume);
    });
  }
})();
