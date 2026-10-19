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

// Contact form -> mailto fallback (static site, no backend)
const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.querySelector("#name").value.trim();
    const email = contactForm.querySelector("#email").value.trim();
    const company = contactForm.querySelector("#company").value.trim();
    const message = contactForm.querySelector("#message").value.trim();

    const subject = encodeURIComponent(`Enquiry from ${name || "website visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`
    );
    window.location.href = `mailto:hello@talkcx.co.uk?subject=${subject}&body=${body}`;
  });
}
