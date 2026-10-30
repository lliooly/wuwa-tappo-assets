const data = JSON.parse(document.querySelector('#gallery-data').textContent);
const base = document.documentElement.dataset.base;
const byId = new Map(data.categories.flatMap((category) => category.entries.map((entry) => [entry.id, entry])));
const assetUrl = (path) => base + path.split('/').map(encodeURIComponent).join('/');
const categories = document.querySelector('#categories');
const groups = document.querySelector('#groups');
const gallery = document.querySelector('#gallery');
const search = document.querySelector('#search');
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty-state');
const title = document.querySelector('#collection-title');
const categoryIndex = document.querySelector('#category-index');
const dialog = document.querySelector('#detail-dialog');
const themeToggle = document.querySelector('#theme-toggle');
let currentCategory = data.categories[0];
let currentGroup = currentCategory.groups[0];
let currentEntry = null;
const loadedFonts = new Set();

function applyTheme(theme, save = true) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  themeToggle.title = theme === 'dark' ? '切换到浅色模式' : '切换到深色模式';
  if (save) {
    try { localStorage.setItem('wuwa-gallery-theme', theme); } catch { /* Theme still works for this visit. */ }
  }
}

applyTheme(document.documentElement.dataset.theme || 'light', false);
themeToggle.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

function loadFont(entry) {
  const name = `archive-font-${entry.id}`;
  if (!loadedFonts.has(name) && 'FontFace' in window) {
    loadedFonts.add(name);
    const font = new FontFace(name, `url("${assetUrl(entry.path)}")`);
    document.fonts.add(font);
    font.load().catch(() => {});
  }
  return name;
}

function card(entry) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'asset-card';
  button.dataset.entryId = entry.id;
  button.setAttribute('aria-label', `查看 ${entry.name}`);
  const imageArea = document.createElement('span');
  imageArea.className = 'asset-image';
  if (/\.woff2?$/i.test(entry.path)) {
    const preview = document.createElement('span');
    preview.className = 'font-preview';
    preview.textContent = 'Aa 字';
    preview.style.fontFamily = `"${loadFont(entry)}", sans-serif`;
    imageArea.append(preview);
  } else {
    const image = document.createElement('img');
    image.src = assetUrl(entry.path);
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    imageArea.append(image);
  }
  const text = document.createElement('span');
  text.className = 'asset-text';
  const name = document.createElement('span');
  name.className = 'asset-name';
  name.textContent = entry.name;
  const filename = document.createElement('span');
  filename.className = 'asset-filename';
  filename.textContent = entry.filename;
  text.append(name, filename);
  button.append(imageArea, text);
  return button;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const entries = currentCategory.entries.filter((entry) => {
    if (entry.group !== currentGroup) return false;
    const searchable = [entry.name, entry.filename, entry.path, entry.search, entry.alias].filter(Boolean).join(' ').toLocaleLowerCase();
    return !query || searchable.includes(query);
  });
  const fragment = document.createDocumentFragment();
  for (const entry of entries) fragment.append(card(entry));
  gallery.replaceChildren(fragment);
  count.textContent = entries.length.toLocaleString('zh-CN');
  empty.hidden = entries.length !== 0;
}

function renderGroups() {
  const fragment = document.createDocumentFragment();
  for (const group of currentCategory.groups) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `group${group === currentGroup ? ' active' : ''}`;
    button.dataset.group = group;
    button.setAttribute('aria-pressed', String(group === currentGroup));
    button.textContent = group;
    fragment.append(button);
  }
  groups.replaceChildren(fragment);
}

categories.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  const index = data.categories.findIndex((category) => category.id === button.dataset.category);
  if (index < 0) return;
  currentCategory = data.categories[index];
  currentGroup = currentCategory.groups[0];
  title.textContent = currentCategory.label;
  categoryIndex.textContent = `/ ${String(index + 1).padStart(2, '0')}`;
  for (const candidate of categories.querySelectorAll('[data-category]')) {
    const selected = candidate === button;
    candidate.classList.toggle('active', selected);
    candidate.setAttribute('aria-pressed', String(selected));
  }
  renderGroups();
  render();
});

groups.addEventListener('click', (event) => {
  const button = event.target.closest('[data-group]');
  if (!button) return;
  currentGroup = button.dataset.group;
  renderGroups();
  render();
});
search.addEventListener('input', render);
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !dialog.open && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
    event.preventDefault();
    search.focus();
  }
});

function showDetails(entry) {
  currentEntry = entry;
  document.querySelector('#detail-title').textContent = entry.name;
  document.querySelector('#detail-category').textContent = `${currentCategory.label} / ${entry.group}`;
  document.querySelector('#detail-path').textContent = entry.path;
  document.querySelector('#detail-dimensions').textContent = entry.dimensions ? entry.dimensions.join(' × ') : '';
  const alias = document.querySelector('#detail-alias');
  alias.hidden = !entry.alias;
  alias.textContent = entry.alias ? `历史名称：${entry.alias}` : '';
  const image = document.querySelector('#detail-image');
  const font = document.querySelector('#detail-font');
  const isFont = /\.woff2?$/i.test(entry.path);
  image.hidden = isFont;
  font.hidden = !isFont;
  if (isFont) {
    image.removeAttribute('src');
    font.style.fontFamily = `"${loadFont(entry)}", sans-serif`;
  } else {
    image.src = assetUrl(entry.path);
    image.alt = entry.name;
  }
  document.querySelector('#open-asset').href = assetUrl(entry.path);
  document.querySelector('#copy-path').textContent = '复制路径';
  const related = document.querySelector('#related-files');
  related.replaceChildren();
  for (const file of entry.related || []) {
    if (file.path === entry.path) continue;
    const link = document.createElement('a');
    link.href = assetUrl(file.path);
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = `${file.label} ↗`;
    related.append(link);
  }
  document.querySelector('#related-wrap').hidden = related.childElementCount === 0;
  dialog.showModal();
}

gallery.addEventListener('click', (event) => {
  const button = event.target.closest('[data-entry-id]');
  const entry = button && byId.get(button.dataset.entryId);
  if (entry) showDetails(entry);
});
document.querySelector('#detail-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.querySelector('#copy-path').addEventListener('click', async (event) => {
  if (!currentEntry) return;
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(currentEntry.path);
    button.textContent = '已复制';
  } catch {
    button.textContent = '复制失败，请手动选择路径';
  }
});
