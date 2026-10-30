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
const dialog = document.querySelector('#detail-dialog');
const themeToggle = document.querySelector('#theme-toggle');
let currentCategory = data.categories[0];
let currentGroup = currentCategory.groups[0];
let currentEntry = null;
const loadedFonts = new Set();

const translations = {
  '素材图鉴': 'Asset gallery', '素材归档': 'Asset archive', '分类': 'Categories',
  '角色': 'Characters', '配件': 'Accessories', '表情': 'Emotes', '界面': 'Interface', '图标': 'Icons', '字体': 'Fonts',
  '图鉴图': 'Atlas', '完整图': 'Full image', '头部分层': 'Head layers', '身体分层': 'Body layers', '内置默认': 'Built-in defaults', '素材图': 'Source image',
  '原版': 'Original', '登录SDK': 'Login SDK', 'Windows原生': 'Windows native', '发行包': 'Distribution',
  '头部 1': 'Head 1', '头部 2': 'Head 2', '身体 1': 'Body 1', '身体 2': 'Body 2', '身体 3': 'Body 3',
  '项': 'items', '查看': 'View', '查看源码': 'View source', '关闭': 'Close', '仓库路径': 'Repository path', '历史名称': 'Historical name',
  '复制路径': 'Copy path', '已复制': 'Copied', '复制失败，请手动选择路径': 'Copy failed; select the path manually',
  '打开原文件': 'Open original ↗', '同一条目的其他素材': 'Related files', '没有找到相关素材。': 'No matching assets.',
  '搜索名称或文件名': 'Search names or filenames', '非官方素材归档 · 权利与来源': 'Unofficial archive · Rights & sources ↗',
  '切换到浅色模式': 'Switch to light mode', '切换到深色模式': 'Switch to dark mode',
};
let locale = 'zh';
try { locale = localStorage.getItem('wuwa-gallery-language') === 'en' ? 'en' : 'zh'; } catch {}
function t(key) { return locale === 'en' ? (translations[key] || key) : key; }
function applyLanguage() {
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  document.title = `${t('素材图鉴')} · Wuwa Tappo`;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); el.title = t(el.dataset.i18nLabel); });
  for (const category of data.categories) document.querySelector(`[data-category="${category.id}"] .category-label`).textContent = t(category.label);
  search.placeholder = t('搜索名称或文件名');
  search.setAttribute('aria-label', search.placeholder);
  title.textContent = t(currentCategory.label);
  const toggle = document.querySelector('#language-toggle');
  toggle.textContent = locale === 'en' ? 'English' : '中文';
  toggle.setAttribute('aria-label', locale === 'en' ? 'Switch to Chinese' : '切换到英语');
  applyTheme(document.documentElement.dataset.theme || 'light', false);
  renderGroups();
  render();
}
document.querySelector('#language-toggle').addEventListener('click', () => {
  locale = locale === 'zh' ? 'en' : 'zh';
  try { localStorage.setItem('wuwa-gallery-language', locale); } catch {}
  applyLanguage();
});

function applyTheme(theme, save = true) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', t(theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'));
  themeToggle.title = t(theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
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
  button.setAttribute('aria-label', `${t('查看')} ${entry.name}`);
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
    button.textContent = t(group);
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
  title.textContent = t(currentCategory.label);
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
  document.querySelector('#detail-category').textContent = `${t(currentCategory.label)} / ${t(entry.group)}`;
  document.querySelector('#detail-path').textContent = entry.path;
  document.querySelector('#detail-dimensions').textContent = entry.dimensions ? entry.dimensions.join(' × ') : '';
  const alias = document.querySelector('#detail-alias');
  alias.hidden = !entry.alias;
  alias.textContent = entry.alias ? `${t('历史名称')}：${entry.alias}` : '';
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
  document.querySelector('#copy-path').textContent = t('复制路径');
  const related = document.querySelector('#related-files');
  related.replaceChildren();
  for (const file of entry.related || []) {
    if (file.path === entry.path) continue;
    const link = document.createElement('a');
    link.href = assetUrl(file.path);
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = `${t(file.label)} ↗`;
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
    button.textContent = t('已复制');
  } catch {
    button.textContent = t('复制失败，请手动选择路径');
  }
});

applyLanguage();
