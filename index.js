document.addEventListener("DOMContentLoaded", () => {
  console.log("Website Loaded Successfully!");

  /*** SMOOTH SCROLLING FOR ANCHORS ***/
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      document.querySelector('.nav-links')?.classList.remove('active');
    });
  });

  /*** MOBILE MENU TOGGLE ***/
  const menuToggle = document.querySelector(".menu-toggle");
  menuToggle?.addEventListener("click", () => {
    document.querySelector('.nav-links')?.classList.toggle('active');
  });

  /*** COUNTRY DROPDOWN WITH FLAGS ***/
  const countryDropdown = document.getElementById("countryCode");
  if (countryDropdown) {
    const countries = [
      // Africa
      { name: "Uganda", code: "+256", iso: "ug", continent: "Africa", default: true },
      { name: "Algeria", code: "+213", iso: "dz", continent: "Africa" },
      { name: "Angola", code: "+244", iso: "ao", continent: "Africa" },
      { name: "Botswana", code: "+267", iso: "bw", continent: "Africa" },
      { name: "Egypt", code: "+20", iso: "eg", continent: "Africa" },
      { name: "Ghana", code: "+233", iso: "gh", continent: "Africa" },
      { name: "Kenya", code: "+254", iso: "ke", continent: "Africa" },
      { name: "Nigeria", code: "+234", iso: "ng", continent: "Africa" },
      { name: "South Africa", code: "+27", iso: "za", continent: "Africa" },
      { name: "Tanzania", code: "+255", iso: "tz", continent: "Africa" },
      { name: "Zambia", code: "+260", iso: "zm", continent: "Africa" },
      { name: "Zimbabwe", code: "+263", iso: "zw", continent: "Africa" },
      // Asia
      { name: "China", code: "+86", iso: "cn", continent: "Asia" },
      { name: "India", code: "+91", iso: "in", continent: "Asia" },
      { name: "Indonesia", code: "+62", iso: "id", continent: "Asia" },
      { name: "Japan", code: "+81", iso: "jp", continent: "Asia" },
      { name: "Malaysia", code: "+60", iso: "my", continent: "Asia" },
      // Europe
      { name: "France", code: "+33", iso: "fr", continent: "Europe" },
      { name: "Germany", code: "+49", iso: "de", continent: "Europe" },
      { name: "Italy", code: "+39", iso: "it", continent: "Europe" },
      { name: "Spain", code: "+34", iso: "es", continent: "Europe" },
      { name: "United Kingdom", code: "+44", iso: "gb", continent: "Europe" },
      // North America
      { name: "Canada", code: "+1", iso: "ca", continent: "North America" },
      { name: "Mexico", code: "+52", iso: "mx", continent: "North America" },
      { name: "United States", code: "+1", iso: "us", continent: "North America" },
      // Oceania
      { name: "Australia", code: "+61", iso: "au", continent: "Oceania" },
      { name: "New Zealand", code: "+64", iso: "nz", continent: "Oceania" }
    ];

    const continents = {};
    countries.forEach(c => {
      if (!continents[c.continent]) continents[c.continent] = [];
      continents[c.continent].push(c);
    });

    ["Africa", "Asia", "Europe", "North America", "Oceania"].forEach(continent => {
      if (!continents[continent]) return;
      const group = document.createElement("optgroup");
      group.label = continent;
      continents[continent].sort((a, b) => a.name.localeCompare(b.name))
        .forEach(country => {
          const option = document.createElement("option");
          option.value = country.code;
          option.innerHTML = `<span class="fi fi-${country.iso}"></span> ${country.name} (${country.code})`;
          if (country.default) option.selected = true;
          group.appendChild(option);
        });
      countryDropdown.appendChild(group);
    });

    const otherOption = document.createElement("option");
    otherOption.value = "Other";
    otherOption.textContent = "Other (Enter manually)";
    countryDropdown.appendChild(otherOption);
  }

  /*** CONTACT FORM HANDLING ***/
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    fetch("https://api64.ipify.org?format=json")
      .then(resp => resp.json())
      .then(data => {
        contactForm.addEventListener("submit", async e => {
          e.preventDefault();
          const submitBtn = document.getElementById("submitBtn");
          const formMessage = document.getElementById("formMessage");
          submitBtn.disabled = true;
          formMessage.style.display = "none";

          try {
            let formData = new FormData(contactForm);
            formData.append("ip", data.ip);
            formData.append("origin", window.location.hostname);

            // Basic validation
            if (!formData.get("name") || formData.get("name").length < 2) throw new Error("Enter a valid name");
            if (!formData.get("email") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get("email"))) throw new Error("Invalid email");
            if (!formData.get("enquiry") || formData.get("enquiry").length < 10) throw new Error("Enquiry too short");

            const response = await fetch("https://script.google.com/macros/s/AKfycby79xBqYQbqpma_MgOWNtr3MnQvNp-DR1gnRdrCMZXicTkoI2h64VZ52LExU65lAt4a6A/exec", {
              method: "POST",
              body: formData
            });
            const result = await response.json();
            if (result.status === "success") {
              showMessage("We have received your message!", "success");
              contactForm.reset();
              // Reset country to Uganda
              const ugandaOption = Array.from(countryDropdown.options).find(o => o.textContent.includes("Uganda"));
              if (ugandaOption) ugandaOption.selected = true;
            } else throw new Error(result.message || "Submission failed");
          } catch (err) {
            showMessage(err.message, "error");
          } finally {
            setTimeout(() => { submitBtn.disabled = false; }, 2000);
          }

          function showMessage(msg, type = "success") {
            formMessage.style.display = "block";
            formMessage.style.color = type === "success" ? "green" : "red";
            formMessage.textContent = msg;
            if (type === "success") setTimeout(() => { formMessage.style.display = "none"; }, 5000);
          }
        });
      }).catch(err => console.error("IP fetch error:", err));
  }

  /*** DYNAMIC BLOGS ***/
  const blogContainer = document.getElementById("blog-container");
  if (blogContainer) {
    fetch(`blogs.json?v=${Date.now()}`)
      .then(resp => resp.json())
      .then(blogs => {
        if (!blogs || blogs.length === 0) {
          blogContainer.innerHTML = "<p>No blogs available at the moment.</p>";
          return;
        }
        blogs.forEach(blog => {
          const post = document.createElement("div");
          post.classList.add("blog-post");
          post.innerHTML = `
            <h3>${blog.title}</h3>
            <p><strong>${blog.author || "Admin"}</strong> | ${blog.date || "No Date"}</p>
            <p class="blog-preview">${blog.content.substring(0, 150)}...</p>
            <button class="read-more-btn">Read More</button>
            <div class="full-content" style="display:none;"><p>${blog.content}</p></div>
          `;
          const btn = post.querySelector(".read-more-btn");
          const fullContent = post.querySelector(".full-content");
          btn.addEventListener("click", () => {
            const visible = fullContent.style.display === "block";
            fullContent.style.display = visible ? "none" : "block";
            btn.textContent = visible ? "Read More" : "Read Less";
          });
          blogContainer.appendChild(post);
        });
      })
      .catch(err => blogContainer.innerHTML = `<p style="color:red;">Error loading blogs: ${err.message}</p>`);
  }
});
