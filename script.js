// メニュー（SP） ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const trigger   = document.querySelector(".menu-trigger");
  const closeBtn  = document.querySelector(".menu__close");
  const menu      = document.querySelector(".menu");
  const bg        = document.querySelector(".menu__bg");
  const container = document.querySelector(".menu__container");

  let scrollY = 0;

  if (!(trigger && closeBtn && menu && bg && container)) return;

  // スクロールバー幅を算出
  const getScrollbarWidth = () =>
    window.innerWidth - document.documentElement.clientWidth;

  // 開く
  const openMenu = (e) => {
    e?.preventDefault?.();

    scrollY = window.scrollY;

    // 背景スクロールを止める（position:fixedは使わない）
    const sbw = getScrollbarWidth();
    document.body.classList.add("no-scroll");
    document.body.style.paddingRight = sbw ? `${sbw}px` : "";

    // トリガーとクローズボタンの見た目ずれ対策（任意）
    trigger.style.marginRight  = sbw ? `${sbw}px` : "";
    closeBtn.style.marginRight = sbw ? `${sbw}px` : "";

    // メニューを現在のスクロール位置に配置して表示
    menu.style.top = `${scrollY}px`;   // ← ここがポイント（absolute前提）
    menu.style.display = "block";

    trigger.style.display = "none";
    closeBtn.style.display = "block";

    // アニメーション
    bg.classList.add("menu__bg--active");
    setTimeout(() => {
      container.classList.add("menu__container--active");
    }, 40);
  };

  // 閉じる
  const closeMenu = (e) => {
    e?.preventDefault?.();

    container.classList.remove("menu__container--active");
    bg.classList.remove("menu__bg--active");
    bg.style.opacity = "0";

    trigger.style.display = "block";
    closeBtn.style.display = "none";

    setTimeout(() => {
      // メニュー非表示
      menu.style.display = "none";
      menu.style.top = ""; // お掃除

      // 背景スクロールを解放（scroll位置はいじらない）
      document.body.classList.remove("no-scroll");
      document.body.style.paddingRight = "";

      // 余計なインラインスタイルお掃除
      trigger.style.marginRight = "";
      closeBtn.style.marginRight = "";
      bg.style.opacity = "";
    }, 300);
  };

  trigger.addEventListener("click", openMenu, { passive: false });
  closeBtn.addEventListener("click", closeMenu, { passive: false });

  // メニュー内リンク（#）クリック時も閉じる＋スムーススクロールはCSSで
  const internalLinks = container.querySelectorAll('a[href^="#"]');
  internalLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      // 先に閉じる（アニメ完了後にスクロール）
      container.classList.remove("menu__container--active");
      bg.classList.remove("menu__bg--active");
      bg.style.opacity = "0";
      trigger.style.display = "block";
      closeBtn.style.display = "none";

      setTimeout(() => {
        menu.style.display = "none";
        menu.style.top = "";
        document.body.classList.remove("no-scroll");
        document.body.style.paddingRight = "";
        trigger.style.marginRight = "";
        closeBtn.style.marginRight = "";
        bg.style.opacity = "";

        // CSSの
        // html { scroll-behavior: smooth; }
        // が効いていればこれで滑らかに移動
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    });
  });
});








