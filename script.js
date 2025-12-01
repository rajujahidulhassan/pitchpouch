/* Services Sliding Blob Effect */
(function () {
  const frame = document.querySelector('.pp-services-frame');
  if (!frame) return;
  const list = frame.querySelector('.pp-service-list');
  if (!list) return;

  // create blob
  let blob = frame.querySelector('.pp-active-blob');
  if (!blob) {
    blob = document.createElement('div');
    blob.className = 'pp-active-blob';
    frame.appendChild(blob);
  }

  const items = Array.from(list.querySelectorAll('.pp-service-item'));
  if (!items.length) return;

  function clearBlobActive() {
    items.forEach(i => i.classList.remove('pp-blob-active'));
  }

  function moveBlobTo(el) {
    if (!el) return;

    // Use offset properties for accurate relative positioning
    var left = el.offsetLeft;
    var top = el.offsetTop;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    blob.style.width = width + 'px';
    blob.style.height = height + 'px';
    blob.style.transform = 'translate3d(' + left + 'px,' + top + 'px,0)';

    clearBlobActive();
    el.classList.add('pp-blob-active');
  }

  // initial position — Pitch design by text or first
  const defaultItem = items.find(i => /Pitch\s+design/i.test(i.textContent)) || items[0];
  moveBlobTo(defaultItem);

  // on hover move blob
  items.forEach(item => {
    item.addEventListener('mouseenter', () => moveBlobTo(item));
  });

  // when leaving list, return to default after short delay
  let leaveTimer = null;
  list.addEventListener('mouseleave', () => {
    if (leaveTimer) clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => moveBlobTo(defaultItem), 300);
  });

  // reposition on resize/scroll
  window.addEventListener('resize', () => moveBlobTo(defaultItem));
  // window.addEventListener('scroll', () => moveBlobTo(defaultItem));
})();

/* Mobile Panel Logic */
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const sidePanel = document.getElementById('mobilePanel');
  const sideOverlay = document.getElementById('sideOverlay');
  const panelClose = document.getElementById('panelClose');

  function openPanel() {
    sidePanel.classList.add('open');
    sideOverlay.classList.add('open');
    sidePanel.setAttribute('aria-hidden', 'false');
    sideOverlay.setAttribute('aria-hidden', 'false');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    panelClose?.focus();
  }

  function closePanel() {
    sidePanel.classList.remove('open');
    sideOverlay.classList.remove('open');
    sidePanel.setAttribute('aria-hidden', 'true');
    sideOverlay.setAttribute('aria-hidden', 'true');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    hamburgerBtn?.focus();
  }

  // toggle aria-expanded and open panel
  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = sidePanel.classList.contains('open');
    if (isOpen) closePanel(); else openPanel();
  });

  panelClose?.addEventListener('click', closePanel);
  sideOverlay?.addEventListener('click', closePanel);

  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidePanel.classList.contains('open')) closePanel();
  });

  // Helper: attach smooth-center scroll after closing panel
  function handlePanelNavigationElement(el) {
    el.addEventListener('click', (ev) => {
      // only handle same-page anchors
      const href = el.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      ev.preventDefault();
      // close panel immediately
      closePanel();
      // small delay to allow close animation then center-scroll
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 240);
    });
  }

  // Attach to panel-link items
  document.querySelectorAll('.panel-link').forEach(handlePanelNavigationElement);

  // ALSO attach to any links/buttons inside the mobile panel (CTA, other anchors)
  if (sidePanel) {
    sidePanel.querySelectorAll('a[href]').forEach(el => {
      handlePanelNavigationElement(el);
    });
  }

  // Ensure panel is closed by default on load
  closePanel();
});

/* Works Modal Logic */
(function () {
  // Defensive modal implementation for Works view buttons
  function ensureModal() {
    var m = document.getElementById('ppModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'ppModal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-hidden', 'true');
    m.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:11000;align-items:center;justify-content:center;';
    m.innerHTML = `
      <div class="pp-modal-card" style="position:relative;background:#fff;border-radius:12px;max-width:92%;max-height:92%;overflow:auto;box-shadow:0 30px 60px rgba(3,6,12,0.3);">
        <button id="ppClose" aria-label="Close" style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.7);color:#fff;border:none;width:40px;height:40px;border-radius:8px;font-size:20px;cursor:pointer;">×</button>
        <img id="ppImg" src="" alt="Preview" style="display:block;width:100%;height:auto;max-height:80vh;object-fit:contain;">
      </div>
    `;
    document.body.appendChild(m);
    return m;
  }

  // Open modal with given image src
  function openModalWithSrc(src) {
    if (!src) return;
    var modal = ensureModal();
    var img = modal.querySelector('#ppImg');
    if (img) { img.src = src; }
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    var closeBtn = modal.querySelector('#ppClose'); if (closeBtn) closeBtn.focus();
  }

  // Close modal
  function closeModal() {
    var m = document.getElementById('ppModal');
    if (!m) return;
    m.style.display = 'none';
    m.setAttribute('aria-hidden', 'true');
    var img = m.querySelector('#ppImg'); if (img) img.src = '';
  }

  // Delegate click for view buttons
  document.addEventListener('click', function (ev) {
    try {
      var t = ev.target;
      if (!t) return;

      // If clicked inside a .view-btn (or the button itself)
      var btn = t.closest ? t.closest('.view-btn') : null;
      if (btn) {
        ev.preventDefault();
        var card = btn.closest ? btn.closest('.work-box') : null;
        var image = card && card.querySelector ? card.querySelector('img') : null;
        var src = image ? (image.getAttribute('data-src') || image.src) : null;
        if (src) openModalWithSrc(src);
        return;
      }

      // Close triggers: close button or backdrop
      if (t.id === 'ppClose' || t.id === 'ppModal') {
        closeModal();
        return;
      }
    } catch (err) {
      console.warn('Works modal handler error', err);
    }
  }, false);

  // Prevent modal closing when clicking inside the card
  document.addEventListener('click', function (e) {
    if (!e || !e.target) return;
    var inside = e.target.closest && e.target.closest('.pp-modal-card');
    if (inside && !(e.target.id === 'ppClose')) {
      e.stopPropagation();
    }
  }, true);

  // ESC to close
  document.addEventListener('keydown', function (e) {
    if (e && e.key === 'Escape') {
      var m = document.getElementById('ppModal');
      if (m && m.style && m.style.display === 'flex') closeModal();
    }
  });

  // also add a simple safety: ensure existing inline links to #works scroll center
  try {
    var links = document.querySelectorAll('a[href="#works"]');
    for (var i = 0; i < links.length; i++) {
      (function (link) {
        link.addEventListener('click', function (ev) {
          ev.preventDefault();
          var target = document.querySelector('#works-card') || document.querySelector('#works');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      })(links[i]);
    }
  } catch (e) {/* ignore */ }

})();

/* Contact Form Logic (FormSubmit.co AJAX) */
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);

      // Use the email from the form action or hardcoded
      fetch("https://formsubmit.co/ajax/raju.mia4396@gmail.com", {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          submitBtn.textContent = 'Message Sent!';
          submitBtn.style.backgroundColor = '#10B981'; // Green success color
          contactForm.reset();
          setTimeout(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
          }, 3000);
        })
        .catch(error => {
          console.error('Error:', error);
          submitBtn.textContent = 'Error. Try again.';
          submitBtn.style.backgroundColor = '#EF4444'; // Red error color
          setTimeout(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
          }, 3000);
        });
    });
  }
});

