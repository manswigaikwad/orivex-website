function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getToken() {
  return localStorage.getItem('cm_admin_token') || '';
}

function setToken(token) {
  if (!token) localStorage.removeItem('cm_admin_token');
  else localStorage.setItem('cm_admin_token', token);
}

function qs(id) {
  return document.querySelector(id);
}

async function fetchInquiries(params) {
  const token = getToken();
  const url = new URL('/api/admin/inquiries', window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    const msg = json?.message || 'Unable to load inquiries.';
    throw new Error(msg);
  }

  return json;
}

function renderRows(rows) {
  const tbody = qs('#rows');
  if (!tbody) return;
  tbody.innerHTML = rows
    .map((r) => {
      return `
        <tr>
          <td>${escapeHtml(r.createdAt)}</td>
          <td><strong>${escapeHtml(r.name)}</strong><div class="mini">${escapeHtml(r.projectType)}</div></td>
          <td>${escapeHtml(r.phone)}</td>
          <td>${escapeHtml(r.email)}</td>
          <td>${escapeHtml(r.deadline)}</td>
          <td>${escapeHtml(r.budget)}</td>
          <td style="max-width:360px">${escapeHtml(r.message)}</td>
        </tr>
      `.trim();
    })
    .join('');
}

function setStatus(type, text) {
  const els = [qs('#adminStatusLogin'), qs('#adminStatusData')].filter(Boolean);
  if (els.length === 0) return;
  els.forEach((el) => {
    el.hidden = false;
    el.className = type === 'success'
      ? 'mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'
      : 'mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200';
    el.textContent = text;
  });
}

function clearStatus() {
  [qs('#adminStatusLogin'), qs('#adminStatusData')].filter(Boolean).forEach((el) => {
    el.hidden = true;
  });
}

function getFilters() {
  return {
    search: qs('#search')?.value || '',
    from: qs('#from')?.value || '',
    to: qs('#to')?.value || '',
    limit: qs('#limit')?.value || '50'
  };
}

async function load() {
  clearStatus();

  const filters = getFilters();
  qs('#loginView').hidden = true;
  qs('#dataView').hidden = false;

  try {
    qs('#loadBtn').disabled = true;
    const json = await fetchInquiries(filters);
    renderRows(json.items || []);
    qs('#count').textContent = String(json.count || 0);
  } catch (e) {
    setStatus('error', e.message || 'Unauthorized or server error.');
    qs('#dataView').hidden = true;
    qs('#loginView').hidden = false;
  } finally {
    qs('#loadBtn').disabled = false;
  }
}

function showLogin() {
  qs('#loginView').hidden = false;
  qs('#dataView').hidden = true;
}

function buildCsvUrl() {
  const url = new URL('/api/admin/inquiries.csv', window.location.origin);
  const filters = getFilters();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') url.searchParams.set(k, String(v));
  });
  return url.toString();
}

document.addEventListener('DOMContentLoaded', () => {
  const tokenInput = qs('#token');
  const saveBtn = qs('#saveToken');
  const logoutBtn = qs('#logout');

  const stored = getToken();
  if (tokenInput) tokenInput.value = stored;

  saveBtn?.addEventListener('click', async () => {
    setToken(tokenInput.value.trim());
    await load();
  });

  logoutBtn?.addEventListener('click', () => {
    setToken('');
    if (tokenInput) tokenInput.value = '';
    showLogin();
  });

  qs('#loadBtn')?.addEventListener('click', load);

  qs('#exportBtn')?.addEventListener('click', () => {
    const token = getToken();
    if (!token) {
      setStatus('error', 'Please login with ADMIN token first.');
      return;
    }
    const a = document.createElement('a');
    a.href = buildCsvUrl();
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.click();
  });

  if (getToken()) load();
  else showLogin();
});
