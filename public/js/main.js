document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const file = path === '/' ? '/index.html' : path;
  const links = document.querySelectorAll('[data-nav]');
  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (href && (href === file || (file === '/' && href === '/index.html'))) {
      a.classList.add('active');
    }
  });

  const waLinks = document.querySelectorAll('[data-wa]');
  waLinks.forEach((a) => {
    a.setAttribute('href', buildWhatsAppLink());
  });
});

function buildWhatsAppLink(message) {
  const base = 'https://wa.me/917385726096';
  const text = message || 'Hi Manswi, I want to start a project with ORIVEX.\nProject Type: \nTech Stack: \nDeadline: \nBudget: \n';
  return `${base}?text=${encodeURIComponent(text)}`;
}
