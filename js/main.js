/* ============================================
   zhaosp.com · 赵邵平个人门户
   导航 · 深色模式 · 通用功能
   ============================================ */

(function () {
  'use strict';

  // ==========================================
  // 深色模式切换
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme');

  // 应用保存的主题
  if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
    updateThemeIcon(storedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // ==========================================
  // 移动端汉堡菜单
  // ==========================================
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // 点击导航链接后关闭菜单
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ==========================================
  // 当前页面高亮导航
  // ==========================================
  function highlightActiveNav() {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === path || (path === '/' && href === '/')) {
        link.classList.add('active');
      } else if (href !== '/' && path.startsWith(href)) {
        link.classList.add('active');
      }
    });
  }
  highlightActiveNav();

  // ==========================================
  // 数字计数动画
  // ==========================================
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * target);

      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function observeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }
  observeCounters();

  // ==========================================
  // 返回顶部按钮
  // ==========================================
  const backTop = document.getElementById('back-top');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backTop.classList.add('visible');
      } else {
        backTop.classList.remove('visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 博客路由
  // ==========================================
  function initBlogRouting() {
    const postContainer = document.getElementById('blog-post');
    const blogList = document.getElementById('blog-list');

    // 如果既没有博客列表也没有文章容器，跳过
    if (!postContainer && !blogList) return;

    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get('post');

    if (postSlug && postContainer) {
      // 显示文章模式
      if (blogList) blogList.style.display = 'none';
      postContainer.style.display = 'block';

      // 加载文章 Markdown
      const postPath = 'posts/' + postSlug + '.md';

      fetch(postPath)
        .then(function (response) {
          if (!response.ok) throw new Error('文章未找到');
          return response.text();
        })
        .then(function (markdown) {
          // 解析 frontmatter（如果有）
          var content = markdown;
          var title = '';
          var date = '';

          if (markdown.startsWith('---')) {
            var endIndex = markdown.indexOf('---', 3);
            if (endIndex !== -1) {
              var frontmatter = markdown.substring(3, endIndex).trim();
              content = markdown.substring(endIndex + 3).trim();

              var titleMatch = frontmatter.match(/title:\s*(.+)/);
              var dateMatch = frontmatter.match(/date:\s*(.+)/);

              if (titleMatch) title = titleMatch[1].replace(/['"]/g, '');
              if (dateMatch) date = dateMatch[1].replace(/['"]/g, '');
            }
          }

          if (typeof marked !== 'undefined') {
            var html = marked.parse(content);

            if (title) {
              document.getElementById('post-title').textContent = title;
              document.title = title + ' - 赵邵平';
            }
            if (date) {
              document.getElementById('post-date').textContent = date;
            }

            document.getElementById('post-body').innerHTML = html;

            // 代码高亮
            if (typeof hljs !== 'undefined') {
              document.querySelectorAll('pre code').forEach(function (block) {
                hljs.highlightElement(block);
              });
            }
          } else {
            document.getElementById('post-body').textContent = content;
          }
        })
        .catch(function (err) {
          postContainer.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--text-muted);">文章未找到 😅</p>';
          console.error(err);
        });
    } else if (blogList && postContainer) {
      // 列表模式 - 加载 posts.json
      postContainer.style.display = 'none';

      fetch('posts.json')
        .then(function (response) {
          if (!response.ok) throw new Error('无法加载文章列表');
          return response.json();
        })
        .then(function (posts) {
          if (!posts || !posts.length) {
            blogList.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--text-muted);">暂无文章，敬请期待 🚀</p>';
            return;
          }

          var html = '';
          posts.forEach(function (post) {
            html += `
              <a href="?post=${post.slug}" class="blog-card">
                <div class="blog-card-date">${post.date}</div>
                <div class="blog-card-title">${post.title}</div>
                <div class="blog-card-excerpt">${post.excerpt}</div>
                <div class="blog-card-tags">
                  ${post.tags ? post.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') : ''}
                </div>
              </a>
            `;
          });
          blogList.innerHTML = html;
        })
        .catch(function (err) {
          blogList.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--text-muted);">文章列表加载失败 😅</p>';
          console.error(err);
        });
    }
  }
  initBlogRouting();

})();
