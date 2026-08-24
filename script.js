const btn = document.getElementById("langToggle");
let lang = "ru";
btn.addEventListener("click", () => {
  lang = lang === "ru" ? "en" : "ru";
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-ru][data-en]").forEach(el => {
    el.textContent = el.dataset[lang];
  });
});
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileDrawer = document.getElementById("mobileDrawer");

if (mobileMenuBtn && mobileDrawer) {
  mobileMenuBtn.addEventListener("click", () => {
    const open = mobileDrawer.classList.toggle("open");
    mobileMenuBtn.textContent = open ? "CLOSE" : "MENU";
    document.body.classList.toggle("menu-open", open);
  });

  mobileDrawer.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileDrawer.classList.remove("open");
      mobileMenuBtn.textContent = "MENU";
      document.body.classList.remove("menu-open");
    });
  });
}

if("serviceWorker"in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));}let deferredInstallPrompt=null;const installBtn=document.getElementById("installAppBtn");window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;});if(installBtn){installBtn.addEventListener("click",async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;}else{alert(document.documentElement.lang==="en"?"On iPhone: Share → Add to Home Screen.":"На iPhone: нажми «Поделиться» → «На экран Домой».");}});}

// Google Analytics 4 — meaningful outbound actions
(() => {
  const send = (name, params = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.href || "";
    const label = (link.getAttribute("aria-label") || link.textContent || link.title || "")
      .trim().replace(/\s+/g, " ").slice(0, 100);

    if (href.includes("music.yandex.ru")) {
      send("music_click", { platform: "yandex_music", link_text: label, link_url: href });
    } else if (href.includes("music.apple.com")) {
      send("music_click", { platform: "apple_music", link_text: label, link_url: href });
    } else if (href.includes("open.spotify.com")) {
      send("music_click", { platform: "spotify", link_text: label, link_url: href });
    } else if (href.includes("vk.ru/artist")) {
      send("music_click", { platform: "vk_music", link_text: label, link_url: href });
    } else if (href.includes("t.me/")) {
      send("social_click", { platform: "telegram", link_text: label, link_url: href });
    } else if (href.includes("instagram.com")) {
      send("social_click", { platform: "instagram", link_text: label, link_url: href });
    } else if (href.startsWith("tel:")) {
      send("contact_click", { method: "phone", link_text: label });
    } else if (href.includes("#events")) {
      send("events_click", { link_text: label });
    }
  });

  const installButton = document.getElementById("installAppBtn");
  if (installButton) {
    installButton.addEventListener("click", () => send("app_install_click"));
  }
})();
