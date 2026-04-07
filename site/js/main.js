/**
 * Claude Code 源码学习系列 - 公共 JS 库
 * 包含：滚动动效、数字动画、代码行号、折叠面板、平滑导航、汉堡菜单、Mermaid、进度条
 */

'use strict';

/* =====================================================================
   0. Polyfills - 浏览器兼容性支持
   ===================================================================== */

// structuredClone polyfill for older browsers (Edge < 98, etc.)
if (typeof structuredClone === 'undefined') {
  window.structuredClone = function(obj) {
    // 使用 JSON 序列化作为 fallback（不支持循环引用、函数、undefined 等）
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.warn('structuredClone polyfill failed, returning original object:', e);
      return obj;
    }
  };
}

/* =====================================================================
   1. 工具函数
   ===================================================================== */

/**
 * 等待 DOM 加载完成后执行
 */
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/**
 * 节流函数 - 限制函数执行频率
 * @param {Function} fn
 * @param {number} wait
 */
function throttle(fn, wait) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} delay
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* =====================================================================
   2. 页面顶部进度条
   ===================================================================== */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  const updateBar = throttle(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(progress, 100) + '%';
  }, 16);

  window.addEventListener('scroll', updateBar, { passive: true });
}

/* =====================================================================
   3. 导航栏：滚动阴影 + 汉堡菜单
   ===================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  if (!navbar) return;

  // 滚动时添加 scrolled 类
  const handleScroll = throttle(() => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });

  // 汉堡菜单切换
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // 点击菜单链接时关闭
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', false);
      });
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  }
}

/* =====================================================================
   4. IntersectionObserver 滚动入场动效
   ===================================================================== */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // 降级：直接显示所有元素
    document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 已触发的不再监听，节省性能
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
    observer.observe(el);
  });
}

/* =====================================================================
   5. 数字递增动画
   ===================================================================== */

/**
 * 将数字从 start 动画到 end
 * @param {HTMLElement} el  - 目标元素
 * @param {number} start    - 起始数字
 * @param {number} end      - 目标数字
 * @param {number} duration - 动画时长(ms)
 * @param {string} suffix   - 数字后缀（如 '+'）
 */
function animateNumber(el, start, end, duration, suffix = '') {
  const startTime = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const current = Math.round(start + (end - start) * eased);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * 初始化所有统计数字动画
 * 使用 IntersectionObserver 在元素进入视口时触发
 */
function initCounterAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = parseInt(el.dataset.duration || '1500', 10);
        animateNumber(el, 0, target, duration, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* =====================================================================
   6. 代码块：行号生成 + 关键行高亮 + 复制按钮
   ===================================================================== */

/**
 * 为所有 .code-block 内的 pre>code 添加行号
 *
 * 关键说明：
 * - 行号数量必须基于 textContent（纯文本）计算，而非 innerHTML
 * - highlight.js 高亮后可能生成跨行的 <span> 标签，使 innerHTML.split('\n')
 *   行数与实际代码行数一致，但对于关键行高亮我们仍需逐行包裹处理
 * - 解决方案：用 textContent 确定行数，再对 innerHTML 逐行包裹高亮 span
 */
function initCodeBlocks() {
  document.querySelectorAll('.code-block pre code').forEach(codeEl => {
    // 防止重复处理（替换后 pre 已不存在，但 code 已在 line-numbers-wrapper 内）
    if (codeEl.closest('.line-numbers-wrapper')) return;

    const pre = codeEl.parentElement;
    if (!pre) return;

    // 先用 hljs 高亮（如果可用）
    if (typeof hljs !== 'undefined' && !codeEl.classList.contains('hljs')) {
      hljs.highlightElement(codeEl);
    }

    // ── 关键修复：用 textContent 计算行数，不受 hljs HTML 标签影响 ──
    const rawText = codeEl.textContent || '';
    const textLines = rawText.split('\n');
    // 移除末尾空行
    if (textLines[textLines.length - 1] === '') textLines.pop();
    const lineCount = textLines.length;

    // 获取需要高亮的行号（data-highlight="1,3,5-7"）
    const highlightAttr = pre.dataset.highlight || '';
    const highlightLines = parseLineRanges(highlightAttr);

    // 构建行号 span 列表
    const lineNumbersEl = document.createElement('div');
    lineNumbersEl.className = 'line-numbers';
    for (let i = 1; i <= lineCount; i++) {
      const span = document.createElement('span');
      span.textContent = i;
      lineNumbersEl.appendChild(span);
    }

    // ── 处理关键行高亮 ──
    // 若没有需要高亮的行，直接使用 hljs 生成的 innerHTML
    // 若有需要高亮的行，则对 innerHTML 逐行拆分并包裹（与行号对齐）
    let codeHtml;
    if (highlightLines.size > 0) {
      // innerHTML 的换行与 textContent 的换行一一对应，可以安全按 \n 拆分
      const htmlLines = codeEl.innerHTML.split('\n');
      // 对齐末尾空行处理
      if (htmlLines[htmlLines.length - 1] === '') htmlLines.pop();
      codeHtml = htmlLines
        .map((line, i) => {
          const lineNum = i + 1;
          return highlightLines.has(lineNum)
            ? `<span class="highlight-line">${line}</span>`
            : line;
        })
        .join('\n');
    } else {
      codeHtml = codeEl.innerHTML;
    }

    // 重建结构
    const wrapper = document.createElement('div');
    wrapper.className = 'line-numbers-wrapper';

    const codeWrapper = document.createElement('pre');
    codeWrapper.style.flex = '1';
    codeWrapper.style.margin = '0';
    codeWrapper.style.background = 'transparent';
    codeWrapper.style.padding = 'var(--space-lg)';
    codeWrapper.style.overflow = 'auto';

    const newCode = document.createElement('code');
    newCode.className = codeEl.className;
    newCode.innerHTML = codeHtml;
    codeWrapper.appendChild(newCode);

    wrapper.appendChild(lineNumbersEl);
    wrapper.appendChild(codeWrapper);

    // 替换原始 pre
    pre.parentNode.replaceChild(wrapper, pre);
  });
}

/**
 * 解析行范围字符串，返回行号 Set
 * @param {string} str - 如 "1,3,5-7"
 * @returns {Set<number>}
 */
function parseLineRanges(str) {
  const result = new Set();
  if (!str) return result;

  str.split(',').forEach(part => {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      for (let i = start; i <= end; i++) result.add(i);
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n)) result.add(n);
    }
  });

  return result;
}

