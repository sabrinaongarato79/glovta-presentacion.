const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`GLOVTA: no se pudo leer ${key}; se usa un valor seguro.`, error);
    return fallback;
  }
}

const jobs = [
  { title: "Business Analyst", company: "Empresa demo", location: "Remoto · LATAM", match: 84, tags: ["Análisis", "SQL", "Inglés"] },
  { title: "Data Analyst Jr.", company: "Compañía demo", location: "Híbrido", match: 81, tags: ["Excel", "SQL", "Power BI"] },
  { title: "QA / UAT Analyst", company: "Proyecto demo", location: "Remoto", match: 76, tags: ["Testing", "UAT", "Documentación"] },
  { title: "Customer Success SaaS", company: "Empresa demo", location: "Remoto", match: 72, tags: ["SaaS", "Comunicación", "Inglés"] },
  { title: "Implementation Specialist", company: "Compañía demo", location: "Remoto", match: 69, tags: ["Onboarding", "Procesos", "SQL"] }
];

const products = [
  { id: "sql", title: "SQL práctico para empezar en tecnología", price: 24900, art: "SQL", desc: "Consultas, filtros, joins y casos de uso aplicados al trabajo." },
  { id: "excel", title: "Excel para el trabajo", price: 21900, art: "XL", desc: "Herramientas prácticas para análisis, reportes y operación." },
  { id: "remote", title: "Guía para conseguir tu primer trabajo remoto", price: 9900, art: "PDF", desc: "Ebook GLOVTA con estrategia, perfil y búsqueda organizada." },
  { id: "cv", title: "Tu CV preparado para la era de la IA", price: 0, art: "CV", desc: "Recurso gratuito para mejorar claridad y palabras clave." }
];

const money = value => value === 0 ? "Gratis" : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

function renderJobs(list = jobs) {
  const grid = $("#opportunityGrid");
  grid.innerHTML = list.map(job => `
    <article class="job-card">
      <div class="job-card-top">
        <div><h3>${escapeHtml(job.title)}</h3><small>${escapeHtml(job.company)} · ${escapeHtml(job.location)}</small></div>
        <span class="match">${job.match}% match</span>
      </div>
      <p>Ejemplo demostrativo para visualizar cómo GLOVTA presenta oportunidades y explica coincidencias.</p>
      <div class="job-meta">${job.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
    </article>
  `).join("");
}

