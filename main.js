// ===== RESTREAM SITE GLOBAL JS =====

// FAQ Accordion
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Affiliate link tracker
  document.querySelectorAll('a[href*="try.restream.io"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'affiliate_click', { link_url: link.href, page: location.pathname });
      }
    });
  });
});

// Smooth scroll offset for sticky nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});
