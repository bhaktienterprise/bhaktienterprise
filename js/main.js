/**
 * BHAKTI ENTERPRISE - Enterprise Client-Side Scripts
 * Pure Vanilla JavaScript (Clean, Modern, Accessible)
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initStatsCounter();
  initCopyButtons();
  initContactForm();
  initActiveNavLink();
});

/**
 * 1. Sticky Header Background Transition on Scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 2. Responsive Mobile Drawer Navigation
 */
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);

    // Toggle icon between hamburger and close
    const icon = toggleBtn.querySelector('iconify-icon');
    if (icon) {
      icon.setAttribute('icon', isOpen ? 'lucide:x' : 'lucide:menu');
    }
  });

  // Close nav on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const icon = toggleBtn.querySelector('iconify-icon');
      if (icon) icon.setAttribute('icon', 'lucide:menu');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const icon = toggleBtn.querySelector('iconify-icon');
      if (icon) icon.setAttribute('icon', 'lucide:menu');
    }
  });
}

/**
 * 3. Animated Number Counter using Intersection Observer
 */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseInt(target.getAttribute('data-target'), 10);
        const suffix = target.getAttribute('data-suffix') || '';
        if (isNaN(targetVal)) return;

        let current = 0;
        const duration = 1600;
        const stepTime = 25;
        const totalSteps = duration / stepTime;
        const increment = targetVal / totalSteps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetVal) {
            target.textContent = `${targetVal}${suffix}`;
            clearInterval(timer);
          } else {
            target.textContent = `${Math.floor(current)}${suffix}`;
          }
        }, stepTime);

        obs.unobserve(target);
      }
    });
  }, { threshold: 0.2 });

  statNumbers.forEach(stat => observer.observe(stat));
}

/**
 * 4. Fast Copy-to-Clipboard with Toast Notification
 */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`Copied to clipboard: ${textToCopy}`);
      } catch (err) {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast(`Copied to clipboard: ${textToCopy}`);
      }
    });
  });
}

/**
 * Toast Notification Trigger
 */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <iconify-icon icon="lucide:check-circle" style="color: #10b981; font-size: 1.2rem;"></iconify-icon>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/**
 * 5. Contact Formspree Ready Submission Handler
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Auto-select service dropdown if provided in URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    const serviceSelect = document.getElementById('serviceSelect');
    if (serviceSelect) {
      for (let option of serviceSelect.options) {
        if (option.value.toLowerCase() === serviceParam.toLowerCase() ||
            option.text.toLowerCase() === serviceParam.toLowerCase()) {
          option.selected = true;
          break;
        }
      }
    }
  }

  const statusAlert = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    const actionUrl = form.getAttribute('action');

    // If still using placeholder, alert user politely with instructions
    if (actionUrl.includes('YOUR_FORMSPREE_ID') || actionUrl === '' || actionUrl === '#') {
      e.preventDefault();
      
      // Provide immediate interactive preview simulation for testing
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <iconify-icon icon="lucide:loader-2" class="spin" style="font-size: 1.2rem;"></iconify-icon>
        <span>Validating inquiry...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Send Message</span>
          <iconify-icon icon="lucide:send" class="btn-icon"></iconify-icon>
        `;

        if (statusAlert) {
          statusAlert.className = 'form-status-alert success';
          statusAlert.innerHTML = `
            <strong>Inquiry Prepared Successfully!</strong><br>
            Please replace <code>YOUR_FORMSPREE_ID</code> with your active Formspree Form ID in <code>contact.html</code> to receive live emails directly at <strong>bhaktienterprise49@gmail.com</strong>.
          `;
          statusAlert.style.display = 'block';
        }
        form.reset();
        showToast('Inquiry form ready for Formspree integration!');
      }, 900);

      return;
    }

    // Live Formspree Fetch Handler
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <iconify-icon icon="lucide:loader-2" class="spin" style="font-size: 1.2rem;"></iconify-icon>
      <span>Sending Message...</span>
    `;

    try {
      const formData = new FormData(form);
      const response = await fetch(actionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <iconify-icon icon="lucide:send" class="btn-icon"></iconify-icon>
      `;

      if (response.ok) {
        if (statusAlert) {
          statusAlert.className = 'form-status-alert success';
          statusAlert.textContent = 'Thank you! Your inquiry has been sent to Bhakti Enterprise. Our team will contact you shortly.';
          statusAlert.style.display = 'block';
        }
        form.reset();
        showToast('Message sent successfully!');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit form.');
      }
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <iconify-icon icon="lucide:send" class="btn-icon"></iconify-icon>
      `;

      if (statusAlert) {
        statusAlert.className = 'form-status-alert error';
        statusAlert.textContent = 'Oops! There was an issue submitting your request. Please email us directly at bhaktienterprise49@gmail.com or call +91 6354 980 982.';
        statusAlert.style.display = 'block';
      }
    }
  });
}

/**
 * 6. Set Active Nav Link Based on URL
 */
function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