// メニュー（PC） ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("#home, #about-me, #work, #contact");
  const menuLinks = document.querySelectorAll(".side-menu.menu-pc a");

  // リンクに対応する画像の通常・アクティブsrc
  const iconMap = {
    "home": {
      default: "img/menu-icon-home.svg",
      active: "img/menu-icon-home-active.svg"
    },
    "about-me": {
      default: "img/menu-icon-aboutme.svg",
      active: "img/menu-icon-aboutme-active.svg"
    },
    "work": {
      default: "img/menu-icon-work.svg",
      active: "img/menu-icon-work-active.svg"
    },
    "contact": {
      default: "img/menu-icon-contact.svg",
      active: "img/menu-icon-contact-active.svg"
    }
  };

  // 初期表示：homeをカレントに＋アイコン切り替え
  const homeLink = document.querySelector('.side-menu.menu-pc a[href="#home"]');
  if (homeLink) {
    homeLink.classList.add("current");
    const img = homeLink.querySelector("img");
    if (img) img.src = iconMap["home"].active;
  }

  window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    let currentId = "";

    if (scroll < 100) {
      // 一番上はHome固定
      menuLinks.forEach(link => {
        link.classList.remove("current");
        const href = link.getAttribute("href").replace("#", "");
        const img = link.querySelector("img");
        if (img && iconMap[href]) img.src = iconMap[href].default;
      });
      if (homeLink) {
        homeLink.classList.add("current");
        const img = homeLink.querySelector("img");
        if (img) img.src = iconMap["home"].active;
      }
      return;
    }

    // スクロール位置から currentId 判定
    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + scroll;
      if (scroll >= top - 300) {
        currentId = section.getAttribute("id");
      }
    });

    // current クラスとアイコン切り替え
    menuLinks.forEach((link) => {
      const href = link.getAttribute("href").replace("#", "");
      const img = link.querySelector("img");
      if (href === currentId) {
        link.classList.add("current");
        if (img && iconMap[href]) img.src = iconMap[href].active;
      } else {
        link.classList.remove("current");
        if (img && iconMap[href]) img.src = iconMap[href].default;
      }
    });
  });
});








