---
layout: null
---
const publicPaths = [
{% for file in site.static_files %}{% assign prefix = file.path | slice: 0, 7 %}{% if prefix == '/works/' %}{{ file.path | jsonify }},
{% endif %}{% endfor %}
];
const webpPaths = new Set(publicPaths.filter(path => /\.webp$/i.test(path)).map(path => path.slice(0, -5)));
const folders = new Map();
const works = [];
const order = new Intl.Collator('ar', {numeric:true});
for (const path of publicPaths.sort(order.compare)) {
  if (path.startsWith('/works/Roblox/') && /\.png$/i.test(path) && webpPaths.has(path.slice(0, -4))) continue;
  const parts = path.split('/');
  if (parts.length !== 4) continue;
  const [, , folder, name] = parts;
  if (!folder || folder.startsWith('.') || name.startsWith('.') || !/\.(png|jpe?g|gif|webp|avif)$/i.test(name)) continue;
  if (!folders.has(folder)) {
    const bytes = new TextEncoder().encode(folder);
    const id = btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    folders.set(folder, {id, ar:folder, en:folder});
  }
  const image = 'works/' + encodeURIComponent(folder) + '/' + encodeURIComponent(name);
  works.push({id:image, category:folders.get(folder).id, title:name.replace(/\.[^.]+$/,''), image});
}
window.portfolioCategories = Array.from(folders.values());
window.portfolioWorks = works;