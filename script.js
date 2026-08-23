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
