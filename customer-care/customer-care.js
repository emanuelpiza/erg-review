(() => {
  'use strict';
  const ENDPOINT = 'https://services.leadconnectorhq.com/hooks/lbe9Un2hdxemTBsvnUKa/webhook-trigger/a54ebed1-07da-4f1f-8b12-703c495710a7';
  const VERSION = 'customer-care-2026-11-06-v1';
  const form = document.getElementById('care-form');
  const status = document.getElementById('status');
  const phone = document.getElementById('phone');
  const consent = document.getElementById('sms-consent');
  const business = document.getElementById('business');
  const profileId = new URL(location.href).searchParams.get('p');
  const profiles = window.PROFILE_CONFIG || {};
  const profile = Object.prototype.hasOwnProperty.call(profiles, profileId) ? profiles[profileId] : null;
  if (profile && profile.brand) {
    business.value = profile.brand;
    business.readOnly = true;
    document.getElementById('service-intro').textContent = `How was your service with ${profile.brand}? Your honest feedback helps us improve.`;
    if (/^https:\/\/(maps\.app\.goo\.gl|share\.google)\//.test(profile.reviewUrl || '')) {
      document.getElementById('google-review').href = profile.reviewUrl;
      document.getElementById('public-review').hidden = false;
    }
  }
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function validatePhone() {
    const raw = phone.value.trim();
    const normalized = raw.replace(/[() .-]/g, '');
    phone.setCustomValidity(consent.checked && !/^\+[1-9]\d{7,14}$/.test(normalized) ? 'Enter your mobile number with country code, for example +1 555 123 4567.' : '');
    return normalized;
  }
  phone.addEventListener('input', validatePhone);
  consent.addEventListener('change', validatePhone);
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const normalizedPhone = validatePhone();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const disclosure = document.getElementById('sms-disclosure').textContent.trim();
    const record = {
      record_type: 'localhub_customer_care_request',
      request_id: crypto.randomUUID(),
      submitted_at: new Date().toISOString(),
      timestamp_source: 'client browser; corroborate with GHL note creation time',
      name: String(data.get('name')).trim(),
      business: business.value.trim(),
      profile_id: profile ? profileId : null,
      rating: data.get('rating') || null,
      feedback: String(data.get('feedback') || '').trim(),
      sms_consent_requested: consent.checked,
      phone: consent.checked ? normalizedPhone : null,
      consent_version: consent.checked ? VERSION : null,
      consent_text: consent.checked ? disclosure : null,
      consent_action: consent.checked ? 'optional unchecked checkbox selected, then form submitted' : 'no SMS opt-in',
      source_url: `${location.origin}${location.pathname}${profile ? '?p=' + encodeURIComponent(profileId) : ''}`,
      privacy_url: 'https://mylocal-hub.com/privacy/#customer-care-sms',
      terms_url: 'https://mylocal-hub.com/terms/#customer-care-sms',
      eligibility: 'UNVERIFIED: verify completed service, business relationship, contact identity, phone ownership and DND before any SMS enrollment; this form never enrolls or sends SMS'
    };
    sending = true;
    const submit = document.getElementById('submit');
    submit.disabled = true;
    submit.textContent = 'Sending...';
    status.textContent = '';
    try {
      await fetch(ENDPOINT, {method:'POST', mode:'no-cors', body:new URLSearchParams({
        email: String(data.get('email')).trim(),
        note: '<h3>Local Hub customer-care request (not enrolled)</h3><pre>' + escape(JSON.stringify(record, null, 2)) + '</pre>'
      })});
      form.hidden = true;
      status.textContent = 'Thank you. Your request has been sent for review. If you need help or confirmation, call 1-888-799-9883.';
      form.after(status);
    } catch (_) {
      status.textContent = 'We could not send your request. Please try again or call 1-888-799-9883.';
      submit.disabled = false;
      submit.textContent = 'Send feedback';
      sending = false;
    }
  });
})();
