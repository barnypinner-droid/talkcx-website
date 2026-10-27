// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    primaryNav.classList.toggle("open");
    const expanded = primaryNav.classList.contains("open");
    navToggle.setAttribute("aria-expanded", String(expanded));
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => primaryNav.classList.remove("open"));
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

// Contact form -> Formspree (static site, no backend of our own)
const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const note = contactForm.querySelector(".form-note");
  const noteDefault = note ? note.textContent : "";
  const successEl = document.querySelector("#contact-success");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    if (note) {
      note.textContent = noteDefault;
      note.style.color = "";
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form submission failed");

      contactForm.hidden = true;
      if (successEl) successEl.hidden = false;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
      if (note) {
        note.textContent =
          "Something went wrong sending that. Please email us directly at info@talkcx.co.uk instead.";
        note.style.color = "var(--neon-pink)";
      }
    }
  });
}
