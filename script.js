const btn = document.getElementById("langToggle");
let lang = "ru";

if (btn) {
  btn.addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-ru][data-en]").forEach(el => {
      el.textContent = el.dataset[lang];
    });
  });
}

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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

let deferredInstallPrompt = null;
const installBtn = document.getElementById("installAppBtn");
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      alert(document.documentElement.lang === "en"
        ? "On iPhone: Share → Add to Home Screen."
        : "На iPhone: нажми «Поделиться» → «На экран Домой».");
    }
  });
}

// Дополнительные прошедшие концерты.
const extraPastEvents = [
  {
    date: "2026-07-15",
    dateRu: "15 ИЮЛЯ",
    dateEn: "15 JULY",
    cityRu: "Черкесск",
    cityEn: "Cherkessk",
    venueRu: "Амфитеатр «Зелёный остров»",
    venueEn: "Green Island Amphitheatre",
    timeRu: "Начало · 19:00",
    timeEn: "Starts · 19:00",
    alt: "НУРЛАН — Черкесск, 15 июля",
    image: "assets/event-2026-07-15-cherkessk.webp"
  },
  {
    date: "2026-05-28",
    dateRu: "28 МАЯ",
    dateEn: "28 MAY",
    cityRu: "Нальчик",
    cityEn: "Nalchik",
    venueRu: "Дом молодёжи",
    venueEn: "Youth House",
    timeRu: "Начало · 19:00",
    timeEn: "Starts · 19:00",
    alt: "НУРЛАН — Нальчик, 28 мая",
    image: "assets/event-2026-05-28-nalchik.webp"
  }
];

const makeEventCard = (event) => {
  const article = document.createElement("article");
  article.className = "event-card";
  article.dataset.date = event.date;
  article.innerHTML = `
    <img src="${event.image}" alt="${event.alt}" loading="lazy">
    <div class="event-info">
      <div class="event-date" data-ru="${event.dateRu}" data-en="${event.dateEn}">${lang === "en" ? event.dateEn : event.dateRu}</div>
      <h3 data-ru="${event.cityRu}" data-en="${event.cityEn}">${lang === "en" ? event.cityEn : event.cityRu}</h3>
      <p data-ru="${event.venueRu}" data-en="${event.venueEn}">${lang === "en" ? event.venueEn : event.venueRu}</p>
      <span class="event-time" data-ru="${event.timeRu}" data-en="${event.timeEn}">${lang === "en" ? event.timeEn : event.timeRu}</span>
    </div>
  `;
  return article;
};

// Афиша: будущие концерты остаются в основной сетке,
// прошедшие автоматически перемещаются в сворачиваемый архив.
(() => {
  const section = document.querySelector(".events-section");
  const grid = section?.querySelector(".events-grid");
  if (!section || !grid) return;

  extraPastEvents.forEach(event => grid.appendChild(makeEventCard(event)));

  const cards = Array.from(grid.querySelectorAll(".event-card"));
  if (!cards.length) return;

  const style = document.createElement("style");
  style.id = "dynamic-events-styles";
  style.textContent = `
    .events-subhead{margin:-18px 0 24px;font-size:11px;letter-spacing:.16em;color:var(--muted);text-transform:uppercase}
    .events-archive{margin-top:42px;padding-top:24px;border-top:1px solid var(--line)}
    .events-archive summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:18px;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
    .events-archive summary::-webkit-details-marker{display:none}
    .events-archive summary::after{content:"+";font-size:22px;font-weight:300;line-height:1;color:var(--accent)}
    .events-archive[open] summary{margin-bottom:24px}
    .events-archive[open] summary::after{content:"−"}
    .events-archive .event-card{opacity:.72}
    .events-archive .event-card:hover{opacity:1}
    @media(max-width:700px){.events-subhead{margin-top:-12px}.events-archive{margin-top:32px}}
  `;
  document.head.appendChild(style);

  const getEventDate = (card) => {
    let iso = card.dataset.date || "";
    if (!iso) {
      const src = card.querySelector("img")?.getAttribute("src") || "";
      const match = src.match(/event-(\d{4})-(\d{2})-(\d{2})-/);
      if (match) iso = `${match[1]}-${match[2]}-${match[3]}`;
    }
    if (!iso) return null;
    const date = new Date(`${iso}T23:59:59`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = [];
  const past = [];
  const unknown = [];

  cards.forEach((card) => {
    const date = getEventDate(card);
    if (!date) unknown.push({ card, date: null });
    else if (date >= today) upcoming.push({ card, date });
    else past.push({ card, date });
  });

  upcoming.sort((a, b) => a.date - b.date);
  past.sort((a, b) => b.date - a.date);

  grid.replaceChildren(...upcoming.map(item => item.card), ...unknown.map(item => item.card));

  if (upcoming.length || unknown.length) {
    const subhead = document.createElement("div");
    subhead.className = "events-subhead";
    subhead.dataset.ru = "Ближайшие концерты";
    subhead.dataset.en = "Upcoming shows";
    subhead.textContent = subhead.dataset[lang];
    grid.before(subhead);
  } else {
    grid.hidden = true;
    const empty = document.createElement("div");
    empty.className = "events-empty";
    empty.innerHTML = `
      <div class="events-date">—</div>
      <div class="events-copy">
        <h3 data-ru="Новые даты скоро" data-en="New dates coming soon">Новые даты скоро</h3>
        <p data-ru="Следите за обновлениями — ближайшие выступления появятся здесь." data-en="Stay tuned — upcoming shows will appear here.">Следите за обновлениями — ближайшие выступления появятся здесь.</p>
      </div>
    `;
    grid.before(empty);
  }

  if (past.length) {
    const archive = document.createElement("details");
    archive.className = "events-archive";

    const summary = document.createElement("summary");
    summary.dataset.ru = `Прошедшие концерты · ${past.length}`;
    summary.dataset.en = `Past shows · ${past.length}`;
    summary.textContent = summary.dataset[lang];

    const archiveGrid = document.createElement("div");
    archiveGrid.className = "events-grid";
    past.forEach(({ card }) => archiveGrid.appendChild(card));

    archive.append(summary, archiveGrid);
    section.appendChild(archive);
  }
})();

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
