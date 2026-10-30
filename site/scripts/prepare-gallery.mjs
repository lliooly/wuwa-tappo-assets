import { readFile, mkdir, symlink, lstat, rm } from 'node:fs/promises';
import { dirname, basename, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteRoot, '..');
const readJson = async (path) => JSON.parse(await readFile(resolve(repoRoot, path), 'utf8'));
const [catalog, inventory, aliasIndex] = await Promise.all([
  readJson('data/catalog.json'),
  readJson('data/files.json'),
  readJson('data/aliases.json'),
]);

const definitions = [
  { id: 'character', label: '角色', folders: ['角色'], groups: ['图鉴图', '完整图', '头部分层', '身体分层', '内置默认'] },
  { id: 'accessory', label: '配件', folders: ['配件'], groups: ['图鉴图', '素材图', '内置默认'] },
  { id: 'emote', label: '表情', folders: ['表情'], groups: ['素材图', '内置默认'] },
  { id: 'interface', label: '界面', folders: ['界面'], groups: ['原版', '登录SDK'] },
  { id: 'icon', label: '图标', folders: ['图标'], groups: ['Windows原生', '发行包'] },
  { id: 'font', label: '字体', folders: ['字体'], groups: ['字体'] },
];
const categories = definitions.map(({ folders, ...definition }) => ({ ...definition, entries: [] }));
const byId = Object.fromEntries(categories.map((category) => [category.id, category]));
const catalogTypes = { character_skin: 'character', accessory: 'accessory', emote: 'emote' };
const groupsForKeys = {
  character: { atlas: '图鉴图', image: '完整图', head1: '头部分层', head2: '头部分层', body1: '身体分层', body2: '身体分层', body3: '身体分层' },
  accessory: { atlas: '图鉴图', image: '素材图' },
  emote: { image: '素材图' },
};
const keyLabels = { atlas: '图鉴图', image: '素材图', head1: '头部 1', head2: '头部 2', body1: '身体 1', body2: '身体 2', body3: '身体 3' };
const indexedPaths = new Set();
let nextId = 0;

function add(category, entry) {
  category.entries.push({ id: String(nextId++), ...entry });
}

for (const item of catalog.items) {
  const categoryId = catalogTypes[item.type];
  if (!categoryId) continue;
  const related = Object.entries(item.files ?? {})
    .filter(([, file]) => file?.path)
    .map(([key, file]) => ({
      label: categoryId === 'character' && key === 'image' ? '完整图' : (keyLabels[key] ?? key),
      path: file.path,
    }));
  for (const [key, group] of Object.entries(groupsForKeys[categoryId])) {
    const file = item.files?.[key];
    if (!file?.path) continue;
    indexedPaths.add(file.path);
    add(byId[categoryId], {
      group,
      name: item.nameZh || item.officialFilename,
      filename: basename(file.path),
      path: file.path,
      dimensions: file.dimensions ?? null,
      search: [item.officialFilename, item.assetId, item.atlasAssetId].filter((value) => value != null).join(' '),
      related,
    });
  }
}

for (const file of inventory.files) {
  if (indexedPaths.has(file.path)) continue;
  const parts = file.path.split('/');
  const definition = definitions.find(({ folders }) => folders.includes(parts[1]));
  if (!definition) continue;
  const group = definition.id === 'font' ? '字体' : parts[2];
  add(byId[definition.id], {
    group,
    name: basename(file.path),
    filename: basename(file.path),
    path: file.path,
    dimensions: null,
    search: '',
    related: [],
  });
}

// Default resources can be aliases to an existing file. Show the historical name,
// but always link to the real path recorded in aliases.json.
for (const [alias, actualPath] of Object.entries(aliasIndex.aliases)) {
  const parts = alias.split('/');
  if (parts[2] !== '内置默认') continue;
  const definition = definitions.find(({ folders }) => folders.includes(parts[1]));
  if (!definition) continue;
  add(byId[definition.id], {
    group: '内置默认',
    name: parts.slice(3).join('/'),
    filename: basename(actualPath),
    path: actualPath,
    alias,
    dimensions: null,
    search: alias,
    related: [],
  });
}

for (const category of categories) {
  const discoveredGroups = new Set(category.entries.map((entry) => entry.group));
  category.groups = [
    ...category.groups.filter((group) => discoveredGroups.has(group)),
    ...[...discoveredGroups].filter((group) => !category.groups.includes(group)).sort(),
  ];
}

await mkdir(resolve(siteRoot, 'src/generated'), { recursive: true });
await mkdir(resolve(siteRoot, 'public'), { recursive: true });
await import('node:fs/promises').then(({ writeFile }) => writeFile(
  resolve(siteRoot, 'src/generated/gallery.json'),
  JSON.stringify({ categories, fileCount: inventory.fileCount, catalogCount: catalog.itemCount }),
));

// The ignored symlink makes the same original assets available in dev and build.
// Vite copies their contents into dist; no tracked asset is changed or duplicated.
const publicAssets = resolve(siteRoot, 'public/assets');
try {
  const existing = await lstat(publicAssets);
  if (!existing.isSymbolicLink()) throw new Error(`Refusing to replace ${publicAssets}: it is not a symlink`);
  await rm(publicAssets);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const target = relative(dirname(publicAssets), resolve(repoRoot, 'assets')).split(sep).join('/');
await symlink(target, publicAssets, 'dir');
console.log(`Prepared ${categories.reduce((sum, category) => sum + category.entries.length, 0)} entries from ${inventory.fileCount} files.`);
