/* =========================================================
   contact.js — floating contact button + modal form
   Submits to /api/contact which sends via server's Postfix
   ========================================================= */

(function () {
  'use strict';

  const S = window.Shobhit || { toast: function () {}, sound: function () {}, confetti: function () {} };

  function createContactUI() {
    // Floating button
    const fab = document.createElement('button');
    fab.className = 'contact-fab';
    fab.id = 'contactFab';
    fab.setAttribute('aria-label', 'Contact us');
    fab.setAttribute('title', 'Send a message');
    fab.innerHTML = '<span class="contact-fab__icon">✉️</span><span class="contact-fab__pulse"></span>';
    document.body.appendChild(fab);

    // Modal
    const modal = document.createElement('dialog');
    modal.className = 'modal contact-modal';
    modal.id = 'contactModal';
    modal.innerHTML = 
      '<form method="dialog" class="modal__body" id="contactForm">' +
        '<h3>Say hello! 👋</h3>' +
        '<p style="color:var(--ink-soft);margin-bottom:18px;">Got a message for the Shobhit behind this site? Drop a note below.</p>' +
        '<div class="field">' +
          '<label for="contactName">Your name</label>' +
          '<input id="contactName" name="name" type="text" placeholder="Fellow Shobhit" maxlength="80" required />' +
        '</div>' +
        '<div class="field">' +
          '<label for="contactEmail">Your email</label>' +
          '<input id="contactEmail" name="email" type="email" placeholder="you@example.com" maxlength="120" required />' +
        '</div>' +
        '<div class="field">' +
          '<label for="contactMsg">Your message</label>' +
          '<textarea id="contactMsg" name="message" rows="4" placeholder="What\'s on your mind?" maxlength="2000" required></textarea>' +
        '</div>' +
        '<div class="modal__actions">' +
          '<button type="button" class="btn btn--ghost" id="contactCancel">Cancel</button>' +
          '<button type="submit" class="btn" id="contactSubmit">Send message 🚀</button>' +
        '</div>' +
      '</form>';
    document.body.appendChild(modal);

    // Wire up events
    fab.addEventListener('click', function () {
      if (typeof modal.showModal === 'function') {
        modal.showModal();
        document.getElementById('contactName').focus();
      }
    });

    document.getElementById('contactCancel').addEventListener('click', function () {
      modal.close();
    });

    modal.addEventListener('click', function (e) {
      // Close on backdrop click
      if (e.target === modal) modal.close();
    });

    document.getElementById('contactForm').addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage();
    });
  }

  function sendMessage() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmit');
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMsg').value.trim();

    if (!name || !email || !message) {
      S.toast('Please fill in all fields');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      S.toast('Please enter a valid email address');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, message: message })
    })
    .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
    .then(function (res) {
      if (res.ok && res.data.success) {
        S.toast('Message sent! Thanks for reaching out 💜');
        S.confetti && S.confetti(60);
        S.sound && S.sound('win');
        form.reset();
        document.getElementById('contactModal').close();
      } else {
        throw new Error(res.data.error || 'Failed to send');
      }
    })
    .catch(function (err) {
      S.toast('Could not send message: ' + (err.message || 'unknown error'));
      S.sound && S.sound('error');
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message 🚀';
    });
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createContactUI);
  } else {
    createContactUI();
  }
})();
