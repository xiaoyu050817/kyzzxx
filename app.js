/* ===== 考研政治学习系统 - App Logic ===== */
(function () {
  const { points, meetings, documents, subjects } = APP_DATA;
  const main = document.getElementById('main');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  // ===== State =====
  let state = {
    view: 'home',
    subject: null,
    chapter: null,
    keyword: null,
    flashcardIdx: 0,
    flashcardFlipped: false,
    flashcardDeck: [],
    quizIdx: 0,
    quizScore: 0,
    quizDeck: [],
    quizAnswered: false,
  };

  // ===== Helpers =====
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }
  function subjectColor(code) {
    const s = subjects.find(x => x.code === code);
    return s ? s.color : '#64748b';
  }

  // ===== Stats =====
  function computeStats() {
    const bySubject = {};
    subjects.forEach(s => bySubject[s.code] = 0);
    let confuseCount = 0;
    const kwCount = {};
    points.forEach(p => {
      bySubject[p.subject] = (bySubject[p.subject] || 0) + 1;
      if (p.easy_confuse) confuseCount++;
      (p.keywords || []).forEach(k => { kwCount[k] = (kwCount[k] || 0) + 1; });
    });
    return { bySubject, confuseCount, kwCount, total: points.length };
  }
  const stats = computeStats();

  // ===== Sidebar shortcuts =====
  function renderSidebar() {
    const sc = document.getElementById('subjectShortcuts');
    sc.innerHTML = '';
    subjects.forEach(s => {
      const item = el('div', 'subject-chip');
      item.innerHTML = `<span class="subject-dot" style="background:${s.color}"></span>${s.code}<span class="subject-count">${stats.bySubject[s.code] || 0}</span>`;
      item.onclick = () => { location.hash = `#/subject/${s.code}`; closeSidebar(); };
      sc.appendChild(item);
    });
    document.getElementById('statMini').innerHTML =
      `共 <b>${stats.total}</b> 条知识点<br>易错易混 <b>${stats.confuseCount}</b> 条<br>会议文件 <b>${meetings.length + documents.length}</b> 个`;
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }
  document.getElementById('menuBtn').onclick = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  };
  overlay.onclick = closeSidebar;

  // ===== Point card renderer =====
  function pointHTML(p, highlight) {
    let content = esc(p.content);
    if (highlight) {
      const re = new RegExp(highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      content = content.replace(re, m => `<span class="hl">${m}</span>`);
    }
    const kws = (p.keywords || []).map(k =>
      `<span class="badge-kw" onclick="location.hash='#/keyword/${encodeURIComponent(k)}'">${esc(k)}</span>`
    ).join('');
    return `
      <div class="point-item">
        <div class="point-head">
          <span class="badge badge-subject" style="background:${subjectColor(p.subject)}22;color:${subjectColor(p.subject)}">${p.subject}</span>
          <span class="badge badge-chapter">${esc(p.chapter)}</span>
          ${p.easy_confuse ? '<span class="badge badge-confuse">⚠️ 易混</span>' : ''}
        </div>
        <div class="point-content">${content}</div>
        ${kws ? `<div style="margin-top:8px">${kws}</div>` : ''}
      </div>`;
  }

  // ===== Views =====
  const views = {};

  views.home = function () {
    main.innerHTML = `
      <div class="section-title">🏠 首页概览 <span class="section-sub">考研政治知识点速记系统</span></div>
      <div class="grid grid-stats" style="margin-bottom:24px">
        <div class="card stat-card"><div class="stat-num">${stats.total}</div><div class="stat-label">知识点总数</div></div>
        <div class="card stat-card"><div class="stat-num" style="color:var(--danger)">${stats.confuseCount}</div><div class="stat-label">易错易混点</div></div>
        <div class="card stat-card"><div class="stat-num" style="color:var(--warning)">${meetings.length}</div><div class="stat-label">重要会议</div></div>
        <div class="card stat-card"><div class="stat-num" style="color:var(--success)">${documents.length}</div><div class="stat-label">重要文献</div></div>
      </div>
      <div class="section-title" style="font-size:16px">📖 按科目开始学习</div>
      <div class="grid grid-subjects" style="margin-bottom:24px">
        ${subjects.map(s => `
          <div class="card card-clickable subject-card" style="border-top-color:${s.color}" onclick="location.hash='#/subject/${s.code}'">
            <h3 style="color:${s.color}">${s.code}</h3>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">${esc(s.name)}</div>
            <div class="subj-meta"><span>${stats.bySubject[s.code]} 条</span><span>点击进入 →</span></div>
          </div>`).join('')}
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <div class="card card-clickable" onclick="location.hash='#/keywords'">🏷️ <b>关键词速查</b><br><small style="color:var(--text-muted)">按考点关键词分类</small></div>
        <div class="card card-clickable" onclick="location.hash='#/confuse'">⚠️ <b>易错易混专项</b><br><small style="color:var(--text-muted)">重点突破高频陷阱</small></div>
        <div class="card card-clickable" onclick="location.hash='#/meetings'">🏛️ <b>会议文件时间线</b><br><small style="color:var(--text-muted)">史纲核心考点汇总</small></div>
        <div class="card card-clickable" onclick="location.hash='#/flashcard'">⚡ <b>速记卡片模式</b><br><small style="color:var(--text-muted)">翻转记忆法</small></div>
      </div>`;
  };

  views.subjects = function () {
    main.innerHTML = `
      <div class="section-title">📖 按科目学习</div>
      <div class="grid grid-subjects">
        ${subjects.map(s => `
          <div class="card card-clickable subject-card" style="border-top-color:${s.color}" onclick="location.hash='#/subject/${s.code}'">
            <h3 style="color:${s.color}">${s.code} · ${esc(s.name)}</h3>
            <div class="subj-desc">${esc(s.desc)}</div>
            <div class="subj-meta"><span>${stats.bySubject[s.code]} 条知识点</span></div>
          </div>`).join('')}
      </div>`;
  };

  views.subjectDetail = function (code) {
    const s = subjects.find(x => x.code === code);
    if (!s) return views.home();
    const sp = points.filter(p => p.subject === code);
    const chapters = {};
    sp.forEach(p => { (chapters[p.chapter] = chapters[p.chapter] || []).push(p); });
    main.innerHTML = `
      <div class="section-title">
        <span style="color:${s.color}">●</span> ${s.code}
        <span class="section-sub">${esc(s.name)} · ${sp.length}条</span>
      </div>
      <div class="filter-bar">
        <button class="btn btn-sm" onclick="location.hash='#/subjects'">← 返回科目</button>
      </div>
      <div class="grid grid-cards">
        ${Object.keys(chapters).map(ch => `
          <div class="card card-clickable" onclick="location.hash='#/chapter/${code}/${encodeURIComponent(ch)}'">
            <h4 style="font-size:15px;margin-bottom:6px">${esc(ch)}</h4>
            <div style="font-size:13px;color:var(--text-muted)">${chapters[ch].length} 条知识点 →</div>
          </div>`).join('')}
      </div>`;
  };

  views.chapterDetail = function (code, chapter) {
    const sp = points.filter(p => p.subject === code && p.chapter === chapter);
    main.innerHTML = `
      <div class="section-title">${esc(chapter)} <span class="section-sub">${sp.length}条</span></div>
      <div class="filter-bar">
        <button class="btn btn-sm" onclick="location.hash='#/subject/${code}'">← 返回章节</button>
        <button class="btn btn-sm" onclick="location.hash='#/flashcard/${code}'">⚡ 此章节速记</button>
      </div>
      ${sp.map(p => pointHTML(p)).join('')}`;
  };

  views.keywords = function () {
    const entries = Object.entries(stats.kwCount).sort((a, b) => b[1] - a[1]);
    main.innerHTML = `
      <div class="section-title">🏷️ 按关键词分类 <span class="section-sub">共 ${entries.length} 个考点关键词</span></div>
      <div class="kw-cloud">
        ${entries.map(([k, c]) =>
          `<span class="kw-tag" onclick="location.hash='#/keyword/${encodeURIComponent(k)}'">${esc(k)}<span class="cnt">${c}</span></span>`
        ).join('')}
      </div>`;
  };

  views.keywordDetail = function (kw) {
    const sp = points.filter(p => (p.keywords || []).includes(kw));
    main.innerHTML = `
      <div class="section-title">🏷️ 关键词：${esc(kw)} <span class="section-sub">${sp.length}条</span></div>
      <div class="filter-bar">
        <button class="btn btn-sm" onclick="location.hash='#/keywords'">← 全部关键词</button>
      </div>
      ${sp.map(p => pointHTML(p, kw)).join('')}`;
  };

  views.confuse = function () {
    const sp = points.filter(p => p.easy_confuse);
    // Group by subject
    const bySub = {};
    sp.forEach(p => { (bySub[p.subject] = bySub[p.subject] || []).push(p); });
    main.innerHTML = `
      <div class="section-title">⚠️ 易错易混点专项 <span class="section-sub">${sp.length}条高频陷阱</span></div>
      <div class="filter-bar" id="confuseFilter">
        <span class="filter-chip active" data-sub="all">全部</span>
        ${subjects.map(s => `<span class="filter-chip" data-sub="${s.code}">${s.code}</span>`).join('')}
      </div>
      <div id="confuseList">${sp.map(p => pointHTML(p)).join('')}</div>`;
    document.querySelectorAll('#confuseFilter .filter-chip').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('#confuseFilter .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const sub = chip.dataset.sub;
        const list = sub === 'all' ? sp : sp.filter(p => p.subject === sub);
        document.getElementById('confuseList').innerHTML = list.map(p => pointHTML(p)).join('');
      };
    });
  };

  views.meetings = function () {
    main.innerHTML = `
      <div class="section-title">🏛️ 重要会议与文件汇总 <span class="section-sub">史纲核心考点</span></div>
      <div class="filter-bar" id="mtFilter">
        <span class="filter-chip active" data-t="all">全部</span>
        <span class="filter-chip" data-t="meeting">会议</span>
        <span class="filter-chip" data-t="doc">文献</span>
      </div>
      <div id="mtContent"></div>`;
    function renderMT(type) {
      let html = '';
      if (type === 'all' || type === 'meeting') {
        html += `<h3 style="margin:16px 0 12px;font-size:16px">📅 重要会议</h3><div class="timeline">`;
        html += meetings.map(m => `
          <div class="timeline-item">
            <span class="timeline-year">${m.year}</span>
            <h4>${esc(m.name)}</h4>
            <span class="loc">📍 ${esc(m.location)}</span>
            <div class="sig">${esc(m.significance)}</div>
            <div class="keys">${m.key_points.map(k => `<span class="badge badge-confuse" style="margin-right:4px">${esc(k)}</span>`).join('')}</div>
          </div>`).join('');
        html += `</div>`;
      }
      if (type === 'all' || type === 'doc') {
        html += `<h3 style="margin:24px 0 12px;font-size:16px">📄 重要文献</h3><div class="timeline">`;
        html += documents.map(d => `
          <div class="timeline-item">
            <span class="timeline-year" style="background:var(--success)">${d.year || '—'}</span>
            <h4>${esc(d.name)}</h4>
            <span class="loc">📍 ${esc(d.era)}</span>
            <div class="sig">${esc(d.significance)}</div>
          </div>`).join('');
        html += `</div>`;
      }
      document.getElementById('mtContent').innerHTML = html;
    }
    renderMT('all');
    document.querySelectorAll('#mtFilter .filter-chip').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('#mtFilter .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderMT(chip.dataset.t);
      };
    });
  };

  views.flashcard = function (subjectCode) {
    // Build deck: prefer points with mnemonic Q/A, else use content as front
    let deck = points.filter(p => p.mnemonic);
    if (subjectCode) deck = deck.filter(p => p.subject === subjectCode);
    if (deck.length === 0) deck = points.slice();
    state.flashcardDeck = deck;
    state.flashcardIdx = 0;
    state.flashcardFlipped = false;
    renderFlashcard(subjectCode);
  };

  function renderFlashcard(subjectCode) {
    const deck = state.flashcardDeck;
    if (deck.length === 0) {
      main.innerHTML = '<div class="empty"><div class="icon">📭</div>暂无卡片</div>';
      return;
    }
    const p = deck[state.flashcardIdx];
    const front = p.mnemonic ? p.mnemonic.q : p.content;
    const back = p.mnemonic ? p.mnemonic.a : '（点击查看解析）';
    main.innerHTML = `
      <div class="section-title">⚡ 速记卡片 ${subjectCode ? `<span class="section-sub">· ${subjectCode}</span>` : ''}</div>
      <div class="flashcard-container">
        <div class="flashcard ${state.flashcardFlipped ? 'flipped' : ''}" id="fc">
          <div class="flashcard-label">${p.subject} · ${esc(p.chapter)}</div>
          <div class="flashcard-text">${esc(front)}</div>
          ${state.flashcardFlipped ? `<div class="flashcard-answer">${esc(back)}</div>` : '<div style="margin-top:20px;color:var(--text-muted);font-size:13px">点击卡片翻转 →</div>'}
        </div>
        <div class="flashcard-nav">
          <button class="btn" id="fcPrev">← 上一张</button>
          <button class="btn btn-primary" id="fcFlip">翻转</button>
          <button class="btn" id="fcNext">下一张 →</button>
        </div>
        <div class="flashcard-progress">第 ${state.flashcardIdx + 1} / ${deck.length} 张</div>
      </div>`;
    document.getElementById('fc').onclick = () => {
      state.flashcardFlipped = !state.flashcardFlipped;
      renderFlashcard(subjectCode);
    };
    document.getElementById('fcFlip').onclick = (e) => { e.stopPropagation(); state.flashcardFlipped = !state.flashcardFlipped; renderFlashcard(subjectCode); };
    document.getElementById('fcPrev').onclick = () => { state.flashcardIdx = (state.flashcardIdx - 1 + deck.length) % deck.length; state.flashcardFlipped = false; renderFlashcard(subjectCode); };
    document.getElementById('fcNext').onclick = () => { state.flashcardIdx = (state.flashcardIdx + 1) % deck.length; state.flashcardFlipped = false; renderFlashcard(subjectCode); };
  }

  views.quiz = function () {
    // Build quiz: pick points, generate 4 options from same subject
    const pool = points.filter(p => p.mnemonic);
    // Pick 10 random
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    state.quizDeck = shuffled;
    state.quizIdx = 0;
    state.quizScore = 0;
    renderQuiz();
  };

  function renderQuiz() {
    const deck = state.quizDeck;
    if (state.quizIdx >= deck.length) {
      main.innerHTML = `
        <div class="quiz-card card" style="text-align:center;padding:40px">
          <div style="font-size:48px">🎉</div>
          <h2 style="margin:16px 0">测验完成！</h2>
          <p style="font-size:18px;margin-bottom:20px">得分：<b style="color:var(--primary)">${state.quizScore} / ${deck.length}</b></p>
          <button class="btn btn-primary" onclick="location.hash='#/quiz'">再来一轮</button>
          <button class="btn" onclick="location.hash='#/home'">返回首页</button>
        </div>`;
      return;
    }
    const p = deck[state.quizIdx];
    // Generate distractors from same subject
    const sameSub = points.filter(x => x.subject === p.subject && x.id !== p.id && x.mnemonic);
    const distractors = sameSub.sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.mnemonic.a);
    const opts = [p.mnemonic.a, ...distractors].sort(() => Math.random() - 0.5);
    main.innerHTML = `
      <div class="section-title">✍️ 刷题模式 <span class="section-sub">第 ${state.quizIdx + 1}/${deck.length} 题 · 得分 ${state.quizScore}</span></div>
      <div class="quiz-card card">
        <div class="quiz-q"><b>Q${state.quizIdx + 1}.</b> ${esc(p.mnemonic.q)}</div>
        <div class="quiz-opts" id="quizOpts">
          ${opts.map((o, i) => `<div class="quiz-opt" data-opt="${esc(o)}">${'ABCD'[i]}. ${esc(o)}</div>`).join('')}
        </div>
        <div class="quiz-explain" id="quizExplain">
          <b>解析：</b>${esc(p.content)}<br><small>科目：${p.subject} · ${esc(p.chapter)}</small>
        </div>
      </div>`;
    document.querySelectorAll('.quiz-opt').forEach(opt => {
      opt.onclick = () => {
        if (state.quizAnswered) return;
        state.quizAnswered = true;
        const chosen = opt.dataset.opt;
        if (chosen === p.mnemonic.a) {
          opt.classList.add('correct');
          state.quizScore++;
        } else {
          opt.classList.add('wrong');
          // highlight correct
          document.querySelectorAll('.quiz-opt').forEach(o => {
            if (o.dataset.opt === p.mnemonic.a) o.classList.add('correct');
          });
        }
        document.getElementById('quizExplain').classList.add('show');
        setTimeout(() => {
          state.quizIdx++;
          state.quizAnswered = false;
          renderQuiz();
        }, 2200);
      };
    });
  }

  views.search = function (q) {
    const query = q.trim().toLowerCase();
    if (!query) return views.home();
    const results = points.filter(p =>
      p.content.toLowerCase().includes(query) ||
      p.chapter.toLowerCase().includes(query) ||
      (p.keywords || []).some(k => k.toLowerCase().includes(query))
    );
    main.innerHTML = `
      <div class="section-title">🔍 搜索："${esc(q)}" <span class="section-sub">${results.length} 条结果</span></div>
      ${results.length ? results.map(p => pointHTML(p, q)).join('') :
        '<div class="empty"><div class="icon">🔍</div>未找到相关知识点</div>'}`;
  };

  // ===== Router =====
  function route() {
    const hash = location.hash.slice(1) || '/home';
    const parts = hash.split('/').filter(Boolean);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    closeSidebar();

    if (parts[0] === 'subject' && parts[1]) {
      views.subjectDetail(decodeURIComponent(parts[1]));
      document.querySelector('[data-view="subjects"]')?.classList.add('active');
    } else if (parts[0] === 'chapter' && parts[1]) {
      views.chapterDetail(decodeURIComponent(parts[1]), decodeURIComponent(parts[2] || ''));
    } else if (parts[0] === 'keyword' && parts[1]) {
      views.keywordDetail(decodeURIComponent(parts[1]));
    } else if (parts[0] === 'flashcard') {
      views.flashcard(parts[1] ? decodeURIComponent(parts[1]) : null);
    } else {
      switch (parts[0]) {
        case 'subjects': views.subjects(); document.querySelector('[data-view="subjects"]')?.classList.add('active'); break;
        case 'keywords': views.keywords(); document.querySelector('[data-view="keywords"]')?.classList.add('active'); break;
        case 'confuse': views.confuse(); document.querySelector('[data-view="confuse"]')?.classList.add('active'); break;
        case 'meetings': views.meetings(); document.querySelector('[data-view="meetings"]')?.classList.add('active'); break;
        case 'quiz': views.quiz(); document.querySelector('[data-view="quiz"]')?.classList.add('active'); break;
        case 'search': views.search(decodeURIComponent(parts[1] || '')); break;
        default: views.home(); document.querySelector('[data-view="home"]')?.classList.add('active');
      }
    }
    window.scrollTo(0, 0);
  }

  // ===== Global search =====
  document.getElementById('globalSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) location.hash = `#/search/${encodeURIComponent(q)}`;
    }
  });

  window.addEventListener('hashchange', route);
  renderSidebar();
  route();
})();
