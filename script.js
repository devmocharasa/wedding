/* ========================================================================
   Konfigurasi — ganti nilai di sini sesuai acara Anda
   ======================================================================== */
const CONFIG = {
  weddingDate: "2026-12-13T08:00:00",
  coupleName: "Aziz & Echa",
  event: {
    title: "Pernikahan Aziz & Echa",
    location: "Kp. Pasirandu Kamel RT 06 RW 03 Desa Sukasari Kec. Serang Baru Kab. Bekasi",
    start: "20261213T080000",
    end: "20261213T140000",
    details: "Dengan bahagia kami mengundang Anda ke acara pernikahan kami.",
  },
  gallery: [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80",
  ],
};

/* ========================================================================
   Helper
   ======================================================================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

/* Terapkan delay dari atribut data-delay ke CSS custom property */
function applyDelays(scope = document) {
  scope.querySelectorAll("[data-delay]").forEach((el) => {
    el.style.setProperty("--fx-delay", el.dataset.delay + "ms");
  });
}

/* ========================================================================
   1. Nama tamu dari URL (?to=Nama+Tamu)
   ======================================================================== */
function setGuestName() {
  // Contoh: index.html?to=Budi+Santoso  atau  ?kepada=Keluarga%20Besar%20Hendra
  const params = new URLSearchParams(window.location.search);
  const raw =
    params.get("to") || params.get("kepada") || params.get("untuk") || params.get("nama");
  if (!raw) return;

  // URLSearchParams sudah men-decode %20 dan "+"; rapikan spasi & batasi panjang.
  const name = raw.replace(/\s+/g, " ").trim().slice(0, 60);
  if (!name) return;

  // textContent aman dari injeksi HTML
  $("#guestName").textContent = name;
  document.title = "Undangan untuk " + name + " — " + CONFIG.coupleName;

  // Isi otomatis kolom nama di RSVP dan ucapan
  const rsvpName = $("#rsvpName");
  const wishName = $("#wishName");
  if (rsvpName) rsvpName.value = name;
  if (wishName) wishName.value = name;
}

/* ========================================================================
   2. Animasi huruf per-karakter untuk .fx-letters
   ======================================================================== */
function splitLetters() {
  $$(".fx-letters").forEach((el) => {
    const text = el.textContent;
    const baseDelay = parseInt(el.dataset.delay || "0", 10);
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.animationDelay = baseDelay + i * 70 + "ms";
      el.appendChild(span);
    });
  });
}

/* Munculkan elemen cover secara bertahap */
function revealCover() {
  $$(".cover .fx-fade, .cover .fx-letters").forEach((el) => el.classList.add("is-shown"));
}

/* ========================================================================
   3. Buka undangan
   ======================================================================== */
function initOpenInvitation() {
  document.body.classList.add("locked");
  revealCover();

  $("#openInvitation").addEventListener("click", () => {
    $("#cover").classList.add("is-open");
    $("#mainContent").classList.add("is-visible");
    document.body.classList.remove("locked");
    $("#musicToggle").classList.add("is-visible");
    $("#navbar").classList.add("is-visible");

    // Mulai animasi tirai terbuka + merpati di section Salam
    $("#salam").classList.add("is-opening");

    tryPlayMusic();

    // reveal section yang langsung terlihat + mulai pantau scroll
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      revealOnScroll();
      updateActiveNav();
    }, 120);
  });
}

/* ========================================================================
   4. Musik latar (degung Sunda)
   ======================================================================== */
function initMusic() {
  const audio = $("#bgMusic");
  const toggle = $("#musicToggle");

  toggle.addEventListener("click", () => {
    if (!audio.currentSrc) {
      showToast("Tambahkan file musik di index.html terlebih dahulu.");
      return;
    }
    if (audio.paused) {
      audio.play().then(() => toggle.classList.add("is-playing")).catch(() => {});
    } else {
      audio.pause();
      toggle.classList.remove("is-playing");
    }
  });
}

function tryPlayMusic() {
  const audio = $("#bgMusic");
  if (!audio.currentSrc) return;
  audio
    .play()
    .then(() => $("#musicToggle").classList.add("is-playing"))
    .catch(() => {
      /* Autoplay diblokir browser — tamu tiasa klik tombol musik */
    });
}

/* ========================================================================
   5. Countdown
   ======================================================================== */
function initCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();

  function tick() {
    let diff = target - Date.now();
    if (diff <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach((id) => ($("#" + id).textContent = "0"));
      clearInterval(initCountdown._t);
      return;
    }
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
    const seconds = Math.floor(diff / 1000);

    $("#days").textContent = days;
    $("#hours").textContent = String(hours).padStart(2, "0");
    $("#minutes").textContent = String(minutes).padStart(2, "0");
    $("#seconds").textContent = String(seconds).padStart(2, "0");
  }

  tick();
  initCountdown._t = setInterval(tick, 1000);
}

