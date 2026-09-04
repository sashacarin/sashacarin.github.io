/* Board-style collage background.
 *
 * Paints a fixed, full-viewport grid of equal-size cropped tiles behind the
 * page column. Tiles with an `href` are clickable; the rest are decoration.
 *
 * To add a tile: drop an image in assets/collage/ (keep it small, ~440px on
 * the long edge is plenty) and add an entry to TILES below.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- tiles
  // src   -- path from the site root
  // href  -- optional link (site-root-relative, or absolute with a scheme)
  // label -- tooltip + accessible name; required when there is an href
  // fit   -- 'contain' letterboxes instead of cropping (banners, sprites)
  // pixel -- true to render with hard pixel edges instead of smoothing
  var TILES = [
    { src: 'assets/collage/qween.jpg',             href: 'index.html',     label: 'sashaslib — home' },
    { src: 'assets/collage/this-heat.jpg',         href: 'media.html',     label: 'This Heat — Horizontal Hold' },
    { src: 'assets/collage/beach.jpg',             href: 'bits.html',      label: 'bits' },
    { src: 'assets/collage/sprain.jpg',            href: 'media.html',     label: 'Sprain — Man Proposes, God Disposes' },
    { src: 'assets/collage/guestbook-button.gif',  href: 'guestbook.html', label: 'sign my guestbook', fit: 'contain', pixel: true },
    { src: 'assets/collage/bjork.jpg',             href: 'media.html',     label: 'Björk — Possibly Maybe' },
    { src: 'assets/collage/frog.png',                                                                  fit: 'contain', pixel: true },
    { src: 'assets/collage/leechmilk.jpg',         href: 'media.html',     label: 'Leechmilk — Descending' },
    { src: 'assets/collage/beach-pixel.png',                                                           fit: 'contain', pixel: true },
    { src: 'assets/collage/dangelo.jpg',           href: 'media.html',     label: 'D’Angelo — Send It On' },
    { src: 'assets/collage/greensmilies.gif',      href: 'blog.html',      label: 'blog',              fit: 'contain', pixel: true },
    { src: 'assets/collage/suburban-lawns.jpg',    href: 'media.html',     label: 'Suburban Lawns — Gossip' }
  ];

  // Below this width the page column covers the whole viewport, so there is
  // nothing to see and no reason to pull the images down.
  var MIN_WIDTH = 760;

  // ----------------------------------------------------------------- base
  // Derive the site root from this script's own src, so it works from
  // posts/ as well as the top level.
  var base = '';
  var scripts = document.getElementsByTagName('script');
  for (var s = 0; s < scripts.length; s++) {
    var src = scripts[s].getAttribute('src') || '';
    var marker = 'assets/collage.js';
    if (src.slice(-marker.length) === marker) {
      base = src.slice(0, src.length - marker.length);
      break;
    }
  }

  function url(path) {
    return /^[a-z]+:|^\/\//i.test(path) ? path : base + path;
  }

  // --------------------------------------------------------------- layout
  function tileSize(width) {
    return Math.max(84, Math.min(146, Math.round(width / 10)));
  }

  // Deterministic pseudo-random in 0..1, stable for a given cell index.
  function noise(i, salt) {
    var h = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return h - Math.floor(h);
  }

  // ---------------------------------------------------------------- cells
  // Every cell is an <a>; the ones without an href just sit there as
  // decoration. Keeping one element type means a relayout can repaint a
  // cell in place instead of rebuilding it.
  //
  // The whole board is hidden from assistive tech and taken out of the tab
  // order: it's wallpaper, and every link in it is a shortcut to somewhere
  // the nav already goes. Without that, tabbing into a page would mean
  // stepping through ~80 decorative links to get anywhere.
  function makeCell(i) {
    var el = document.createElement('a');
    el.className = 'collage-tile';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--rot', ((noise(i, 1) * 2 - 1) * 2.6).toFixed(2) + 'deg');
    el.appendChild(document.createElement('img'));
    return el;
  }

  function paintCell(el, t) {
    if (t.href) {
      el.href = url(t.href);
      el.title = t.label;
    } else {
      el.removeAttribute('href');
      el.removeAttribute('title');
    }

    var img = el.firstChild;
    var src = url(t.src);
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    img.className = (t.fit === 'contain' ? 'contain' : '') +
                    (t.pixel ? ' pixel' : '');
  }

  // --------------------------------------------------------------- render
  var board = null;
  var cells = [];

  function layout() {
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (w < MIN_WIDTH) {
      if (board) board.hidden = true;
      return;
    }

    if (!board) {
      board = document.createElement('div');
      board.id = 'collage';
      document.body.appendChild(board);
    }
    board.hidden = false;

    var size = tileSize(w);
    // One extra row and column: the tiles are tilted, so a board sized
    // exactly to the viewport would show backing along the edges.
    var cols = Math.ceil(w / size) + 1;
    var rows = Math.ceil(h / size) + 1;
    var want = cols * rows;

    board.style.gridTemplateColumns = 'repeat(' + cols + ', ' + size + 'px)';
    board.style.gridAutoRows = size + 'px';

    while (cells.length < want) {
      var cell = makeCell(cells.length);
      cells.push(cell);
      board.appendChild(cell);
    }
    while (cells.length > want) board.removeChild(cells.pop());

    // Scatter the tiles rather than stepping through them in order: a fixed
    // stride lines identical images up into diagonal stripes. Skip forward
    // whenever the pick collides with the cell to the left or the one above,
    // so no tile ever touches a copy of itself.
    var chosen = [];
    for (var i = 0; i < cells.length; i++) {
      var pick = Math.floor(noise(i, 2) * TILES.length) % TILES.length;
      var left = (i % cols) ? chosen[i - 1] : -1;
      var above = i >= cols ? chosen[i - cols] : -1;
      for (var guard = 0; guard < TILES.length; guard++) {
        if (pick !== left && pick !== above) break;
        pick = (pick + 1) % TILES.length;
      }
      chosen[i] = pick;
      paintCell(cells[i], TILES[pick]);
    }
  }

  var pending = null;
  function onResize() {
    if (pending) clearTimeout(pending);
    pending = setTimeout(layout, 150);
  }

  function start() {
    layout();
    window.addEventListener('resize', onResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