function renderCourses() {
  const grid = $("#courseGrid");
  grid.innerHTML = products.map(p => `
    <article class="course-card">
      <div class="course-art" aria-hidden="true">${p.art}</div>
      <div>
        <p class="mini-label">PRODUCTO GLOVTA</p>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.desc)}</p>
        <div class="price">
          <strong>${money(p.price)}</strong>
          <button type="button" class="btn ${p.price === 0 ? "btn-outline-dark" : "btn-primary"}" data-add="${p.id}">${p.price === 0 ? "Obtener" : "Agregar al carrito"}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value = "") {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function loadCart() {
  return readJSON("glovta-cart", []);
}
function saveCart(cart) {
  localStorage.setItem("glovta-cart", JSON.stringify(cart));
  renderCart();
}
function renderCart() {
  const cart = loadCart();
  $("#cartCount").textContent = cart.length;
  const items = $("#cartItems");
  if (!cart.length) {
    items.innerHTML = `<p class="legal-note">Todavía no agregaste productos.</p>`;
  } else {
    items.innerHTML = cart.map(id => {
      const p = products.find(x => x.id === id);
      if (!p) return "";
      return `<div class="cart-item"><div><strong>${escapeHtml(p.title)}</strong><small>${money(p.price)}</small></div><button class="tool-btn" type="button" data-remove="${p.id}" aria-label="Quitar ${escapeHtml(p.title)}">×</button></div>`;
    }).join("");
  }
  const total = cart.reduce((acc,id) => acc + (products.find(x => x.id === id)?.price || 0), 0);
  $("#cartTotal").textContent = money(total);
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  if (add) {
    const cart = loadCart();
    if (!cart.includes(add.dataset.add)) cart.push(add.dataset.add);
    saveCart(cart);
    $("#cart").classList.add("open");
    $("#cart").setAttribute("aria-hidden","false");
  }
  const remove = event.target.closest("[data-remove]");
  if (remove) saveCart(loadCart().filter(id => id !== remove.dataset.remove));
  const opener = event.target.closest("[data-open]");
  if (opener) document.getElementById(opener.dataset.open)?.showModal();
});

$("#openCart").addEventListener("click", () => {
  $("#cart").classList.add("open");
  $("#cart").setAttribute("aria-hidden","false");
});
$("#closeCart").addEventListener("click", () => {
  $("#cart").classList.remove("open");
  $("#cart").setAttribute("aria-hidden","true");
});
$("#checkoutDemo").addEventListener("click", () => alert("Checkout demo. La versión comercial se conecta al backend, valida precios desde base de datos y crea la preferencia de pago en servidor."));

$("#jobSearchForm").addEventListener("submit", event => {
  event.preventDefault();
  const query = $("#jobQuery").value.trim().toLowerCase();
  const filtered = query ? jobs.filter(job => [job.title, job.company, job.location, ...job.tags].join(" ").toLowerCase().includes(query)) : jobs;
  renderJobs(filtered.length ? filtered : jobs);
  $("#searchStatus").textContent = filtered.length ? `${filtered.length} resultados demo.` : "No hubo coincidencias demo. Se muestran ejemplos generales.";
});

$("#contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const leads = readJSON("glovta-leads", []);
  leads.push({ ...data, createdAt: new Date().toISOString(), status: "nuevo" });
  localStorage.setItem("glovta-leads", JSON.stringify(leads));
  $("#contactStatus").textContent = "Consulta guardada en este navegador (modo demo).";
  event.currentTarget.reset();
});

$("#premiumDemo").addEventListener("click", () => $("#premiumDialog").showModal());

let fontScale = Number(localStorage.getItem("glovta-font-scale") || 1);
function applyFontScale() {
  document.documentElement.style.setProperty("--font-scale", fontScale.toFixed(2));
  localStorage.setItem("glovta-font-scale", String(fontScale));
}
$("#fontDown").addEventListener("click", () => { fontScale = Math.max(.9, fontScale - .05); applyFontScale(); });
$("#fontReset").addEventListener("click", () => { fontScale = 1; applyFontScale(); });
$("#fontUp").addEventListener("click", () => { fontScale = Math.min(1.25, fontScale + .05); applyFontScale(); });
applyFontScale();

const contrastToggle = $("#contrastToggle");
if (localStorage.getItem("glovta-high-contrast") === "1") document.body.classList.add("high-contrast");
contrastToggle.setAttribute("aria-pressed", document.body.classList.contains("high-contrast"));
contrastToggle.addEventListener("click", () => {
  const on = document.body.classList.toggle("high-contrast");
  contrastToggle.setAttribute("aria-pressed", String(on));
  localStorage.setItem("glovta-high-contrast", on ? "1" : "0");
});

const mobileMenu = $("#mobileMenu");
mobileMenu.addEventListener("click", () => {
  const open = $("#mainNav").classList.toggle("open");
  mobileMenu.setAttribute("aria-expanded", String(open));
});

const passportDialog = $("#passportDialog");
$("#closePassport").addEventListener("click", () => passportDialog.close());
let step = 1;
function updateStep() {
  $$(".passport-step", passportDialog).forEach(el => el.hidden = Number(el.dataset.step) !== step);
  $$(".step-indicator span", passportDialog).forEach((el, index) => el.classList.toggle("on", index + 1 <= step));
  $("#prevStep").hidden = step === 1;
  $("#nextStep").hidden = step === 3;
  $("#savePassport").hidden = step !== 3;
}
$("#nextStep").addEventListener("click", () => { step = Math.min(3, step + 1); updateStep(); });
$("#prevStep").addEventListener("click", () => { step = Math.max(1, step - 1); updateStep(); });
$("#passportForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  localStorage.setItem("glovta-passport", JSON.stringify(data));
  $("#passportStatus").textContent = "Career Passport demo guardado en este navegador.";
  setTimeout(() => passportDialog.close(), 650);
});
passportDialog.addEventListener("close", () => { step = 1; updateStep(); });
updateStep();

renderJobs();
renderCourses();
renderCart();


// Agenda GLOVTA (demo local)
let calendarCursor = new Date();
calendarCursor.setDate(1);

function getAppointments() {
  return readJSON("glovta-appointments", []);
}

function saveAppointments(items) {
  localStorage.setItem("glovta-appointments", JSON.stringify(items));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function renderCalendar() {
  const title = $("#calendarTitle");
  const grid = $("#calendarGrid");
  if (!title || !grid) return;

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const monthName = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(calendarCursor);
  title.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = getAppointments();
  const selected = $("#appointmentDate")?.value || "";
  const cells = [];

  for (let i = 0; i < 42; i++) {
    let day, cellMonth = month, cellYear = year, other = false;

    if (i < startOffset) {
      day = daysPrevMonth - startOffset + i + 1;
      cellMonth = month - 1;
      other = true;
    } else if (i >= startOffset + daysInMonth) {
      day = i - (startOffset + daysInMonth) + 1;
      cellMonth = month + 1;
      other = true;
    } else {
      day = i - startOffset + 1;
    }

    if (cellMonth < 0) { cellMonth = 11; cellYear--; }
    if (cellMonth > 11) { cellMonth = 0; cellYear++; }

    const date = new Date(cellYear, cellMonth, day);
    date.setHours(0, 0, 0, 0);
    const iso = toISODate(cellYear, cellMonth, day);
    const past = date < today;
    const hasBooking = appointments.some(a => a.date === iso);

    cells.push(
      `<button type="button" class="calendar-day${other ? " is-other" : ""}${past ? " is-past" : ""}${selected === iso ? " is-selected" : ""}${hasBooking ? " has-booking" : ""}" data-date="${iso}" ${past ? "disabled" : ""} aria-label="${iso}">${day}</button>`
    );
  }

  grid.innerHTML = cells.join("");
}

$("#prevMonth")?.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  renderCalendar();
});

$("#nextMonth")?.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  renderCalendar();
});

$("#calendarGrid")?.addEventListener("click", event => {
  const day = event.target.closest("[data-date]");
  if (!day || day.disabled) return;
  $("#appointmentDate").value = day.dataset.date;
  renderCalendar();
});

$("#appointmentForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));

  if (!data.date || !data.time) {
    $("#appointmentStatus").textContent = "Elegí fecha y horario.";
    return;
  }

  const appointments = getAppointments();
  const exists = appointments.some(a => a.date === data.date && a.time === data.time);
  if (exists) {
    $("#appointmentStatus").textContent = "Ese horario ya figura reservado en este navegador.";
    return;
  }

  appointments.push({
    ...data,
    status: "reservada",
    meetingUrl: null,
    calendarEventId: null,
    createdAt: new Date().toISOString()
  });

  saveAppointments(appointments);
  $("#appointmentStatus").textContent = data.mode === "Google Meet"
    ? "Reserva guardada. En producción, Google Calendar generará el enlace de Meet."
    : "Reserva guardada en modo demo.";

  event.currentTarget.reset();
  renderCalendar();
});

renderCalendar();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

// Open the selected journey without forcing a long landing page.
function revealSection(hash) {
  if (!hash || !hash.startsWith('#')) return;
  const target = document.getElementById(hash.slice(1));
  const details = target?.querySelector('details.section-disclosure');
  if (details) details.open = true;
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link) { revealSection(link.getAttribute('href')); document.querySelector('#mainNav').classList.remove('open'); document.querySelector('#mobileMenu').setAttribute('aria-expanded','false'); }
  const service = event.target.closest('[data-service]');
  if (service) document.querySelector('#contactForm select').value = service.dataset.service;
});
window.addEventListener('hashchange', () => revealSection(location.hash));
revealSection(location.hash);
