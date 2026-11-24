/* TalkCX: Google Analytics 4 with a cookie consent banner.
 *
 * Nothing is sent to Google and no analytics cookie is set until the visitor
 * presses "Accept". The choice is kept in localStorage for 6 months.
 * "Cookie settings" (any element with data-cookie-settings) reopens the banner.
 *
 * Google Consent Mode v2 defaults are set to denied before gtag.js loads,
 * and gtag.js itself only loads after consent.
 */
(function () {
  var GA_ID = "G-LZCZ2Z171B"; // TalkCX GA4 Measurement ID
  var KEY = "talkcx-cookie-consent";
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182; // about 6 months
  var loaded = false;

  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && v.t && Date.now() - v.t < MAX_AGE) return v.choice;
    } catch (e) {}
    return null;
  }
  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, t: Date.now() })); } catch (e) {}
  }

  function load() {
    if (loaded) return;
    loaded = true;
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function clearGaCookies() {
    var host = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name === "_ga" || name.indexOf("_ga_") === 0 || name === "_gid") {
        ["", "; domain=." + host, "; domain=" + host].forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }

  function css() {
    if (document.getElementById("tcx-cc-css")) return;
    var st = document.createElement("style");
    st.id = "tcx-cc-css";
    st.textContent =
      "#tcx-cc{position:fixed;left:16px;bottom:16px;z-index:2147483000;max-width:380px;" +
      "background:#0c1830;color:#eef3fc;border:1px solid rgba(245,39,137,.35);border-radius:14px;" +
      "padding:18px 18px 16px;box-shadow:0 12px 40px rgba(0,0,0,.45);" +
      "font:14px/1.5 Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}" +
      "#tcx-cc p{margin:0 0 12px;color:#b7c4e0}" +
      "#tcx-cc a{color:#1685f8}" +
      "#tcx-cc .tcx-cc-btns{display:flex;gap:8px;flex-wrap:wrap}" +
      "#tcx-cc button{cursor:pointer;border-radius:999px;padding:8px 18px;font:600 14px Inter,sans-serif;border:1px solid #b7c4e0;background:transparent;color:#eef3fc}" +
      "#tcx-cc button.tcx-cc-yes{background:#f52789;border-color:#f52789;color:#fff}" +
      "@media(max-width:480px){#tcx-cc{left:8px;right:8px;bottom:8px;max-width:none}}";
    document.head.appendChild(st);
  }

  function privacyHref() {
    var depth = location.pathname.replace(/^\//, "").split("/").length - 1;
    return (depth > 0 ? new Array(depth + 1).join("../") : "") + "privacy.html#cookies";
  }

  function banner() {
    if (document.getElementById("tcx-cc")) return;
    css();
    var box = document.createElement("div");
    box.id = "tcx-cc";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Cookie consent");
    box.innerHTML =
      "<p>We'd like to use Google Analytics cookies to see how visitors use this site. " +
      "They're only set if you accept. <a href=\"" + privacyHref() + "\">Privacy policy</a></p>" +
      "<div class=\"tcx-cc-btns\"><button type=\"button\" class=\"tcx-cc-yes\">Accept</button>" +
      "<button type=\"button\" class=\"tcx-cc-no\">Reject</button></div>";
    document.body.appendChild(box);
    box.querySelector(".tcx-cc-yes").addEventListener("click", function () {
      save("granted"); box.remove(); load();
    });
    box.querySelector(".tcx-cc-no").addEventListener("click", function () {
      var wasOn = loaded;
      save("denied"); box.remove();
      if (wasOn) {
        gtag("consent", "update", { analytics_storage: "denied" });
        clearGaCookies();
      }
    });
  }

  var choice = read();
  if (choice === "granted") load();

  function ready() {
    if (!choice) banner();
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-cookie-settings]");
      if (t) { e.preventDefault(); banner(); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
