/* ============================================================
   ORYGIN HARVEST — main.js
   Part 3: JavaScript functionality
   Handles: product filtering, FAQ accordion, gallery lightbox,
   enquiry form validation + response, contact form validation.
   Each section only runs if the relevant elements exist on the
   current page, so this one file can be linked from every page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------
     1. PRODUCT FILTER (products.html)
     Lets the visitor show only the box type they're interested
     in. Cards are matched using a data-category attribute.
     ---------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.products-grid .card');

  if (filterButtons.length && productCards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Update which button looks "active"
        filterButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const chosenCategory = btn.getAttribute('data-filter');

        productCards.forEach(function (card) {
          const cardCategory = card.getAttribute('data-category');
          if (chosenCategory === 'all' || chosenCategory === cardCategory) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     2. FAQ ACCORDION (products.html)
     Clicking a question toggles its answer open/closed. Only
     one answer is open at a time to keep the page tidy.
     ---------------------------------------------------------- */
  const accordionItems = document.querySelectorAll('.accordion-item');

  if (accordionItems.length) {
    accordionItems.forEach(function (item) {
      const question = item.querySelector('.accordion-question');

      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');

        // Close every item first
        accordionItems.forEach(function (i) { i.classList.remove('open'); });

        // Re-open the clicked one, unless it was already open
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  /* ----------------------------------------------------------
     3. GALLERY LIGHTBOX (about.html)
     Clicking a thumbnail opens a full-size overlay. Supports
     closing via the close button, clicking the background,
     or pressing Escape.
     ---------------------------------------------------------- */
  const galleryThumbs = document.querySelectorAll('.gallery-item img');
  const lightbox = document.getElementById('lightbox');

  if (galleryThumbs.length && lightbox) {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    galleryThumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        lightboxImg.src = thumb.src;
        lightboxImg.alt = thumb.alt;
        lightboxCaption.textContent = thumb.alt;
        lightbox.classList.add('open');
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
    }

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (e) {
      // Only close if the dark background itself was clicked,
      // not the image or caption inside it.
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  /* ----------------------------------------------------------
     4. INTERACTIVE DELIVERY MAP (contact.html)
     Uses Leaflet (free, no API key) to show the two delivery
     areas mentioned in the Contact Details section.
     ---------------------------------------------------------- */
  const mapContainer = document.getElementById('delivery-map');

  if (mapContainer && typeof L !== 'undefined') {
    const map = L.map('delivery-map').setView([-30.05, 23.5], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    const deliveryAreas = [
      { name: 'Cape Town', coords: [-33.9249, 18.4241], note: 'Weekly deliveries across the greater Cape Town area.' },
      { name: 'Johannesburg', coords: [-26.2041, 28.0473], note: 'Weekly deliveries across the greater Johannesburg area.' }
    ];

    const markerGroup = [];

    deliveryAreas.forEach(function (area) {
      const marker = L.marker(area.coords).addTo(map);
      marker.bindPopup('<strong>' + area.name + '</strong><br>' + area.note);
      markerGroup.push(marker);
    });

    // Fit the map neatly around both markers
    const group = L.featureGroup(markerGroup);
    map.fitBounds(group.getBounds().pad(0.5));
  }

  /* ----------------------------------------------------------
     5. ENQUIRY FORM — validation + dynamic response
     (enquiry.html)
     ---------------------------------------------------------- */
  const enquiryForm = document.getElementById('enquiry-form');

  if (enquiryForm) {
    const packagePrices = {
      duo: { label: 'The Duo', price: 'R289.99 / week' },
      gathering: { label: 'The Gathering', price: 'R459.99 / week' },
      harvest: { label: 'The Harvest', price: 'R689.99 / week' },
      exotic: { label: 'The Exotic Box', price: 'Price on Request — our team will confirm pricing based on availability.' },
      custom: { label: 'The Custom Box', price: 'Price on Request — pricing depends on your chosen fruits.' }
    };

    enquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(enquiryForm);

      let isValid = true;

      // Full name: required, letters/spaces only
      const name = document.getElementById('enquiry-name');
      if (!/^[A-Za-z\s'-]{2,}$/.test(name.value.trim())) {
        showError(name, 'Please enter your full name.');
        isValid = false;
      }

      // Email: required, basic format check
      const email = document.getElementById('enquiry-email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        isValid = false;
      }

      // Phone: South African format, e.g. 082 123 4567 or 0821234567
      const phone = document.getElementById('enquiry-phone');
      if (!/^0\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(phone.value.trim())) {
        showError(phone, 'Please enter a valid SA phone number, e.g. 082 123 4567.');
        isValid = false;
      }

      // Address: required
      const address = document.getElementById('enquiry-address');
      if (address.value.trim().length < 5) {
        showError(address, 'Please enter your delivery address.');
        isValid = false;
      }

      // Package: required
      const packageSelect = document.getElementById('enquiry-package');
      if (!packageSelect.value) {
        showError(packageSelect, 'Please choose a package.');
        isValid = false;
      }

      // Custom fruits: required only if Custom Box is chosen
      const fruits = document.getElementById('enquiry-fruits');
      if (packageSelect.value === 'custom' && fruits.value.trim().length < 3) {
        showError(fruits, 'Please list your six chosen fruits for the Custom Box.');
        isValid = false;
      }

      if (!isValid) {
        return;
      }

      // Build the dynamic response
      const chosen = packagePrices[packageSelect.value];
      const day = document.getElementById('enquiry-day').value;
      const dayText = day ? day.charAt(0).toUpperCase() + day.slice(1) : 'a day to be confirmed';

      const responseBox = document.getElementById('enquiry-response');
      responseBox.innerHTML =
        '<h3>Thank you, ' + escapeHtml(name.value.trim()) + '!</h3>' +
        '<p>Your enquiry for <strong>' + chosen.label + '</strong> (' + chosen.price + ') has been received.</p>' +
        '<p>Preferred delivery day: <strong>' + dayText + '</strong></p>' +
        '<p>We will contact you shortly at ' + escapeHtml(email.value.trim()) + ' to confirm availability and finalise your first delivery.</p>';
      responseBox.classList.add('show');
      responseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

      enquiryForm.reset();
    });
  }

  /* ----------------------------------------------------------
     6. CONTACT FORM — validation before sending
     (contact.html)
     ---------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      clearErrors(contactForm);
      let isValid = true;

      const name = document.getElementById('contact-name');
      if (!/^[A-Za-z\s'-]{2,}$/.test(name.value.trim())) {
        showError(name, 'Please enter your full name.');
        isValid = false;
      }

      const email = document.getElementById('contact-email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        isValid = false;
      }

      const phone = document.getElementById('contact-phone');
      if (phone.value.trim() && !/^0\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(phone.value.trim())) {
        showError(phone, 'Please enter a valid SA phone number, e.g. 082 123 4567.');
        isValid = false;
      }

      const type = document.getElementById('contact-type');
      if (!type.value) {
        showError(type, 'Please select a message type.');
        isValid = false;
      }

      const message = document.getElementById('contact-message');
      if (message.value.trim().length < 10) {
        showError(message, 'Please write a short message (at least 10 characters).');
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        return;
      }

      // Valid: let the form submit via its mailto action, but
      // let the visitor know what's about to happen.
      const note = document.getElementById('contact-response');
      note.textContent = 'Your email client will now open so you can send your message to Orygin Harvest.';
      note.classList.add('show');
    });
  }

  /* ----------------------------------------------------------
     Shared validation helpers
     ---------------------------------------------------------- */
  function showError(field, message) {
    field.classList.add('input-error');
    const errorEl = document.createElement('p');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    field.insertAdjacentElement('afterend', errorEl);
  }

  function clearErrors(form) {
    form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});
