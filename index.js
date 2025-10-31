/* main.js - Alokah Ventures Limited
*/

const DEBUG = true; // set to false in production to silence console logs
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycby79xBqYQbqpma_MgOWNtr3MnQvNp-DR1gnRdrCMZXicTkoI2h64VZ52LExU65lAt4a6A/exec";

function log(...args) { if (DEBUG) console.log(...args); }
function safeQuery(selector, root = document) { return root.querySelector(selector); }
function safeQueryAll(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
function on(el, evt, handler, opts) { if (!el) return; el.addEventListener(evt, handler, opts); }

// Reusable honeypot helper
function ensureHoneypot(form) {
  if (!form) return;
  if (!form.querySelector('#website_hp')) {
    const hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'website_hp'; hp.id = 'website_hp';
    hp.style.display = 'none'; hp.tabIndex = -1; hp.autocomplete = 'off';
    form.appendChild(hp);
  }
}

// Guard wrapper to avoid double-binding
function onceBound(obj, key, fn) {
  if (!obj.dataset) return fn();
  if (obj.dataset[key]) return; obj.dataset[key] = 'true'; return fn();
}

// -------------------------
// Initializers
// -------------------------

function initNavbar() {
  try {
    const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links') || document.getElementById('nav-links');
    if (!menuToggle || !navLinks) { log('Navbar: not found - skipping'); return; }

    onceBound(menuToggle, 'menuBound', () => {
      on(menuToggle, 'click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('open');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-bars', !menuToggle.classList.contains('open'));
          icon.classList.toggle('fa-times', menuToggle.classList.contains('open'));
        }
      });
      log('Navbar initialized');
    });

    // Close nav when clicking a hash link (delegated)
    on(document, 'click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        navLinks.classList.remove('active');
      }
    });

  } catch (err) { console.error('initNavbar error', err); }
}

function initSmoothScroll() {
  try {
    // Back-to-top (if present)
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      on(backToTop, 'click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    log('Smooth scroll initialized');
  } catch (err) { console.error('initSmoothScroll error', err); }
}

function initAboutCarousel() {
  try {
    const aboutTrack = document.querySelector('.carousel-track');
    if (!aboutTrack) { log('About carousel: not found'); return; }

    // Prevent double-init
    if (aboutTrack.dataset.bound) { log('About carousel already bound'); return; }
    aboutTrack.dataset.bound = 'true';

    // Duplicate items for seamless scroll (only once)
    if (!aboutTrack.dataset.cloned) {
      aboutTrack.innerHTML += aboutTrack.innerHTML;
      aboutTrack.dataset.cloned = 'true';
    }

    let scrollSpeed = 1;
    const updateScrollSpeed = () => {
      const w = window.innerWidth;
      scrollSpeed = w <= 480 ? 2 : (w <= 768 ? 1.5 : 1);
    };
    updateScrollSpeed(); on(window, 'resize', updateScrollSpeed);

    let scrollPosition = 0;
    let rafId = null;
    function step() {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= aboutTrack.scrollWidth / 2) scrollPosition = 0;
      aboutTrack.scrollLeft = scrollPosition;
      rafId = requestAnimationFrame(step);
    }
    step();

    // Buttons
    const btnLeft = document.querySelector('.carousel-btn.left');
    const btnRight = document.querySelector('.carousel-btn.right');
    on(btnLeft, 'click', () => { aboutTrack.scrollLeft = Math.max(0, aboutTrack.scrollLeft - 300); });
    on(btnRight, 'click', () => { aboutTrack.scrollLeft += 300; });

    // Pause on hover/focus for accessibility
    on(aboutTrack, 'mouseenter', () => { if (rafId) cancelAnimationFrame(rafId); rafId = null; });
    on(aboutTrack, 'mouseleave', () => { if (!rafId) step(); });

    log('About carousel initialized');
  } catch (err) { console.error('initAboutCarousel error', err); }
}

