(function () {
  const scriptSrc = document.currentScript ? document.currentScript.src : '';
  const baseURL = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);

  const FRAMES = ['frog1', 'frog2', 'leap1'];
  const DIRS = ['left', 'right'];

  const LOITER_FLIP_MS = 800;
  const LOITER_DIR_CHANGE_MIN_MS = 5000;
  const LOITER_DIR_CHANGE_RATE = 0.006;
  const JUMP_INTERVAL_MIN_MS = 15000;
  const JUMP_WINDUP_FRAME_MS = 200;
  const FROG_HEIGHT_PX = 40;

  const sources = {};
  FRAMES.forEach(name => DIRS.forEach(dir => {
    sources[`${name}-${dir}`] = baseURL + 'frog/' + name + '-' + dir + '.png';
  }));

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    const navLinks = document.querySelectorAll('nav a');
    if (navLinks.length < 2) return;

    const frog = document.createElement('div');
    frog.id = 'frog';
    frog.setAttribute('aria-hidden', 'true');

    const frogImgs = {};
    Object.keys(sources).forEach(key => {
      const img = document.createElement('img');
      img.src = sources[key];
      img.alt = '';
      img.draggable = false;
      frog.appendChild(img);
      frogImgs[key] = img;
    });

    document.body.appendChild(frog);

    let pending = Object.keys(frogImgs).length;
    Object.values(frogImgs).forEach(img => {
      if (img.complete) {
        if (--pending === 0) start();
      } else {
        img.addEventListener('load', () => { if (--pending === 0) start(); });
        img.addEventListener('error', () => { if (--pending === 0) start(); });
      }
    });

    function start() {
      let currentTab = Math.floor(Math.random() * navLinks.length);
      let direction = Math.random() < 0.5 ? 'left' : 'right';
      let task = 'loiter';
      let loiterFrame = 0;
      let lastLoiterFlip = performance.now();
      let lastDirChange = performance.now();
      let lastJumpEnd = performance.now();
      let jumpState = null;
      let currentKey = null;

      function setFrame(name, dir) {
        const key = `${name}-${dir}`;
        if (key === currentKey) return;
        if (currentKey) frogImgs[currentKey].classList.remove('active');
        frogImgs[key].classList.add('active');
        currentKey = key;
      }

      function tabAnchorPoint(index) {
        const link = navLinks[index];
        const rect = link.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const bs = getComputedStyle(document.body);
        const borderL = parseFloat(bs.borderLeftWidth) || 0;
        const borderT = parseFloat(bs.borderTopWidth) || 0;
        return {
          x: rect.left - bodyRect.left - borderL + rect.width / 2,
          y: rect.top - bodyRect.top - borderT,
        };
      }

      function placeFrog(x, y) {
        frog.style.left = (x - frog.offsetWidth / 2) + 'px';
        frog.style.top = (y - FROG_HEIGHT_PX) + 'px';
      }

      function startJump(now) {
        let target;
        do {
          target = Math.floor(Math.random() * navLinks.length);
        } while (target === currentTab);

        const startPos = tabAnchorPoint(currentTab);
        const endPos = tabAnchorPoint(target);
        direction = endPos.x >= startPos.x ? 'right' : 'left';

        const distance = Math.abs(endPos.x - startPos.x);
        const travelDuration = Math.max(350, distance * 1.6);

        jumpState = {
          startTime: now,
          startPos,
          endPos,
          target,
          travelDuration,
          peakHeight: Math.max(35, distance * 0.45),
          phase: 'windup1',
        };
        task = 'jump';
        setFrame('frog1', direction);
      }

      function loiterTick(now) {
        const pos = tabAnchorPoint(currentTab);
        placeFrog(pos.x, pos.y);

        if (now - lastLoiterFlip >= LOITER_FLIP_MS) {
          loiterFrame = 1 - loiterFrame;
          lastLoiterFlip = now;
          setFrame(loiterFrame === 0 ? 'frog1' : 'frog2', direction);
        }

        if (now - lastDirChange >= LOITER_DIR_CHANGE_MIN_MS &&
            Math.random() < LOITER_DIR_CHANGE_RATE) {
          direction = direction === 'left' ? 'right' : 'left';
          lastDirChange = now;
          setFrame(loiterFrame === 0 ? 'frog1' : 'frog2', direction);
        }

        if (now - lastJumpEnd >= JUMP_INTERVAL_MIN_MS) {
          startJump(now);
        }
      }

      function jumpTick(now) {
        const elapsed = now - jumpState.startTime;
        const { startPos, endPos, travelDuration, peakHeight } = jumpState;
        const windupTotal = 3 * JUMP_WINDUP_FRAME_MS;

        if (elapsed < JUMP_WINDUP_FRAME_MS) {
          placeFrog(startPos.x, startPos.y);
        } else if (elapsed < 2 * JUMP_WINDUP_FRAME_MS) {
          placeFrog(startPos.x, startPos.y);
          if (jumpState.phase !== 'windup2') {
            jumpState.phase = 'windup2';
            setFrame('frog2', direction);
          }
        } else if (elapsed < windupTotal) {
          placeFrog(startPos.x, startPos.y);
          if (jumpState.phase !== 'leap') {
            jumpState.phase = 'leap';
            setFrame('leap1', direction);
          }
        } else if (elapsed < windupTotal + travelDuration) {
          if (jumpState.phase !== 'air') {
            jumpState.phase = 'air';
            setFrame('frog2', direction);
          }
          const t = (elapsed - windupTotal) / travelDuration;
          const x = startPos.x + (endPos.x - startPos.x) * t;
          const arc = -4 * peakHeight * t * (1 - t);
          const y = startPos.y + (endPos.y - startPos.y) * t + arc;
          placeFrog(x, y);
        } else {
          currentTab = jumpState.target;
          const pos = tabAnchorPoint(currentTab);
          placeFrog(pos.x, pos.y);
          task = 'loiter';
          jumpState = null;
          lastJumpEnd = now;
          loiterFrame = 0;
          lastLoiterFlip = now;
          setFrame('frog1', direction);
        }
      }

      function tick() {
        const now = performance.now();
        if (task === 'loiter') loiterTick(now);
        else jumpTick(now);
        requestAnimationFrame(tick);
      }

      const initPos = tabAnchorPoint(currentTab);
      placeFrog(initPos.x, initPos.y);
      setFrame('frog1', direction);
      frog.classList.add('ready');
      requestAnimationFrame(tick);
    }
  });
})();