/**
 * 初始化代码复制按钮
 */
function initCopyButtons() {
  document.querySelectorAll('.code-copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const block = btn.closest('.code-block');
      const codeEl = block?.querySelector('code');
      if (!codeEl) return;

      const text = codeEl.innerText || codeEl.textContent;
      try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = '已复制!';
        btn.style.color = 'var(--accent-green)';
        btn.style.borderColor = 'var(--accent-green)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      } catch {
        // 降级处理
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.textContent = '已复制!';
        setTimeout(() => (btn.textContent = '复制'), 2000);
      }
    });
  });
}

/* =====================================================================
   7. 折叠面板（Accordion）
   ===================================================================== */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.closest('.accordion');
      if (!accordion) return;

      const isOpen = accordion.classList.contains('open');

      // 如果有 data-group，关闭同组其他面板
      const groupId = accordion.dataset.group;
      if (groupId) {
        document.querySelectorAll(`.accordion[data-group="${groupId}"]`).forEach(other => {
          if (other !== accordion) {
            other.classList.remove('open');
            other.querySelector('.accordion-header')?.setAttribute('aria-expanded', 'false');
          }
        });
      }

      accordion.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', !isOpen);
    });
  });
}

/* =====================================================================
   8. 平滑滚动导航（处理锚点链接）
   ===================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 60;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* =====================================================================
   9. Mermaid.js 初始化（亮色主题）- v9.x 兼容版本
   ===================================================================== */
function initMermaid() {
  if (typeof mermaid === 'undefined') {
    console.warn('Mermaid library not loaded');
    return;
  }

  try {
    // Mermaid v9.x 使用 startOnLoad: true 自动渲染
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      themeVariables: {
        background:          '#ffffff',
        primaryColor:        '#eff6ff',
        primaryTextColor:    '#1a1a2e',
        primaryBorderColor:  '#2563eb',
        lineColor:           '#2563eb',
        secondaryColor:      '#f8f9fa',
        tertiaryColor:       '#f0f2f5',
        edgeLabelBackground: '#ffffff',
        clusterBkg:          '#f8f9fa',
        titleColor:          '#0f172a',
        nodeTextColor:       '#1a1a2e',
        fontSize:            '14px',
        fontFamily:          "'Inter', 'PingFang SC', system-ui, sans-serif",
      },
      flowchart: {
        curve: 'basis',
        padding: 20,
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 30,
        actorMargin: 80,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
      },
      securityLevel: 'loose', // 允许 HTML 标签
    });
  } catch (err) {
    console.error('Mermaid initialization error:', err);
  }
}

/* =====================================================================
   10. highlight.js 初始化
   ===================================================================== */
