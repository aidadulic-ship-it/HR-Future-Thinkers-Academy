const themeKey = 'hr-future-thinkers-theme-v1';
const themeRoot = document.documentElement;
const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];

function applyTheme(theme) {
  const selected = theme === 'classic' ? 'classic' : 'modern';
  themeRoot.dataset.theme = selected;
  for (const button of themeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selected));
  }
}

let savedTheme = 'modern';
try { savedTheme = localStorage.getItem(themeKey) || 'modern'; } catch {}
applyTheme(savedTheme);

for (const button of themeButtons) {
  button.addEventListener('click', () => {
    const selected = button.dataset.themeChoice;
    applyTheme(selected);
    try { localStorage.setItem(themeKey, selected); } catch {}
  });
}
