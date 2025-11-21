/* main.js - Alokah Ventures Limited
*/

/****************************************************
 *  ALOKAH CONTACT FORM – EMAILJS ONLY (CLEAN)
 ****************************************************/

// ======== EMAILJS CONFIG ========
const EMAILJS_PUBLIC_KEY = "Gzr0d4tNcndWpcLWa"; 
const EMAILJS_ADMIN_SERVICE = "service_dfawmla"; 
const EMAILJS_ADMIN_TEMPLATE = "template_flbv526"; 
//const EMAILJS_CONFIRM_SERVICE = "YOUR_CONFIRM_SERVICE_ID"; 
//const EMAILJS_CONFIRM_TEMPLATE = "YOUR_CONFIRM_TEMPLATE_ID"; 


// ================================
// HELPERS
// ================================
function on(el, evt, handler) {
  if (el) el.addEventListener(evt, handler);
}

function showMessage(el, text, type = "success") {
  if (!el) return;
  el.style.display = "block";
  el.textContent = text;
  el.style.color = type === "success" ? "green" : "red";

  if (type === "success") {
    setTimeout(() => (el.style.display = "none"), 5000);
  }
}


// ================================
// COUNTRY DROPDOWN
// ================================
function initCountryDropdown() {
  const dropdown = document.getElementById("countryCode");
  if (!dropdown || dropdown.dataset.bound) return;

  dropdown.dataset.bound = "true";

  const countries = [
    { name: "Uganda", code: "+256", continent: "Africa", default: true },
    { name: "Kenya", code: "+254", continent: "Africa" },
    { name: "Tanzania", code: "+255", continent: "Africa" },
    { name: "Nigeria", code: "+234", continent: "Africa" },
    { name: "South Africa", code: "+27", continent: "Africa" },
    { name: "United States", code: "+1", continent: "North America" },
    { name: "United Kingdom", code: "+44", continent: "Europe" },
    { name: "India", code: "+91", continent: "Asia" },
    { name: "China", code: "+86", continent: "Asia" },
    { name: "Australia", code: "+61", continent: "Oceania" }
  ];

  const byContinent = {};

  countries.forEach(c => {
    (byContinent[c.continent] ||= []).push(c);
  });

  ["Africa", "Asia", "Europe", "North America", "Oceania"].forEach(cont => {
    if (!byContinent[cont]) return;

    const group = document.createElement("optgroup");
    group.label = cont;

    byContinent[cont]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(country => {
        const opt = document.createElement("option");
        opt.value = country.code;
        opt.textContent = `${country.name} (${country.code})`;
        if (country.default) opt.selected = true;
        group.appendChild(opt);
      });

    dropdown.appendChild(group);
  });

  const other = document.createElement("option");
  other.value = "Other";
  other.textContent = "Other (Enter manually)";
  dropdown.appendChild(other);
}


