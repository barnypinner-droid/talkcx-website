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

// Pricing: token plan picker and voice/digital slider
(() => {
  const calc = document.querySelector("#token-calc");
  if (!calc) return;
  const cards = document.querySelectorAll(".plan-card");
  const mix = document.querySelector("#mix");
  const fmt = (n) => Math.round(n).toLocaleString("en-GB");
  let tokens = 75000;
  const $ = (id) => document.getElementById(id);
  function render() {
    const v = Number(mix.value);
    const voiceT = tokens * v / 100;
    const digT = tokens - voiceT;
    $("out-voice").textContent = fmt(voiceT / 2);
    $("out-digital").textContent = fmt(digT);
    $("out-voice-t").textContent = fmt(voiceT) + " tokens";
    $("out-digital-t").textContent = fmt(digT) + " tokens";
    $("mix-label").textContent = v === 100 ? "all voice" : v === 0 ? "all digital" : v + "% voice, " + (100 - v) + "% digital";
    $("bar-voice").style.width = v + "%";
  }
  cards.forEach((c) => c.addEventListener("click", () => {
    cards.forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
    c.classList.add("active"); c.setAttribute("aria-pressed", "true");
    tokens = Number(c.dataset.tokens);
    $("calc-plan").textContent = c.dataset.name;
    $("calc-tokens").textContent = fmt(tokens);
    $("calc-price").textContent = "£" + fmt(Number(c.dataset.price));
    render();
  }));
  mix.addEventListener("input", render);
  render();
})();
