/**
 * MyCoding Book - lightweight generated document table of contents.
 *
 * New learning pages use simple semantic sections. This script adds the
 * navigation affordance that the older long-form legacy pages already had.
 */
(function() {
  'use strict';

  const slugify = (text, index) => {
    const base = text
      .trim()
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[`'"]/g, '')
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return base || `section-${index + 1}`;
  };

  const uniqueId = (base) => {
    let id = base;
    let suffix = 2;

    while (document.getElementById(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }

    return id;
  };

  const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const init = () => {
    const main = document.querySelector('.page-shell');
    if (!main || document.querySelector('.doc-toc-sidebar') || document.querySelector('.sidebar')) return;

    const sections = Array.from(main.querySelectorAll(':scope > .content-section'));
    if (sections.length < 3) return;

    const title = document.querySelector('.page-header h1')?.textContent?.trim() || '현재 문서';
    const items = sections.map((section, index) => {
      const heading = section.querySelector('h2');
      if (!heading) return null;

      if (!section.id) {
        section.id = uniqueId(slugify(heading.textContent || '', index));
      }

      return {
        id: section.id,
        label: heading.textContent.trim(),
      };
    }).filter(Boolean);

    if (items.length < 3) return;

    document.body.classList.add('doc-toc-enabled');

    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main-content';
    skip.textContent = '본문으로 건너뛰기';
    document.body.prepend(skip);

    if (!main.id) {
      main.id = 'main-content';
    }

    const overlay = document.createElement('div');
    overlay.className = 'doc-toc-overlay';
    document.body.appendChild(overlay);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'doc-toc-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'doc-toc-sidebar');
    button.textContent = '목차';
    document.body.appendChild(button);

    const aside = document.createElement('aside');
    aside.id = 'doc-toc-sidebar';
    aside.className = 'doc-toc-sidebar';
    aside.setAttribute('aria-label', '문서 목차');

    aside.innerHTML = `
      <div class="doc-toc-header">
        <span class="doc-toc-kicker">목차</span>
        <strong>${escapeHtml(title)}</strong>
      </div>
      <nav class="doc-toc-nav">
        ${items.map((item, index) => `
          <a class="doc-toc-link" href="#${item.id}">
            <span>${String(index + 1).padStart(2, '0')}</span>
            ${escapeHtml(item.label)}
          </a>
        `).join('')}
      </nav>
    `;

    document.body.insertBefore(aside, main);

    const links = Array.from(aside.querySelectorAll('.doc-toc-link'));

    const close = () => {
      aside.classList.remove('active');
      overlay.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    const open = () => {
      aside.classList.add('active');
      overlay.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    button.addEventListener('click', () => {
      if (aside.classList.contains('active')) {
        close();
      } else {
        open();
      }
    });

    overlay.addEventListener('click', close);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && aside.classList.contains('active')) {
        close();
        button.focus();
      }
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 960) close();
      });
    });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

      if (!visible) return;

      const active = aside.querySelector(`.doc-toc-link[href="#${visible.target.id}"]`);
      if (!active) return;

      links.forEach((link) => link.classList.remove('active'));
      active.classList.add('active');
    }, {
      rootMargin: '-25% 0px -65% 0px',
      threshold: [0, 1],
    });

    sections.forEach((section) => observer.observe(section));
    links[0]?.classList.add('active');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
