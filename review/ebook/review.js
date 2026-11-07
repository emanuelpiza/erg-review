(() => {
  'use strict';
  // Existing Local Hub notes recorder. This form does not enroll or message contacts.
  const endpoint = 'https://services.leadconnectorhq.com/hooks/lbe9Un2hdxemTBsvnUKa/webhook-trigger/a54ebed1-07da-4f1f-8b12-703c495710a7';
  const form = document.getElementById('ebook-review');
  const submit = document.getElementById('submit');
  const status = document.getElementById('status');
  const escape = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  submit.disabled = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    const data = new FormData(form);
    const rating = String(data.get('rating'));
    if (!/^[1-5]$/.test(rating)) return;
    const feedback = escape(String(data.get('feedback')).trim()).replace(/\r?\n/g, '<br>');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    try {
      // The recorder is cross-origin. A successful browser request is not proof of CRM storage.
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({
          email: String(data.get('email')).trim(),
          note: '<h3>Local Hub ebook review</h3><p>Guide: How to Prevent Costly Water Damage at Home</p>'
            + '<p>Helpfulness: ' + rating + '/5</p>'
            + (feedback ? '<p>Feedback: ' + feedback + '</p>' : '')
        })
      });
      form.hidden = true;
      status.textContent = 'Thank you for sharing your feedback.';
    } catch (_) {
      status.textContent = 'We could not send your feedback. Please try again.';
      submit.textContent = 'Send feedback';
      submit.disabled = false;
    }
  });
})();
