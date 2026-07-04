/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */

(function () {
  'use strict';

  // ===== ナビゲーション =====
  const nav       = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu   = document.querySelector('.nav-menu');
  const navLinks  = document.querySelectorAll('.nav-link');

  const progressBar = document.getElementById('scroll-progress');

  // スクロール時にナビの背景を変える＋進捗バー更新
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
    if (progressBar) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      progressBar.style.transform = 'scaleX(' + ratio + ')';
    }
  }

  // ハンバーガーメニュー
  navToggle.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // メニューリンクをクリックしたら閉じる
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ===== スクロールスパイ（アクティブなセクションをナビに反映） =====
  const sections = Array.from(document.querySelectorAll('section[id]'));

  function updateActiveLink() {
    const offset = window.scrollY + 100;

    let current = sections[0].id;
    sections.forEach(function (section) {
      if (section.offsetTop <= offset) {
        current = section.id;
      }
    });

    // ページ最下部付近では、高さの低い最終セクションでも確実にアクティブにする
    const doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
      current = sections[sections.length - 1].id;
    }

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute('href') === '#' + current;
      link.classList.toggle('active', isActive);
    });
  }

  // モーション低減を希望するユーザーか
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== フェードインアニメーション（IntersectionObserver） =====
  function initFadeIn() {
    const targets = document.querySelectorAll(
      '.section-header, .timeline-item, .vision-card, ' +
      '.research-card, .research-figure, .tool-card, .skill-bar, ' +
      '.hobby-card, .edu-item, .pub-item, .work-card, .gallery-item'
    );

    // モーション低減時はアニメせず、そのまま表示（内容が消えない）
    if (reduceMotion) return;

    targets.forEach(function (el) {
      el.classList.add('fade-in');
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // 少しずつ遅延してフェードイン。
            // 高速スクロールで一度に多数が交差しても遅延が累積し過ぎない
            // よう上限を設け、内容が長く空白に見えるのを防ぐ。
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, Math.min(i, 4) * 45);
            observer.unobserve(entry.target);
          }
        });
      },
      // ビューポート下端の少し手前で発火させ、要素が画面に入る頃には
      // ほぼ表示し終えているようにする（スクロール中の大きな空白を防ぐ）。
      { threshold: 0, rootMargin: '0px 0px 12% 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== C. キャリア年表の縦線を伸ばす =====
  function initTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline || reduceMotion || !('IntersectionObserver' in window)) return;

    timeline.classList.add('tl-pending');
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            timeline.classList.add('tl-grow');
            obs.unobserve(timeline);
          }
        });
      },
      { threshold: 0.1 }
    );
    obs.observe(timeline);
  }

  // ===== スキルバーアニメーション =====
  function initSkillBars() {
    const fills = document.querySelectorAll('.skill-bar-fill');
    if (fills.length === 0) return;

    // モーション低減時はアニメせず、満たした状態で即表示
    if (reduceMotion) {
      fills.forEach(function (fill) { fill.classList.add('animated'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    fills.forEach(function (fill) {
      observer.observe(fill);
    });
  }

  // ===== フォトギャラリー ライトボックス =====
  function initLightbox() {
    const items = document.querySelectorAll('.gallery-item img');
    if (items.length === 0) return;

    // オーバーレイを生成
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '写真の拡大表示');
    box.innerHTML =
      '<button class="lightbox-close" aria-label="閉じる">&times;</button>' +
      '<img alt="">' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(box);

    const boxImg     = box.querySelector('img');
    const boxCaption = box.querySelector('.lightbox-caption');
    const closeBtn   = box.querySelector('.lightbox-close');
    let lastFocused  = null; // 開く前のフォーカス位置（閉じたら戻す）

    function open(src, alt, caption, trigger) {
      lastFocused = trigger || null;
      boxImg.src = src;
      boxImg.alt = alt;
      boxCaption.textContent = caption;
      box.classList.add('open');
      closeBtn.focus(); // 開いたらフォーカスをモーダル内へ移す
    }
    function close() {
      if (!box.classList.contains('open')) return;
      box.classList.remove('open');
      // フォーカスを開く前の要素へ戻す（キーボード操作の文脈を保つ）
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
      lastFocused = null;
    }

    items.forEach(function (img) {
      // クリックだけでなくキーボードでも開けるよう、操作可能な要素にする
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', (img.alt || '写真') + 'を拡大表示');

      const fig = img.closest('.gallery-item');
      const cap = fig ? fig.querySelector('figcaption') : null;
      const capText = cap ? cap.textContent : '';

      function trigger() { open(img.src, img.alt, capText, img); }
      img.addEventListener('click', trigger);
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // スペースでのスクロールを抑止
          trigger();
        }
      });
    });

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (e) {
      if (e.target === box) close(); // 背景クリックで閉じる
    });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'Tab') {
        // モーダル内にフォーカスを閉じ込める（操作可能要素は閉じるボタンのみ）
        e.preventDefault();
        closeBtn.focus();
      }
    });
  }

  // ===== 初期化 =====
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初回実行

  if ('IntersectionObserver' in window) {
    initFadeIn();
    initSkillBars();
    initTimeline();
  } else {
    // IntersectionObserver 非対応：アニメに頼らず全要素を表示状態にする
    document.querySelectorAll('.skill-bar-fill').forEach(function (fill) {
      fill.classList.add('animated');
    });
    // .fade-in は付与していないため要素は既定で可視（追加処理は不要）
  }
  initLightbox();
})();