// KV出現 ------------------------------------------------------------------
/*(function () {
  // アニメさせる“可動系”だけに限定（side-menu / menu-trigger は対象外）
  const TARGETS = [
    ['header h1',           0],
    ['.KV-img .hero-img',   0],
    ['.KV-text',            400],
    ['.menu-trigger.menu-mobile', 800], // SP用メニューボタン
    ['.side-menu',                 800] // PC用サイドメニュー
  ];

  let io = null;

  function cleanup() {
    if (io) { try { io.disconnect(); } catch (_) {} }
    io = null;
  }

  // 指定要素に ani-home-mv を（まだ付いてなければ）付与
  function prime(el) {
    if (!el) return;
    if (!el.classList.contains('ani-home-mv')) {
      el.classList.add('ani-home-mv');
    }
  }

  // 画面内判定
  function inViewport(el) {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom >= 0 && r.right >= 0 && r.top <= vh && r.left <= vw;
  }

  // 安定表示（ダブルRAFで描画確定後に isView 付与）
  function reveal(el, delay) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof delay === 'number' && delay > 0) {
          setTimeout(() => el.classList.add('isView'), delay);
        } else {
          el.classList.add('isView');
        }
      });
    });
  }

  function init() {
    cleanup();

    // 1) 初期化フェーズ：まず body に js-inited を付ける（この瞬間から初期opacityが効く）
    //    いきなり付けるとFCPと競合することがあるのでダブルRAF
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('js-inited');
      });
    });

    // 2) 対象に ani-home-mv を付けて監視開始
    const items = TARGETS.map(([sel, delay]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      prime(el);
      return { el, delay };
    }).filter(Boolean);

    if (!items.length) return;

    io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        const def = TARGETS.find(([sel]) => target.matches(sel));
        const delay = def ? def[1] : 0;
        reveal(target, delay);
        try { io.unobserve(target); } catch (_) {}
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

    items.forEach(({ el, delay }) => {
      try { io.observe(el); } catch (_) {}
      // すでに画面内なら即表示（delayは尊重）
      if (inViewport(el)) {
        reveal(el, delay);
        try { io.unobserve(el); } catch (_) {}
      }
    });
  }

  // 初回は load 後（レイアウト安定）に実行
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, { once: true });

  // bfcache 復元でも再初期化（戻る/進む）
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) init();
  });

  // まれな復元パスの保険
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // どれか未表示なら再初期化
      const missing = TARGETS.some(([sel]) => {
        const el = document.querySelector(sel);
        return el && !el.classList.contains('isView');
      });
      if (missing) init();
    }
  });

  // レイアウト切替の救済
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      TARGETS.forEach(([sel, delay]) => {
        const el = document.querySelector(sel);
        if (el && !el.classList.contains('isView') && inViewport(el)) {
          reveal(el, delay);
          try { io && io.unobserve(el); } catch (_) {}
        }
      });
    }, 120);
  }, { passive: true });
})();
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.querySelectorAll('.ani-home-mv').forEach(el => {
      el.classList.add('isView');
    });
    init();
  }
});*/
/*(function () {
  const TARGETS = [
    ['header h1', 0],
    ['.KV-img .hero-img', 0],
    ['.KV-text', 400],
    ['.menu-trigger.menu-mobile', 800],
    ['.side-menu', 800]
  ];

  let io = null;

  function cleanup() {
    if (io) { try { io.disconnect(); } catch (_) {} }
    io = null;
  }

  function prime(el) {
    if (!el) return;
    if (!el.classList.contains('ani-home-mv')) {
      el.classList.add('ani-home-mv');
    }
  }

  function inViewport(el) {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom >= 0 && r.right >= 0 && r.top <= vh && r.left <= vw;
  }

  function reveal(el, delay) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof delay === 'number' && delay > 0) {
          setTimeout(() => el.classList.add('isView'), delay);
        } else {
          el.classList.add('isView');
        }
      });
    });
  }

  function init() {
    cleanup();

    // JS初期化完了 → フェード制御を有効化
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('js-inited');
      });
    });

    const items = TARGETS.map(([sel, delay]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      prime(el);
      return { el, delay };
    }).filter(Boolean);

    if (!items.length) return;

    io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        const def = TARGETS.find(([sel]) => target.matches(sel));
        const delay = def ? def[1] : 0;
        reveal(target, delay);
        try { io.unobserve(target); } catch (_) {}
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

    items.forEach(({ el, delay }) => {
      try { io.observe(el); } catch (_) {}
      if (inViewport(el)) {
        reveal(el, delay);
        try { io.unobserve(el); } catch (_) {}
      }
    });
  }

  // 初回ロード
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, { once: true });

  // ★ bfcache復元時：まず即表示 → その後 init（順番が最重要）
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.querySelectorAll('.ani-home-mv').forEach(el => {
        el.classList.add('isView'); // 即表示でチラつき防止
      });
      init(); // その後に初期化
    }
  });

  // visibilitychange（Safari対策）
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const missing = TARGETS.some(([sel]) => {
        const el = document.querySelector(sel);
        return el && !el.classList.contains('isView');
      });
      if (missing) init();
    }
  });

  // レイアウト変化時の救済
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      TARGETS.forEach(([sel, delay]) => {
        const el = document.querySelector(sel);
        if (el && !el.classList.contains('isView') && inViewport(el)) {
          reveal(el, delay);
          try { io && io.unobserve(el); } catch (_) {}
        }
      });
    }, 120);
  }, { passive: true });

})();*/
(function () {
  const TARGETS = [
    ['header h1', 0],
    ['.KV-img .hero-img', 0],
    ['.KV-text', 400],
    ['.menu-trigger.menu-mobile', 800],
    ['.side-menu', 800]
  ];

  let io = null;

  function cleanup() {
    if (io) { try { io.disconnect(); } catch (_) {} }
    io = null;
  }

  function prime(el) {
    if (!el) return;
    if (!el.classList.contains('ani-home-mv')) {
      el.classList.add('ani-home-mv');
    }
  }

  function inViewport(el) {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom >= 0 && r.right >= 0 && r.top <= vh && r.left <= vw;
  }

  function reveal(el, delay) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof delay === 'number' && delay > 0) {
          setTimeout(() => el.classList.add('isView'), delay);
        } else {
          el.classList.add('isView');
        }
      });
    });
  }

  function init() {
    cleanup();

    // ★ ここで js-inited を付ける（ani-home-mv を付けた後）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('js-inited');
      });
    });

    const items = TARGETS.map(([sel, delay]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      prime(el);
      return { el, delay };
    }).filter(Boolean);

    if (!items.length) return;

    io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        const def = TARGETS.find(([sel]) => target.matches(sel));
        const delay = def ? def[1] : 0;
        reveal(target, delay);
        try { io.unobserve(target); } catch (_) {}
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

    items.forEach(({ el, delay }) => {
      try { io.observe(el); } catch (_) {}
      if (inViewport(el)) {
        reveal(el, delay);
        try { io.unobserve(el); } catch (_) {}
      }
    });
  }

  // 初回ロード
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, { once: true });

  // bfcache でも毎回フェードイン
  window.addEventListener('pageshow', () => {
    init();
  });

})();