function initCountryDropdown() {
  try {
    const countryDropdown = document.getElementById('countryCode');
    if (!countryDropdown) { log('Country dropdown: not present'); return; }
    if (countryDropdown.dataset.bound) return; countryDropdown.dataset.bound = 'true';

    const countries = [
      { name: "Uganda", code: "+256", iso: "ug", continent: "Africa", default: true },
      { name: "Kenya", code: "+254", iso: "ke", continent: "Africa" },
      { name: "Tanzania", code: "+255", iso: "tz", continent: "Africa" },
      { name: "Nigeria", code: "+234", iso: "ng", continent: "Africa" },
      { name: "South Africa", code: "+27", iso: "za", continent: "Africa" },
      { name: "United States", code: "+1", iso: "us", continent: "North America" },
      { name: "United Kingdom", code: "+44", iso: "gb", continent: "Europe" },
      { name: "India", code: "+91", iso: "in", continent: "Asia" },
      { name: "China", code: "+86", iso: "cn", continent: "Asia" },
      { name: "Australia", code: "+61", iso: "au", continent: "Oceania" }
    ];

    const continents = {};
    countries.forEach(c => { continents[c.continent] = continents[c.continent] || []; continents[c.continent].push(c); });

    ["Africa","Asia","Europe","North America","Oceania"].forEach(cont => {
      if (!continents[cont]) return;
      const group = document.createElement('optgroup'); group.label = cont;
      continents[cont].sort((a,b)=>a.name.localeCompare(b.name)).forEach(country => {
        const opt = document.createElement('option'); opt.value = country.code;
        opt.textContent = `${country.name} (${country.code})`;
        if (country.default) opt.selected = true;
        group.appendChild(opt);
      });
      countryDropdown.appendChild(group);
    });

    const other = document.createElement('option'); other.value='Other'; other.textContent='Other (Enter manually)'; countryDropdown.appendChild(other);

    log('Country dropdown populated');
  } catch (err) { console.error('initCountryDropdown error', err); }
}

function initContactForm() {
  try {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) { log('Contact form: not present'); return; }
    if (contactForm.dataset.bound) return; contactForm.dataset.bound = 'true';

    ensureHoneypot(contactForm);

    // Pre-fetch IP for small speedup (best-effort)
    let cachedIP = '';
    fetch('https://api64.ipify.org?format=json').then(r=>r.json()).then(d=>{ cachedIP = d.ip; }).catch(()=>{});

    on(contactForm, 'submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('#submitBtn');
      const formMessage = document.getElementById('formMessage');
      if (submitBtn) submitBtn.disabled = true;
      if (formMessage) { formMessage.style.display='none'; }

      try {
        const fd = new FormData(contactForm);
        fd.append('ip', cachedIP);
        fd.append('origin', window.location.hostname);
        if (fd.get('website_hp')) throw new Error('Spam detected');

        // Basic validations
        const name = fd.get('name') || ''; if (name.length < 2) throw new Error('Enter a valid name');
        const email = fd.get('email') || ''; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
        const enquiry = fd.get('enquiry') || ''; if (enquiry.length < 10) throw new Error('Enquiry too short');
        const phone = fd.get('phone') || '';
        if (phone && !/^[\d\s()+-]+$/.test(phone)) throw new Error('Invalid phone');

        const resp = await fetch(FORM_ENDPOINT, { method: 'POST', body: fd });
        const result = await resp.json();
        if (result.status === 'success') {
          showMessage(formMessage, 'We have received your message! Please check your email for confirmation.', 'success');
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        showMessage(formMessage, err.message || 'Submission error', 'error');
      } finally {
        if (submitBtn) setTimeout(()=> submitBtn.disabled = false, 1200);
      }
    });

    function showMessage(el, text, type='success'){
      if (!el) return; el.style.display='block'; el.textContent=text; el.setAttribute('role','alert');
      el.style.color = (type==='success') ? 'green' : 'red'; el.focus && el.focus();
      if (type==='success') setTimeout(()=>{ el.style.display='none'; }, 5000);
    }

    log('Contact form initialized');
  } catch (err) { console.error('initContactForm error', err); }
}
//=====================
// Initialize EmailJS
(function() {
  emailjs.init("Gzr0d4tNcndWpcLWa");//public key
})();