// ================================
// CONTACT FORM (EMAILJS ONLY)
// ================================
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form || form.dataset.bound) return;

  form.dataset.bound = "true";

  // Load EmailJS
  emailjs.init(EMAILJS_PUBLIC_KEY);

  // Cache IP (optional)
  let userIP = "";
  fetch("https://api64.ipify.org?format=json")
    .then(res => res.json())
    .then(data => (userIP = data.ip))
    .catch(() => {});

  on(form, "submit", async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const msgBox = document.getElementById("formMessage");

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Sending...`;

    // Add spinner
    if (!document.getElementById("spinner-style")) {
      const s = document.createElement("style");
      s.id = "spinner-style";
      s.textContent = `
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #fff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { from {rotate:0deg;} to {rotate:360deg;} }
      `;
      document.head.appendChild(s);
    }

    try {
      // Collect form data
      const name = form.querySelector('input[placeholder="Your Name"]').value.trim();
      const organization = form.querySelector('input[placeholder="Organization"]').value.trim();
      const countryCode = document.getElementById("countryCode").value;
      const phone = form.querySelector('input[placeholder="Phone Number"]').value.trim();
      const email = form.querySelector('input[placeholder="Email Address"]').value.trim();
      const message = form.querySelector("textarea").value.trim();

      // Validation
      if (name.length < 2) throw new Error("Please enter your full name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address.");
      if (message.length < 5) throw new Error("Please enter a more detailed message.");

      // Params for EmailJS
      const params = {
        user_name: name,
        organization,
        country_code: countryCode,
        phone,
        user_email: email,
        message,
        date: new Date().toLocaleString(),
        ip: userIP,
        origin: window.location.hostname
      };

      // 1. Send email to admin
      await emailjs.send(EMAILJS_ADMIN_SERVICE, EMAILJS_ADMIN_TEMPLATE, params);

      // 2. Confirmation email to sender
      await emailjs.send(EMAILJS_CONFIRM_SERVICE, EMAILJS_CONFIRM_TEMPLATE, params);

      showMessage(msgBox, "✅ Thank you! Your message was successfully sent.");

      form.reset();
    } catch (err) {
      showMessage(msgBox, err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 800);
    }
  });
}


// ================================
// INIT EVERYTHING
// ================================
document.addEventListener("DOMContentLoaded", () => {
  initCountryDropdown();
  initContactForm();
});

//===============
//quatation
//================
function initQuotationForm() {
  try {
    const quotationForm = document.getElementById('quotationForm');
    if (!quotationForm) { log('Quotation form: not present'); return; }
    if (quotationForm.dataset.bound) return; quotationForm.dataset.bound = 'true';

    ensureHoneypot(quotationForm);

    // Ensure message area exists
    let formMessage = document.getElementById('quoteFormMessage');
    if (!formMessage) {
      formMessage = document.createElement('div'); formMessage.id='quoteFormMessage'; formMessage.style.display='none'; quotationForm.insertBefore(formMessage, quotationForm.querySelector('button[type="submit"]'));
    }
    formMessage.setAttribute('role','alert'); formMessage.setAttribute('tabindex','-1');

    on(quotationForm, 'submit', async (e) => {
      e.preventDefault();
      const submitBtn = quotationForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true; formMessage.style.display='none';

      try {
        const fd = new FormData(quotationForm);
        if (fd.get('website_hp')) throw new Error('Spam detected');

        // Validation examples (extend as needed)
        const fullname = fd.get('fullname') || ''; if (fullname.length < 2) throw new Error('Enter your full name');
        const email = fd.get('email') || ''; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email');
        const phone = fd.get('phone') || ''; if (!/^[\d\s()+-]{7,}$/.test(phone)) throw new Error('Enter a valid phone');
        if (!fd.get('service')) throw new Error('Select a service');

        // Fetch IP
        try { const ipResp = await fetch('https://api64.ipify.org?format=json'); const ipJson = await ipResp.json(); fd.append('ip', ipJson.ip || ''); } catch(e) { fd.append('ip',''); }
        fd.append('origin_host', window.location.hostname);

        // Optionally send to backend
        const resp = await fetch(FORM_ENDPOINT, { method: 'POST', body: fd });
        const result = await resp.json();
        if (result.status === 'success') {
          showMessage(formMessage, 'Your request has been submitted! Please check your email for confirmation.', 'success');
          quotationForm.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        showMessage(formMessage, err.message || 'Error submitting form', 'error');
      } finally {
        if (submitBtn) setTimeout(()=> submitBtn.disabled = false, 1200);
      }
    });

    // PDF generation using jsPDF if requested
    function generatePDF(dataObj) {
      if (!window.jspdf) { console.warn('jsPDF not present'); return; }
      const { jsPDF } = window.jspdf; const doc = new jsPDF();
      let y = 15; doc.setFontSize(16); doc.text('Alokah Ventures Limited', 105, y, null, null, 'center'); y += 8;
      doc.setFontSize(10); doc.text('Quotation Request', 14, y); y += 8;
      Object.keys(dataObj).forEach(k => {
        doc.setFontSize(10); doc.text(`${k}: ${dataObj[k]}`, 14, y); y += 6; if (y > 280) { doc.addPage(); y = 15; }
      });
      doc.save('Quotation_Request.pdf');
    }

    // Handle download checkbox
    const downloadCheckbox = document.getElementById('downloadPDF');
    if (downloadCheckbox) {
      quotationForm.addEventListener('submit', (e) => {
        // If checked, generate pdf from form values (non-blocking)
        if (downloadCheckbox.checked) {
          const formData = new FormData(quotationForm); const obj = {};
          formData.forEach((v,k) => { if (k !== 'website_hp') obj[k] = v; });
          generatePDF(obj);
        }
      });
    }

    function showMessage(el, msg, type='success') {
      if (!el) return; el.style.display='block'; el.textContent = msg; el.style.color = (type==='success') ? '#0a7' : 'red'; el.focus && el.focus(); if (type==='success') setTimeout(()=>{ el.style.display='none'; }, 6000);
    }

    log('Quotation form initialized');
  } catch (err) { console.error('initQuotationForm error', err); }
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