// KVimgの位置 ------------------------------------------------------------------
function updateBottomPosition() {
  const img = document.querySelector('.hero-img');
  const kvImg = document.querySelector('.KV-img');
  const width = window.innerWidth;

  if (!img || !kvImg) return;

  const startWidth = 383;
  const endWidth = 318;
  const maxDiff = startWidth - endWidth; // = 65px

  if (width <= startWidth && width >= endWidth) {
    const diff = startWidth - width;
    const progress = diff / maxDiff; // 0〜1

    const bottom = -1.9 + 0.5 * progress;      // -1.9 → -1.7rem
    const minHeight = 397 + 16 * progress;     // 397 → 413px

    img.style.bottom = `${bottom}rem`;
    kvImg.style.minHeight = `${minHeight}px`;
  } else if (width < endWidth) {
    img.style.bottom = '-1.7rem';
    kvImg.style.minHeight = '413px';
  } else {
    img.style.bottom = '-1.9rem';
    kvImg.style.minHeight = '397px';
  }
}

window.addEventListener('DOMContentLoaded', updateBottomPosition);
window.addEventListener('resize', updateBottomPosition);











// about-me アニメーション ------------------------------------------------------------------
/*document.addEventListener('DOMContentLoaded', () => {
  const isPC = window.matchMedia('(min-width: 764px)').matches;
  
  // PCの場合 → .profile-innerだけフェードイン
  if (isPC) {
    const profileInner = document.querySelector('.profile-inner');
    if (profileInner) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            profileInner.classList.add('visible');
            obs.unobserve(profileInner);
          }
        });
      }, { threshold: 0.2 });
      observer.observe(profileInner);
    }
  } 
  // SPの場合 → 従来の.profileスライドイン
  else {
    const about = document.querySelector('.profile');
    if (about) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            about.classList.add('visible');
          }
        });
      }, { threshold: 0 });
      observer.observe(about);
    }
  }

  // タイムライン用のドット生成 & アニメーション（共通）
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const timelineHeight = timeline.scrollHeight;
    const spacing = 32;
    const dotCount = Math.floor(timelineHeight / spacing);

    const dotObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0 });

    // 背景ドット生成
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.style.top = `${i * spacing}px`;
      timeline.appendChild(dot);
      dotObserver.observe(dot);
    }

    // .timeline 本体をふわっと表示
    dotObserver.observe(timeline);
  }
});*/
document.addEventListener('DOMContentLoaded', () => {
  const mq = window.matchMedia('(min-width: 764px)');

  const initAnimation = () => {
    const isPC = mq.matches;
    const profileInner = document.querySelector('.profile-inner');
    const profile = document.querySelector('.profile');

    // いったん両方の visible をリセット
    profileInner?.classList.remove('visible');
    profile?.classList.remove('visible');

    // PC → profile-inner をフェードイン
    if (isPC) {
      if (profileInner) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              profileInner.classList.add('visible');
              obs.unobserve(profileInner);
            }
          });
        }, { threshold: 0.2 });
        observer.observe(profileInner);
      }
    } 
    // SP → profile をスライドイン
    else {
      if (profile) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              profile.classList.add('visible');
            }
          });
        }, { threshold: 0 });
        observer.observe(profile);
      }
    }
  };

  // 初期実行
  initAnimation();

  // リサイズ（ブレークポイント跨ぎ）にも対応
  mq.addEventListener('change', initAnimation);

  // ▼ タイムラインのドット生成（あなたのコードそのまま）
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const timelineHeight = timeline.scrollHeight;
    const spacing = 32;
    const dotCount = Math.floor(timelineHeight / spacing);

    const dotObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0 });

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.style.top = `${i * spacing}px`;
      timeline.appendChild(dot);
      dotObserver.observe(dot);
    }

    dotObserver.observe(timeline);
  }
});








//work 　アニメーション ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card-content');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });

  cards.forEach(card => observer.observe(card));
});

