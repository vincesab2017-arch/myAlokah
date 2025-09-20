document.addEventListener("DOMContentLoaded", function () {
  console.log("Website Loaded Successfully!");

  /*** SMOOTH SCROLLING FOR ANCHORS ***/
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
      document.querySelector('.nav-links')?.classList.remove('active');
    });
  });

  /*** MOBILE MENU TOGGLE ***/
  const menuToggle = document.querySelector(".menu-toggle");
  menuToggle?.addEventListener("click", function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
  });

  /*** COUNTRY DROPDOWN ***/
  const countryDropdown = document.getElementById("countryCode");
  if (countryDropdown) {
    const countries = [
      // Africa (prioritized first)
      { name: "Algeria", code: "+213", flag: "🇩🇿", continent: "Africa" },
      { name: "Angola", code: "+244", flag: "🇦🇴", continent: "Africa" },
      { name: "Botswana", code: "+267", flag: "🇧🇼", continent: "Africa" },
      { name: "Egypt", code: "+20", flag: "🇪🇬", continent: "Africa" },
      { name: "Ghana", code: "+233", flag: "🇬🇭", continent: "Africa" },
      { name: "Kenya", code: "+254", flag: "🇰🇪", continent: "Africa" },
      { name: "Nigeria", code: "+234", flag: "🇳🇬", continent: "Africa" },
      { name: "South Africa", code: "+27", flag: "🇿🇦", continent: "Africa" },
      { name: "Tanzania", code: "+255", flag: "🇹🇿", continent: "Africa" },
      { name: "Uganda", code: "+256", flag: "🇺🇬", continent: "Africa", default: true },
      { name: "Zambia", code: "+260", flag: "🇿🇲", continent: "Africa" },
      { name: "Zimbabwe", code: "+263", flag: "🇿🇼", continent: "Africa" },
      // Asia
      { name: "China", code: "+86", flag: "🇨🇳", continent: "Asia" },
      { name: "India", code: "+91", flag: "🇮🇳", continent: "Asia" },
      { name: "Indonesia", code: "+62", flag: "🇮🇩", continent: "Asia" },
      { name: "Japan", code: "+81", flag: "🇯🇵", continent: "Asia" },
      { name: "Malaysia", code: "+60", flag: "🇲🇾", continent: "Asia" },
      // Europe
      { name: "France", code: "+33", flag: "🇫🇷", continent: "Europe" },
      { name: "Germany", code: "+49", flag: "🇩🇪", continent: "Europe" },
      { name: "Italy", code: "+39", flag: "🇮🇹", continent: "Europe" },
      { name: "Spain", code: "+34", flag: "🇪🇸", continent: "Europe" },
      { name: "United Kingdom", code: "+44", flag: "🇬🇧", continent: "Europe" },
      // North America
      { name: "Canada", code: "+1", flag: "🇨🇦", continent: "North America" },
      { name: "Mexico", code: "+52", flag: "🇲🇽", continent: "North America" },
      { name: "United States", code: "+1", flag: "🇺🇸", continent: "North America" },
      // Oceania
      { name: "Australia", code: "+61", flag: "🇦🇺", continent: "Oceania" },
      { name: "New Zealand", code: "+64", flag: "🇳🇿", continent: "Oceania" }
    ];

    const continents = {};
    countries.forEach(country => {
      if (!continents[country.continent]) continents[country.continent] = [];
      continents[country.continent].push(country);
    });
    Object.keys(continents).forEach(continent => continents[continent].sort((a, b) => a.name.localeCompare(b.name)));
    const sortedContinents = ["Africa", "Asia", "Europe", "North America", "Oceania"];
    sortedContinents.forEach(continent => {
      if (continents[continent]) {
        const group = document.createElement("optgroup");
        group.label = continent;
        continents[continent].forEach(country => {
          const option = document.createElement("option");
          option.value = country.code;
          option.textContent = `${country.flag} ${country.name} (${country.code})`;
          if (country.default) option.selected = true;
          group.appendChild(option);
        });
        countryDropdown.appendChild(group);
      }
    });
    const otherOption = document.createElement("option");
    otherOption.value = "Other";
    otherOption.textContent = "Other (Enter manually)";
    countryDropdown.appendChild(otherOption);
  }

  /*** CONTACT FORM ***/
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    fetch("https://api64.ipify.org?format=json")
      .then(resp => resp.json())
      .then(data => {
        contactForm.addEventListener("submit", async function (event) {
          event.preventDefault();
          const submitBtn = document.getElementById("submitBtn");
          const formMessage = document.getElementById("formMessage");
          submitBtn.disabled = true;
          formMessage.style.display = "none";

          try {
            let formData = new FormData(this);
            formData.append("ip", data.ip);
            formData.append("origin", window.location.hostname);

            const errors = validateForm(formData);
            if (errors.length > 0) throw new Error(errors.join("\n"));

            formData = sanitizeFormData(formData);
            const scriptURL = "https://script.google.com/macros/s/AKfycby79xBqYQbqpma_MgOWNtr3MnQvNp-DR1gnRdrCMZXicTkoI2h64VZ52LExU65lAt4a6A/exec";
            const response = await fetch(scriptURL, { method: "POST", body: formData });
            const result = await response.json();

            if (result.status === "success") {
              showMessage("We have received your message, and will get back to you!", "success");
              contactForm.reset();
              const ugandaOption = Array.from(countryDropdown.options).find(option => option.textContent.includes("Uganda"));
              if (ugandaOption) ugandaOption.selected = true;
            } else throw new Error(result.message || "Submission failed");
          } catch (err) {
            showMessage(err.message || "Something went wrong. Please try again.", "error");
          } finally {
            setTimeout(() => { submitBtn.disabled = false; }, 3000);
          }
        });
      })
      .catch(error => console.error("IP fetch error:", error));

    function showMessage(message, type = "success") {
      const formMessage = document.getElementById("formMessage");
      formMessage.style.display = "block";
      formMessage.textContent = message;
      formMessage.style.color = type === "success" ? "green" : "red";
      if (type === "success") setTimeout(() => { formMessage.style.display = "none"; }, 5000);
    }

    const validationRules = {
      name: { min: 2, max: 100, pattern: /^[a-zA-Z\s'-]+$/ },
      email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      phone: { pattern: /^[\d\s()+\-]{8,}$/ },
      enquiry: { min: 10, max: 5000 }
    };

    function validateForm(formData) {
      const errors = [];
      const name = formData.get('name');
      if (!name || name.length < validationRules.name.min || name.length > validationRules.name.max || !validationRules.name.pattern.test(name))
        errors.push("Please enter a valid name (2-100 characters, letters only)");
      const email = formData.get('email');
      if (!email || !validationRules.email.pattern.test(email)) errors.push("Please enter a valid email address");
      const phone = formData.get('phone');
      if (phone && !validationRules.phone.pattern.test(phone)) errors.push("Please enter a valid phone number");
      const enquiry = formData.get('enquiry');
      if (!enquiry || enquiry.length < validationRules.enquiry.min || enquiry.length > validationRules.enquiry.max)
        errors.push("Enquiry must be between 10 and 5000 characters");
      return errors;
    }

    function sanitizeFormData(formData) {
      const sanitized = new FormData();
      for (let [key, value] of formData.entries()) sanitized.append(key, sanitizeString(value));
      return sanitized;
    }

    function sanitizeString(str) {
      if (typeof str !== 'string') return str;
      return str.trim().replace(/[<>]/g, '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
    }
  }

  /*** TESTIMONIAL SLIDER ***/
  const testimonials = document.querySelectorAll(".testimonial");
  const dots = document.querySelectorAll(".dot");
  if (testimonials.length && dots.length) {
    let currentIndex = 0;
    function showTestimonial(index) {
      testimonials.forEach((t, i) => t.classList.toggle("active", i === index));
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    }
    function nextTestimonial() { currentIndex = (currentIndex + 1) % testimonials.length; showTestimonial(currentIndex); }
    let autoSlide = setInterval(nextTestimonial, 5000);
    dots.forEach((dot, i) => dot.addEventListener("click", () => { currentIndex = i; showTestimonial(currentIndex); clearInterval(autoSlide); autoSlide = setInterval(nextTestimonial, 5000); }));
  }

  /*** BLOG POSTS DYNAMIC LOADING (updated to match blogs.html) ***/
  const blogContainer = document.getElementById("blog-container");
  if (blogContainer) {
    fetch("blogs.json")
      .then(resp => { if (!resp.ok) throw new Error("Failed to load blogs"); return resp.json(); })
      .then(blogs => {
        blogs.forEach(blog => {
          const post = document.createElement("div");
          post.classList.add("blog-post");
          post.innerHTML = `
            <h3>${blog.title}</h3>
            <div class="blog-content"><p>${blog.content}</p></div>
            <button class="read-more-btn">Read More</button>
          `;
          blogContainer.appendChild(post);
        });

        // Toggle Read More / Read Less
        document.querySelectorAll(".read-more-btn").forEach(btn => {
          btn.addEventListener("click", function () {
            const post = this.parentElement;
            post.classList.toggle("expanded");
            this.textContent = post.classList.contains("expanded") ? "Read Less" : "Read More";
          });
        });
      })
      .catch(err => {
        blogContainer.innerHTML = `<p style="color:red;">Error loading blogs: ${err.message}</p>`;
      });
  }

});
