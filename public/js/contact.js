function setStatus(el, type, text) {
  el.className = type === 'success'
    ? 'mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'
    : 'mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200';
  el.textContent = text;
  el.hidden = false;
}

function getFormData(form) {
  const fd = new FormData(form);
  return Object.fromEntries(fd.entries());
}

function buildWhatsAppLinkFromInquiry(data) {
  const base = 'https://wa.me/917385726096';
  const lines = [
    'Hi Manswi, I want to start a project with Code Masters.',
    `Name: ${data.name || ''}`,
    `Phone: ${data.phone || ''}`,
    `Email: ${data.email || ''}`,
    `Project Type: ${data.projectType || ''}`,
    `Deadline: ${data.deadline || ''}`,
    `Budget: ${data.budget || ''}`,
    `Requirements: ${data.message || ''}`
  ];
  return `${base}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function summarizeSaveResults(saved) {
  const mongo = saved?.mongo || {};
  const sheets = saved?.sheets || {};

  const mongoText = mongo.ok ? 'MongoDB: saved' : (mongo.skipped ? 'MongoDB: skipped' : `MongoDB: failed${mongo.error ? ` (${mongo.error})` : ''}`);
  const sheetsText = sheets.ok
    ? 'Google Sheets: saved'
    : (sheets.skipped
      ? `Google Sheets: skipped${sheets.reason ? ` (${sheets.reason})` : ''}`
      : `Google Sheets: failed${sheets.error ? ` (${sheets.error})` : ''}`);

  return `${mongoText} | ${sheetsText}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#inquiryForm');
  if (!form) return;

  const status = document.querySelector('#formStatus');
  const waDetails = document.querySelector('#waDetails');

  const syncWhatsAppDetails = () => {
    if (!waDetails) return;
    const data = getFormData(form);
    waDetails.setAttribute('href', buildWhatsAppLinkFromInquiry(data));
  };

  syncWhatsAppDetails();
  form.addEventListener('input', syncWhatsAppDetails);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) status.hidden = true;

    const data = getFormData(form);
    const btn = form.querySelector('button[type="submit"]');

    try {
      if (btn) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Sending...';
      }

      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'website'
        })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        const msg = json?.errors?.length ? json.errors.join(' ') : (json?.message || 'Something went wrong.');
        if (status) setStatus(status, 'error', msg);
        return;
      }

      form.reset();
      syncWhatsAppDetails();
      const summary = summarizeSaveResults(json?.saved);
      if (status) setStatus(status, 'success', `Inquiry sent successfully. We will contact you shortly on WhatsApp/Call.\n${summary}`);
    } catch (err) {
      if (status) setStatus(status, 'error', 'Network error. Please try again.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Send Inquiry';
      }
    }
  });
});