//work　more btn 　アニメーション
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.circle-link');

  // リップル生成ヘルパー
  function spawnRipple(x, y) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  links.forEach(link => {
    // クリック（左クリックのみ遅延、修飾キーはスルー）
    link.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault(); // 遷移をほんの少しだけ遅らせる
      spawnRipple(e.clientX, e.clientY);

      setTimeout(() => {
        window.location.href = link.href;
      }, 120); // ←ここが 0.12s
    });

    // キーボード操作（Enter/Space）
    link.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const rect = link.getBoundingClientRect();
      spawnRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);

      setTimeout(() => {
        window.location.href = link.href;
      }, 120);
    });
  });

  // 離脱時の掃除（bfcache対策）
  window.addEventListener('pagehide', () => {
    document.querySelectorAll('.ripple').forEach(r => r.remove());
  });
});








//contact ------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const circle = document.querySelector("#contact .circle-bg");
    const section = document.querySelector("#contact");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          circle.classList.add("is-visible");
          observer.unobserve(section); // 一度だけ発火
        }
      });
    }, {
      threshold: 0.3 // 表示の30%が見えたら
    });

    observer.observe(section);
  });







//下層　work　スライダー ------------------------------------------------------------------
document.querySelectorAll('.slider').forEach(initSlider);

function initSlider(root) {
  // そのスライダー配下だけを参照
  const slidesTrack = root.querySelector('.slides');
  const slideItems  = Array.from(root.querySelectorAll('.slide'));
  const prevBtn     = root.querySelector('.arrow-btn.left');
  const nextBtn     = root.querySelector('.arrow-btn.right');
  const sliderWin   = root.querySelector('.slider-window');

  // 同じ箱内の要素（pagination / caption）
  const container   = root.parentElement || root;

  // ページネーションの同期
  const pagination  = container.querySelector('.pagination');
  let dots = [];
  if (pagination) {
    const currentDots = Array.from(pagination.querySelectorAll('.dot'));
    if (currentDots.length !== slideItems.length) {
      pagination.innerHTML = '';
      for (let i = 0; i < slideItems.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        pagination.appendChild(dot);
      }
      dots = Array.from(pagination.querySelectorAll('.dot'));
    } else {
      dots = currentDots;
      dots.forEach((d, i) => d.classList.toggle('active', i === 0));
    }
  }

  // キャプション領域の用意（なければ作る）
  let captionEl = container.querySelector('.slider-caption');
  if (!captionEl) {
    captionEl = document.createElement('div');
    captionEl.className = 'slider-caption';
    captionEl.setAttribute('aria-live', 'polite');
    root.insertAdjacentElement('afterend', captionEl); // スライダーの直後
  }

  // 各スライドのキャプション文字列を抽出して配列化
  const captions = slideItems.map((slide) => {
    // 優先度: slideのdata-caption > .caption要素のテキスト > imgのdata-caption > imgのalt > ""
    const fromSlideData = slide.getAttribute('data-caption');
    if (fromSlideData) return fromSlideData.trim();

    const captionNode = slide.querySelector('.caption');
    if (captionNode && captionNode.textContent) return captionNode.textContent.trim();

    const img = slide.querySelector('img');
    if (img) {
      if (img.getAttribute('data-caption')) return img.getAttribute('data-caption').trim();
      if (img.alt) return img.alt.trim();
    }
    return '';
  });

  let current = 0;

  function getSlideWidth() {
    // slider-window の幅を1枚分として使う
    return sliderWin ? sliderWin.clientWidth : 196;
  }

  function setCaption(text) {
    const content = (text || '').trim();
    if (content) {
      captionEl.textContent = content;
      captionEl.classList.remove('is-empty');
      captionEl.setAttribute('aria-hidden', 'false');
    } else {
      captionEl.textContent = '';
      captionEl.classList.add('is-empty');
      captionEl.setAttribute('aria-hidden', 'true');
    }
  }

  function update() {
    const w = getSlideWidth();
    slidesTrack.style.transform = `translateX(-${current * w}px)`;

    // ドット反映
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // 矢印状態
    if (prevBtn) prevBtn.classList.toggle('visible', current > 0);
    if (nextBtn) nextBtn.classList.toggle('visible', current < slideItems.length - 1);

    // キャプション更新
    setCaption(captions[current]);
  }

  function goTo(index) {
    const max = slideItems.length - 1;
    current = Math.max(0, Math.min(index, max));
    update();
  }

  // 初期表示
  update();

  // クリックイベント
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));
  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  // タッチ（スマホ）
  let startX = 0;
  let dragging = false;

  const touchTarget = sliderWin || root;
  touchTarget.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
  }, { passive: true });

  touchTarget.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const diff = startX - e.touches[0].clientX;
    if (diff > 50) {
      goTo(current + 1);
      dragging = false;
    } else if (diff < -50) {
      goTo(current - 1);
      dragging = false;
    }
  }, { passive: true });

  touchTarget.addEventListener('touchend', () => {
    dragging = false;
  });

  // リサイズで追従
  window.addEventListener('resize', update);
}