/* ========================================================================
   6. Simpan tanggal (Google Calendar)
   ======================================================================== */
function initSaveDate() {
  $("#saveDate").addEventListener("click", (e) => {
    e.preventDefault();
    const { title, location, start, end, details } = CONFIG.event;
    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(title) +
      "&dates=" + start + "/" + end +
      "&location=" + encodeURIComponent(location) +
      "&details=" + encodeURIComponent(details);
    window.open(url, "_blank", "noopener");
  });
}

/* ========================================================================
   7. Galeri
   ======================================================================== */
function initGallery() {
  const grid = $("#galleryGrid");
  const fragment = document.createDocumentFragment();
  CONFIG.gallery.forEach((src, i) => {
    const item = document.createElement("div");
    item.className = "gallery__item fx-up";
    item.dataset.delay = i * 80;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Foto galeri " + (i + 1);
    img.loading = "lazy";
    item.appendChild(img);
    fragment.appendChild(item);
  });
  grid.appendChild(fragment);
  applyDelays(grid);
}

/* ========================================================================
   8. Reveal saat scroll (section + elemen fx)
   ======================================================================== */
function revealOnScroll() {
  const triggerPoint = window.innerHeight * 0.85;
  $$(".reveal").forEach((el) => {
    if (el.getBoundingClientRect().top < triggerPoint) {
      el.classList.add("is-shown");
    }
  });
}

/* ========================================================================
   9. Bottom nav — smooth scroll + penanda section aktif
   ======================================================================== */
function initNavbar() {
  const items = $$(".navbar__item");

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(item.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function updateActiveNav() {
  const items = $$(".navbar__item");
  const mid = window.innerHeight / 2;
  let current = null;

  items.forEach((item) => {
    const sec = document.getElementById(item.dataset.target);
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    if (rect.top <= mid && rect.bottom >= mid) {
      current = item.dataset.target;
    }
  });

  items.forEach((item) =>
    item.classList.toggle("is-active", item.dataset.target === current)
  );
}

/* ========================================================================
   10. RSVP
   ======================================================================== */
function initRsvp() {
  $("#rsvpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const attend = form.attend.value;
    if (!name || !attend) {
      showToast("Mohon lengkapi nama dan kehadiran.");
      return;
    }
    const data = { name, attend, count: form.count.value, at: new Date().toISOString() };
    const list = JSON.parse(localStorage.getItem("rsvp") || "[]");
    list.push(data);
    localStorage.setItem("rsvp", JSON.stringify(list));
    form.reset();
    showToast(
      attend === "hadir"
        ? "Terima kasih, sampai jumpa di hari bahagia kami!"
        : "Terima kasih atas konfirmasinya."
    );
  });
}

/* ========================================================================
   11. Ucapan & Du'a
   ======================================================================== */
function initWishes() {
  const form = $("#wishForm");
  const listEl = $("#wishList");

  function render() {
    const wishes = JSON.parse(localStorage.getItem("wishes") || "[]");
    listEl.innerHTML = "";
    wishes.slice().reverse().forEach((w) => {
      const li = document.createElement("li");
      const time = new Date(w.at).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const nameEl = document.createElement("span");
      nameEl.className = "wishes__name";
      nameEl.textContent = w.name;
      const timeEl = document.createElement("span");
      timeEl.className = "wishes__time";
      timeEl.textContent = time;
      const msgEl = document.createElement("p");
      msgEl.className = "wishes__msg";
      msgEl.textContent = w.message;
      li.append(nameEl, timeEl, msgEl);
      listEl.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const message = form.message.value.trim();
    if (!name || !message) {
      showToast("Mohon lengkapi nama dan pesan.");
      return;
    }
    const wishes = JSON.parse(localStorage.getItem("wishes") || "[]");
    wishes.push({ name, message, at: new Date().toISOString() });
    localStorage.setItem("wishes", JSON.stringify(wishes));
    form.reset();
    render();
    showToast("Terima kasih atas ucapan dan doanya!");
  });

  render();
}

/* ========================================================================
   Init
   ======================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.title = "Undangan Pernikahan — " + CONFIG.coupleName;

  applyDelays();
  splitLetters();
  setGuestName();
  initOpenInvitation();
  initMusic();
  initCountdown();
  initSaveDate();
  initGallery();
  initNavbar();
  initRsvp();
  initWishes();

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        revealOnScroll();
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
});
