document.addEventListener("DOMContentLoaded", () => {
  const galleryMain = document.querySelector(".gallery-main");
  if (!galleryMain) return; // Stop script if not on gallery.html
  console.log("Gallery page detected ✅");

  const filterBtns = galleryMain.querySelectorAll(".filter-btn");
  const galleryCards = galleryMain.querySelectorAll(".gallery-card");
  const modal = galleryMain.querySelector("#modal");
  const modalCarousel = galleryMain.querySelector(".modal-carousel");
  const caption = galleryMain.querySelector("#caption");
  const closeBtn = galleryMain.querySelector(".close");
  const factEl = galleryMain.querySelector("#fact");

  let currentIndex = 0;
  let mediaList = [];

  /* ========== FILTERING ========== */
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      galleryCards.forEach(card => {
        if (filter === "all" || card.classList.contains(filter)) {
          card.style.display = "block";
          card.classList.add("fade-in");
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  /* ========== OPEN MODAL ========== */
  galleryCards.forEach(card => {
    card.addEventListener("click", () => {
      const media = JSON.parse(card.dataset.media);
      const title = card.querySelector("h3").textContent;
      showModal(media, title);
    });
  });

  function showModal(media, title) {
    mediaList = media;
    currentIndex = 0;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    loadMedia(currentIndex);
    caption.textContent = title;
  }

  function loadMedia(index) {
    modalCarousel.innerHTML = "";
    const item = mediaList[index];
    let element;

    if (item.endsWith(".mp4")) {
      element = document.createElement("video");
      element.src = item;
      element.controls = true;
      element.autoplay = true;
    } else {
      element = document.createElement("img");
      element.src = item;
      element.alt = "Gallery media";
    }

    element.classList.add("fade-in");
    modalCarousel.appendChild(element);

    // Navigation buttons if more than one item
    if (mediaList.length > 1) {
      const prevBtn = document.createElement("span");
      prevBtn.className = "nav-btn prev";
      prevBtn.innerHTML = "&#10094;";
      const nextBtn = document.createElement("span");
      nextBtn.className = "nav-btn next";
      nextBtn.innerHTML = "&#10095;";
      modalCarousel.appendChild(prevBtn);
      modalCarousel.appendChild(nextBtn);

      prevBtn.addEventListener("click", () => navigate(-1));
      nextBtn.addEventListener("click", () => navigate(1));
    }
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + mediaList.length) % mediaList.length;
    loadMedia(currentIndex);
  }

  /* ========== CLOSE MODAL ========== */
  closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    modalCarousel.innerHTML = "";
  }

  /* ========== FACTS ROTATOR ========== */
  const facts = [
    "Over 90% of world trade moves by sea.",
    "A 40ft container can carry over 8,000 pairs of shoes.",
    "Reefer containers maintain precise cold-chain temperatures.",
    "Tank containers can transport up to 26,000 liters of liquid.",
    "The modern shipping container revolutionized logistics in 1956."
  ];

  let factIndex = 0;
  function rotateFacts() {
    factEl.textContent = facts[factIndex];
    factIndex = (factIndex + 1) % facts.length;
  }
  rotateFacts();
  setInterval(rotateFacts, 7000);

  /* ========== ADD LOCAL STYLE FOR ANIMATIONS ========== */
  const style = document.createElement("style");
  style.textContent = `
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .nav-btn {
      cursor: pointer;
      position: absolute;
      top: 50%;
      font-size: 2rem;
      padding: 0 10px;
      color: white;
      user-select: none;
      transform: translateY(-50%);
    }
    .nav-btn:hover { color: #ffc107; }
    .prev { left: 10%; }
    .next { right: 10%; }
  `;
  document.head.appendChild(style);

});