function initHighlightJs() {
  if (typeof hljs === 'undefined') return;

  // 配置
  hljs.configure({
    ignoreUnescapedHTML: true,
    languages: ['typescript', 'javascript', 'bash', 'json', 'yaml', 'rust', 'python'],
  });

  // 对所有不在 .code-block 内、且未被高亮的代码块进行高亮
  // .code-block 内的代码由 initCodeBlocks() 自行处理
  document.querySelectorAll('pre code:not(.hljs)').forEach(block => {
    if (!block.closest('.code-block')) {
      hljs.highlightElement(block);
    }
  });
}

/* =====================================================================
   11. 活跃导航状态（基于 scrollspy）
   ===================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-60px 0px -70% 0px',
    threshold: 0,
  });

  sections.forEach(section => observer.observe(section));
}

/* =====================================================================
   12. 学习路径高亮展示（鼠标悬停联动）
   ===================================================================== */
function initPathHighlight() {
  const pathCards = document.querySelectorAll('.path-card');
  if (!pathCards.length) return;

  pathCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const lessons = card.querySelectorAll('.path-lesson-tag');
      lessons.forEach((tag, i) => {
        tag.style.transitionDelay = `${i * 30}ms`;
        tag.style.transform = 'scale(1.05)';
        tag.style.borderColor = 'var(--accent-blue)';
      });
    });

    card.addEventListener('mouseleave', () => {
      const lessons = card.querySelectorAll('.path-lesson-tag');
      lessons.forEach(tag => {
        tag.style.transitionDelay = '';
        tag.style.transform = '';
        tag.style.borderColor = '';
      });
    });
  });
}

/* =====================================================================
   13. 技术栈标签动效
   ===================================================================== */
function initTechPills() {
  const pills = document.querySelectorAll('.tech-pill');
  if (!pills.length) return;

  const colors = [
    'rgba(79, 195, 247, 0.2)',
    'rgba(38, 198, 218, 0.2)',
    'rgba(102, 187, 106, 0.2)',
    'rgba(255, 183, 77, 0.2)',
    'rgba(171, 71, 188, 0.2)',
  ];

  pills.forEach((pill, i) => {
    const color = colors[i % colors.length];
    const dot = pill.querySelector('.tech-dot');
    if (dot) {
      dot.style.background = color.replace('0.2', '1');
      dot.style.boxShadow = `0 0 6px ${color.replace('0.2', '0.8')}`;
    }
  });
}

/* =====================================================================
   14. 阶段卡片课程链接 - 检测链接可用性并设置样式
   ===================================================================== */
function initLessonLinks() {
  document.querySelectorAll('.phase-lesson-link').forEach(link => {
    // 暂时标记为"即将推出"（实际链接存在时会自动工作）
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      // 链接存在时正常展示
      link.style.opacity = '1';
    }
  });
}

/* =====================================================================
   15. 主入口 - DOM 加载完成后初始化所有模块
   ===================================================================== */
ready(() => {
  // 核心交互
  initProgressBar();
  initNavbar();
  initScrollReveal();
  initCounterAnimations();
  initAccordions();
  initSmoothScroll();
  initScrollSpy();

  // 代码相关
  initHighlightJs();
  initCodeBlocks();
  initCopyButtons();

  // 图表
  initMermaid();

  // 视觉增强
  initPathHighlight();
  initTechPills();
  initLessonLinks();

  // 隐藏初始加载闪烁
  document.body.classList.add('js-loaded');
});

/* =====================================================================
   16. 页面可见性变化时暂停/恢复动画（节省性能）
   ===================================================================== */
document.addEventListener('visibilitychange', () => {
  const animatedEls = document.querySelectorAll('.stat-icon');
  if (document.hidden) {
    animatedEls.forEach(el => (el.style.animationPlayState = 'paused'));
  } else {
    animatedEls.forEach(el => (el.style.animationPlayState = 'running'));
  }
});

/* =====================================================================
   17. 公开 API（供课程页面调用）
   ===================================================================== */
window.ClawCode = {
  /**
   * 手动触发指定元素的数字动画
   * @param {string} selector - CSS 选择器
   * @param {number} target   - 目标数字
   * @param {number} duration - 时长(ms)
   * @param {string} suffix   - 后缀
   */
  animateNumber(selector, target, duration = 1500, suffix = '') {
    const el = document.querySelector(selector);
    if (el) animateNumber(el, 0, target, duration, suffix);
  },

  /**
   * 初始化新添加到 DOM 的代码块（动态内容用）
   */
  refreshCodeBlocks() {
    initCodeBlocks();
    initCopyButtons();
    initHighlightJs();
  },

  /**
   * 初始化新添加的滚动动效元素
   */
  refreshReveal() {
    initScrollReveal();
  },

  /**
   * 重新渲染 Mermaid 图表（v9.x 兼容）
   */
  renderMermaid() {
    if (typeof mermaid !== 'undefined') {
      try {
        // v9.x 使用 init 方法重新渲染
        mermaid.init();
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    }
  },
};