function initQuotationForm() {
  try {
    const quotationForm = document.getElementById('quotationForm');
    if (!quotationForm) {
      console.warn('Quotation form not found.');
      return;
    }

    if (quotationForm.dataset.bound) return;
    quotationForm.dataset.bound = 'true';

    // Add honeypot to prevent spam
    ensureHoneypot(quotationForm);

    // Prepare message container
    let formMessage = document.getElementById('quoteFormMessage');
    if (!formMessage) {
      formMessage = document.createElement('div');
      formMessage.id = 'quoteFormMessage';
      formMessage.style.display = 'none';
      quotationForm.insertBefore(formMessage, quotationForm.querySelector('button[type="submit"]'));
    }

    // Listen to submit event
    quotationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = quotationForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      formMessage.style.display = 'none';

      try {
        const fd = new FormData(quotationForm);
        if (fd.get('website_hp')) throw new Error('Spam detected');

        // Extract form fields
        const fullname = fd.get('fullname')?.trim() || '';
        const email = fd.get('email')?.trim() || '';
        const phone = fd.get('phone')?.trim() || '';
        const service = fd.get('service')?.trim() || '';
        const message = fd.get('message')?.trim() || '';

        // Validate inputs
        if (fullname.length < 2) throw new Error('Please enter your full name.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email.');
        if (!/^[\d\s()+-]{7,}$/.test(phone)) throw new Error('Please enter a valid phone number.');
        if (!service) throw new Error('Please select a service.');

        // Fetch user IP (optional)
        let userIP = '';
        try {
          const ipResp = await fetch('https://api64.ipify.org?format=json');
          const ipJson = await ipResp.json();
          userIP = ipJson.ip || '';
        } catch {
          userIP = 'Unavailable';
        }

        // Prepare EmailJS template parameters
        const templateParams = {
          name: fullname,
          email,
          phone,
          service,
          message,
          ip: userIP,
          time: new Date().toLocaleString(),
          origin_host: window.location.hostname
        };

        // Send email using EmailJS
        await emailjs.send('service_dfawmla', 'template_uc8mmjo', templateParams);

        // Show success message
        showMessage(formMessage, 'Your quotation request has been sent successfully!', 'success');
        quotationForm.reset();

        // Generate PDF if checkbox checked
        const downloadCheckbox = document.getElementById('downloadPDF');
        if (downloadCheckbox && downloadCheckbox.checked) {
          generatePDF(templateParams);
        }

      } catch (err) {
        showMessage(formMessage, err.message || 'Error sending quotation', 'error');
      } finally {
        if (submitBtn) setTimeout(() => (submitBtn.disabled = false), 1200);
      }
    });

    // PDF generator
    function generatePDF(dataObj) {
      if (!window.jspdf) {
        console.warn('jsPDF not loaded.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      let y = 15;
      doc.setFontSize(16);
      doc.text('Alokah Ventures Limited', 105, y, null, null, 'center');
      y += 8;
      doc.setFontSize(12);
      doc.text('Quotation Request Summary', 14, y);
      y += 8;

      Object.keys(dataObj).forEach((k) => {
        doc.setFontSize(10);
        doc.text(`${k}: ${dataObj[k]}`, 14, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      });

      doc.save('Quotation_Request.pdf');
    }

    // Display messages
    function showMessage(el, msg, type = 'success') {
      if (!el) return;
      el.style.display = 'block';
      el.textContent = msg;
      el.style.color = type === 'success' ? '#0a7' : 'red';
      el.focus?.();
      if (type === 'success') setTimeout(() => (el.style.display = 'none'), 6000);
    }

    console.log('Quotation form initialized with EmailJS.');
  } catch (err) {
    console.error('initQuotationForm error:', err);
  }
}

function initBlogs() {
  try {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer) { log('Blogs: no container'); return; }
    if (blogContainer.dataset.bound) return; blogContainer.dataset.bound = 'true';

    // Placeholder UI while loading
    blogContainer.innerHTML = '<div class="blog-placeholder">Loading blogs...</div>';

    fetch(`blogs.json?v=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error('Network response not ok'); return r.json(); })
      .then(blogs => {
        blogContainer.innerHTML = '';
        if (!blogs || blogs.length === 0) {
          blogContainer.innerHTML = `
            <div class="blog-empty">
              <h3>No blogs yet</h3>
              <p>We haven't published any articles. Check back soon or contact us to contribute.</p>
            </div>`;
          return;
        }
        blogs.forEach(blog => {
          const post = document.createElement('article'); post.className = 'blog-post';
          post.innerHTML = `
            <h3>${blog.title || 'Untitled'}</h3>
            <p class="meta"><strong>${blog.author || 'Admin'}</strong> | ${blog.date || ''}</p>
            <div class="preview">${(blog.excerpt || (blog.content||'').substring(0,150) + '...')}</div>
            <button class="read-more-btn">Read More</button>
            <div class="full-content" style="display:none;">${blog.content || ''}</div>`;
          const btn = post.querySelector('.read-more-btn'); const full = post.querySelector('.full-content');
          on(btn, 'click', () => {
            const open = full.style.display === 'block'; full.style.display = open ? 'none' : 'block'; btn.textContent = open ? 'Read More' : 'Read Less';
          });
          blogContainer.appendChild(post);
        });
      })
      .catch(err => { blogContainer.innerHTML = `<p style="color:red;">Error loading blogs: ${err.message}</p>`; });

    log('Blogs loader initialized');
  } catch (err) { console.error('initBlogs error', err); }
}

function initCareerModal() {
  try {
    const modal = document.getElementById('careerApplyModal');
    if (!modal) { log('Career modal: not present'); return; }
    if (modal.dataset.bound) return; modal.dataset.bound = 'true';

    const closeBtn = modal.querySelector('.career-modal-close');
    const applyBtns = document.querySelectorAll('.career-btn-apply');
    applyBtns.forEach(btn => on(btn, 'click', () => {
      const jobTitle = btn.dataset.jobTitle || '';
      const titleEl = document.getElementById('careerModalJobTitle'); if (titleEl) titleEl.textContent = jobTitle;
      modal.style.display = 'block';
    }));

    on(closeBtn, 'click', () => { modal.style.display = 'none'; });
    on(window, 'click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Filter jobs
    const careerFilter = document.getElementById('careerFilter');
    const careerCards = document.querySelectorAll('.career-job-card');
    if (careerFilter && careerCards.length) {
      on(careerFilter, 'change', () => {
        const val = careerFilter.value.toLowerCase(); careerCards.forEach(card => {
          card.style.display = (!val || card.dataset.category.toLowerCase() === val) ? 'block' : 'none';
        });
      });
    }

    log('Career modal initialized');
  } catch (err) { console.error('initCareerModal error', err); }
}

function initServicesTestimonials() {
  try {
    const root = document.getElementById('our-services'); if (!root) { log('Services testimonials: skip'); return; }
    if (root.dataset.bound) return; root.dataset.bound = 'true';

    const slider = root.querySelector('.testimonial-slider'); if (!slider) return; const cards = Array.from(slider.querySelectorAll('.testimonial'));
    if (!cards.length) return;

    let activeIndex = 0; let autoTimer = null; const AUTO_DELAY = 4500; let isHovering=false, isDragging=false;

    function setActive(i, smooth=true){ activeIndex = ((i%cards.length)+cards.length)%cards.length; cards.forEach((c,idx)=> c.classList.toggle('active', idx===activeIndex)); if (smooth) cards[activeIndex].scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'}); }

    function startAuto(){ stopAuto(); autoTimer = setInterval(()=>{ if (isHovering||isDragging) return; setActive(activeIndex+1, true); }, AUTO_DELAY); }
    function stopAuto(){ if (autoTimer){ clearInterval(autoTimer); autoTimer=null; } }

    on(slider, 'mouseenter', ()=>{ isHovering=true; stopAuto(); }); on(slider, 'mouseleave', ()=>{ isHovering=false; startAuto(); });

    // pointer drag support
    let dragStartX=0, scrollStartX=0;
    on(slider, 'pointerdown', (e)=>{ isDragging=true; dragStartX=e.clientX; scrollStartX=slider.scrollLeft; slider.setPointerCapture(e.pointerId); stopAuto(); });
    on(slider, 'pointerup', ()=>{ isDragging=false; setTimeout(()=>updateActiveFromCenter(), 120); startAuto(); });
    on(slider, 'pointermove', (e)=>{ if (!isDragging) return; const dx = dragStartX - e.clientX; slider.scrollLeft = scrollStartX + dx; });

    function indexClosestToCenter(){ const rect = slider.getBoundingClientRect(); const centerX = rect.left + rect.width/2; let min=Infinity, idx=0; cards.forEach((card,i)=>{ const r=card.getBoundingClientRect(); const cc = r.left + r.width/2; const d=Math.abs(centerX-cc); if (d<min){ min=d; idx=i; } }); return idx; }
    function updateActiveFromCenter(){ setActive(indexClosestToCenter(), false); }

    on(slider, 'scroll', ()=>{ window.requestAnimationFrame(()=>{ updateActiveFromCenter(); }); }, { passive:true });

    // keyboard
    on(root, 'keydown', (e)=>{ if (e.key==='ArrowRight') setActive(activeIndex+1,true); if (e.key==='ArrowLeft') setActive(activeIndex-1,true); });

    setTimeout(()=>{ updateActiveFromCenter(); startAuto(); }, 100);
    on(window, 'resize', ()=>{ clearTimeout(window._ourServicesResizeTimer); window._ourServicesResizeTimer = setTimeout(()=> updateActiveFromCenter(), 120); });

    log('Services testimonials initialized');
  } catch (err) { console.error('initServicesTestimonials error', err); }
}

function initTestimonialCarousel() {
  try {
    const carousel = document.querySelector('.testimonial-carousel'); if (!carousel) return; if (carousel.dataset.bound) return; carousel.dataset.bound='true';
    const cards = Array.from(carousel.children); if (!cards.length) return; let centerIndex = Math.floor(cards.length/2);

    function updateCards(){ cards.forEach((card, index)=>{
      const offset = index - centerIndex; card.classList.remove('center'); card.style.zIndex = offset===0?2:1; card.style.opacity = offset===0?1:0.4; card.style.filter = offset===0? 'none':'blur(2px)'; card.style.transform = `translateX(${offset*320}px) rotateY(${offset * -20}deg) scale(${offset===0?1:0.9})`;
      if (offset===0) card.classList.add('center');
    }); }

    updateCards(); setInterval(()=>{ centerIndex = (centerIndex+1)%cards.length; updateCards(); }, 4000);

    // drag/swipe
    let startX=0, dragging=false;
    on(carousel, 'mousedown', e=>{ dragging=true; startX=e.pageX; });
    on(carousel, 'mouseup', e=>{ if(!dragging) return; const dx = e.pageX - startX; if (dx>50) centerIndex=(centerIndex-1+cards.length)%cards.length; if (dx<-50) centerIndex=(centerIndex+1)%cards.length; updateCards(); dragging=false; });
    on(carousel, 'touchstart', e=>{ dragging=true; startX=e.touches[0].clientX; });
    on(carousel, 'touchend', e=>{ if(!dragging) return; const dx = e.changedTouches[0].clientX - startX; if (dx>50) centerIndex=(centerIndex-1+cards.length)%cards.length; if (dx<-50) centerIndex=(centerIndex+1)%cards.length; updateCards(); dragging=false; });

    log('3D testimonial carousel initialized');
  } catch (err) { console.error('initTestimonialCarousel error', err); }
}

// -------------------------
// Boot
// -------------------------

document.addEventListener('DOMContentLoaded', () => {
  log('Alokah main.js booting...');
  const initializers = [
    initNavbar,
    initSmoothScroll,
    initAboutCarousel,
    initCountryDropdown,
    initContactForm,
    initQuotationForm,
    initBlogs,
    initCareerModal,
    initServicesTestimonials,
    initTestimonialCarousel
  ];

  initializers.forEach(fn => {
    try { fn(); } catch (err) { console.error('Initializer error', err); }
  });

  log('Alokah main.js ready');
});


// =========================
// FACTS ANIMATION
// =========================
const facts = [
  "Alokah’s dry containers transport electronics safely.",
  "Reefer containers maintain cold chain for perishables.",
  "Tanker containers move liquids including fuel and chemicals.",
  "Our fleet adheres to international safety standards.",
  "Containers are cleaned and inspected before each journey."
];

let factIndex = 0;
const factEl = document.getElementById("fact");

function showFact() {
  factEl.textContent = facts[factIndex];
  factIndex = (factIndex + 1) % facts.length;
}
setInterval(showFact, 4000);
showFact();
