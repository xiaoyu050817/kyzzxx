/* ============================================================
   考研词汇本 — 应用逻辑（原生 JS）
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 图标 ---------------- */
  const I = {
    book:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    home:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    star:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.1 8.6 22 9.3 17 14 18.3 21 12 17.5 5.7 21 7 14 2 9.3 8.9 8.6 12 2"/></svg>',
    card:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h5"/></svg>',
    pen:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    flip:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M3.5 11a9 9 0 1 0 2.6-4.6L3 9"/></svg>',
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    x:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    l:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    r:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    chev:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    done:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14 9 11"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  };
  I.refresh = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"/></svg>';

  /* ---------------- 数据适配 ---------------- */
  const DATA = window.VOCAB_DATA;
  const SOURCES = {
    gaotu:   { key: "gaotu", label: "高途1800考研高频词", units: DATA.gaotu },
    writing: { key: "writing", label: "石雷鹏作文主题词", units: DATA.writing },
  };

  function unitItems(srcKey, ui) {
    const u = SOURCES[srcKey].units[ui];
    const raw = srcKey === "gaotu"
      ? u.words.map(function (w) { return { en: w.word, zh: w.definition }; })
      : u.phrases.map(function (p) { return { en: p.en, zh: p.zh }; });
    return raw.map(function (it, ii) {
      it.uid = srcKey + ":" + ui + ":" + ii;
      return it;
    });
  }
  function unitName(srcKey, ui) { return SOURCES[srcKey].units[ui].name; }
  function allItems(srcKey) {
    const out = [];
    SOURCES[srcKey].units.forEach(function (_, ui) {
      unitItems(srcKey, ui).forEach(function (it) { out.push(it); });
    });
    return out;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------------- 进度存储 ---------------- */
  const STORE_KEY = "kaoyan_vocab_v1";
  let store = {};
  try { store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch (e) { store = {}; }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  }
  function isKnown(uid) { const s = store[uid]; return !!(s && s.k); }
  function mark(uid, known) { store[uid] = { s: 1, k: known ? 1 : 0 }; save(); }
  function removeFromReview(uid) { const s = store[uid]; if (s) { s.k = 1; save(); } }
  function unitProgress(srcKey, ui) {
    let studied = 0, known = 0;
    unitItems(srcKey, ui).forEach(function (it) {
      const s = store[it.uid];
      if (s && s.s) studied++;
      if (s && s.k) known++;
    });
    return { total: unitItems(srcKey, ui).length, studied: studied, known: known };
  }
  function sourceProgress(srcKey) {
    let total = 0, studied = 0, known = 0;
    SOURCES[srcKey].units.forEach(function (_, ui) {
      const p = unitProgress(srcKey, ui);
      total += p.total; studied += p.studied; known += p.known;
    });
    return { total: total, studied: studied, known: known };
  }
  function reviewItems() {
    const out = [];
    ["gaotu", "writing"].forEach(function (srcKey) {
      allItems(srcKey).forEach(function (it) {
        const s = store[it.uid];
        if (s && s.s && !s.k) out.push({ src: srcKey, en: it.en, zh: it.zh, uid: it.uid });
      });
    });
    return out;
  }

  /* ---------------- 根容器 & Toast ---------------- */
  const root = document.getElementById("view");
  let toastTimer = null;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }

  /* ---------------- 视图：首页 ---------------- */
  function renderHome() {
    const g = sourceProgress("gaotu"), w = sourceProgress("writing");
    const totalAll = g.total + w.total, studiedAll = g.studied + w.studied, knownAll = g.known + w.known;
    function libCard(srcKey, cls, ico, meta) {
      const p = sourceProgress(srcKey);
      return '<button class="lib-card ' + cls + '" data-go="#/lib/' + srcKey + '">' +
        '<div class="ico">' + ico + '</div>' +
        '<h3>' + SOURCES[srcKey].label + '</h3>' +
        '<div class="meta">' + meta + '</div>' +
        '<div class="lib-foot">' +
          '<div class="mini-prog progress green"><div class="bar" style="width:' + pct(p.known, p.total) + '%"></div></div>' +
          '<span class="go">进入词库 ' + I.chev + '</span>' +
        '</div>' +
        '</button>';
    }
    root.innerHTML =
      '<div class="hero">' +
        '<h1>考研英语 · 词汇记忆本</h1>' +
        '<p>收录高途考研高频词与石雷鹏作文主题词。翻转卡片记单词，四选一自测，不熟悉的词自动收进生词本，随时复习。</p>' +
        '<div class="hero-stats">' +
          '<div class="hero-stat"><div class="num">' + totalAll + '</div><div class="lab">词条总数</div></div>' +
          '<div class="hero-stat"><div class="num blue">' + studiedAll + '</div><div class="lab">已学习</div></div>' +
          '<div class="hero-stat"><div class="num green">' + knownAll + '</div><div class="lab">已掌握</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="lib-grid">' +
        libCard("gaotu", "gaotu", I.card, SOURCES.gaotu.units.length + ' 个单元 · ' + g.total + ' 词') +
        libCard("writing", "writing", I.pen, SOURCES.writing.units.length + ' 大主题 · ' + w.total + ' 条') +
      '</div>';
  }

  /* ---------------- 视图：单元列表 ---------------- */
  function renderLib(srcKey) {
    if (!SOURCES[srcKey]) { location.hash = "#/home"; return; }
    const units = SOURCES[srcKey].units;
    let cards = "";
    units.forEach(function (u, ui) {
      const p = unitProgress(srcKey, ui);
      const done = p.known === p.total;
      cards +=
        '<div class="unit-card' + (done ? " done" : "") + '">' +
          '<div class="unit-name">' + (done ? I.check : "") + '<span>' + esc(u.name) + '</span>' +
            '<span class="unit-count">' + p.known + '/' + p.total + '</span></div>' +
          '<div class="progress' + (done ? " green" : "") + '"><div class="bar" style="width:' + pct(p.known, p.total) + '%"></div></div>' +
          '<div class="unit-actions">' +
            '<button class="btn btn-sm btn-primary" data-go="#/study/' + srcKey + '/' + ui + '/all">背单词</button>' +
            '<button class="btn btn-sm" data-go="#/quiz/' + srcKey + '/' + ui + '">自测</button>' +
          '</div>' +
        '</div>';
    });
    root.innerHTML =
      '<div class="crumb"><button data-go="#/home">首页</button><span class="sep">/</span><span>' + SOURCES[srcKey].label + '</span></div>' +
      '<div class="unit-head"><div><h2 class="section-title">' + SOURCES[srcKey].label + '</h2>' +
      '<p class="section-desc">共 ' + units.length + ' 个单元，选择一个开始背诵或自测</p></div></div>' +
      '<div class="unit-grid">' + cards + '</div>';
  }

  /* ------------- 视图：学习（单层面板两段翻转，同单元复用DOM） ------------- */
  let study = null;
  let els = {};
  let flipping = false;

  function fitCard(el, isEn) {
    const panel = el.closest(".card-panel");
    if (!panel) return;
    const cw = panel.clientWidth - (isEn ? 70 : 58);
    const ch = panel.clientHeight - (isEn ? 92 : 118);
    const chars = el.textContent.length;
    let size = isEn ? 46 : 21;
    while (size > (isEn ? 16 : 13)) {
      const unit = isEn ? size * 0.56 : size;
      let perLine = Math.floor(cw / unit);
      perLine = Math.max(isEn ? 8 : 6, Math.floor(perLine * 0.92));
      const lines = Math.ceil(chars / perLine);
      const lineH = isEn ? size * 1.18 : size * 1.72;
      if (lines * lineH <= ch) break;
      size = isEn ? size - 2 : size - 1;
    }
    el.style.fontSize = size + "px";
  }

  function renderStudy(srcKey, ui, mode) {
    if (!SOURCES[srcKey]) { location.hash = "#/home"; return; }
    let items = unitItems(srcKey, ui);
    if (mode === "review") items = items.filter(function (it) { return !isKnown(it.uid); });
    if (items.length === 0) return studyComplete(srcKey, ui, mode, true);
    study = { src: srcKey, ui: ui, mode: mode, queue: items, pos: 0, flipped: false };
    buildStudyShell();
  }

  function buildStudyShell() {
    const s = study;
    const wrap = document.createElement("div");
    wrap.className = "study-wrap";
    wrap.innerHTML =
      '<div class="crumb"><button data-go="#/home">首页</button><span class="sep">/</span>' +
        '<button data-go="#/lib/' + s.src + '">' + SOURCES[s.src].label + '</button><span class="sep">/</span>' +
        '<span>' + esc(unitName(s.src, s.ui)) + (s.mode === "review" ? " · 复习" : "") + '</span></div>' +
      '<div class="study-meta">' +
        '<span class="count" id="s-count"></span>' +
        '<div class="progress"><div class="bar" id="s-bar"></div></div></div>' +
      '<div class="card-stage"><div class="flashcard" id="flashcard"><div class="card-inner" id="card-inner"><div class="card-panel">' +
        '<div class="content-front" id="content-front">' +
          '<span class="card-tag">Word</span>' +
          '<div class="word-en" id="s-en"></div>' +
          '<div class="flip-hint">' + I.flip + ' 点击卡片查看释义</div>' +
        '</div>' +
        '<div class="content-back" id="content-back">' +
          '<span class="card-tag">Definition</span>' +
          '<div class="word-en-sm" id="s-ensm"></div>' +
          '<div class="definition" id="s-zh"></div>' +
          '<div class="flip-hint">' + I.flip + ' 点击返回</div>' +
        '</div>' +
      '</div></div></div></div>' +
      '<div class="study-controls">' +
        '<button class="btn btn-bad" id="btn-bad">' + I.x + ' 不认识</button>' +
        '<button class="btn btn-good" id="btn-good">' + I.check + ' 认识</button>' +
      '</div>' +
      '<div class="study-nav">' +
        '<button class="icon-btn" id="nav-prev" title="上一张">' + I.l + '</button>' +
        '<button class="icon-btn" id="nav-next" title="下一张">' + I.r + '</button>' +
      '</div>';
    root.innerHTML = "";
    root.appendChild(wrap);

    els = {
      card: wrap.querySelector("#flashcard"),
      inner: wrap.querySelector("#card-inner"),
      front: wrap.querySelector("#content-front"),
      back: wrap.querySelector("#content-back"),
      count: wrap.querySelector("#s-count"),
      bar: wrap.querySelector("#s-bar"),
      en: wrap.querySelector("#s-en"),
      ensm: wrap.querySelector("#s-ensm"),
      zh: wrap.querySelector("#s-zh"),
    };

    els.card.addEventListener("click", flipCard);
    wrap.querySelector("#btn-good").addEventListener("click", function (e) { e.stopPropagation(); answer(true); });
    wrap.querySelector("#btn-bad").addEventListener("click", function (e) { e.stopPropagation(); answer(false); });
    wrap.querySelector("#nav-next").addEventListener("click", function (e) { e.stopPropagation(); move(study.pos + 1); });
    wrap.querySelector("#nav-prev").addEventListener("click", function (e) { e.stopPropagation(); move(study.pos - 1); });

    fillStudy();
  }

  function fillStudy() {
    const s = study, it = s.queue[s.pos];
    els.count.textContent = (s.pos + 1) + " / " + s.queue.length;
    els.bar.style.width = pct(s.pos, s.queue.length) + "%";
    els.en.textContent = it.en;
    els.ensm.textContent = it.en + (isKnown(it.uid) ? " · 已掌握" : "");
    els.zh.textContent = it.zh;
    fitCard(els.en, true);
    fitCard(els.zh, false);
  }

  function showContent(toBack) {
    els.front.classList.toggle("hide", toBack);
    els.back.classList.toggle("show", toBack);
  }

  function flipCard() {
    if (flipping) return;
    flipping = true;
    const inner = els.inner;
    const toBack = !study.flipped;
    inner.classList.remove("half-back");
    inner.classList.add("half");                 // 0 → 90
    setTimeout(function () {
      showContent(toBack);                       // 中点（侧面不可见）切换内容
      inner.classList.add("no-anim");
      inner.classList.remove("half");
      inner.classList.add("half-back");          // 瞬切到 -90
      void inner.offsetWidth;
      inner.classList.remove("no-anim");
      inner.classList.remove("half-back");       // -90 → 0
      study.flipped = toBack;
      setTimeout(function () { flipping = false; }, 310);
    }, 305);
  }

  function answer(known) {
    const it = study.queue[study.pos];
    mark(it.uid, known);
    toast(known ? "已加入掌握" : "已收进生词本");
    move(study.pos + 1);
  }

  function move(np) {
    if (np < 0) return;
    if (np >= study.queue.length) { studyComplete(study.src, study.ui, study.mode, false); return; }
    study.pos = np;
    study.flipped = false;
    const inner = els.inner;
    inner.classList.add("no-anim");
    inner.classList.remove("half", "half-back");
    showContent(false);
    fillStudy();
    void inner.offsetWidth;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { inner.classList.remove("no-anim"); });
    });
  }

  function studyComplete(srcKey, ui, mode, nothing) {
    const p = unitProgress(srcKey, ui);
    const remain = p.total - p.known;
    let inner;
    if (nothing) {
      inner =
        '<div class="big-ico">' + I.done + '</div>' +
        '<h2>本单元已全部掌握</h2>' +
        '<p>' + esc(unitName(srcKey, ui)) + ' 的 ' + p.total + ' 个词条都已标记为掌握，可以去自测巩固一下。</p>';
    } else {
      inner =
        '<div class="big-ico">' + I.done + '</div>' +
        '<h2>本轮学习完成</h2>' +
        '<p>已掌握 <b style="color:var(--green)">' + p.known + '</b> / ' + p.total + ' 词，还有 <b style="color:var(--red)">' + remain + '</b> 词需要复习。</p>';
    }
    inner +=
      '<div class="row">' +
        (remain > 0 ? '<button class="btn btn-bad" data-go="#/study/' + srcKey + '/' + ui + '/review">复习生词 (' + remain + ')</button>' : '') +
        '<button class="btn btn-navy" data-go="#/quiz/' + srcKey + '/' + ui + '">去自测</button>' +
        '<button class="btn" data-go="#/lib/' + srcKey + '">返回单元</button>' +
      '</div>';
    root.innerHTML = '<div class="study-wrap"><div class="study-complete">' + inner + '</div></div>';
  }

  /* ---------------- 视图：测验 ---------------- */
  let quiz = null;
  const QUIZ_N = 15;
  function buildQuestions(srcKey, ui) {
    const items = shuffle(unitItems(srcKey, ui)).slice(0, QUIZ_N);
    const pool = allItems(srcKey).map(function (x) { return x.zh; })
      .filter(function (z, i, a) { return a.indexOf(z) === i; });
    return items.map(function (it) {
      const distract = shuffle(pool.filter(function (z) { return z !== it.zh; })).slice(0, 3);
      return { en: it.en, zh: it.zh, uid: it.uid, options: shuffle([it.zh].concat(distract)) };
    });
  }
  function renderQuiz(srcKey, ui) {
    if (!SOURCES[srcKey]) { location.hash = "#/home"; return; }
    quiz = { src: srcKey, ui: ui, questions: buildQuestions(srcKey, ui), idx: 0, correctCount: 0, selected: false };
    drawQuiz();
  }
  function drawQuiz() {
    const q = quiz.questions[quiz.idx];
    const keys = ["A", "B", "C", "D"];
    const opts = q.options.map(function (op, i) {
      let cls = "quiz-opt", tail = "";
      if (quiz.selected) {
        cls += " locked";
        if (op === q.zh) { cls += " correct"; tail = I.check; }
        else if (i === quiz.picked) { cls += " wrong"; tail = I.x; }
        else cls += " dim";
      }
      return '<button class="' + cls + '" data-i="' + i + '"><span class="key">' + keys[i] + '</span><span>' + esc(op) + '</span>' + tail + '</button>';
    }).join("");
    const last = quiz.idx === quiz.questions.length - 1;
    root.innerHTML =
      '<div class="quiz-wrap">' +
        '<div class="crumb"><button data-go="#/home">首页</button><span class="sep">/</span>' +
          '<button data-go="#/lib/' + quiz.src + '">' + SOURCES[quiz.src].label + '</button><span class="sep">/</span>' +
          '<span>' + esc(unitName(quiz.src, quiz.ui)) + ' · 自测</span></div>' +
        '<div class="study-meta"><span class="count">' + (quiz.idx + 1) + ' / ' + quiz.questions.length + '</span>' +
          '<div class="progress blue"><div class="bar" style="width:' + pct(quiz.idx, quiz.questions.length) + '%"></div></div></div>' +
        '<div class="quiz-q"><div class="qtag">选择正确的释义</div><div class="qen">' + esc(q.en) + '</div>' +
          '<div class="qsub">共 ' + quiz.questions.length + ' 题</div></div>' +
        '<div class="quiz-options">' + opts + '</div>' +
        '<div class="quiz-foot">' +
          '<button class="btn" data-go="#/lib/' + quiz.src + '">退出</button>' +
          (quiz.selected ? '<button class="btn btn-navy" id="q-next">' + (last ? "查看成绩" : "下一题") + ' ' + I.chev + '</button>' : '<span></span>') +
        '</div>' +
      '</div>';
    Array.prototype.forEach.call(document.querySelectorAll(".quiz-opt"), function (btn) {
      btn.addEventListener("click", function () {
        if (quiz.selected) return;
        const i = parseInt(btn.getAttribute("data-i"), 10);
        const ok = q.options[i] === q.zh;
        quiz.selected = true; quiz.picked = i;
        if (ok) quiz.correctCount++;
        mark(q.uid, ok);
        drawQuiz();
      });
    });
    const nextBtn = document.getElementById("q-next");
    if (nextBtn) nextBtn.addEventListener("click", function () {
      quiz.selected = false;
      quiz.idx++;
      if (quiz.idx >= quiz.questions.length) quizResult();
      else drawQuiz();
    });
  }
  function quizResult() {
    const n = quiz.questions.length, c = quiz.correctCount;
    const score = pct(c, n);
    const circ = 2 * Math.PI * 52;
    let title, color;
    if (score >= 90) { title = "非常出色"; color = "var(--green)"; }
    else if (score >= 60) { title = "继续加油"; color = "var(--gold)"; }
    else { title = "需要多复习"; color = "var(--red)"; }
    root.innerHTML =
      '<div class="quiz-wrap"><div class="quiz-result">' +
        '<div class="score-ring">' +
          '<svg width="130" height="130"><circle cx="65" cy="65" r="52" fill="none" stroke="#e4ddc8" stroke-width="11"/>' +
          '<circle cx="65" cy="65" r="52" fill="none" stroke="' + color + '" stroke-width="11" stroke-linecap="round" ' +
            'stroke-dasharray="' + circ + '" stroke-dashoffset="' + (circ * (1 - c / n)) + '"/></svg>' +
          '<div class="score-num">' + score + '<small> 分</small></div></div>' +
        '<h2>' + title + '</h2>' +
        '<p class="res-line">本次共 ' + n + ' 题</p>' +
        '<div class="res-chips">' +
          '<span class="res-chip"><span class="dot" style="background:var(--green)"></span>答对 ' + c + ' 题</span>' +
          '<span class="res-chip"><span class="dot" style="background:var(--red)"></span>答错 ' + (n - c) + ' 题</span>' +
        '</div>' +
        '<div class="row" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<button class="btn btn-navy" id="r-again">' + I.refresh + ' 再来一组</button>' +
          (n - c > 0 ? '<button class="btn btn-bad" data-go="#/review">查看生词本 (' + (n - c) + ')</button>' : '') +
          '<button class="btn" data-go="#/lib/' + quiz.src + '">返回单元</button>' +
        '</div>' +
      '</div></div>';
    document.getElementById("r-again").addEventListener("click", function () { renderQuiz(quiz.src, quiz.ui); });
  }

  /* ---------------- 视图：生词本 ---------------- */
  function renderReview() {
    const items = reviewItems();
    let body;
    if (items.length === 0) {
      body =
        '<div class="empty"><div class="eico">' + I.star + '</div>' +
          '<h3>生词本是空的</h3><p>背单词时点「不认识」，或自测答错的词会自动收进这里。</p>' +
          '<button class="btn btn-primary" data-go="#/home">去背单词</button></div>';
    } else {
      const list = items.map(function (r) {
        return '<div class="review-item">' +
          '<span class="src-tag ' + r.src + '">' + (r.src === "gaotu" ? "高频词" : "作文词") + '</span>' +
          '<span class="review-en">' + esc(r.en) + '</span>' +
          '<span class="review-zh">' + esc(r.zh) + '</span>' +
          '<div class="review-actions">' +
            '<button class="btn btn-sm btn-good" data-known="' + r.uid + '">' + I.check + ' 学会了</button>' +
          '</div></div>';
      }).join("");
      body =
        '<div class="review-head"><div><h2 class="section-title">生词本</h2>' +
          '<p class="section-desc" style="margin-bottom:0">共 ' + items.length + ' 个待巩固词条</p></div>' +
          '<button class="btn btn-sm" id="clear-all">全部标记掌握</button></div>' +
        '<div class="review-list">' + list + '</div>';
    }
    root.innerHTML = body;
    Array.prototype.forEach.call(document.querySelectorAll("[data-known]"), function (btn) {
      btn.addEventListener("click", function () {
        removeFromReview(btn.getAttribute("data-known"));
        toast("已移出生词本");
        renderReview(); updateBadge();
      });
    });
    const ca = document.getElementById("clear-all");
    if (ca) ca.addEventListener("click", function () {
      reviewItems().forEach(function (r) { removeFromReview(r.uid); });
      toast("已全部标记掌握");
      renderReview(); updateBadge();
    });
  }

  /* ---------------- 顶栏徽章 ---------------- */
  function updateBadge() {
    const n = reviewItems().length;
    let b = document.getElementById("review-badge");
    if (!b) { b = document.createElement("span"); b.className = "nav-badge"; b.id = "review-badge"; document.getElementById("nav-review").appendChild(b); }
    b.textContent = n;
    b.style.display = n ? "grid" : "none";
  }

  /* ---------------- 路由 ---------------- */
  function setActiveNav() {
    const h = location.hash;
    document.getElementById("nav-home").classList.toggle("active", h.indexOf("#/review") !== 0);
    document.getElementById("nav-review").classList.toggle("active", h.indexOf("#/review") === 0);
  }
  function route() {
    const parts = (location.hash || "#/home").replace(/^#\/?/, "").split("/");
    const view = parts[0] || "home";
    setActiveNav();
    if (view === "home") renderHome();
    else if (view === "lib") renderLib(decodeURIComponent(parts[1] || ""));
    else if (view === "study") renderStudy(decodeURIComponent(parts[1] || ""), parseInt(parts[2], 10) || 0, parts[3] || "all");
    else if (view === "quiz") renderQuiz(decodeURIComponent(parts[1] || ""), parseInt(parts[2], 10) || 0);
    else if (view === "review") renderReview();
    else renderHome();
    updateBadge();
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    const t = e.target.closest ? e.target.closest("[data-go]") : null;
    if (t) { e.preventDefault(); location.hash = t.getAttribute("data-go"); }
  });

  document.addEventListener("keydown", function (e) {
    const h = location.hash;
    if (h.indexOf("#/study/") === 0 && study) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (els.card) els.card.click();
      } else if (e.key === "1") { const b = document.getElementById("btn-bad"); if (b) b.click(); }
      else if (e.key === "2") { const b = document.getElementById("btn-good"); if (b) b.click(); }
      else if (e.key === "ArrowRight") { move(study.pos + 1); }
      else if (e.key === "ArrowLeft") { move(study.pos - 1); }
    } else if (h.indexOf("#/quiz/") === 0 && quiz && !quiz.selected) {
      const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const i = map[e.key.toLowerCase()];
      if (i !== undefined) { const btns = document.querySelectorAll(".quiz-opt"); if (btns[i]) btns[i].click(); }
    } else if (h.indexOf("#/quiz/") === 0 && quiz && quiz.selected && (e.key === "Enter" || e.key === " ")) {
      const b = document.getElementById("q-next"); if (b) b.click();
    }
  });

  window.addEventListener("hashchange", route);
  route();
})();
