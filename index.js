

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
            document.querySelector('.nav-links').classList.remove('active');
        });
    });

    document.querySelector(".menu-toggle").addEventListener("click", function() {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    console.log("Website Loaded Successfully!");
});

document.addEventListener("DOMContentLoaded", function () {
    const countryDropdown = document.getElementById("countryCode");

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

    // Sort countries alphabetically within each continent
    const continents = {};
    countries.forEach(country => {
        if (!continents[country.continent]) continents[country.continent] = [];
        continents[country.continent].push(country);
    });

    Object.keys(continents).forEach(continent => {
        continents[continent].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Prioritize Africa first, then others
    const sortedContinents = ["Africa", "Asia", "Europe", "North America", "Oceania"];

    sortedContinents.forEach(continent => {
        if (continents[continent]) {
            const group = document.createElement("optgroup");
            group.label = continent;
            continents[continent].forEach(country => {
                const option = document.createElement("option");
                option.value = country.code;
                option.textContent = `${country.flag} ${country.name} (${country.code})`;

                // Set Uganda as the default selected country
                if (country.default) option.selected = true;

                group.appendChild(option);
            });
            countryDropdown.appendChild(group);
        }
    });

    // Add "Other" option
    const otherOption = document.createElement("option");
    otherOption.value = "Other";
    otherOption.textContent = "🌍 Other (Enter manually)";
    countryDropdown.appendChild(otherOption);

    // Form validation rules
    const validationRules = {
        name: {
            min: 2,
            max: 100,
            pattern: /^[a-zA-Z\s'-]+$/
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            pattern: /^[\d\s()+\-]{8,}$/
        },
        enquiry: {
            min: 5,
            max: 5000
        }
    };

    // Validate form data
    function validateForm(formData) {
        const errors = [];

        // Name validation
        const name = formData.get('name');
        if (!name || name.length < validationRules.name.min ||
            name.length > validationRules.name.max ||
            !validationRules.name.pattern.test(name)) {
            errors.push("Please enter a valid name (2-100 characters, letters only)");
        }

        // Email validation
        const email = formData.get('email');
        if (!email || !validationRules.email.pattern.test(email)) {
            errors.push("Please enter a valid email address");
        }

        // Phone validation (if provided)
        const phone = formData.get('phone');
        if (phone && !validationRules.phone.pattern.test(phone)) {
            errors.push("Please enter a valid phone number");
        }

        // Enquiry validation
        const enquiry = formData.get('enquiry');
        if (!enquiry || enquiry.length < validationRules.enquiry.min ||
            enquiry.length > validationRules.enquiry.max) {
            errors.push("Enquiry must be between 10 and 5000 characters");
        }

        return errors;
    }

    // Sanitize form data
    function sanitizeFormData(formData) {
        const sanitized = new FormData();
        for (let [key, value] of formData.entries()) {
            sanitized.append(key, sanitizeString(value));
        }
        return sanitized;
    }

    function sanitizeString(str) {
        if (typeof str !== 'string') return str;
        return str
            .trim()
            .replace(/[<>]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // Fetch IP address and handle form submission
    fetch("https://api64.ipify.org?format=json")
        .then(response => response.json())
        .then(data => {
            const form = document.getElementById("contactForm");
            const submitBtn = document.getElementById("submitBtn");
            const formMessage = document.getElementById("formMessage");

            form.addEventListener("submit", async function (event) {
                event.preventDefault();

                // Disable submit button and clear previous messages
                submitBtn.disabled = true;
                formMessage.style.display = "none";

                try {
                    // Create FormData and add IP
                    let formData = new FormData(this);
                    formData.append("ip", data.ip);
                    formData.append("origin", window.location.hostname);

                    // Validate form
                    const errors = validateForm(formData);
                    if (errors.length > 0) {
                        throw new Error(errors.join("\n"));
                    }

                    // Sanitize form data
                    formData = sanitizeFormData(formData);

                    // Send to Google Apps Script
                    const scriptURL = "https://script.google.com/macros/s/AKfycby79xBqYQbqpma_MgOWNtr3MnQvNp-DR1gnRdrCMZXicTkoI2h64VZ52LExU65lAt4a6A/exec";
                    const response = await fetch(scriptURL, {
                        method: "POST",
                        body: formData
                    });

                    const result = await response.json();

                    if (result.status === "success") {
                        showMessage("We have received your message, and will get back to you!", "success");
                        form.reset();
                        // Set Uganda as default after form reset
                        const ugandaOption = Array.from(countryDropdown.options).find(option =>
                            option.textContent.includes("Uganda")
                        );
                        if (ugandaOption) {
                            ugandaOption.selected = true;
                        }
                    }
                    else {
                        throw new Error(result.message || "Submission failed");
                    }
                } catch (error) {
                    showMessage(error.message || "Something went wrong. Please try again.", "error");
                } finally {
                    setTimeout(() => {
                        submitBtn.disabled = false;
                    }, 3000); // Re-enable button after 3 seconds
                }
            });
        })
        .catch(error => {
            console.error("IP fetch error:", error);
            // Still allow form submission even if IP fetch fails
        });

    // Helper function to show messages
    function showMessage(message, type = "success") {
        const formMessage = document.getElementById("formMessage");
        formMessage.style.display = "block";
        formMessage.textContent = message;
        formMessage.style.color = type === "success" ? "green" : "red";

        if (type === "success") {
            setTimeout(() => {
                formMessage.style.display = "none";
            }, 5000);
        }
    }
});
//allowing testmonials to show slidingly
document.addEventListener("DOMContentLoaded", function () {
  let currentIndex = 0;
  const testimonials = document.querySelectorAll(".testimonial");
  const dots = document.querySelectorAll(".dot");

  function showTestimonial(index) {
    testimonials.forEach((t, i) => {
      t.classList.toggle("active", i === index);
      dots[i].classList.toggle("active", i === index);
    });
  }

  function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(currentIndex);
  }

  // Auto slide every 5 seconds
  let autoSlide = setInterval(nextTestimonial, 5000);

  // Manual click on dots
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      currentIndex = i;
      showTestimonial(currentIndex);
      clearInterval(autoSlide); // Stop auto-slide if user interacts
      autoSlide = setInterval(nextTestimonial, 5000); // Restart auto-slide
    });
  });
});
//blog loading from json
document.addEventListener("DOMContentLoaded", () => {
  // Run this ONLY on blogs.html
  if (document.getElementById("blog-container")) {
    const blogContainer = document.getElementById("blog-container");

    fetch("blogs.json")
      .then(response => {
        if (!response.ok) throw new Error("Failed to load blogs");
        return response.json();
      })
      .then(blogs => {
        blogs.forEach(blog => {
          const blogPost = document.createElement("div");
          blogPost.classList.add("blog-post");

          blogPost.innerHTML = `
            <h3>${blog.title}</h3>
            <p><strong>${blog.author}</strong> | ${blog.date}</p>
            <p class="blog-preview">
              ${blog.content.substring(0, 150)}...
            </p>
            <button class="read-more">Read More</button>
            <div class="full-content" style="display:none;">
              <p>${blog.content}</p>
            </div>
          `;

          // Toggle Read More
          blogPost.querySelector(".read-more").addEventListener("click", function() {
            const fullContent = blogPost.querySelector(".full-content");
            if (fullContent.style.display === "none") {
              fullContent.style.display = "block";
              this.textContent = "Show Less";
            } else {
              fullContent.style.display = "none";
              this.textContent = "Read More";
            }
          });

          blogContainer.appendChild(blogPost);
        });
      })
      .catch(error => {
        blogContainer.innerHTML = `<p style="color:red;">Error loading blogs: ${error.message}</p>`;
      });
  }
});