//下層スライドin ------------------------------------------------------------------
(() => {
  // セレクタ：.sr または [data-sr]
  const SELECTOR = '.sr, [data-sr]';

  // オプションの既定値
  const DEFAULTS = {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px',
    once: true
  };

  // util: 値の取得（data属性を優先）
  const getOpt = (el, key, fallback) => {
    const datasetKey = `sr${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    const v = el.dataset[datasetKey];
    if (v == null) return fallback;
    if (key === 'threshold') return Number(v);
    if (key === 'once') return String(v).toLowerCase() !== 'false';
    return v;
  };

  // 遅延適用
  const applyDelay = (el) => {
    const delay = Number(el.dataset.srDelay || 0);
    if (delay > 0) el.style.transitionDelay = `${delay}ms`;
  };

  // 監視開始
  const observeAll = () => {
    const targets = Array.from(document.querySelectorAll(SELECTOR))
      // 既に表示済みは無視
      .filter(el => !el.classList.contains('is-in'));

    if (!targets.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const once = getOpt(el, 'once', DEFAULTS.once);

        if (entry.isIntersecting) {
          applyDelay(el);
          // ダブルRAFで描画安定後にis-in
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.classList.add('is-in');
              if (once) io.unobserve(el);
            });
          });
        } else {
          // 再発火型（once=false）の場合、画面外でクラスを外す
          if (!once) el.classList.remove('is-in');
        }
      });
    }, {
      threshold: DEFAULTS.threshold,
      root: null,
      rootMargin: DEFAULTS.rootMargin
    });

    // 要素ごとに個別設定
    targets.forEach(el => {
      // 要素固有のthreshold/rootMarginがあれば使うため、個別IOで監視
      const threshold = getOpt(el, 'threshold', DEFAULTS.threshold);
      const rootMargin = getOpt(el, 'rootmargin', DEFAULTS.rootMargin);
      const once = getOpt(el, 'once', DEFAULTS.once);

      // 既定と異なる場合は個別IOで監視
      if (threshold !== DEFAULTS.threshold || rootMargin !== DEFAULTS.rootMargin) {
        const io2 = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              applyDelay(el);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  el.classList.add('is-in');
                  if (once) io2.unobserve(el);
                });
              });
            } else {
              if (!once) el.classList.remove('is-in');
            }
          });
        }, { threshold, root: null, rootMargin });
        io2.observe(el);
      } else {
        io.observe(el);
      }
    });

    // bfcache/復帰時の再判定
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) observeAll();
    }, { once: true });

    // レイアウト変化での救済（軽め）
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        document.querySelectorAll(SELECTOR).forEach(el => {
          // すでに見えている・once=false の場合はそのまま
          // ここでは特に処理不要（IOに任せる）
        });
      }, 120);
    }, { passive: true });
  };

  // DOM準備後に開始（既存のDOMContentLoaded群と独立）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAll, { once: true });
  } else {
    // 既に読み込み済みなら次フレームで
    requestAnimationFrame(observeAll);
  }
})();







//下層modal ------------------------------------------------------------------
function enableImageModal(selector = 'img') {
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('img-modal-img');
  const bg = modal.querySelector('.img-modal-bg');
  const closeBtn = modal.querySelector('.img-close'); // ← 追加

  document.querySelectorAll(selector).forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // 背景クリックで閉じる
  bg.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // バツボタンで閉じる
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });
}

// open_modal だけ対象
enableImageModal('.open_modal');
