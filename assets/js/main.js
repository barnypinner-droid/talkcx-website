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

// Prefill the contact form when arriving from a pricing "Choose" button
(() => {
  const pkg = new URLSearchParams(window.location.search).get("package");
  const msg = document.querySelector("#contact-form textarea[name='message']");
  if (pkg && msg && !msg.value) {
    msg.value = "I'm interested in the " + pkg.slice(0, 60) + " package for my business.";
  }
})();

// Pricing: token plan pickers and voice/digital sliders
document.querySelectorAll(".token-calc").forEach((calc) => {
  const key = calc.id.replace("calc-", "");
  const btns = document.querySelectorAll('[data-calc-for="' + key + '"]');
  const q = (c) => calc.querySelector(c);
  const mix = q(".c-mix");
  const fmt = (n) => Math.round(n).toLocaleString("en-GB");
  const start = Array.from(btns).find((b) => b.classList.contains("active")) || btns[0];
  let tokens = Number(start.dataset.tokens);
  function render() {
    const v = Number(mix.value);
    const voiceT = tokens * v / 100, digT = tokens - voiceT;
    q(".c-voice").textContent = fmt(voiceT / 2);
    q(".c-digital").textContent = fmt(digT);
    q(".c-voice-t").textContent = fmt(voiceT) + " tokens";
    q(".c-digital-t").textContent = fmt(digT) + " tokens";
    q(".c-mix-label").textContent = v === 100 ? "all voice" : v === 0 ? "all digital" : v + "% voice, " + (100 - v) + "% digital";
    q(".c-bar").style.width = v + "%";
  }
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
    b.classList.add("active"); b.setAttribute("aria-pressed", "true");
    tokens = Number(b.dataset.tokens);
    q(".c-plan").textContent = b.dataset.name;
    q(".c-tokens").textContent = fmt(tokens);
    q(".c-price").textContent = "£" + fmt(Number(b.dataset.price));
    render();
  }));
  mix.addEventListener("input", render);
  render();
});
