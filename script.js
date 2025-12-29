// Fetch manifest.json and render a collapsible tree. Fetch and show file contents on click.
async function loadManifest() {
  try {
    const res = await fetch('manifest.json');
    const manifest = await res.json();
    const tree = document.getElementById('tree');
    tree.appendChild(renderItems(manifest.items || []));
  } catch (e) {
    document.getElementById('tree').textContent = 'Failed to load manifest.json';
    console.error(e);
  }
}

function renderItems(items) {
  const ul = document.createElement('ul');
  ul.className = 'node-list';
  for (const it of items) {
    const li = document.createElement('li');
    li.className = it.type === 'folder' ? 'folder' : 'file';
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = it.name;
    li.appendChild(label);

    if (it.type === 'folder') {
      const children = renderItems(it.children || []);
      children.style.display = 'none';
      li.appendChild(children);
      label.addEventListener('click', () => {
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
      });
    } else {
      label.addEventListener('click', () => {
        openFile(it.path);
      });
    }

    ul.appendChild(li);
  }
  return ul;
}

async function openFile(path) {
  const contentEl = document.getElementById('content');
  const filenameEl = document.getElementById('filename');
  const copyBtn = document.getElementById('copyBtn');
  filenameEl.textContent = ' — ' + path;
  copyBtn.disabled = true;
  contentEl.textContent = 'Loading ' + path + ' ...';
  try {
    const res = await fetch(encodeURI(path));
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const text = await res.text();
    contentEl.textContent = text;
    copyBtn.disabled = false;
  } catch (e) {
    contentEl.textContent = 'Failed to load: ' + e.message;
  }
}

async function copyContent() {
  const contentEl = document.getElementById('content');
  const copyBtn = document.getElementById('copyBtn');
  const text = contentEl.textContent || '';
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    const prev = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = prev, 1200);
  } catch (err) {
    console.error('Copy failed', err);
    copyBtn.textContent = 'Error';
    setTimeout(() => copyBtn.textContent = 'Copy', 1200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadManifest();
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', copyContent);
});
