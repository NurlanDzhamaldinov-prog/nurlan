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

// Editorial portal interactions
const portalHeader = document.querySelector(".topbar");
const portalScrollState = () => {
  if (portalHeader) portalHeader.classList.toggle("scrolled", window.scrollY > 24);
};
portalScrollState();
window.addEventListener("scroll", portalScrollState, {passive:true});

const revealTargets = document.querySelectorAll(
  ".release-card,.event-card,.media-card,.news-card,.timeline-item,.install-card"
);
revealTargets.forEach(el => el.classList.add("reveal"));
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.08});
  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add("in-view"));
}
