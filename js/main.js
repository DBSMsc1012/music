/* ============================================================
   大白鲨音乐资料库 · 交互逻辑
   ============================================================ */

(function () {
  "use strict";

  var DATA = window.MATERIALS || [];

  /* ---------- 工具 ---------- */

  // 按名称排序（拼音）
  function byName(arr) {
    return arr.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, "zh-Hans-CN");
    });
  }

  // 识别文件类型
  function fileType(name) {
    var ext = name.split(".").pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].indexOf(ext) > -1) return "image";
    if (["mp3", "wav", "m4a", "ogg", "flac", "aac", "wma"].indexOf(ext) > -1) return "audio";
    return "other";
  }

  function typeLabel(t) {
    return { pdf: "PDF", image: "图片", audio: "音频", other: "文件" }[t] || "文件";
  }

  // 章节最新更新时间
  function chapterUpdated(ch) {
    var files = ch.files || [];
    var max = "";
    files.forEach(function (f) {
      if (f.updated && f.updated > max) max = f.updated;
    });
    return max;
  }

  // 科目最新更新时间 = 所有章节的最大值
  function subjectUpdated(sub) {
    var max = "";
    (sub.chapters || []).forEach(function (ch) {
      var u = chapterUpdated(ch);
      if (u > max) max = u;
    });
    return max;
  }

  function fmtDate(u) {
    return u ? "更新于 " + u : "";
  }

  var el = function (id) { return document.getElementById(id); };

  /* ---------- 状态 ---------- */

  var state = {
    subject: null,   // 选中的科目对象
    chapter: null,   // 选中的章节对象
    mobileLevel: "subjects" // subjects | chapters | files
  };

  /* ---------- DOM 引用 ---------- */

  var colSubjects = el("colSubjects");
  var colChapters = el("colChapters");
  var colFiles = el("colFiles");
  var mobilePath = el("mobilePath");
  var searchInput = el("searchInput");
  var searchDropdown = el("searchDropdown");

  var isMobile = function () {
    return window.matchMedia("(max-width: 768px)").matches;
  };

  /* ---------- 渲染：科目栏 ---------- */

  function renderSubjects() {
    var subs = byName(DATA);
    var html = '<div class="col-header">科目 · ' + subs.length + "</div>";
    if (!subs.length) {
      html += '<div class="empty-state">暂无科目，请在 data/manifest.js 中添加</div>';
    }
    subs.forEach(function (s) {
      var n = (s.chapters || []).length;
      var u = fmtDate(subjectUpdated(s));
      var active = state.subject === s ? " active" : "";
      html +=
        '<div class="col-item' + active + '" data-act="subject" data-idx="' +
        subs.indexOf(s) + '">' +
        '<div class="ci-name">' + esc(s.name) + "</div>" +
        '<div class="ci-meta">' + n + " 个章节" + (u ? " · " + u : "") + "</div>" +
        "</div>";
    });
    colSubjects.innerHTML = html;
  }

  /* ---------- 渲染：章节栏 ---------- */

  function renderChapters() {
    var subs = byName(DATA);
    var sub = state.subject || subs[0] || null;
    if (sub) state.subject = sub;
    var chs = byName(sub ? (sub.chapters || []) : []);
    var html = '<div class="col-header">章节 · ' + chs.length + "</div>";
    if (!sub) {
      html += '<div class="empty-state">暂无科目</div>';
    } else if (!chs.length) {
      html += '<div class="empty-state">该科目暂无章节，请在 data/manifest.js 中添加</div>';
    }
    chs.forEach(function (c) {
      var n = (c.files || []).length;
      var u = fmtDate(chapterUpdated(c));
      var active = state.chapter === c ? " active" : "";
      html +=
        '<div class="col-item' + active + '" data-act="chapter" data-idx="' +
        chs.indexOf(c) + '">' +
        '<div class="ci-name">' + esc(c.name) + "</div>" +
        '<div class="ci-meta">' + n + " 个资料" + (u ? " · " + u : "") + "</div>" +
        "</div>";
    });
    colChapters.innerHTML = html;
  }

  /* ---------- 渲染：资料栏 ---------- */

  function renderFiles() {
    var chs = byName(state.subject ? (state.subject.chapters || []) : []);
    var ch = state.chapter || chs[0] || null;
    if (ch) state.chapter = ch;
    var files = byName(ch ? (ch.files || []) : []);
    var html = '<div class="col-header">资料 · ' + files.length + "</div>";
    if (!state.subject) {
      html += '<div class="empty-state">请先选择科目</div>';
    } else if (!ch) {
      html += '<div class="empty-state">该科目暂无章节</div>';
    } else if (!files.length) {
      html += '<div class="empty-state">该章节暂无资料，请在 data/manifest.js 中添加</div>';
    }
    files.forEach(function (f, i) {
      var t = fileType(f.name);
      var path = f.path || f.name;
      var audioBtn = t === "audio"
        ? '<button class="play-btn" data-play="' + i + '" title="播放">▶</button>'
        : "";
      html +=
        '<div class="col-item file-wrap" data-file="' + i + '">' +
        '<div class="file-row">' +
        '<div class="f-icon ' + t + '">' + typeLabel(t) + "</div>" +
        '<div class="f-body">' +
        '<a class="f-name" href="' + esc(path) + '" target="_blank" rel="noopener" title="在新标签页打开">' + esc(f.name) + "</a>" +
        '<div class="f-meta">' + typeLabel(t) + (f.updated ? " · " + f.updated : "") + "</div>" +
        "</div>" +
        audioBtn +
        "</div>" +
        "</div>";
    });
    colFiles.innerHTML = html;

    // 音频播放按钮绑定
    colFiles.querySelectorAll("[data-play]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var idx = +btn.getAttribute("data-play");
        var f = files[idx];
        togglePlay(btn, f);
      });
    });
  }

  /* ---------- 音频就地播放 ---------- */

  var currentAudio = null;
  var currentBtn = null;
  var currentWrap = null;

  function togglePlay(btn, f) {
    var wrap = btn.closest(".col-item");
    var path = f.path || f.name;

    // 点击同一个正在播的 → 暂停
    if (currentAudio && currentBtn === btn && !currentAudio.paused) {
      currentAudio.pause();
      btn.innerHTML = "▶";
      btn.classList.remove("playing");
      return;
    }

    // 停掉之前的所有播放
    stopAll();

    var audio = new Audio(path);
    currentAudio = audio;
    currentBtn = btn;
    currentWrap = wrap;
    btn.innerHTML = "❚❚";
    btn.classList.add("playing");

    // 行内展开播放器
    var bar = document.createElement("div");
    bar.className = "player-bar";
    bar.innerHTML =
      '<div class="player-controls">' +
      '<button class="player-btn" data-act="pp">❚❚</button>' +
      '<input class="player-progress" type="range" min="0" max="100" value="0">' +
      '<span class="player-time">0:00 / 0:00</span>' +
      '<input class="player-volume" type="range" min="0" max="100" value="80">' +
      "</div>";
    wrap.appendChild(bar);

    var pp = bar.querySelector("[data-act=pp]");
    var prog = bar.querySelector(".player-progress");
    var vol = bar.querySelector(".player-volume");
    var time = bar.querySelector(".player-time");

    audio.volume = 0.8;

    audio.addEventListener("timeupdate", function () {
      if (audio.duration) {
        prog.value = (audio.currentTime / audio.duration) * 100;
        time.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
      }
    });
    prog.addEventListener("input", function () {
      if (audio.duration) audio.currentTime = (prog.value / 100) * audio.duration;
    });
    vol.addEventListener("input", function () {
      audio.volume = vol.value / 100;
    });
    pp.addEventListener("click", function () {
      if (audio.paused) {
        audio.play();
        pp.textContent = "❚❚";
        btn.innerHTML = "❚❚";
      } else {
        audio.pause();
        pp.textContent = "▶";
        btn.innerHTML = "▶";
      }
    });
    audio.addEventListener("ended", function () {
      btn.innerHTML = "▶";
      btn.classList.remove("playing");
      pp.textContent = "▶";
      prog.value = 0;
    });

    audio.play().catch(function () {
      btn.innerHTML = "▶";
      btn.classList.remove("playing");
    });
  }

  function stopAll() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (currentBtn) {
      currentBtn.innerHTML = "▶";
      currentBtn.classList.remove("playing");
      currentBtn = null;
    }
    if (currentWrap) {
      var bar = currentWrap.querySelector(".player-bar");
      if (bar) bar.remove();
      currentWrap = null;
    }
  }

  function fmtTime(s) {
    if (!isFinite(s)) return "0:00";
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  /* ---------- 手机端路径条 ---------- */

  function renderMobilePath() {
    var html = '<button class="back-btn">← 返回</button>';
    if (state.mobileLevel === "subjects") {
      html += '<span class="crumb current">科目</span>';
    } else if (state.mobileLevel === "chapters") {
      html += '<span class="crumb" data-goto="subjects">科目</span>' +
              '<span class="crumb current">' + esc(state.subject ? state.subject.name : "") + "</span>";
    } else {
      html += '<span class="crumb" data-goto="subjects">科目</span>' +
              '<span class="crumb" data-goto="chapters">' + esc(state.subject ? state.subject.name : "") + "</span>" +
              '<span class="crumb current">' + esc(state.chapter ? state.chapter.name : "") + "</span>";
    }
    mobilePath.innerHTML = html;
  }

  function applyMobileLevel() {
    colSubjects.classList.toggle("mobile-visible", state.mobileLevel === "subjects");
    colChapters.classList.toggle("mobile-visible", state.mobileLevel === "chapters");
    colFiles.classList.toggle("mobile-visible", state.mobileLevel === "files");
    renderMobilePath();
  }

  /* ---------- 渲染入口 ---------- */

  function renderAll() {
    renderSubjects();
    renderChapters();
    renderFiles();
    if (isMobile()) applyMobileLevel();
  }

  /* ---------- 点击事件：分栏 ---------- */

  colSubjects.addEventListener("click", function (e) {
    var item = e.target.closest("[data-act=subject]");
    if (!item) return;
    var subs = byName(DATA);
    state.subject = subs[+item.getAttribute("data-idx")];
    state.chapter = null;
    renderChapters();
    renderFiles();
    if (isMobile()) {
      state.mobileLevel = "chapters";
      applyMobileLevel();
    }
  });

  colChapters.addEventListener("click", function (e) {
    var item = e.target.closest("[data-act=chapter]");
    if (!item) return;
    var chs = byName(state.subject ? (state.subject.chapters || []) : []);
    state.chapter = chs[+item.getAttribute("data-idx")];
    renderFiles();
    if (isMobile()) {
      state.mobileLevel = "files";
      applyMobileLevel();
    }
  });

  mobilePath.addEventListener("click", function (e) {
    if (e.target.classList.contains("back-btn")) {
      if (state.mobileLevel === "files") state.mobileLevel = "chapters";
      else if (state.mobileLevel === "chapters") state.mobileLevel = "subjects";
      applyMobileLevel();
    } else if (e.target.hasAttribute("data-goto")) {
      state.mobileLevel = e.target.getAttribute("data-goto");
      applyMobileLevel();
    }
  });

  /* ---------- Tab 切换 ---------- */

  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var target = tab.getAttribute("data-tab");
      document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
      el(target === "chapter" ? "chapterView" :
         target === "material" ? "materialView" : "levelView").classList.add("active");
      stopAll();
      // 切回章节时重算高度
      if (target === "chapter" && isMobile()) applyMobileLevel();
    });
  });

  /* ---------- 搜索：下拉即时提示 ---------- */

  var searchItems = [];
  function buildSearchIndex() {
    searchItems = [];
    byName(DATA).forEach(function (s) {
      searchItems.push({ name: s.name, kind: "科目", subject: s, chapter: null, file: null });
      byName(s.chapters || []).forEach(function (c) {
        searchItems.push({ name: c.name, kind: "章节", subject: s, chapter: c, file: null });
        byName(c.files || []).forEach(function (f) {
          searchItems.push({ name: f.name, kind: typeLabel(fileType(f.name)), subject: s, chapter: c, file: f });
        });
      });
    });
  }

  function renderSearchDropdown(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) {
      searchDropdown.classList.remove("show");
      return;
    }
    var hits = searchItems.filter(function (it) {
      return it.name.toLowerCase().indexOf(q) > -1;
    }).slice(0, 20);

    if (!hits.length) {
      searchDropdown.innerHTML = '<div class="search-empty">没有找到「' + esc(q) + '」相关的内容</div>';
      searchDropdown.classList.add("show");
      return;
    }
    var html = "";
    hits.forEach(function (it, i) {
      var loc = it.kind === "科目" ? it.name
              : it.kind === "章节" ? it.subject.name
              : (it.subject.name + " / " + it.chapter.name);
      html +=
        '<div class="search-item" data-si="' + i + '">' +
        '<span class="si-name">' + esc(it.name) + "</span>" +
        '<span class="si-loc">' + esc(loc) + "</span>" +
        "</div>";
    });
    searchDropdown.innerHTML = html;
    searchDropdown.classList.add("show");

    searchDropdown.querySelectorAll("[data-si]").forEach(function (item) {
      item.addEventListener("click", function () {
        var it = hits[+item.getAttribute("data-si")];
        gotoSearchItem(it);
      });
    });
  }

  function gotoSearchItem(it) {
    searchDropdown.classList.remove("show");
    searchInput.value = "";

    // 切到按章节 tab
    document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
    document.querySelector('[data-tab="chapter"]').classList.add("active");
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
    el("chapterView").classList.add("active");
    stopAll();

    state.subject = it.subject;
    state.chapter = it.chapter;
    renderChapters();
    renderFiles();

    if (isMobile()) {
      if (it.kind === "科目") state.mobileLevel = "chapters";
      else state.mobileLevel = "files";
      applyMobileLevel();
      return;
    }

    // 桌面端：高亮闪烁
    var target = it.file ? colFiles : (it.chapter ? colChapters : colSubjects);
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (it.file) {
      // 直接在新标签页打开
      var p = it.file.path || it.file.name;
      window.open(p, "_blank", "noopener");
    }
  }

  searchInput.addEventListener("input", function () {
    renderSearchDropdown(this.value);
  });
  searchInput.addEventListener("focus", function () {
    renderSearchDropdown(this.value);
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-wrap")) {
      searchDropdown.classList.remove("show");
    }
  });

  /* ---------- 工具：转义 ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- 启动 ---------- */

  buildSearchIndex();
  renderAll();

  // 桌面端默认选中第一个「有章节」的科目
  if (!isMobile() && DATA.length) {
    var subs = byName(DATA);
    state.subject = subs.filter(function (s) { return (s.chapters || []).length > 0; })[0] || subs[0];
    renderAll();
  }
})();
